// 탭2 나의 여정 — 한반도 아트지도 위에 다녀온 지역 마커
// 우상단 토글로 "축적 점수"/"적합도" 보기 전환
// 마커 클릭 시 하단 바텀시트(상세 + 미션 리스트 + 이주 리포트 CTA)

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import ProfileCard from "../components/journey/ProfileCard";
import { residences, type Residence, type LifeStyleType } from "../data/residences";
import { baseMissions } from "../data/missions";
import {
  calculateMatch,
  findTopRegion,
  isAllMissionsDone,
  type RegionRecord,
} from "../data/journey";
import { missionsForResidence } from "../data/regionMissions";
import {
  buildDayPlan,
  houseStageFromProgress,
  SPACE_STAGE_NAMES,
} from "../data/dayPlan";
import HouseStage from "../components/HouseStage";

type ViewMode = "score" | "match";

type Props = {
  regionProgress: Record<string, RegionRecord>;
  lifestyle: LifeStyleType | null;
  // 옵션 A — 프로필 카드 노출용
  nickname: string;
  homeRegion: string;
  onOpenSettings: () => void;
  onOpenReport: (residence: Residence) => void;
};

export default function JourneyScreen({
  regionProgress,
  lifestyle,
  nickname,
  homeRegion,
  onOpenSettings,
  onOpenReport,
}: Props) {
  const [view, setView] = useState<ViewMode>("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? residences.find((r) => r.id === selectedId) ?? null
    : null;
  const top = useMemo(() => findTopRegion(regionProgress), [regionProgress]);
  const hasAnyVisit = useMemo(
    () => Object.values(regionProgress).some((r) => r.visitCount > 0),
    [regionProgress]
  );

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col">
      {/* 배경 */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-cream via-cream to-nature-50"
        aria-hidden
      />

      {/* 헤더 */}
      <header className="pt-10 px-5">
        <p className="text-ink-soft text-[12px] font-medium tracking-widest uppercase">
          나의 여정
        </p>
        <h1 className="mt-0.5 text-ink text-[20px] font-extrabold leading-tight">
          다녀온 지역, 쌓인 시간
        </h1>
      </header>

      {/* 프로필 카드 — 옵션 A (탭2 상단에 프로필 흡수) */}
      <section className="px-4 mt-3">
        <ProfileCard
          nickname={nickname}
          lifestyle={lifestyle}
          homeRegion={homeRegion}
          onOpenSettings={onOpenSettings}
        />
      </section>

      {/* 최다 탐색 지역 카드 */}
      <section className="px-4 mt-3">
        {top && hasAnyVisit ? (
          <TopRegionCard
            residence={top}
            record={regionProgress[top.id]}
            lifestyle={lifestyle}
          />
        ) : (
          <EmptyState />
        )}
      </section>

      {/* 토글 — 점수/적합도 보기 */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <span className="text-[11px] text-ink-soft">마커는 보기 모드에 따라 크기가 달라져요</span>
        <div className="flex bg-white border border-cream-200 rounded-full p-0.5 shadow-soft">
          <ToggleBtn
            label="축적 점수"
            active={view === "score"}
            onClick={() => setView("score")}
          />
          <ToggleBtn
            label="적합도"
            active={view === "match"}
            onClick={() => setView("match")}
          />
        </div>
      </div>

      {/* 한반도 아트지도 */}
      <section className="flex-1 px-3 mt-3 flex items-start justify-center">
        <div className="w-full max-w-[320px]">
          <KoreaMap>
            {residences.map((r) => (
              <JourneyMarker
                key={r.id}
                residence={r}
                record={regionProgress[r.id]}
                view={view}
                lifestyle={lifestyle}
                isActive={selectedId === r.id}
                onClick={() => setSelectedId(r.id)}
              />
            ))}
          </KoreaMap>
        </div>
      </section>

      {/* 바텀시트 */}
      <AnimatePresence>
        {selected && (
          <RegionBottomSheet
            residence={selected}
            record={regionProgress[selected.id]}
            lifestyle={lifestyle}
            onClose={() => setSelectedId(null)}
            onOpenReport={() => onOpenReport(selected)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 상단 최다 탐색 카드
// =====================================================================

function TopRegionCard({
  residence,
  record,
  lifestyle,
}: {
  residence: Residence;
  record: RegionRecord | undefined;
  lifestyle: LifeStyleType | null;
}) {
  const score = record?.score ?? 0;
  const visitCount = record?.visitCount ?? 0;
  const match = calculateMatch(lifestyle, residence, record);
  const done = record?.completedMissionIds.length ?? 0;
  return (
    <div className="bg-gradient-to-br from-nature-50 to-primary-50
                    border border-nature-200 rounded-2xl p-4 shadow-soft">
      <p className="text-[10px] font-bold text-nature-600 uppercase tracking-widest">
        가장 많이 탐색한 지역
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          {residence.themeEmoji}
        </span>
        <h2 className="text-ink text-[18px] font-extrabold">
          {residence.region}
        </h2>
        <span className="ml-auto text-[10px] text-ink-mute font-bold">
          {visitCount}번 다녀옴
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="축적 점수" value={`${score}점`} tone="primary" />
        <Stat label="적합도" value={`${match}%`} tone="nature" />
        <Stat label="완료 미션" value={`${done}/8`} tone="ink" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "nature" | "ink";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "nature"
      ? "text-nature-600"
      : "text-ink";
  return (
    <div className="bg-white/80 rounded-xl py-2 px-1">
      <p className="text-[9px] text-ink-mute font-bold uppercase">{label}</p>
      <p className={`text-[14px] font-extrabold ${toneClass}`}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-cream-200 rounded-2xl p-5 text-center shadow-soft">
      <div className="text-3xl" aria-hidden>
        🌱
      </div>
      <p className="mt-2 text-ink text-[14px] font-bold">
        아직 다녀온 지역이 없어요
      </p>
      <p className="mt-1 text-ink-soft text-[12px]">
        떠나기 탭에서 첫 여정을 시작해보세요.
      </p>
    </div>
  );
}

// =====================================================================
// 토글 버튼
// =====================================================================

function ToggleBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition
        ${active ? "bg-primary text-white shadow-soft" : "text-ink-soft"}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// =====================================================================
// 여정 마커 — 점수/적합도에 따라 크기/색 변화
// =====================================================================

function JourneyMarker({
  residence,
  record,
  view,
  lifestyle,
  isActive,
  onClick,
}: {
  residence: Residence;
  record: RegionRecord | undefined;
  view: ViewMode;
  lifestyle: LifeStyleType | null;
  isActive: boolean;
  onClick: () => void;
}) {
  const visited = (record?.visitCount ?? 0) > 0;
  const score = record?.score ?? 0;
  const match = calculateMatch(lifestyle, residence, record);
  // view에 따라 값 정규화 (0~1)
  // - score: 0~300 범위로 normalize (8미션 모두 평균 30점 = 240점 기준)
  // - match: 0~100
  const intensity = visited
    ? view === "score"
      ? Math.min(1, score / 300)
      : Math.min(1, match / 100)
    : 0;

  // 마커 크기 (px) — 미방문은 작게, 방문은 intensity 따라 32~56
  const size = visited ? 32 + intensity * 24 : 18;
  // 색 — 점수 보기는 주황 톤, 적합도 보기는 초록 톤. 미방문은 회색
  const color = !visited
    ? "#C5B89A"
    : view === "score"
    ? "#FF7043"
    : "#7BB57F";
  const opacity = visited ? 0.45 + intensity * 0.55 : 0.5;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${residence.region} 여정 마커`}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center
                 focus:outline-none pointer-events-auto"
      style={{ left: `${residence.xPct}%`, top: `${residence.yPct}%` }}
    >
      <span
        className={`relative inline-flex items-center justify-center rounded-full
          border-2 border-white shadow-soft transition
          ${isActive ? "ring-2 ring-offset-1 ring-primary" : ""}`}
        style={{
          width: size,
          height: size,
          background: color,
          opacity,
        }}
      >
        <span className="text-[12px] font-extrabold text-white drop-shadow tabular-nums">
          {visited
            ? view === "score"
              ? score
              : `${match}`
            : ""}
        </span>
        {visited && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: color, opacity: 0.3 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            aria-hidden
          />
        )}
      </span>
      <span
        className={`mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none
          ${
            isActive
              ? "bg-primary text-white"
              : visited
              ? "bg-white text-ink shadow-sm"
              : "bg-white/70 text-ink-mute"
          }`}
      >
        {residence.region}
      </span>
    </button>
  );
}

// =====================================================================
// 바텀시트 — 마커 클릭 시
// =====================================================================

function RegionBottomSheet({
  residence,
  record,
  lifestyle,
  onClose,
  onOpenReport,
}: {
  residence: Residence;
  record: RegionRecord | undefined;
  lifestyle: LifeStyleType | null;
  onClose: () => void;
  onOpenReport: () => void;
}) {
  const visited = (record?.visitCount ?? 0) > 0;
  const score = record?.score ?? 0;
  const match = calculateMatch(lifestyle, residence, record);
  const completedIds = new Set(record?.completedMissionIds ?? []);
  const completedCount = completedIds.size;
  const allDone = isAllMissionsDone(record);

  // 만들어가는 나의 공간 — 완료한 일차(currentDay - 1) 기반
  const { dayCount } = buildDayPlan(
    residence,
    missionsForResidence(residence.id)
  );
  const currentDay = record?.currentDay ?? 1;
  const completedDays = visited ? Math.max(0, currentDay - 1) : 0;
  const spaceStage = houseStageFromProgress(completedDays, dayCount);

  return (
    <>
      {/* 백드롭 */}
      <motion.button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 z-20"
      />
      {/* 시트 */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="absolute left-0 right-0 bottom-0 z-30
                   bg-white rounded-t-3xl shadow-soft
                   px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]"
        role="dialog"
        aria-label={`${residence.region} 상세`}
      >
        <div className="mx-auto mt-1 mb-3 h-1.5 w-10 rounded-full bg-cream-200" />

        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {residence.themeEmoji}
          </span>
          <h3 className="text-ink text-[17px] font-extrabold">
            {residence.region}
          </h3>
          <span className="ml-auto text-[11px] text-ink-mute">
            {visited ? `${record!.visitCount}번 방문` : "미방문"}
          </span>
        </div>
        <p className="mt-0.5 text-ink-soft text-[12px]">
          {residence.name} · {residence.duration}
        </p>

        {/* 만들고 있는 나의 공간 */}
        {visited && (
          <div className="mt-3 bg-cream-50 border border-cream-200 rounded-2xl p-2.5
                          flex items-center gap-3">
            <div className="w-20 shrink-0">
              <HouseStage stage={spaceStage} className="w-full h-auto" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-ink-mute uppercase tracking-widest">
                만들고 있는 나의 공간
              </p>
              <p className="mt-0.5 text-ink text-[14px] font-extrabold">
                {SPACE_STAGE_NAMES[spaceStage]}
              </p>
              <p className="mt-0.5 text-ink-soft text-[11px]">
                Day {currentDay} / {dayCount} · {completedDays}일 마침
              </p>
            </div>
          </div>
        )}

        {/* 두 막대그래프 */}
        <div className="mt-3 space-y-2.5">
          <Bar label="축적 점수" value={score} max={300} tone="primary" suffix="점" />
          <Bar label="적합도" value={match} max={100} tone="nature" suffix="%" />
        </div>

        {/* 완료 미션 리스트 */}
        <div className="mt-4">
          <p className="text-[11px] text-ink-soft font-bold mb-1.5">
            완료 미션 {completedCount}/8
          </p>
          <div className="flex flex-wrap gap-1.5">
            {baseMissions.map((m) => {
              const done = completedIds.has(m.id);
              return (
                <span
                  key={m.id}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold
                    border ${
                      done
                        ? "bg-nature-50 text-nature-600 border-nature-200"
                        : "bg-cream-100 text-ink-mute border-cream-200"
                    }`}
                >
                  {m.icon} {m.title}
                </span>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onOpenReport}
          disabled={!allDone}
          className="mt-4 w-full py-3.5 rounded-2xl bg-primary text-white text-[14px] font-extrabold
                     shadow-soft active:scale-[0.99] transition
                     disabled:opacity-50 disabled:active:scale-100"
        >
          {allDone ? "📋 이주 리포트 보기" : `미션 완료 시 활성화 (${completedCount}/8)`}
        </button>
      </motion.div>
    </>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  tone: "primary" | "nature";
  suffix?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const fill =
    tone === "primary"
      ? "bg-gradient-to-r from-[#FFB089] to-[#FF7043]"
      : "bg-gradient-to-r from-[#A8D5A8] to-[#66BB6A]";
  const text = tone === "primary" ? "text-primary" : "text-nature-600";
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-ink-soft font-bold">{label}</span>
        <span className={`font-extrabold tabular-nums ${text}`}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-cream-200 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${fill}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
