# 2026-06-05 — 대화 UI 전면 개편 + 네비/시트 다듬기

이날의 작업은 크게 셋. **(1) BottomNav 정리**, **(2) ResidenceSheet 마커 차단 버그 수정**,
그리고 메인 작업인 **(3) 미션 수행 화면(말해보카) UI 전면 개편 — 풀스크린 NPC + 타이핑 말풍선 + 선택지 카드**.

---

## 1. BottomNav — 작은 서브 라벨 제거 + 재정렬

**파일**: `frontend/src/components/BottomNav.tsx`

기존 탭에 메인 라벨(`홈`, `나의 여정`, ...) 밑에 작은 서브 라벨(`떠나기`, `아트맵`, `이야기`, `예약`)이
9px로 깔려있어 가독성이 떨어졌음. 서브 제거 후 메인 라벨을 11px → 12px 로 키우고 아이콘-라벨
간격(`gap-1` → `gap-1.5`), 버튼 패딩(`py-1` → `py-1.5`)을 살짝 늘려 빈 공간을 채움.

```diff
- <span className="text-[11px]">{label}</span>
- <span className="text-[9px]">{sub}</span>
+ <span className="text-[12px]">{label}</span>
```

---

## 2. ResidenceSheet — 마커 클릭이 시트 뒤로 통과되던 버그 수정

**파일**: `frontend/src/components/ResidenceSheet.tsx`

증상: 떠나기 지도에서 강화도 마커를 누르면 바텀시트가 뜨고 "여기로 떠나기" CTA가 보이는데,
시트가 열린 상태에서 다른 마커(영월/무수 등)를 누르면 그 마커가 그대로 클릭돼서 새 시트가
스택됨. 빈 백드롭 영역만 누르면 닫혀야 정상.

원인: `ResidenceMarker`가 `zIndex: 10/20/30`을 가지는데, 시트의 백드롭은 z-index 미지정 →
마커가 백드롭 위에 떠 있어 클릭이 통과.

수정: 백드롭에 `z-40`, 시트 본체에 `z-50` 부여.

```diff
- className="absolute inset-0 bg-black/20"
+ className="absolute inset-0 bg-black/20 z-40"
...
- className="absolute left-0 right-0 bottom-0 bg-white ..."
+ className="absolute left-0 right-0 bottom-0 z-50 bg-white ..."
```

> **UX 용어 메모**: 시트 내부의 "여기로 떠나기" 같은 주요 CTA를 디자이너들은 보통
> **Bottom Sheet Primary Action** / **Sheet Footer CTA** / **Sticky CTA Bar** 라고 부름.
> 시트가 길어져도 항상 보이는 푸터 액션이면 **Persistent Footer Action**.

---

## 3. 미션 수행 화면(MissionExecuteScreen) — 풀스크린 NPC 대화 UI

**파일**: `frontend/src/screens/MissionExecuteScreen.tsx`

### 의도

기존 말해보카 UI(NPC 머리 옆 이모지 + 흰 카드 안 대사)는 정보 카드 같은 톤이었음.
카카오 당근이/단추 앱처럼 **풀스크린 캐릭터 + 하단 큰 말풍선 + 선택지 카드 2-3개**의
서사적 대화 톤으로 전환.

데이터(`mission.dialogues: DialogueTurn[]`, `option.next`, `numeric`, `fitDelta`, `{amount}/{compare}`
치환, RewardOverlay)는 **건드리지 않고 시각만** 갈아끼움 → 미션 28개 + 공통 9개가 그대로
새 UI에서 재생됨.

### 레이아웃

| 영역 | 요소 |
|---|---|
| 좌상단 | 🔊 / 🔇 사운드 토글 (시각 토글만, 사운드 연동은 후속) |
| 우상단 | `+N점` 보상 뱃지 + `SKIP` (= 미션 종료) |
| 중앙 상단 | 화자 이름 pill (NPC는 주황 `#FF7043`, 플레이어는 파랑 `#5B9BD5`) + 풀바디 클레이 캐릭터 |
| 하단 | 진행 점 인디케이터 → 말풍선 → 선택지 카드 / 수치 입력 |

### 턴 내 phase 머신

각 `DialogueTurn` 안에서 3단계를 거침:

```
npc-typing  →  npc-done  →  player-turn
   (타이핑)     (탭 대기)     (선택지 노출)
```

| Phase | 화면 |
|---|---|
| **npc-typing** | NPC 캐릭터 + 주황 이름 뱃지. 말풍선에 글자 타이핑 (65ms/글자). 말풍선 탭 시 타이핑 즉시 완료 → `npc-done` |
| **npc-done** | 타이핑 완료. 말풍선 밑에 *탭하여 답하기 →* 깜빡이는 힌트. 말풍선 한 번 더 탭 → `player-turn` |
| **player-turn** | 캐릭터가 플레이어("나", 파란 뱃지, `clay-baram-solo.png`)로 크로스페이드. NPC가 한 말은 `opacity-70`으로 약하게 남겨 맥락 보존. 선택지 카드(또는 수치 입력) staggered fade-in (100ms 간격). 픽 시 200ms ring 강조 → 다음 turn → 다시 `npc-typing` |

### 애니메이션 스펙

| 요소 | 동작 | 시간 |
|---|---|---|
| 타이핑 | `setInterval` + slice | 65ms/글자 |
| 말풍선 등장 | 아래서 위로 슬라이드 + fade | 250ms |
| 선택지 등장 | staggered fade-in | 100ms 간격 |
| 선택 시 강조 | ring + scale 1.02 → 진행 | 200ms |
| 화자 전환 (NPC↔플레이어) | 제자리 opacity 크로스페이드 | 250ms |

> 초기에는 화자 전환에 `scale` + 떠다니는 `y` 모션이 있었는데, "밑으로 내려가면서 사라진다"는
> 위화감이 있어 **순수 opacity 크로스페이드**로 단순화함.

### 미션별 NPC 아바타·사이즈 override

병원 미션처럼 실제 일러스트가 있는 NPC는 클레이 fallback 대신 전용 이미지를 쓰고 크기도 키움.
파일 상단에 두 개의 맵을 둠.

```ts
// 미션별 NPC 아바타 override — 이름 기반 fallback 보다 우선
const MISSION_ID_NPC_AVATAR: Record<string, string> = {
  hospital: "/character1/resident_talk/town_hal_1.png",
};

// 미션별 NPC 아바타 크기 override — 풀바디 일러스트는 크게 노출
const MISSION_ID_NPC_SIZE: Record<string, string> = {
  hospital: "w-[78vw] max-w-[420px] h-auto",
};
const DEFAULT_NPC_SIZE = "w-40 h-40";
```

해당 미션에선:
- 사이즈가 NPC·플레이어 양쪽에 동일 적용 → 두 캐릭터 모두 같은 비율로 크게
- 위치 `top-[14%]` → `top-[6%]`로 살짝 올려 큰 일러스트와 말풍선이 안 겹치도록
- 발밑 그림자 `w-28` → `w-60`으로 키워 균형
- 이모지 배지(👵) 숨김 — 이미지 자체에 표정이 있으니 중복 + 가독성 우선

다른 NPC도 일러스트가 준비되면 이 두 맵에 한 줄씩 추가하면 됨.
예: `market: "/character1/resident_talk/town_market_owner.png"` ...

### 데이터 모델은 그대로

```ts
type Mission = {
  id: string;
  // ...
  npc: { name: string; emoji: string };
  dialogues: DialogueTurn[];   // 그대로
};

type DialogueTurn = {
  npc: string;              // NPC 대사 (타이핑되는 텍스트)
  options?: DialogueOption[];
  numeric?: NumericInputSpec;
};
```

기존 미션 데이터는 손대지 않음. 새 UI는 데이터 형식과 100% 호환.

---

## 4. 부수 변경

### 자산 추가
- `frontend/public/character1/resident_talk/town_hal_1.png` (병원 NPC, 누끼 처리 풀바디)
- 원본 `character1/resident_talk/town_hal_1.png`(루트)와 동일. Vite가 `public/`만 서빙하므로 둘 다 둠.

### 짧게 만들었다 정리한 것
- `src/screens/DialogueScreen.tsx` (X — 초기 잘못된 방향)
- `src/screens/JamsiDialoguePreview.tsx` (X — 초기 잘못된 방향)
- `src/data/dialogueScripts.ts` (X — 초기 잘못된 방향)
- `App.tsx`의 `#jamsi-dialogue` 해시 라우트 (X)

초기엔 "마을 도착 → NPC 대화로 미션 선택하는 hub" 모델로 만들었는데, 그러면 미션 리스트가
묻혀버리는 문제가 있어서 방향 수정. 결국 **기존 MissionExecuteScreen의 UI를 갈아끼우는 방식**으로
정리.

---

## 다음 단계 후보

- 다른 NPC들 풀바디 일러스트 제작 + `MISSION_ID_NPC_AVATAR` 추가
- 사운드 토글 → 실제 BGM/SFX 연동
- `clay-baram-solo`(플레이어)도 누끼 풀바디 일러스트로 교체 검토 — 현재 라이프스타일 v2에서
  플레이어 캐릭터가 바람이/지음이로 갈리는데, 프로필별로 다르게 노출할지 정해야 함
- 말풍선 탭 인터랙션 사용성 테스트 — "탭하여 답하기" 힌트가 충분히 발견되는지
