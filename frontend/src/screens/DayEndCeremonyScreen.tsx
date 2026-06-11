// 오늘 하루 끝 — 일차 미션 완료 시 등장
// 좌상단 X로 닫기 + 집 레벨업 + 다음 행동 제안 카드들
// "Day N+1 시작" 같은 강제 흐름 없이, 사용자가 자연스럽게 머무를 수 있게

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HouseStage from "../components/HouseStage";
import { SPACE_STAGE_NAMES } from "../data/dayPlan";
import {
  GANGHWA_ID,
  HANSEOL_DAY_CLOSE,
  HANSEOL_IMAGE,
  HANSEOL_NAME,
} from "../data/ganghwaStory";

type StageNumber = 0 | 1 | 2 | 3;

type Suggestion = {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
};

type Props = {
  region: string;
  residenceId: string;
  finishedDay: number;
  totalDays: number;
  prevStage: StageNumber;
  newStage: StageNumber;
  // 좌상단 X — 마을 홈으로 닫기. 호출 측에서 일차 진행도 함께 처리.
  onClose: () => void;
  // 하단 제안 카드들 — 호출 측에서 navigation + 일차 진행
  suggestions: Suggestion[];
};

export default function DayEndCeremonyScreen({
  region,
  residenceId,
  finishedDay,
  totalDays,
  prevStage,
  newStage,
  onClose,
  suggestions,
}: Props) {
  // 한설 마무리 — 강화 + day 1/2/3 만 적용
  const hanseolClose =
    residenceId === GANGHWA_ID && (finishedDay === 1 || finishedDay === 2 || finishedDay === 3)
      ? HANSEOL_DAY_CLOSE[finishedDay as 1 | 2 | 3]
      : undefined;
  const isFarewell = finishedDay === 3;
  const [stage, setStage] = useState<StageNumber>(prevStage);

  useEffect(() => {
    if (prevStage === newStage) return;
    const t = setTimeout(() => setStage(newStage), 900);
    return () => clearTimeout(t);
  }, [prevStage, newStage]);

  const isFinalDay = finishedDay >= totalDays;
  const leveledUp = prevStage !== newStage;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-gradient-to-b from-cream via-cream to-nature-50 overflow-hidden">
      {/* 좌상단 X */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-10 left-4 z-20 w-9 h-9 rounded-full
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

      {/* ① Hero — full-bleed. 집을 카드 밖으로 빼서 화면 위쪽에 큼직하게 */}
      <section className="relative w-full h-[280px] overflow-hidden">
        {/* sky 그라데이션 — 위는 따뜻한 크림, 아래는 nature-50 톤 (페이지 본문과 자연 연결) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#FFF8EC] via-cream to-[#F0F8F1]"
        />
        {/* 옅은 ground hint + 하단 페이드 */}
        <svg
          viewBox="0 0 375 280"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="dayEndFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0F8F1" stopOpacity="0" />
              <stop offset="100%" stopColor="#F0F8F1" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* 집이 공중에 떠 보이지 않게 옅은 ground ellipse */}
          <ellipse cx="187" cy="238" rx="160" ry="6" fill="#D9B68A" opacity="0.35" />
          {/* 하단 페이드 — 페이지 본문 배경과 자연 전환 */}
          <rect x="0" y="220" width="375" height="60" fill="url(#dayEndFade)" />
        </svg>

        {/* 상단 좌측 라벨 — DAY 카운트 (X 버튼 오른쪽 정도 높이) */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-12 left-5 z-10 text-[11px] font-extrabold tracking-[0.16em] uppercase text-primary"
        >
          {region} · DAY {finishedDay} / {totalDays}
        </motion.p>

        {/* HouseStage scenic — 가운데 하단 큼직하게 */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[220px]"
        >
          <HouseStage stage={stage} className="w-full h-auto" scenic />
        </motion.div>
      </section>

      {/* ② 타이틀 — Hero 아래 가운데 정렬, 시원하게 */}
      <header className="px-6 mt-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-ink text-[28px] font-extrabold leading-tight"
        >
          {isFinalDay ? "잠시섬 마지막 날" : "오늘 하루, 끝났어요"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-ink-soft text-[14px] leading-relaxed"
        >
          {isFinalDay
            ? "이 동네에서의 시간을 천천히 마무리해요"
            : leveledUp
            ? "나의 공간이 한 자리 더 자랐어요"
            : "오늘은 머무는 하루였어요"}
        </motion.p>
      </header>

      {/* ②.5 한설 마무리 — 강화 + day 1/2/3 만. day 3 는 작별 톤(외곽선 강조) */}
      {hanseolClose && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="mt-5 mx-5"
        >
          <div
            className={`flex items-start gap-3 rounded-2xl p-3.5
                       ${
                         isFarewell
                           ? "bg-primary-50 border-2 border-primary/30 shadow-soft"
                           : "bg-white border border-cream-200 shadow-soft"
                       }`}
          >
            <span
              aria-hidden
              className="w-12 h-12 rounded-full bg-cover bg-center shrink-0
                         border border-white shadow-soft"
              style={{ backgroundImage: `url(${HANSEOL_IMAGE})` }}
            />
            <div className="min-w-0">
              <p className="text-[10.5px] font-extrabold tracking-[0.16em] uppercase text-primary">
                {isFarewell ? `${HANSEOL_NAME}의 작별` : `${HANSEOL_NAME}의 한마디`}
              </p>
              <p className="mt-1 text-ink text-[13.5px] leading-relaxed">
                {hanseolClose}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ③ 단계 표시 — 가운데 정렬 (카드 밖) */}
      <section className="mt-7 flex flex-col items-center gap-2">
        <p className="text-[10.5px] font-bold text-ink-mute tracking-[0.16em] uppercase">
          나의 공간
        </p>
        <motion.span
          key={stage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-3 py-1 rounded-full bg-primary-50 text-primary text-[13px] font-extrabold"
        >
          {SPACE_STAGE_NAMES[stage]}
        </motion.span>
        <div
          className="mt-1 flex items-center gap-1.5"
          aria-label={`단계 ${stage + 1}/4`}
        >
          {[0, 1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all
                ${s === stage
                  ? "w-6 bg-primary"
                  : s < stage
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-cream-200"}`}
              aria-hidden
            />
          ))}
        </div>
      </section>

      {/* ④ 다음 행동 제안 — 여백 넉넉히 */}
      <section className="mt-10 px-5 pb-8">
        <p className="text-[10.5px] font-bold text-ink-mute tracking-[0.18em] uppercase">
          Next
        </p>
        <p className="mt-0.5 text-ink text-[16px] font-extrabold">
          이런 건 어때요?
        </p>
        <ul className="mt-3 space-y-2.5">
          {suggestions.map((s, i) => {
            const iconBg = i % 2 === 0 ? "bg-nature-50" : "bg-primary-50";
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              >
                <button
                  type="button"
                  onClick={s.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                             bg-white border border-cream-200 shadow-soft
                             text-left active:scale-[0.99] transition hover:bg-cream-50/60"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${iconBg}
                               flex items-center justify-center text-xl shrink-0`}
                    aria-hidden
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-[14.5px] font-extrabold leading-tight">
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-ink-soft text-[12px] leading-snug truncate">
                      {s.subtitle}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-ink-mute shrink-0"
                    aria-hidden
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
