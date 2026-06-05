// 온보딩 4-6단계 — 밸런스 게임 (산vs바다, 책vs수다, 한옥vs모던)
// 두 카드 중 하나를 골라 선택하면 자동으로 다음 단계로 진행.

import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

type Option<T extends string> = {
  value: T;
  label: string;
  emoji: string;
  blurb: string;
};

type Props<T extends string> = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  left: Option<T>;
  right: Option<T>;
  initial?: T;
  onBack: () => void;
  onNext: (value: T) => void;
};

export default function BalanceScreen<T extends string>({
  step,
  total,
  title,
  subtitle,
  left,
  right,
  initial,
  onBack,
  onNext,
}: Props<T>) {
  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      hideCta
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
          {subtitle}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 flex-1">
        <Card option={left} active={initial === left.value} onClick={() => onNext(left.value)} />
        <Card option={right} active={initial === right.value} onClick={() => onNext(right.value)} />
      </div>
    </StepLayout>
  );
}

function Card<T extends string>({
  option,
  active,
  onClick,
}: {
  option: Option<T>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-3xl border p-5 flex flex-col items-center justify-center
        text-center transition
        ${
          active
            ? "bg-nature-50 border-nature-400 shadow-soft"
            : "bg-white border-cream-200"
        }`}
    >
      <span className="text-5xl" aria-hidden>
        {option.emoji}
      </span>
      <p
        className={`mt-3 text-[16px] font-extrabold ${
          active ? "text-nature-600" : "text-ink"
        }`}
      >
        {option.label}
      </p>
      <p className="mt-1 text-ink-mute text-[11px] leading-tight">
        {option.blurb}
      </p>
    </motion.button>
  );
}
