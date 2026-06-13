// 예약 확정 영속 store
//
// 사용자가 BookingFormScreen → BookingDoneScreen 에 도달하면 한 건 등록.
// ProfileScreen 의 "다가오는 예약" 카드에 사용.
//
// 한 사람이 여러 청년마을을 예약할 수 있으니 배열. residenceId+startDate 같은 중복은 그대로 둠
// (실제 예약은 별개 트랜잭션 의미).

const STORAGE_KEY = "cheongpung.confirmedBookings.v1";

export type ConfirmedBooking = {
  id: string;
  residenceId: string;
  startDate: string;        // ISO "2026-09-01"
  durationMonths: number;
  confirmedAt: string;      // ISO timestamp
};

export function loadConfirmedBookings(): ConfirmedBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveConfirmedBookings(items: ConfirmedBooking[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* localStorage 차단 환경 — 조용히 무시 */
  }
}

// startDate 가 가까운 순서로 정렬, 이미 지난 건 뒤로.
export function sortBookingsByUpcoming(
  items: ConfirmedBooking[],
  today: Date = new Date()
): ConfirmedBooking[] {
  const todayMs = today.setHours(0, 0, 0, 0);
  return [...items].sort((a, b) => {
    const aMs = new Date(a.startDate).getTime();
    const bMs = new Date(b.startDate).getTime();
    const aUpcoming = aMs >= todayMs ? 0 : 1;
    const bUpcoming = bMs >= todayMs ? 0 : 1;
    if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;
    return aMs - bMs;
  });
}

// 시작일까지 D-day. 양수=다가옴, 0=오늘, 음수=지남.
export function daysUntil(startDate: string, today: Date = new Date()): number {
  const todayMs = today.setHours(0, 0, 0, 0);
  const startMs = new Date(startDate).setHours(0, 0, 0, 0);
  return Math.round((startMs - todayMs) / 86400000);
}
