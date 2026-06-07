// 환경 선택 — "어디에 살고 싶어요?" (Phase 2)
//
// 4개 집 형태 카드 → EnvType (mountain / field / sea / village) 매핑.
// YardOnboardingScreen 과 같은 카카오식 시각 톤 (그라데이션 배경 + 빅 모션).
// 탭하면 그 집이 화면 중앙으로 spring 등장 → 1.4s 후 onNext.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EnvType } from "../../data/lifestyle";

type HouseOption = {
  id: EnvType;
  emoji: string;
  label: string;
  hint: string;
  // 배경 그라데이션 — 각 환경의 분위기
  bgFrom: string;
  bgTo: string;
};

const HOUSES: HouseOption[] = [
  {
    id: "mountain",
    emoji: "🏔",
    label: "산자락 돌담집",
    hint: "조용한 산 사이, 나무 냄새가 좋아요",
    bgFrom: "#D8EEDA",
    bgTo: "#A8C695",
  },
  {
    id: "field",
    emoji: "🌾",
    label: "들녘 마당집",
    hint: "마당 깊은 흙집, 노을이 길게 들어요",
    bgFrom: "#FBE7C4",
    bgTo: "#E8C49A",
  },
  {
    id: "sea",
    emoji: "🌊",
    label: "바닷가 옥상집",
    hint: "흰 외벽, 옥상에서 보는 바다 한 줄",
    bgFrom: "#D8EFFF",
    bgTo: "#A4C8DE",
  },
  {
    id: "village",
    emoji: "🏘",
    label: "골목 옛집",
    hint: "좁은 골목, 빨래줄, 화분이 좋아요",
    bgFrom: "#FFE9D6",
    bgTo: "#D9A98C",
  },
];

type Props = {
  step?: number;
  total?: number;
  initial?: EnvType;
  onBack?: () => void;
  onNext?: (env: EnvType) => void;
};

export default function EnvOnboardingScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [picked, setPicked] = useState<HouseOption | null>(
    initial ? HOUSES.find((h) => h.id === initial) ?? null : null
  );
  const [confirmed, setConfirmed] = useState(false);

  const handlePick = (house: HouseOption) => {
    if (picked) return;
    setPicked(house);
    window.setTimeout(() => {
      setConfirmed(true);
      onNext?.(house.id);
      // eslint-disable-next-line no-console
      console.log("[EnvOnboarding] picked:", house);
    }, 1400);
  };

  const percent = step && total ? Math.round((step / total) * 100) : 0;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden flex flex-col">
      {/* === 배경 — 선택된 집의 분위기 따라 변화 === */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{
          background: picked
            ? `linear-gradient(to bottom, ${picked.bgFrom} 0%, ${picked.bgTo} 100%)`
            : "linear-gradient(to bottom, #F0EBE3 0%, #DDD5C7 100%)",
        }}
        transition={{ duration: 0.6 }}
      />

      {/* === 온보딩 셸 헤더 === */}
      {onBack && step && total && (
        <header className="absolute top-0 left-0 right-0 z-30 pt-12 px-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="이전"
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-soft
                       flex items-center justify-center text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex-1 h-1.5 bg-white/40 rounded-full overflow-hidden backdrop-blur">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="text-ink text-[12px] font-bold tabular-nums">
            {step} / {total}
          </span>
        </header>
      )}

      {/* === 헤더 카피 === */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 px-7 text-center ${
          onBack ? "pt-24" : "pt-14"
        }`}
      >
        {!onBack && (
          <p className="text-ink-soft text-[11px] font-extrabold tracking-[0.22em] uppercase">
            Day 1 · 진단
          </p>
        )}
        <h1
          className={`text-ink text-[24px] font-extrabold leading-[1.25] ${
            !onBack ? "mt-2" : ""
          }`}
        >
          어디에 살고 싶어요?
        </h1>
        <p className="mt-2 text-ink-soft text-[12.5px]">
          끌리는 집 한 채를 골라봐요.
        </p>
      </motion.header>

      {/* === 큰 일러스트 영역 === */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 pt-2 pb-4">
        <AnimatePresence mode="wait">
          {picked ? (
            <motion.div
              key={picked.id}
              initial={{ scale: 0.5, y: -40, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                damping: 14,
                stiffness: 200,
                delay: 0.1,
              }}
              className="text-[140px] leading-none select-none"
              style={{ filter: "drop-shadow(0 12px 18px rgba(62,44,32,0.3))" }}
            >
              {picked.emoji}
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-ink-soft text-[13px] font-bold opacity-70"
            >
              아직 정해지지 않았어요
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* 선택된 라벨 + 확정 표시 */}
      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center mb-3"
          >
            <p className="text-ink text-[17px] font-extrabold">
              {picked.label}
            </p>
            {confirmed && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full
                           bg-white/95 backdrop-blur text-[11px] font-extrabold text-nature-600
                           shadow-soft"
              >
                ✓ 여기서 살아볼게요
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === 4개 카드 — 하단 === */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 px-4 pb-8 grid grid-cols-2 gap-2.5"
      >
        {HOUSES.map((house, i) => {
          const isPicked = picked?.id === house.id;
          const isDimmed = picked && !isPicked;
          return (
            <motion.button
              key={house.id}
              type="button"
              onClick={() => handlePick(house)}
              disabled={!!picked}
              initial={{ y: 14, opacity: 0 }}
              animate={{
                y: 0,
                opacity: isDimmed ? 0.35 : 1,
              }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-start gap-1 text-left
                          bg-white rounded-2xl border shadow-soft
                          px-3 py-2.5 transition
                          ${
                            isPicked
                              ? "border-primary ring-2 ring-primary scale-[1.02]"
                              : "border-cream-200"
                          }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[28px] leading-none" aria-hidden>
                  {house.emoji}
                </span>
                <span className="text-ink text-[13.5px] font-extrabold leading-tight">
                  {house.label}
                </span>
              </div>
              <p className="text-ink-soft text-[11px] leading-snug mt-0.5">
                {house.hint}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
