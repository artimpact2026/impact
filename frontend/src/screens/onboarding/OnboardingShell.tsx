// 청풍 온보딩 셸 — 스플래시 → 10개 질문 → 결과 화면 흐름 관리
// 각 단계는 독립 컴포넌트로 분리되어 있고, 셸이 데이터 누적 + 화면 전환을 담당한다.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "./SplashScreen";
import IntroScreen from "./IntroScreen";
import EmailScreen from "./EmailScreen";
import HomeRegionScreen from "./HomeRegionScreen";
import InterestsScreen from "./InterestsScreen";
import BalanceScreen from "./BalanceScreen";
import ValuesScreen from "./ValuesScreen";
import SceneScreen from "./SceneScreen";
import HealingScreen from "./HealingScreen";
import RegionDescScreen from "./RegionDescScreen";
import EnvChoiceScreen from "./EnvChoiceScreen";
import NicknameScreen from "./NicknameScreen";
import ResultScreen from "./ResultScreen";
import {
  initialOnboardingData,
  scoreOnboarding,
  type OnboardingData,
  type BalanceB,
  type BalanceC,
} from "../../data/quiz";
import { stanceToOld, type LifestyleProfile } from "../../data/lifestyle";
import type { LifeStyleType } from "../../data/residences";

type StepKey =
  | "splash"
  | "intro"
  | "email"
  | "homeRegion"
  | "interests"
  | "balanceB"
  | "balanceC"
  | "values"
  | "scene"
  | "healing"
  | "envChoice"
  | "regionDesc"
  | "nickname"
  | "result";

const ORDER: StepKey[] = [
  "splash",
  "intro",
  "nickname",     // 닉네임을 첫 질문으로 이동
  "email",
  "homeRegion",
  "interests",
  "balanceB",
  "balanceC",
  "values",
  "scene",
  "healing",
  "envChoice",
  "regionDesc",
  "result",
];

const TOTAL_QUESTIONS = 11; // birth(나이) 단계 제거 — 그 만큼 줄임

// onComplete 시 App에 넘기는 결과
// lifestyle = 옛 LifeStyleType (App.tsx 매칭 호환), profile = 새 시스템 (env + stance)
export type OnboardingResult = {
  lifestyle: LifeStyleType;
  profile: LifestyleProfile;
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

          {step === "nickname" && (
            <NicknameScreen
              step={1}
              total={TOTAL_QUESTIONS}
              initial={data.nickname}
              onBack={back}
              onNext={(name) => update("nickname", name)}
            />
          )}

          {step === "email" && (
            <EmailScreen
              step={2}
              total={TOTAL_QUESTIONS}
              initial={data.email}
              onBack={back}
              onNext={(email) => update("email", email)}
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

          {step === "balanceB" && (
            <BalanceScreen<BalanceB>
              step={5}
              total={TOTAL_QUESTIONS}
              title="한가한 주말 오후, 어떻게 보내고 싶어요?"
              left={{
                value: "alone",
                label: "혼자 사부작",
                emoji: "📖",
                blurb: "내 시간에 집중",
              }}
              right={{
                value: "together",
                label: "친구들과 어울리기",
                emoji: "💬",
                blurb: "사람들과 함께",
              }}
              initial={data.balanceB}
              onBack={back}
              onNext={(v) => update("balanceB", v)}
            />
          )}

          {step === "balanceC" && (
            <BalanceScreen<BalanceC>
              step={6}
              total={TOTAL_QUESTIONS}
              title="낯선 동네에서 끌리는 시간은?"
              left={{
                value: "rest",
                label: "멍 때리기",
                emoji: "🍵",
                blurb: "흘려보내는 시간",
              }}
              right={{
                value: "make",
                label: "뭔가 만들기",
                emoji: "🪵",
                blurb: "무언가 짓는 시간",
              }}
              initial={data.balanceC}
              onBack={back}
              onNext={(v) => update("balanceC", v)}
            />
          )}

          {step === "values" && (
            <ValuesScreen
              step={7}
              total={TOTAL_QUESTIONS}
              initial={data.values}
              onBack={back}
              onNext={(values) => update("values", values)}
            />
          )}

          {step === "scene" && (
            <SceneScreen
              step={8}
              total={TOTAL_QUESTIONS}
              initial={data.dayScene}
              onBack={back}
              onNext={(scene) => update("dayScene", scene)}
            />
          )}

          {step === "healing" && (
            <HealingScreen
              step={9}
              total={TOTAL_QUESTIONS}
              initial={data.healing}
              onBack={back}
              onNext={(healing) => update("healing", healing)}
            />
          )}

          {step === "envChoice" && (
            <EnvChoiceScreen
              step={10}
              total={TOTAL_QUESTIONS}
              initial={data.envChoice}
              onBack={back}
              onNext={(env) => update("envChoice", env)}
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

          {step === "result" && (() => {
            const profile = scoreOnboarding(data);
            const lifestyle = stanceToOld(profile.stance);
            return (
              <ResultScreen
                profile={profile}
                onStart={() =>
                  onComplete({ lifestyle, profile, data })
                }
              />
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
