// 온보딩 2단계 — 태어난 년도 (YYYY)

import { useState } from "react";
import StepLayout from "./StepLayout";
import type { OnboardingData } from "../../data/quiz";

type Props = {
  step: number;
  total: number;
  initial: OnboardingData["birth"];
  onBack: () => void;
  onNext: (birth: OnboardingData["birth"]) => void;
};

function isValid(b: OnboardingData["birth"]): boolean {
  const y = Number(b.year);
  if (!y) return false;
  if (b.year.length !== 4) return false; // 4자리 연도만 허용
  if (y < 1900 || y > 2099) return false;
  return true;
}

export default function BirthScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [birth, setBirth] = useState(initial);
  const valid = isValid(birth);

  const setYear = (v: string) =>
    setBirth({ year: v.replace(/\D/g, "") });

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={!valid}
      onCta={() => onNext(birth)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        태어난 년도를 알려주세요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        만 14세 이상 사용자만 서비스 이용이 가능해요.
      </p>

      <div className="mt-8">
        <label className="text-ink-soft text-[11px] font-bold">연도</label>
        <input
          type="text"
          inputMode="numeric"
          value={birth.year}
          placeholder="YYYY"
          maxLength={4}
          onChange={(e) => setYear(e.target.value)}
          className="mt-1 w-full px-3 py-3 rounded-xl border border-cream-200
                     bg-white text-ink text-[15px] text-center tabular-nums
                     focus:outline-none focus:border-primary placeholder:text-ink-mute"
        />
      </div>
    </StepLayout>
  );
}
