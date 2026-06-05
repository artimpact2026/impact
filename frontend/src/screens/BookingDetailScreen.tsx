// 레지던스 예약 — 상세 화면 (야놀자 톤 8섹션)
// ① 사진 → ② 메타·태그·별점 → ③ 한 줄 → ④ 어떤 곳 → ⑤ 프로그램 → ⑥ 정보 그리드 → ⑦ 후기 → ⑧ 예약 CTA

import type { Residence } from "../data/residences";
import { envMeta, stanceMeta } from "../data/lifestyle";
import { pickResidenceImage, ratings } from "../data/bookingExtras";
import {
  residenceContent,
  programIcon,
  avgRating,
  type ResidenceReview,
} from "../data/residenceContent";

// 닉네임 이니셜 아바타용 파스텔 팔레트
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
  liked: boolean;
  onToggleLike: () => void;
  onBack: () => void;
  onBook: () => void;
};

export default function BookingDetailScreen({
  residence,
  liked,
  onToggleLike,
  onBack,
  onBook,
}: Props) {
  const image = pickResidenceImage(residence);
  const content = residenceContent[residence.id];
  const rating = avgRating(residence.id) || (ratings[residence.id] ?? 4.5);
  const reviews = content?.reviews ?? [];
  const env = envMeta[residence.envType];
  const stance = stanceMeta[residence.stance];

  return (
    <div className="h-screen overflow-y-auto bg-cream relative">
      {/* ① 큰 사진 + 오버레이 */}
      <div className="relative aspect-[16/12] bg-cream-200">
        <img
          src={image}
          alt={residence.name}
          className="w-full h-full object-cover"
        />
        {/* 하단 그라데이션 — 이름 가독성 */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

        {/* back · 찜 */}
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur
                     shadow-soft flex items-center justify-center text-ink text-[16px] font-bold
                     active:scale-[0.94]"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onToggleLike}
          aria-label={liked ? "찜 취소" : "찜"}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur
                     shadow-soft flex items-center justify-center active:scale-[0.92]"
        >
          <HeartIcon filled={liked} />
        </button>

        {/* 상단 중앙 별점 pill */}
        <span className="absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full
                         bg-white/95 backdrop-blur shadow-soft text-ink text-[11.5px] font-extrabold
                         flex items-center gap-1">
          <StarIcon size={12} /> {rating.toFixed(1)}
        </span>

        {/* 이름·지역 오버레이 (사진 위 큰 글씨) */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-5 text-white">
          <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
            {residence.region}
          </p>
          <p className="mt-1 text-[22px] font-extrabold leading-tight drop-shadow">
            {residence.name}
          </p>
        </div>

        {/* 캐릭터 포인트 — 우하단 모서리 */}
        <img
          src="/character1/clay-baram-solo.png"
          alt=""
          aria-hidden
          className="absolute right-4 bottom-4 w-12 h-auto pointer-events-none
                     drop-shadow-[0_4px_10px_rgba(62,44,32,0.3)]"
        />
      </div>

      {/* ② 메타 — 태그칩 + 별점 + 후기 수 */}
      <section className="px-6 pt-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-nature-50 text-nature-600 text-[11px] font-extrabold">
            {env.emoji} {env.blurb}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary text-[11px] font-extrabold">
            {stance.emoji} {stance.label}
          </span>
          {residence.hasSupport && (
            <span className="px-2.5 py-1 rounded-full bg-nature-500 text-white text-[10.5px] font-extrabold">
              🌱 정부 지원금
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <StarIcon size={14} />
          <span className="text-ink text-[14px] font-extrabold tabular-nums">
            {rating.toFixed(1)}
          </span>
          <span className="text-ink-mute text-[11.5px]">
            · 후기 {reviews.length}개
          </span>
        </div>
      </section>

      {/* ③ 한 줄 소개 — 굵게 */}
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
      </section>

      {/* ⑦ 다녀온 사람들 이야기 */}
      <section className="px-4 pt-5 pb-32">
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

      {/* ⑧ 하단 고정 CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-30
                      px-4 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]
                      bg-gradient-to-t from-cream via-cream/95 to-transparent">
        <button
          type="button"
          onClick={onBook}
          className="w-full py-3.5 rounded-2xl bg-primary text-white text-[15px] font-extrabold
                     shadow-soft active:scale-[0.99]"
        >
          예약하기 · {residence.price}만원 / 월
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// 서브 컴포넌트
// =====================================================================

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

function HeartIcon({ filled }: { filled: boolean }) {
  const stroke = "#FF7043";
  const fill = filled ? "#FF7043" : "none";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3.3c0 5.6-7.5 10.2-7.5 10.2Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
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
