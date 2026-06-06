// 탭2 나의 여정 — 한반도 아트지도 위에 다녀온 지역 마커
// 우상단 토글로 "축적 점수"/"적합도" 보기 전환
// 마커 클릭 시 하단 바텀시트(상세 + 미션 리스트 + 이주 리포트 CTA)

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import { residences, type Residence, type LifeStyleType } from "../data/residences";
import { baseMissions } from "../data/missions";
import {
  calculateMatch,
  calculateMatchV2,
  isAllMissionsDone,
  type RegionRecord,
} from "../data/journey";
import { missionsForResidence } from "../data/regionMissions";
import {
  buildDayPlan,
  houseStageFromProgress,
  SPACE_STAGE_NAMES,
} from "../data/dayPlan";
import { type LifestyleProfile } from "../data/lifestyle";
import HouseStage from "../components/HouseStage";

type ViewMode = "score" | "match";

type Props = {
  regionProgress: Record<string, RegionRecord>;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  onOpenReport: (residence: Residence) => void;
  // 이주 리포트 시네마틱 — 캐싱된 리포트가 있을 때만 노출
  onOpenCinematic?: (residence: Residence) => void;
};

export default function JourneyScreen({
  regionProgress,
  lifestyle,
  profile,
  onOpenReport,
  onOpenCinematic,
}: Props) {
  const [view, setView] = useState<ViewMode>("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 상단 "나의 공간"으로 보고 있는 지역 — 사용자가 스위처로 바꿀 수 있음
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  const selected = selectedId
    ? residences.find((r) => r.id === selectedId) ?? null
    : null;
  const hasAnyVisit = useMemo(
    () => Object.values(regionProgress).some((r) => r.visitCount > 0),
    [regionProgress]
  );
  // 이주 리포트가 생성된 지역들 — 여러 곳 가능, 카드로 쌓아서 보여줌
  const reportResidences = useMemo(
    () =>
      residences.filter((r) => regionProgress[r.id]?.migrationReport),
    [regionProgress]
  );
  // 방문한 지역 — visitCount desc → score desc → residences 원래 순서
  const visitedSorted = useMemo(() => {
    const order = new Map(residences.map((r, i) => [r.id, i]));
    return residences
      .filter((r) => (regionProgress[r.id]?.visitCount ?? 0) > 0)
      .sort((a, b) => {
        const ra = regionProgress[a.id]!;
        const rb = regionProgress[b.id]!;
        if (rb.visitCount !== ra.visitCount) return rb.visitCount - ra.visitCount;
        if (rb.score !== ra.score) return rb.score - ra.score;
        return (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0);
      });
  }, [regionProgress]);
  // 상단 공간 카드에 띄울 지역 — 사용자 선택이 유효하면 그것, 아니면 1위
  const activeSpaceResidence = useMemo(() => {
    if (visitedSorted.length === 0) return null;
    if (selectedSpaceId) {
      const found = visitedSorted.find((r) => r.id === selectedSpaceId);
      if (found) return found;
    }
    return visitedSorted[0];
  }, [visitedSorted, selectedSpaceId]);

  return (
    <div className="relative h-[calc(100dvh-6rem)] flex flex-col
                    bg-cream">
      {/* 스크롤 영역 — 바텀시트가 root에 absolute로 붙도록 스크롤은 내부 div에만 */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-8">
      {/* 페이지 제목 — 작게. 프로필과 시각적으로 구분 */}
      <header className="px-5 pt-5 pb-1">
        <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
          Travel · 쌓인 시간
        </p>
      </header>

      {/* ① 나의 공간 — full-bleed 풍경 */}
      <section className="mt-3">
        <MyVillageScene
          residence={activeSpaceResidence}
          record={
            activeSpaceResidence
              ? regionProgress[activeSpaceResidence.id]
              : undefined
          }
          visitedSorted={visitedSorted}
          onSelect={setSelectedSpaceId}
        />
      </section>

      {/* 토글 — 점수/적합도 보기 (지도와 한 묶음) */}
      <div className="px-4 mt-5 flex items-center justify-between">
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

      {/* ③ 한반도 아트지도 — 다녀온 지역만 마커. 누적될수록 흔적이 풍성해짐. */}
      <section className="px-3 mt-3 flex items-start justify-center">
        <div className="w-full max-w-[320px]">
          <KoreaMap>
            {/* 다녀온 지역 사이의 점선 동선 — 2곳 이상일 때 */}
            {visitedSorted.length >= 2 && (
              <JourneyPath residences={visitedSorted} />
            )}
            {/* 다녀온 지역마다 흩뿌려진 작은 흔적(꽃잎·점). visitCount + score 비례. */}
            {visitedSorted.map((r) => (
              <ArtTraces
                key={`traces-${r.id}`}
                residence={r}
                record={regionProgress[r.id]}
              />
            ))}
            {/* 마커 — 다녀온 곳만 */}
            {visitedSorted.map((r) => (
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
            {/* 빈 지도일 때 안내 — 가운데에 부드럽게 */}
            {visitedSorted.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-ink-mute text-[12px] font-bold bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-soft">
                  떠난 곳이 여기에 한 점씩 자리잡아요
                </p>
              </div>
            )}
          </KoreaMap>
        </div>
      </section>

      {/* ④ 이주 리포트 카드 — 리포트 생성된 지역만 노출, 여러 곳이면 쌓아서 표시.
          아직 어디도 다녀오지 않았으면 EmptyState, 다녀왔지만 리포트 미생성이면 잠금 카드. */}
      <section className="px-4 mt-4 space-y-2">
        {!hasAnyVisit ? (
          <EmptyState />
        ) : reportResidences.length === 0 ? (
          <LockedReportCard />
        ) : (
          reportResidences.map((r) => (
            <TopRegionCard
              key={r.id}
              residence={r}
              record={regionProgress[r.id]}
              lifestyle={lifestyle}
            />
          ))
        )}
      </section>
      </div>

      {/* 바텀시트 — 스크롤 영역 바깥. root 기준 absolute라 viewport 하단 고정 */}
      <AnimatePresence>
        {selected && (
          <RegionBottomSheet
            residence={selected}
            record={regionProgress[selected.id]}
            lifestyle={lifestyle}
            profile={profile}
            onClose={() => setSelectedId(null)}
            onOpenReport={() => onOpenReport(selected)}
            onOpenCinematic={
              onOpenCinematic ? () => onOpenCinematic(selected) : undefined
            }
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
        이주 리포트
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

// =====================================================================
// 나의 공간 — 다육이 톤 풍경 (full-bleed). 카드 테두리 없음.
// 풍경 SVG 위에 HouseStage(scenic) + clay 캐릭터 2명을 absolute로 얹음.
// 캐릭터는 통통 모션, baram은 추가 회전(망치질 느낌). 단계 변화 시 집 fade-up.
// =====================================================================

function MyVillageScene({
  residence,
  record,
  visitedSorted,
  onSelect,
}: {
  residence: Residence | null;
  record: RegionRecord | undefined;
  visitedSorted: Residence[];
  onSelect: (id: string) => void;
}) {
  const isEmpty = !residence || !record;

  // 단계 계산 — 빈 상태면 stage 0 (빈 터)
  const plan = !isEmpty
    ? buildDayPlan(residence, missionsForResidence(residence.id))
    : { dayCount: 4 };
  const currentDay = !isEmpty ? record.currentDay ?? 1 : 1;
  const completedDays = !isEmpty ? Math.max(0, currentDay - 1) : 0;
  const spaceStage = !isEmpty
    ? houseStageFromProgress(completedDays, plan.dayCount)
    : 0;

  return (
    <div className="w-full">
      {/* 상단 텍스트 — 지역명 · 단계명 */}
      <div className="px-5">
        <p className="text-[10px] font-bold text-ink-mute uppercase tracking-widest">
          만들고 있는 나의 공간
        </p>
        {!isEmpty ? (
          <h2 className="mt-1 text-ink text-[17px] font-extrabold leading-tight">
            <span aria-hidden>{residence.themeEmoji}</span> {residence.region}
            <span className="text-ink-mute"> · </span>
            <span className="text-primary">{SPACE_STAGE_NAMES[spaceStage]}</span>
          </h2>
        ) : (
          <h2 className="mt-1 text-ink-soft text-[16px] font-extrabold leading-tight">
            아직 만들고 있는 공간이 없어요
          </h2>
        )}
      </div>

      {/* 풍경 영역 — full-bleed (좌우 0) */}
      <div className="relative mt-2 h-[240px] w-full overflow-hidden">
        {/* 배경 SVG — 하늘·산·나무·울타리·텃밭·땅 */}
        <svg
          viewBox="0 0 375 240"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="vsSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#F0F8F1" />
            </linearGradient>
            <linearGradient id="vsGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8C49A" />
              <stop offset="100%" stopColor="#C99A6E" />
            </linearGradient>
            <linearGradient id="vsFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0F8F1" stopOpacity="0" />
              <stop offset="100%" stopColor="#F0F8F1" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* 하늘 */}
          <rect x="0" y="0" width="375" height="240" fill="url(#vsSky)" />

          {/* 먼 산 — 부드러운 두 겹 */}
          <path
            d="M 0 158 Q 60 128 130 142 Q 200 156 270 134 Q 330 122 375 142 L 375 220 L 0 220 Z"
            fill="#D8EEDA"
            opacity="0.85"
          />
          <path
            d="M 0 174 Q 80 156 160 166 Q 250 178 320 160 L 375 168 L 375 225 L 0 225 Z"
            fill="#B1DCB5"
            opacity="0.75"
          />

          {/* 땅 */}
          <rect x="0" y="195" width="375" height="50" fill="url(#vsGround)" />
          <ellipse cx="187" cy="200" rx="180" ry="5" fill="#C99A6E" opacity="0.4" />

          {/* 좌측 나무 (큰 것 + 작은 것) */}
          <g>
            <rect x="28" y="156" width="6" height="40" fill="#8C5A3B" rx="1" />
            <circle cx="31" cy="148" r="18" fill="#8BCB90" />
            <circle cx="22" cy="155" r="12" fill="#66BB6A" />
            <circle cx="40" cy="155" r="12" fill="#66BB6A" />
          </g>
          <g>
            <rect x="62" y="170" width="4" height="26" fill="#8C5A3B" rx="1" />
            <circle cx="64" cy="166" r="10" fill="#8BCB90" />
          </g>

          {/* 우측 나무 */}
          <g>
            <rect x="340" y="158" width="6" height="38" fill="#8C5A3B" rx="1" />
            <circle cx="343" cy="150" r="16" fill="#8BCB90" />
            <circle cx="334" cy="157" r="10" fill="#66BB6A" />
            <circle cx="352" cy="157" r="10" fill="#66BB6A" />
          </g>
          <g>
            <rect x="312" y="172" width="4" height="24" fill="#8C5A3B" rx="1" />
            <circle cx="314" cy="168" r="9" fill="#8BCB90" />
          </g>

          {/* 좌측 울타리 — 집 영역(중앙) 피해서 */}
          <g fill="#B98456">
            <rect x="78" y="186" width="3" height="14" rx="1.5" />
            <rect x="88" y="186" width="3" height="14" rx="1.5" />
            <rect x="98" y="186" width="3" height="14" rx="1.5" />
            <rect x="108" y="186" width="3" height="14" rx="1.5" />
            <rect x="76" y="192" width="36" height="2" rx="1" />
          </g>

          {/* 우측 울타리 */}
          <g fill="#B98456">
            <rect x="268" y="186" width="3" height="14" rx="1.5" />
            <rect x="278" y="186" width="3" height="14" rx="1.5" />
            <rect x="288" y="186" width="3" height="14" rx="1.5" />
            <rect x="298" y="186" width="3" height="14" rx="1.5" />
            <rect x="266" y="192" width="36" height="2" rx="1" />
          </g>

          {/* 텃밭 식물 — 집 양옆 풀밭 위 점점이 */}
          <g fill="#66BB6A">
            <ellipse cx="118" cy="206" rx="4" ry="3" />
            <ellipse cx="127" cy="208" rx="3" ry="2" />
            <ellipse cx="248" cy="206" rx="4" ry="3" />
            <ellipse cx="257" cy="208" rx="3" ry="2" />
          </g>
          <g fill="#3F8E45">
            <ellipse cx="134" cy="212" rx="2.5" ry="1.5" />
            <ellipse cx="242" cy="212" rx="2.5" ry="1.5" />
          </g>

          {/* 하단 페이드 — 페이지 bg(nature-50)와 자연 전환 */}
          <rect x="0" y="200" width="375" height="40" fill="url(#vsFade)" />
        </svg>

        {/* 집 — scenic 모드. 단계 키 변경 시 fade-up 전환 */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={spaceStage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[28px] w-[148px] pointer-events-none"
          >
            <HouseStage stage={spaceStage} className="w-full h-auto" scenic />
          </motion.div>
        </AnimatePresence>

        {/* baram — 좌측. 통통 + 살짝 회전(망치질 느낌). 빈 상태일 땐 회전 X */}
        <motion.img
          src="/character1/clay-baram-solo.png"
          alt=""
          aria-hidden
          className="absolute left-[10%] bottom-[8px] w-[58px] h-auto pointer-events-none
                     drop-shadow-[0_6px_10px_rgba(62,44,32,0.22)]"
          style={{ transformOrigin: "60% 90%" }}
          animate={
            isEmpty
              ? { y: [0, -3, 0] }
              : { y: [0, -3, 0], rotate: [0, -7, 0, 4, 0] }
          }
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* jieum — 우측. 통통만 (phase 다르게) */}
        <motion.img
          src="/character1/clay-jieum-solo.png"
          alt=""
          aria-hidden
          className="absolute right-[10%] bottom-[8px] w-[58px] h-auto pointer-events-none
                     drop-shadow-[0_6px_10px_rgba(62,44,32,0.22)]"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </div>

      {/* 진행바 + Day 카운트 — 다육이 톤 segmented bar */}
      <div className="px-5 mt-2">
        {!isEmpty ? (
          <>
            <div className="flex gap-1.5" aria-label={`단계 ${spaceStage + 1}/4`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition
                    ${i <= spaceStage ? "bg-primary" : "bg-cream-200"}`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-ink-soft text-[11px] text-center tabular-nums">
              Day {currentDay} / 총 {plan.dayCount}
              <span className="mx-1.5 text-ink-mute">·</span>
              {completedDays}일 마침
            </p>
          </>
        ) : (
          <p className="text-ink-soft text-[12px] text-center">
            첫 여정을 시작하면 여기에서 자라요
          </p>
        )}
      </div>

      {/* 가로 스위처 — 방문 지역 ≥ 2개일 때만, 진행바 밑 */}
      {visitedSorted.length >= 2 && residence && (
        <div className="mt-3 px-4 pb-1 flex gap-1.5 overflow-x-auto">
          {visitedSorted.map((r) => {
            const active = r.id === residence.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition
                  ${
                    active
                      ? "bg-primary text-white shadow-soft"
                      : "bg-white text-ink-soft border border-cream-200"
                  }`}
                aria-pressed={active}
              >
                <span aria-hidden>{r.themeEmoji}</span> {r.region}
              </button>
            );
          })}
        </div>
      )}
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

// 다녀온 곳은 있지만 아직 이주 리포트는 생성되지 않은 상태 — 잠금 카드
function LockedReportCard() {
  return (
    <div className="bg-cream-50 border border-dashed border-cream-300 rounded-2xl p-5 text-center">
      <div className="text-2xl" aria-hidden>
        🔒
      </div>
      <p className="mt-2 text-ink text-[13.5px] font-extrabold">
        이주 리포트가 생성되면 열려요
      </p>
      <p className="mt-1 text-ink-soft text-[11.5px] leading-relaxed">
        지역에서 미션 8개를 모두 마치면<br />
        그곳의 이주 리포트가 만들어져요.
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
// 아트맵 흔적 — 다녀온 지역마다 작은 꽃잎/점을 흩뿌림
// visitCount + score 비례로 양/색 결정. 위치는 region.id 기반 결정적(re-render 안정).
// =====================================================================

function ArtTraces({
  residence,
  record,
}: {
  residence: Residence;
  record: RegionRecord | undefined;
}) {
  const visitCount = record?.visitCount ?? 0;
  const score = record?.score ?? 0;
  if (visitCount === 0) return null;

  // 시드 기반 의사난수 — region.id로 안정적인 배치
  const seed = (residence.id + visitCount).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return x - Math.floor(x);
  };

  // 흔적 개수 — visitCount 비례, 점수 보너스. 최소 3개, 최대 10개.
  const dotCount = Math.min(10, 3 + visitCount + Math.floor(score / 60));

  return (
    <>
      {Array.from({ length: dotCount }).map((_, i) => {
        // 마커 주위 6~14% 반경에 배치
        const angle = rand(i) * Math.PI * 2;
        const radius = 5 + rand(i + 100) * 7;
        const x = residence.xPct + Math.cos(angle) * radius;
        const y = residence.yPct + Math.sin(angle) * radius;
        // 점수 높을수록 더 진한 톤
        const intensity = Math.min(1, 0.4 + score / 250);
        // 꽃잎(70%) / 별점(30%) 분기
        const isPetal = rand(i + 200) > 0.3;
        // 5~11px — 작은 한반도 안에서도 또렷이 보이는 크기
        const size = 5 + rand(i + 300) * 6;

        // 외곽 div가 위치+회전 — framer-motion이 transform 덮어쓰지 못하도록 분리
        const rotateDeg = rand(i + 600) * 360;
        return (
          <div
            key={`${residence.id}-trace-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${rotateDeg}deg)`,
              zIndex: 5,
            }}
            aria-hidden
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: intensity,
                scale: 1,
                y: [0, -2, 0],
              }}
              transition={{
                opacity: { delay: 0.1 + i * 0.05, duration: 0.6 },
                scale: { delay: 0.1 + i * 0.05, duration: 0.6, ease: "easeOut" },
                y: {
                  duration: 3 + rand(i + 400) * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: rand(i + 500) * 2,
                },
              }}
              className="block"
              style={{
                width: size,
                height: size,
                borderRadius: isPetal ? "50% 50% 50% 0" : "9999px",
                background: isPetal
                  ? `rgba(255, 112, 67, ${intensity})` // 살구 꽃잎 (더 진하게)
                  : `rgba(102, 187, 106, ${intensity})`, // 초록 점
                boxShadow: isPetal
                  ? "0 2px 4px rgba(255, 112, 67, 0.28)"
                  : "0 0 6px rgba(102, 187, 106, 0.4)",
              }}
            />
          </div>
        );
      })}
    </>
  );
}

// =====================================================================
// 여정 동선 — 다녀온 지역 사이의 점선 곡선 (visit 순서대로 연결)
// =====================================================================

function JourneyPath({ residences }: { residences: Residence[] }) {
  if (residences.length < 2) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      {residences.slice(0, -1).map((from, i) => {
        const to = residences[i + 1];
        // 중간점을 살짝 위로 띄워 부드러운 곡선
        const midX = (from.xPct + to.xPct) / 2;
        const midY = (from.yPct + to.yPct) / 2 - 4;
        return (
          <motion.path
            key={`${from.id}-${to.id}`}
            d={`M ${from.xPct} ${from.yPct} Q ${midX} ${midY} ${to.xPct} ${to.yPct}`}
            fill="none"
            stroke="#FF7043"
            strokeWidth="0.35"
            strokeDasharray="1.2 1.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.55"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 1.2, delay: 0.15 + i * 0.15, ease: "easeOut" }}
          />
        );
      })}
    </svg>
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

  // 마커 크기 (px) — 미방문은 작게, 방문은 intensity 따라 더 크게
  const size = visited ? 42 + intensity * 28 : 24;
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
        <span className="text-[14px] font-extrabold text-white drop-shadow tabular-nums">
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
        className={`mt-1.5 px-2 py-1 rounded-md text-[12px] font-extrabold leading-none
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
  profile,
  onClose,
  onOpenReport,
  onOpenCinematic,
}: {
  residence: Residence;
  record: RegionRecord | undefined;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  onClose: () => void;
  onOpenReport: () => void;
  onOpenCinematic?: () => void;
}) {
  const hasCinematic = !!record?.migrationReport;
  const visited = (record?.visitCount ?? 0) > 0;
  const score = record?.score ?? 0;
  // 적합도 v2 — profile 있으면 정확한 브레이크다운, 없으면 옛 lifestyle 기반 number
  const match = profile
    ? calculateMatchV2(profile, residence, record)
    : { total: calculateMatch(lifestyle, residence, record), potential: 0, alignment: 0, pickStats: { totalPicks: 0, alignedPicks: 0 } };
  const completedIds = new Set(record?.completedMissionIds ?? []);
  const completedCount = completedIds.size;
  const allDone = isAllMissionsDone(record);

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

        {/* 점수 바 — 축적 점수 / 적합도(브레이크다운 포함) */}
        <div className="mt-3 space-y-2.5">
          <Bar label="축적 점수" value={score} max={300} tone="primary" suffix="점" />
          <Bar label="적합도" value={match.total} max={100} tone="nature" suffix="%" />
          {/* 브레이크다운 — profile이 있을 때만 의미 있음 */}
          {profile && (
            <div className="flex items-center justify-between text-[10.5px] text-ink-mute -mt-1.5 px-0.5">
              <span>
                잠재 매칭 <span className="text-ink-soft font-bold">{match.potential}</span>
                <span className="mx-1.5 text-cream-300">·</span>
                미션 정렬 <span className="text-ink-soft font-bold">{match.alignment}%</span>
              </span>
              <span className="tabular-nums">
                {match.pickStats.alignedPicks.toFixed(1)}/{match.pickStats.totalPicks} 답
              </span>
            </div>
          )}
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

        {/* CTA — 시네마틱 리포트가 있으면 우선 노출 */}
        {hasCinematic && onOpenCinematic ? (
          <button
            type="button"
            onClick={onOpenCinematic}
            className="mt-4 w-full py-3.5 rounded-2xl
                       bg-gradient-to-r from-[#FFB400] to-[#FF7043]
                       text-white text-[14px] font-extrabold
                       shadow-soft active:scale-[0.99] transition"
          >
            🎬 이주 리포트 다시 보기
          </button>
        ) : (
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
        )}
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
