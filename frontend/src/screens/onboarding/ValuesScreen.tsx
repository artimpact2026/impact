// 온보딩 7단계 — 내가 소중히 여기는 가치 (multi-select, max 5)

import { useState } from "react";
import StepLayout from "./StepLayout";
import { valueOptions } from "../../data/quiz";

type Props = {
  step: number;
  total: number;
  initial: string[];
  onBack: () => void;
  onNext: (values: string[]) => void;
};

const MAX = 5;

export default function ValuesScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (label: string) =>
    setSelected((arr) => {
      if (arr.includes(label)) return arr.filter((x) => x !== label);
      if (arr.length >= MAX) return arr; // 최대 5개
      return [...arr, label];
    });

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={selected.length === 0}
      onCta={() => onNext(selected)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        내가 소중히 여기는 가치는?
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        마음에 닿는 것을 최대 {MAX}개까지 골라주세요.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {valueOptions.map(({ label }) => {
          const on = selected.includes(label);
          const reached = selected.length >= MAX && !on;
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              disabled={reached}
              aria-pressed={on}
              className={`px-3.5 py-2 rounded-full text-[13px] font-semibold border transition
                ${
                  on
                    ? "bg-primary text-white border-primary shadow-sm"
                    : reached
                    ? "bg-cream-100 text-ink-mute border-cream-200 opacity-50"
                    : "bg-white text-ink-soft border-cream-200"
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-auto pt-4 text-[11px] text-ink-mute">
        {selected.length} / {MAX} 선택
      </p>
    </StepLayout>
  );
}
