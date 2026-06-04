// 한반도(남한) 지도 — public/korea-map.png를 배경으로 사용
// 마커는 자식으로 받아 부모 div 기준 절대 좌표(%)로 배치된다.
// 좌표계: 이미지의 좌상단 (0%, 0%) → 우하단 (100%, 100%)
// 남한 + 제주도만 포함된 일러스트라 마커 좌표는 남한 기준으로 매핑되어야 함.

import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
};

export default function KoreaMap({ children, className }: Props) {
  return (
    <div
      className={`relative w-full aspect-[447/559] ${className ?? ""}`}
    >
      <img
        src="/korea-map.png"
        alt="대한민국 지도"
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
      {/* 마커 레이어 — 자식이 절대 좌표로 자리잡음 */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
