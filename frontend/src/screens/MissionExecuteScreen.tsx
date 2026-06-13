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
  type NumericInputSpec,
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
  // "내 기록" — 사용자가 NPC 발언을 기억하기로 선택했을 때 호출
  onSaveQuote?: (text: string) => void;
};

export default function MissionExecuteScreen({
  mission,
  residenceStance,
  residenceStanceAlt,
  residenceEnv,
  // onClose 는 props 로 받지만 현재 화면에선 미사용 (SKIP 제거 — 사용자 피드백).
  // BottomNav 로 다른 탭 이동 시 App.tsx 에서 정리. 추후 닫기 버튼이 다시 필요할 수 있어 시그니처 유지.
  onClose: _onClose,
  onComplete,
  onSaveQuote,
}: Props) {
  const [turnIdx, setTurnIdx] = useState(0);
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
  // 턴 내 진행 단계 — opener(내가 먼저 묻기) → npc 말 중 → npc 말 끝(탭 대기) → 플레이어 답할 차례
  // mission.opener 가 정의되면 "opener" 단계부터 시작. 아니면 곧장 NPC 가 말 검.
  const [phase, setPhase] = useState<
    "opener" | "npc-typing" | "npc-done" | "player-turn"
  >(mission.opener ? "opener" : "npc-typing");
  // 사용자가 opener 에서 던진 질문 — 대화 내내 상단 배너에 노출되어 "내가 물어본 것" 기억
  const [openerLabel, setOpenerLabel] = useState<string | null>(null);
  // 이번 턴의 NPC 발언을 기억해뒀는지 — 북마크 토글
  const [savedTurnSet, setSavedTurnSet] = useState<Set<number>>(new Set());
  // 추측 비교 카드 — numeric 미션에서 사용자 추측 + 마을/도시 평균을 시각화.
  // 다음 사용자 액션(npc-done → player-turn 진입) 후 자동으로 사라짐.
  const [numericReveal, setNumericReveal] = useState<
    | {
        guess: number;
        spec: NumericInputSpec;
      }
    | null
  >(null);
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

  // 타이핑 효과 — 45ms/글자. phase 가 "npc-typing" 일 때만 실행.
  // opener / npc-done / player-turn 단계에서는 타이핑 안 함 (의도된 흐름 유지).
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    if (phase !== "npc-typing") return;
    setDisplayed("");
    setTyping(true);
    setPickedIdx(null);
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
    }, 45);
    return () => window.clearInterval(id);
  }, [phase, npcText]);

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
    const stats = { ...pickStatsRef.current };
    const labels = [...pickedLabelsRef.current];
    // 옛 "미션 완료!" 오버레이 제거 — 곧장 결과 화면으로
    onComplete(total, stats, labels);
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
      setPhase("npc-typing");
    }, 200);
  };

  // === 능동: 사용자가 NPC 에게 먼저 묻기 ===
  // opener.options 중 하나 선택 → 그 질문이 사용자 발언으로 기록되고,
  // nextTurn 으로 진입해 NPC 가 그 질문에 답하는 흐름.
  const handleOpenerPick = (i: number) => {
    if (!mission.opener) return;
    const opt = mission.opener.options[i];
    if (!opt) return;
    setOpenerLabel(opt.label);
    pickedLabelsRef.current = [...pickedLabelsRef.current, opt.label];
    pickStatsRef.current = {
      totalPicks: pickStatsRef.current.totalPicks + 1,
      // opener 질문은 "능동적 선택" 이라 정렬로 카운트 (가중 1)
      alignedPicks: pickStatsRef.current.alignedPicks + 1,
    };
    setTurnIdx(opt.nextTurn);
    setPhase("npc-typing");
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
      setPhase("npc-typing");
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
    // 추측 비교 카드 — villageActual / cityActual 정의돼 있으면 노출
    if (turn.numeric.villageActual !== undefined && turn.numeric.cityActual !== undefined) {
      setNumericReveal({ guess: v, spec: turn.numeric });
    }
    setNumericInput("");
    setTurnIdx(turn.numeric.next);
    setPhase("npc-typing");
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
    <div
      className="relative overflow-hidden bg-cream"
      style={{ minHeight: "calc(100dvh - var(--content-bottom))" }}
    >
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

      {/* 우상단 — 보상 점수 뱃지 (SKIP 제거 — 사용자 피드백) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-white/95 text-primary text-[10px] font-extrabold shadow-soft">
          +{mission.reward}점
        </span>
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

      {/* === 추측 비교 카드 — numeric 미션 reveal === */}
      {numericReveal && phase !== "opener" && (
        <NumericRevealCard
          guess={numericReveal.guess}
          spec={numericReveal.spec}
          onDismiss={() => setNumericReveal(null)}
        />
      )}

      {/* === 능동 단계: 내가 먼저 묻기 (opener) === */}
      {phase === "opener" && mission.opener && (
        <OpenerPanel
          prompt={mission.opener.prompt}
          options={mission.opener.options}
          npcEmoji={mission.npc.emoji}
          npcName={mission.npc.name}
          glassOption={glassOption}
          onPick={handleOpenerPick}
        />
      )}

      {/* 하단 — 진행 점 + 말풍선 + 선택지/수치 입력 (opener 가 아닐 때만) */}
      {phase !== "opener" && (
      <AnimatePresence mode="wait">
        <motion.div
          key={turnIdx}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute left-0 right-0 bottom-0 z-20 px-5 pt-3
                     pb-[max(env(safe-area-inset-bottom),40px)]
                     flex flex-col gap-2.5"
        >
          {/* 내가 던진 질문 — opener 사용 시 대화 내내 작은 배너로 유지 */}
          {openerLabel && (
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                           bg-[#5B9BD5] text-white text-[11px] font-extrabold shadow-soft
                           max-w-[88vw]"
              >
                <span aria-hidden className="text-[10px] opacity-85">내가 던진 질문</span>
                <span className="opacity-50">·</span>
                <span className="truncate italic">"{openerLabel}"</span>
              </span>
            </div>
          )}

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

          {/* 말풍선 + 북마크. 외곽 wrap div 로 두 요소 분리 — 북마크 클릭이 bubble tap 흡수되지 않도록. */}
          <div className="relative">
            <button
              type="button"
              onClick={handleBubbleTap}
              disabled={phase === "player-turn"}
              className={`w-full text-left ${glassBubble} border rounded-3xl shadow-soft
                         px-5 py-4 pr-12 transition-opacity
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

            {/* === 내 기록 — 북마크 토글. NPC 말 끝났을 때만 노출
                  (이 분기는 이미 phase !== "opener" 안쪽이라 추가 가드 X) === */}
            {!typing && onSaveQuote && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (savedTurnSet.has(turnIdx)) return; // 이미 저장됨
                  onSaveQuote(npcText);
                  setSavedTurnSet((prev) => {
                    const next = new Set(prev);
                    next.add(turnIdx);
                    return next;
                  });
                }}
                aria-label={
                  savedTurnSet.has(turnIdx) ? "기억해둠" : "이 말 기억하기"
                }
                className={`absolute top-3 right-3 w-8 h-8 rounded-full
                           flex items-center justify-center text-[14px]
                           transition active:scale-90
                           ${
                             savedTurnSet.has(turnIdx)
                               ? "bg-primary text-white shadow-[0_2px_8px_rgba(255,112,67,0.4)]"
                               : "bg-cream-100 text-ink-soft hover:bg-cream-200"
                           }`}
              >
                {savedTurnSet.has(turnIdx) ? "✓" : "🔖"}
              </button>
            )}
          </div>

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
      )}

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

// =====================================================================
// NumericRevealCard — "추측 → 정답 비교"
//   · 사용자 추측 + 마을 평균 + 도시 평균 3개를 비교 막대로 표시
//   · 갭이 가장 큰 비교 한 문장: "도시보다 약 4,500원 적네요"
//   · 카드 우측 상단 ✕ 버튼으로 직접 닫기 가능
// =====================================================================

function NumericRevealCard({
  guess,
  spec,
  onDismiss,
}: {
  guess: number;
  spec: NumericInputSpec;
  onDismiss: () => void;
}) {
  const village = spec.villageActual ?? 0;
  const city = spec.cityActual ?? 0;
  const max = Math.max(guess, village, city, 1);
  const fmt = (n: number) => n.toLocaleString();

  // 갭 비교 — 도시 대비 얼마나 절약/풍족인지
  const vsCityDiff = village - city; // 마을이 도시보다 얼마 적은가 (음수면 비쌈)
  const vsCityText =
    vsCityDiff < 0
      ? `이 동네는 도시보다 ${fmt(Math.abs(vsCityDiff))}원 저렴해요`
      : vsCityDiff > 0
      ? `이 동네는 도시보다 ${fmt(vsCityDiff)}원 비싸요`
      : "도시랑 같네요";

  // 내 추측은 어떻게 비껴갔는가
  const guessGap = guess - village;
  const guessText =
    Math.abs(guessGap) < village * 0.1
      ? "거의 비슷하게 맞췄어요"
      : guessGap > 0
      ? `${fmt(Math.abs(guessGap))}원 더 높게 추측했어요`
      : `${fmt(Math.abs(guessGap))}원 더 낮게 추측했어요`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 240 }}
      className="absolute left-4 right-4 top-[15%] z-30
                 bg-white rounded-3xl shadow-[0_12px_30px_-8px_rgba(62,44,32,0.3)]
                 border border-cream-200 p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-extrabold text-primary tracking-[0.18em] uppercase">
            추측 vs 실제
          </p>
          <p className="text-ink text-[14px] font-extrabold mt-0.5">
            {guessText}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="닫기"
          className="w-7 h-7 rounded-full bg-cream-100 text-ink-soft text-[12px] font-bold
                     flex items-center justify-center active:scale-95"
        >
          ✕
        </button>
      </div>

      {/* 비교 막대 3개 */}
      <div className="space-y-2.5">
        <RevealBar
          label="내 추측"
          amount={guess}
          max={max}
          color="#5B9BD5"
          isMine
        />
        <RevealBar
          label="이 동네 평균"
          amount={village}
          max={max}
          color="#FF7043"
        />
        <RevealBar
          label="도시(서울) 평균"
          amount={city}
          max={max}
          color="#9A8778"
        />
      </div>

      {/* 한 줄 갭 인사이트 */}
      <p className="mt-3 text-ink-soft text-[11.5px] text-center leading-relaxed">
        💡 {vsCityText}
      </p>
    </motion.div>
  );
}

function RevealBar({
  label,
  amount,
  max,
  color,
  isMine,
}: {
  label: string;
  amount: number;
  max: number;
  color: string;
  isMine?: boolean;
}) {
  const pct = Math.min(100, (amount / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] mb-0.5">
        <span className={`font-bold ${isMine ? "text-[#5B9BD5]" : "text-ink-soft"}`}>
          {isMine && "✦ "}
          {label}
        </span>
        <span
          className={`font-extrabold tabular-nums ${
            isMine ? "text-[#5B9BD5]" : "text-ink"
          }`}
        >
          {amount.toLocaleString()}원
        </span>
      </div>
      <div className="h-2 rounded-full bg-cream-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// =====================================================================
// OpenerPanel — "내가 먼저 묻기" UI
//   · 상단 prompt: "어르신께 무엇을 물어볼까?"
//   · 그 아래 질문 카드 3개 — 클릭하면 그 질문이 dialogue 진입의 nextTurn 으로 분기
//   · 능동성 핵심: NPC 가 먼저 말 거는 게 아니라 사용자가 먼저 던지는 톤
// =====================================================================

function OpenerPanel({
  prompt,
  options,
  npcEmoji,
  npcName,
  glassOption,
  onPick,
}: {
  prompt: string;
  options: { label: string; emoji?: string; nextTurn: number }[];
  npcEmoji: string;
  npcName: string;
  glassOption: string;
  onPick: (i: number) => void;
}) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute left-0 right-0 bottom-0 z-20 px-5 pt-3
                 pb-[max(env(safe-area-inset-bottom),40px)]
                 flex flex-col gap-3"
    >
      {/* 상단 헤더 — NPC 가 침묵 중임을 짧게 명시 */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur
                         text-ink-mute text-[10.5px] font-extrabold tracking-wide">
          {npcEmoji} {npcName} 께서 마루에 앉아 계세요
        </span>
        <p className="text-ink text-[16.5px] font-extrabold text-center leading-tight
                      [text-shadow:0_1px_2px_rgba(255,255,255,0.7)]">
          {prompt}
        </p>
      </div>

      {/* 질문 카드들 — 스태거 등장. emoji + 질문 텍스트 */}
      <div className="flex flex-col gap-2 mt-1">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + 0.08 * i, duration: 0.25 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-3 w-full text-left
                       ${glassOption} rounded-2xl shadow-soft border border-cream-200
                       px-4 py-3 transition`}
          >
            <span
              aria-hidden
              className="w-10 h-10 rounded-full bg-cream-50 border border-cream-200
                         flex items-center justify-center text-[20px] shrink-0"
            >
              {opt.emoji ?? "💭"}
            </span>
            <span className="flex-1 text-ink text-[14px] font-semibold leading-snug">
              "{opt.label}"
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
