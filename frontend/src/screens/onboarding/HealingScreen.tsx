// 온보딩 9단계 — 나에게 힐링이란? (객관식, single)

import StepLayout from "./StepLayout";
import { healings } from "../../data/quiz";

type Props = {
  step: number;
  total: number;
  initial?: string;
  onBack: () => void;
  onNext: (healing: string) => void;
};

export default function HealingScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={!initial}
      onCta={() => initial && onNext(initial)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        나에게 힐링이란?
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        가장 가까운 답을 골라주세요.
      </p>

      <ul className="mt-6 space-y-2">
        {healings.map(({ label }) => {
          const on = initial === label;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onNext(label)}
                aria-pressed={on}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border transition
                  ${
                    on
                      ? "bg-nature-50 border-nature-400 shadow-sm"
                      : "bg-white border-cream-200"
                  }`}
              >
                <span
                  className={`text-[14px] font-semibold leading-snug
                    ${on ? "text-nature-600" : "text-ink"}`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </StepLayout>
  );
}
