// 탭1 떠나기 화면 — PRD 2.떠나기
// 한반도 지도 + 마커 + 추천/전체 토글
// - 추천: recommended:true 인 3개 레지던스 (마커 + ResidenceSheet → 떠나기 흐름)
// - 전체: village_archive 기반 "레지던스 문화 미션" — 홈 지역 근접 15곳을
//         지도 마커(위 절반) + 바텀시트 카드 리스트(아래 절반)로 표시, 카드→상세

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import ResidenceMarker from "../components/ResidenceMarker";
import ResidenceSheet from "../components/ResidenceSheet";
import MissionMarker from "../components/MissionMarker";
import VillageMissionCard from "../components/VillageMissionCard";
import MissionDetailSheet from "../components/MissionDetailSheet";
import { residences, type Residence } from "../data/residences";
import { HOME_POSITIONS, type RegionPos } from "../data/regions";
import { selectNearbyMissions } from "../data/villageMissions";

type Props = {
  homeRegion: string;
  onBack: () => void;
  onDepart: (residence: Residence) => void;
};

type ViewMode = "recommended" | "all";

const MISSION_COUNT = 15;

export default function DepartureScreen({ homeRegion, onBack, onDepart }: Props) {
  const [view, setView] = useState<ViewMode>("recommended");

  // ── 추천(레지던스) 상태 ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = residences.find((r) => r.id === selectedId) ?? null;

  // ── 전체(문화 미션) 상태 ──
  const [activeMissionKey, setActiveMissionKey] = useState<string | null>(null);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [startedKeys, setStartedKeys] = useState<Set<string>>(new Set());

  // 홈 지역 좌표 — HOME_POSITIONS 우선, 없으면 같은 이름 레지던스 좌표, 최후 서울
  const homePos: RegionPos = useMemo(() => {
    if (HOME_POSITIONS[homeRegion]) return HOME_POSITIONS[homeRegion];
    const r = residences.find((x) => x.region === homeRegion);
    if (r) return { xPct: r.xPct, yPct: r.yPct };
    return HOME_POSITIONS["서울"];
  }, [homeRegion]);

  // 홈에서 가까운 미션 15곳
  const missions = useMemo(
    () => selectNearbyMissions(homePos, MISSION_COUNT),
    [homePos]
  );

  // 카드 DOM 참조 — 마커 선택 시 해당 카드로 자동 스크롤
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  useEffect(() => {
    if (view !== "all" || !activeMissionKey) return;
    cardRefs.current
      .get(activeMissionKey)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeMissionKey, view]);

  const recommended = residences.filter((r) => r.recommended);
  const detailMission =
    missions.find((m) => m.key === detailKey) ?? null;

  return (
    // h-[...] 로 고정 높이 — 내부 flex 자식의 flex-1+overflow-y-auto 가 스크롤되도록
    <div className="relative h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-[#EAF4FB] via-cream to-cream"
        aria-hidden
      />

      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
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
        <div className="flex-1">
          <p className="text-ink-soft text-[12px] font-medium">
            📍 본 지역 {homeRegion}
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            어디로 가볼까?
          </h1>
        </div>
      </header>

      {/* 안내 + 토글 */}
      <div className="mt-2 px-5 flex items-center justify-between gap-2 shrink-0">
        <p className="text-ink-soft text-[12px] leading-relaxed">
          {view === "recommended"
            ? "취향에 맞춘 추천 레지던스예요."
            : `${homeRegion}에서 가까운 문화 미션 ${missions.length}곳이에요.`}
        </p>
        <div className="flex bg-white border border-cream-200 rounded-full p-0.5 shadow-soft shrink-0">
          <ToggleBtn
            label="추천"
            active={view === "recommended"}
            onClick={() => setView("recommended")}
          />
          <ToggleBtn
            label="전체"
            active={view === "all"}
            onClick={() => setView("all")}
          />
        </div>
      </div>

      {/* ===== 추천 모드: 레지던스 마커 + 바텀시트 ===== */}
      {view === "recommended" && (
        <>
          <section className="flex-1 px-3 mt-3 mb-4 flex items-start justify-center">
            <div className="w-full max-w-[320px]">
              <KoreaMap>
                {recommended.map((r) => (
                  <ResidenceMarker
                    key={r.id}
                    xPct={r.xPct}
                    yPct={r.yPct}
                    region={r.region}
                    isActive={selectedId === r.id}
                    onClick={() => setSelectedId(r.id)}
                  />
                ))}
              </KoreaMap>
            </div>
          </section>

          <ResidenceSheet
            residence={selected}
            onClose={() => setSelectedId(null)}
            onDepart={(r) => {
              setSelectedId(null);
              onDepart(r);
            }}
          />
        </>
      )}

      {/* ===== 전체 모드: 문화 미션 지도(위) + 카드 바텀시트(아래) ===== */}
      {view === "all" && (
        <>
          {/* 지도 영역 (위 절반) */}
          <section className="shrink-0 mt-2 px-3 flex justify-center overflow-hidden max-h-[40vh]">
            <div className="w-full max-w-[210px]">
              <KoreaMap>
                {missions.map((m) => (
                  <MissionMarker
                    key={m.key}
                    xPct={m.xPct}
                    yPct={m.yPct}
                    emoji={m.emoji}
                    region={m.regionLabel}
                    isActive={activeMissionKey === m.key}
                    onClick={() => setActiveMissionKey(m.key)}
                  />
                ))}
              </KoreaMap>
            </div>
          </section>

          {/* 카드 바텀시트 (아래 절반) */}
          <div className="flex-1 min-h-0 mt-1 bg-white rounded-t-3xl shadow-soft flex flex-col">
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-cream-200 shrink-0" />
            <div className="px-5 pt-2 pb-1 flex items-center justify-between shrink-0">
              <h2 className="text-ink text-[15px] font-extrabold">
                레지던스 문화 미션
              </h2>
              <span className="text-ink-mute text-[12px] font-semibold">
                {missions.length}곳
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 pt-1 space-y-2.5">
              {missions.map((m) => (
                <VillageMissionCard
                  key={m.key}
                  mission={m}
                  isActive={activeMissionKey === m.key}
                  cardRef={(el) => {
                    if (el) cardRefs.current.set(m.key, el);
                    else cardRefs.current.delete(m.key);
                  }}
                  onClick={() => {
                    setActiveMissionKey(m.key);
                    setDetailKey(m.key);
                  }}
                />
              ))}
            </div>
          </div>

          {/* 상세 (전체화면 오버레이) */}
          <MissionDetailSheet
            mission={detailMission}
            started={detailKey ? startedKeys.has(detailKey) : false}
            onClose={() => setDetailKey(null)}
            onStart={(m) =>
              setStartedKeys((prev) => new Set(prev).add(m.key))
            }
          />
        </>
      )}
    </div>
  );
}

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
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition
        ${active ? "bg-primary text-white shadow-soft" : "text-ink-soft"}`}
    >
      {label}
    </motion.button>
  );
}
