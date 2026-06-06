// 편지함 화면 — NPC 편지 / 시스템 알림 / 커뮤니티 소식 통합 인박스
//
// UX 원칙:
//   - 첫 진입자도 직관: "전체/편지/알림/소식" 필터 칩만으로 카테고리 이해
//   - 카테고리는 시각으로 구별(아이콘·테두리 색·아바타 톤)
//   - unread 빨간 점 + 카드 좌측 굵은 컬러 줄
//   - 카드 탭 → 상세 시트(본문 + 발신자 + 닫기). 시트 열리는 순간 read 처리.

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  relativeTime,
  unreadCount,
  type Letter,
  type LetterCategory,
} from "../data/letters";
import TabLayout from "../components/TabLayout";

type Props = {
  letters: Letter[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

type FilterKey = "all" | LetterCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "npc", label: "편지" },
  { key: "system", label: "알림" },
  { key: "community", label: "소식" },
];

const CATEGORY_META: Record<
  LetterCategory,
  {
    chip: string;        // 칩(작은 라벨) 텍스트
    accent: string;       // 좌측 굵은 컬러 줄
    avatarBg: string;     // 아바타 원 배경
    avatarText: string;   // 아바타 텍스트 컬러
    cardBg: string;       // 카드 배경(unread 시 강조)
  }
> = {
  npc: {
    chip: "편지",
    accent: "bg-primary",
    avatarBg: "bg-primary-50",
    avatarText: "text-primary",
    cardBg: "bg-white",
  },
  system: {
    chip: "알림",
    accent: "bg-nature-400",
    avatarBg: "bg-nature-50",
    avatarText: "text-nature-600",
    cardBg: "bg-white",
  },
  community: {
    chip: "소식",
    accent: "bg-[#F58FB6]",
    avatarBg: "bg-[#FFE9F1]",
    avatarText: "text-[#C04F84]",
    cardBg: "bg-white",
  },
};

export default function LetterScreen({
  letters,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // 최신순
  const sorted = useMemo(
    () =>
      [...letters].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [letters]
  );
  const filtered = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((l) => l.category === filter)),
    [sorted, filter]
  );
  const unread = unreadCount(letters);
  const openLetter = letters.find((l) => l.id === openId) ?? null;

  return (
    <TabLayout
      preLabel="Inbox"
      title="받은 편지"
      subtitle={
        unread > 0
          ? `새 편지 ${unread}통`
          : "모두 확인했어요"
      }
      rightActions={
        unread > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[11px] font-bold text-ink-mute underline underline-offset-2"
          >
            모두 읽음
          </button>
        ) : null
      }
    >
      {/* === 필터 칩 — 활성 상태 강조 (ring + scale + shadow) === */}
      <div className="px-5 pt-2 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count =
            f.key === "all"
              ? letters.length
              : letters.filter((l) => l.category === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className={`shrink-0 px-4 py-2 rounded-full text-[12.5px] transition-all duration-200
                inline-flex items-center gap-1.5
                ${
                  active
                    ? "bg-primary text-white font-extrabold shadow-[0_4px_12px_-2px_rgba(255,112,67,0.45)] scale-[1.03]"
                    : "bg-white border border-cream-200 text-ink-soft font-bold hover:bg-cream-50"
                }`}
            >
              <span>{f.label}</span>
              {count > 0 && (
                <span
                  className={`text-[11px] font-extrabold ${
                    active
                      ? "text-white/80"
                      : "text-ink-mute"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* === 카드 리스트 — pb-28: floating 시뮬 원 + 안전 영역 확보 === */}
      <div className="px-4 pb-28 space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filtered.map((l) => (
            <LetterCard
              key={l.id}
              letter={l}
              onOpen={() => {
                if (!l.read) onMarkRead(l.id);
                setOpenId(l.id);
              }}
            />
          ))
        )}
      </div>

      {/* === 상세 시트 === */}
      <LetterSheet
        letter={openLetter}
        onClose={() => setOpenId(null)}
      />
    </TabLayout>
  );
}

// =====================================================================
// 편지 카드 — 좌측 컬러 줄 + 아바타 + 본문
// =====================================================================

function LetterCard({
  letter,
  onOpen,
}: {
  letter: Letter;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[letter.category];
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left rounded-2xl shadow-soft border border-cream-200
                  ${meta.cardBg} flex overflow-hidden`}
    >
      {/* 좌측 컬러 줄 — 1.5px 로 약간 두껍게 */}
      <span aria-hidden className={`w-[5px] shrink-0 ${meta.accent}`} />

      {/* === 아이콘 영역 === */}
      <div className="shrink-0 pt-4 pb-4 pl-4 pr-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center
                      text-[22px] ${meta.avatarBg} ${meta.avatarText}`}
          aria-hidden
        >
          {letter.sender.emoji ?? "✉"}
        </div>
      </div>

      {/* === 텍스트 영역 === */}
      <div className="flex-1 min-w-0 py-4 pr-4">
        {/* 상단 — sender + unread dot */}
        <div className="flex items-center gap-1.5">
          <p className="text-ink-soft text-[11.5px] font-bold leading-none truncate">
            {letter.sender.name}
            {letter.sender.role && (
              <span className="text-ink-mute font-bold">
                {" · "}
                {letter.sender.role}
              </span>
            )}
          </p>
          {!letter.read && (
            <span
              aria-label="안 읽음"
              className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0"
            />
          )}
        </div>

        {/* 제목 — sender 와 줄 간격 mt-2 (8px) 확보 */}
        <p
          className={`mt-2 text-[14.5px] leading-snug truncate
            ${letter.read ? "text-ink-soft font-bold" : "text-ink font-extrabold"}`}
        >
          {letter.title}
        </p>

        {/* 본문 미리보기 — 한 줄 truncate */}
        <p className="mt-1 text-ink-mute text-[12px] leading-relaxed truncate">
          {letter.preview}
        </p>

        {/* 시간 — 카테고리 칩 옆 작게 */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-extrabold tracking-wide
              ${meta.avatarBg} ${meta.avatarText}`}
          >
            {meta.chip}
          </span>
          <span className="text-ink-mute text-[10.5px]">
            {relativeTime(letter.createdAt)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// =====================================================================
// EmptyState — 필터별로 멘트 미세 조정
// =====================================================================

function EmptyState({ filter }: { filter: FilterKey }) {
  const text =
    filter === "all"
      ? "받은 편지가 없어요. 다른 지역을 둘러보면 마을 주민들이 편지를 보내올 거예요."
      : filter === "npc"
      ? "마을 주민들의 편지가 아직 없어요. 한 곳에 머물러보세요."
      : filter === "system"
      ? "시스템 알림이 없어요."
      : "다른 사용자들의 소식이 아직 없어요.";
  return (
    <div className="bg-white border border-cream-200 rounded-2xl p-6 text-center mt-2">
      <p className="text-3xl" aria-hidden>
        ✉
      </p>
      <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">{text}</p>
    </div>
  );
}

// =====================================================================
// 상세 시트 — 바텀시트로 편지 본문 표시
// =====================================================================

function LetterSheet({
  letter,
  onClose,
}: {
  letter: Letter | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {letter && (
        <>
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/35"
          />
          <motion.div
            // Tailwind `-translate-x-1/2` 대신 framer-motion x 로 직접 컨트롤
            // (y 애니메이션과 transform 충돌 방지 — 중앙 정렬 깨짐 버그 해결)
            initial={{ x: "-50%", y: "100%" }}
            animate={{ x: "-50%", y: "0%" }}
            exit={{ x: "-50%", y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            role="dialog"
            aria-label={letter.title}
            className="fixed bottom-0 left-1/2 w-full max-w-[420px] z-50
                       bg-white rounded-t-3xl shadow-[0_-12px_30px_-12px_rgba(80,70,40,0.18)]
                       px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)]"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cream-200" />

            {/* 발신자 */}
            <div className="flex items-center gap-3 pb-3 border-b border-cream-100">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-[22px]
                            ${CATEGORY_META[letter.category].avatarBg}
                            ${CATEGORY_META[letter.category].avatarText}`}
                aria-hidden
              >
                {letter.sender.emoji ?? "✉"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink text-[14px] font-extrabold truncate">
                  {letter.sender.name}
                </p>
                {letter.sender.role && (
                  <p className="text-ink-mute text-[11px] font-bold mt-0.5 truncate">
                    {letter.sender.role}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold
                            ${CATEGORY_META[letter.category].avatarBg}
                            ${CATEGORY_META[letter.category].avatarText}`}
              >
                {CATEGORY_META[letter.category].chip}
              </span>
            </div>

            {/* 제목 + 본문 */}
            <h3 className="mt-3 text-ink text-[18px] font-extrabold leading-snug">
              {letter.title}
            </h3>
            <p className="mt-0.5 text-ink-mute text-[11px]">
              {relativeTime(letter.createdAt)}
            </p>
            <div
              className="mt-4 max-h-[55vh] overflow-y-auto pr-1
                         text-ink text-[14px] leading-[1.75] whitespace-pre-line"
            >
              {letter.body}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full bg-primary text-white text-[14.5px] font-extrabold
                         py-3.5 rounded-2xl shadow-soft active:scale-[0.99] transition"
            >
              잘 읽었어요
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
