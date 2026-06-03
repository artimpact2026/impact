// 미션 리스트 — 가로 스와이프 카드뉴스 형식
// 각 카드: 카테고리 / 큰 아이콘 / 흥미 질문 / 티저 / 배울 점 / 시작 CTA

import { motion } from "framer-motion";
import MissionStoryCard from "../components/MissionStoryCard";
import { finalMission, type Mission } from "../data/missions";
import { missionsForResidence } from "../data/regionMissions";
import { missionHooks } from "../data/missionHooks";

type Props = {
  region: string;
  residenceId: string;
  completedIds: Set<string>;
  totalScore: number;
  fitScore?: number;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
  onSelectFinal?: () => void;
};

export default function MissionListScreen({
  region,
  residenceId,
  completedIds,
  totalScore,
  fitScore = 0,
  onBack,
  onSelectMission,
  onSelectFinal,
}: Props) {
  const allMissions = missionsForResidence(residenceId);
  const total = allMissions.length;
  const doneCount = allMissions.filter((m) => completedIds.has(m.id)).length;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  return (
    <div className="relative h-[calc(100dvh-6rem)] flex flex-col bg-cream overflow-hidden">
      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="도착 화면으로"
          className="w-9 h-9 rounded-full bg-white shadow-soft
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
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
            {region} 잠시섬 미션
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            오늘 하루, 어떤 걸 해볼까요?
          </h1>
        </div>
      </header>

      {/* 진행률 + 축적 점수 + 적합도 변화 */}
      <section className="px-5 mt-4 shrink-0">
        <div className="bg-white rounded-2xl p-3.5 shadow-soft border border-cream-200">
          <div className="flex items-baseline justify-between">
            <p className="text-ink text-[12px] font-bold">미션 진행률</p>
            <p className="text-[12px] text-ink-mute">
              <span className="text-primary font-extrabold">{doneCount}</span>{" "}
              / {total} 완료
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-cream-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nature-300 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-ink-mute">축적 점수</span>
            <span className="text-primary font-extrabold tabular-nums">
              {totalScore} 점
            </span>
          </div>
          {fitScore !== 0 && (
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-ink-mute">적합도 누적</span>
              <span
                className={`font-extrabold tabular-nums ${
                  fitScore > 0 ? "text-nature-600" : "text-[#E55A30]"
                }`}
              >
                {fitScore > 0 ? "+" : ""}
                {fitScore}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 안내 — 스와이프 힌트 */}
      <div className="px-5 mt-4 shrink-0 flex items-center justify-between">
        <h2 className="text-ink text-[13px] font-extrabold">
          오늘의 체험 카드
        </h2>
        <p className="text-ink-mute text-[11px]">← 옆으로 넘겨보기 →</p>
      </div>

      {/* 가로 스와이프 카드 덱 */}
      <section
        className="flex-1 min-h-0 mt-3
                   overflow-x-auto overflow-y-hidden
                   snap-x snap-mandatory
                   flex items-stretch gap-3 px-5 pb-6
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {allMissions.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="snap-center shrink-0 w-[85%] max-w-[320px] flex"
          >
            <MissionStoryCard
              mission={m}
              hook={missionHooks[m.id]}
              done={completedIds.has(m.id)}
              onClick={() => onSelectMission(m)}
            />
          </motion.div>
        ))}

        {/* 최종 미션 — 마지막 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: allMissions.length * 0.04, duration: 0.3 }}
          className="snap-center shrink-0 w-[85%] max-w-[320px] flex"
        >
          <button
            type="button"
            disabled={!allDone}
            onClick={onSelectFinal}
            className={`relative w-full h-full flex flex-col p-5 rounded-3xl
                        border text-left shadow-soft transition
                        ${
                          allDone
                            ? "bg-gradient-to-br from-primary-50 to-nature-50 border-primary active:scale-[0.99]"
                            : "bg-cream-100 border-cream-200 opacity-70 cursor-not-allowed"
                        }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary">
                FINAL
              </span>
              <span className="text-[12px] font-extrabold text-primary tabular-nums">
                +{finalMission.reward}점
              </span>
            </div>

            <div className="mt-4 text-[56px] leading-none" aria-hidden>
              {finalMission.icon}
            </div>

            <p className="mt-3 text-ink-mute text-[11px] font-bold tracking-wide">
              {finalMission.title}
            </p>
            <h3 className="mt-1 text-ink text-[19px] font-extrabold leading-snug">
              {allDone
                ? "오늘의 체험을 한 장의 리포트로"
                : "모든 체험 완료 후 열려요"}
            </h3>

            <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
              {finalMission.description}
            </p>

            <div
              className={`mt-auto pt-5 text-[12px] font-extrabold
                ${allDone ? "text-primary" : "text-ink-mute"}`}
            >
              {allDone ? "리포트 만들기 →" : "🔒 잠금"}
            </div>
          </button>
        </motion.div>
      </section>
    </div>
  );
}
