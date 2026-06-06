// 이주 리포트 (시네마틱 엔딩) — 생성·캐싱·AI 요약 헬퍼
//
// 마지막 일차 의식 직후 호출되어 RegionRecord.migrationReport에 저장된다.
// AI 요약은 VITE_ANTHROPIC_API_KEY가 있으면 Claude 호출, 없거나 실패 시 템플릿 폴백.

import type { Mission } from "./missions";
import type { Residence } from "./residences";
import type { LifeStyleType } from "./residences";
import type { MigrationReport, RegionRecord } from "./journey";
import { calculateMatch } from "./journey";
import { buildDayPlan } from "./dayPlan";

// =====================================================================
// 공통 — Claude API 호출
// =====================================================================
// 실제 운영에서는 백엔드 프록시 권장. 데모이므로 ENV에 키 있으면 직접 호출.

function getApiKey(): string | undefined {
  return (import.meta as unknown as { env?: { VITE_ANTHROPIC_API_KEY?: string } }).env
    ?.VITE_ANTHROPIC_API_KEY;
}

async function callClaude(prompt: string, maxTokens: number): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}

// 미션 + 사용자 픽 라벨 정렬해서 프롬프트 블록으로 만듦
function pickedBlock(
  missions: Mission[],
  completedIds: Set<string>,
  pickedLabels: Record<string, string[]> | undefined
): string {
  return missions
    .filter((m) => completedIds.has(m.id))
    .map((m) => {
      const picks = pickedLabels?.[m.id] ?? [];
      const pickLine =
        picks.length === 0
          ? "  (선택 기록 없음)"
          : picks.map((p) => `  → "${p}"`).join("\n");
      return `- ${m.title} (${m.category}, NPC: ${m.npc.name})\n${pickLine}`;
    })
    .join("\n");
}

// =====================================================================
// 1) 개인화 평가 (말해보카 톤) — Slide 2
// =====================================================================

function templatePersonalReview(
  residence: Residence,
  match: number,
  alignedPicks: number,
  totalPicks: number
): string {
  const r = residence.region;
  if (match >= 80) {
    return `당신은 ${r}의 리듬에 자연스럽게 호흡을 맞춰가셨어요. 답한 ${totalPicks}개 중 ${alignedPicks.toFixed(
      1
    )}개가 이 동네 결과 정렬돼요. 첫 한 달이면 동네 사람 되실 것 같아요.`;
  }
  if (match >= 60) {
    return `당신은 ${r}에서 익숙한 부분과 새로운 부분을 함께 만나셨어요. 답한 ${totalPicks}개 중 ${alignedPicks.toFixed(
      1
    )}개가 정렬됐고, 나머지는 도시 습관이 살짝 남은 자리예요. 조금만 더 머물면 자리잡힐 거예요.`;
  }
  return `당신은 ${r}을 솔직하게 둘러보셨어요. 정렬된 답이 ${alignedPicks.toFixed(
    1
  )}/${totalPicks}이에요. 잘 맞는 부분도 어색한 부분도 또렷이 드러난 시간이었네요.`;
}

async function claudePersonalReview(
  residence: Residence,
  missions: Mission[],
  completedIds: Set<string>,
  pickedLabels: Record<string, string[]> | undefined,
  match: number,
  alignedPicks: number,
  totalPicks: number
): Promise<string | null> {
  if (!getApiKey()) return null;
  if (completedIds.size === 0) return null;

  const prompt = `사용자가 ${residence.region}(${residence.name})에서 가상 이주 시뮬레이션을 마쳤습니다.

== 사용자의 실제 답변 기록 ==
${pickedBlock(missions, completedIds, pickedLabels)}

== 점수 ==
- 적합도: ${match}/100점
- 정렬된 답: ${alignedPicks.toFixed(1)}/${totalPicks}

위 답변 기록을 바탕으로, 말해보카 회화 피드백 톤으로 사용자의 ${residence.region} 시뮬레이션을
2~3문장으로 평가해주세요.

요구사항:
- 사용자가 실제로 고른 답 중 **1개를 직접 인용**하여 "당신은 *X* 라고 답하셨네요" 형태로 자연 인용
- 어떤 답이 이 지역의 리듬과 잘 정렬됐는지, 혹은 어떤 답에서 도시 습관/거리감이 드러났는지 짚어주세요
- "당신은 ___ 한 사람이에요" 처럼 짧고 또렷한 캐릭터 평가 1줄 포함
- 청풍 톤: "쌓이다·머무르다·자리잡다" 어휘 우선. 점수·등수 평가 어휘 금지
- 1인칭("당신은…"), 마크다운/제목 금지, 일반 텍스트만`;

  return callClaude(prompt, 350);
}

// =====================================================================
// 본문 요약 — NPC가 알려준 '정보' + 사용자가 거친 미션을 엮은 4~6문장 글
// =====================================================================

// 미션에서 사용자가 만나거나 알게 됐을 만한 '정보 조각' 추출.
// dialogues[].npc 텍스트를 첫 turn 위주로 발췌해 Claude 프롬프트의 컨텍스트로 씀.
function extractMissionFacts(missions: Mission[], completedIds: Set<string>) {
  return missions
    .filter((m) => completedIds.has(m.id))
    .map((m) => {
      const firstNpcLines = (m.dialogues ?? [])
        .slice(0, 2)
        .map((t) => t.npc.replace(/\{amount\}|\{compare\}/g, "").trim())
        .filter((s) => s.length > 0)
        .join(" ");
      return {
        title: m.title,
        category: m.category,
        npcName: m.npc.name,
        excerpt: firstNpcLines.slice(0, 180),
      };
    });
}

// 정적 폴백 — Claude 미설정/실패 시 사용
function templateNarrative(
  residence: Residence,
  facts: ReturnType<typeof extractMissionFacts>
): string {
  const region = residence.region;
  if (facts.length === 0) {
    return `${region}에서의 시간은 시작도 채 못 했지만, 떠나본 것만으로도 마음에 무언가 자리잡았어요.`;
  }
  const npcsMet = Array.from(new Set(facts.map((f) => f.npcName))).slice(0, 3);
  const npcLine =
    npcsMet.length === 1
      ? `${npcsMet[0]}을(를) 만난 게 인상에 남아요.`
      : npcsMet.length >= 2
      ? `${npcsMet.slice(0, -1).join(", ")} 그리고 ${
          npcsMet[npcsMet.length - 1]
        }까지, 그 만남들이 동네의 결을 보여줬어요.`
      : "";
  const themes = Array.from(new Set(facts.map((f) => f.category))).slice(0, 3);
  const themeLine =
    themes.length > 0
      ? `${themes.join(", ")}으로 이어진 시간이 동네의 결을 한 겹씩 보여줬어요.`
      : "";

  return [
    `${region}에서의 ${facts.length}개 미션이 차곡차곡 쌓였어요.`,
    npcLine,
    themeLine,
    "거기서 보고 들은 것들이 당신 안에 한 자리 잡았기를.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Claude 호출 — 본문 글 1편 (4~6문장). 사용자가 고른 답 라벨을 1~2개 직접 인용.
async function claudeNarrative(
  residence: Residence,
  facts: ReturnType<typeof extractMissionFacts>,
  pickedLabels: Record<string, string[]> | undefined,
  match: number
): Promise<string | null> {
  if (!getApiKey()) return null;
  if (facts.length === 0) return null;

  const factsBlock = facts
    .map(
      (f, i) =>
        `${i + 1}. ${f.title} (${f.category}) — ${f.npcName}: "${f.excerpt}"`
    )
    .join("\n");

  // 사용자가 고른 답 중 인상적인 것 3개 추출 (부정 답변 제외)
  const allPicks = pickedLabels
    ? Object.values(pickedLabels)
        .flat()
        .filter((p) => p !== "(부정 답변)")
    : [];
  const picksBlock =
    allPicks.length > 0
      ? `\n사용자가 고른 답 중 인상적인 것 (인용 후보):\n${allPicks
          .slice(0, 5)
          .map((p) => `- "${p}"`)
          .join("\n")}`
      : "";

  const prompt = `사용자가 ${residence.region}(${residence.name})에서 가상 이주 시뮬레이션을 마쳤습니다.
이 지역과의 적합도: ${match}/100점

사용자가 거친 미션과 그곳에서 만난 주민이 들려준 정보:
${factsBlock}${picksBlock}

위 내용을 바탕으로, 사용자가 ${residence.region}에서 보낸 시간을 회상하는 4~6문장 글을 한 편 써주세요.
- 청풍 서비스는 "이주 결정 도구"가 아니라 "지역과 관계 쌓고 미래를 그려보는 시뮬레이션"입니다
- **사용자가 고른 답 중 1~2개를 직접 인용**("당신은 *X* 라고 답했고…") 해서 회상에 녹여주세요
- 미션에서 알게 된 구체적 정보(가격·거리·NPC 이름·풍경 등)를 자연스럽게 1~2개 인용
- 점수·등수 평가 어휘 금지. "쌓이다·만나다·머무르다·자리잡다·그려보다" 어휘 우선
- 1인칭 사용자 시점("당신은…")
- 마크다운/제목/리스트 금지. 단락 구분만 빈 줄로.`;

  return callClaude(prompt, 600);
}

// =====================================================================
// 3) 실용 정보 (Slide 4) — 만난 사람들 / 첫 한 달 준비 / 주의할 점
// =====================================================================

type PracticalNotes = {
  metPeople: string[];
  preparation: string[];
  cautions: string[];
};

function templatePracticalNotes(
  residence: Residence,
  facts: ReturnType<typeof extractMissionFacts>,
  match: number
): PracticalNotes {
  const metPeople = Array.from(new Set(facts.map((f) => f.npcName))).slice(0, 5);

  const baseTitle = (t: string) =>
    t.replace(/ 체험$/, "").replace(/ 확인$/, "").replace(/ 기록$/, "");
  const themes = Array.from(new Set(facts.map((f) => baseTitle(f.title)))).slice(0, 4);

  const preparation: string[] = [];
  if (themes.length > 0) {
    preparation.push(
      `${themes.slice(0, 2).join(", ")} 같은 동네 일상은 첫 한 달이면 손에 익어요.`
    );
  }
  preparation.push(
    `${residence.region} 도착하면 사람보다 먼저 가까운 정류장·시장·병원 위치부터 손에 익혀두는 게 편해요.`
  );
  if (match >= 70) {
    preparation.push("이 동네 리듬과 결이 맞는 편이라, 초반 적응이 비교적 부드러울 거예요.");
  }

  const cautions: string[] = [];
  if (match < 65) {
    cautions.push("어색했던 부분이 또렷이 있었어요. 처음엔 도시 습관이 비집고 나올 수 있어요.");
  } else {
    cautions.push("너무 빨리 어울리려 하기보다 한 사람씩 천천히 알아가는 페이스가 좋아요.");
  }
  cautions.push("첫 겨울이나 비수기엔 자극이 줄어드는 시기 — 그때 마음의 준비가 필요해요.");

  return { metPeople, preparation, cautions };
}

async function claudePracticalNotes(
  residence: Residence,
  missions: Mission[],
  completedIds: Set<string>,
  pickedLabels: Record<string, string[]> | undefined,
  facts: ReturnType<typeof extractMissionFacts>,
  match: number
): Promise<PracticalNotes | null> {
  if (!getApiKey()) return null;
  if (facts.length === 0) return null;

  const metPeople = Array.from(new Set(facts.map((f) => f.npcName))).slice(0, 6);

  const prompt = `사용자가 ${residence.region}(${residence.name})에서 가상 이주 시뮬레이션을 마쳤습니다.
적합도: ${match}/100점.

== 사용자가 거친 미션과 답변 ==
${pickedBlock(missions, completedIds, pickedLabels)}

== 만난 NPC들 ==
${metPeople.map((n) => `- ${n}`).join("\n")}

위 내용을 바탕으로 실용적인 리포트를 만들어주세요.
다음 JSON 형식 그대로 (다른 설명·코드블록 없이) 출력해주세요:

{
  "preparation": [
    "첫 한 달 준비 항목 1 (한 문장, 사용자가 ${residence.region}에서 살아갈 때 실용적으로 챙길 것)",
    "준비 항목 2",
    "준비 항목 3"
  ],
  "cautions": [
    "주의/어색했던 부분 1 (사용자의 답변에서 드러난 부분을 짚어주세요)",
    "주의 항목 2"
  ]
}

요구사항:
- preparation: 3개 항목, 각 한 문장. 실용 정보(시장 시간·교통·이웃 사귀는 페이스 등) 위주
- cautions: 2개 항목, 각 한 문장. 사용자의 답변 중 도시 습관이 드러난 부분 1개는 인용
- 청풍 톤("쌓이다·머무르다·자리잡다" 어휘 우선)
- 평가가 아니라 "이런 게 도움될 거예요" 톤. 점수 어휘 금지`;

  const text = await callClaude(prompt, 800);
  if (!text) return null;
  try {
    // JSON 추출 (코드블록 감싸져 와도 매칭)
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]) as {
      preparation?: string[];
      cautions?: string[];
    };
    return {
      metPeople,
      preparation: Array.isArray(parsed.preparation) ? parsed.preparation : [],
      cautions: Array.isArray(parsed.cautions) ? parsed.cautions : [],
    };
  } catch {
    return null;
  }
}

// =====================================================================
// 리포트 생성
// =====================================================================

export async function generateMigrationReport(
  residence: Residence,
  record: RegionRecord,
  missions: Mission[],
  lifestyle: LifeStyleType | null
): Promise<MigrationReport> {
  const completedIds = new Set(record.completedMissionIds);
  const infoScore = completedIds.size;
  const accumulationScore = record.score;
  const relationshipScore = calculateMatch(lifestyle, residence, record);

  // 사용자가 고른 답 라벨 — v3 개인화 평가의 핵심 입력
  const pickedLabels = record.pickedLabels;
  const pickStats = record.pickStats ?? { totalPicks: 0, alignedPicks: 0 };

  // 개인화 평가 (Slide 2) — 말해보카 톤. 사용자가 고른 답을 1개 직접 인용.
  const fromClaudeReview = await claudePersonalReview(
    residence,
    missions,
    completedIds,
    pickedLabels,
    relationshipScore,
    pickStats.alignedPicks,
    pickStats.totalPicks
  );
  const aiSummary =
    fromClaudeReview ??
    templatePersonalReview(
      residence,
      relationshipScore,
      pickStats.alignedPicks,
      pickStats.totalPicks
    );
  const aiSummarySource: "claude" | "template" = fromClaudeReview
    ? "claude"
    : "template";

  // 본문 회상글 (Slide 3) — 미션 NPC 정보 + 사용자 픽 인용
  const facts = extractMissionFacts(missions, completedIds);
  const fromClaudeNarrative = await claudeNarrative(
    residence,
    facts,
    pickedLabels,
    relationshipScore
  );
  const narrativeBody =
    fromClaudeNarrative ?? templateNarrative(residence, facts);
  const narrativeBodySource: "claude" | "template" = fromClaudeNarrative
    ? "claude"
    : "template";

  // 실용 정보 (Slide 4) — 만난 사람들 + 준비 + 주의
  const fromClaudePractical = await claudePracticalNotes(
    residence,
    missions,
    completedIds,
    pickedLabels,
    facts,
    relationshipScore
  );
  const practicalNotes =
    fromClaudePractical ??
    templatePracticalNotes(residence, facts, relationshipScore);
  const practicalNotesSource: "claude" | "template" = fromClaudePractical
    ? "claude"
    : "template";

  // 타임라인 — 완료 순서 + 일차 매핑 (옛 슬라이드 호환용)
  const { missionsByDay } = buildDayPlan(residence, missions);
  const dayOf = (missionId: string): number => {
    for (let i = 0; i < missionsByDay.length; i++) {
      if (missionsByDay[i].includes(missionId)) return i + 1;
    }
    return 1;
  };
  const timeline = record.completedMissionIds.map((id) => ({
    missionId: id,
    day: dayOf(id),
  }));

  return {
    generatedAt: new Date().toISOString(),
    infoScore,
    accumulationScore,
    relationshipScore,
    aiSummary,
    aiSummarySource,
    narrativeBody,
    narrativeBodySource,
    practicalNotes,
    practicalNotesSource,
    timeline,
    hasBeenViewed: false,
  };
}

// 시청 완료 표시 (cache 보존, 다음 진입 시 자유 탐색 모드)
export function markReportViewed(
  progress: Record<string, RegionRecord>,
  residenceId: string
): Record<string, RegionRecord> {
  const rec = progress[residenceId];
  if (!rec?.migrationReport) return progress;
  return {
    ...progress,
    [residenceId]: {
      ...rec,
      migrationReport: { ...rec.migrationReport, hasBeenViewed: true },
    },
  };
}

// 리포트 저장
export function saveReport(
  progress: Record<string, RegionRecord>,
  residenceId: string,
  report: MigrationReport
): Record<string, RegionRecord> {
  const rec = progress[residenceId];
  if (!rec) return progress;
  return {
    ...progress,
    [residenceId]: { ...rec, migrationReport: report },
  };
}
