// 하루 요약 리포트 — 미션을 일정 수 완료 후 노출
// 상단 캐릭터/말풍선, 동선 타임라인(러닝 앱 스타일), 점수 카운트업, 인사이트, 2분할 CTA

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Character from "../components/Character";
import { baseMissions, type Mission } from "../data/missions";

type Props = {
  region: string;
  completedIds: Set<string>;
  totalScore: number;       // 누적 점수
  todayScore: number;       // 오늘 얻은 점수
  prevMatch: number;        // 변화 전 적합도
  newMatch: number;         // 변화 후 적합도
  // 8개 미션 모두 완료 시 활성 — 이주 결정 리포트 진입
  allMissionsDone: boolean;
  onSeeReport: () => void;
  onSeeResidences: () => void;
  onSeeJourney: () => void;
  onClose: () => void;
};

const WALK_TIMES_MIN = [4, 6, 5, 3, 7, 4, 6];
const DISTANCE_KM = 2.3;
const TOTAL_MIN = 35;

// 미션 완료에 따른 자동 인사이트 (2-3줄)
function buildInsights(completedIds: Set<string>): string[] {
  const has = (id: string) => completedIds.has(id);
  const out: string[] = [];
  if (has("cost") || has("market")) {
    out.push(
      "생활비를 꼼꼼히 확인하셨네요. 이 지역 평균 지출은 예상보다 12% 낮아요."
    );
  }
  if (has("hospital") || has("transit")) {
    out.push("의료·교통 접근성을 직접 걸어 확인해 현실 감각이 높아졌어요.");
  }
  if (has("neighbor") || has("routine")) {
    out.push("주민과의 짧은 대화가 이 지역에 대한 친밀도를 높였어요.");
  }
  if (out.length === 0) {
    out.push("오늘 첫 발걸음을 떼셨어요. 내일도 천천히 걸어볼까요?");
  }
  return out.slice(0, 3);
}

export default function DailySummaryScreen({
  region,
  completedIds,
  todayScore,
  prevMatch,
  newMatch,
  allMissionsDone,
  onSeeReport,
  onSeeResidences,
  onSeeJourney,
  onClose,
}: Props) {
  const visited: Mission[] = baseMissions.filter((m) => completedIds.has(m.id));
  const insights = buildInsights(completedIds);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(
    today.getMonth() + 1
  ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-[11px] font-bold uppercase tracking-widest">
            오늘의 기록
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            {region} 하루 요약
          </h1>
        </div>
        <span className="text-ink-mute text-[11px] font-bold tabular-nums">
          {dateStr}
        </span>
      </header>

      <main className="flex-1 px-5 mt-4 pb-6 overflow-y-auto space-y-4">
        {/* 캐릭터 + 말풍선 */}
        <section className="text-center pt-2">
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-block bg-white border border-cream-200 rounded-2xl
                       px-4 py-2 shadow-soft mb-2 text-ink text-[13px] font-semibold"
          >
            "{region}에서의 하루, 알차게 보냈어요!"
          </motion.div>
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="mx-auto w-24"
          >
            <Character className="w-full h-auto" />
          </motion.div>
          <div className="w-20 h-1.5 rounded-full bg-nature-200/60 -mt-1 mx-auto" />
        </section>

        {/* 점수 카드 */}
        <section className="bg-gradient-to-br from-nature-50 to-primary-50
                            border border-nature-200 rounded-2xl p-4 shadow-soft">
          <p className="text-[11px] font-bold text-nature-600 uppercase tracking-widest">
            오늘 얻은 점수
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <CountUp value={todayScore} className="text-primary text-[34px] font-extrabold tabular-nums" />
            <span className="text-primary text-[16px] font-extrabold">점</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="text-ink-soft">적합도</span>
            <span className="text-ink font-bold tabular-nums">{prevMatch}</span>
            <span className="text-ink-mute">→</span>
            <span className="text-nature-600 font-extrabold tabular-nums">
              {newMatch}
            </span>
            <span className="text-nature-600 text-[11px] font-bold">
              (+{Math.max(0, newMatch - prevMatch)})
            </span>
          </div>
        </section>

        {/* 동선 타임라인 */}
        <section>
          <h2 className="text-ink text-[14px] font-extrabold mb-2">오늘의 동선</h2>
          <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft">
            <ol className="relative">
              <RouteItem icon="🏠" label="레지던스 출발" tone="start" delay={0} />
              {visited.length > 0 && (
                <WalkGap minutes={WALK_TIMES_MIN[0]} delay={0.05} />
              )}
              {visited.map((m, i) => (
                <div key={m.id}>
                  <RouteItem
                    icon={m.icon}
                    label={`${m.title} 완료`}
                    sub={`+${m.reward} 점`}
                    tone="done"
                    delay={0.1 + i * 0.08}
                  />
                  {i < visited.length - 1 && (
                    <WalkGap
                      minutes={WALK_TIMES_MIN[(i + 1) % WALK_TIMES_MIN.length]}
                      delay={0.12 + i * 0.08}
                    />
                  )}
                </div>
              ))}
              {visited.length > 0 && (
                <>
                  <WalkGap minutes={4} delay={0.6} />
                  <RouteItem icon="🌙" label="레지던스 복귀" tone="end" delay={0.65} />
                </>
              )}
            </ol>
            <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-[11px]">
              <span className="text-ink-soft">총 이동거리 · 시간</span>
              <span className="text-ink font-extrabold">
                {DISTANCE_KM}km · {TOTAL_MIN}분
              </span>
            </div>
          </div>
        </section>

        {/* 인사이트 */}
        <section>
          <h2 className="text-ink text-[14px] font-extrabold mb-2">오늘의 인사이트</h2>
          <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-soft space-y-2">
            {insights.map((text) => (
              <p
                key={text}
                className="text-ink text-[13px] leading-relaxed flex items-start gap-1.5"
              >
                <span className="text-primary shrink-0">·</span>
                <span>{text}</span>
              </p>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 CTA — 8/8 미션 완료 시엔 '이주 결정 리포트'가 primary */}
      <footer className="px-5 pb-6 pt-3 border-t border-cream-200 bg-white/80 backdrop-blur space-y-2">
        {allMissionsDone && (
          <motion.button
            type="button"
            onClick={onSeeReport}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-2xl bg-primary text-white text-[15px] font-extrabold
                       shadow-soft transition"
          >
            📋 이주 결정 리포트 작성하기 →
          </motion.button>
        )}
        <button
          type="button"
          onClick={onSeeResidences}
          className={`w-full py-4 rounded-2xl text-[15px] font-extrabold transition active:scale-[0.99]
            ${
              allMissionsDone
                ? "bg-white text-ink border border-cream-200"
                : "bg-primary text-white shadow-soft"
            }`}
        >
          이 지역 레지던스 보기 →
        </button>
        <button
          type="button"
          onClick={onSeeJourney}
          className="w-full py-3 rounded-2xl bg-white text-ink-soft text-[13px] font-bold
                     border border-cream-200"
        >
          나의 여정에서 확인하기
        </button>
      </footer>
    </div>
  );
}

// =====================================================================
// 카운트업 — 0에서 value까지 0.8s 동안 증가
// =====================================================================

function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{display}</span>;
}

// =====================================================================
// 타임라인 아이템
// =====================================================================

function RouteItem({
  icon,
  label,
  sub,
  tone,
  delay,
}: {
  icon: string;
  label: string;
  sub?: string;
  tone: "start" | "done" | "end";
  delay: number;
}) {
  const ringColor =
    tone === "done"
      ? "ring-nature-400 bg-white"
      : tone === "end"
      ? "ring-ink-mute bg-white"
      : "ring-primary bg-white";
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 mb-1"
    >
      <span
        className={`w-10 h-10 rounded-full ring-2 ${ringColor}
                    flex items-center justify-center text-lg shadow-soft`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[13px] font-extrabold leading-tight">{label}</p>
        {sub && <p className="text-primary text-[11px] font-bold mt-0.5">{sub}</p>}
      </div>
    </motion.li>
  );
}

function WalkGap({ minutes, delay }: { minutes: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 pl-5 mb-1"
    >
      <span className="w-px h-5 border-l-2 border-dashed border-cream-200 ml-[14px]" />
      <p className="text-ink-mute text-[11px] font-medium">도보 {minutes}분</p>
    </motion.div>
  );
}
