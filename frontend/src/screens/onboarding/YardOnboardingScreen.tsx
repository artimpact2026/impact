// 마당 오브젝트 고르기 — 카카오식 진단 프로토타입 (Phase 1)
//
// 사용자가 "강화도에 내 집이 생겼어요" 시점에 마당에 처음 두고 싶은
// 오브젝트를 하나 골라 마당으로 옮김. 그 한 번의 선택이 환경(env) ×
// 자세(stance) 두 축의 진단을 동시에 채움.
//
// 인터랙션:
//   1) 빈 마당 + 캐릭터 + "마당에 가장 먼저 두고 싶은 건?" 카피
//   2) 하단 4개 카드 (텃밭 / 작업 의자 / 평상 / 모닥불)
//   3) 카드 탭 → 카드가 떠올라 마당 중앙으로 슝 이동 → 마당이 살아남
//   4) 잠시 후 "✓ 이걸 마당에 둘게요" 확정 + onComplete 호출
//
// 데이터 매핑 (Stance):
//   · 텃밭   → alone_make   — 혼자 무언가 짓는 사람
//   · 작업 의자 → alone_rest — 혼자 차 한 잔, 책 한 권
//   · 평상   → together_rest — 이웃과 평상 모임
//   · 모닥불  → together_make — 같이 짓는 톤
//
// 프로토타입 단계 — 실제 OnboardingShell 로 흡수 안 됨. #yard 해시로 격리 미리보기.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Stance } from "../../data/lifestyle";

type YardObject = {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  stance: Stance;
};

const OBJECTS: YardObject[] = [
  {
    id: "garden",
    emoji: "🌱",
    label: "텃밭 한 평",
    hint: "흙 만지며 하루를 채우고 싶어요",
    stance: "alone_make",
  },
  {
    id: "chair",
    emoji: "🪵",
    label: "작업 의자",
    hint: "혼자 차 한 잔, 책 한 권이 좋아요",
    stance: "alone_rest",
  },
  {
    id: "wood-bench",
    emoji: "🪑",
    label: "마루 평상",
    hint: "이웃과 둘러앉아 이야기 나누고 싶어요",
    stance: "together_rest",
  },
  {
    id: "bonfire",
    emoji: "🔥",
    label: "모닥불 자리",
    hint: "같이 모여 무언가 만드는 게 좋아요",
    stance: "together_make",
  },
];

// stance → (balanceB, balanceC) 분해. OnboardingShell 의 데이터 필드에 맞춤.
function stanceToBalance(s: Stance): {
  balanceB: "alone" | "together";
  balanceC: "rest" | "make";
} {
  const [b, c] = s.split("_") as [
    "alone" | "together",
    "rest" | "make"
  ];
  return { balanceB: b, balanceC: c };
}

type Props = {
  // 격리 프리뷰(#yard) 시 — onComplete 만 받음
  onComplete?: (picked: YardObject) => void;
  // 온보딩 셸 통합 — step/total/onBack 으로 진행률·뒤로가기 표시 + onNext 로 balance 전달
  step?: number;
  total?: number;
  onBack?: () => void;
  onNext?: (out: {
    balanceB: "alone" | "together";
    balanceC: "rest" | "make";
    stance: Stance;
  }) => void;
};

export default function YardOnboardingScreen({
  onComplete,
  step,
  total,
  onBack,
  onNext,
}: Props) {
  const [picked, setPicked] = useState<YardObject | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handlePick = (obj: YardObject) => {
    if (picked) return;
    setPicked(obj);
    // 1.4초 후 확정 + 콜백 (애니메이션이 마무리될 시간)
    window.setTimeout(() => {
      setConfirmed(true);
      onComplete?.(obj);
      onNext?.({ ...stanceToBalance(obj.stance), stance: obj.stance });
      // 콘솔에 진단 데이터 출력 — Phase 1 격리 미리보기 흔적
      // eslint-disable-next-line no-console
      console.log("[YardOnboarding] picked:", obj);
    }, 1400);
  };

  const percent =
    step && total ? Math.round((step / total) * 100) : 0;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden flex flex-col">
      {/* === 온보딩 셸 통합 시 — 뒤로 + 진행률 헤더 === */}
      {onBack && step && total && (
        <header className="absolute top-0 left-0 right-0 z-30 pt-12 px-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="이전"
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-soft
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
          <div className="flex-1 h-1.5 bg-white/40 rounded-full overflow-hidden backdrop-blur">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="text-ink text-[12px] font-bold tabular-nums">
            {step} / {total}
          </span>
        </header>
      )}
      {/* === 배경 — 하늘 + 들녘 그라데이션 === */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #DEEEF5 0%, #FBE7C4 55%, #C8B594 100%)",
        }}
      />

      {/* === 한옥 한 면 — 작게 우측에 === */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute right-2 top-[15%] w-[40%] max-w-[180px] h-auto opacity-95"
      >
        {/* 기와 지붕 */}
        <path
          d="M 30 70 Q 35 50 50 45 L 150 45 Q 165 50 170 70 Z"
          fill="#C97D5C"
        />
        <path d="M 30 70 L 170 70 L 170 78 L 30 78 Z" fill="#A35F45" />
        {/* 본채 */}
        <rect x="40" y="78" width="120" height="80" rx="2" fill="#F4DEC2" />
        {/* 토대 */}
        <rect x="38" y="150" width="124" height="14" fill="#E0BE94" />
        {/* 창문 */}
        <rect
          x="55"
          y="92"
          width="28"
          height="32"
          rx="2"
          fill="#C9E1EF"
          stroke="#8B5E42"
          strokeWidth="1.5"
        />
        <rect
          x="117"
          y="92"
          width="28"
          height="32"
          rx="2"
          fill="#C9E1EF"
          stroke="#8B5E42"
          strokeWidth="1.5"
        />
        {/* 문 */}
        <rect x="90" y="118" width="20" height="38" rx="1" fill="#8B5E42" />
      </svg>

      {/* === 헤더 카피 === */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 px-7 text-center ${
          onBack ? "pt-24" : "pt-14"
        }`}
      >
        {/* 셸 모드에선 step/total 이 위에 떠 있어 "Day 1 · 진단" 라벨 생략 */}
        {!onBack && (
          <p className="text-ink-soft text-[11px] font-extrabold tracking-[0.22em] uppercase">
            Day 1 · 진단
          </p>
        )}
        <h1 className={`text-ink text-[24px] font-extrabold leading-[1.25] ${
          !onBack ? "mt-2" : ""
        }`}>
          내 집이 생겼어요.
          <br />
          마당에 가장 먼저 두고 싶은 건?
        </h1>
        <p className="mt-2 text-ink-soft text-[12.5px]">
          하나만 골라 마당에 두면 — 1일 차가 시작돼요.
        </p>
      </motion.header>

      {/* === 마당 영역 === */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 pt-2 pb-4">
        <div
          className="relative w-full max-w-[320px] aspect-[1.6/1] rounded-[28px] overflow-hidden
                     shadow-[inset_0_0_40px_rgba(120,80,40,0.18)]"
          style={{
            background:
              "linear-gradient(135deg, #E8C49A 0%, #D8B98C 60%, #B98456 100%)",
          }}
        >
          {/* 마당 흙 결 */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(160,110,70,0.4) 0px, transparent 30px), radial-gradient(circle at 70% 60%, rgba(160,110,70,0.3) 0px, transparent 40px)",
            }}
          />
          {/* 울타리 — 좌측 */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="block w-1.5 h-10 rounded-sm bg-[#A0734F]"
              />
            ))}
          </div>
          {/* 캐릭터 — 좌측 하단에 작게 */}
          <img
            src="/character1/clay-baram-solo.png"
            alt=""
            aria-hidden
            className="absolute left-[18%] bottom-[8%] w-[45px] h-auto
                       drop-shadow-[0_4px_6px_rgba(62,44,32,0.25)]"
          />

          {/* === 선택된 오브젝트 — 마당 중앙에 짠 등장 === */}
          <AnimatePresence>
            {picked && (
              <motion.div
                key={picked.id}
                initial={{ scale: 0, y: -120, rotate: -8 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 14,
                  stiffness: 200,
                  delay: 0.1,
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                           text-[72px] leading-none select-none"
                style={{ filter: "drop-shadow(0 6px 10px rgba(62,44,32,0.3))" }}
              >
                {picked.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 빈 마당 안내 */}
          {!picked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-[#8B5E42] text-[12.5px] font-bold opacity-60">
                아직 비어있어요
              </p>
            </div>
          )}

          {/* 확정 ✓ 배지 */}
          <AnimatePresence>
            {confirmed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 bottom-3 -translate-x-1/2
                           px-3 py-1 rounded-full bg-white/95 backdrop-blur
                           text-[11px] font-extrabold text-nature-600 shadow-soft
                           inline-flex items-center gap-1"
              >
                ✓ 이걸 마당에 둘게요
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* === 4개 카드 — 하단 === */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 px-4 pb-8 grid grid-cols-2 gap-2.5"
      >
        {OBJECTS.map((obj, i) => {
          const isPicked = picked?.id === obj.id;
          const isDimmed = picked && !isPicked;
          return (
            <motion.button
              key={obj.id}
              type="button"
              onClick={() => handlePick(obj)}
              disabled={!!picked}
              initial={{ y: 14, opacity: 0 }}
              animate={{
                y: 0,
                opacity: isDimmed ? 0.35 : 1,
              }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-start gap-1 text-left
                          bg-white rounded-2xl border shadow-soft
                          px-3 py-2.5 transition
                          ${
                            isPicked
                              ? "border-primary ring-2 ring-primary scale-[1.02]"
                              : "border-cream-200"
                          }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[28px] leading-none" aria-hidden>
                  {obj.emoji}
                </span>
                <span className="text-ink text-[13.5px] font-extrabold leading-tight">
                  {obj.label}
                </span>
              </div>
              <p className="text-ink-soft text-[11px] leading-snug mt-0.5">
                {obj.hint}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
