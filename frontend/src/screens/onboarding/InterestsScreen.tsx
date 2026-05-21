// 온보딩 3단계 — 취미 / 관심사 (multi-select chips)

import { useState } from "react";
import StepLayout from "./StepLayout";
import { interestOptions } from "../../data/quiz";

type Props = {
  step: number;
  total: number;
  initial: string[];
  onBack: () => void;
  onNext: (interests: string[]) => void;
};

export default function InterestsScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (label: string) =>
    setSelected((arr) =>
      arr.includes(label) ? arr.filter((x) => x !== label) : [...arr, label]
    );

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={selected.length === 0}
      onCta={() => onNext(selected)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        취미와 관심사를 알려주세요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        취미를 통해 잘 맞는 지역을 찾아드려요. 여러 개 선택 가능해요.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {interestOptions.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              aria-pressed={on}
              className={`px-3.5 py-2 rounded-full text-[13px] font-semibold border transition
                ${
                  on
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-ink-soft border-cream-200"
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p className="mt-auto pt-4 text-[11px] text-ink-mute">
        선택한 {selected.length}개의 관심사
      </p>
    </StepLayout>
  );
}
