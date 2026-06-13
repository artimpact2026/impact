// 내 정보 (마이페이지) — 정보 계층 v3
//
// 멘토 피드백:
//   · "나의 가치" 섹션이 화면 절반을 뒤덮어 무거움 → 제거.
//     HeroSection 의 칩 (자세/환경) 이 이미 정체성 표현 — 그걸로 충분.
//   · "실제 예약한 레지던스" 정보를 보여주자 → "다가오는 예약" 카드 신설.
//
// 섹션 순서:
//   1) HERO (존재) — 닉네임 + 페르소나 칩 + 본 지역
//   2) Upcoming — 다가오는 예약 (영속) — 시작일/기간/D-day
//   3) Wishlist — 찜한 청년마을

import { motion } from "framer-motion";
import {
  envMeta,
  stanceMeta,
  type LifestyleProfile,
} from "../data/lifestyle";
import type { LifeStyleType, Residence } from "../data/residences";
import type { OnboardingData } from "../data/quiz";
import { pickResidenceImage, ratings } from "../data/bookingExtras";
import TabLayout from "../components/TabLayout";
import {
  daysUntil,
  sortBookingsByUpcoming,
  type ConfirmedBooking,
} from "../data/confirmedBookings";

type Props = {
  nickname: string;
  homeRegion: string;
  lifestyle: LifeStyleType | null;
  profile?: LifestyleProfile;
  onboarding?: OnboardingData;
  likedResidences: Residence[];
  // 실제 확정된 예약 (영속). residenceId 로 allResidences 에서 찾아 표시.
  confirmedBookings: ConfirmedBooking[];
  allResidences: Residence[];
  onOpenSettings: () => void;
  onSelectResidence: (r: Residence) => void;
};

export default function ProfileScreen({
  nickname,
  homeRegion,
  profile,
  likedResidences,
  confirmedBookings,
  allResidences,
  onOpenSettings,
  onSelectResidence,
}: Props) {
  const stanceM = profile ? stanceMeta[profile.stance] : null;
  const envM = profile ? envMeta[profile.env] : null;

  // 다가오는 예약 — 시작일 가까운 순. residenceId 매핑.
  const upcomingBookings = sortBookingsByUpcoming(confirmedBookings)
    .map((b) => ({
      booking: b,
      residence: allResidences.find((r) => r.id === b.residenceId),
    }))
    .filter((x): x is { booking: ConfirmedBooking; residence: Residence } =>
      !!x.residence
    );

  return (
    <TabLayout
      preLabel="Profile"
      title="내 정보"
      rightActions={
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="설정"
          className="w-9 h-9 rounded-full bg-white border border-cream-200
                     flex items-center justify-center text-[16px] shadow-soft
                     active:scale-95 transition"
        >
          ⚙️
        </button>
      }
    >
      <div className="px-4 pb-10 space-y-5">
        {/* ① HERO */}
        <HeroSection
          nickname={nickname}
          homeRegion={homeRegion}
          stance={stanceM}
          env={envM}
        />

        {/* ② 다가오는 예약 */}
        <section>
          <div className="px-1 mb-2">
            <p className="text-[10.5px] font-extrabold text-ink-mute uppercase tracking-[0.16em]">
              Upcoming
            </p>
            <h2 className="mt-0.5 text-ink text-[15px] font-extrabold leading-tight">
              다가오는 예약
            </h2>
          </div>
          <UpcomingBookings
            items={upcomingBookings}
            onSelect={onSelectResidence}
          />
        </section>

        {/* ③ 찜한 마을 */}
        <section>
          <div className="flex items-end justify-between px-1 mb-2">
            <div>
              <p className="text-[10.5px] font-extrabold text-ink-mute uppercase tracking-[0.16em]">
                Wishlist
              </p>
              <h2 className="mt-0.5 text-ink text-[15px] font-extrabold leading-tight">
                내가 찜한 청년마을
              </h2>
            </div>
            {likedResidences.length > 0 && (
              <span className="text-[11px] font-extrabold text-primary tabular-nums">
                ❤️ {likedResidences.length}
              </span>
            )}
          </div>
          <LikedResidencesRail
            residences={likedResidences}
            onSelect={onSelectResidence}
          />
        </section>
      </div>
    </TabLayout>
  );
}

// =====================================================================
// HeroSection — 시각 punch
// =====================================================================

function HeroSection({
  nickname,
  homeRegion,
  stance,
  env,
}: {
  nickname: string;
  homeRegion: string;
  stance: ReturnType<typeof getStanceM> | null;
  env: ReturnType<typeof getEnvM> | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl overflow-hidden p-5 pt-6
                 bg-gradient-to-br from-[#F4EADC] via-[#FBF6EC] to-[#EDF2EA]
                 border border-cream-200"
    >
      <div
        aria-hidden
        className="absolute -top-4 -right-3 text-[120px] leading-none select-none pointer-events-none"
        style={{ opacity: 0.18 }}
      >
        {stance?.emoji ?? "🌱"}
      </div>

      <div className="relative">
        <p className="text-[56px] leading-none" aria-hidden>
          {stance?.emoji ?? "🌱"}
        </p>
        <h2 className="mt-3 text-ink text-[26px] font-extrabold leading-tight">
          {nickname}
        </h2>
        {(stance || env) && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {stance && (
              <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[12px] font-extrabold shadow-soft">
                {stance.name}
              </span>
            )}
            {env && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-cream-200 text-ink-soft text-[12px] font-bold">
                <span aria-hidden className="mr-0.5">
                  {env.emoji}
                </span>
                {env.name}
              </span>
            )}
          </div>
        )}
        <p className="mt-3 text-ink-soft text-[12.5px]">
          <span aria-hidden>📍</span> 본 지역{" "}
          <span className="text-ink font-bold">{homeRegion}</span>
        </p>
      </div>
    </motion.div>
  );
}

// (type helpers — lifestyle.ts 의 값 타입 추출)
type StanceM = ReturnType<typeof getStanceM>;
type EnvM = ReturnType<typeof getEnvM>;
function getStanceM() {
  return stanceMeta.alone_make;
}
function getEnvM() {
  return envMeta.mountain;
}
// 사용처가 함수 시그니처 내부뿐이라 lint 회피용으로 두 변수 더미 참조
void ({} as StanceM);
void ({} as EnvM);

// =====================================================================
// UpcomingBookings — 다가오는 예약 카드
// =====================================================================
//   · 0건: 안내 + 예약 탭으로 유도
//   · 1건: 풀카드 (사진 + 지역 + 시작일 + D-day + 기간)
//   · 2건+: 첫 카드 풀, 이후 작은 줄로 나열

function UpcomingBookings({
  items,
  onSelect,
}: {
  items: { booking: ConfirmedBooking; residence: Residence }[];
  onSelect: (r: Residence) => void;
}) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl border border-cream-200 shadow-soft
                   p-5 text-center"
      >
        <p className="text-3xl" aria-hidden>
          🗓️
        </p>
        <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
          아직 예약한 청년마을이 없어요.
          <br />
          마음에 드는 곳을 골라 한 번 머물러 보세요.
        </p>
      </motion.div>
    );
  }

  const [first, ...rest] = items;
  return (
    <div className="space-y-2">
      <UpcomingFeatureCard
        booking={first.booking}
        residence={first.residence}
        onSelect={() => onSelect(first.residence)}
      />
      {rest.length > 0 && (
        <div className="bg-white rounded-2xl border border-cream-200 shadow-soft
                        divide-y divide-cream-100">
          {rest.map(({ booking, residence }) => (
            <UpcomingMiniRow
              key={booking.id}
              booking={booking}
              residence={residence}
              onSelect={() => onSelect(residence)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UpcomingFeatureCard({
  booking,
  residence,
  onSelect,
}: {
  booking: ConfirmedBooking;
  residence: Residence;
  onSelect: () => void;
}) {
  const d = daysUntil(booking.startDate);
  const dDayLabel =
    d > 0 ? `D-${d}` : d === 0 ? "D-DAY" : `D+${Math.abs(d)}`;
  const isUpcoming = d >= 0;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      whileTap={{ scale: 0.99 }}
      className="block w-full overflow-hidden text-left
                 bg-white rounded-2xl border border-cream-200 shadow-soft
                 active:bg-cream-50 transition"
    >
      <div className="flex items-stretch">
        {/* 사진 — 좌측 정사각 96px */}
        <div className="relative w-[96px] h-[96px] shrink-0 bg-cream-200">
          <img
            src={pickResidenceImage(residence)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* 정보 — 우측 */}
        <div className="flex-1 min-w-0 px-3.5 py-2.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-ink-mute tracking-[0.14em] uppercase">
                {residence.region}
              </p>
              <p className="mt-0.5 text-ink text-[14px] font-extrabold leading-tight truncate">
                <span aria-hidden className="mr-1">
                  {residence.themeEmoji}
                </span>
                {residence.name}
              </p>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold
                          ${
                            isUpcoming
                              ? "bg-primary text-white"
                              : "bg-ink/80 text-cream"
                          }`}
            >
              {dDayLabel}
            </span>
          </div>
          <p className="text-[11.5px] font-bold text-ink-soft">
            {formatYMD(booking.startDate)} · {booking.durationMonths}개월
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function UpcomingMiniRow({
  booking,
  residence,
  onSelect,
}: {
  booking: ConfirmedBooking;
  residence: Residence;
  onSelect: () => void;
}) {
  const d = daysUntil(booking.startDate);
  const dDayLabel =
    d > 0 ? `D-${d}` : d === 0 ? "D-DAY" : `D+${Math.abs(d)}`;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full p-3 flex items-center gap-3 text-left active:bg-cream-50 transition"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-cream-100">
        <img
          src={pickResidenceImage(residence)}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-ink-mute uppercase tracking-[0.14em]">
          {residence.region}
        </p>
        <p className="mt-0.5 text-ink text-[13px] font-extrabold truncate">
          {residence.name}
        </p>
        <p className="mt-0.5 text-ink-soft text-[11px]">
          {formatYMD(booking.startDate)} · {booking.durationMonths}개월
        </p>
      </div>
      <span className="px-2 py-1 rounded-full bg-cream-50 border border-cream-200
                       text-primary text-[10.5px] font-extrabold shrink-0">
        {dDayLabel}
      </span>
    </button>
  );
}

// "2026-09-01" → "2026. 09. 01"
function formatYMD(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[1]}. ${m[2]}. ${m[3]}`;
}

// =====================================================================
// LikedResidencesRail — 찜한 청년마을 가로 스크롤 (기존 그대로)
// =====================================================================

function LikedResidencesRail({
  residences,
  onSelect,
}: {
  residences: Residence[];
  onSelect: (r: Residence) => void;
}) {
  if (residences.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-cream-200 shadow-soft
                   p-6 text-center"
      >
        <p className="text-3xl" aria-hidden>
          💛
        </p>
        <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
          아직 찜한 청년마을이 없어요.
          <br />
          발견 탭에서 마음에 드는 곳에 ❤️ 를 눌러보세요.
        </p>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="-mx-4 px-4 pb-1 flex gap-3 overflow-x-auto no-scrollbar
                 snap-x snap-mandatory"
      role="list"
      aria-label="찜한 청년마을 가로 목록"
    >
      {residences.map((r, i) => {
        const rating = ratings[r.id];
        return (
          <motion.button
            key={r.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(r)}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 w-[168px] snap-start
                       bg-white rounded-3xl border border-cream-200 shadow-soft
                       overflow-hidden text-left
                       active:bg-cream-50 transition"
          >
            <div className="relative aspect-[4/5] bg-cream-200">
              <img
                src={pickResidenceImage(r)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[55%]
                           bg-gradient-to-t from-black/65 via-black/20 to-transparent
                           pointer-events-none"
              />
              <span
                aria-label="찜한 마을"
                className="absolute top-2.5 right-2.5
                           w-9 h-9 rounded-full bg-white
                           flex items-center justify-center text-[16px]
                           shadow-[0_4px_12px_-2px_rgba(220,40,60,0.35)]
                           ring-2 ring-white/80"
              >
                ❤️
              </span>
              <div className="absolute left-3 right-3 bottom-2.5 text-white">
                <p
                  className="text-[15px] font-extrabold leading-tight truncate
                             drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                >
                  <span aria-hidden className="mr-1">
                    {r.themeEmoji}
                  </span>
                  {r.region}
                </p>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-ink-soft text-[11.5px] font-bold truncate">
                {r.name}
              </p>
              <div className="mt-1 flex items-center justify-between">
                {rating ? (
                  <p className="text-ink text-[11px] font-extrabold">
                    ⭐ {rating.toFixed(1)}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-primary text-[11px] font-extrabold">
                  보기 →
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
