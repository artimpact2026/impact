// 레지던스 예약 — 입주 날짜·기간 선택 폼
// 4주 칩(다음 4주 월요일) + 기간 칩(1/3/6/12) + 요약 + 하단 고정 "예약 신청"

import { useMemo, useState } from "react";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  onBack: () => void;
  onSubmit: (draft: { startDate: string; durationMonths: number }) => void;
};

const DURATION_OPTIONS = [1, 3, 6, 12];

// 다음 4주 동안의 월요일 4개 생성 — 오늘 이후 가장 가까운 월요일부터
function getNextMondays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 오늘이 월요일이면 다음 주 월요일부터 (입주 준비 최소 1주)
  const day = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // 다음 월요일 offset 계산
  let offset: number;
  if (day === 0) offset = 1; // 일요일 → 내일
  else if (day === 1) offset = 7; // 월요일 → 다음 주 월요일
  else offset = 8 - day; // 화~토 → 다음 월요일
  const result: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset + i * 7);
    result.push(d);
  }
  return result;
}

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplay(d: Date): string {
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return `${mm}/${dd} (월)`;
}

function relativeLabel(idx: number): string {
  return ["다음 주", "2주 뒤", "3주 뒤", "4주 뒤"][idx] ?? "";
}

export default function BookingFormScreen({
  residence,
  onBack,
  onSubmit,
}: Props) {
  const weeks = useMemo(() => getNextMondays(4), []);
  const [weekIdx, setWeekIdx] = useState(0);
  const [duration, setDuration] = useState(1);

  const startDate = weeks[weekIdx];
  const totalCost = (residence.price ?? 0) * duration;

  const handleSubmit = () => {
    onSubmit({
      startDate: formatDate(startDate),
      durationMonths: duration,
    });
  };

  return (
    <div className="h-screen overflow-y-auto bg-cream">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로"
            className="w-9 h-9 rounded-full bg-white shadow-soft border border-cream-200
                       flex items-center justify-center text-ink text-[15px] font-bold
                       active:scale-[0.94]"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold text-ink-mute tracking-widest uppercase">
              {residence.region}
            </p>
            <p className="text-[14.5px] font-extrabold text-ink truncate">
              {residence.name}
            </p>
          </div>
        </div>
      </header>

      <section className="px-5 pt-3 pb-32">
        {/* 입주 날짜 */}
        <h2 className="text-[16px] font-extrabold text-ink">입주 날짜</h2>
        <p className="mt-0.5 text-[11.5px] text-ink-mute">
          다음 4주 안에서 시작 주를 골라주세요
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {weeks.map((d, i) => (
            <WeekChip
              key={i}
              active={weekIdx === i}
              relative={relativeLabel(i)}
              display={formatDisplay(d)}
              onClick={() => setWeekIdx(i)}
            />
          ))}
        </div>

        {/* 기간 */}
        <h2 className="mt-7 text-[16px] font-extrabold text-ink">기간</h2>
        <p className="mt-0.5 text-[11.5px] text-ink-mute">얼마나 머무를까요?</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((m) => (
            <DurationChip
              key={m}
              active={duration === m}
              months={m}
              onClick={() => setDuration(m)}
            />
          ))}
        </div>

        {/* 요약 */}
        <div className="mt-7 bg-white rounded-3xl shadow-soft border border-cream-200/80 px-5 py-4">
          <p className="text-[10.5px] font-bold text-ink-mute tracking-widest uppercase">
            Summary
          </p>
          <div className="mt-2 flex flex-col gap-1.5 text-[13px]">
            <SummaryRow label="입주일" value={formatDate(startDate)} />
            <SummaryRow label="기간" value={`${duration}개월`} />
            <SummaryRow
              label="예상 비용"
              value={`${totalCost.toLocaleString("ko-KR")}만원`}
              emphasize
            />
          </div>
          {residence.hasSupport && (
            <p className="mt-3 text-[11px] text-nature-600 font-bold">
              🌱 정부 지원금 대상 — 신청 후 안내드려요
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
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-primary text-white text-[15px] font-extrabold
                     shadow-soft active:scale-[0.99]"
        >
          예약 신청
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// 칩 & 요약 행
// =====================================================================
function WeekChip({
  active,
  relative,
  display,
  onClick,
}: {
  active: boolean;
  relative: string;
  display: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full px-5 py-3.5 rounded-2xl flex items-center justify-between
        active:scale-[0.99] transition border
        ${
          active
            ? "bg-primary text-white border-primary shadow-soft"
            : "bg-white text-ink border-cream-200"
        }`}
    >
      <span className="text-[14px] font-extrabold">{relative}</span>
      <span
        className={`text-[12.5px] font-bold ${
          active ? "text-white/85" : "text-ink-mute"
        }`}
      >
        {display}
      </span>
    </button>
  );
}

function DurationChip({
  active,
  months,
  onClick,
}: {
  active: boolean;
  months: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`py-3 rounded-2xl text-[13.5px] font-extrabold
        active:scale-[0.97] transition border
        ${
          active
            ? "bg-primary text-white border-primary shadow-soft"
            : "bg-white text-ink border-cream-200"
        }`}
    >
      {months}개월
    </button>
  );
}

function SummaryRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-mute">{label}</span>
      <span
        className={
          emphasize
            ? "text-[15px] font-extrabold text-ink"
            : "text-ink font-bold"
        }
      >
        {value}
      </span>
    </div>
  );
}
