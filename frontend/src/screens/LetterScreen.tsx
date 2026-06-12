// 편지함 화면 — NPC 편지 / 시스템 알림 / 커뮤니티 소식 통합 인박스
//
// UX 원칙:
//   - 첫 진입자도 직관: "전체/편지/알림/소식" 필터 칩만으로 카테고리 이해
//   - 카테고리는 시각으로 구별(아이콘·테두리 색·아바타 톤)
//   - unread 빨간 점 + 카드 좌측 굵은 컬러 줄
//   - 카드 탭 → 상세 시트(본문 + 발신자 + 닫기). 시트 열리는 순간 read 처리.

import { useEffect, useMemo, useState } from "react";
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
  // ResidenceHomeScreen 에서 진입했을 때 닫고 돌아갈 경로
  onBack?: () => void;
  // 봉투 덮개에 "To. 닉네임" 표시
  nickname?: string;
};

type FilterKey = "all" | LetterCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "npc", label: "편지" },
  { key: "system", label: "알림" },
  { key: "community", label: "소식" },
];

// 종이 톤 카드 배경 — 읽지 않은 편지(밝은 크림지) vs 읽은 편지(살짝 바랜 톤)
const PAPER_BG_UNREAD = "linear-gradient(135deg, #FFFCF1 0%, #FBF4DA 100%)";
const PAPER_BG_READ = "linear-gradient(135deg, #F7F1DF 0%, #EFE7CD 100%)";

// 편지지·우표 톤 — 종이 느낌이 살게 카드 배경은 cream paper, 우표는 카테고리 색.
const CATEGORY_META: Record<
  LetterCategory,
  {
    chip: string;           // 우표 안 작은 라벨 (LET / NOTE / NEWS)
    label: string;          // 필터·시트에서 쓰는 한국어 라벨
    stampColor: string;     // 우표 톱니 + 텍스트 색
    avatarBg: string;       // 시트 발신자 아바타 원 배경
    avatarText: string;     // 시트 발신자 아바타 텍스트 색
  }
> = {
  npc: {
    chip: "LETTER",
    label: "편지",
    stampColor: "#FF7043",
    avatarBg: "bg-primary-50",
    avatarText: "text-primary",
  },
  system: {
    chip: "NOTICE",
    label: "알림",
    stampColor: "#76B454",
    avatarBg: "bg-nature-50",
    avatarText: "text-nature-600",
  },
  community: {
    chip: "NEWS",
    label: "소식",
    stampColor: "#C04F84",
    avatarBg: "bg-[#FFE9F1]",
    avatarText: "text-[#C04F84]",
  },
};

export default function LetterScreen({
  letters,
  onMarkRead,
  onMarkAllRead,
  onBack,
  nickname,
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
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[11px] font-bold text-ink-mute underline underline-offset-2"
            >
              모두 읽음
            </button>
          )}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="닫기"
              className="w-9 h-9 rounded-full bg-white border border-cream-200 shadow-soft
                         flex items-center justify-center text-ink active:scale-95 transition"
            >
              ✕
            </button>
          )}
        </div>
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
        nickname={nickname}
        onClose={() => setOpenId(null)}
      />
    </TabLayout>
  );
}

// =====================================================================
// 편지 카드 — 편지지 톤 + 우상단 우표 + 좌측 점선 마진
//   · 카드 배경: 크림지 그라데이션 (읽기 전/후로 톤 차이)
//   · 좌측: 편지지 마진처럼 세로 점선
//   · 우상단: 카테고리 색 우표(점선 보더 = 톱니) + 발신자 이모지 + 라벨
//   · "From." 프리픽스로 편지 형식 흉내
// =====================================================================

function LetterCard({
  letter,
  onOpen,
}: {
  letter: Letter;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[letter.category];
  const unread = !letter.read;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-[18px] border border-cream-200 overflow-hidden relative"
      style={{
        background: unread ? PAPER_BG_UNREAD : PAPER_BG_READ,
        boxShadow: unread
          ? "0 4px 12px -2px rgba(120,90,40,0.12)"
          : "0 1px 3px rgba(120,90,40,0.06)",
      }}
    >
      {/* 좌측 마진 점선 — 편지지 느낌 */}
      <span
        aria-hidden
        className="absolute top-4 bottom-4 left-4 w-px border-l border-dashed border-[#D9CDA3]"
      />

      {/* 우상단 우표 — 점선 보더로 톱니 흉내 */}
      <div
        aria-hidden
        className="absolute top-3 right-3 w-[46px] h-[54px] bg-white rounded-md
                   flex flex-col items-center justify-center gap-0.5"
        style={{
          border: `1.5px dashed ${meta.stampColor}88`,
          boxShadow: "0 1px 2px rgba(80,60,40,0.08)",
          opacity: unread ? 1 : 0.55,
        }}
      >
        <span className="text-[18px] leading-none">
          {letter.sender.emoji ?? "✉"}
        </span>
        <span
          className="text-[6.5px] font-extrabold tracking-[0.1em]"
          style={{ color: meta.stampColor }}
        >
          {meta.chip}
        </span>
      </div>

      {/* === 본문 영역 === */}
      <div className="pl-8 pr-[64px] py-4">
        {/* From. — 편지 형식 */}
        <p className="text-[10px] italic font-bold tracking-wide text-ink-mute">
          From.
        </p>
        <p className="mt-0.5 text-ink-soft text-[12px] font-extrabold leading-tight truncate">
          {letter.sender.name}
          {letter.sender.role && (
            <span className="text-ink-mute font-bold ml-1">
              · {letter.sender.role}
            </span>
          )}
        </p>

        {/* 제목 */}
        <p
          className={`mt-2.5 text-[15px] leading-snug truncate
            ${unread ? "text-ink font-extrabold" : "text-ink-soft font-bold"}`}
        >
          {letter.title}
        </p>

        {/* 본문 미리보기 */}
        <p className="mt-1 text-ink-mute text-[12px] leading-relaxed truncate">
          {letter.preview}
        </p>

        {/* 시간 + unread dot */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-ink-mute text-[10.5px]">
            {relativeTime(letter.createdAt)}
          </span>
          {unread && (
            <span
              aria-label="안 읽음"
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: meta.stampColor }}
            />
          )}
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
//   · 시트가 올라오면 봉투 덮개(삼각형)는 닫힌 상태
//   · 사용자가 덮개를 탭 → rotateX 1.4s 로 천천히 펼쳐짐 (편지를 직접 여는 정서)
//   · 덮개가 어느 정도 열리면 본문이 페이드인
//   · z-index: 백드롭 z-[55], 시트 z-[60] — 하단 시뮬 floating(z-50) 위로
// =====================================================================

function LetterSheet({
  letter,
  nickname,
  onClose,
}: {
  letter: Letter | null;
  nickname?: string;
  onClose: () => void;
}) {
  const [flapOpen, setFlapOpen] = useState(false);

  // 다른 편지로 바뀌면 봉투 다시 닫음
  useEffect(() => {
    setFlapOpen(false);
  }, [letter?.id]);

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
            className="fixed inset-0 z-[55] bg-black/35"
          />
          <motion.div
            initial={{ x: "-50%", y: "100%" }}
            animate={{ x: "-50%", y: "0%" }}
            exit={{ x: "-50%", y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            role="dialog"
            aria-label={letter.title}
            className="fixed bottom-0 left-1/2 w-full max-w-[420px] z-[60]
                       rounded-t-3xl shadow-[0_-12px_30px_-12px_rgba(80,70,40,0.18)]
                       px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)]
                       overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #FDF8EB 0%, #FAF1D8 100%)",
              perspective: "800px",
            }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#E0D4A8]" />

            {/* === 봉투 덮개 — 사용자가 탭해서 직접 펼침 ===
                  rotateX 0 → -178deg (top 원점). backface-hidden 으로 뒤집힌 면 안 보임.
                  0.7s — 본인이 여는 인터랙션이라 느리지 않게. */}
            <motion.button
              type="button"
              onClick={() => !flapOpen && setFlapOpen(true)}
              disabled={flapOpen}
              aria-label={flapOpen ? "편지 펼쳐짐" : "탭해서 편지 열기"}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: flapOpen ? -178 : 0 }}
              transition={{
                duration: flapOpen ? 0.7 : 0,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              style={{
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="absolute top-0 left-0 right-0 h-[160px] z-20
                         active:scale-[0.99] transition-transform"
            >
              {/* 삼각형 배경 — clip-path 로 봉투 덮개 모양 */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, #F1E4B8 0%, #E5D49B 100%)",
                  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                  boxShadow: "inset 0 -3px 6px rgba(120,90,40,0.15)",
                }}
              />

              {/* 덮개 콘텐츠 — flex column 으로 세로·가로 중앙 정렬.
                  pb-16 으로 삼각형 좁아지는 하단을 피해 콘텐츠를 상단으로 모음. */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 gap-3">
                {/* 흰 원형 스티커 — 닫힘 상태에서만 펄스 */}
                <motion.span
                  aria-hidden
                  animate={
                    flapOpen ? { scale: 1 } : { scale: [1, 1.06, 1] }
                  }
                  transition={
                    flapOpen
                      ? { duration: 0 }
                      : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  }
                  className="block w-10 h-10 rounded-full bg-white"
                  style={{
                    boxShadow:
                      "0 2px 4px rgba(80,40,20,0.18), inset 0 -1px 2px rgba(80,40,20,0.08)",
                  }}
                />

                {/* 탭 유도 문구 — 닫힘 상태에서만 노출 */}
                {!flapOpen && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    className="text-[10px] font-extrabold tracking-[0.15em] text-[#A08960]"
                  >
                    TAP TO OPEN
                  </motion.p>
                )}
              </div>
            </motion.button>

            {/* === 내용 — 덮개가 절반쯤 열렸을 때 페이드인 === */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: flapOpen ? 1 : 0,
                y: flapOpen ? 0 : 8,
              }}
              transition={{
                delay: flapOpen ? 0.35 : 0,
                duration: 0.4,
              }}
            >
              {/* 발신자 */}
              <div className="flex items-center gap-3 pb-3 border-b border-dashed border-[#D9CDA3]">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-[22px]
                              ${CATEGORY_META[letter.category].avatarBg}
                              ${CATEGORY_META[letter.category].avatarText}`}
                  aria-hidden
                >
                  {letter.sender.emoji ?? "✉"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] italic font-bold tracking-wide text-ink-mute">
                    From.
                  </p>
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
                  {CATEGORY_META[letter.category].label}
                </span>
              </div>

              {/* To. 닉네임 — 편지의 인사말 */}
              <p className="mt-3 text-[11.5px] italic font-bold tracking-wide text-ink-mute">
                To. <span className="not-italic text-ink-soft font-extrabold">{nickname ?? "여행자"}</span> 님께
              </p>

              {/* 제목 + 시간 */}
              <h3 className="mt-2 text-ink text-[18px] font-extrabold leading-snug">
                {letter.title}
              </h3>
              <p className="mt-0.5 text-ink-mute text-[11px]">
                {relativeTime(letter.createdAt)}
              </p>
              <div
                className="mt-4 max-h-[50vh] overflow-y-auto pr-1
                           text-ink text-[14px] leading-[1.85] whitespace-pre-line"
              >
                {letter.body}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full bg-primary text-white text-[14.5px] font-extrabold
                           py-3.5 rounded-2xl shadow-soft active:scale-[0.99] transition"
              >
                마음 잘 받았어요
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
