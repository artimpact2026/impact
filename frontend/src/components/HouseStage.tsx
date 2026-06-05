// 잠시섬 집 — 4단계 레벨업 SVG
// 0 빈터 → 1 기둥 → 2 벽 → 3 완성(지붕·등불)
// 진행 일차에 따라 한 단계씩 자라남. 한옥 톤(처마·창호 분위기)

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  stage: 0 | 1 | 2 | 3;
  className?: string;
  // scenic=true 면 자체 하늘/땅 레이어를 그리지 않음 — 바깥 풍경(MyVillageScene) 위에 얹을 때 사용
  scenic?: boolean;
};

// 부드러운 등장 — 살짝 위에서 자라남
const grow = {
  initial: { opacity: 0, scaleY: 0.4, originY: 1 },
  animate: { opacity: 1, scaleY: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export default function HouseStage({ stage, className, scenic = false }: Props) {
  return (
    <svg
      viewBox="0 0 240 200"
      className={className}
      aria-label={`집 레벨 ${stage}/3`}
    >
      {/* 하늘 그라데이션 */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6E8" />
          <stop offset="100%" stopColor="#FBE9D2" />
        </linearGradient>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5C3B2A" />
          <stop offset="100%" stopColor="#7A4D38" />
        </linearGradient>
      </defs>

      {/* scenic 모드면 바깥 풍경(MyVillageScene)의 하늘·땅 위에 얹히므로 자체 배경 생략 */}
      {!scenic && (
        <>
          <rect x="0" y="0" width="240" height="200" fill="url(#sky)" />
          {/* 땅(빈터) — scenic이 아닐 때만 자체 ground */}
          <ellipse cx="120" cy="178" rx="92" ry="10" fill="#D9B68A" opacity="0.45" />
          <rect x="36" y="170" width="168" height="6" rx="3" fill="#C99A6E" />
        </>
      )}

      {/* 점선 빈터 윤곽 — stage 0에서만 강조. scenic 모드(MyVillageScene)에선
          바깥 풍경의 ground·텃밭·울타리가 이미 자리를 보여주므로 중복이라 생략 */}
      <AnimatePresence>
        {stage === 0 && !scenic && (
          <motion.g
            key="plot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <rect
              x="60"
              y="110"
              width="120"
              height="60"
              rx="6"
              fill="none"
              stroke="#B98456"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <text
              x="120"
              y="146"
              textAnchor="middle"
              fill="#A1734A"
              fontSize="12"
              fontWeight="700"
            >
              빈 터
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* 기둥 4개 — stage 1+ */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.g key="pillars" {...grow}>
            <rect x="64" y="100" width="10" height="70" rx="2" fill="#8C5A3B" />
            <rect x="106" y="100" width="10" height="70" rx="2" fill="#8C5A3B" />
            <rect x="124" y="100" width="10" height="70" rx="2" fill="#8C5A3B" />
            <rect x="166" y="100" width="10" height="70" rx="2" fill="#8C5A3B" />
            {/* 상단 가로 보 */}
            <rect x="60" y="96" width="120" height="8" rx="2" fill="#6E4429" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* 벽 + 문 + 창 — stage 2+ */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.g key="walls" {...grow}>
            {/* 벽 (한지 톤) */}
            <rect x="74" y="104" width="92" height="66" rx="2" fill="#FFF1D9" />
            {/* 좌측 창 */}
            <rect x="82" y="118" width="22" height="22" rx="2" fill="#E9C58C" />
            <line x1="93" y1="118" x2="93" y2="140" stroke="#8C5A3B" strokeWidth="1.5" />
            <line x1="82" y1="129" x2="104" y2="129" stroke="#8C5A3B" strokeWidth="1.5" />
            {/* 우측 창 */}
            <rect x="136" y="118" width="22" height="22" rx="2" fill="#E9C58C" />
            <line x1="147" y1="118" x2="147" y2="140" stroke="#8C5A3B" strokeWidth="1.5" />
            <line x1="136" y1="129" x2="158" y2="129" stroke="#8C5A3B" strokeWidth="1.5" />
            {/* 가운데 문 */}
            <rect x="111" y="138" width="18" height="32" rx="1" fill="#8C5A3B" />
            <circle cx="125" cy="155" r="1.5" fill="#FFD27A" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* 지붕 + 등불 + 연기 — stage 3 */}
      <AnimatePresence>
        {stage >= 3 && (
          <motion.g key="roof" {...grow}>
            {/* 한옥 처마 — 양 끝이 살짝 솟은 곡선 */}
            <path
              d="M 40 96 Q 60 78 120 60 Q 180 78 200 96 L 200 102 Q 120 70 40 102 Z"
              fill="url(#roof)"
            />
            {/* 용마루 */}
            <rect x="60" y="62" width="120" height="4" rx="1" fill="#3F2515" />
            {/* 등불 */}
            <line x1="74" y1="104" x2="74" y2="112" stroke="#5C3B2A" strokeWidth="1.5" />
            <circle cx="74" cy="116" r="5" fill="#FFD27A" />
            <circle cx="74" cy="116" r="9" fill="#FFD27A" opacity="0.25" />
            <line x1="166" y1="104" x2="166" y2="112" stroke="#5C3B2A" strokeWidth="1.5" />
            <circle cx="166" cy="116" r="5" fill="#FFD27A" />
            <circle cx="166" cy="116" r="9" fill="#FFD27A" opacity="0.25" />
            {/* 굴뚝 연기 */}
            <circle cx="180" cy="52" r="6" fill="#FFFFFF" opacity="0.85" />
            <circle cx="186" cy="42" r="5" fill="#FFFFFF" opacity="0.7" />
            <circle cx="192" cy="32" r="4" fill="#FFFFFF" opacity="0.55" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
