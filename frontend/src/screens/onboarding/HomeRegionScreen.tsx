// 온보딩 3단계 — 현재 거주 지역 선택 (서울/인천/대전/대구/광주/부산)
// 본 지역은 떠나기 이동 애니메이션의 출발지로 사용된다.

import { useState } from "react";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";
import { HOME_REGIONS } from "../../data/regions";

type Props = {
  step: number;
  total: number;
  initial: string;
  onBack: () => void;
  onNext: (regionName: string) => void;
};

export default function HomeRegionScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [selectedName, setSelectedName] = useState<string>(initial);

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={!selectedName}
      onCta={() => selectedName && onNext(selectedName)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        지금 살고 있는 지역을<br />알려주세요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        이주 시뮬레이션은 이 지역을 기준으로 비교돼요.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {HOME_REGIONS.map((r) => {
          const isActive = selectedName === r.name;
          return (
            <li key={r.name}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedName(r.name)}
                aria-pressed={isActive}
                className={`w-full aspect-[5/4] rounded-2xl border p-3
                  flex flex-col items-start justify-between text-left transition
                  ${
                    isActive
                      ? "bg-nature-50 border-nature-400 shadow-soft"
                      : "bg-white border-cream-200"
                  }`}
              >
                <span className="text-3xl" aria-hidden>
                  {r.emoji}
                </span>
                <div>
                  <p
                    className={`text-[16px] font-extrabold leading-tight
                      ${isActive ? "text-nature-600" : "text-ink"}`}
                  >
                    {r.name}
                  </p>
                  <p className="text-ink-mute text-[11px] mt-0.5">{r.blurb}</p>
                </div>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </StepLayout>
  );
}
