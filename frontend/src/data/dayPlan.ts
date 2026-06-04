// 일차 분배 — 레지던스 duration("4박 5일")에서 일수 파싱하고
// 미션을 일수만큼 균등 분배. 잠시섬 = "체류" 컨셉이라 하루씩 미션이 풀린다.

import type { Mission } from "./missions";
import type { Residence } from "./residences";

// "4박 5일", "5박 6일" 같은 한글 표기에서 마지막 숫자(일수)를 추출
// 파싱 실패 시 기본값 4
export function parseDayCount(duration: string | undefined): number {
  if (!duration) return 4;
  const match = duration.match(/(\d+)\s*일/);
  if (!match) return 4;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

// 미션을 N일에 균등 분배 — 입력 순서 유지(카테고리 묶임 유지)
// 균등이 안 떨어지면 앞 일차가 1개씩 더 받음
// 예: 13개 / 5일 → [3, 3, 3, 2, 2]
export function chunkByDay<T>(items: T[], dayCount: number): T[][] {
  if (dayCount <= 0) return [items];
  const base = Math.floor(items.length / dayCount);
  const extra = items.length % dayCount;
  const days: T[][] = [];
  let cursor = 0;
  for (let d = 0; d < dayCount; d++) {
    const size = base + (d < extra ? 1 : 0);
    days.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return days;
}

// 레지던스 + 미션 → 일차별 미션 ID 배열
export function buildDayPlan(
  residence: Residence,
  missions: Mission[]
): {
  dayCount: number;
  missionsByDay: string[][]; // [day1 ids, day2 ids, ...]
} {
  const dayCount = parseDayCount(residence.duration);
  const missionsByDay = chunkByDay(missions, dayCount).map((day) =>
    day.map((m) => m.id)
  );
  return { dayCount, missionsByDay };
}

// 특정 일차에 속한 미션 ID 집합 (1-based day)
export function missionIdsForDay(
  missionsByDay: string[][],
  day: number
): Set<string> {
  const list = missionsByDay[day - 1] ?? [];
  return new Set(list);
}

// 특정 일차의 모든 미션이 완료됐는지
export function isDayComplete(
  missionsByDay: string[][],
  day: number,
  completedIds: Set<string> | string[]
): boolean {
  const ids = missionsByDay[day - 1] ?? [];
  if (ids.length === 0) return false;
  const completedSet =
    completedIds instanceof Set ? completedIds : new Set(completedIds);
  return ids.every((id) => completedSet.has(id));
}

// 나의 공간 단계(0~3) 계산
// 매 일차마다 한 자리씩 채워지되, 4단계가 끝이면 그대로 유지
// (예: 5일 체류 → Day1=1, Day2=2, Day3=3, Day4=3, Day5=3 — 마지막은 '머무는 날')
export function houseStageFromProgress(
  completedDays: number,
  _totalDays: number
): 0 | 1 | 2 | 3 {
  if (completedDays <= 0) return 0;
  if (completedDays === 1) return 1;
  if (completedDays === 2) return 2;
  return 3;
}

// 단계 라벨 — 화면 공통 사용
// 레지던스와 의미가 겹치지 않게 "공간/자리" 톤으로 통일
export const SPACE_STAGE_NAMES = [
  "빈 자리",
  "자리 잡기",
  "깊어짐",
  "내 자리",
] as const;
