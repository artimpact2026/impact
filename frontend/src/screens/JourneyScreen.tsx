// 탭2 나의 여정 — 한반도 아트지도 위에 다녀온 지역 마커
// 우상단 토글로 "축적 점수"/"적합도" 보기 전환
// 마커 클릭 시 하단 바텀시트(상세 + 미션 리스트 + 이주 리포트 CTA)

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import { residences, type Residence, type LifeStyleType } from "../data/residences";
import { baseMissions } from "../data/missions";
import { ITEMS, type Item } from "../data/items";
import {
  calculateMatch,
  calculateMatchV2,
  isAllMissionsDone,
  type RegionRecord,
} from "../data/journey";
import { type LifestyleProfile } from "../data/lifestyle";
import type { SavedQuote } from "../data/quotes";
import { TabHeader } from "../components/TabLayout";

type ViewMode = "score" | "match";

type Props = {
  regionProgress: Record<string, RegionRecord>;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  onOpenReport: (residence: Residence) => void;
  // 이주 리포트 시네마틱 — 캐싱된 리포트가 있을 때만 노출
  onOpenCinematic?: (residence: Residence) => void;
  // 수집한 기념품 — App.tsx에서 영속 state로 관리, 표시만 함
  acquiredItems?: Item[];
  // 기억한 말들 — NPC 발언 중 사용자가 직접 저장한 인용구. 기념품과 같은 흔적 묶음.
  savedQuotes?: SavedQuote[];
};

export default function JourneyScreen({
  regionProgress,
  lifestyle,
  profile,
  onOpenReport,
  onOpenCinematic,
  acquiredItems = [],
  savedQuotes = [],
}: Props) {
  const [view, setView] = useState<ViewMode>("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    // 외곽: TabLayout 가 못 쓰는 구조(바텀시트 absolute) → height 직접 계산
    <div
      className="relative flex flex-col bg-cream"
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* 스크롤 영역 — pb 는 안쪽 마지막 섹션의 호흡 공간만 (nav clearance 는 height 에서 처리) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 페이지 헤더 — TabLayout 과 동일 톤 (px-5 pt-6 pb-3 + 10px label + 24px title) */}
        <TabHeader preLabel="Travel" title="쌓인 시간" />

        {/* === Section rhythm — 모든 메이저 섹션 24px 간격 (mt-6) === */}
        <div className="pb-8">
          {/* ① 수집한 기념품 — 포켓몬 카드 톤 가로 스크롤 갤러리 */}
          <section className="mt-6 px-4">
            <TrophyCardScroll acquiredItems={acquiredItems} />
          </section>

          {/* ② 기억한 말 — 미션 중 저장한 NPC 인용구. 기념품과 같은 "흔적" 묶음. */}
          <section className="mt-6 px-4">
            <header className="flex items-end justify-between px-1 mb-2">
              <div>
                <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.18em]">
                  Memorized
                </p>
                <h3 className="mt-0.5 text-ink text-[15px] font-extrabold">
                  기억한 말
                </h3>
              </div>
              {savedQuotes.length > 0 && (
                <span className="text-[11px] font-extrabold text-primary tabular-nums">
                  🔖 {savedQuotes.length}
                </span>
              )}
            </header>
            <QuoteList quotes={savedQuotes} />
          </section>

          {/* ③ 지도 카드 — 토글 + 한반도 + 범례를 한 카드로 묶어 일체감 ↑ */}
          <section className="mt-6 px-4">
            {/* 섹션 헤더 — flex L/R 정렬 */}
            <header className="flex items-end justify-between px-1 mb-2">
              <div>
                <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.18em]">
                  Map
                </p>
                <h3 className="mt-0.5 text-ink text-[15px] font-extrabold">
                  다녀온 지도
                </h3>
              </div>
              <p className="text-[10.5px] text-ink-mute leading-tight max-w-[140px] text-right">
                보기 모드에 따라
                <br />
                마커 크기·색이 달라져요
              </p>
            </header>

            {/* 카드 컨테이너 */}
            <div className="bg-white border border-cream-200 rounded-3xl shadow-soft overflow-hidden">
              {/* === 토글 — segmented control, 카드 상단 풀너비 grid === */}
              <div
                role="tablist"
                aria-label="지도 보기 모드"
                className="p-1.5 grid grid-cols-2 gap-1 bg-cream-50 border-b border-cream-100"
              >
                <ToggleBtn
                  label="축적 점수"
                  sub={view === "score" ? "주황" : undefined}
                  active={view === "score"}
                  onClick={() => setView("score")}
                />
                <ToggleBtn
                  label="적합도"
                  sub={view === "match" ? "초록" : undefined}
                  active={view === "match"}
                  onClick={() => setView("match")}
                />
              </div>

              {/* 지도 본체 */}
              <div className="flex items-start justify-center px-3 pt-3 pb-2">
                <div className="w-full max-w-[320px]">
                  <KoreaMap>
                    {visitedSorted.length >= 2 && (
                      <JourneyPath residences={visitedSorted} />
                    )}
                    {visitedSorted.map((r) => (
                      <ArtTraces
                        key={`traces-${r.id}`}
                        residence={r}
                        record={regionProgress[r.id]}
                      />
                    ))}
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
                    {visitedSorted.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-ink-mute text-[12px] font-bold bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-soft">
                          떠난 곳이 여기에 한 점씩 자리잡아요
                        </p>
                      </div>
                    )}
                  </KoreaMap>
                </div>
              </div>

              {/* 범례 — flex L / gradient / R */}
              <div className="px-4 pb-3 pt-1 flex items-center gap-2 text-[10px] font-bold">
                <span className="text-ink-mute">낮음</span>
                <span
                  aria-hidden
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    background:
                      view === "score"
                        ? "linear-gradient(to right, #FFE4D5, #FF7043)"
                        : "linear-gradient(to right, #DDEFDD, #66BB6A)",
                  }}
                />
                <span className="text-ink-mute">높음</span>
              </div>
            </div>
          </section>

          {/* ④ 이주 리포트 카드 */}
          <section className="mt-6 px-4">
            <header className="flex items-baseline justify-between px-1 mb-2">
              <div>
                <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.18em]">
                  Report
                </p>
                <h3 className="mt-0.5 text-ink text-[15px] font-extrabold">
                  이주 리포트
                </h3>
              </div>
              {reportResidences.length > 0 && (
                <span className="text-[11px] text-primary font-extrabold">
                  {reportResidences.length}개
                </span>
              )}
            </header>
            <div className="space-y-2">
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
            </div>
          </section>
        </div>
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
// 수집한 기념품 — 포켓몬 카드 톤 가로 스크롤 갤러리
//   · 전체 카드 = ITEMS 카탈로그 (10장 고정: 영월 5 + 강화 5)
//   · 획득: 살구 그라디언트 + 광채 + 이모지 + 이름·지역. 스프링 등장.
//   · 미획득: 어둠 그라디언트 + "?" — 몇 장 남았는지 궁금증 유발.
//   · 분모는 ITEMS.length 자동 — 나중에 마을 추가돼도 따라감.
// =====================================================================

// 지역 id → 지역명 빠른 매핑
const REGION_BY_ID: Record<string, string> = Object.fromEntries(
  residences.map((r) => [r.id, r.region])
);

const TROPHY_GRID_SIZE = 9;

// 사용자 컬렉션 + ITEMS 카탈로그를 합쳐 9칸을 동적 구성.
//   1) 사용자가 실제 획득한 아이템부터 채움 (공통 보너스의 합성 id 도 그대로 살림)
//   2) 남은 칸은 ITEMS 카탈로그 중 미획득한 것들로 잠금 카드 채움
//   3) 중복 방지: (missionId, residenceId) 키로 식별
function buildTrophyDisplay(
  acquiredItems: Item[]
): Array<{ item: Item; acquired: boolean }> {
  const acquiredKey = (it: Item) => `${it.missionId}::${it.residenceId}`;
  const acquiredKeys = new Set(acquiredItems.map(acquiredKey));

  const filled = acquiredItems
    .slice(0, TROPHY_GRID_SIZE)
    .map((it) => ({ item: it, acquired: true }));

  const remainingSlots = TROPHY_GRID_SIZE - filled.length;
  const locked = ITEMS.filter((it) => !acquiredKeys.has(acquiredKey(it)))
    .slice(0, remainingSlots)
    .map((it) => ({ item: it, acquired: false }));

  return [...filled, ...locked];
}

function TrophyCardScroll({ acquiredItems }: { acquiredItems: Item[] }) {
  const display = buildTrophyDisplay(acquiredItems);
  const collected = Math.min(acquiredItems.length, TROPHY_GRID_SIZE);

  return (
    <>
      {/* 섹션 헤더 — Map/Report 카드와 동일한 톤 */}
      <header className="flex items-end justify-between px-1 mb-2">
        <div>
          <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.18em]">
            Trophy
          </p>
          <h3 className="mt-0.5 text-ink text-[15px] font-extrabold">
            수집한 기념품
          </h3>
        </div>
        <span className="text-[11px] font-extrabold text-primary tabular-nums">
          ✨ {collected}/{TROPHY_GRID_SIZE}
        </span>
      </header>

      {/* 3x3 그리드 — max-w로 카드 폭 줄이고 gap-3 으로 사이 여백 조금 더 */}
      <div className="grid grid-cols-3 gap-3 max-w-[320px] mx-auto">
        {display.map(({ item, acquired }, i) => (
          <TrophyCard
            key={`${item.missionId}::${item.residenceId}::${i}`}
            item={item}
            acquired={acquired}
            index={i}
          />
        ))}
      </div>
    </>
  );
}

function TrophyCard({
  item,
  acquired,
  index,
}: {
  item: Item;
  acquired: boolean;
  index: number;
}) {
  const regionName = REGION_BY_ID[item.residenceId] ?? item.residenceId;

  // 등장 모션 — 포켓몬 카드 뽑는 느낌. 스태거 0.07s.
  const motionProps = {
    initial: { opacity: 0, scale: 0.82, y: 14, rotate: -3 },
    animate: { opacity: 1, scale: 1, y: 0, rotate: 0 },
    transition: {
      type: "spring" as const,
      damping: 13,
      stiffness: 200,
      delay: 0.08 + index * 0.07,
    },
  };

  if (!acquired) {
    return (
      <motion.div
        {...motionProps}
        className="aspect-[3/4] rounded-2xl overflow-hidden
                   border border-dashed border-ink/15 relative"
        style={{
          background: "linear-gradient(135deg, #3E2C20 0%, #5A4838 60%, #4A3326 100%)",
          boxShadow: "0 4px 10px -2px rgba(62,44,32,0.25)",
        }}
        aria-label="미발견 기념품"
      >
        {/* 별 장식 — 어둠 속 미세한 반짝임 */}
        <span aria-hidden className="absolute top-2 right-2 text-white/35 text-[9px]">
          ✦
        </span>
        <span aria-hidden className="absolute top-6 left-3 text-white/25 text-[7px]">
          ✦
        </span>
        <span aria-hidden className="absolute bottom-10 right-4 text-white/30 text-[6px]">
          ✦
        </span>

        {/* 가운데 큰 ? */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className="text-white/25 leading-none select-none"
            style={{ fontSize: 48, fontWeight: 900 }}
          >
            ?
          </span>
        </div>

        {/* 하단 라벨 */}
        <div className="absolute bottom-0 left-0 right-0 py-1 text-center
                        bg-black/25 backdrop-blur-[2px]">
          <p className="text-white/65 text-[7.5px] font-extrabold tracking-wider">
            미발견
          </p>
        </div>
      </motion.div>
    );
  }

  // 획득 카드 — 살구 3톤 그라디언트 + 광채 + 이모지
  return (
    <motion.div
      {...motionProps}
      className="aspect-[3/4] rounded-2xl overflow-hidden
                 bg-white border border-cream-200 shadow-soft relative flex flex-col"
      aria-label={`${item.name} 기념품`}
    >
      {/* 이모지 영역 — 살구 그라디언트, 전체의 62% */}
      <div
        className="relative flex-[62] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #FFF5E6 0%, #FFE4C9 50%, #FFD4A8 100%)",
        }}
      >
        {/* 광채 — 중앙 흰 광 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.55) 0%, transparent 62%)",
          }}
        />

        {/* 상단 좌측 라벨 — "기념품" */}
        <span
          className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded
                     bg-white/75 text-ink-soft text-[6px] font-extrabold tracking-wide"
        >
          기념품
        </span>
        {/* 상단 우측 번호 */}
        <span className="absolute top-0.5 right-1 text-primary text-[7px] font-extrabold tabular-nums">
          #{String(index + 1).padStart(2, "0")}
        </span>

        {/* 이모지 본체 */}
        <span
          aria-hidden
          className="relative text-[36px] leading-none select-none"
          style={{ filter: "drop-shadow(0 2px 3px rgba(255,112,67,0.25))" }}
        >
          {item.emoji}
        </span>
      </div>

      {/* 하단 텍스트 영역 — 전체의 38% */}
      <div className="flex-[38] px-1 pt-0.5 pb-1 bg-cream-50 border-t border-cream-100">
        <p className="text-ink text-[9.5px] font-extrabold leading-tight line-clamp-2">
          {item.name}
        </p>
        <p className="mt-0.5 text-ink-mute text-[8.5px] font-bold truncate">
          {regionName}
        </p>
      </div>
    </motion.div>
  );
}

// =====================================================================
// 토글 버튼
// =====================================================================

function ToggleBtn({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  // 선택 상태일 때 라벨 뒤에 작게 붙는 보조 텍스트 (옵션)
  sub?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      // segmented control — 비활성은 투명(컨테이너 회색 노출),
      // 활성은 흰 알약 + 색 텍스트 + ring + shadow 로 강한 대조
      className={`relative py-2.5 rounded-full text-[13px] font-extrabold transition-all duration-200
        inline-flex items-center justify-center gap-1
        ${
          active
            ? "bg-white text-primary shadow-[0_2px_8px_-2px_rgba(255,112,67,0.35)] ring-1 ring-primary/25"
            : "bg-transparent text-ink-mute hover:text-ink-soft"
        }`}
    >
      <span>{label}</span>
      {sub && active && (
        <span aria-hidden className="text-[10px] font-bold opacity-60">
          · {sub}
        </span>
      )}
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

// =====================================================================
// QuoteList — 사용자가 직접 저장한 NPC 발언 컬렉션
//   · 미저장 시: 안내 빈 상태
//   · 저장 시: 인용 카드 세로 리스트 — 발언자 + 큰따옴표 + 마을·미션 메타
// =====================================================================
function QuoteList({ quotes }: { quotes: SavedQuote[] }) {
  if (quotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-cream-200 shadow-soft
                   p-6 text-center"
      >
        <p className="text-3xl" aria-hidden>
          🔖
        </p>
        <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
          마음에 닿는 말을 만나면
          <br />
          말풍선 옆 🔖 를 눌러 기억해 보세요.
        </p>
      </motion.div>
    );
  }
  return (
    <div className="space-y-2">
      {quotes.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
          className="bg-white rounded-2xl border border-cream-200 shadow-soft
                     px-4 py-3.5 relative overflow-hidden"
        >
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
          />
          <p className="text-ink-soft text-[13px] leading-relaxed italic pl-2">
            <span aria-hidden className="text-primary text-[18px] font-serif mr-0.5">
              "
            </span>
            {q.text}
            <span aria-hidden className="text-primary text-[18px] font-serif ml-0.5">
              "
            </span>
          </p>
          <p className="mt-2 text-ink-mute text-[10.5px] pl-2">
            <span aria-hidden className="mr-1">
              {q.speakerEmoji}
            </span>
            <span className="font-bold">{q.speaker}</span>
            <span className="opacity-50 mx-1.5">·</span>
            <span>{q.residenceRegion}</span>
            <span className="opacity-50 mx-1.5">·</span>
            <span>{q.missionTitle}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}
