// 탭2 나의 여정 — 지역별 진행 상태 + 적합도 계산
// PRD: 다녀온 지역마다 방문 횟수 / 축적 점수 / 적합도 / 완료 미션 추적

import { baseMissions, type Mission } from "./missions";
import {
  residences,
  type LifeStyleType,
  type Residence,
} from "./residences";

// 지역(레지던스)별 누적 기록 — App 상태 + localStorage에 영속됨
export type RegionRecord = {
  residenceId: string;
  visitCount: number;
  completedMissionIds: string[]; // Set 대신 Array (JSON 직렬화 위해)
  score: number;
};

// 적합도 (0~100) — 사용자 라이프스타일과 레지던스 매칭 유형
// 같으면 90+α, 다르면 60+α (visited 점수 보너스로 살짝 가산)
export function calculateMatch(
  lifestyle: LifeStyleType | null | undefined,
  residence: Residence,
  record?: RegionRecord
): number {
  const base = lifestyle && lifestyle === residence.matchType ? 90 : 62;
  // 미션 완료 보너스 (최대 +8)
  const bonus = Math.min(8, (record?.completedMissionIds.length ?? 0));
  return Math.min(100, base + bonus);
}

// 빈 RegionRecord 생성
export function emptyRecord(residenceId: string): RegionRecord {
  return {
    residenceId,
    visitCount: 0,
    completedMissionIds: [],
    score: 0,
  };
}

// 방문 카운트 +1
export function bumpVisit(
  progress: Record<string, RegionRecord>,
  residenceId: string
): Record<string, RegionRecord> {
  const existing = progress[residenceId] ?? emptyRecord(residenceId);
  return {
    ...progress,
    [residenceId]: { ...existing, visitCount: existing.visitCount + 1 },
  };
}

// 미션 완료 기록 (점수/완료 리스트 누적)
export function completeMissionFor(
  progress: Record<string, RegionRecord>,
  residenceId: string,
  mission: Mission
): Record<string, RegionRecord> {
  const existing = progress[residenceId] ?? emptyRecord(residenceId);
  if (existing.completedMissionIds.includes(mission.id)) return progress;
  return {
    ...progress,
    [residenceId]: {
      ...existing,
      completedMissionIds: [...existing.completedMissionIds, mission.id],
      score: existing.score + mission.reward,
    },
  };
}

// 가장 많이 탐색한 지역(축적 점수 기준)
export function findTopRegion(
  progress: Record<string, RegionRecord>
): Residence | null {
  let bestId: string | null = null;
  let bestScore = -1;
  for (const [id, rec] of Object.entries(progress)) {
    if (rec.score > bestScore) {
      bestScore = rec.score;
      bestId = id;
    }
  }
  if (!bestId || bestScore <= 0) return null;
  return residences.find((r) => r.id === bestId) ?? null;
}

// 미션 완료 여부 (모든 일반 미션 완료 시 이주 리포트 활성화)
export function isAllMissionsDone(record: RegionRecord | undefined): boolean {
  if (!record) return false;
  return baseMissions.every((m) =>
    record.completedMissionIds.includes(m.id)
  );
}
