// 풍물시장 미션 일러스트 — 인라인 SVG
//
// 이모지(🥬🐟🦐)는 기기마다 모양이 달라지고 강화 특산물의 실제 형태와도 거리 멀어
// 대체. 추후 일러스트 자산이 들어오면 같은 키로 교체하면 됨.
// 톤: 청풍 파스텔(주황 + 초록) + 라운드 도형 위주. 단색 stroke + 살짝 fill.

import type { MarketIllustKey } from "../data/missions";

type Props = {
  variant: MarketIllustKey;
  size?: number;        // 기본 56
  className?: string;
};

const C = {
  ink: "#3E2C20",
  primary: "#FF7043",
  nature: "#7FB069",
  cream: "#FFF4E0",
  sun: "#FFC56A",
  navy: "#2C3E50",
  rose: "#E89B8C",
};

export default function MarketIllust({ variant, size = 56, className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke={C.ink}
      strokeWidth={1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      {renderVariant(variant)}
    </svg>
  );
}

function renderVariant(v: MarketIllustKey) {
  switch (v) {
    case "sunmu-kimchi": {
      // 둥근 김치통 + 잎 — 보라/적색 톤
      return (
        <>
          <ellipse cx="32" cy="44" rx="18" ry="6" fill={C.rose} opacity="0.5" />
          <path
            d="M14 24 Q14 22 16 22 L48 22 Q50 22 50 24 L48 46 Q48 50 44 50 L20 50 Q16 50 16 46 Z"
            fill="#C9485C"
          />
          <path d="M16 28 Q32 24 48 28" stroke={C.ink} opacity="0.4" />
          <path d="M22 22 L24 14 L30 18 L26 22" fill={C.nature} />
          <path d="M34 22 L40 14 L42 20 L38 22" fill={C.nature} />
        </>
      );
    }
    case "saeujeot": {
      // 작은 항아리 + 새우 윤곽
      return (
        <>
          <ellipse cx="32" cy="50" rx="16" ry="4" fill={C.ink} opacity="0.18" />
          <path
            d="M18 28 Q18 22 24 20 L40 20 Q46 22 46 28 L44 46 Q44 50 40 50 L24 50 Q20 50 20 46 Z"
            fill={C.cream}
          />
          <path d="M22 24 L42 24" stroke={C.ink} opacity="0.4" />
          {/* 새우 윤곽 — 위쪽에 살짝 보이게 */}
          <path
            d="M26 32 Q30 28 36 30 Q38 34 36 36 Q30 38 26 36 Z"
            fill={C.rose}
          />
          <circle cx="35" cy="32" r="0.9" fill={C.ink} />
        </>
      );
    }
    case "sweet-potato": {
      // 길쭉한 고구마 — 자주색 껍질 + 노란 단면 한 입
      return (
        <>
          <ellipse cx="32" cy="50" rx="18" ry="3" fill={C.ink} opacity="0.18" />
          <path
            d="M16 36 Q14 24 26 18 Q40 14 50 26 Q54 38 42 46 Q26 52 16 36 Z"
            fill="#7E4B8A"
          />
          <path
            d="M40 22 Q48 26 48 34 Q44 40 38 38 Q34 30 40 22 Z"
            fill={C.sun}
          />
        </>
      );
    }
    case "ssuk-tteok": {
      // 둥근 떡 — 쑥색 + 콩고물
      return (
        <>
          <ellipse cx="32" cy="46" rx="20" ry="4" fill={C.ink} opacity="0.18" />
          <ellipse cx="32" cy="36" rx="18" ry="10" fill="#6D8C4B" />
          <ellipse
            cx="32"
            cy="32"
            rx="14"
            ry="7"
            fill="#86A864"
            opacity="0.6"
          />
          {/* 콩고물 점들 */}
          <circle cx="24" cy="34" r="1" fill={C.cream} />
          <circle cx="32" cy="30" r="1" fill={C.cream} />
          <circle cx="38" cy="36" r="1" fill={C.cream} />
        </>
      );
    }
    case "gukhwa-bbang": {
      // 꽃 모양 빵 — 노랗고 따끈
      return (
        <>
          <ellipse cx="32" cy="50" rx="16" ry="3" fill={C.ink} opacity="0.18" />
          <g fill={C.sun}>
            <circle cx="32" cy="32" r="10" />
            <circle cx="22" cy="28" r="6" />
            <circle cx="42" cy="28" r="6" />
            <circle cx="22" cy="38" r="6" />
            <circle cx="42" cy="38" r="6" />
            <circle cx="32" cy="22" r="6" />
            <circle cx="32" cy="42" r="6" />
          </g>
          <circle cx="32" cy="32" r="5" fill="#A2724A" />
        </>
      );
    }
    case "goguma-mallaengi": {
      // 길쭉한 말랭이 조각 두세 개 더미
      return (
        <>
          <ellipse cx="32" cy="50" rx="18" ry="3" fill={C.ink} opacity="0.18" />
          <path
            d="M12 38 Q12 32 18 30 L40 24 Q48 22 50 28 L52 38 Q52 44 46 44 L18 44 Q12 44 12 38 Z"
            fill="#E89953"
          />
          <path d="M18 36 L46 30" stroke={C.ink} opacity="0.3" />
          <path d="M16 40 L48 36" stroke={C.ink} opacity="0.3" />
        </>
      );
    }
    case "raw-sunmu": {
      // 둥근 흰 순무 + 보라색 끝 + 잎
      return (
        <>
          <ellipse cx="32" cy="50" rx="14" ry="3" fill={C.ink} opacity="0.18" />
          <path
            d="M18 36 Q18 26 32 26 Q46 26 46 36 Q46 48 32 48 Q18 48 18 36 Z"
            fill="#F3E8DA"
          />
          <path
            d="M26 46 Q28 50 32 50 Q36 50 38 46"
            stroke="#7E4B8A"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M28 26 Q26 14 22 12 M32 26 Q32 14 30 10 M36 26 Q40 16 42 14"
            stroke={C.nature}
            strokeWidth="1.8"
            fill="none"
          />
        </>
      );
    }
    case "bandaegi-bowl": {
      // 사실적인 밴댕이 회무침 — 흰 접시 위 빨간 양념 산 모양 + 채소 줄기 + 깻잎 받침.
      // 실제 사진 톤(고추장 양념에 회·채소 무친 산 모양)을 단순 SVG 로 모사.
      return (
        <>
          <ellipse cx="32" cy="58" rx="26" ry="3" fill={C.ink} opacity="0.22" />
          {/* 흰 둥근 접시 */}
          <ellipse cx="32" cy="48" rx="28" ry="9" fill="#FAFAFA" />
          <ellipse cx="32" cy="48" rx="28" ry="9" fill="none" stroke="#D6D6D6" strokeWidth="0.6" />
          {/* 접시 바닥에 살짝 보이는 깻잎 */}
          <path d="M8 50 Q12 44 22 44 Q26 48 22 52 Q12 54 8 50 Z" fill="#7E9E5C" opacity="0.9" />
          <path d="M56 50 Q52 44 42 44 Q38 48 42 52 Q52 54 56 50 Z" fill="#7E9E5C" opacity="0.9" />
          {/* 회무침 본체 — 산처럼 쌓인 빨간 양념 (어두운 톤 → 밝은 톤 레이어) */}
          <path d="M10 47 Q22 22 32 18 Q42 22 54 47 Q42 50 32 50 Q22 50 10 47 Z" fill="#7A1F12" />
          <path d="M14 46 Q24 24 32 20 Q40 24 50 46 Q40 48 32 48 Q24 48 14 46 Z" fill="#A6311E" />
          <path d="M20 44 Q26 28 32 24 Q38 28 44 44 Q38 46 32 46 Q26 46 20 44 Z" fill="#D14B3A" />
          {/* 채소 줄기들 — 양념 사이 살짝 보임 */}
          <path d="M22 38 L28 32" stroke="#86A864" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M40 36 L34 30" stroke="#86A864" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M32 28 L32 22" stroke="#FFC56A" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M28 44 L20 42" stroke="#FFC56A" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M40 44 L48 42" stroke="#FFC56A" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M36 40 L30 36" stroke="#86A864" strokeWidth="1" strokeLinecap="round" />
          <path d="M18 40 L24 38" stroke="#86A864" strokeWidth="1" strokeLinecap="round" />
          {/* 살짝 보이는 회 살 (양념에 묻은 톤) */}
          <ellipse cx="26" cy="42" rx="2.2" ry="1.3" fill="#E89B8C" opacity="0.85" />
          <ellipse cx="38" cy="40" rx="2.2" ry="1.3" fill="#E89B8C" opacity="0.85" />
        </>
      );
    }
    case "bandaegi-sashimi": {
      // 밴댕이 회 — 큰 타원 접시 + 깻잎 받침 + 줄지어 놓인 흰 회 살.
      return (
        <>
          <ellipse cx="32" cy="56" rx="26" ry="3" fill={C.ink} opacity="0.22" />
          {/* 타원 접시 */}
          <ellipse cx="32" cy="42" rx="29" ry="14" fill="#FAFAFA" />
          <ellipse cx="32" cy="42" rx="29" ry="14" fill="none" stroke="#D6D6D6" strokeWidth="0.6" />
          {/* 깻잎 — 접시 위 한 장 */}
          <path
            d="M6 42 Q10 28 32 26 Q54 28 58 42 Q54 52 32 52 Q10 52 6 42 Z"
            fill="#6D8C4B"
          />
          <path
            d="M12 42 Q16 32 32 30 Q48 32 52 42"
            stroke="#557039"
            strokeWidth="0.8"
            fill="none"
          />
          {/* 잎맥 */}
          <path d="M32 28 L32 50" stroke="#557039" strokeWidth="0.4" />
          {/* 밴댕이 회 살 — 6점, 살짝 어긋나게 놓임 */}
          {[
            { cx: 13, cy: 40 },
            { cx: 20.5, cy: 39 },
            { cx: 28, cy: 40 },
            { cx: 35.5, cy: 39 },
            { cx: 43, cy: 40 },
            { cx: 50.5, cy: 39 },
          ].map((p, i) => (
            <g key={i}>
              <ellipse cx={p.cx} cy={p.cy} rx="3.4" ry="2.4" fill="#F4D3CA" />
              <ellipse cx={p.cx} cy={p.cy} rx="3.4" ry="2.4" fill="none" stroke="#C99084" strokeWidth="0.7" />
              {/* 살 위 광택 */}
              <ellipse cx={p.cx - 0.7} cy={p.cy - 0.7} rx="1.4" ry="0.7" fill="#FFF" opacity="0.55" />
            </g>
          ))}
        </>
      );
    }
    case "rice-bowl": {
      // 흰 밥공기 — 둥근 그릇 위 봉긋한 밥 + 밥알 디테일.
      return (
        <>
          <ellipse cx="32" cy="58" rx="20" ry="3" fill={C.ink} opacity="0.22" />
          {/* 그릇 본체 */}
          <path
            d="M12 38 Q12 34 16 34 L48 34 Q52 34 52 38 L50 54 Q48 56 44 56 L20 56 Q16 56 14 54 Z"
            fill="#FAFAFA"
          />
          <path
            d="M12 38 Q12 34 16 34 L48 34 Q52 34 52 38 L50 54 Q48 56 44 56 L20 56 Q16 56 14 54 Z"
            fill="none"
            stroke="#D6D6D6"
            strokeWidth="0.6"
          />
          {/* 그릇 윗단 테두리 */}
          <ellipse cx="32" cy="35" rx="20" ry="2.5" fill="#EDEDED" />
          {/* 밥 봉긋이 위로 */}
          <path
            d="M14 35 Q18 28 32 27 Q46 28 50 35 Z"
            fill="#FEFCF6"
          />
          {/* 밥알 디테일 */}
          {[
            { cx: 20, cy: 33 },
            { cx: 25, cy: 31 },
            { cx: 30, cy: 30 },
            { cx: 35, cy: 31 },
            { cx: 40, cy: 33 },
            { cx: 26, cy: 34 },
            { cx: 33, cy: 33 },
            { cx: 38, cy: 35 },
          ].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="0.85" fill="#E5DCC4" />
          ))}
        </>
      );
    }
    case "basket-bag": {
      // 라탄 장바구니 — 가로형 토트백. 손잡이 둥글게 + 본체 직조 패턴 + 정면 라벨 자리.
      // 다른 일러스트(국화빵·생순무)와 같은 결: 두꺼운 stroke + 옅은 fill.
      return (
        <>
          {/* 바닥 그림자 */}
          <ellipse cx="32" cy="58" rx="24" ry="3" fill={C.ink} opacity="0.22" />
          {/* 손잡이 — 좌우 두 줄 둥글게 */}
          <path
            d="M22 32 Q22 14 32 14 Q42 14 42 32"
            stroke="#A67049"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M22 32 Q22 14 32 14 Q42 14 42 32"
            stroke="#7E4B30"
            strokeWidth="0.8"
            fill="none"
            opacity="0.7"
            strokeLinecap="round"
          />
          {/* 가방 본체 — 윗변 좁고 아래로 살짝 넓어지는 사다리꼴 */}
          <path
            d="M14 32 Q14 30 16 30 L48 30 Q50 30 50 32 L52 54 Q52 58 48 58 L16 58 Q12 58 12 54 Z"
            fill="#E8C68A"
          />
          {/* 윗단 가죽 띠 */}
          <path
            d="M12 30 Q12 28 14 28 L50 28 Q52 28 52 30 L52 35 Q52 37 50 37 L14 37 Q12 37 12 35 Z"
            fill="#A67049"
          />
          {/* 손잡이 박음 — 작은 동그라미 4개 */}
          <circle cx="22" cy="33" r="1.2" fill="#5C3A22" />
          <circle cx="42" cy="33" r="1.2" fill="#5C3A22" />
          {/* 직조 패턴 — 가는 사선 격자 */}
          <g stroke="#C9A36B" strokeWidth="0.7" opacity="0.85">
            <path d="M16 40 L50 40" />
            <path d="M16 45 L51 45" />
            <path d="M16 50 L52 50" />
            <path d="M20 38 L20 56" />
            <path d="M26 38 L26 57" />
            <path d="M32 38 L32 57" />
            <path d="M38 38 L38 57" />
            <path d="M44 38 L44 57" />
          </g>
          {/* 정면 라벨 자리 — 작은 둥근 원 (꾸미기 여지) */}
          <ellipse cx="32" cy="46" rx="7" ry="5" fill="#F5E6C8" opacity="0.65" />
        </>
      );
    }
    case "card-back": {
      // 뒷면 — 강화 톤 패턴 + 물음표
      return (
        <>
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="8"
            fill={C.primary}
            opacity="0.95"
          />
          <rect
            x="12"
            y="12"
            width="40"
            height="40"
            rx="5"
            fill="none"
            stroke={C.cream}
            strokeWidth="1.4"
            strokeDasharray="3 3"
          />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontSize="22"
            fontWeight="900"
            fill={C.cream}
            stroke="none"
          >
            ?
          </text>
        </>
      );
    }
    default:
      return null;
  }
}
