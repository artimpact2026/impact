// 남한 지도 — 파스텔 일러스트 이미지(/korea-map.png)를 배경으로 깔고
// 그 위에 마커를 자식으로 받아 이미지 기준 상대 좌표(%)로 절대 배치한다.
// (이전엔 SVG path로 직접 그렸으나, 디자인 레퍼런스 이미지로 교체)
// 원본 비율 447:559 → width 100% / height auto 로 비율 유지.

import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
};

export default function KoreaMap({ children, className }: Props) {
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {/* 남한 일러스트 지도 */}
      <img
        src="/korea-map.png"
        alt="대한민국 지도"
        className="w-full h-auto select-none pointer-events-none"
        draggable={false}
      />

      {/* 마커 레이어 — 이미지(부모 div)를 기준으로 절대 배치 */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
