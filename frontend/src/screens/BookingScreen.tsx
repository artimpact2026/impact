// 레지던스 예약 탭 — 목록 화면
// 추천 8곳: Hero 2개 가로 스와이프 + 리스트 카드 6개. 지역 필터·찜(화면 상태).

import { useEffect, useMemo, useRef, useState } from "react";
import type { Residence } from "../data/residences";
import { pickResidenceImage, ratings } from "../data/bookingExtras";

type Props = {
  residences: Residence[];
  onSelectResidence: (residence: Residence) => void;
  // 좋아요(찜) 상태는 부모(App.tsx)에서 영속화·통합 관리. 내정보 탭과 동기화 필수.
  liked: Set<string>;
  onToggleLike: (residenceId: string) => void;
  // 발견 탭의 "전체 보기" 로 들어왔을 때만 백 버튼 노출
  onBack?: () => void;
};

export default function BookingScreen({
  residences,
  onSelectResidence,
  liked,
  onToggleLike,
  onBack,
}: Props) {
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 지역 필터 변경 시 상단 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [regionFilter]);

  const regions = useMemo(
    () => Array.from(new Set(residences.map((r) => r.region))),
    [residences]
  );
  const visible = regionFilter
    ? residences.filter((r) => r.region === regionFilter)
    : residences;

  // Hero는 추천 상위 2개 (필터 적용 X — 항상 추천 큐레이션)
  const heroes = residences.slice(0, 2);
  // 리스트는 visible에서 Hero 제외 (필터 없을 때만), 필터 있을 때는 visible 그대로
  const listItems = regionFilter
    ? visible
    : visible.filter((r) => !heroes.includes(r));

  // 좋아요 토글은 부모로 위임 (App.tsx 가 bookingLiked Set 관리 + 영속화)
  const toggleLike = (id: string) => onToggleLike(id);

  return (
    <div ref={scrollRef} className="h-screen overflow-y-auto bg-cream">
      {/* 헤더 + 필터 */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur">
        <div className="px-6 pt-7 pb-4 relative">
          {/* 백 버튼 — 발견 → 전체 보기로 진입했을 때만 */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="뒤로가기"
              className="absolute top-7 left-5 w-9 h-9 rounded-full bg-white shadow-soft
                         flex items-center justify-center text-ink z-10"
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
          )}
          <div className={onBack ? "pl-12" : ""}>
            <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
              Booking
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold text-ink leading-tight">
              레지던스
            </h1>
            <p className="mt-1 text-[12px] text-ink-soft">
              추천 {residences.length}곳 · 마음 정해서 떠나봐요
            </p>
          </div>
          <img
            src="/character1/clay-baram-solo.png"
            alt=""
            aria-hidden
            className="absolute top-3 right-5 w-[52px] h-auto drop-shadow-[0_6px_10px_rgba(62,44,32,0.22)] pointer-events-none"
          />
        </div>
        <RegionFilter
          value={regionFilter}
          regions={regions}
          onChange={setRegionFilter}
        />
      </header>

      {/* Hero 큐레이션 — 필터 미적용 시에만 노출 */}
      {!regionFilter && (
        <section className="pt-2 pb-4">
          <div className="px-5 pb-2">
            <p className="text-[11px] font-bold text-ink-mute tracking-widest uppercase">
              Featured
            </p>
            <p className="text-[16px] font-extrabold text-ink mt-0.5">
              이번 주 큐레이션
            </p>
          </div>
          <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-2">
            <div className="flex gap-3 w-max">
              {heroes.map((r) => (
                <HeroCard
                  key={r.id}
                  residence={r}
                  liked={liked.has(r.id)}
                  onToggleLike={() => toggleLike(r.id)}
                  onSelect={() => onSelectResidence(r)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 리스트 */}
      <section className="pb-32">
        <div className="px-5 pb-3 pt-2">
          <p className="text-[11px] font-bold text-ink-mute tracking-widest uppercase">
            All
          </p>
          <p className="text-[16px] font-extrabold text-ink mt-0.5">
            {regionFilter ? `${regionFilter} ${visible.length}곳` : "또 다른 추천"}
          </p>
        </div>

        {listItems.map((r) => (
          <ListCard
            key={r.id}
            residence={r}
            liked={liked.has(r.id)}
            onToggleLike={() => toggleLike(r.id)}
            onSelect={() => onSelectResidence(r)}
          />
        ))}

        {listItems.length === 0 && (
          <div className="mx-4 mt-6 bg-white rounded-[28px] px-5 py-10 shadow-soft border border-cream-200 text-center">
            <p className="text-[28px]" aria-hidden>
              📭
            </p>
            <p className="mt-2 text-[13px] font-bold text-ink">
              아직 이 지역의 추천 레지던스가 없어요
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// =====================================================================
// 지역 필터
// =====================================================================
function RegionFilter({
  value,
  regions,
  onChange,
}: {
  value: string | null;
  regions: string[];
  onChange: (next: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar px-5 pb-4">
      <div className="flex gap-1.5 w-max">
        <FilterChip
          label="전체"
          active={value === null}
          onClick={() => onChange(null)}
        />
        {regions.map((region) => (
          <FilterChip
            key={region}
            label={region}
            active={value === region}
            onClick={() => onChange(region)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] transition active:scale-[0.97]
        ${
          active
            ? "bg-primary text-white font-extrabold shadow-soft"
            : "bg-transparent text-ink-mute font-semibold"
        }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// =====================================================================
// Hero 카드 — 큰 이미지 + 오버레이
// =====================================================================
function HeroCard({
  residence,
  liked,
  onToggleLike,
  onSelect,
}: {
  residence: Residence;
  liked: boolean;
  onToggleLike: () => void;
  onSelect: () => void;
}) {
  const rating = ratings[residence.id] ?? 4.5;
  const image = pickResidenceImage(residence);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="snap-center shrink-0 w-[300px] rounded-[28px] overflow-hidden
                 bg-white shadow-soft border border-cream-200/80 active:scale-[0.99] transition text-left"
    >
      <div className="relative aspect-[16/12] bg-cream-200">
        <img
          src={image}
          alt={residence.name}
          className="w-full h-full object-cover"
        />
        {/* 하단 그라데이션 */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />
        {/* 찜 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          aria-label={liked ? "찜 취소" : "찜"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur
                     shadow-soft flex items-center justify-center active:scale-[0.92]"
        >
          <HeartIcon filled={liked} />
        </button>
        {/* 평점 pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur
                         shadow-soft text-ink text-[11.5px] font-extrabold flex items-center gap-1">
          <StarIcon size={12} />
          {rating.toFixed(1)}
        </span>
        {/* 텍스트 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 text-white">
          <p className="text-[10.5px] font-bold tracking-widest uppercase opacity-90">
            {residence.region}
          </p>
          <p className="mt-0.5 text-[18px] font-extrabold leading-tight drop-shadow">
            {residence.name}
          </p>
          <p className="mt-1 text-[12.5px] opacity-95">
            <span className="font-extrabold">{residence.price}만원</span>
            <span className="opacity-80"> / 월 · {residence.duration}</span>
          </p>
        </div>
        {/* 캐릭터 포인트 — 우하단 모서리, 사진 안 덮게 작게 */}
        <img
          src="/character1/clay-baram-solo.png"
          alt=""
          aria-hidden
          className="absolute right-3 bottom-3 w-10 h-auto pointer-events-none
                     drop-shadow-[0_4px_8px_rgba(62,44,32,0.28)]"
        />
      </div>
    </button>
  );
}

// =====================================================================
// 리스트 카드 — 썸네일 + 정보
// =====================================================================
function ListCard({
  residence,
  liked,
  onToggleLike,
  onSelect,
}: {
  residence: Residence;
  liked: boolean;
  onToggleLike: () => void;
  onSelect: () => void;
}) {
  const rating = ratings[residence.id] ?? 4.5;
  const image = pickResidenceImage(residence);
  const provides = (residence.provides ?? []).slice(0, 2);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="mx-4 mb-3 w-[calc(100%-2rem)] bg-white rounded-3xl
                 shadow-soft border border-cream-200/80 p-3
                 flex gap-3 items-stretch active:scale-[0.99] transition text-left"
    >
      {/* 썸네일 */}
      <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-cream-200">
        <img src={image} alt="" aria-hidden className="w-full h-full object-cover" />
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold text-ink-mute tracking-wider uppercase">
              {residence.region}
            </p>
            <p className="text-[14.5px] font-extrabold text-ink leading-tight truncate">
              {residence.name}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            aria-label={liked ? "찜 취소" : "찜"}
            className="p-1 -m-1 active:scale-[0.88] shrink-0"
          >
            <HeartIcon filled={liked} small />
          </button>
        </div>

        {residence.blurb && (
          <p className="mt-0.5 text-[11.5px] text-ink-soft leading-snug line-clamp-1">
            {residence.blurb}
          </p>
        )}

        <div className="mt-1 flex items-center gap-1 flex-wrap">
          {provides.map((p) => (
            <span
              key={p}
              className="text-[10px] font-bold text-ink-soft bg-cream-200 px-2 py-0.5 rounded-full"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-1 flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-[11.5px] font-extrabold text-ink">
            <StarIcon size={12} />
            {rating.toFixed(1)}
          </span>
          <span className="text-[10.5px] text-ink-mute">정원 {residence.capacity ?? "-"}명</span>
          <span className="ml-auto text-[13px] font-extrabold text-ink">
            {residence.price}
            <span className="text-[10.5px] font-bold text-ink-mute"> 만원/월</span>
          </span>
        </div>
      </div>
    </button>
  );
}

// =====================================================================
// 공통 아이콘
// =====================================================================
function HeartIcon({ filled, small = false }: { filled: boolean; small?: boolean }) {
  const stroke = "#FF7043";
  const fill = filled ? "#FF7043" : "none";
  const size = small ? 22 : 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3.3c0 5.6-7.5 10.2-7.5 10.2Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5B400" aria-hidden>
      <path d="M12 2.5l2.95 6 6.6.95-4.78 4.66 1.13 6.57L12 17.6l-5.9 3.08 1.13-6.57L2.45 9.45l6.6-.95L12 2.5Z" />
    </svg>
  );
}
