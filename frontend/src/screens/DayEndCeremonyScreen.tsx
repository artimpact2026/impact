// 오늘 하루 끝 — 일차 미션 완료 시 등장
// 좌상단 X로 닫기 + 집 레벨업 + 다음 행동 제안 카드들
// "Day N+1 시작" 같은 강제 흐름 없이, 사용자가 자연스럽게 머무를 수 있게
//
// 마지막 날 분기 (2026-06-13):
//   · 상태 A "마당 꾸미기 전" — isFinalDay && !hasPlacedItem
//     → Hero 를 받은 자재·기념품 spread 로 교체 + "내 자리" CTA + 이주 리포트 잠금
//   · 상태 B "마당 완성 후" — isFinalDay && hasPlacedItem
//     → 기존 UI 그대로 (TODO: 이후 작업에서 별도 구성)
//   · 마지막 날이 아니면 기존 UI 그대로
//   분기 판정은 hooks/useFinalDayState 가 단일 진입점.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// 한설 한마디 섹션은 의식 화면에서 제거됨 — 미션 정보 화면의 "한설의 한마디" 는 별개로 살아있음.
// (GANGHWA_ID 도 더 이상 의식 화면에서 사용 안 함)
import { useFinalDayState } from "../hooks/useFinalDayState";
import {
  DECOR_CATEGORY_META,
  type DecorCategory,
  type DecorItem,
} from "../data/decorItems";
import type { Item } from "../data/items";

type Suggestion = {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
};

type Props = {
  region: string;
  residenceId: string;
  finishedDay: number;
  totalDays: number;
  // 좌상단 X — 마을 홈으로 닫기. 호출 측에서 일차 진행도 함께 처리.
  onClose: () => void;
  // 하단 제안 카드들 — 호출 측에서 navigation + 일차 진행
  suggestions: Suggestion[];
  /** 누적 자재 (App.tsx 전체) — useFinalDayState 가 residenceId 로 필터링 */
  acquiredDecorItems?: DecorItem[];
  /** 누적 기념품 (App.tsx 전체) */
  acquiredItems?: Item[];
  /** 해당 레지던스 슬롯별 배치 (App.tsx 에서 잘라 넘김) */
  placedDecor?: Partial<Record<DecorCategory, string>>;
  /** "내 자리 가서 마당 꾸미기" CTA — 본가/홈 화면으로 이동 */
  onGoYard?: () => void;
  /** 마지막 날 state A 의 잠금 해제용 콜백 (현재 미사용) */
  onOpenCinematic?: () => void;
};

export default function DayEndCeremonyScreen({
  region,
  residenceId,
  finishedDay,
  totalDays,
  onClose,
  suggestions,
  acquiredDecorItems = [],
  acquiredItems = [],
  placedDecor = {},
  onGoYard,
}: Props) {
  // === 마지막 날 상태 판정 ===
  const finalState = useFinalDayState({
    finishedDay,
    totalDays,
    residenceId,
    acquiredDecorItems,
    acquiredItems,
    placedDecor,
  });
  const isFinalDay = finalState.isFinalDay;

  // 비-최종일 + 최종일 state B 가 공통으로 쓰는 캐러셀 슬라이드.
  // 오늘 받은 자재 + 기념품을 합쳐 자동 슬라이드로 노출 → "오늘의 흔적" 묶음.
  const slides = [
    ...finalState.todayDecor.map((d) => ({
      key: `d-${d.id}`,
      emoji: d.emoji,
      title: DECOR_CATEGORY_META[d.category].label,
      sub: d.missionTitle,
      kind: "자재" as const,
    })),
    ...finalState.todaySouvenirs.map((s) => ({
      key: `s-${s.id}`,
      emoji: s.emoji,
      title: s.name,
      sub: s.hint,
      kind: "기념품" as const,
    })),
  ];

  // === 상태 A: 마지막 날 + 한 개도 배치 안 함 → 마당 꾸미기 유도 화면 ===
  if (isFinalDay && !finalState.hasPlacedItem) {
    return (
      <FinalDayPreYard
        region={region}
        finishedDay={finishedDay}
        totalDays={totalDays}
        todayUnplacedCount={finalState.todayUnplacedCount}
        todayDecor={finalState.todayDecor}
        todaySouvenirs={finalState.todaySouvenirs}
        onClose={onClose}
        onGoYard={onGoYard}
      />
    );
  }

  // === 상태 B / 비-마지막 날: 기존 UI ===
  // TODO(state-B): 마당 완성 후 전용 톤(축적 보여주기 + 회고)으로 별도 구성.
  //   지금은 기존 HouseStage + suggestions 흐름을 그대로 사용한다.

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-gradient-to-b from-cream via-cream to-nature-50 overflow-hidden">
      {/* 좌상단 X */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-10 left-4 z-20 w-9 h-9 rounded-full
                   bg-white shadow-soft border border-cream-200
                   flex items-center justify-center text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* ① Hero — 오늘 받은 자재·기념품 자동 슬라이드 캐러셀 */}
      <section className="relative w-full h-[320px] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#FFF8EC] via-cream to-[#F0F8F1]"
        />
        <svg
          viewBox="0 0 375 320"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="dayEndFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0F8F1" stopOpacity="0" />
              <stop offset="100%" stopColor="#F0F8F1" stopOpacity="1" />
            </linearGradient>
          </defs>
          <ellipse cx="187" cy="278" rx="160" ry="6" fill="#D9B68A" opacity="0.35" />
          <rect x="0" y="260" width="375" height="60" fill="url(#dayEndFade)" />
        </svg>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-12 left-5 z-10 text-[11px] font-extrabold tracking-[0.16em] uppercase text-primary"
        >
          {region} · DAY {finishedDay} / {totalDays}
        </motion.p>

        {/* 큰 자동 슬라이드 캐러셀 — 오늘 받은 자재·기념품 한 개씩 자동 순환 */}
        <div className="absolute inset-x-0 bottom-4 px-4 flex items-end justify-center">
          <ItemCarousel slides={slides} />
        </div>
      </section>

      {/* ② 타이틀 + 짧은 질문 */}
      <header className="px-6 mt-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-ink text-[28px] font-extrabold leading-tight"
        >
          오늘 하루 끝났어요
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-ink-soft text-[14px] leading-relaxed"
        >
          꾸며볼까요?
        </motion.p>
      </header>

      {/* ③ 단일 CTA — "내 자리 가서 마당 꾸미기" (suggestions[0] 사용). 다른 옵션·인사 다 제거. */}
      <section className="mt-8 px-5 pb-8">
        {suggestions[0] && (
          <motion.button
            type="button"
            onClick={suggestions[0].onClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
            className="w-full h-14 rounded-full bg-primary text-white
                       text-[15px] font-extrabold
                       shadow-[0_8px_20px_-4px_rgba(255,112,67,0.55)]
                       active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <span aria-hidden>{suggestions[0].icon}</span>
            {suggestions[0].title}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </section>
    </div>
  );
}

// =====================================================================
// FinalDayPreYard — 상태 A
//   "마당 꾸미기 전" — 마지막 날, 아직 슬롯에 자재를 안 놓았을 때.
//   Hero 자리에 "그 날 받은" 자재·기념품을 크게 한 개씩 자동 슬라이드.
//   "내 자리 가서 마당 꾸미기" CTA + 잠긴 "이주 리포트" 카드.
// =====================================================================
function FinalDayPreYard({
  region,
  finishedDay,
  totalDays,
  todayUnplacedCount,
  todayDecor,
  todaySouvenirs,
  onClose,
  onGoYard,
}: {
  region: string;
  finishedDay: number;
  totalDays: number;
  todayUnplacedCount: number;
  todayDecor: DecorItem[];
  todaySouvenirs: Item[];
  onClose: () => void;
  onGoYard?: () => void;
}) {
  // 캐러셀 슬라이드 — 자재 + 기념품 합쳐 자동 순환.
  const slides = [
    ...todayDecor.map((d) => ({
      key: `d-${d.id}`,
      emoji: d.emoji,
      title: DECOR_CATEGORY_META[d.category].label,
      sub: d.missionTitle,
      kind: "자재" as const,
    })),
    ...todaySouvenirs.map((s) => ({
      key: `s-${s.id}`,
      emoji: s.emoji,
      title: s.name,
      sub: s.hint,
      kind: "기념품" as const,
    })),
  ];

  // "이주 리포트" 잠금 카드 흔들림 피드백
  const [shake, setShake] = useState(false);
  const handleLockedReportTap = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-gradient-to-b from-cream via-cream to-nature-50 overflow-hidden">
      {/* 좌상단 X */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-10 left-4 z-20 w-9 h-9 rounded-full
                   bg-white shadow-soft border border-cream-200
                   flex items-center justify-center text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* ① Hero — 받은 자재·기념품 자동 슬라이드 캐러셀 */}
      <section className="relative w-full h-[320px] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#FFF8EC] via-cream to-[#F0F8F1]"
        />
        {/* 옅은 ground hint */}
        <svg
          viewBox="0 0 375 320"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="preYardFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0F8F1" stopOpacity="0" />
              <stop offset="100%" stopColor="#F0F8F1" stopOpacity="1" />
            </linearGradient>
          </defs>
          <ellipse cx="187" cy="278" rx="160" ry="6" fill="#D9B68A" opacity="0.35" />
          <rect x="0" y="260" width="375" height="60" fill="url(#preYardFade)" />
        </svg>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-12 left-5 z-10 text-[11px] font-extrabold tracking-[0.16em] uppercase text-primary"
        >
          {region} · DAY {finishedDay} / {totalDays}
        </motion.p>

        {/* 큰 자동 슬라이드 캐러셀 — 그 날 받은 자재·기념품 한 개씩 자동 순환 */}
        <div className="absolute inset-x-0 bottom-4 px-4 flex items-end justify-center">
          <ItemCarousel slides={slides} />
        </div>
      </section>

      {/* ② 타이틀 + 짧은 질문 */}
      <header className="px-6 mt-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-ink text-[28px] font-extrabold leading-tight"
        >
          {region} 마지막 날
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-ink-soft text-[14px] leading-relaxed"
        >
          꾸며볼까요?
        </motion.p>
      </header>

      {/* ③ "내 자리 가서 마당 꾸미기" + 잠긴 이주 리포트 */}
      <section className="mt-8 px-5 pb-8">
        <p className="text-[10.5px] font-bold text-ink-mute tracking-[0.18em] uppercase">
          Next
        </p>
        <p className="mt-0.5 text-ink text-[16px] font-extrabold">
          이런 건 어때요?
        </p>

        <ul className="mt-3 space-y-2.5">
          {/* 내 자리 가서 마당 꾸미기 */}
          <motion.li
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={onGoYard}
              disabled={!onGoYard}
              className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                         bg-white border border-cream-200 shadow-soft
                         text-left active:scale-[0.99] transition hover:bg-cream-50/60
                         disabled:opacity-60"
            >
              <div
                className="w-12 h-12 rounded-2xl bg-primary-50
                           flex items-center justify-center text-xl shrink-0"
                aria-hidden
              >
                🌿
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink text-[14.5px] font-extrabold leading-tight">
                  내 자리 가서 마당 꾸미기
                </p>
                <p className="mt-0.5 text-ink-soft text-[12px] leading-snug truncate">
                  받은 자재를 마당 위에 올려보세요
                </p>
              </div>
              {/* 새 아이템 N 뱃지 — N = 오늘 받았고 아직 배치 안 한 자재 수. 0 이면 숨김 */}
              {todayUnplacedCount > 0 && (
                <span
                  aria-label={`새 아이템 ${todayUnplacedCount}개`}
                  className="shrink-0 min-w-[44px] px-2 py-1 rounded-full
                             bg-primary text-white text-[10.5px] font-extrabold
                             flex items-center justify-center
                             shadow-[0_4px_10px_-2px_rgba(255,112,67,0.45)]"
                >
                  새 아이템 {todayUnplacedCount}
                </span>
              )}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-ink-mute shrink-0"
                aria-hidden
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </motion.li>

          {/* 이주 리포트 — 잠금 */}
          <motion.li
            initial={{ opacity: 0, y: 8 }}
            animate={
              shake
                ? {
                    opacity: 1,
                    y: 0,
                    x: [0, -6, 6, -4, 4, 0],
                  }
                : { opacity: 1, y: 0 }
            }
            transition={{
              delay: shake ? 0 : 0.53,
              duration: shake ? 0.45 : 0.4,
            }}
          >
            <button
              type="button"
              onClick={handleLockedReportTap}
              aria-disabled
              aria-label="이주 리포트 — 마당을 완성하면 열려요"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                         bg-white border border-cream-200 shadow-soft
                         text-left transition opacity-55 cursor-not-allowed"
            >
              <div
                className="w-12 h-12 rounded-2xl bg-cream-100
                           flex items-center justify-center text-xl shrink-0"
                aria-hidden
              >
                🔒
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink text-[14.5px] font-extrabold leading-tight">
                  이주 리포트
                </p>
                <p className="mt-0.5 text-ink-soft text-[12px] leading-snug truncate">
                  마당을 완성하면 열려요
                </p>
              </div>
            </button>
          </motion.li>
        </ul>
      </section>
    </div>
  );
}

// =====================================================================
// ItemCarousel — 가운데 카드 1장 + 양옆 peek 카드 2장 (살짝 보이게).
//   · 카드 = 흰 둥근 박스 + 큰 이모지 + 카테고리 + 제목 + 캡션
//   · 가운데(현재 idx) = 100% 불투명 / 크기 1.0
//   · 양옆(idx±1) = 35% 불투명 / 크기 0.86 → "옆에 다음 카드가 대기" 시각
//   · 2.4s 마다 다음으로 자동 슬라이드. 끝나면 처음으로 루프.
//   · slides.length === 1 이면 가운데 한 장만, 자동 진행 없음.
//   · 비어 있으면 fallback 메시지.
//   · 하단 점 인디케이터로 현재 위치 표시.
// =====================================================================
type CarouselSlide = {
  key: string;
  emoji: string;
  title: string;
  sub?: string;
  kind: "자재" | "기념품";
};

const CARD_WIDTH = 180;
const CARD_GAP = 12;
const STRIDE = CARD_WIDTH + CARD_GAP;

function ItemCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 2400);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [idx, slides.length]);

  if (slides.length === 0) {
    return (
      <p className="text-ink-soft text-[12.5px] mb-2">
        오늘은 받은 게 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      {/* 트랙 컨테이너 — overflow hidden + 좌우 페이드 마스크 */}
      <div
        className="relative w-full h-[210px] overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        {/* 첫 카드의 왼쪽 끝을 컨테이너 중앙으로 옮긴 뒤, 트랙을 -idx*STRIDE 만큼 슬라이드.
            결과: 항상 idx 번째 카드가 컨테이너 중앙에 오고, idx-1/idx+1 카드는 양옆에 peek. */}
        <div
          className="absolute top-0 left-1/2"
          style={{ transform: `translateX(-${CARD_WIDTH / 2}px)` }}
        >
          <motion.div
            className="flex items-stretch"
            style={{ gap: CARD_GAP }}
            animate={{ x: -idx * STRIDE }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
          >
            {slides.map((s, i) => {
              const isCurrent = i === idx;
              return (
                <motion.div
                  key={s.key}
                  animate={{
                    opacity: isCurrent ? 1 : 0.35,
                    scale: isCurrent ? 1 : 0.86,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="shrink-0 bg-white border border-cream-200 rounded-3xl
                             shadow-soft flex flex-col items-center justify-center text-center
                             px-4 py-5"
                  style={{
                    width: CARD_WIDTH,
                    height: 210,
                    filter: isCurrent
                      ? "drop-shadow(0 8px 14px rgba(80,60,40,0.18))"
                      : undefined,
                  }}
                >
                  <span
                    aria-hidden
                    className="text-[72px] leading-none select-none"
                  >
                    {s.emoji}
                  </span>
                  <p className="mt-2 text-[9.5px] font-extrabold tracking-[0.18em] uppercase text-primary">
                    {s.kind}
                  </p>
                  <p className="mt-0.5 text-ink text-[13.5px] font-extrabold leading-tight line-clamp-2 max-w-[150px]">
                    {s.title}
                  </p>
                  {s.sub && (
                    <p className="mt-1 text-ink-soft text-[10.5px] leading-snug line-clamp-2 max-w-[150px]">
                      {s.sub}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* 점 인디케이터 */}
      {slides.length > 1 && (
        <div
          className="flex items-center gap-1.5"
          aria-label={`${idx + 1} / ${slides.length}`}
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300
                ${
                  i === idx
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-cream-200"
                }`}
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );
}

