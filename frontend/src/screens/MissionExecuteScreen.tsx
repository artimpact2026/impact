// 미션 수행 화면 — 풀스크린 NPC + 말풍선 + 선택지 카드 UI
// 레퍼런스: 카카오 당근이/단추 앱 스타일
//
// 데이터 구조(dialogues: DialogueTurn[], options.next, numeric, fitDelta)는 그대로.
// 시각만 새 스펙(풀스크린 캐릭터 + 이름 뱃지 + 타이핑 말풍선 + 좌측 썸네일 선택지)으로 교체.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fitDeltaForOptionV2,
  type BackgroundVariant,
  type Mission,
} from "../data/missions";
import type { Stance } from "../data/lifestyle";

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

// 미션별 NPC 아바타 크기 override — 풀바디 일러스트는 크게 노출
// 값은 Tailwind 임의값 사이즈 (예: "w-[78vw] max-w-[420px]")
const MISSION_ID_NPC_SIZE: Record<string, string> = {
  hospital: "w-[78vw] max-w-[420px] h-auto",
};
const DEFAULT_NPC_SIZE = "w-40 h-40";

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
  onClose: () => void;
  // 누적 적합도 변화량을 함께 전달
  onComplete: (fitDelta: number) => void;
};

export default function MissionExecuteScreen({
  mission,
  residenceStance,
  residenceStanceAlt,
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
    window.setTimeout(() => onComplete(total), 1800);
  };

  const handlePick = (optionIdx: number) => {
    if (pickedIdx !== null) return;
    const opt = turn.options?.[optionIdx];
    if (!opt) return;
    setPickedIdx(optionIdx);
    const delta = fitDeltaForOptionV2(opt, residenceStance, residenceStanceAlt);
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
  // 풀바디 일러스트(미션 override 사이즈) 사용 시 위치/그림자/이모지도 함께 조정
  const isLargeAvatar = mission.id in MISSION_ID_NPC_SIZE;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] overflow-hidden bg-cream">
      {/* 배경 — 베이지 그라데이션 + 은은한 클레이 씬 */}
      <SceneBackground sceneBg={sceneBg} />

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

      {/* 중앙 — 화자 이름 뱃지 + 캐릭터 (phase에 따라 NPC↔플레이어 전환) */}
      {(() => {
        const isPlayer = phase === "player-turn";
        const speakerName = isPlayer ? "나" : mission.npc.name;
        const speakerImg = isPlayer ? PLAYER_AVATAR : avatarSrc;
        const pillBg = isPlayer ? "bg-[#5B9BD5]" : "bg-[#FF7043]";
        // 미션 override 사이즈는 NPC·플레이어 양쪽에 동일 적용
        const imgSize = avatarSize;
        // 큰 일러스트는 위치를 살짝 올리고 그림자도 키움
        const containerTop = isLargeAvatar ? "top-[6%]" : "top-[14%]";
        const shadowW = isLargeAvatar ? "w-60" : "w-28";
        return (
          <div
            className={`absolute left-1/2 ${containerTop} -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none`}
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
              {/* 발밑 그림자 — 일러스트 크기에 맞춰 스케일 */}
              <div
                aria-hidden
                className={`absolute left-1/2 -translate-x-1/2 -bottom-1
                           ${shadowW} h-3 rounded-[50%] bg-[#3E2C20]/22 blur-md`}
              />
              {/* 캐릭터 전환은 제자리에서 순수 opacity 크로스페이드 — 위치·크기 변화 없음 */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={speakerImg}
                  src={speakerImg}
                  alt={speakerName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`relative ${imgSize} object-contain select-none
                             drop-shadow-[0_8px_12px_rgba(80,70,40,0.25)]`}
                />
              </AnimatePresence>
              {/* NPC 이모지 — NPC 차례일 때만 표시, 큰 일러스트는 이모지 숨김(가독성) */}
              {!isPlayer && !isLargeAvatar && (
                <div
                  className="absolute -top-1 -right-1 w-10 h-10 rounded-full
                             bg-white shadow-soft ring-2 ring-cream-200
                             flex items-center justify-center text-[22px]"
                >
                  <span aria-hidden>{mission.npc.emoji}</span>
                </div>
              )}
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

          {/* 말풍선 — 타이핑 중엔 즉시 완료, npc-done에선 플레이어 턴으로 전환.
              player-turn에선 NPC가 한 말을 톤 다운된 상태로 유지(맥락 보존). */}
          <button
            type="button"
            onClick={handleBubbleTap}
            disabled={phase === "player-turn"}
            className={`w-full text-left bg-white border rounded-3xl shadow-soft
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
                               bg-white rounded-2xl shadow-soft border px-3.5 py-3 transition
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
