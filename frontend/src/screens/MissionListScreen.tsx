// 미션 리스트 — 잠시섬 일차별 분기
// 헤더(Day N/Total) + 진행률(오늘) + 카테고리 4섹션(오늘 미션만)

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import CategoryTabs from "../components/CategoryTabs";
import MissionCarousel from "../components/MissionCarousel";
import MissionImageCard from "../components/MissionImageCard";
import { type Mission } from "../data/missions";
import { missionsForResidence } from "../data/regionMissions";
import {
  MISSION_GROUP_ORDER,
  groupMissions,
  missionGroupMeta,
  type MissionGroup,
} from "../data/missionCategories";
import { buildDayPlan, missionIdsForDay } from "../data/dayPlan";
import type { Residence } from "../data/residences";

type Props = {
  region: string;
  residence: Residence;
  completedIds: Set<string>;
  totalScore: number;
  fitScore?: number;
  currentDay: number;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
};

export default function MissionListScreen({
  region,
  residence,
  completedIds,
  totalScore,
  fitScore = 0,
  currentDay,
  onBack,
  onSelectMission,
}: Props) {
  const allMissions = useMemo(
    () => missionsForResidence(residence.id),
    [residence.id]
  );

  // 일차 분배 — 같은 결정 로직을 부모와 공유 가능하게 export 된 buildDayPlan 사용
  const { dayCount, missionsByDay } = useMemo(
    () => buildDayPlan(residence, allMissions),
    [residence, allMissions]
  );

  // 오늘의 미션 집합
  const todayIds = useMemo(
    () => missionIdsForDay(missionsByDay, currentDay),
    [missionsByDay, currentDay]
  );

  // 오늘 미션만 추려서 카테고리 그룹핑
  const todayMissions = useMemo(
    () => allMissions.filter((m) => todayIds.has(m.id)),
    [allMissions, todayIds]
  );
  const grouped = useMemo(
    () => groupMissions(todayMissions),
    [todayMissions]
  );

  const counts: Record<MissionGroup, number> = {
    roadview: grouped.roadview.length,
    real: grouped.real.length,
    people: grouped.people.length,
    rest: grouped.rest.length,
  };

  const todayTotal = todayMissions.length;
  const todayDone = todayMissions.filter((m) => completedIds.has(m.id)).length;
  const todayPercent =
    todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100);

  // 세로 스크롤 컨테이너 + 섹션 ref — sticky 탭 활성 추적용
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<MissionGroup, HTMLElement | null>>({
    roadview: null,
    real: null,
    people: null,
    rest: null,
  });
  const [activeGroup, setActiveGroup] = useState<MissionGroup>("roadview");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { g: MissionGroup; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const g = (e.target as HTMLElement).dataset.group as MissionGroup;
          if (!g) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { g, ratio: e.intersectionRatio };
          }
        }
        if (best) setActiveGroup(best.g);
      },
      {
        root,
        rootMargin: "-30% 0px -50% 0px",
        threshold: [0, 0.15, 0.4, 0.7, 1],
      }
    );
    for (const g of MISSION_GROUP_ORDER) {
      const el = sectionRefs.current[g];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [currentDay]);

  const handleTabSelect = (g: MissionGroup) => {
    const el = sectionRefs.current[g];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={scrollRef}
      className="relative h-[calc(100dvh-6rem)] bg-cream overflow-y-auto"
    >
      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="마을로"
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
            {region} · DAY {currentDay} / {dayCount}
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            오늘 하루, 어떤 걸 해볼까요?
          </h1>
        </div>
      </header>

      {/* 일차 진행 도트 */}
      <div className="px-5 mt-3 flex items-center gap-1.5">
        {Array.from({ length: dayCount }).map((_, i) => {
          const day = i + 1;
          const isPast = day < currentDay;
          const isCurrent = day === currentDay;
          return (
            <div
              key={day}
              className={`h-1.5 rounded-full transition-all
                ${
                  isPast
                    ? "flex-1 bg-primary"
                    : isCurrent
                    ? "flex-[2] bg-primary"
                    : "flex-1 bg-cream-200"
                }`}
              aria-hidden
            />
          );
        })}
      </div>

      {/* 오늘 진행률 + 축적 점수 + 적합도 */}
      <section className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-3.5 shadow-soft border border-cream-200">
          <div className="flex items-baseline justify-between">
            <p className="text-ink text-[12px] font-bold">오늘의 진행률</p>
            <p className="text-[12px] text-ink-mute">
              <span className="text-primary font-extrabold">{todayDone}</span>{" "}
              / {todayTotal} 완료
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-cream-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nature-300 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${todayPercent}%` }}
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

      <div className="h-4" />

      {/* sticky 카테고리 탭 */}
      <CategoryTabs
        active={activeGroup}
        counts={counts}
        onSelect={handleTabSelect}
      />

      {/* 오늘 미션이 없는 일차 — 안내 */}
      {todayTotal === 0 && (
        <div className="px-5 py-10 text-center">
          <p className="text-ink-soft text-[14px] leading-relaxed">
            오늘은 머무는 하루예요.<br />
            마을 홈에서 동네를 둘러보고 푹 쉬어요.
          </p>
        </div>
      )}

      {/* 카테고리 섹션 — 오늘 미션만 */}
      {MISSION_GROUP_ORDER.map((g, gi) => {
        const items = grouped[g];
        if (items.length === 0) return null;
        const meta = missionGroupMeta[g];
        return (
          <section
            key={g}
            data-group={g}
            ref={(el) => {
              sectionRefs.current[g] = el;
            }}
            style={{ scrollMarginTop: 56 }}
            className="pt-6 pb-2"
          >
            <div className="px-5 flex items-baseline justify-between">
              <div>
                <h2 className="text-ink text-[16px] font-extrabold">
                  {meta.title}
                </h2>
                <p className="text-ink-soft text-[12px] mt-0.5">
                  {meta.subtitle}
                </p>
              </div>
              <span className="text-ink-mute text-[12px] font-bold tabular-nums">
                {items.length}개
              </span>
            </div>
            <MissionCarousel
              items={items.map((m, i) => (
                <MissionImageCard
                  key={m.id}
                  mission={m}
                  bgImage={meta.bg}
                  done={completedIds.has(m.id)}
                  eager={gi < 2 && i === 0}
                  onClick={() => onSelectMission(m)}
                />
              ))}
            />
          </section>
        );
      })}

      <div className="h-10" />
    </div>
  );
}
