// 레지던스 진입 직후 "찐 홈" — 시뮬레이션의 중심지 (카카오 다육이 톤)
//
// 디자인 (refe.png 레퍼런스):
//   · 상단 좌: "내 집이 자라고 있어요" 헤드라인
//   · 상단 우: 본가로 돌아가기 버튼
//   · 우측 floating 버튼 2개 (알아보기 → 미션리스트, 편지)
//   · 중앙: 둥근 흙무더기 위 클레이 집 + 떠다니는 나비/꽃잎
//   · 하단 카드: Day N · 페르소나 + 진행률 + 액션 2개 (알아보기, 마당 가꾸기)
//
// 본가로 돌아가지 않는 한 시뮬레이션 흐름의 중심지로 남음.

import { motion } from "framer-motion";
import type { Residence } from "../data/residences";
import {
  HANSEOL_IMAGE,
  HANSEOL_INTRO,
  HANSEOL_NAME,
} from "../data/ganghwaStory";

type Props = {
  residence: Residence;
  nickname: string;
  homeRegion: string;
  currentDay: number;
  dayCount: number;
  todayMissionCount: number;
  todayMissionDoneCount: number;
  onGoMissionList: () => void;
  onReturnHome: () => void;
  // 편지함 진입 — 편지 탭 제거 후 ResidenceHomeScreen 의 floating 버튼이 유일 진입점
  onOpenLetters?: () => void;
  letterUnread?: number;
  // 한설 환영 모달 — Day 1 첫 진입 시만 true. 닫으면 onDismissIntro 영속 처리.
  showHanseolIntro?: boolean;
  onDismissHanseolIntro?: () => void;
};

export default function ResidenceHomeScreen({
  residence,
  nickname,
  homeRegion,
  currentDay,
  dayCount,
  todayMissionCount,
  todayMissionDoneCount,
  onGoMissionList,
  onReturnHome,
  onOpenLetters,
  letterUnread = 0,
  showHanseolIntro = false,
  onDismissHanseolIntro,
}: Props) {
  const todayPercent =
    todayMissionCount === 0
      ? 0
      : Math.round((todayMissionDoneCount / todayMissionCount) * 100);

  return (
    <div
      className="relative min-h-[calc(100dvh-6rem)] overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #E8F1FB 0%, #F4F9FB 60%, #FCFAF4 100%)",
      }}
    >
      {/* ===== 상단 헤더 ===== */}
      <header className="relative z-10 pt-12 px-5">
        <h1 className="text-ink text-[22px] font-extrabold leading-tight">
          {nickname}님의 집이
          <br />
          자라고 있어요
        </h1>
        <p className="mt-2 text-ink-soft text-[12.5px]">
          {residence.region}에서 잠시 머무는 중
        </p>
      </header>

      {/* ===== 우측 floating 편지 버튼 (알아보기는 하단 카드에 있어 제거) ===== */}
      <div className="absolute top-32 right-4 z-10">
        <FloatingActionButton
          emoji="✉️"
          label="편지"
          onClick={onOpenLetters}
          badge={letterUnread}
        />
      </div>

      {/* ===== 중앙 씬 — 흙무더기 + 집 + 떠다니는 장식
              (정중앙 배치 — items-center justify-center, 위·아래 패딩만 nav 클리어) ===== */}
      <section className="absolute inset-0 z-0 flex items-center justify-center pt-28 pb-44">
        <SceneStage />
      </section>

      {/* ===== 하단 카드 — 진행률 + 액션 ===== */}
      <footer className="absolute bottom-4 left-3 right-3 z-10">
        <div className="bg-white rounded-3xl shadow-[0_8px_24px_-4px_rgba(80,60,40,0.12)] border border-cream-200 p-4">
          {/* 헤더 — 페르소나 + 진행률 */}
          <div className="flex items-baseline justify-between">
            <p className="text-ink text-[15px] font-extrabold">
              Day {currentDay} / {dayCount} · {residence.region}
            </p>
            <p className="text-primary text-[15px] font-extrabold tabular-nums">
              {todayPercent}%
            </p>
          </div>
          {/* 진행 바 */}
          <div className="mt-2 h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nature-300 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${todayPercent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          {/* 오늘 미션 카운트 */}
          <p className="mt-1 text-ink-mute text-[11px]">
            오늘 미션 {todayMissionDoneCount} / {todayMissionCount}
          </p>
          {/* 액션 2개 — grid */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ActionCard
              emoji="🎯"
              label="알아보기"
              sub={`${todayMissionCount - todayMissionDoneCount}개 미션 남음`}
              onClick={onGoMissionList}
              accent="primary"
            />
            <ActionCard
              emoji="🌿"
              label="마당 가꾸기"
              sub="내일 만나요"
              locked
            />
          </div>
        </div>
      </footer>

      {/* ===== 한설 환영 모달 — Day 1 첫 진입 시 1회 ===== */}
      {showHanseolIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6
                     bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-[340px] rounded-3xl bg-white shadow-soft
                       overflow-hidden flex flex-col items-center"
          >
            <div
              className="w-full h-[180px] bg-cover bg-center"
              style={{ backgroundImage: `url(${HANSEOL_IMAGE})` }}
              aria-hidden
            />
            <div className="px-6 pt-5 pb-6 w-full text-center">
              <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-primary">
                먼저 입주한 선배
              </p>
              <p className="mt-1 text-ink text-[18px] font-extrabold">
                {HANSEOL_NAME}
              </p>
              <p className="mt-3 text-ink-soft text-[13.5px] leading-relaxed">
                {HANSEOL_INTRO}
              </p>
              <button
                type="button"
                onClick={onDismissHanseolIntro}
                className="mt-5 w-full h-12 rounded-full bg-primary text-white
                           text-[14px] font-extrabold
                           shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)]
                           active:scale-[0.98] transition"
              >
                알겠어요
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 우측 floating action button — 동그란 흰색 버튼 + 이모지 + 작은 라벨
// ─────────────────────────────────────────────────────────────
function FloatingActionButton({
  emoji,
  label,
  onClick,
  badge = 0,
}: {
  emoji: string;
  label: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center active:scale-95 transition"
    >
      <span className="relative">
        <span
          className="block w-14 h-14 rounded-full bg-white shadow-[0_4px_12px_-2px_rgba(80,60,40,0.18)]
                     border border-cream-200 flex items-center justify-center text-[24px]"
        >
          {emoji}
        </span>
        {badge > 0 && (
          <span
            aria-label={`안 읽음 ${badge}개`}
            className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full
                       bg-primary text-white text-[10.5px] font-extrabold
                       flex items-center justify-center
                       border-2 border-white shadow-soft"
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="mt-1 text-ink-soft text-[10.5px] font-extrabold bg-white/80 backdrop-blur px-1.5 rounded-full">
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 하단 액션 카드 (알아보기 / 마당 가꾸기)
// ─────────────────────────────────────────────────────────────
function ActionCard({
  emoji,
  label,
  sub,
  onClick,
  accent,
  locked,
}: {
  emoji: string;
  label: string;
  sub: string;
  onClick?: () => void;
  accent?: "primary";
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left transition
        ${
          accent === "primary"
            ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(255,112,67,0.4)]"
            : "bg-cream-50 border border-cream-200 text-ink"
        }
        ${locked ? "opacity-60" : "active:scale-[0.98]"}`}
    >
      <span className="text-[26px] leading-none" aria-hidden>
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12.5px] font-extrabold leading-tight
            ${accent === "primary" ? "text-white" : "text-ink"}`}
        >
          {label}
        </p>
        <p
          className={`text-[10.5px] mt-0.5 leading-tight
            ${accent === "primary" ? "text-white/80" : "text-ink-mute"}`}
        >
          {sub}
        </p>
      </div>
      {locked && (
        <span aria-hidden className="text-[12px] text-ink-mute">
          🔒
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 중앙 씬 — 둥근 흙무더기 + 집 SVG + 떠다니는 나비/꽃잎
// ─────────────────────────────────────────────────────────────
function SceneStage() {
  return (
    <div className="relative">
      {/* 둥근 흙무더기 platform */}
      <div className="relative">
        {/* 흙 그림자 */}
        <div
          aria-hidden
          className="absolute -inset-2 rounded-[50%] blur-md opacity-30"
          style={{ background: "rgba(120, 90, 60, 0.4)" }}
        />
        {/* 흙 본체 — 위에서 본 타원 */}
        <svg
          viewBox="0 0 280 110"
          className="relative w-[280px] h-auto drop-shadow-[0_8px_12px_rgba(80,60,40,0.18)]"
          aria-hidden
        >
          <defs>
            <radialGradient id="dirtTop" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#B7DEB8" />
              <stop offset="70%" stopColor="#8FBC9C" />
              <stop offset="100%" stopColor="#6B9A7A" />
            </radialGradient>
            <linearGradient id="dirtSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C29470" />
              <stop offset="100%" stopColor="#9A6E4F" />
            </linearGradient>
          </defs>
          {/* 흙 옆면 (땅 단면) */}
          <ellipse cx="140" cy="80" rx="125" ry="25" fill="url(#dirtSide)" />
          <rect x="15" y="55" width="250" height="25" fill="url(#dirtSide)" />
          {/* 흙 윗면 (잔디 위) */}
          <ellipse cx="140" cy="55" rx="125" ry="30" fill="url(#dirtTop)" />
          {/* 작은 풀잎 데코 */}
          <g fill="#5C9B6B" opacity="0.85">
            <ellipse cx="35" cy="58" rx="3" ry="6" />
            <ellipse cx="58" cy="48" rx="2.5" ry="5" />
            <ellipse cx="240" cy="60" rx="3" ry="6" />
            <ellipse cx="220" cy="50" rx="2.5" ry="5" />
            <ellipse cx="100" cy="68" rx="2" ry="4" />
            <ellipse cx="180" cy="70" rx="2" ry="4" />
          </g>
          {/* 작은 자갈 */}
          <g fill="#6B5446" opacity="0.5">
            <circle cx="50" cy="68" r="2" />
            <circle cx="230" cy="65" r="1.5" />
            <circle cx="160" cy="72" r="1.5" />
          </g>
        </svg>
      </div>

      {/* 클레이 집 — 흙 위에 얹힘 */}
      <motion.div
        animate={{ y: [-3, 1, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "38px" }}
      >
        <ClayHouse />
      </motion.div>

      {/* 떠다니는 나비 + 꽃잎 */}
      <FloatingDecorations />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 클레이 집 SVG — 한옥 + 마당 톤
// ─────────────────────────────────────────────────────────────
function ClayHouse() {
  return (
    <svg
      viewBox="0 0 140 130"
      className="w-[140px] h-auto drop-shadow-[0_6px_8px_rgba(62,44,32,0.25)]"
      aria-hidden
    >
      <defs>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E08F6E" />
          <stop offset="100%" stopColor="#B96748" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF0DA" />
          <stop offset="100%" stopColor="#E8D1A8" />
        </linearGradient>
        <linearGradient id="door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A06B45" />
          <stop offset="100%" stopColor="#7A4F30" />
        </linearGradient>
      </defs>

      {/* 굴뚝 (오른쪽 위) */}
      <rect x="92" y="22" width="14" height="22" fill="#C97D5C" rx="2" />
      <rect x="90" y="22" width="18" height="4" fill="#A35F45" rx="1" />
      {/* 굴뚝 연기 */}
      <g fill="#FFFFFF" opacity="0.75">
        <circle cx="100" cy="15" r="5" />
        <circle cx="95" cy="8" r="4" />
        <circle cx="103" cy="3" r="3" />
      </g>

      {/* 지붕 — 기와 곡선 */}
      <path
        d="M 20 50 Q 22 32 35 28 L 105 28 Q 118 32 120 50 Z"
        fill="url(#roof)"
      />
      <path d="M 18 50 L 122 50 L 122 55 L 18 55 Z" fill="#9A4F32" />
      <g stroke="#A35F45" strokeWidth="0.8" fill="none" opacity="0.55">
        <path d="M 28 38 Q 50 36 70 36 Q 90 36 112 38" />
        <path d="M 25 44 Q 50 42 70 42 Q 90 42 115 44" />
      </g>

      {/* 본채 */}
      <rect x="22" y="55" width="96" height="62" rx="2" fill="url(#wall)" />
      <rect x="20" y="112" width="100" height="8" fill="#C8A877" rx="1" />

      {/* 창문 */}
      <rect
        x="32"
        y="68"
        width="22"
        height="26"
        rx="2"
        fill="#C9E1EF"
        stroke="#8B5E42"
        strokeWidth="1.5"
      />
      <path
        d="M 43 68 L 43 94 M 32 81 L 54 81"
        stroke="#8B5E42"
        strokeWidth="1"
      />
      <rect
        x="86"
        y="68"
        width="22"
        height="26"
        rx="2"
        fill="#C9E1EF"
        stroke="#8B5E42"
        strokeWidth="1.5"
      />
      <path
        d="M 97 68 L 97 94 M 86 81 L 108 81"
        stroke="#8B5E42"
        strokeWidth="1"
      />

      {/* 창문 따뜻한 빛 */}
      <rect x="33" y="69" width="20" height="10" fill="#FFE9A8" opacity="0.6" />
      <rect x="87" y="69" width="20" height="10" fill="#FFE9A8" opacity="0.6" />

      {/* 문 */}
      <rect x="62" y="84" width="16" height="28" rx="1" fill="url(#door)" />
      <circle cx="74" cy="98" r="1.4" fill="#FFE9A8" />

      {/* 입구 계단 */}
      <rect x="58" y="112" width="24" height="3" fill="#C8A877" rx="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 떠다니는 나비 + 꽃잎 (clay tone)
// ─────────────────────────────────────────────────────────────
function FloatingDecorations() {
  return (
    <>
      <motion.span
        aria-hidden
        className="absolute text-[22px] select-none"
        style={{ left: "-10%", top: "10%" }}
        animate={{
          x: [0, 12, 0],
          y: [0, -8, 0],
          rotate: [-8, 8, -8],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute text-[18px] select-none"
        style={{ right: "-5%", top: "0%" }}
        animate={{
          x: [0, -10, 0],
          y: [0, 6, 0],
          rotate: [10, -10, 10],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        🦋
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute text-[14px] select-none"
        style={{ right: "5%", top: "55%" }}
        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        🌸
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute text-[14px] select-none"
        style={{ left: "-2%", top: "60%" }}
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🌼
      </motion.span>
    </>
  );
}
