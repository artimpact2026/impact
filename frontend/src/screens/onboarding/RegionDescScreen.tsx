// 온보딩 10단계 — 살고싶은 지역의 특징 (주관식)
// 마지막 단계: 하단 CTA가 "내 귀촌 유형보기"로 바뀜

import { useState } from "react";
import StepLayout from "./StepLayout";

type Props = {
  step: number;
  total: number;
  initial: string;
  onBack: () => void;
  onNext: (desc: string) => void;
};

export default function RegionDescScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [text, setText] = useState(initial);

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaLabel="내 귀촌 유형보기 🍃"
      ctaDisabled={text.trim().length === 0}
      onCta={() => onNext(text.trim())}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        살고 싶은 지역의 특징을
        <br />
        간단히 알려주세요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        한두 줄로 자유롭게 적어주세요.
      </p>

      <div className="mt-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예) 바다가 보이고, 도서관이 가까운 한적한 동네"
          rows={5}
          className="w-full px-4 py-3 rounded-2xl border border-cream-200
                     bg-white text-ink text-[14px] leading-relaxed
                     focus:outline-none focus:border-primary resize-none
                     placeholder:text-ink-mute"
        />
        <p className="mt-2 text-[11px] text-ink-mute text-right">
          {text.length} 자
        </p>
      </div>
    </StepLayout>
  );
}
