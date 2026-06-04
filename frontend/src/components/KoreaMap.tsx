// 한반도 파스텔 SVG 지도 — 떠나기 화면 배경
// 정밀한 지도가 아닌 디자인 톤(파스텔/아트지도)에 맞춘 스타일라이즈드 일러스트
// 마커는 자식으로 받아 상대 좌표(%)로 절대 배치된다.

import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
};

export default function KoreaMap({ children, className }: Props) {
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {/* 한반도 일러스트 */}
      <svg
        viewBox="0 0 240 440"
        className="w-full h-auto"
        aria-label="한반도 지도"
        role="img"
      >
        <defs>
          {/* 본토 그라데이션 — 위쪽 옅은 초록, 아래쪽 더 진한 초록 */}
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8EEDA" />
            <stop offset="100%" stopColor="#A8D5A8" />
          </linearGradient>
          {/* 부드러운 외곽 그림자 */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="off" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 바다 배경(투명) — 실제 색은 화면쪽에서 깔린다 */}

        {/* 본토 — 스타일라이즈드 한반도 형태
            북부는 넓게, 서울 부근(허리)에서 잘록, 남부에서 다시 넓어진다.
            동해안(우측)은 비교적 곧게, 서해안(좌측)은 굴곡(경기만·태안·전남)으로
            남서 끝이 살짝 돌출 → 한반도 실루엣 */}
        <path
          d="M 78 64
             C 96 44, 134 34, 162 38
             C 176 40, 188 44, 192 60
             C 197 80, 198 100, 190 122
             C 183 140, 176 146, 176 160
             C 176 176, 180 188, 182 200
             C 187 230, 193 266, 188 302
             C 186 324, 184 340, 176 352
             C 170 360, 162 366, 152 368
             C 132 374, 108 378, 88 376
             C 80 376, 74 374, 70 368
             C 66 360, 66 350, 72 340
             C 80 328, 88 318, 84 302
             C 80 288, 70 282, 72 266
             C 74 252, 82 244, 76 228
             C 72 218, 64 212, 72 198
             C 80 186, 82 182, 78 170
             C 72 154, 66 144, 70 124
             C 73 106, 64 92, 72 76
             C 74 72, 72 68, 78 64 Z"
          fill="url(#land)"
          stroke="#7BB57F"
          strokeWidth="1.2"
          filter="url(#softShadow)"
        />

        {/* 제주도 — 남서 해상 */}
        <ellipse
          cx="108"
          cy="414"
          rx="17"
          ry="9"
          fill="url(#land)"
          stroke="#7BB57F"
          strokeWidth="1.2"
        />

        {/* 산맥/지형 디테일 — 동쪽 능선(태백산맥 느낌)을 따라가는 점선 (장식) */}
        <path
          d="M 132 82 Q 168 150 172 212 Q 176 274 166 324 Q 160 350 158 360"
          stroke="#7BB57F"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.6"
          fill="none"
        />

        {/* 작은 구름/장식 도트 — 바다 느낌의 점 */}
        <g opacity="0.5">
          <circle cx="40" cy="80" r="2" fill="#B1DCB5" />
          <circle cx="210" cy="140" r="2" fill="#B1DCB5" />
          <circle cx="30" cy="280" r="2" fill="#B1DCB5" />
          <circle cx="215" cy="330" r="2" fill="#B1DCB5" />
          <circle cx="200" cy="400" r="2" fill="#B1DCB5" />
        </g>
      </svg>

      {/* 마커 레이어 — 부모 div를 기준으로 절대 배치 */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
