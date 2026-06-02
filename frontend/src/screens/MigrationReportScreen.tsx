// 이주 리포트 화면 — PRD: 맞는 이유/우려 이유 + 핵심 지표 4개 + 지역 비교 + 공유 + 이주 결정
// 사용자가 모든 미션을 완료한 지역에 대해 의사결정을 돕는 정성/정량 리포트

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import {
  residences,
  matchScore,
  type Residence,
  type LifeStyleType,
} from "../data/residences";
import { calculateMatch, type RegionRecord } from "../data/journey";
import { lifestyleMeta } from "../data/quiz";

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

// 라이프스타일 유형별 자격증 카드 테마 (파스텔 그라데이션 + 액센트)
type CardTheme = {
  cardBg: string;
  ringBg: string;
  ringInner: string;
  accent: string;
  title: string;
  divider: string;
  stamp: string;
};

const LIFESTYLE_THEME: Record<LifeStyleType, CardTheme> = {
  자연탐험형: {
    cardBg: "linear-gradient(160deg,#E9F6EC 0%,#DBEFE2 55%,#EAF7EE 100%)",
    ringBg: "linear-gradient(160deg,#BFE6C8,#9FD8AE)",
    ringInner: "rgba(255,255,255,0.8)",
    accent: "#3E9D62",
    title: "#2F7A4B",
    divider: "rgba(62,157,98,0.22)",
    stamp: "#3E9D62",
  },
  레저형: {
    cardBg: "linear-gradient(160deg,#E6F2FB 0%,#D7E9F8 55%,#EAF4FC 100%)",
    ringBg: "linear-gradient(160deg,#B7DBF3,#94C4E8)",
    ringInner: "rgba(255,255,255,0.8)",
    accent: "#3B7FB3",
    title: "#2E6A98",
    divider: "rgba(59,127,179,0.22)",
    stamp: "#3B7FB3",
  },
  디지털노마드형: {
    cardBg: "linear-gradient(160deg,#EFEBFC 0%,#E4DCF8 55%,#F1ECFD 100%)",
    ringBg: "linear-gradient(160deg,#CFC2F0,#B7A4E6)",
    ringInner: "rgba(255,255,255,0.8)",
    accent: "#6E54C8",
    title: "#5840A8",
    divider: "rgba(110,84,200,0.2)",
    stamp: "#6E54C8",
  },
  집돌이형: {
    cardBg: "linear-gradient(160deg,#FFF1E5 0%,#FFE6D2 55%,#FFF2E8 100%)",
    ringBg: "linear-gradient(160deg,#FFD3AD,#FBBE8C)",
    ringInner: "rgba(255,255,255,0.8)",
    accent: "#E07B36",
    title: "#C26224",
    divider: "rgba(224,123,54,0.22)",
    stamp: "#E07B36",
  },
};

// 거주지 id 기반 결정적 자격증 번호 (5자리)
function reportNumber(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return String(10000 + (h % 90000));
}

// 캐릭터 링 둘레에 흩뿌릴 화환 장식 점(베리) 좌표 — 링 박스 기준 %
const WREATH_DOTS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + 50 * Math.cos(a), y: 50 + 50 * Math.sin(a) };
});

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

  // ── 자격증 카드용 데이터 ──────────────────────────
  const cardType: LifeStyleType = lifestyle ?? residence.matchType;
  const meta = lifestyleMeta[cardType];
  const theme = LIFESTYLE_THEME[cardType];
  const reportNo = reportNumber(residence.id);
  const today = new Date();
  const issueDate = `${today.getFullYear()}.${String(
    today.getMonth() + 1
  ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  // 카드를 PNG로 저장
  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `청풍_이주리포트_${residence.region}.png`;
      link.href = dataUrl;
      link.click();
      showToast("이미지를 저장했어요");
    } catch {
      showToast("이미지 저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  // 이벤트 공유 (Web Share API → 클립보드 폴백)
  const handleShare = async () => {
    const text = `청풍에서 ${residence.region} 귀촌을 체험했어요! 나의 유형은 '${cardType}', 적합도 ${match}%`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "청풍 이주 리포트", text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast("공유 문구를 복사했어요");
      }
    } catch {
      /* 사용자가 공유를 취소한 경우 — 무시 */
    }
  };

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
      </header>

      <main className="flex-1 px-5 mt-4 pb-6 overflow-y-auto space-y-4">
        {/* ===== 귀촌 자격증 카드 (라이프스타일 유형 중심) ===== */}
        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* 캡처 대상 — 애니메이션 transform 영향 없는 정적 카드 */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-[28px] px-6 py-7 shadow-soft"
            style={{ background: theme.cardBg }}
          >
            {/* 대각선 인증 스탬프 워터마크 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div
                className="rotate-[-18deg] rounded-2xl border-2 px-6 py-3 text-center"
                style={{ borderColor: theme.stamp, opacity: 0.12 }}
              >
                <p
                  className="text-[16px] font-black tracking-[0.2em]"
                  style={{ color: theme.stamp }}
                >
                  CHEONGPUNG
                </p>
                <p
                  className="text-[9px] font-bold tracking-[0.3em]"
                  style={{ color: theme.stamp }}
                >
                  RESIDENCE REPORT
                </p>
              </div>
            </div>

            {/* 상단: 배지 + 자격증 번호 */}
            <div className="relative flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full bg-white/70 text-[12px] font-extrabold"
                style={{ color: theme.accent }}
              >
                귀촌 자격증
              </span>
              <span
                className="text-[13px] font-bold tabular-nums"
                style={{ color: theme.accent }}
              >
                청풍번호. {reportNo}
              </span>
            </div>

            {/* 캐릭터 링 (화환 느낌) */}
            <div className="relative mt-6 flex justify-center">
              <div
                className="relative w-[150px] h-[150px] rounded-full flex items-center justify-center"
                style={{
                  background: theme.ringBg,
                  boxShadow: `inset 0 0 0 8px ${theme.ringInner}`,
                }}
              >
                {/* 화환 장식 베리 — 링 둘레에 번갈아 점 배치 */}
                {WREATH_DOTS.map((d, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      transform: "translate(-50%,-50%)",
                      background: i % 2 ? theme.accent : "#E8765A",
                      opacity: 0.85,
                    }}
                  />
                ))}
                <div className="w-[110px] h-[110px] rounded-full bg-white/85 flex items-center justify-center shadow-inner">
                  <span className="text-[64px] leading-none" aria-hidden>
                    {meta.emoji}
                  </span>
                </div>
              </div>
            </div>

            {/* 유형명 + 싱크로율 한 줄 강조 */}
            <div className="relative mt-5 text-center">
              <h2
                className="text-[27px] font-extrabold leading-tight"
                style={{ color: theme.title }}
              >
                {cardType}
              </h2>
              <p className="mt-2 text-[14px] text-ink-soft">
                {residence.region}와 싱크로율{" "}
                <span
                  className="text-[15px] font-extrabold"
                  style={{ color: theme.accent }}
                >
                  {match}%
                </span>
              </p>
            </div>

            {/* 디바이더 (티켓 절취선 느낌) */}
            <div
              className="relative my-5 border-t border-dashed"
              style={{ borderColor: theme.divider }}
            />

            {/* 정보 행 — 담당 지역 / 발급일 2개만 */}
            <div className="relative space-y-2.5">
              <CardRow label="담당 지역" value={residence.region} color={theme.title} />
              <CardRow label="발급일" value={issueDate} color={theme.title} />
            </div>

            {/* 브랜드 */}
            <div className="relative mt-6 flex items-center justify-center gap-1.5 opacity-80">
              <span className="text-[15px]" aria-hidden>
                🍃
              </span>
              <span
                className="text-[15px] font-extrabold tracking-tight"
                style={{ color: theme.title }}
              >
                청풍
              </span>
            </div>
          </div>
        </motion.section>

        {/* 이미지 저장 + 이벤트 공유 */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white
                       border border-cream-200 text-ink-soft text-[13px] font-bold
                       shadow-soft active:scale-[0.99] transition disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {saving ? "저장 중..." : "이미지 저장"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary
                       text-white text-[13px] font-extrabold shadow-soft
                       active:scale-[0.99] transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 9V5l7 7-7 7v-4C7 14 4 17 3 20c0-7 4-11 11-11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            이벤트 공유
          </button>
        </div>

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

      {/* 저장/공유 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50
                       px-4 py-2.5 rounded-full bg-ink/90 text-white text-[13px] font-bold
                       shadow-soft whitespace-nowrap"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 자격증 카드 정보 행 — 라벨(좌) / 값(우)
function CardRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft text-[12px] font-semibold">{label}</span>
      <span className="text-[15px] font-extrabold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// =====================================================================
// 서브 컴포넌트
// =====================================================================

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
