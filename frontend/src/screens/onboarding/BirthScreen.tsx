// 온보딩 2단계 — 태어난 날 (YYYY / MM / DD)

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
  const m = Number(b.month);
  const d = Number(b.day);
  if (!y || !m || !d) return false;
  if (y < 1900 || y > 2099) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
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

  const setField = (k: keyof OnboardingData["birth"], v: string) =>
    setBirth((b) => ({ ...b, [k]: v.replace(/\D/g, "") }));

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={!valid}
      onCta={() => onNext(birth)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        태어난 날을 알려주세요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        만 14세 이상 사용자만 서비스 이용이 가능해요.
      </p>

      <div className="mt-8 grid grid-cols-[2fr_1fr_1fr] gap-2">
        <NumField
          label="연도"
          value={birth.year}
          placeholder="YYYY"
          maxLength={4}
          onChange={(v) => setField("year", v)}
        />
        <NumField
          label="월"
          value={birth.month}
          placeholder="MM"
          maxLength={2}
          onChange={(v) => setField("month", v)}
        />
        <NumField
          label="일"
          value={birth.day}
          placeholder="DD"
          maxLength={2}
          onChange={(v) => setField("day", v)}
        />
      </div>
    </StepLayout>
  );
}

function NumField({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-ink-soft text-[11px] font-bold">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-3 rounded-xl border border-cream-200
                   bg-white text-ink text-[15px] text-center tabular-nums
                   focus:outline-none focus:border-primary placeholder:text-ink-mute"
      />
    </div>
  );
}
