// 탭2 나의 여정 — 지역별 진행 상태 + 적합도 계산
// PRD: 다녀온 지역마다 방문 횟수 / 축적 점수 / 적합도(미션 답변 반영) / 완료 미션 추적

import { commonMissions, type Mission } from "./missions";
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
  score: number;     // 축적 점수 — 미션 완료 시 mission.reward 합산
  fitScore: number;  // 적합도 추가 점수 — 미션 답변(traits)으로 누적 (-N ~ +N)
};

// 적합도 (0~100) — 라이프스타일 매칭 베이스 + 미션 답변 누적
// - 베이스: 사용자 라이프스타일이 residence.matchType과 같으면 70, 다르면 50
// - 누적치: fitScore (-N ~ +N) 만큼 가감 (clamp 0~100)
// - 미션 완료 보너스: 보조적으로 +N (최대 +8)
export function calculateMatch(
  lifestyle: LifeStyleType | null | undefined,
  residence: Residence,
  record?: RegionRecord
): number {
  const base = lifestyle && lifestyle === residence.matchType ? 70 : 50;
  const fit = record?.fitScore ?? 0;
  const bonus = Math.min(8, record?.completedMissionIds.length ?? 0);
  return Math.max(0, Math.min(100, base + fit + bonus));
}

// 빈 RegionRecord 생성
export function emptyRecord(residenceId: string): RegionRecord {
  return {
    residenceId,
    visitCount: 0,
    completedMissionIds: [],
    score: 0,
    fitScore: 0,
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

// 미션 완료 기록 (축적 점수 + 적합도 가감)
export function completeMissionFor(
  progress: Record<string, RegionRecord>,
  residenceId: string,
  mission: Mission,
  fitDelta = 0
): Record<string, RegionRecord> {
  const existing = progress[residenceId] ?? emptyRecord(residenceId);
  if (existing.completedMissionIds.includes(mission.id)) return progress;
  return {
    ...progress,
    [residenceId]: {
      ...existing,
      completedMissionIds: [...existing.completedMissionIds, mission.id],
      score: existing.score + mission.reward,
      fitScore: existing.fitScore + fitDelta,
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

// 미션 완료 여부 (모든 공통 미션 완료 시 이주 리포트 활성화)
// 지역 미션까지 모두 끝낼 필요는 없음 — 디자인 결정
export function isAllMissionsDone(record: RegionRecord | undefined): boolean {
  if (!record) return false;
  return commonMissions.every((m) =>
    record.completedMissionIds.includes(m.id)
  );
}
