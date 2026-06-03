// 이주 리포트 화면 — PRD: 맞는 이유/우려 이유 + 핵심 지표 4개 + 지역 비교 + 공유 + 이주 결정
// 사용자가 모든 미션을 완료한 지역에 대해 의사결정을 돕는 정성/정량 리포트

import { motion } from "framer-motion";
import {
  residences,
  matchScore,
  type Residence,
  type LifeStyleType,
} from "../data/residences";
import { calculateMatch, type RegionRecord } from "../data/journey";
import { baseMissions } from "../data/missions";
import { missionInsights } from "../data/missionInsights";

type Props = {
  residence: Residence;
  record: RegionRecord;
  lifestyle: LifeStyleType | null;
  allProgress: Record<string, RegionRecord>;
  onBack: () => void;
  onDecideMove: () => void;
  onApplyResidence: (r: Residence) => void;
};

// 미션 카테고리별 가중치 — 핵심 지표 산출용
function calcMetrics(record: RegionRecord) {
  const done = new Set(record.completedMissionIds);
  const has = (id: string) => (done.has(id) ? 1 : 0);
  // 적응도: 완료 미션 수 기반
  const adaptation = Math.min(100, 55 + done.size * 6);
  // 인프라: hospital + transit + stats + pharmacy 미션 (현재 데이터엔 약국 별도 없음)
  const infra = Math.min(
    100,
    50 + (has("hospital") + has("transit") + has("stats")) * 17
  );
  // 관계: neighbor + story + routine
  const relation = Math.min(
    100,
    40 + (has("neighbor") + has("story") + has("routine")) * 20
  );
  // 비용감: cost + market
  const cost = Math.min(100, 50 + (has("cost") + has("market")) * 25);
  return { adaptation, infra, relation, cost };
}

export default function MigrationReportScreen({
  residence,
  record,
  lifestyle,
  allProgress,
  onBack,
  onDecideMove,
  onApplyResidence,
}: Props) {
  // 추천 레지던스 Top1-2: 본 지역 + 같은 matchType 우선
  const recommended: Residence[] = [
    residence,
    ...residences.filter(
      (r) => r.id !== residence.id && r.matchType === residence.matchType
    ),
  ].slice(0, 2);
  const metrics = calcMetrics(record);
  const match = calculateMatch(lifestyle, residence, record);

  // 맞는 이유 / 우려 이유 — 데이터에서 단순 규칙으로 도출
  const pros: string[] = [];
  const cons: string[] = [];
  if (match >= 85) pros.push("라이프스타일 유형과 잘 어울려요");
  if (metrics.adaptation >= 90) pros.push("생활 적응도가 매우 높아요");
  if (metrics.infra >= 80) pros.push("생활 인프라 접근성이 좋아요");
  if (metrics.relation >= 80) pros.push("주민 관계가 따뜻하게 형성됐어요");
  if (metrics.cost >= 80) pros.push("생활비 부담이 도시보다 가벼워요");
  if (pros.length === 0) pros.push("아직 확신할 만큼은 아니에요");

  if (metrics.infra < 70) cons.push("일부 인프라(병원/교통)는 더 확인해보세요");
  if (metrics.relation < 70) cons.push("주민 관계는 조금 더 시간이 필요해 보여요");
  if (metrics.cost < 70) cons.push("생활비 감각은 한 번 더 점검해보세요");
  if (cons.length === 0)
    cons.push("뚜렷한 우려 요소는 발견되지 않았어요");

  // 지역 비교 — 다른 방문 지역과 점수 비교
  const others = residences.filter(
    (r) => r.id !== residence.id && (allProgress[r.id]?.visitCount ?? 0) > 0
  );

  // 축적 — 사용자가 이 지역과 쌓아온 것
  const completedCount = record.completedMissionIds.length;
  const totalMissions = baseMissions.length;
  // 시작 적합도: 라이프스타일 매칭 베이스(70 or 50) — 미션 보너스/fitDelta 제외
  const baseMatch =
    lifestyle && lifestyle === residence.matchType ? 70 : 50;
  const matchDelta = match - baseMatch;

  // 완료한 미션에서 얻은 발견 — 순서는 baseMissions 정의 순서
  const discoveredInsights = baseMissions
    .filter((m) => record.completedMissionIds.includes(m.id))
    .map((m) => ({ missionId: m.id, insight: missionInsights[m.id] }))
    .filter((x) => x.insight);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      <header className="pt-10 px-5 flex items-center gap-3">
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
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-[11px] font-bold uppercase tracking-widest">
            이주 리포트
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            {residence.region}, 어떨까요?
          </h1>
        </div>
        <button
          type="button"
          aria-label="공유"
          className="w-9 h-9 rounded-full bg-white shadow-soft text-ink text-base
                     flex items-center justify-center"
        >
          ↗
        </button>
      </header>

      <main className="flex-1 px-5 mt-4 pb-6 overflow-y-auto space-y-4">
        {/* 한 줄 요약 */}
        <section className="bg-gradient-to-br from-nature-50 to-primary-50
                            border border-nature-200 rounded-2xl p-4 shadow-soft">
          <p className="text-[10px] text-nature-600 font-bold uppercase tracking-widest">
            한 줄 요약
          </p>
          <p className="mt-1 text-ink text-[14px] leading-relaxed font-semibold">
            {match >= 85
              ? `${residence.region}은 당신의 라이프스타일과 잘 맞아요. 적응도 ${metrics.adaptation}%, 적합도 ${match}%로 충분히 살아볼 만한 지역이에요.`
              : `${residence.region} 생활을 8가지 미션으로 체험했어요. 적합도 ${match}%로 가볍게 검토해보면 좋아요.`}
          </p>
        </section>

        {/* 나의 축적 — 사용자가 이 지역과 쌓아온 것 */}
        <section>
          <h2 className="text-ink text-[15px] font-extrabold mb-2">
            {residence.region}과 함께한 시간
          </h2>
          <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft">
            <div className="grid grid-cols-3 gap-2 text-center">
              <AccumStat
                label="방문"
                value={`${record.visitCount}`}
                suffix="번"
                tone="primary"
              />
              <AccumStat
                label="완료 미션"
                value={`${completedCount}`}
                suffix={`/${totalMissions}`}
                tone="nature"
              />
              <AccumStat
                label="축적 점수"
                value={`${record.score}`}
                suffix="점"
                tone="ink"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-[12px]">
              <span className="text-ink-soft font-bold">적합도 변화</span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-ink-mute tabular-nums">{baseMatch}%</span>
                <span className="text-ink-mute">→</span>
                <span className="text-primary font-extrabold tabular-nums">
                  {match}%
                </span>
                {matchDelta > 0 && (
                  <span className="text-nature-600 text-[11px] font-extrabold">
                    +{matchDelta}
                  </span>
                )}
              </span>
            </div>
          </div>
        </section>

        {/* 핵심 지표 4개 */}
        <section>
          <h2 className="text-ink text-[15px] font-extrabold mb-2">핵심 지표</h2>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="적응도" value={metrics.adaptation} tone="nature" emoji="🌱" />
            <MetricCard label="인프라" value={metrics.infra} tone="primary" emoji="🏥" />
            <MetricCard label="관계 온도" value={metrics.relation} tone="warm" emoji="🤝" />
            <MetricCard label="비용감" value={metrics.cost} tone="sky" emoji="💰" />
          </div>
        </section>

        {/* 미션에서 발견한 것 — 사용자가 알게 된 핵심 정보 요약 */}
        {discoveredInsights.length > 0 && (
          <section>
            <h2 className="text-ink text-[15px] font-extrabold mb-2">
              미션에서 발견한 것
            </h2>
            <div className="bg-white border border-cream-200 rounded-2xl shadow-soft divide-y divide-cream-200">
              {discoveredInsights.map(({ missionId, insight }) => (
                <InsightRow key={missionId} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* 맞는 이유 / 우려 이유 */}
        <section className="grid grid-cols-1 gap-2">
          <ReasonCard
            title="맞는 이유"
            items={pros}
            tone="pro"
          />
          <ReasonCard
            title="우려 이유"
            items={cons}
            tone="con"
          />
        </section>

        {/* 지역 비교 */}
        {others.length > 0 && (
          <section>
            <h2 className="text-ink text-[15px] font-extrabold mb-2">
              다른 지역과 비교
            </h2>
            <div className="space-y-2">
              <ComparisonRow
                residence={residence}
                record={record}
                lifestyle={lifestyle}
                isFocus
              />
              {others.map((r) => (
                <ComparisonRow
                  key={r.id}
                  residence={r}
                  record={allProgress[r.id]!}
                  lifestyle={lifestyle}
                  isFocus={false}
                />
              ))}
            </div>
          </section>
        )}

        {/* 추천 레지던스 — Top 1~2 + 신청 CTA */}
        <section>
          <h2 className="text-ink text-[15px] font-extrabold mb-2">
            이 흐름에 어울리는 레지던스
          </h2>
          <div className="space-y-2">
            {recommended.map((r) => (
              <RecommendedRow
                key={r.id}
                residence={r}
                lifestyle={lifestyle}
                onApply={() => onApplyResidence(r)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* 하단 CTA */}
      <footer className="px-5 pb-6 pt-3 border-t border-cream-200 bg-white/80 backdrop-blur">
        <motion.button
          type="button"
          onClick={onDecideMove}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-extrabold
                     shadow-soft transition"
        >
          이 지역으로 이주할게요 🎉
        </motion.button>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 w-full py-2.5 rounded-2xl bg-white text-ink-soft text-[12px] font-bold
                     border border-cream-200"
        >
          좀 더 둘러볼게요
        </button>
      </footer>
    </div>
  );
}

// =====================================================================
// 서브 컴포넌트
// =====================================================================

// 축적 카드 안의 작은 stat — 방문/미션/점수
function AccumStat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix: string;
  tone: "primary" | "nature" | "ink";
}) {
  const text =
    tone === "primary"
      ? "text-primary"
      : tone === "nature"
      ? "text-nature-600"
      : "text-ink";
  return (
    <div>
      <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className={`mt-0.5 ${text}`}>
        <span className="text-[20px] font-extrabold tabular-nums">{value}</span>
        <span className="text-[12px] font-bold ml-0.5">{suffix}</span>
      </p>
    </div>
  );
}

// 미션에서 발견한 것 — 한 줄 정보
function InsightRow({
  insight,
}: {
  insight: import("../data/missionInsights").MissionInsight;
}) {
  return (
    <div className="px-3 py-2.5 flex items-start gap-2.5">
      <span className="text-lg shrink-0 mt-0.5" aria-hidden>
        {insight.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink-mute text-[10px] font-bold uppercase tracking-wider">
          {insight.category}
        </p>
        <p className="text-ink text-[13px] font-extrabold leading-snug mt-0.5">
          {insight.headline}
        </p>
        <p className="text-ink-soft text-[11px] leading-relaxed mt-0.5">
          {insight.detail}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
  emoji,
}: {
  label: string;
  value: number;
  tone: "nature" | "primary" | "warm" | "sky";
  emoji: string;
}) {
  const bg = {
    nature: "from-nature-50 to-white border-nature-200",
    primary: "from-primary-50 to-white border-primary-200",
    warm: "from-[#FFF3EE] to-white border-[#FFD7C0]",
    sky: "from-[#E8F0F4] to-white border-[#C0DBE8]",
  }[tone];
  const text = {
    nature: "text-nature-600",
    primary: "text-primary",
    warm: "text-[#E55A30]",
    sky: "text-[#5A8AA8]",
  }[tone];
  return (
    <div
      className={`bg-gradient-to-br border rounded-xl p-3 ${bg}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base" aria-hidden>
          {emoji}
        </span>
        <p className="text-ink text-[11px] font-bold">{label}</p>
      </div>
      <p className={`mt-1 text-[22px] font-extrabold tabular-nums ${text}`}>
        {value}
        <span className="text-[12px] font-bold">%</span>
      </p>
      <div className="mt-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
        <motion.div
          className={`h-full ${text.replace("text-", "bg-")}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function ReasonCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "pro" | "con";
}) {
  const isPro = tone === "pro";
  return (
    <div
      className={`rounded-2xl p-3.5 border shadow-soft
        ${
          isPro
            ? "bg-nature-50 border-nature-200"
            : "bg-[#FFF3EE] border-[#FFD7C0]"
        }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-widest
          ${isPro ? "text-nature-600" : "text-[#E55A30]"}`}
      >
        {isPro ? "👍" : "⚠️"} {title}
      </p>
      <ul className="mt-2 space-y-1">
        {items.map((it) => (
          <li
            key={it}
            className="text-ink text-[13px] leading-relaxed flex items-start gap-1.5"
          >
            <span className={isPro ? "text-nature-600" : "text-[#E55A30]"}>
              ·
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparisonRow({
  residence,
  record,
  lifestyle,
  isFocus,
}: {
  residence: Residence;
  record: RegionRecord;
  lifestyle: LifeStyleType | null;
  isFocus: boolean;
}) {
  const match = calculateMatch(lifestyle, residence, record);
  const completedCount = record.completedMissionIds.length;
  return (
    <div
      className={`rounded-2xl p-3 flex items-center gap-3 border
        ${isFocus ? "bg-primary-50 border-primary" : "bg-white border-cream-200"}`}
    >
      <span className="text-xl shrink-0" aria-hidden>
        {residence.themeEmoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[13px] font-extrabold leading-tight">
          {residence.region}
        </p>
        <p className="text-ink-mute text-[11px]">
          축적 {record.score}점 · 미션 {completedCount}/8
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-ink-mute font-bold">적합도</p>
        <p
          className={`text-[14px] font-extrabold tabular-nums
            ${isFocus ? "text-primary" : "text-nature-600"}`}
        >
          {match}%
        </p>
      </div>
    </div>
  );
}

function RecommendedRow({
  residence,
  lifestyle,
  onApply,
}: {
  residence: Residence;
  lifestyle: LifeStyleType | null;
  onApply: () => void;
}) {
  const score = matchScore(lifestyle, residence);
  return (
    <div className="rounded-2xl p-3 flex items-center gap-3 border
                    bg-white border-cream-200 shadow-soft">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
                      bg-gradient-to-br from-primary-50 to-nature-50 border border-primary-200">
        {residence.themeEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-ink text-[13px] font-extrabold truncate">
            {residence.name}
          </p>
          {residence.hasSupport && (
            <span className="px-1.5 py-0.5 rounded-full bg-nature-50 text-nature-600
                             text-[9px] font-extrabold whitespace-nowrap">
              지원금
            </span>
          )}
        </div>
        <p className="text-ink-soft text-[11px] mt-0.5">
          📍 {residence.region} · 매칭 {score}%
          {residence.price !== undefined && ` · 월 ${residence.price}만원~`}
        </p>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="shrink-0 px-3 py-2 rounded-full bg-primary text-white
                   text-[11px] font-extrabold shadow-soft active:scale-[0.99]"
      >
        신청하기
      </button>
    </div>
  );
}
