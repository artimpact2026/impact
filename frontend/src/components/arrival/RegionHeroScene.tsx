// 마을 일러스트 + 캐릭터 + 표지판 + 우편함 + 말풍선
// theme(coastal / village / valley)에 따라 배경 오브젝트가 달라진다.

import { motion } from "framer-motion";
import Character from "../Character";
import MailboxObject from "./MailboxObject";
import type { VillageTheme } from "../../data/villageConfig";

type Props = {
  theme: VillageTheme;
  signLabel: string;
  speechBubble: string;
  unreadLetters: number;
  onMailboxClick: () => void;
};

export default function RegionHeroScene({
  theme,
  signLabel,
  speechBubble,
  unreadLetters,
  onMailboxClick,
}: Props) {
  return (
    <section className="relative px-4 mt-2">
      {/* 배경 일러스트 — 둥근 카드 형태로 마을 풍경 */}
      <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden
                      shadow-[0_8px_24px_rgba(80,55,30,0.12)]
                      border border-white/60">
        <SceneBackground theme={theme} />

        {/* 표지판 — 좌상단에 비스듬히 */}
        <Signpost label={signLabel} />

        {/* 캐릭터 + 말풍선 — 화면 중앙 아래쪽 */}
        <div className="absolute inset-x-0 bottom-[18%] flex flex-col items-center">
          {/* 말풍선 */}
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative mb-2 max-w-[80%]"
          >
            <div className="bg-white/95 backdrop-blur px-3 py-2
                            rounded-2xl border border-white shadow-soft
                            text-[#4A3326] text-[12px] font-semibold leading-snug
                            text-center">
              {speechBubble}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3
                            bg-white/95 border-r border-b border-white rotate-45" aria-hidden />
          </motion.div>

          {/* 캐릭터 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-28"
          >
            <Character className="w-full h-auto" />
          </motion.div>
          {/* 발 그림자 */}
          <div className="w-20 h-1.5 rounded-full bg-black/15 -mt-2 mx-auto" />
        </div>

        {/* 우편함 — 우하단 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="absolute right-6 bottom-[16%]"
        >
          <MailboxObject
            unreadCount={unreadLetters}
            onClick={onMailboxClick}
          />
        </motion.div>
      </div>
    </section>
  );
}

// =====================================================================
// 표지판 — 나무판 + 지역명
// =====================================================================
function Signpost({ label }: { label: string }) {
  return (
    <div className="absolute left-4 top-4 rotate-[-6deg] origin-top-left">
      <svg width="92" height="64" viewBox="0 0 92 64" aria-hidden>
        {/* 기둥 */}
        <rect x="14" y="36" width="4" height="24" fill="#7A5236" />
        {/* 판자 본체 */}
        <rect x="2" y="6" width="84" height="34" rx="3" fill="#D9A86C" />
        {/* 판자 위 그림자 */}
        <rect x="2" y="6" width="84" height="6" rx="3" fill="#B57F44" opacity="0.6" />
        {/* 판자 결 */}
        <path
          d="M 6 16 L 82 16 M 6 26 L 82 26 M 6 34 L 82 34"
          stroke="#A07842"
          strokeWidth="0.5"
          opacity="0.5"
        />
        {/* 못 */}
        <circle cx="8" cy="11" r="1.3" fill="#5A4630" />
        <circle cx="80" cy="11" r="1.3" fill="#5A4630" />
        {/* 글자는 HTML로 — SVG text는 한글 폰트가 들쭉날쭉할 수 있음 */}
      </svg>
      <span
        className="absolute left-0 top-2 w-[88px] text-center
                   text-[#4A3326] text-[14px] font-extrabold"
        style={{ paddingLeft: 2 }}
      >
        {label}
      </span>
    </div>
  );
}

// =====================================================================
// SceneBackground — theme별 배경 SVG
// =====================================================================
function SceneBackground({ theme }: { theme: VillageTheme }) {
  return (
    <svg
      viewBox="0 0 200 250"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="hSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#BDE7FF" />
          <stop offset="0.55" stopColor="#FFF6E8" />
          <stop offset="1" stopColor="#F6EAD8" />
        </linearGradient>
        <linearGradient id="hSea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#A8C8DE" />
          <stop offset="1" stopColor="#88B6D2" />
        </linearGradient>
        <linearGradient id="hGrass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#C8DDA8" />
          <stop offset="1" stopColor="#A8C898" />
        </linearGradient>
      </defs>

      {/* 하늘 + 그라데이션 */}
      <rect width="200" height="250" fill="url(#hSky)" />

      {/* 구름 */}
      <g opacity="0.85">
        <ellipse cx="40" cy="30" rx="14" ry="4" fill="#FFFFFF" />
        <ellipse cx="50" cy="34" rx="10" ry="3" fill="#FFFFFF" />
        <ellipse cx="150" cy="22" rx="16" ry="4" fill="#FFFFFF" />
        <ellipse cx="158" cy="26" rx="10" ry="3" fill="#FFFFFF" />
      </g>

      {theme === "coastal" && <CoastalBg />}
      {theme === "village" && <VillageBg />}
      {theme === "valley" && <ValleyBg />}

      {/* 공통 — 잔디 바닥 */}
      <rect y="200" width="200" height="50" fill="url(#hGrass)" />
      {/* 잔디 디테일 */}
      <g opacity="0.4">
        <path d="M 10 220 l 0 -4 M 30 230 l 0 -3 M 60 222 l 0 -4 M 90 232 l 0 -3 M 120 224 l 0 -4 M 150 232 l 0 -3 M 180 222 l 0 -4"
          stroke="#7BA86F" strokeWidth="0.6" />
      </g>

      {/* 공통 — 마을 길(중앙에서 멀리) */}
      <path
        d="M 92 200 L 60 250 L 140 250 L 108 200 Z"
        fill="#E0CFA8"
      />
      <path
        d="M 100 200 L 100 250"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeDasharray="3 4"
        opacity="0.6"
      />
    </svg>
  );
}

// ---- coastal: 바다 + 등대 + 배 + 갈매기 ----
function CoastalBg() {
  return (
    <g>
      {/* 먼 산/섬 */}
      <path
        d="M -10 145 Q 30 110 70 130 Q 110 105 150 130 Q 180 115 210 135 L 210 160 L -10 160 Z"
        fill="#A8C8B0"
        opacity="0.6"
      />
      {/* 바다 */}
      <rect y="155" width="200" height="50" fill="url(#hSea)" />
      {/* 파도 */}
      <g stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6" fill="none">
        <motion.path
          d="M 10 170 Q 30 168 50 170"
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 70 180 Q 90 178 110 180"
          animate={{ x: [0, -6, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.path
          d="M 130 188 Q 150 186 170 188"
          animate={{ x: [0, 7, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        />
      </g>
      {/* 작은 배 */}
      <g transform="translate(150 170)">
        <path d="M -8 0 L 8 0 L 6 4 L -6 4 Z" fill="#FFFFFF" />
        <rect x="-1" y="-8" width="1.5" height="8" fill="#5A4630" />
        <path d="M 0 -8 L 5 -3 L 0 -3 Z" fill="#E55A30" />
      </g>
      {/* 등대 */}
      <g transform="translate(30 180)">
        <ellipse cx="0" cy="20" rx="10" ry="2" fill="#000" opacity="0.18" />
        <rect x="-3" y="0" width="6" height="20" fill="#FFFFFF" />
        <rect x="-3" y="2" width="6" height="2" fill="#E55A30" />
        <rect x="-3" y="10" width="6" height="2" fill="#E55A30" />
        <path d="M -4 0 L 4 0 L 3 -4 L -3 -4 Z" fill="#FFC53D" />
        <rect x="-1" y="-7" width="2" height="3" fill="#5A4630" />
      </g>
      {/* 갈매기 */}
      <motion.text
        x="80"
        y="80"
        fontSize="10"
        opacity="0.7"
        animate={{ x: [50, 130, 50], y: [80, 72, 80] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        ᯓ
      </motion.text>
    </g>
  );
}

// ---- village: 한옥 + 낮은 산 + 들길 ----
function VillageBg() {
  return (
    <g>
      {/* 먼 산 (한국적 둥근 산세) */}
      <path
        d="M -10 160 Q 30 120 60 145 Q 100 110 130 140 Q 160 115 180 140 Q 195 130 210 145 L 210 170 L -10 170 Z"
        fill="#A8C8B0"
        opacity="0.65"
      />
      <path
        d="M -10 168 Q 50 140 100 160 Q 150 140 210 165 L 210 175 L -10 175 Z"
        fill="#8EB096"
        opacity="0.55"
      />
      {/* 논밭 라인 */}
      <g opacity="0.5">
        <path d="M 0 180 L 200 180" stroke="#7BA86F" strokeWidth="0.5" />
        <path d="M 0 188 L 200 188" stroke="#7BA86F" strokeWidth="0.5" />
        <path d="M 0 195 L 200 195" stroke="#7BA86F" strokeWidth="0.5" />
      </g>
      {/* 한옥 — 왼쪽 */}
      <g transform="translate(40 175)">
        <ellipse cx="0" cy="20" rx="22" ry="2" fill="#000" opacity="0.18" />
        <rect x="-18" y="0" width="36" height="18" fill="#EEDDC0" />
        {/* 기와 지붕 */}
        <path d="M -24 0 L 0 -12 L 24 0 Z" fill="#7B5640" />
        <path d="M -24 -1 L 24 -1 L 24 1 L -24 1 Z" fill="#5A3D2A" />
        {/* 문 */}
        <rect x="-3" y="6" width="6" height="12" fill="#5A4630" />
        {/* 창 */}
        <rect x="-14" y="4" width="6" height="6" fill="#5A4630" />
        <rect x="8" y="4" width="6" height="6" fill="#5A4630" />
      </g>
      {/* 작은 한옥 — 오른쪽 멀리 */}
      <g transform="translate(160 170)" opacity="0.85">
        <rect x="-12" y="0" width="24" height="12" fill="#E2CCAA" />
        <path d="M -16 0 L 0 -8 L 16 0 Z" fill="#5A3D2A" />
      </g>
      {/* 나무 */}
      <g transform="translate(95 172)">
        <rect x="-1" y="0" width="2" height="10" fill="#7B5640" />
        <circle cx="0" cy="-2" r="7" fill="#7BA86F" />
        <circle cx="-3" cy="-4" r="5" fill="#9ECC8D" />
      </g>
    </g>
  );
}

// ---- valley: 매화/봄 들판 ----
function ValleyBg() {
  return (
    <g>
      <path
        d="M -10 160 Q 50 130 100 150 Q 150 125 210 150 L 210 175 L -10 175 Z"
        fill="#B5D5A0"
        opacity="0.7"
      />
      {/* 매화 나무들 */}
      {[40, 100, 160].map((x, i) => (
        <g key={i} transform={`translate(${x} 178)`}>
          <rect x="-1" y="0" width="2" height="14" fill="#7B5640" />
          <circle cx="0" cy="-4" r="9" fill="#F4C5D8" />
          <circle cx="-4" cy="-7" r="6" fill="#F8D9E3" />
          <circle cx="4" cy="-2" r="5" fill="#F4C5D8" />
        </g>
      ))}
      {/* 작은 집 */}
      <g transform="translate(70 180)">
        <rect x="-10" y="0" width="20" height="14" fill="#EEDDC0" />
        <path d="M -13 0 L 0 -9 L 13 0 Z" fill="#7B5640" />
        <rect x="-2" y="6" width="4" height="8" fill="#5A4630" />
      </g>
    </g>
  );
}
