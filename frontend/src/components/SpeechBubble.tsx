// 캐릭터 말풍선 — 둥근 흰 카드 + 아래쪽 꼬리
// PRD: 말풍선 "어느 동네에서 지내볼까?"

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function SpeechBubble({ children, className }: Props) {
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <div
        className="bg-white text-ink font-semibold text-[15px] leading-snug
                   px-5 py-3 rounded-3xl shadow-soft border border-cream-200"
      >
        {children}
      </div>
      {/* 말풍선 꼬리 (아래 방향) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4
                   bg-white border-r border-b border-cream-200 rotate-45"
        aria-hidden
      />
    </div>
  );
}
