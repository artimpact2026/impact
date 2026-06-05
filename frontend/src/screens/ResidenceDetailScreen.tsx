// 레지던스 상세 (나의 여정 / 잠시섬 흐름) — 야놀자 톤 8섹션 + 기존 부가 섹션 유지
// ① 사진 → ② 메타·태그·매칭·별점 → ③ 한 줄 → ④ 어떤 곳 → ⑤ 프로그램 → ⑥ 정보 그리드
// → ⑦ 후기 → 부가(매칭사유·위치·인프라) → ⑧ 신청·문의 CTA(외부 링크)

import { motion } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import {
  matchScore,
  type LifeStyleType,
  type Residence,
} from "../data/residences";
import { envMeta, stanceMeta } from "../data/lifestyle";
import { pickResidenceImage } from "../data/bookingExtras";
import {
  residenceContent,
  programIcon,
  avgRating,
  type ResidenceReview,
} from "../data/residenceContent";
import type { RegionRecord } from "../data/journey";

const AVATAR_PALETTE = [
  "#FFD0BB",
  "#C9E1EF",
  "#B1DCB5",
  "#FFE9A8",
  "#FFC4DC",
  "#E8C8A4",
  "#A8CFB5",
  "#FFB6A8",
];

type Props = {
  residence: Residence;
  lifestyle: LifeStyleType | null;
  // 해당 지역에서 사용자가 확인한 인프라 데이터 (옵션)
  record?: RegionRecord;
  onBack: () => void;
};

export default function ResidenceDetailScreen({
  residence,
  lifestyle,
  record,
  onBack,
}: Props) {
  const match = matchScore(lifestyle, residence);
  const content = residenceContent[residence.id];
  const rating = avgRating(residence.id);
  const reviews = content?.reviews ?? [];
  const env = envMeta[residence.envType];
  const stance = stanceMeta[residence.stance];
  // 미션 기반 인프라 인사이트
  const completedIds = new Set(record?.completedMissionIds ?? []);
  const hasHospital = completedIds.has("hospital");
  const hasTransit = completedIds.has("transit");
  const hasMarket = completedIds.has("market") || completedIds.has("cost");

  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      {/* 상단 back 헤더 — 사진 위에 떠 있음 */}
      <header className="absolute top-0 left-0 right-0 z-20 pt-12 px-5 flex items-center gap-3
                         bg-gradient-to-b from-black/30 to-transparent">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
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
        <h1 className="text-white text-[15px] font-extrabold truncate drop-shadow">
          {residence.name}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {/* ① 큰 사진 — 캐릭터 + 상하 그라데이션 */}
        <section>
          <ResidencePhoto residence={residence} />
        </section>

        {/* ② 메타 — 태그칩 + 매칭 + 별점 + 이름 */}
        <section className="px-6 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-nature-50 text-nature-600 text-[11px] font-extrabold">
              {env.emoji} {env.blurb}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary text-[11px] font-extrabold">
              {stance.emoji} {stance.label}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[10.5px] font-extrabold">
              매칭 {match}%
            </span>
            {residence.hasSupport && (
              <span className="px-2.5 py-1 rounded-full bg-nature-500 text-white text-[10.5px] font-extrabold">
                🌱 정부 지원금
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-ink-mute text-[11px] font-bold">
              📍 {residence.region}
            </span>
            <span className="flex items-center gap-1">
              <StarIcon size={13} />
              <span className="text-ink text-[13px] font-extrabold tabular-nums">
                {rating.toFixed(1)}
              </span>
              <span className="text-ink-mute text-[11px]">
                · 후기 {reviews.length}개
              </span>
            </span>
          </div>
          <h2 className="mt-2 text-ink text-[22px] font-extrabold leading-tight">
            {residence.name}
          </h2>
        </section>

        {/* ③ 한 줄 소개 */}
        {content?.oneLiner && (
          <section className="px-6 pt-3">
            <p className="text-[17px] font-extrabold text-ink leading-snug">
              {content.oneLiner}
            </p>
          </section>
        )}

        {/* ④ 어떤 곳이에요 */}
        {content?.description && (
          <section className="px-4 pt-5">
            <SectionLabel>어떤 곳이에요</SectionLabel>
            <div className="mt-2 bg-white rounded-3xl shadow-soft border border-cream-200/80 px-5 py-4">
              <p className="text-ink text-[13.5px] leading-relaxed">
                {content.description}
              </p>
            </div>
          </section>
        )}

        {/* ⑤ 이런 걸 해요 — 프로그램 리스트 */}
        {content?.programs && content.programs.length > 0 && (
          <section className="px-4 pt-5">
            <SectionLabel>이런 걸 해요</SectionLabel>
            <div className="mt-2 bg-white rounded-3xl shadow-soft border border-cream-200/80 px-5 py-3">
              <ul className="divide-y divide-cream-100">
                {content.programs.map((p) => (
                  <li key={p} className="flex items-center gap-3 py-2.5">
                    <span
                      className="w-9 h-9 rounded-2xl bg-cream-100 flex items-center justify-center text-[16px] shrink-0"
                      aria-hidden
                    >
                      {programIcon(p)}
                    </span>
                    <span className="text-ink text-[13.5px] font-bold leading-snug">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ⑥ 정보 요약 — 2x2 그리드 */}
        <section className="px-4 pt-5">
          <SectionLabel>정보 한눈에</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <InfoTile
              icon="₩"
              label="가격"
              value={
                residence.price !== undefined ? `${residence.price}만원` : "—"
              }
              sub="/월"
            />
            <InfoTile icon="📅" label="기간" value={residence.duration} />
            <InfoTile
              icon="👥"
              label="정원"
              value={`${residence.capacity ?? "-"}명`}
            />
            <InfoTile icon={env.emoji} label="환경" value={env.blurb} />
          </div>
          {residence.provides && residence.provides.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {residence.provides.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-full bg-cream-200 text-ink-soft text-[11px] font-bold"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ⑦ 다녀온 사람들 이야기 */}
        <section className="px-4 pt-5">
          <SectionLabel>다녀온 사람들 이야기</SectionLabel>
          <div className="mt-2 flex flex-col gap-2.5">
            {reviews.length > 0 ? (
              reviews.map((review, i) => <ReviewCard key={i} review={review} />)
            ) : (
              <p className="text-[12.5px] text-ink-mute px-2">
                아직 등록된 후기가 없어요.
              </p>
            )}
          </div>
        </section>

        {/* ─── 부가 섹션 (잠시섬 흐름 특유) ─── */}

        {/* 매칭 이유 */}
        <section className="px-4 pt-6">
          <SectionLabel>왜 추천받았나요?</SectionLabel>
          <div className="mt-2 bg-gradient-to-br from-primary-50 to-nature-50
                          border border-primary-200 rounded-3xl px-5 py-4">
            <p className="text-ink text-[13.5px] leading-relaxed">
              {residence.matchReason}
            </p>
            <p className="mt-2 text-ink-soft text-[11.5px]">
              <span className="text-primary font-bold">{stance.name}</span> ·{" "}
              {env.emoji} {env.blurb}
            </p>
          </div>
        </section>

        {/* 위치 미니맵 */}
        <section className="px-4 pt-5">
          <SectionLabel>위치</SectionLabel>
          <div className="mt-2 bg-white rounded-3xl shadow-soft border border-cream-200/80 p-3">
            <div className="mx-auto w-[200px]">
              <KoreaMap>
                <div
                  className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
                  style={{
                    left: `${residence.xPct}%`,
                    top: `${residence.yPct}%`,
                  }}
                >
                  <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold shadow-soft">
                    {residence.region}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-soft mt-0.5" />
                </div>
              </KoreaMap>
            </div>
          </div>
        </section>

        {/* 주변 인프라 — 미션 체크 반영 */}
        <section className="px-4 pt-5">
          <SectionLabel>주변 인프라</SectionLabel>
          <div className="mt-2 bg-white rounded-3xl shadow-soft border border-cream-200/80 px-5 py-3.5 space-y-2">
            <Infra
              icon="🏥"
              label="병원"
              detail={hasHospital ? "직접 걸어가 확인 완료" : "도보 12분 거리 종합병원"}
              checked={hasHospital}
            />
            <Infra
              icon="🚌"
              label="교통"
              detail={hasTransit ? "버스 배차 직접 확인" : "버스 평균 배차 35분"}
              checked={hasTransit}
            />
            <Infra
              icon="🛒"
              label="마트·시장"
              detail={hasMarket ? "물가 직접 체험" : "도보 10분 내 마트와 전통시장"}
              checked={hasMarket}
            />
          </div>
        </section>
      </main>

      {/* ⑧ 하단 고정 CTA — 신청·문의 (외부 링크) */}
      <footer
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px]
                   px-5 pb-6 pt-3 bg-white/95 backdrop-blur border-t border-cream-200"
      >
        <motion.a
          whileTap={{ scale: 0.99 }}
          href={residence.contactUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-4 rounded-2xl bg-primary text-white text-[15px] font-extrabold
                     shadow-soft transition"
        >
          신청·문의하기 ↗
        </motion.a>
        <p className="mt-1.5 text-center text-[10px] text-ink-mute">
          실제 결제·예약은 외부 사이트에서 진행돼요.
        </p>
      </footer>
    </div>
  );
}

// =====================================================================
// 서브 컴포넌트
// =====================================================================

// 상단 실사 사진 — 상하 그라데이션 + 우하단 baram 캐릭터 포인트
function ResidencePhoto({ residence }: { residence: Residence }) {
  const image = pickResidenceImage(residence);
  return (
    <div className="relative w-full h-56 bg-cream-200 overflow-hidden">
      <img
        src={image}
        alt={residence.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cream/85 to-transparent pointer-events-none" />
      <img
        src="/character1/clay-baram-solo.png"
        alt=""
        aria-hidden
        className="absolute right-3 bottom-3 w-10 h-auto pointer-events-none
                   drop-shadow-[0_4px_8px_rgba(62,44,32,0.28)]"
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-[10.5px] font-bold text-ink-mute tracking-[0.16em] uppercase">
      {children}
    </p>
  );
}

function InfoTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cream-200/80 px-4 py-3
                    flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-2xl bg-cream-100 flex items-center justify-center text-[16px] shrink-0"
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-ink-mute tracking-wider uppercase">
          {label}
        </p>
        <p className="mt-0.5 text-[14px] font-extrabold text-ink leading-none truncate">
          {value}
          {sub && (
            <span className="text-[10px] font-bold text-ink-mute"> {sub}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ResidenceReview }) {
  const initial = review.nickname.charAt(0).toUpperCase();
  const hash = Array.from(review.nickname).reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0
  );
  const bg = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  const fullStars = Math.floor(review.stars);
  const halfStar = review.stars - fullStars >= 0.5;
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cream-200/80 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center
                     text-ink text-[14px] font-extrabold ring-2 ring-white shadow-soft shrink-0"
          style={{ backgroundColor: bg }}
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-ink truncate">
            {review.nickname}
          </p>
          <div
            className="flex items-center gap-0.5 mt-0.5"
            aria-label={`${review.stars}점`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                size={11}
                dim={i >= fullStars + (halfStar ? 1 : 0)}
              />
            ))}
            <span className="ml-1 text-[11px] font-extrabold text-ink-soft tabular-nums">
              {review.stars.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[13px] text-ink leading-relaxed">{review.text}</p>
    </div>
  );
}

function Infra({
  icon,
  label,
  detail,
  checked,
}: {
  icon: string;
  label: string;
  detail: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[13px] font-bold">{label}</p>
        <p className="text-ink-mute text-[11px]">{detail}</p>
      </div>
      {checked && (
        <span className="text-nature-600 text-[11px] font-extrabold">
          ✓ 확인됨
        </span>
      )}
    </div>
  );
}

function StarIcon({ size = 14, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={dim ? "#E5DDD2" : "#F5B400"}
      aria-hidden
    >
      <path d="M12 2.5l2.95 6 6.6.95-4.78 4.66 1.13 6.57L12 17.6l-5.9 3.08 1.13-6.57L2.45 9.45l6.6-.95L12 2.5Z" />
    </svg>
  );
}
