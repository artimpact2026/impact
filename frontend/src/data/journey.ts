// 탭2 나의 여정 — 지역별 진행 상태 + 적합도 계산
// PRD: 다녀온 지역마다 방문 횟수 / 축적 점수 / 적합도(미션 답변 반영) / 완료 미션 추적

import { commonMissions, type Mission } from "./missions";
import {
  residences,
  type LifeStyleType,
  type Residence,
} from "./residences";
import {
  matchResidenceScore,
  type LifestyleProfile,
} from "./lifestyle";

// 지역(레지던스)별 누적 기록 — App 상태 + localStorage에 영속됨
export type RegionRecord = {
  residenceId: string;
  visitCount: number;
  completedMissionIds: string[]; // Set 대신 Array (JSON 직렬화 위해)
  score: number;     // 축적 점수 — 미션 완료 시 mission.reward 합산
  fitScore: number;  // 적합도 옛 누적치 (v1 호환용). v2는 pickStats 사용.
  // 현재 일차 (1-based) — 잠시섬 체류 일자. 기본 1, 일차 완료 의식 후 +1
  currentDay?: number;
  // 이주 리포트 (시네마틱 엔딩 시퀀스) — 생성 시점 스냅샷 + AI 요약 캐시
  migrationReport?: MigrationReport;
  // v2 — 답변 단위 정렬 통계. 미션정렬도(%) = alignedPicks / totalPicks × 100.
  // alignedPicks는 옵션별 가중치 합(0 / 0.5 / 1)이라 float (3.5/8 같은 값 가능).
  pickStats?: {
    totalPicks: number;
    alignedPicks: number;
  };
  // v3 — 미션별로 사용자가 실제로 고른 옵션 라벨들. AI 리포트가 이걸 인용해
  // 말해보카 톤("당신은 *걸어가볼게요* 라고 답하셨네요...") 으로 개인화 평가.
  // 부정 답변은 "(부정 답변)" 으로 기록.
  pickedLabels?: Record<string, string[]>;
  // 강화 한설 튜토리얼 — Day 1 첫 진입 환영 모달이 노출됐는지. 영속 1회용.
  storyIntroShown?: boolean;
  // 강화 shop 미션 — 게임식 튜토리얼 오버레이(체험하기 버튼 안내)가 노출됐는지. 영속 1회용.
  shopTutorialShown?: boolean;
  // 시간대 흐름 안내 — 한설이 다음 시간대 탭(점심/저녁)으로 이끄는 안내.
  //   key: "day{N}-{slot}" (예: "day1-아침", "day2-낮") — 어느 일차 어느 슬롯 완료 후 안내를 봤는지.
  //   value: true 면 그 안내는 1회 노출 끝.
  // 옛 lunchTabTutorialShown 대체 (Day 1 아침→점심도 이 맵으로 통합).
  nextSlotGuidesShown?: Record<string, boolean>;
};

// 이주 리포트 — 마지막 일차 완료 시 잠금 해제되는 시네마틱 엔딩
export type MigrationReport = {
  generatedAt: string;         // ISO timestamp
  // Slide 1 — 점수 카드
  infoScore: number;           // 완료 미션 수
  accumulationScore: number;   // 축적 점수
  relationshipScore: number;   // 적합도 % (0-100)
  // Slide 2 — AI 짧은 요약 (Claude or 정적 폴백, 캐싱됨)
  aiSummary: string;
  aiSummarySource: "claude" | "template";
  // Slide 3 — AI 본문 요약. NPC가 알려준 '정보' + 완료 미션을 엮은 4~6문장 글.
  // 옛 timeline 리스트를 대체.
  narrativeBody?: string;
  narrativeBodySource?: "claude" | "template";
  // Slide 4 — 실용 정보. NPC들과 만난 흔적 + 첫 N개월 준비 + 주의할 점.
  // bullet 형식의 짧은 항목 리스트.
  practicalNotes?: {
    metPeople: string[];      // 만난 NPC 이름들 (중복 제거)
    preparation: string[];    // "첫 한 달 준비 / 챙겨갈 것" 류 bullet
    cautions: string[];       // "이런 부분 어색했어요 / 주의" 류 bullet
  };
  practicalNotesSource?: "claude" | "template";
  // (옛) 미션 타임라인 — 새 narrativeBody 가 생성된 리포트엔 사용 안 함. 호환용 보존.
  timeline: { missionId: string; day: number }[];
  // 시청 여부 — 처음엔 자동재생, 다음부터는 자유 탐색 모드
  hasBeenViewed: boolean;
};

// =====================================================================
// 적합도 v2 — 정규화된 0~100 (지역 간 비교 가능)
//   적합도 = round(잠재매칭 × 0.4 + 미션정렬도 × 0.6)
//   잠재매칭: 온보딩 프로필 vs 지역 (matchResidenceScore)
//   미션정렬도: 정렬 답 / 답한 옵션 총 개수 × 100. 답 없으면 = 잠재매칭.
//   하한 안전판: 적합도 ≥ round(잠재매칭 × 0.4)
// =====================================================================

export type MatchBreakdown = {
  potential: number;   // 잠재매칭 0~100
  alignment: number;   // 미션정렬도 0~100 (답 없으면 potential 그대로)
  total: number;       // 최종 적합도 0~100
  pickStats: { totalPicks: number; alignedPicks: number };
};

export function calculateMatchV2(
  profile: LifestyleProfile | null | undefined,
  residence: Residence,
  record?: RegionRecord
): MatchBreakdown {
  const potential = profile
    ? matchResidenceScore(profile, {
        envType: residence.envType,
        stance: residence.stance,
        stanceAlt: residence.stanceAlt,
      })
    : 50;

  const totalPicks = record?.pickStats?.totalPicks ?? 0;
  const alignedPicks = record?.pickStats?.alignedPicks ?? 0;

  const alignment =
    totalPicks === 0 ? potential : Math.round((alignedPicks / totalPicks) * 100);

  const weighted = Math.round(potential * 0.4 + alignment * 0.6);
  const floor = Math.round(potential * 0.4);
  const total = Math.max(0, Math.min(100, Math.max(weighted, floor)));

  return {
    potential,
    alignment,
    total,
    pickStats: { totalPicks, alignedPicks },
  };
}

// 적합도 v1 호환 — 기존 시그니처(lifestyle)로 호출하던 곳용.
// 내부적으로 v2 공식(정렬도 가중)을 쓰되, profile이 없으니 잠재매칭은 옛 base(70/50)로 대체.
export function calculateMatch(
  lifestyle: LifeStyleType | null | undefined,
  residence: Residence,
  record?: RegionRecord
): number {
  const potential =
    lifestyle && lifestyle === residence.matchType ? 70 : 50;

  const totalPicks = record?.pickStats?.totalPicks ?? 0;
  const alignedPicks = record?.pickStats?.alignedPicks ?? 0;
  const alignment =
    totalPicks === 0 ? potential : Math.round((alignedPicks / totalPicks) * 100);

  const weighted = Math.round(potential * 0.4 + alignment * 0.6);
  const floor = Math.round(potential * 0.4);
  return Math.max(0, Math.min(100, Math.max(weighted, floor)));
}

// 빈 RegionRecord 생성
export function emptyRecord(residenceId: string): RegionRecord {
  return {
    residenceId,
    visitCount: 0,
    completedMissionIds: [],
    score: 0,
    fitScore: 0,
    currentDay: 1,
  };
}

// 다음 일차로 진행 (일차 의식 통과 후 호출)
export function advanceDay(
  progress: Record<string, RegionRecord>,
  residenceId: string,
  totalDays: number
): Record<string, RegionRecord> {
  const existing = progress[residenceId] ?? emptyRecord(residenceId);
  const cur = existing.currentDay ?? 1;
  return {
    ...progress,
    [residenceId]: {
      ...existing,
      currentDay: Math.min(totalDays, cur + 1),
    },
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

// 미션 완료 기록 — 축적 점수 + (v1) fitScore + (v2) pickStats + (v3) pickedLabels 가산
export function completeMissionFor(
  progress: Record<string, RegionRecord>,
  residenceId: string,
  mission: Mission,
  fitDelta = 0,
  pickStatsDelta?: { totalPicks: number; alignedPicks: number },
  pickedLabels?: string[]
): Record<string, RegionRecord> {
  const existing = progress[residenceId] ?? emptyRecord(residenceId);
  if (existing.completedMissionIds.includes(mission.id)) return progress;

  const prevStats = existing.pickStats ?? { totalPicks: 0, alignedPicks: 0 };
  const nextStats = pickStatsDelta
    ? {
        totalPicks: prevStats.totalPicks + pickStatsDelta.totalPicks,
        alignedPicks: prevStats.alignedPicks + pickStatsDelta.alignedPicks,
      }
    : prevStats;

  const nextPickedLabels = pickedLabels
    ? { ...(existing.pickedLabels ?? {}), [mission.id]: pickedLabels }
    : existing.pickedLabels;

  return {
    ...progress,
    [residenceId]: {
      ...existing,
      completedMissionIds: [...existing.completedMissionIds, mission.id],
      score: existing.score + mission.reward,
      fitScore: existing.fitScore + fitDelta,
      pickStats: nextStats,
      pickedLabels: nextPickedLabels,
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
