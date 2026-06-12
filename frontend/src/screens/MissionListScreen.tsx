// 미션 리스트 — 잠시섬 일차별 분기
// 헤더(Day N/Total) + 진행률(오늘) + 카테고리 4섹션(오늘 미션만)

import { useEffect, useMemo, useRef, useState } from "react";
import CategoryTabs from "../components/CategoryTabs";
import TimeOfDayTabs from "../components/TimeOfDayTabs";
import MissionCarousel from "../components/MissionCarousel";
import MissionImageCard from "../components/MissionImageCard";
import { type Mission, type TimeOfDay } from "../data/missions";
import { missionsForResidence } from "../data/regionMissions";
import { backgroundForResidence } from "../data/regionBackgrounds";
import {
  MISSION_GROUP_ORDER,
  getMissionGroup,
  groupMissions,
  missionGroupMeta,
  type MissionGroup,
} from "../data/missionCategories";
import { buildDayPlan, missionIdsForDay } from "../data/dayPlan";
import type { Residence } from "../data/residences";
import TutorialOverlay from "../components/TutorialOverlay";
import { HANSEOL_LUNCH_HINT } from "../data/ganghwaStory";

type Props = {
  region: string;
  residence: Residence;
  completedIds: Set<string>;
  totalScore: number;
  fitScore?: number;
  currentDay: number;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
  // 점심 탭 튜토리얼 — 강화 Day1 shop 완료 후 1회용. 게이트는 부모(App)에서 결정.
  showLunchTutorial?: boolean;
  onDismissLunchTutorial?: () => void;
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
  showLunchTutorial = false,
  onDismissLunchTutorial,
}: Props) {
  // 점심 탭 ref — 튜토리얼 스포트라이트 좌표 측정용
  const lunchTabRef = useRef<HTMLButtonElement | null>(null);
  const allMissions = useMemo(
    () => missionsForResidence(residence.id),
    [residence.id]
  );

  // 일차 분배 — 같은 결정 로직을 부모와 공유 가능하게 export 된 buildDayPlan 사용
  const { missionsByDay, bonusMissionIds } = useMemo(
    () => buildDayPlan(residence, allMissions),
    [residence, allMissions]
  );

  // 보너스 미션 (일차 plan 바깥, 별도 섹션)
  const bonusMissions = useMemo(
    () => allMissions.filter((m) => bonusMissionIds.includes(m.id)),
    [allMissions, bonusMissionIds]
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

  // 지역별 배경 이미지 — 없으면 기본 cream 색
  const regionBg = backgroundForResidence(residence.id);

  // ===== 2단 탭 모드 — 오늘 미션 전부에 timeOfDay 가 있을 때 활성. 강화 plan 자동 해당. =====
  const useTwoTier =
    todayMissions.length > 0 && todayMissions.every((m) => m.timeOfDay);

  const [activeTime, setActiveTime] = useState<TimeOfDay>("아침");

  // 시간대별 미션
  const byTime = useMemo(() => {
    const out: Record<TimeOfDay, Mission[]> = { 아침: [], 낮: [], 저녁: [] };
    for (const m of todayMissions) {
      if (m.timeOfDay) out[m.timeOfDay].push(m);
    }
    return out;
  }, [todayMissions]);

  const timeCounts: Record<TimeOfDay, number> = {
    아침: byTime["아침"].length,
    낮: byTime["낮"].length,
    저녁: byTime["저녁"].length,
  };

  const activeTimeMissions = byTime[activeTime];

  const handleTimeSelect = (t: TimeOfDay) => {
    // 점심 탭 튜토리얼이 떠 있었으면 점심 선택 시 1회 플래그 저장
    if (showLunchTutorial && t === "낮") onDismissLunchTutorial?.();
    setActiveTime(t);
  };

  return (
    <div
      ref={scrollRef}
      className="relative bg-cream overflow-y-auto"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {regionBg ? (
        // ===== 이미지 헤더 모드 — 상단 240px 에 지역 이미지, 하단 그라데이션 위에 흰 글씨 =====
        <header className="relative h-[240px] w-full overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${regionBg})` }}
          />
          {/* 하단으로 갈수록 어두워지는 그라데이션 — 흰 글씨 가독성 확보 */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55"
          />
          <div className="relative h-full px-5 pt-12 pb-10 flex flex-col">
            <button
              type="button"
              onClick={onBack}
              aria-label="마을로"
              className="w-9 h-9 rounded-full bg-white/25 backdrop-blur
                         flex items-center justify-center text-white shrink-0
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
            <div className="mt-auto">
              <h1 className="text-white text-[24px] font-extrabold leading-[1.25] drop-shadow-sm">
                오늘은
                <br />
                {region}의 {currentDay}일차
              </h1>
              <p className="mt-1.5 text-white/85 text-[12.5px] leading-relaxed">
                어디부터 들러볼까요?
              </p>
            </div>
          </div>
        </header>
      ) : (
        // ===== 기본 모드 — 이미지 없는 지역. 지금까지의 cream 헤더 그대로 =====
        <>
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
                오늘은
                <br />
                {region}의 {currentDay}일차
              </h1>
              <p className="mt-1.5 text-ink-soft text-[12.5px] leading-relaxed">
                어디부터 들러볼까요?
              </p>
            </div>
          </header>

          <section className="px-5 mt-5">
            <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nature-300 to-primary"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </section>
        </>
      )}

      {/* 콘텐츠 패널 — 이미지 헤더 아래에서 둥근 모서리로 살짝 올라오는 카드 느낌.
          이미지 없는 지역은 그냥 cream 위에 이어지는 평범한 영역. */}
      <div
        className={`relative bg-cream ${
          regionBg ? "-mt-5 rounded-t-3xl pt-3" : ""
        }`}
      >
        <div className="h-3" />

        {/* ===== 오늘 진행 카드 — 흰 박스 + 살구→주황 그라디언트 게이지 + 'N/M 완료' 텍스트 ===== */}
        {useTwoTier && todayTotal > 0 && (
          <section className="px-5 pt-1 pb-3">
            <div
              className="rounded-2xl bg-white border border-cream-200
                         shadow-soft px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-ink text-[13px] font-extrabold">오늘 미션</p>
                <p className="text-ink-soft text-[12.5px] font-extrabold tabular-nums">
                  {todayDone}/{todayTotal} 완료
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF8C42] to-[#FFB347]
                             transition-[width] duration-300"
                  style={{ width: `${todayPercent}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {useTwoTier ? (
          // ===== 2단 탭 모드 (강화 plan 자동) — 카테고리 필터 줄 삭제 =====
          <>
            <div
              className="sticky top-0 z-20 bg-cream/95 backdrop-blur
                         border-b border-cream-200"
            >
              <TimeOfDayTabs
                active={activeTime}
                counts={timeCounts}
                onSelect={handleTimeSelect}
                lunchTabRef={lunchTabRef}
              />
            </div>

            {/* 시간대 미션 카드 — 한 줄 캐로셀. */}
            <section className="pt-5 pb-2">
              {activeTimeMissions.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-ink-soft text-[13px] leading-relaxed">
                    이 시간대에는 미션이 없어요.<br />
                    다른 시간대를 둘러봐요.
                  </p>
                </div>
              ) : (
                <MissionCarousel
                  items={activeTimeMissions.map((m, i) => {
                    const meta = missionGroupMeta[getMissionGroup(m)];
                    return (
                      <MissionImageCard
                        key={m.id}
                        mission={m}
                        bgImage={meta.bg}
                        done={completedIds.has(m.id)}
                        eager={i === 0}
                        onClick={() => onSelectMission(m)}
                      />
                    );
                  })}
                />
              )}
            </section>
          </>
        ) : (
          // ===== 기본 모드 — 기존 카테고리 탭 + 섹션 =====
          <>
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
          </>
        )}

      {/* ===== 보너스 미션 섹션 (Phase A — 강화부터) =====
          tier === "bonus" 인 미션만. 일자 제약 없이 언제든 풀 수 있는 추가 미션. */}
      {bonusMissions.length > 0 && (
        <section className="pt-8 pb-2">
          <div className="px-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-[0.18em]">
                ✨ Bonus
              </p>
              <h2 className="mt-0.5 text-ink text-[17px] font-extrabold leading-tight">
                추가 미션
              </h2>
              <p className="text-ink-soft text-[12px] mt-1 leading-relaxed">
                여유 있을 때 풀어보는 보너스 한 장
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                             bg-primary text-white text-[11px] font-extrabold tabular-nums shadow-soft">
              ✨ {bonusMissions.length}장
            </span>
          </div>
          <MissionCarousel
            items={bonusMissions.map((m, i) => {
              const group = missionGroupMeta.rest; // 보너스 카드 톤 통일 (감성·휴식 톤)
              return (
                <MissionImageCard
                  key={m.id}
                  mission={m}
                  bgImage={group.bg}
                  done={completedIds.has(m.id)}
                  eager={i === 0}
                  onClick={() => onSelectMission(m)}
                />
              );
            })}
          />
        </section>
      )}

        <div className="h-10" />
      </div>

      {/* 점심 탭 튜토리얼 — shop 완료 후 자연스러운 시간대 이동 안내 */}
      <TutorialOverlay
        visible={showLunchTutorial}
        targetRef={lunchTabRef}
        caption={HANSEOL_LUNCH_HINT}
        characterSrc="/character1/clay-baram-solo.png"
        characterSide="left"
      />
    </div>
  );
}
