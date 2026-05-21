// 오늘의 미션 카드 — 게임 퀘스트 스타일
// 카드 전체가 클릭 가능 (별도 큰 버튼 없음)

import { motion } from "framer-motion";

type Props = {
  title: string;
  description: string;
  progressCurrent: number;
  progressTotal: number;
  rewardShells: number;
  rewardTickets: number;
  onClick: () => void;
};

export default function TodayMissionCard({
  title,
  description,
  progressCurrent,
  progressTotal,
  rewardShells,
  rewardTickets,
  onClick,
}: Props) {
  const pct = Math.min(
    100,
    (progressCurrent / Math.max(1, progressTotal)) * 100
  );

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left bg-[#FFFDF8] border border-[#F1E6CC] rounded-[24px]
                 p-4 shadow-[0_8px_24px_rgba(80,55,30,0.12)]
                 active:shadow-[0_4px_12px_rgba(80,55,30,0.16)] transition"
    >
      {/* 헤더 — 작은 뱃지 + 제목 */}
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5
                         rounded-full bg-[#FFE0CC] text-[#FF7043]
                         text-[10px] font-extrabold tracking-wide">
          📌 오늘
        </span>
        <span className="text-[11px] font-bold text-[#7A6254]">{title}</span>
        <span className="ml-auto text-[#7A6254] text-[14px]" aria-hidden>
          ›
        </span>
      </div>

      {/* 설명 */}
      <p className="mt-2 text-[#4A3326] text-[15px] font-extrabold leading-snug">
        {description}
      </p>

      {/* 진행률 */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-[#7A6254] font-bold">진행도</span>
          <span className="text-[#FF7043] font-extrabold tabular-nums">
            {progressCurrent}/{progressTotal}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#F1E6CC] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FFB089] to-[#FF7043]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 보상 */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RewardChip emoji="🐚" value={rewardShells} />
          <RewardChip emoji="🎟️" value={rewardTickets} />
        </div>
        <span className="text-[#FF7043] text-[11px] font-extrabold">
          자세히 보기 ›
        </span>
      </div>
    </motion.button>
  );
}

function RewardChip({ emoji, value }: { emoji: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5
                 bg-[#FFF6EA] border border-[#F1E6CC]
                 rounded-full text-[#4A3326] text-[11px] font-extrabold tabular-nums"
    >
      <span aria-hidden>{emoji}</span>
      {value}
    </span>
  );
}
