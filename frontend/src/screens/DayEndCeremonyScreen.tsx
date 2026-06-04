// 오늘 하루 끝 — 일차 미션 완료 시 등장
// 좌상단 X로 닫기 + 집 레벨업 + 다음 행동 제안 카드들
// "Day N+1 시작" 같은 강제 흐름 없이, 사용자가 자연스럽게 머무를 수 있게

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HouseStage from "../components/HouseStage";
import { SPACE_STAGE_NAMES } from "../data/dayPlan";

type StageNumber = 0 | 1 | 2 | 3;

type Suggestion = {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
};

type Props = {
  region: string;
  finishedDay: number;
  totalDays: number;
  prevStage: StageNumber;
  newStage: StageNumber;
  // 좌상단 X — 마을 홈으로 닫기. 호출 측에서 일차 진행도 함께 처리.
  onClose: () => void;
  // 하단 제안 카드들 — 호출 측에서 navigation + 일차 진행
  suggestions: Suggestion[];
};

export default function DayEndCeremonyScreen({
  region,
  finishedDay,
  totalDays,
  prevStage,
  newStage,
  onClose,
  suggestions,
}: Props) {
  const [stage, setStage] = useState<StageNumber>(prevStage);

  useEffect(() => {
    if (prevStage === newStage) return;
    const t = setTimeout(() => setStage(newStage), 900);
    return () => clearTimeout(t);
  }, [prevStage, newStage]);

  const isFinalDay = finishedDay >= totalDays;
  const leveledUp = prevStage !== newStage;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-gradient-to-b from-cream via-cream to-nature-50 overflow-hidden">
      {/* 좌상단 X */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-10 left-4 z-10 w-9 h-9 rounded-full
                   bg-white/85 backdrop-blur shadow-soft border border-white/70
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

      {/* 상단 안내 */}
      <header className="pt-12 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-extrabold tracking-widest uppercase text-primary"
        >
          {region} · DAY {finishedDay} / {totalDays}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-2 text-ink text-[24px] font-extrabold leading-tight"
        >
          {isFinalDay ? "잠시섬 마지막 날" : "오늘 하루, 끝났어요"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-ink-soft text-[13px] leading-relaxed"
        >
          {isFinalDay
            ? "이 동네에서의 시간을 천천히 마무리해요"
            : leveledUp
            ? "나의 공간이 한 자리 더 자랐어요"
            : "오늘은 머무는 하루였어요"}
        </motion.p>
      </header>

      {/* 집 레벨업 */}
      <section className="flex flex-col items-center px-5 mt-5">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-[300px] bg-white rounded-3xl shadow-soft border border-cream-200 p-3"
        >
          <HouseStage stage={stage} className="w-full h-auto" />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-ink-mute">나의 공간</span>
            <motion.span
              key={stage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-primary font-extrabold"
            >
              {SPACE_STAGE_NAMES[stage]}
            </motion.span>
          </div>
        </motion.div>

        {/* 단계 진행 도트 */}
        <div className="mt-4 flex items-center gap-2">
          {[0, 1, 2, 3].map((s) => (
            <span
              key={s}
              className={`w-2 h-2 rounded-full transition
                ${s <= stage ? "bg-primary" : "bg-cream-200"}`}
              aria-hidden
            />
          ))}
        </div>
      </section>

      {/* 다음 행동 제안 */}
      <section className="mt-7 px-5 pb-8">
        <p className="text-ink text-[13px] font-extrabold mb-2.5">
          이런 건 어때요?
        </p>
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            >
              <button
                type="button"
                onClick={s.onClick}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl
                           bg-white border border-cream-200 shadow-soft
                           text-left active:scale-[0.99] transition"
              >
                <div
                  className="w-11 h-11 rounded-2xl bg-nature-50
                             flex items-center justify-center text-xl shrink-0"
                  aria-hidden
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-[14px] font-bold leading-tight">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-ink-soft text-[12px] truncate">
                    {s.subtitle}
                  </p>
                </div>
                <span className="text-ink-mute text-[14px]" aria-hidden>
                  →
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
