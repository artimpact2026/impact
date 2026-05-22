// 미션 리스트 — 공통 9개 + 지역 4개 + 최종 미션
// 카테고리(생활현실/관계형성/감정·분위기)별로 그룹화

import { motion } from "framer-motion";
import MissionCard from "../components/MissionCard";
import { finalMission, type Mission, type MissionCategory } from "../data/missions";
import { missionsForResidence } from "../data/regionMissions";

type Props = {
  region: string;            // 표시용 지역 이름 (예: "거제도")
  residenceId: string;       // 미션 매핑용 (ganghwa/gwangyang/geoje)
  completedIds: Set<string>;
  totalScore: number;
  fitScore?: number;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
  onSelectFinal?: () => void;
};

const CATEGORY_ORDER: MissionCategory[] = [
  "생활현실형",
  "관계형성형",
  "감정/분위기형",
];

const CATEGORY_LABEL: Record<MissionCategory, string> = {
  생활현실형: "생활 현실",
  관계형성형: "관계 형성",
  "감정/분위기형": "감정·분위기",
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

  // 카테고리별 그룹화
  const grouped: Record<MissionCategory, Mission[]> = {
    생활현실형: [],
    관계형성형: [],
    "감정/분위기형": [],
  };
  for (const m of allMissions) grouped[m.category].push(m);

  return (
    // h-[...] 고정 + 미션 그룹 영역만 자체 스크롤
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

      {/* 카테고리별 그룹 — 자체 스크롤 */}
      <section className="flex-1 min-h-0 overflow-y-auto px-5 mt-4 pb-8 space-y-4">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat];
          if (list.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-ink text-[13px] font-extrabold mb-2 flex items-center gap-2">
                {CATEGORY_LABEL[cat]}
                <span className="text-ink-mute text-[11px] font-bold">
                  {list.length}개
                </span>
              </h2>
              <ul className="space-y-2">
                {list.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  >
                    <MissionCard
                      mission={m}
                      done={completedIds.has(m.id)}
                      onClick={() => onSelectMission(m)}
                    />
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* 최종 미션 */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <button
            type="button"
            disabled={!allDone}
            onClick={onSelectFinal}
            className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl
                        border text-left shadow-soft transition
                        ${
                          allDone
                            ? "bg-gradient-to-br from-primary-50 to-nature-50 border-primary active:scale-[0.99]"
                            : "bg-cream-100 border-cream-200 opacity-60 cursor-not-allowed"
                        }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0
                ${allDone ? "bg-white" : "bg-cream-200"}`}
              aria-hidden
            >
              {finalMission.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink text-[14px] font-extrabold leading-tight">
                {finalMission.title}
              </p>
              <p className="mt-0.5 text-ink-mute text-[11px]">
                {allDone
                  ? "모든 체험이 끝났어요. 리포트를 만들어보세요"
                  : "모든 미션 완료 후 활성화"}
              </p>
            </div>
            <span
              className={`shrink-0 text-[12px] font-extrabold
                ${allDone ? "text-primary" : "text-ink-mute"}`}
            >
              +{finalMission.reward}점
            </span>
          </button>
        </motion.div>
      </section>
    </div>
  );
}
