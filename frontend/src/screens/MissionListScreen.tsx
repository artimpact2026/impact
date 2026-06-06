// 미션 리스트 — 잠시섬 일차별 분기
// 헤더(Day N/Total) + 진행률(오늘) + 카테고리 4섹션(오늘 미션만)

import { useEffect, useMemo, useRef, useState } from "react";
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
      className="relative bg-cream overflow-y-auto"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* 헤더 — Day 정보 제거. 사용자에게 말 거는 톤 */}
      <header className="pt-12 px-5 flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="마을로"
          className="w-9 h-9 mt-1 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink shrink-0
                     transition active:scale-95"
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
          <h1 className="text-ink text-[24px] font-extrabold leading-[1.25]">
            오늘 뭐가
            <br />
            제일 궁금해요?
          </h1>
          <p className="mt-1.5 text-ink-soft text-[12.5px] leading-relaxed">
            끌리는 카드 한 장, 톡 골라봐요
          </p>
        </div>
      </header>

      {/* 작은 진행 게이지만 — Day/N/M 텍스트 등 모두 제거 */}
      <section className="px-5 mt-5">
        <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-nature-300 to-primary"
            style={{ width: `${todayPercent}%` }}
          />
        </div>
      </section>

      <div className="h-3" />

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
            <div className="px-5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.18em]">
                  Chapter
                </p>
                <h2 className="mt-0.5 text-ink text-[17px] font-extrabold leading-tight">
                  {meta.title}
                </h2>
                <p className="text-ink-soft text-[12px] mt-1 leading-relaxed">
                  {meta.subtitle}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                               bg-white border border-cream-200 text-ink-soft text-[11px] font-extrabold tabular-nums shadow-soft">
                <span aria-hidden>🃏</span>
                {items.length}장
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
