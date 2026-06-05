// 온보딩 8단계 — 어떤 풍경의 하루를 그리고 있나요? (객관식, single)

import StepLayout from "./StepLayout";
import { dayScenes } from "../../data/quiz";

type Props = {
  step: number;
  total: number;
  initial?: string;
  onBack: () => void;
  onNext: (scene: string) => void;
};

export default function SceneScreen({
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
      hideCta
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        어떤 풍경의 하루를
        <br />
        그리고 있나요?
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        가장 마음에 드는 하루를 하나 골라주세요.
      </p>

      <ul className="mt-6 space-y-2">
        {dayScenes.map(({ label }) => {
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
