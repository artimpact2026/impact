// 하루 종료 판정 — 매일 종료 의식 트리거.
//
// 종료 조건:
//   · 그날 필수 미션 전부 완료 (mainsRemaining === 0)
//   · AND 보너스 미션 N개 이상 완료 (지역 누적, DAY_COMPLETE_BONUS_REQUIRED)
//   필수만 채우거나 보너스만 채우면 종료 X. 둘 다 충족해야 의식.
//
// 종료 임박 (urgency):
//   · 남은 미션 수가 임계값(URGENCY_THRESHOLD) 이하면 마스코트 독려 등장 신호.
//   · 하루에 한 번만 발화하도록 게이팅은 호출 측에서 (이 훅은 순수 derivation).
//
// 도파민 무한 루프 회피:
//   · 종료 충족 후에도 추가 미션을 막지는 않음. 단, 더 하라고 유도하지도 않음.
//   · 종료 충족 → 마스코트 마무리 + 퍼즐 조각이 채워지는 의식이 끝나고 자유롭게.

import { useMemo } from "react";

/** 종료 충족에 필요한 보너스 미션 수 */
export const DAY_COMPLETE_BONUS_REQUIRED = 2;
/** 종료까지 남은 미션이 이 수 이하이면 임박 상태 */
export const URGENCY_THRESHOLD = 2;

export type DayCompleteState = {
  /** 그날 필수 미션 총 개수 (보통 3) */
  mainsRequired: number;
  /** 그날 완료한 필수 미션 수 */
  mainsCompleted: number;
  /** 남은 필수 미션 수 */
  mainsRemaining: number;
  /** 필수 미션 전부 완료 */
  isMainComplete: boolean;
  /** 보너스 완료 수 (지역 누적) */
  bonusCompleted: number;
  /** 보너스 종료 충족 임계값 (DAY_COMPLETE_BONUS_REQUIRED) */
  bonusRequired: number;
  /** 충족까지 남은 보너스 수 */
  bonusRemaining: number;
  /** 보너스 임계값 충족 */
  isBonusComplete: boolean;
  /** 하루 종료 충족 — 필수 + 보너스 둘 다 */
  isDayComplete: boolean;
  /** 종료까지 더 해야 하는 미션 수 (필수 미완 + 부족 보너스) */
  remainingToComplete: number;
  /** 종료 임박 — 남은 미션이 임계값 이하 + 아직 종료 X */
  isUrgent: boolean;
};

type Args = {
  /** 일차별 필수 미션 id 배열 — buildDayPlan 결과의 missionsByDay */
  missionsByDay: string[][];
  /** 보너스 미션 id 배열 — buildDayPlan 결과의 bonusMissionIds */
  bonusMissionIds: string[];
  /** 현재 일차 (1-based) */
  currentDay: number;
  /** 완료한 미션 id 집합 (지역 누적) */
  completedIds: Set<string>;
};

export function useDayComplete({
  missionsByDay,
  bonusMissionIds,
  currentDay,
  completedIds,
}: Args): DayCompleteState {
  return useMemo(() => {
    const todayMainIds = missionsByDay[currentDay - 1] ?? [];
    const mainsRequired = todayMainIds.length;
    const mainsCompleted = todayMainIds.filter((id) =>
      completedIds.has(id)
    ).length;
    const mainsRemaining = Math.max(0, mainsRequired - mainsCompleted);
    const isMainComplete =
      mainsRequired > 0 && mainsCompleted === mainsRequired;

    const bonusCompleted = bonusMissionIds.filter((id) =>
      completedIds.has(id)
    ).length;
    const bonusRequired = DAY_COMPLETE_BONUS_REQUIRED;
    const bonusRemaining = Math.max(0, bonusRequired - bonusCompleted);
    const isBonusComplete = bonusCompleted >= bonusRequired;

    const isDayComplete = isMainComplete && isBonusComplete;
    const remainingToComplete = mainsRemaining + bonusRemaining;
    const isUrgent =
      !isDayComplete &&
      remainingToComplete > 0 &&
      remainingToComplete <= URGENCY_THRESHOLD;

    return {
      mainsRequired,
      mainsCompleted,
      mainsRemaining,
      isMainComplete,
      bonusCompleted,
      bonusRequired,
      bonusRemaining,
      isBonusComplete,
      isDayComplete,
      remainingToComplete,
      isUrgent,
    };
  }, [missionsByDay, bonusMissionIds, currentDay, completedIds]);
}
