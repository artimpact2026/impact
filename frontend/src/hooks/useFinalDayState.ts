// 마지막 날 의식(DayEndCeremonyScreen) 분기 상태.
//
// 의도:
//   · "마당 꾸미기 전(A)" vs "마당 완성 후(B)" 분기를 화면 컴포넌트에서 하드코딩하지 않도록 격리.
//   · placedDecor 가 한 개라도 있으면 hasPlacedItem=true → 상태 B 로 흐르게 함.
//   · 상태 A 가 사용자에게 보여줄 데이터(미배치 자재 수, 받은 자재·기념품)를 한 번에 계산.
//
// 데이터 출처:
//   · acquiredDecorItems  — App.tsx 영속 state (decorItems.ts 트랙)
//   · acquiredItems       — App.tsx 영속 state (기념품)
//   · placedDecor[res.id] — App.tsx 영속 state (마당 배치) — 호출 측에서 해당 레지던스만 잘라서 넘김
//
// 반환값은 컴포넌트가 그대로 렌더에 쓰도록 메모이즈한 객체.

import { useMemo } from "react";
import type { DecorCategory, DecorItem } from "../data/decorItems";
import type { Item } from "../data/items";
import { buildDayPlan } from "../data/dayPlan";
import { missionsForResidence } from "../data/regionMissions";
import { residences } from "../data/residences";

export type FinalDayState = {
  /** 마지막 일차 여부 — finishedDay >= totalDays */
  isFinalDay: boolean;
  /** 한 개라도 배치했는지. 상태 B 트리거 */
  hasPlacedItem: boolean;
  /** 이 레지던스에서 획득한 자재 전체 */
  decorItems: DecorItem[];
  /** 미배치 자재 (placedDecor 에 들어있지 않은 것) */
  unplacedDecor: DecorItem[];
  /** 미배치 자재 수 — "내 자리" 버튼 뱃지 N */
  unplacedCount: number;
  /** 이 레지던스에서 획득한 기념품 전체 */
  souvenirs: Item[];
  /** finishedDay 에 받은 자재. 마지막 날에 미션이 없으면 가장 최근 미션 일차로 fallback */
  todayDecor: DecorItem[];
  /** finishedDay 에 받은 기념품. 자재와 같은 규칙 */
  todaySouvenirs: Item[];
  /** todayDecor + todaySouvenirs 의 실제 기준 일차 (디버그·UI 표시용) */
  todayDay: number;
  /** "오늘 받은" 자재 중 아직 마당에 배치 안 된 것 — 뱃지 N 용 */
  todayUnplacedDecor: DecorItem[];
  /** 오늘 받은 자재 중 미배치 수 — 0 이면 뱃지 숨김 */
  todayUnplacedCount: number;
};

type Args = {
  finishedDay: number;
  totalDays: number;
  residenceId: string;
  /** App.tsx 의 전체 자재 목록 — residenceId 로 필터링은 이 함수가 함 */
  acquiredDecorItems: DecorItem[];
  /** App.tsx 의 전체 기념품 목록 — residenceId 로 필터링은 이 함수가 함 */
  acquiredItems: Item[];
  /** 해당 레지던스 슬롯별 배치. 호출 측에서 잘라 넘김 (예: placedDecor[selected.id] ?? {}) */
  placedDecor: Partial<Record<DecorCategory, string>>;
};

export function useFinalDayState({
  finishedDay,
  totalDays,
  residenceId,
  acquiredDecorItems,
  acquiredItems,
  placedDecor,
}: Args): FinalDayState {
  return useMemo(() => {
    const isFinalDay = finishedDay >= totalDays;
    const decorItems = acquiredDecorItems.filter(
      (d) => d.residenceId === residenceId
    );
    const souvenirs = acquiredItems.filter(
      (i) => i.residenceId === residenceId
    );
    const placedDecorIds = new Set(
      Object.values(placedDecor).filter((v): v is string => Boolean(v))
    );
    const unplacedDecor = decorItems.filter((d) => !placedDecorIds.has(d.id));
    const hasPlacedItem = placedDecorIds.size > 0;

    // === "그 날 받은" 계산 ===
    //   missionId → 일차 매핑을 buildDayPlan 으로 구하고, 아이템의 missionId 로 역추적.
    //   finishedDay 에 미션이 없으면 (예: 강화 Day 5 — missionsByDay[4] = []) 가장 최근
    //   미션 일차로 폴백 — "받은 게 있는 마지막 날" 의식 흐름.
    let todayDay = finishedDay;
    let todayDecor: DecorItem[] = [];
    let todaySouvenirs: Item[] = [];
    const residence = residences.find((r) => r.id === residenceId);
    if (residence) {
      const missions = missionsForResidence(residence.id);
      const { missionsByDay } = buildDayPlan(residence, missions);
      const missionDay = new Map<string, number>();
      missionsByDay.forEach((ids, idx) => {
        ids.forEach((id) => missionDay.set(id, idx + 1));
      });
      const filterByDay = (day: number) => ({
        d: decorItems.filter((d) => missionDay.get(d.missionId) === day),
        s: souvenirs.filter((s) => missionDay.get(s.missionId) === day),
      });
      let bucket = filterByDay(finishedDay);
      // 폴백 — finishedDay 가 비어있으면 직전 일차부터 거꾸로 탐색
      if (bucket.d.length === 0 && bucket.s.length === 0 && finishedDay > 1) {
        for (let d = finishedDay - 1; d >= 1; d--) {
          const b = filterByDay(d);
          if (b.d.length > 0 || b.s.length > 0) {
            bucket = b;
            todayDay = d;
            break;
          }
        }
      }
      todayDecor = bucket.d;
      todaySouvenirs = bucket.s;
    }

    const todayUnplacedDecor = todayDecor.filter(
      (d) => !placedDecorIds.has(d.id)
    );

    return {
      isFinalDay,
      hasPlacedItem,
      decorItems,
      unplacedDecor,
      unplacedCount: unplacedDecor.length,
      souvenirs,
      todayDecor,
      todaySouvenirs,
      todayDay,
      todayUnplacedDecor,
      todayUnplacedCount: todayUnplacedDecor.length,
    };
  }, [
    finishedDay,
    totalDays,
    residenceId,
    acquiredDecorItems,
    acquiredItems,
    placedDecor,
  ]);
}
