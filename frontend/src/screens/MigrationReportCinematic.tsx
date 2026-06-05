// 이주 리포트 — 시네마틱 엔딩 시퀀스 (Apple Music 한 해 돌아보기 톤)
// 4개 슬라이드: 점수 / AI 요약 / 미션 타임라인 / 컨페티 + 보상 카드
//
// 처음 시청: 자동 진행 + 다음 슬라이드 탭 가능
// 재시청: 자유 탐색 모드 (자동 진행 없음, 좌우 도트로 이동)

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Residence } from "../data/residences";
import type { MigrationReport } from "../data/journey";

type Props = {
  residence: Residence;
  report: MigrationReport;
  // 처음 시청 = 자동 재생, 재시청 = 자유 탐색
  isFirstView: boolean;
  onClose: () => void;
  onApplyResidence?: () => void; // 입주하기(MoveInScreen) 연결
};

const SLIDE_COUNT = 4;
const AUTO_ADVANCE_MS = 4200; // 슬라이드별 자동 전환 간격

export default function MigrationReportCinematic({
  residence,
  report,
  isFirstView,
  onClose,
  onApplyResidence,
}: Props) {
  const [idx, setIdx] = useState(0);

  const next = () => setIdx((i) => Math.min(SLIDE_COUNT - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  // 자동 진행 — 첫 시청 + 마지막 슬라이드 아니면 타이머
  useEffect(() => {
    if (!isFirstView) return;
    if (idx >= SLIDE_COUNT - 1) return;
    const t = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [idx, isFirstView]);

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50
                    bg-cream text-ink overflow-hidden">
      {/* 좌상단 닫기 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-6 right-5 z-20 w-9 h-9 rounded-full
                   bg-white shadow-soft border border-cream-200
                   flex items-center justify-center text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* 상단 라벨 */}
      <p className="absolute top-7 left-5 z-10 text-[11px] tracking-widest uppercase font-extrabold text-ink-mute">
        {residence.region} · 이주 리포트
      </p>

      {/* 슬라이드 — 좌우 슬라이드 전환 */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col"
          >
            {idx === 0 && <SlideOne residence={residence} report={report} />}
            {idx === 1 && <SlideTwo report={report} />}
            {idx === 2 && (
              <SlideThree report={report} />
            )}
            {idx === 3 && (
              <SlideFour
                residence={residence}
                report={report}
                onClose={onClose}
                onApplyResidence={onApplyResidence}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 좌우 탭 영역 (직접 탐색) */}
      <button
        type="button"
        onClick={prev}
        disabled={idx === 0}
        aria-label="이전 슬라이드"
        className="absolute left-0 top-1/4 bottom-1/4 w-1/3 z-10
                   disabled:cursor-default"
      />
      <button
        type="button"
        onClick={next}
        disabled={idx >= SLIDE_COUNT - 1}
        aria-label="다음 슬라이드"
        className="absolute right-0 top-1/4 bottom-1/4 w-1/3 z-10
                   disabled:cursor-default"
      />

      {/* 하단 진행 인디케이터 */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-1.5 px-5">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`슬라이드 ${i + 1}`}
            className={`h-1 rounded-full transition-all
              ${i === idx ? "w-8 bg-primary" : "w-2 bg-cream-300"}`}
          />
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// Slide 1 — 정보 / 축적 / 관계도 (카운트업)
// =====================================================================

function SlideOne({
  residence,
  report,
}: {
  residence: Residence;
  report: MigrationReport;
}) {
  return (
    <div className="flex-1 flex flex-col px-6 pt-24 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-ink-mute text-[11px] font-extrabold tracking-[0.16em] uppercase">
          나의 이주 기록 요약
        </p>
        <h1 className="mt-2 text-ink text-[28px] font-extrabold leading-tight">
          {residence.region}에서의<br />흔적
        </h1>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        <ScoreCard
          icon="🎯"
          label="정보"
          value={report.infoScore}
          suffix="개 미션"
          delay={0.4}
          tone="orange"
        />
        <ScoreCard
          icon="💰"
          label="축적"
          value={report.accumulationScore}
          suffix="점"
          delay={0.55}
          tone="amber"
        />
        <ScoreCard
          icon="🤝"
          label="관계도"
          value={report.relationshipScore}
          suffix="%"
          delay={0.7}
          tone="green"
        />
      </div>
    </div>
  );
}

function ScoreCard({
  icon,
  label,
  value,
  suffix,
  delay,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  suffix: string;
  delay: number;
  tone: "orange" | "amber" | "green";
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    const t0 = setTimeout(() => {
      const tick = (now: number) => {
        const t = Math.min(1, (now - start - delay * 1000) / dur);
        const eased = 1 - Math.pow(1 - t, 3); // easeOut cubic
        setN(Math.round(value * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(t0);
  }, [value, delay]);

  // 톤별 이모지 셀 배경 + 큰 숫자 색
  const tones = {
    orange: { iconBg: "bg-primary-50", numText: "text-primary" },
    amber: { iconBg: "bg-[#FFF4D6]", numText: "text-[#E5A800]" },
    green: { iconBg: "bg-nature-50", numText: "text-nature-600" },
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-soft border border-cream-200/80 p-4 flex items-center gap-4"
    >
      <span
        className={`w-12 h-12 rounded-2xl ${tones.iconBg} flex items-center justify-center text-2xl shrink-0`}
        aria-hidden
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink-mute text-[10.5px] font-extrabold uppercase tracking-[0.16em]">
          {label}
        </p>
        <p className={`mt-1 text-[28px] font-extrabold tabular-nums leading-none ${tones.numText}`}>
          {n.toLocaleString()}
          <span className="ml-1 text-[12.5px] text-ink-mute">{suffix}</span>
        </p>
      </div>
    </motion.div>
  );
}

// =====================================================================
// Slide 2 — AI 요약 (타이핑 애니메이션)
// =====================================================================

function SlideTwo({ report }: { report: MigrationReport }) {
  const text = report.aiSummary;
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    let i = 0;
    const itv = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(itv);
    }, 15);
    return () => clearInterval(itv);
  }, [text]);

  return (
    <div className="flex-1 flex flex-col px-6 pt-24 pb-20">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-ink-mute text-[11px] font-extrabold tracking-[0.16em] uppercase"
      >
        나의 시간, 한 줄로
      </motion.p>

      <div className="flex-1 flex items-center">
        <p className="text-ink text-[20px] font-bold leading-relaxed whitespace-pre-line">
          {typed}
          <span className="inline-block w-[2px] h-[20px] align-middle bg-ink/60 ml-0.5 animate-pulse" />
        </p>
      </div>

      {report.aiSummarySource === "claude" && (
        <p className="text-ink-mute text-[10px] tracking-widest">
          ✨ Claude가 정리한 요약
        </p>
      )}
    </div>
  );
}

// =====================================================================
// Slide 3 — AI 본문 요약. NPC가 알려준 정보 + 거친 미션을 엮은 글 한 편.
// (옛 타임라인 리스트는 폐기. 사용자 피드백: "정보를 글과 메시지로 요약")
// =====================================================================

function SlideThree({ report }: { report: MigrationReport }) {
  // narrativeBody는 generateMigrationReport에서 채워짐. 옛 리포트 호환을 위해 fallback.
  const body =
    report.narrativeBody ??
    "이곳에서의 시간이 천천히 떠올라요. 보고 들은 것들이 마음에 남았기를.";
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return (
    <div className="flex-1 flex flex-col px-6 pt-24 pb-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-ink-mute text-[11px] font-extrabold tracking-[0.16em] uppercase">
          함께한 시간의 이야기
        </p>
        <h2 className="mt-2 text-ink text-[22px] font-extrabold leading-tight">
          당신이 보낸 시간
        </h2>
      </motion.div>

      <div className="flex-1 mt-6 overflow-y-auto pr-1 space-y-4">
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.18, duration: 0.5 }}
            className="text-ink text-[14.5px] leading-[1.75] whitespace-pre-line"
          >
            {p}
          </motion.p>
        ))}

        {report.narrativeBodySource === "claude" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 + paragraphs.length * 0.18 + 0.2 }}
            className="text-ink-mute text-[10px] tracking-wider"
          >
            ✦ Claude가 미션 기록을 읽고 엮은 글이에요
          </motion.p>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Slide 4 — 컨페티 + 보상 카드
// =====================================================================

function SlideFour({
  residence,
  report,
  onClose,
  onApplyResidence,
}: {
  residence: Residence;
  report: MigrationReport;
  onClose: () => void;
  onApplyResidence?: () => void;
}) {
  return (
    <div className="flex-1 relative flex flex-col items-center px-6 pt-20 pb-10 text-ink">
      {/* warm 배경 — 슬라이드 4 한정. 부모 dark bg 위로 fade-in */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute inset-0 -z-10 bg-gradient-to-br
                   from-cream via-[#FFE9C5] to-primary-50"
      />
      {/* 중앙 라디얼 후광 — 카드 등장과 동시에 부풀어오름 */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.6, 0.3], scale: [0.4, 1.25, 1.1] }}
        transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,196,123,0.55) 0%, rgba(255,196,123,0.18) 35%, transparent 65%)",
        }}
      />

      <Confetti />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-ink-mute text-[11px] font-extrabold tracking-[0.22em] uppercase"
      >
        여정 완주
      </motion.p>

      {/* 트로피 카드 — 뽑기 등장 모션 (scale + rotate + spring) + shimmer 한 번 */}
      <motion.div
        initial={{ scale: 0.55, opacity: 0, y: 40, rotate: -14 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        transition={{
          delay: 0.45,
          type: "spring",
          stiffness: 180,
          damping: 16,
        }}
        className="mt-6 relative w-full max-w-[320px] rounded-[28px] overflow-hidden
                   bg-gradient-to-br from-[#FFF6E6] via-[#FFE5C0] to-[#FFCDA8]
                   ring-1 ring-white/70
                   shadow-[0_24px_56px_-18px_rgba(196,128,68,0.45)]
                   p-7 text-center text-[#3F2515]"
      >
        {/* 카드 표면 빛 스윕 — 등장 후 한 번만, 좌→우 */}
        <motion.div
          aria-hidden
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ delay: 1.1, duration: 1.3, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
            mixBlendMode: "overlay",
          }}
        />

        <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase opacity-70">
          이주 준비 완료
        </p>
        <div
          className="mt-3 text-[64px] leading-none"
          aria-hidden
          style={{ filter: "drop-shadow(0 6px 10px rgba(120,70,30,0.25))" }}
        >
          🏆
        </div>
        <h2 className="mt-3 text-[20px] font-extrabold">
          {residence.region}에서의 시간
        </h2>
        <p className="mt-1.5 text-[12px] font-bold opacity-75">
          시뮬레이션 여정을 마쳤어요
        </p>

        {/* Stat 3-cell — 셀 사이 hairline */}
        <div
          className="mt-5 grid grid-cols-3 rounded-2xl overflow-hidden
                     bg-white/55 backdrop-blur-sm divide-x divide-[#E9D2B4]"
        >
          <Stat label="미션" value={`${report.infoScore}`} />
          <Stat label="점수" value={`${report.accumulationScore}`} />
          <Stat label="관계도" value={`${report.relationshipScore}%`} />
        </div>
      </motion.div>

      {/* 카드 좌하단·우하단 캐릭터 — 통통 + 등장 시 한 번 축하 점프 */}
      <motion.img
        src="/character1/clay-baram-solo.png"
        alt=""
        aria-hidden
        initial={{ opacity: 0, y: 30, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
        className="absolute left-6 top-[44%] w-14 h-auto pointer-events-none
                   drop-shadow-[0_6px_10px_rgba(120,70,30,0.28)]"
        style={{ transformOrigin: "50% 100%" }}
      />
      <motion.img
        src="/character1/clay-jieum-solo.png"
        alt=""
        aria-hidden
        initial={{ opacity: 0, y: 30, rotate: 10 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 1.35, duration: 0.5, ease: "easeOut" }}
        className="absolute right-6 top-[44%] w-14 h-auto pointer-events-none
                   drop-shadow-[0_6px_10px_rgba(120,70,30,0.28)]"
        style={{ transformOrigin: "50% 100%" }}
      />

      {/* 버튼 — primary CTA + 보조 닫기 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="mt-auto w-full max-w-[320px] space-y-2"
      >
        {onApplyResidence && (
          <button
            type="button"
            onClick={onApplyResidence}
            className="w-full bg-primary text-white text-[15px] font-extrabold
                       py-4 rounded-2xl shadow-soft active:scale-[0.99] transition"
          >
            여기로 입주하기 →
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white text-ink-soft text-[14px] font-bold
                     py-3 rounded-2xl border border-cream-200 shadow-soft
                     active:scale-[0.99] transition"
        >
          닫기
        </button>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <p className="text-[9px] font-extrabold tracking-[0.16em] uppercase opacity-60">
        {label}
      </p>
      <p className="mt-1 text-[18px] font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

// =====================================================================
// 컨페티 — 단순 SVG 파티클 (외부 의존성 없음)
// =====================================================================

function Confetti() {
  // 14개 파티클 (24→14로 절제), 우리 톤 4색 (크림·연오렌지·연초록·노랑)
  const PIECES = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // %
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 0.7,
        rotate: -90 + Math.random() * 180,
        color: ["#FFC79B", "#FFB089", "#C7DFAE", "#FFE074"][i % 4],
        size: 6 + Math.floor(Math.random() * 5),
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PIECES.map((p) => (
        <motion.span
          key={p.id}
          style={{
            left: `${p.x}%`,
            top: "-10%",
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: 2,
          }}
          className="absolute"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: p.rotate,
            opacity: [1, 1, 0.85, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            times: [0, 0.7, 0.9, 1],
          }}
        />
      ))}
    </div>
  );
}
