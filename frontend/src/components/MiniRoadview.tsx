// 미니 로드뷰 — 캡처 사진 5~6장을 화살표 네비로 한 칸씩 전진/후진
// 4슬라이드 카드 모드의 대안. 진짜 로드뷰처럼 "걷는" 느낌을 주기 위한 구현.
//
// 사용:
//   <MiniRoadview steps={mission.roadviewSteps!} ... />

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission, RoadviewStep } from "../data/missions";

type Props = {
  steps: RoadviewStep[];
  mission: Mission;
  destination: string;
  ctaLabel: string;
  onBack: () => void;
  onComplete: () => void;
};

export default function MiniRoadview({
  steps,
  mission,
  destination,
  ctaLabel,
  onBack,
  onComplete,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const isFirst = idx === 0;

  const forward = () => {
    setDirection("forward");
    setIdx((i) => Math.min(steps.length - 1, i + 1));
  };
  const backward = () => {
    setDirection("backward");
    setIdx((i) => Math.max(0, i - 1));
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-black select-none"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* 사진 — 페이드 + 줌인으로 걷는 느낌 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={
            direction === "forward"
              ? { opacity: 0, scale: 1.08 }
              : { opacity: 0, scale: 0.96 }
          }
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={step.photo}
            alt={step.caption}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* 상하 그라데이션 — 텍스트 가독성 */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* 상단 — 뒤로가기 + 진행 + 캡션 */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="미션 리스트로 돌아가기"
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-soft
                     text-[#3E2C20] text-[14px] font-bold
                     flex items-center justify-center active:scale-[0.96]"
        >
          ←
        </button>
        <div className="flex-1 min-w-0 text-white">
          <p className="text-[10px] font-bold opacity-85 tracking-widest uppercase">
            이동 중 · {idx + 1} / {steps.length}
          </p>
          <p className="text-[13px] font-extrabold truncate drop-shadow">
            {mission.icon} {step.caption}
          </p>
        </div>
      </header>

      {/* 도착 라벨 — 마지막 지점에만 */}
      {isLast && (
        <div className="absolute inset-x-0 top-[28%] z-10 flex flex-col items-center pointer-events-none">
          <motion.span
            initial={{ scale: 0, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 200 }}
            className="text-white text-[44px] font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            도착!
          </motion.span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-2 px-3 py-1 rounded-full bg-black/55 backdrop-blur
                       text-white text-[13px] font-bold"
          >
            {destination}
          </motion.p>
        </div>
      )}

      {/* NPC 멘트 카드 — story 있는 지점에 자동 표시 */}
      <AnimatePresence>
        {step.story && !isLast && (
          <motion.div
            key={`story-${idx}`}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="absolute left-4 right-4 bottom-[180px] z-10
                       bg-white/95 backdrop-blur rounded-2xl px-4 py-3 shadow-soft border border-white/60"
          >
            <p className="text-[10px] font-bold text-[#B8973F]">
              💬 {mission.npc.name}
            </p>
            <p className="mt-1 text-[#3E2C20] text-[13px] leading-relaxed">
              "{step.story}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 전진 화살표 — 마지막 지점 제외 / 방향에 따라 ▲ ▶ ◀ 로 회전 */}
      {!isLast && (
        <DirectionalArrow
          direction={step.forwardDirection ?? "straight"}
          onClick={forward}
        />
      )}

      {/* 하단 — 뒤로 / 진행도 / 도착 CTA */}
      <footer className="absolute bottom-6 left-0 right-0 z-30 px-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {/* 후진 버튼 */}
          <button
            type="button"
            onClick={backward}
            disabled={isFirst}
            aria-label="이전 지점"
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur
                       border border-white/40 text-white text-[14px]
                       flex items-center justify-center
                       active:scale-[0.96]
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ◀
          </button>

          {/* 진행 도트 */}
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all
                  ${i === idx ? "bg-white w-5" : "bg-white/40 w-1.5"}`}
              />
            ))}
          </div>

          {/* 다음 버튼 (보조) — 전진 화살표가 메인이라 여긴 작게 */}
          <button
            type="button"
            onClick={forward}
            disabled={isLast}
            aria-label="다음 지점"
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur
                       border border-white/40 text-white text-[14px]
                       flex items-center justify-center
                       active:scale-[0.96]
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶
          </button>
        </div>

        {/* 도착 CTA — 마지막 지점만 */}
        {isLast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            {mission.arrivalRoadviewUrl && (
              <a
                href={mission.arrivalRoadviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur
                           border border-white/40 text-white text-[11px] font-bold
                           active:scale-[0.99]"
              >
                🗺️ 실제 로드뷰로 확인해보기
              </a>
            )}
            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-3 rounded-full bg-primary text-white
                         text-[14px] font-extrabold shadow-soft active:scale-[0.99]"
            >
              {ctaLabel}
            </button>
          </motion.div>
        )}

        {!isLast && (
          <p className="text-white/60 text-[10px]">
            화살표를 눌러 다음 지점으로 걸어가요
          </p>
        )}
      </footer>
    </div>
  );
}

// =====================================================================
// 방향 화살표 — straight / left / right 에 따라 아이콘·위치·라벨 분기
// =====================================================================

function DirectionalArrow({
  direction,
  onClick,
}: {
  direction: "straight" | "left" | "right";
  onClick: () => void;
}) {
  // 방향별 시각화 — 회전이 일어나는 지점은 화살표 자체가 옆을 가리킴
  const config = {
    straight: { icon: "▲", label: "직진", offsetX: 0 },
    right: { icon: "▶", label: "우회전", offsetX: 60 },
    left: { icon: "◀", label: "좌회전", offsetX: -60 },
  }[direction];

  // 둥둥 떠 있는 모션도 방향별로 조정 — 직진은 위아래, 회전은 좌우
  const floatAnimation =
    direction === "straight"
      ? { y: [4, -4, 4] }
      : direction === "right"
      ? { x: [config.offsetX - 4, config.offsetX + 4, config.offsetX - 4] }
      : { x: [config.offsetX + 4, config.offsetX - 4, config.offsetX + 4] };

  return (
    <motion.button
      key={direction}
      type="button"
      onClick={onClick}
      aria-label={`${config.label}으로 이동`}
      initial={{ opacity: 0, x: config.offsetX }}
      animate={{ opacity: 1, ...floatAnimation }}
      transition={{
        x: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.4 },
      }}
      style={{ left: "50%" }}
      className="absolute -translate-x-1/2 bottom-[110px] z-20
                 w-16 h-16 rounded-full bg-white/25 backdrop-blur-md
                 border-2 border-white/70 text-white text-[24px]
                 flex flex-col items-center justify-center
                 shadow-[0_4px_16px_rgba(0,0,0,0.35)]
                 active:scale-[0.94]"
    >
      <span className="leading-none">{config.icon}</span>
      <span className="text-[8px] font-bold mt-0.5 tracking-wider">
        {config.label}
      </span>
    </motion.button>
  );
}
