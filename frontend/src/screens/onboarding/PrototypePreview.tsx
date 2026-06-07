// Phase 2 합본 미리보기 — yard → env 연속으로 흘려보고 결과 확인
//
// 격리 프리뷰 (#prototype). 실제 OnboardingShell 에 영향 X.
// 두 화면을 차례로 보고 진단 결과(stance + env) 가 어떻게 결합되는지 확인용.

import { useState } from "react";
import { motion } from "framer-motion";
import YardOnboardingScreen from "./YardOnboardingScreen";
import EnvOnboardingScreen from "./EnvOnboardingScreen";
import type { EnvType, Stance } from "../../data/lifestyle";

type Step = "yard" | "env" | "done";

export default function PrototypePreview() {
  const [step, setStep] = useState<Step>("yard");
  const [stance, setStance] = useState<Stance | null>(null);
  const [env, setEnv] = useState<EnvType | null>(null);

  return (
    <>
      {step === "yard" && (
        <YardOnboardingScreen
          step={1}
          total={2}
          onBack={() => {
            /* 첫 화면 — 뒤로 없음 */
          }}
          onNext={({ stance: s }) => {
            setStance(s);
            setStep("env");
          }}
        />
      )}

      {step === "env" && (
        <EnvOnboardingScreen
          step={2}
          total={2}
          onBack={() => setStep("yard")}
          onNext={(e) => {
            setEnv(e);
            setStep("done");
          }}
        />
      )}

      {step === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative min-h-[100dvh] flex flex-col items-center justify-center
                     px-8 text-center bg-cream"
        >
          <p className="text-[60px] mb-3">✨</p>
          <h1 className="text-ink text-[24px] font-extrabold">
            진단 결과 (Phase 2 미리보기)
          </h1>
          <p className="mt-2 text-ink-soft text-[13px]">
            두 번의 선택만으로 페르소나 두 축이 잡혔어요.
          </p>

          <div className="mt-8 w-full max-w-[320px] space-y-2">
            <div className="bg-white rounded-2xl border border-cream-200 shadow-soft px-5 py-4 text-left">
              <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.2em]">
                Stance · 자세
              </p>
              <p className="mt-1 text-ink text-[18px] font-extrabold">
                {stance ?? "—"}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-cream-200 shadow-soft px-5 py-4 text-left">
              <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.2em]">
                Environment · 환경
              </p>
              <p className="mt-1 text-ink text-[18px] font-extrabold">
                {env ?? "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStance(null);
              setEnv(null);
              setStep("yard");
            }}
            className="mt-8 px-6 py-3 rounded-full bg-primary text-white
                       text-[14px] font-extrabold shadow-soft active:scale-[0.99]"
          >
            다시 처음부터
          </button>

          <p className="mt-4 text-ink-mute text-[10.5px]">
            실제 흐름에서는 이 결과가 8개 청년마을 추천 점수에 그대로 반영됩니다.
          </p>
        </motion.div>
      )}
    </>
  );
}
