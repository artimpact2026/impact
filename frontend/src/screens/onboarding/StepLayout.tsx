// 온보딩 단계 공통 셸 — 상단(뒤로 + 진행률) / 본문 / 하단(다음 CTA)
// 각 단계 화면이 자신의 본문을 children으로 넣고 CTA 활성 조건을 지정한다.

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  step: number;          // 1-base 현재 단계
  total: number;         // 전체 단계 수
  onBack: () => void;
  ctaLabel?: string;     // 기본 "다음"
  ctaDisabled?: boolean;
  onCta?: () => void;
  children: ReactNode;
  // 진행률 바를 숨기고 싶을 때 (예: 결과 화면)
  hideProgress?: boolean;
};

export default function StepLayout({
  step,
  total,
  onBack,
  ctaLabel = "다음",
  ctaDisabled = false,
  onCta,
  children,
  hideProgress = false,
}: Props) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      {/* 헤더 — 뒤로 + 진행률 */}
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="이전"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6 9 12l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {!hideProgress && (
          <>
            <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <span className="text-ink-mute text-[12px] font-bold tabular-nums">
              {step} / {total}
            </span>
          </>
        )}
      </header>

      {/* 본문 */}
      <main className="flex-1 px-6 pt-6 pb-4 flex flex-col">{children}</main>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-2">
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-extrabold
                     shadow-soft active:scale-[0.99] transition
                     disabled:opacity-40 disabled:active:scale-100"
        >
          {ctaLabel}
        </button>
      </footer>
    </div>
  );
}
