// 청풍 온보딩 셸 — 스플래시 → 10개 질문 → 결과 화면 흐름 관리
// 각 단계는 독립 컴포넌트로 분리되어 있고, 셸이 데이터 누적 + 화면 전환을 담당한다.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "./SplashScreen";
import IntroScreen from "./IntroScreen";
import EmailScreen from "./EmailScreen";
import BirthScreen from "./BirthScreen";
import HomeRegionScreen from "./HomeRegionScreen";
import InterestsScreen from "./InterestsScreen";
import BalanceScreen from "./BalanceScreen";
import ValuesScreen from "./ValuesScreen";
import SceneScreen from "./SceneScreen";
import HealingScreen from "./HealingScreen";
import RegionDescScreen from "./RegionDescScreen";
import ResultScreen from "./ResultScreen";
import {
  initialOnboardingData,
  scoreOnboarding,
  type OnboardingData,
  type BalanceA,
  type BalanceB,
  type BalanceC,
} from "../../data/quiz";
import type { LifeStyleType } from "../../data/residences";

type StepKey =
  | "splash"
  | "intro"
  | "email"
  | "birth"
  | "homeRegion"
  | "interests"
  | "balanceA"
  | "balanceB"
  | "balanceC"
  | "values"
  | "scene"
  | "healing"
  | "regionDesc"
  | "result";

const ORDER: StepKey[] = [
  "splash",
  "intro",
  "email",
  "birth",
  "homeRegion",
  "interests",
  "balanceA",
  "balanceB",
  "balanceC",
  "values",
  "scene",
  "healing",
  "regionDesc",
  "result",
];

const TOTAL_QUESTIONS = 11;

// onComplete 시 App에 넘기는 결과 — App.tsx는 lifestyle을 SavedProfile에 저장
export type OnboardingResult = {
  lifestyle: LifeStyleType;
  data: OnboardingData;
};

type Props = {
  onComplete: (r: OnboardingResult) => void;
};

export default function OnboardingShell({ onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);

  const step = ORDER[stepIdx];

  const back = () => setStepIdx((i) => Math.max(0, i - 1));
  const advance = () => setStepIdx((i) => Math.min(ORDER.length - 1, i + 1));

  // 단계별 부분 데이터 업데이트 후 다음으로
  const update = <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData((d) => ({ ...d, [key]: value }));
    advance();
  };

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.26 }}
        >
          {step === "splash" && <SplashScreen onDone={advance} />}

          {step === "intro" && <IntroScreen onDone={advance} />}

          {step === "email" && (
            <EmailScreen
              step={1}
              total={TOTAL_QUESTIONS}
              initial={data.email}
              onBack={back}
              onNext={(email) => update("email", email)}
            />
          )}

          {step === "birth" && (
            <BirthScreen
              step={2}
              total={TOTAL_QUESTIONS}
              initial={data.birth}
              onBack={back}
              onNext={(birth) => update("birth", birth)}
            />
          )}

          {step === "homeRegion" && (
            <HomeRegionScreen
              step={3}
              total={TOTAL_QUESTIONS}
              initial={data.homeRegion}
              onBack={back}
              onNext={(name) => update("homeRegion", name)}
            />
          )}

          {step === "interests" && (
            <InterestsScreen
              step={4}
              total={TOTAL_QUESTIONS}
              initial={data.interests}
              onBack={back}
              onNext={(interests) => update("interests", interests)}
            />
          )}

          {step === "balanceA" && (
            <BalanceScreen<BalanceA>
              step={5}
              total={TOTAL_QUESTIONS}
              title="무엇이 더 좋나요?"
              subtitle="자연 풍경, 어느 쪽이 더 마음에 들어요?"
              left={{
                value: "mountain",
                label: "산",
                emoji: "⛰️",
                blurb: "고요한 산세, 아침 안개",
              }}
              right={{
                value: "sea",
                label: "바다",
                emoji: "🌊",
                blurb: "파도 소리, 시원한 수평선",
              }}
              initial={data.balanceA}
              onBack={back}
              onNext={(v) => update("balanceA", v)}
            />
          )}

          {step === "balanceB" && (
            <BalanceScreen<BalanceB>
              step={6}
              total={TOTAL_QUESTIONS}
              title="비 오는 주말, 어느 쪽?"
              left={{
                value: "read",
                label: "혼자 책 읽기",
                emoji: "📖",
                blurb: "조용한 시간",
              }}
              right={{
                value: "chat",
                label: "친구와 수다",
                emoji: "💬",
                blurb: "활기찬 대화",
              }}
              initial={data.balanceB}
              onBack={back}
              onNext={(v) => update("balanceB", v)}
            />
          )}

          {step === "balanceC" && (
            <BalanceScreen<BalanceC>
              step={7}
              total={TOTAL_QUESTIONS}
              title="어디에서 묵고 싶어요?"
              left={{
                value: "hanok",
                label: "한옥 민박",
                emoji: "🏯",
                blurb: "기와와 마당이 있는",
              }}
              right={{
                value: "modern",
                label: "모던 게스트하우스",
                emoji: "🛋️",
                blurb: "감각적인 인테리어",
              }}
              initial={data.balanceC}
              onBack={back}
              onNext={(v) => update("balanceC", v)}
            />
          )}

          {step === "values" && (
            <ValuesScreen
              step={8}
              total={TOTAL_QUESTIONS}
              initial={data.values}
              onBack={back}
              onNext={(values) => update("values", values)}
            />
          )}

          {step === "scene" && (
            <SceneScreen
              step={9}
              total={TOTAL_QUESTIONS}
              initial={data.dayScene}
              onBack={back}
              onNext={(scene) => update("dayScene", scene)}
            />
          )}

          {step === "healing" && (
            <HealingScreen
              step={10}
              total={TOTAL_QUESTIONS}
              initial={data.healing}
              onBack={back}
              onNext={(healing) => update("healing", healing)}
            />
          )}

          {step === "regionDesc" && (
            <RegionDescScreen
              step={11}
              total={TOTAL_QUESTIONS}
              initial={data.regionDesc}
              onBack={back}
              onNext={(desc) => {
                setData((d) => ({ ...d, regionDesc: desc }));
                advance();
              }}
            />
          )}

          {step === "result" && (
            <ResultScreen
              type={scoreOnboarding(data)}
              onStart={() =>
                onComplete({ lifestyle: scoreOnboarding(data), data })
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
