// 레지던스 예약 — 상세 화면
// 큰 이미지 + 메타 + blurb + 매칭사유 + provides + 후기 + 하단 고정 예약하기

import type { Residence } from "../data/residences";
import {
  pickResidenceImage,
  ratings,
  reviewsByResidence,
  type ResidenceReview,
} from "../data/bookingExtras";

// 아바타 파스텔 팔레트 (커뮤니티와 동일)
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
  const rating = ratings[residence.id] ?? 4.5;
  const reviews = reviewsByResidence[residence.id] ?? [];

  return (
    <div className="h-screen overflow-y-auto bg-cream relative">
      {/* 큰 이미지 + 오버레이 */}
      <div className="relative aspect-[16/12] bg-cream-200">
        <img
          src={image}
          alt={residence.name}
          className="w-full h-full object-cover"
        />
        {/* 하단 그라데이션 */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

        {/* 상단 좌/우 버튼 */}
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

        {/* 평점 pill */}
        <span className="absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full
                         bg-white/95 backdrop-blur shadow-soft text-ink text-[11.5px] font-extrabold
                         flex items-center gap-1">
          <StarIcon size={12} /> {rating.toFixed(1)}
        </span>

        {/* 이름·지역 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-5 text-white">
          <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
            {residence.region}
          </p>
          <p className="mt-1 text-[22px] font-extrabold leading-tight drop-shadow">
            {residence.name}
          </p>
        </div>
      </div>

      {/* 메타 카드 */}
      <section className="px-4 -mt-5 relative z-10">
        <div className="bg-white rounded-[24px] shadow-soft border border-cream-200/80 px-5 py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <MetaItem label="가격" value={`${residence.price}만원`} sub="/월" />
            <MetaItem label="정원" value={`${residence.capacity ?? "-"}명`} />
            <MetaItem label="기간" value={residence.duration} />
          </div>
          {residence.hasSupport && (
            <div className="mt-3 flex items-center justify-center">
              <span className="px-2.5 py-1 rounded-full bg-nature-100 text-nature-600 text-[11px] font-extrabold">
                🌱 정부 지원금 대상
              </span>
            </div>
          )}
        </div>
      </section>

      {/* blurb */}
      {residence.blurb && (
        <section className="px-6 pt-6">
          <p className="text-[15.5px] font-extrabold text-ink leading-snug">
            {residence.blurb}
          </p>
        </section>
      )}

      {/* 매칭 사유 */}
      <section className="px-4 pt-5">
        <div className="bg-white rounded-3xl shadow-soft border border-cream-200/80 px-5 py-4">
          <p className="text-[10.5px] font-bold text-ink-mute tracking-widest uppercase">
            왜 이곳일까요
          </p>
          <p className="mt-2 text-[13.5px] text-ink leading-relaxed">
            {residence.matchReason}
          </p>
          <p className="mt-2 text-[11px] text-ink-mute">
            추천 라이프스타일 · <span className="font-bold text-ink-soft">{residence.matchType}</span>
          </p>
        </div>
      </section>

      {/* provides */}
      {residence.provides && residence.provides.length > 0 && (
        <section className="px-6 pt-6">
          <p className="text-[11px] font-bold text-ink-mute tracking-widest uppercase">
            Provides
          </p>
          <p className="text-[16px] font-extrabold text-ink mt-0.5">제공 항목</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {residence.provides.map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 rounded-full bg-cream-200 text-ink-soft text-[12px] font-bold"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 후기 */}
      <section className="px-6 pt-7 pb-32">
        <p className="text-[11px] font-bold text-ink-mute tracking-widest uppercase">
          Reviews
        </p>
        <p className="text-[16px] font-extrabold text-ink mt-0.5">
          다녀온 사람들 이야기
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
          {reviews.length === 0 && (
            <p className="text-[12.5px] text-ink-mute">
              아직 등록된 후기가 없어요.
            </p>
          )}
        </div>
      </section>

      {/* 하단 고정 CTA */}
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
// 컴포넌트들
// =====================================================================
function MetaItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-ink-mute tracking-wider uppercase">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-extrabold text-ink leading-none">
        {value}
        {sub && <span className="text-[10px] font-bold text-ink-mute"> {sub}</span>}
      </p>
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
          <div className="flex items-center gap-0.5 mt-0.5" aria-label={`${review.stars}점`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={11} dim={i >= review.stars} />
            ))}
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
