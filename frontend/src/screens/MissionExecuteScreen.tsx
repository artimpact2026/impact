// 미션 수행 화면 — 말해보카 스타일 대화 UI
// 옵션 분기 + 수치 입력 + 적합도 누적 + {amount}/{compare} 치환 지원
// 마지막 turn에서 옵션/입력 종료 시 점수 +N 애니메이션 후 onComplete(fitDelta) 호출.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fitDeltaForOption,
  type BackgroundVariant,
  type Mission,
} from "../data/missions";
import type { LifeStyleType } from "../data/residences";

// variant → 클레이 씬 이미지. 매칭 없는 variant는 베이지 그라데이션만.
// neighbor는 데이터상 outdoor 기본값처럼 광범위하게 쓰여서(갯벌·산책·일몰 등)
// 이발소 이미지가 어울리지 않아 의도적으로 매핑에서 제외함.
const SCENE_BG: Partial<Record<BackgroundVariant, string>> = {
  market: "/character1/clay-market.png",
  transit: "/character1/clay-bus-stop.png",
  home: "/character1/clay-hanok-nap.png",
};

// 미션별 override — variant가 너무 광범위하거나 미션 성격이 더 구체적일 때
// (대화 미션 중 그라데이션만 깔리던 케이스를 미션 톤에 맞춰 보강)
const MISSION_ID_BG: Record<string, string> = {
  cost: "/character1/clay-market.png",
  food: "/character1/clay-market.png",
  neighbor: "/character1/clay-barbershop.png",
  "ganghwa-farm": "/character1/clay-market.png",
  "gwangyang-cafework": "/character1/clay-stream-watermelon.png",
  "gwangyang-creator": "/character1/clay-barbershop.png",
  "geoje-leisure": "/character1/clay-beach.png",
  "taean-community": "/character1/clay-beach.png",
  "yangyang-cafe-work": "/character1/clay-beach.png",
  "yangyang-nomad": "/character1/clay-beach.png",
  "jindo-tea": "/character1/clay-hanok-nap.png",
};

// NPC 이름 → 클레이 캐릭터 (배경 제거된 투명 PNG)
// 외부에서 온 이주자/노마드 계열은 바람(파랑), 그 외 로컬은 지음(주황)
function pickNpcAvatar(name: string): string {
  if (/이주민|이주자|노마드|크리에이터|정착|먼저 온|서퍼/.test(name)) {
    return "/character1/clay-baram-solo.png";
  }
  return "/character1/clay-jieum-solo.png";
}

type Props = {
  mission: Mission;
  residenceMatchType: LifeStyleType;
  onClose: () => void;
  // 누적 적합도 변화량을 함께 전달
  onComplete: (fitDelta: number) => void;
};

export default function MissionExecuteScreen({
  mission,
  residenceMatchType,
  onClose,
  onComplete,
}: Props) {
  const [turnIdx, setTurnIdx] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [picks, setPicks] = useState<string[]>([]);
  // 누적 적합도 변화
  const [fitDelta, setFitDelta] = useState(0);
  // 수치 입력 단계의 임시 값
  const [numericInput, setNumericInput] = useState("");
  // 마지막 수치 입력값 (NPC 텍스트 치환용)
  const [lastAmount, setLastAmount] = useState<number | null>(null);
  // 수치 입력 비교 결과 ("절약형" / "보통" / "풍족형")
  const [lastCompare, setLastCompare] = useState<string>("");

  const turn = mission.dialogues[turnIdx];

  // {amount} / {compare} 치환
  const npcText = turn.npc
    .replace(
      "{amount}",
      lastAmount !== null ? lastAmount.toLocaleString() : ""
    )
    .replace("{compare}", lastCompare);

  const finish = (extraDelta: number) => {
    const total = fitDelta + extraDelta;
    setFitDelta(total);
    setShowReward(true);
    window.setTimeout(() => onComplete(total), 1800);
  };

  const handlePick = (optionIdx: number) => {
    const opt = turn.options?.[optionIdx];
    if (!opt) return;
    const delta = fitDeltaForOption(opt, residenceMatchType);
    setPicks((p) => [...p, opt.label]);

    if (opt.next === undefined) {
      finish(delta);
      return;
    }
    setFitDelta((d) => d + delta);
    setTurnIdx(opt.next);
  };

  const handleNumericSubmit = () => {
    if (!turn.numeric) return;
    const v = Number(numericInput.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(v) || v <= 0) return;
    setLastAmount(v);
    // 벤치마크 기반 비교 라벨
    const bm = turn.numeric.benchmarks;
    if (bm) {
      if (v < bm.low) setLastCompare("이 동네 평균보다 절약형이에요.");
      else if (v > bm.high) setLastCompare("이 동네 평균보단 좀 많이 쓰셨어요.");
      else setLastCompare("이 동네 평균 정도예요.");
    }
    setNumericInput("");
    setTurnIdx(turn.numeric.next);
  };

  // 미션별 override가 있으면 우선, 없으면 variant 매핑
  const sceneBg = MISSION_ID_BG[mission.id] ?? SCENE_BG[mission.background];
  const avatarSrc = pickNpcAvatar(mission.npc.name);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden bg-cream">
      {/* === 배경 — 베이지 그라데이션 + (선택) 클레이 씬 이미지 === */}
      <SceneBackground sceneBg={sceneBg} />

      {/* === 상단 헤더 === */}
      <header className="relative z-30 px-4 pt-4 pb-2 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-soft
                     flex items-center justify-center text-ink"
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">
            미션 수행
          </p>
          <p className="text-[14px] font-extrabold text-ink leading-tight truncate">
            {mission.icon} {mission.title}
          </p>
        </div>
        <span className="px-2 py-1 rounded-full bg-white/95 text-primary text-[10px] font-extrabold shadow-soft">
          +{mission.reward}점
        </span>
      </header>

      {/* === NPC 영역 — 클레이 캐릭터 + 이모지 배지 + 이름 칩 === */}
      <section className="relative z-10 flex-1 flex items-end justify-center pb-4 min-h-0">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: [0, -3, 0], opacity: 1 }}
          transition={{
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.4 },
          }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            {/* 발밑 바닥 그림자 — 캐릭터가 서 있는 느낌 */}
            <div
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 -bottom-1
                         w-28 h-3 rounded-[50%] bg-[#3E2C20]/22 blur-md
                         pointer-events-none"
            />
            {/* 투명 PNG — 컨테이너 프레임 없이 배경 위에 그대로 */}
            <img
              src={avatarSrc}
              alt=""
              aria-hidden
              loading="lazy"
              draggable={false}
              className="relative w-44 h-auto object-contain select-none pointer-events-none
                         drop-shadow-[0_8px_12px_rgba(80,70,40,0.25)]"
            />
            {/* 이모지 배지 — 머리 옆(우상단) */}
            <div
              className="absolute -top-1 -right-1 w-12 h-12 rounded-full
                         bg-white shadow-soft ring-2 ring-cream-200
                         flex items-center justify-center text-[26px]"
            >
              <span aria-hidden>{mission.npc.emoji}</span>
            </div>
          </div>
          {/* 이름 칩 */}
          <span
            className="mt-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur
                       text-ink text-[12px] font-bold shadow-soft"
          >
            {mission.npc.name}
          </span>
        </motion.div>
      </section>

      {/* === 하단 대화 패널 === */}
      <AnimatePresence mode="wait">
        <motion.section
          key={turnIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative z-20 bg-white rounded-t-3xl
                     shadow-[0_-12px_30px_-12px_rgba(80,70,40,0.18)]
                     px-5 pt-4 pb-[max(env(safe-area-inset-bottom),20px)]"
        >
          {/* 진행 점 인디케이터 */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {mission.dialogues.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === turnIdx
                    ? "w-5 h-1.5 bg-primary"
                    : i < turnIdx
                    ? "w-1.5 h-1.5 bg-primary/40"
                    : "w-1.5 h-1.5 bg-cream-200"
                }`}
                aria-hidden
              />
            ))}
            <span className="sr-only">
              대화 {turnIdx + 1} / {mission.dialogues.length}
            </span>
          </div>

          {/* 말풍선 */}
          <div className="relative">
            <div
              className="absolute left-6 -top-2 w-4 h-4 bg-white
                         border-l border-t border-cream-200 rotate-45"
              aria-hidden
            />
            <div
              className="relative bg-white rounded-3xl px-4 py-3.5
                         border border-cream-200 shadow-soft"
            >
              <p className="text-ink text-[14px] leading-relaxed whitespace-pre-line">
                {npcText}
              </p>
            </div>
          </div>

          {/* 옵션 분기 OR 수치 입력 */}
          {turn.options && (
            <div className="mt-3 space-y-2">
              {turn.options.map((opt, i) => (
                <button
                  key={`${turnIdx}-${i}`}
                  type="button"
                  onClick={() => handlePick(i)}
                  className="w-full text-left px-4 py-3.5 rounded-3xl
                             bg-white border border-cream-200 shadow-soft
                             text-ink text-[13px] font-semibold
                             active:scale-[0.99] transition
                             flex items-center justify-between gap-3"
                >
                  <span className="flex-1">{opt.label}</span>
                  <span
                    className="text-ink-mute text-[14px] shrink-0"
                    aria-hidden
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          )}

          {turn.numeric && (
            <div className="mt-3">
              <label className="text-[11px] font-bold text-ink-soft block mb-1.5">
                {turn.numeric.prompt}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericInput}
                  onChange={(e) =>
                    setNumericInput(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder={turn.numeric.placeholder}
                  className="flex-1 px-4 py-3.5 rounded-3xl border border-cream-200
                             bg-white text-ink text-[14px] focus:outline-none
                             focus:border-primary placeholder:text-ink-mute"
                />
                <span className="self-center text-ink-soft text-[12px] font-bold pr-1">
                  {turn.numeric.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNumericSubmit}
                disabled={!numericInput}
                className="mt-2 w-full py-3.5 rounded-3xl bg-primary text-white
                           text-[14px] font-extrabold shadow-soft
                           active:scale-[0.99] transition
                           disabled:opacity-40 disabled:active:scale-100"
              >
                기록하기
              </button>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* 미션 완료 보상 오버레이 */}
      <AnimatePresence>
        {showReward && <RewardOverlay reward={mission.reward} />}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 배경 — 베이지 그라데이션 베이스 + (선택) 클레이 씬 이미지 + 가독성 마스크
// =====================================================================

function SceneBackground({ sceneBg }: { sceneBg: string | undefined }) {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* 베이지 그라데이션 베이스 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFE4C8] via-cream to-cream-100" />
      {/* 클레이 씬 이미지 — 은은하게 알아볼 정도, 가장자리 부드럽게 scale-110 */}
      {sceneBg && (
        <img
          src={sceneBg}
          alt=""
          aria-hidden
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover scale-110 select-none pointer-events-none"
          style={{
            filter: "blur(4px) brightness(1) saturate(0.85)",
            opacity: 0.72,
          }}
        />
      )}
      {/* 하단으로 갈수록 단단해지는 마스크 — 말풍선/옵션 가독성 우선
          (상단은 얇게 해서 씬이 더 잘 보이게) */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/15 via-cream/35 to-cream" />
    </div>
  );
}

// =====================================================================
// 미션 완료 보상 오버레이 — +N 점 애니메이션
// =====================================================================

function RewardOverlay({ reward }: { reward: number }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-black/55 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {/* 중앙 정렬은 wrapper, 등장 애니메이션은 안쪽 motion에서 — transform 충돌 회피 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 16, stiffness: 220 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 10 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-nature-300 to-nature-500
                       flex items-center justify-center text-5xl text-white shadow-soft"
            aria-hidden
          >
            ✓
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-white text-[18px] font-extrabold"
          >
            미션 완료!
          </motion.p>
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: [0, -8, 0], opacity: 1 }}
            transition={{
              opacity: { delay: 0.5, duration: 0.4 },
              y: {
                delay: 0.5,
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="mt-2 px-4 py-2 rounded-full bg-primary text-white text-[20px] font-extrabold shadow-soft"
          >
            축적 점수 +{reward}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
