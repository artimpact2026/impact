/** @type {import('tailwindcss').Config} */
// 청풍 프로젝트 컬러 시스템 — 파스텔/주황+초록
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 메인 포인트 (주황) — CTA, 강조
        primary: {
          DEFAULT: "#FF7043",
          50: "#FFF3EE",
          100: "#FFE0D3",
          200: "#FFC2A6",
          300: "#FFA37A",
          400: "#FF8A5C",
          500: "#FF7043",
          600: "#E55A30",
        },
        // 서브 포인트 (초록) — 자연/귀촌
        nature: {
          DEFAULT: "#66BB6A",
          50: "#F0F8F1",
          100: "#D8EEDA",
          200: "#B1DCB5",
          300: "#8BCB90",
          400: "#66BB6A",
          500: "#4FA755",
          600: "#3F8E45",
        },
        // 순백 톤 (2026-06-07 — 완전 흰색까지)
        cream: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#EFEFED",  // 카드 border 톤은 살짝 더 진하게 유지 — 흰 위 흰 카드 구분
          300: "#DEDDD8",
        },
        // 다크 브라운/차콜 텍스트
        ink: {
          DEFAULT: "#3E2C20",
          soft: "#6B5446",
          mute: "#9A8778",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(62, 44, 32, 0.08)",
      },
    },
  },
  plugins: [],
};
