// 미션 수행 화면 — 풀스크린 NPC + 말풍선 + 선택지 카드 UI
// 레퍼런스: 카카오 당근이/단추 앱 스타일
//
// 데이터 구조(dialogues: DialogueTurn[], options.next, numeric, fitDelta)는 그대로.
// 시각만 새 스펙(풀스크린 캐릭터 + 이름 뱃지 + 타이핑 말풍선 + 좌측 썸네일 선택지)으로 교체.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fitDeltaForOptionV2,
  optionAlignWeight,
  type BackgroundVariant,
  type Mission,
} from "../data/missions";
import type { EnvType, Stance } from "../data/lifestyle";

// variant → 클레이 씬 이미지. 매칭 없는 variant는 베이지 그라데이션만.
const SCENE_BG: Partial<Record<BackgroundVariant, string>> = {
  market: "/character1/clay-market.png",
  transit: "/character1/clay-bus-stop.png",
  home: "/character1/clay-hanok-nap.png",
};

// 미션별 override — variant가 너무 광범위하거나 미션 성격이 더 구체적일 때
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

// 미션별 NPC 아바타 override — 이름 기반 fallback 보다 우선
const MISSION_ID_NPC_AVATAR: Record<string, string> = {
  hospital: "/character1/resident_talk/town_hal_1.png",
};

// NPC 아바타 기본 사이즈 — 풀바디 일러스트 톤. 모든 미션에 동일 적용.
// 미션별로 더 키우거나 줄이고 싶을 때만 MISSION_ID_NPC_SIZE 에 override.
const DEFAULT_NPC_SIZE = "w-[78vw] max-w-[420px] h-auto";
const MISSION_ID_NPC_SIZE: Record<string, string> = {
  // 예: market: "w-[60vw] max-w-[320px] h-auto",
};
// 플레이어("나") 아바타 사이즈 — NPC(78vw)보단 작지만 또렷이 보이는 중간 크기.
const PLAYER_AVATAR_SIZE = "w-[48vw] max-w-[240px] h-auto";

// NPC 이름 → 클레이 캐릭터 (외지인/이주자 톤은 바람, 로컬은 지음)
function pickNpcAvatar(name: string): string {
  if (/이주민|이주자|노마드|크리에이터|정착|먼저 온|서퍼/.test(name)) {
    return "/character1/clay-baram-solo.png";
  }
  return "/character1/clay-jieum-solo.png";
}

// 플레이어 — 선택지 좌측 썸네일
const PLAYER_AVATAR = "/character1/clay-baram-solo.png";

type Props = {
  mission: Mission;
  residenceStance: Stance;
  residenceStanceAlt?: Stance[];
  // v2 — 옵션 정렬도 판정에 사용
  residenceEnv: EnvType;
  onClose: () => void;
  // 누적 적합도 변화량 + 답한 옵션의 (총수/정렬수) 통계 + 고른 라벨 시퀀스를 함께 전달
  onComplete: (
    fitDelta: number,
    pickStats: { totalPicks: number; alignedPicks: number },
    pickedLabels: string[]
  ) => void;
};

export default function MissionExecuteScreen({
  mission,
  residenceStance,
  residenceStanceAlt,
  residenceEnv,
  onClose,
  onComplete,
}: Props) {
  const [turnIdx, setTurnIdx] = useState(0);
  const [showReward, setShowReward] = useState(false);
  // 누적 적합도 변화
  const [fitDelta, setFitDelta] = useState(0);
  // 수치 입력 단계의 임시 값
  const [numericInput, setNumericInput] = useState("");
  // 마지막 수치 입력값 (NPC 텍스트 치환용)
  const [lastAmount, setLastAmount] = useState<number | null>(null);
  // 수치 입력 비교 결과
  const [lastCompare, setLastCompare] = useState<string>("");
  // 사운드 토글 (시각용 — 실제 사운드 연동은 후속)
  const [muted, setMuted] = useState(false);
  // 선택된 옵션 idx — 강조 → 짧은 지연 후 진행
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  // 턴 내 진행 단계 — npc 말 중 → npc 말 끝(탭 대기) → 플레이어 답할 차례
  const [phase, setPhase] = useState<"npc-typing" | "npc-done" | "player-turn">(
    "npc-typing"
  );
  // v2 — 미션 진행 중 답한 옵션의 (총수/정렬수) 누적. ref라 동기적으로 finish에 반영됨.
  const pickStatsRef = useRef({ totalPicks: 0, alignedPicks: 0 });
  // v3 — 사용자가 고른 옵션 라벨 시퀀스 (부정 답변은 "(부정 답변)" 으로 기록).
  // AI 리포트가 이 라벨을 인용해 "당신은 *X* 라고 답했어요" 톤으로 평가.
  const pickedLabelsRef = useRef<string[]>([]);

  const turn = mission.dialogues[turnIdx];

  // {amount} / {compare} 치환
  const npcText = turn.npc
    .replace(
      "{amount}",
      lastAmount !== null ? lastAmount.toLocaleString() : ""
    )
    .replace("{compare}", lastCompare);

  // 타이핑 효과 — 65ms/글자(읽기 호흡 확보). turn 바뀔 때마다 리셋.
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    setDisplayed("");
    setTyping(true);
    setPickedIdx(null);
    setPhase("npc-typing");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      if (i >= npcText.length) {
        setDisplayed(npcText);
        setTyping(false);
        setPhase("npc-done");
        window.clearInterval(id);
      } else {
        setDisplayed(npcText.slice(0, i));
      }
    }, 65);
    return () => window.clearInterval(id);
  }, [npcText]);

  // 말풍선 탭 — 타이핑 중이면 즉시 완료, 끝났으면 플레이어 턴으로 전환
  const handleBubbleTap = () => {
    if (typing) {
      setDisplayed(npcText);
      setTyping(false);
      setPhase("npc-done");
      return;
    }
    if (phase === "npc-done") {
      setPhase("player-turn");
    }
  };

  const finish = (extraDelta: number) => {
    const total = fitDelta + extraDelta;
    setFitDelta(total);
    setShowReward(true);
    const stats = { ...pickStatsRef.current };
    const labels = [...pickedLabelsRef.current];
    window.setTimeout(() => onComplete(total, stats, labels), 1800);
  };

  // "솔직히 안 맞아요" 부정 답변 — 정렬 카운트 0, totalPicks +1, 첫 옵션의 next 경로로 진행
  // (next가 없으면 미션 종료). 사용자에게 명시적인 negative judgment를 주는 채널.
  const handleNegativePick = () => {
    if (pickedIdx !== null) return;
    setPickedIdx(-1); // -1 = 부정 답변 표시
    pickStatsRef.current = {
      totalPicks: pickStatsRef.current.totalPicks + 1,
      alignedPicks: pickStatsRef.current.alignedPicks, // +0
    };
    pickedLabelsRef.current = [...pickedLabelsRef.current, "(부정 답변)"];
    const firstNext = turn.options?.[0]?.next;
    window.setTimeout(() => {
      if (firstNext === undefined) {
        finish(0);
        return;
      }
      setTurnIdx(firstNext);
    }, 200);
  };

  const handlePick = (optionIdx: number) => {
    if (pickedIdx !== null) return;
    const opt = turn.options?.[optionIdx];
    if (!opt) return;
    setPickedIdx(optionIdx);
    const delta = fitDeltaForOptionV2(opt, residenceStance, residenceStanceAlt);
    // v2 — 정렬 가중치(0 / 0.5 / 1) 동기 누적. alignedPicks는 float.
    const alignWeight = optionAlignWeight(opt, {
      stance: residenceStance,
      stanceAlt: residenceStanceAlt,
      envType: residenceEnv,
    });
    pickStatsRef.current = {
      totalPicks: pickStatsRef.current.totalPicks + 1,
      alignedPicks: pickStatsRef.current.alignedPicks + alignWeight,
    };
    pickedLabelsRef.current = [...pickedLabelsRef.current, opt.label];
    // 200ms 강조 후 진행
    window.setTimeout(() => {
      if (opt.next === undefined) {
        finish(delta);
        return;
      }
      setFitDelta((d) => d + delta);
      setTurnIdx(opt.next);
    }, 200);
  };

  const handleNumericSubmit = () => {
    if (!turn.numeric) return;
    const v = Number(numericInput.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(v) || v <= 0) return;
    setLastAmount(v);
    const bm = turn.numeric.benchmarks;
    if (bm) {
      if (v < bm.low) setLastCompare("이 동네 평균보다 절약형이에요.");
      else if (v > bm.high) setLastCompare("이 동네 평균보단 좀 많이 쓰셨어요.");
      else setLastCompare("이 동네 평균 정도예요.");
    }
    setNumericInput("");
    setTurnIdx(turn.numeric.next);
  };

  const sceneBg = MISSION_ID_BG[mission.id] ?? SCENE_BG[mission.background];
  const avatarSrc =
    MISSION_ID_NPC_AVATAR[mission.id] ?? pickNpcAvatar(mission.npc.name);
  const avatarSize = MISSION_ID_NPC_SIZE[mission.id] ?? DEFAULT_NPC_SIZE;

  // NPC 풀씬(워터마크 제거 일러스트)이 있으면 → 풀스크린 씬 + 글래스 대화창 모드.
  // 없으면 기존(클레이 아바타 + 베이지 배경) 그대로.
  const npcScene = mission.npcScene;
  const isPlayerTurn = phase === "player-turn";
  const glassBubble = npcScene ? "bg-white/80 backdrop-blur-xl" : "bg-white";
  const glassOption = npcScene ? "bg-white/45 backdrop-blur-md" : "bg-white";

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] overflow-hidden bg-cream">
      {/* 배경 — npcScene이면 선명 풀스크린, 아니면 베이지+클레이 씬 */}
      {npcScene ? (
        <FullSceneBackground src={npcScene.src} />
      ) : (
        <SceneBackground sceneBg={sceneBg} />
      )}

      {/* 좌상단 — 사운드 토글 */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "사운드 켜기" : "사운드 끄기"}
        className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full bg-white/95 shadow-soft
                   flex items-center justify-center text-[14px]"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* 우상단 — 보상 점수 뱃지 + SKIP */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-white/95 text-primary text-[10px] font-extrabold shadow-soft">
          +{mission.reward}점
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="대화 스킵"
          className="px-3 py-1.5 rounded-full bg-white/95 shadow-soft
                     text-ink-soft text-[11px] font-extrabold tracking-wider"
        >
          SKIP
        </button>
      </div>

      {/* 중앙 — 화자 이름 뱃지 + 캐릭터 (phase에 따라 NPC↔플레이어 전환)
          npcScene 모드에선 캐릭터가 배경에 이미 있으므로 숨김 */}
      {!npcScene && (() => {
        const isPlayer = phase === "player-turn";
        const speakerName = isPlayer ? "나" : mission.npc.name;
        const speakerImg = isPlayer ? PLAYER_AVATAR : avatarSrc;
        const pillBg = isPlayer ? "bg-[#5B9BD5]" : "bg-[#FF7043]";
        // NPC는 풀바디 일러스트 크기, 플레이어("나")는 그보다 약 1/3 작게
        const imgSize = isPlayer ? PLAYER_AVATAR_SIZE : avatarSize;
        return (
          <div
            className="absolute left-1/2 top-[6%] -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={speakerName}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className={`mb-2 px-3 py-1 rounded-full ${pillBg} text-white text-[12px] font-extrabold shadow-soft`}
              >
                {speakerName}
              </motion.span>
            </AnimatePresence>
            <div className="relative">
              {/* 발밑 그림자 — 풀바디 일러스트에 맞춰 크게 */}
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -bottom-1
                           w-60 h-3 rounded-[50%] bg-[#3E2C20]/22 blur-md"
              />
              {/* 전환은 외곽 motion(opacity), 떠다니는 모션은 내부 motion(y) 으로 레이어 분리.
                  exit 시점에 floating이 같이 끼어들지 않아 제자리에서 깔끔하게 페이드. */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={speakerImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative"
                >
                  <motion.img
                    src={speakerImg}
                    alt={speakerName}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`relative ${imgSize} object-contain select-none
                               drop-shadow-[0_8px_12px_rgba(80,70,40,0.25)]`}
                  />
                </motion.div>
              </AnimatePresence>
              {/* 풀바디 일러스트 톤에선 이모지 배지 숨김 — 이미지에 표정/캐릭터성이 이미 있어 중복 */}
            </div>
          </div>
        );
      })()}

      {/* 하단 — 진행 점 + 말풍선 + 선택지/수치 입력 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={turnIdx}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute left-0 right-0 bottom-0 z-20 px-5 pt-3
                     pb-[max(env(safe-area-inset-bottom),20px)]
                     flex flex-col gap-2.5"
        >
          {/* 진행 점 인디케이터 */}
          <div className="flex items-center justify-center gap-1.5">
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

          {/* npcScene 모드 — 누가 말하는지 이름 태그 (캐릭터 뱃지를 숨겼으므로) */}
          {npcScene && (
            <div className="flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-white text-[12px] font-extrabold shadow-soft
                  ${isPlayerTurn ? "bg-[#5B9BD5]" : "bg-[#FF7043]"}`}
              >
                {isPlayerTurn ? "나" : `${mission.npc.emoji} ${mission.npc.name}`}
              </span>
            </div>
          )}

          {/* 말풍선 — 타이핑 중엔 즉시 완료, npc-done에선 플레이어 턴으로 전환.
              player-turn에선 NPC가 한 말을 톤 다운된 상태로 유지(맥락 보존). */}
          <button
            type="button"
            onClick={handleBubbleTap}
            disabled={phase === "player-turn"}
            className={`w-full text-left ${glassBubble} border rounded-3xl shadow-soft
                       px-5 py-4 transition-opacity
                       ${
                         phase === "player-turn"
                           ? "border-cream-200 opacity-70"
                           : "border-cream-200"
                       }`}
          >
            <p className="text-ink text-[14.5px] leading-relaxed font-medium min-h-[3em] whitespace-pre-line">
              {displayed}
              {typing && (
                <span
                  className="inline-block w-[6px] h-[1em] align-[-2px] ml-[2px]
                             bg-ink-soft animate-pulse"
                  aria-hidden
                />
              )}
            </p>
            {/* 탭 안내 — NPC 말 끝나면 깜빡이는 화살표 */}
            {phase === "npc-done" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="mt-2 text-right text-ink-mute text-[11px] font-extrabold tracking-wider"
              >
                탭하여 답하기 →
              </motion.div>
            )}
          </button>

          {/* 옵션 분기 — 플레이어 턴에 진입했을 때만 staggered fade-in */}
          {phase === "player-turn" && turn.options && (
            <div className="flex flex-col gap-2">
              {turn.options.map((opt, i) => {
                const isPicked = pickedIdx === i;
                return (
                  <motion.button
                    key={`${turnIdx}-${i}`}
                    type="button"
                    onClick={() => handlePick(i)}
                    disabled={pickedIdx !== null}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.1 * i,
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3 w-full text-left
                               ${glassOption} rounded-2xl shadow-soft border px-3.5 py-3 transition
                               ${
                                 isPicked
                                   ? "border-primary ring-2 ring-primary scale-[1.02]"
                                   : "border-cream-200"
                               }`}
                  >
                    <img
                      src={PLAYER_AVATAR}
                      alt=""
                      aria-hidden
                      className="w-9 h-9 rounded-full object-cover bg-cream-100"
                    />
                    <span className="flex-1 text-ink text-[14px] font-semibold leading-snug">
                      {opt.label}
                    </span>
                  </motion.button>
                );
              })}
              {/* 부정 답변 — 정렬 0 카운트. 솔직히 안 맞는다고 표현할 수 있는 채널.
                  적합도 = 답한 옵션 중 정렬된 비율 이므로 이 답이 누적되면 적합도가 내려감. */}
              <motion.button
                type="button"
                onClick={handleNegativePick}
                disabled={pickedIdx !== null}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.1 * (turn.options.length),
                  duration: 0.22,
                  ease: "easeOut",
                }}
                whileTap={{ scale: 0.97 }}
                className={`mt-1 self-center text-ink-mute text-[12.5px] font-bold
                           underline-offset-2 underline px-3 py-1.5 rounded-full
                           ${pickedIdx === -1 ? "text-primary no-underline ring-2 ring-primary bg-white" : ""}`}
              >
                음… 솔직히 나랑은 안 맞는 것 같아요
              </motion.button>
            </div>
          )}

          {/* 수치 입력 — 플레이어 턴에서만 */}
          {phase === "player-turn" && turn.numeric && (
            <div className="bg-white rounded-2xl shadow-soft border border-cream-200 px-4 py-4">
              <label className="text-[11px] font-bold text-ink-soft block mb-1.5">
                {turn.numeric.prompt}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericInput}
                  onChange={(e) =>
                    setNumericInput(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder={turn.numeric.placeholder}
                  className="flex-1 px-4 py-3 rounded-2xl border border-cream-200
                             bg-cream-50 text-ink text-[14px] focus:outline-none
                             focus:border-primary placeholder:text-ink-mute"
                />
                <span className="text-ink-soft text-[12px] font-bold pr-1">
                  {turn.numeric.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNumericSubmit}
                disabled={!numericInput}
                className="mt-2.5 w-full py-3 rounded-2xl bg-primary text-white
                           text-[14px] font-extrabold shadow-soft active:scale-[0.99]
                           disabled:opacity-40 disabled:active:scale-100"
              >
                기록하기
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 미션 완료 보상 오버레이 */}
      <AnimatePresence>
        {showReward && <RewardOverlay reward={mission.reward} />}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 배경 — 베이지 그라데이션 + (선택) 클레이 씬 + 가독성 마스크
// =====================================================================

// 풀스크린 NPC 씬 배경 — 선명한 이미지 전체화면 + 상/하 가독성 스크림
function FullSceneBackground({ src }: { src: string }) {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-cream"
      aria-hidden
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/12 to-transparent" />
    </div>
  );
}

function SceneBackground({ sceneBg }: { sceneBg: string | undefined }) {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFE4C8] via-cream to-cream-100" />
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
