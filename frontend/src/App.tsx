// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useRef, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ResidenceHomeScreen from "./screens/ResidenceHomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import MissionListScreen from "./screens/MissionListScreen";
import MissionInfoScreen from "./screens/MissionInfoScreen";
import MissionTravelingScreen from "./screens/MissionTravelingScreen";
import MissionExecuteScreen from "./screens/MissionExecuteScreen";
import MissionCompleteScreen, {
  type MissionKeyInfo,
} from "./screens/MissionCompleteScreen";
import DayEndCeremonyScreen from "./screens/DayEndCeremonyScreen";
import MigrationReportCinematic from "./screens/MigrationReportCinematic";
import JourneyScreen from "./screens/JourneyScreen";
import MigrationReportScreen from "./screens/MigrationReportScreen";
import MoveInScreen from "./screens/MoveInScreen";
import ResidenceListScreen from "./screens/ResidenceListScreen";
import ResidenceDetailScreen from "./screens/ResidenceDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CommunityScreen from "./screens/CommunityScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LetterScreen from "./screens/LetterScreen";
import PuzzleScreen from "./screens/PuzzleScreen";
import {
  getInitialLetters,
  loadLetters,
  makeArrivalLetter,
  makeBookingConfirmedLetter,
  makeNextDayLetter,
  makeReportLetter,
  saveLetters,
  unreadCount,
  type Letter,
} from "./data/letters";
import {
  getItemDropFor,
  loadAcquiredItems,
  saveAcquiredItems,
  ITEMS_STORAGE_KEY,
  type Item,
} from "./data/items";
import {
  HANSEOL_LUNCH_HINT,
  HANSEOL_EVENING_HINT,
  GANGHWA_ID,
} from "./data/ganghwaStory";
import { useDayComplete } from "./hooks/useDayComplete";
import {
  getDecorDropFor,
  loadAcquiredDecor,
  saveAcquiredDecor,
  DECOR_STORAGE_KEY,
  loadPlacedDecor,
  savePlacedDecor,
  PLACED_STORAGE_KEY,
  type DecorItem,
  type PlacedDecorMap,
} from "./data/decorItems";
import {
  loadQuotes,
  saveQuotes,
  QUOTES_STORAGE_KEY,
  type SavedQuote,
} from "./data/quotes";
import BookingScreen from "./screens/BookingScreen";
import BookingDetailScreen from "./screens/BookingDetailScreen";
import BookingFormScreen from "./screens/BookingFormScreen";
import BookingDoneScreen from "./screens/BookingDoneScreen";
import MailboxModal from "./components/MailboxModal";
import { storiesByResidenceId } from "./data/stories";
import HospitalMissionScreen from "./screens/mission/HospitalMissionScreen";
import OnboardingShell, {
  type OnboardingResult,
} from "./screens/onboarding/OnboardingShell";
import BottomNav, { type TabKey } from "./components/BottomNav";
import {
  recommendedResidences,
  residences,
  type Residence,
  type LifeStyleType,
} from "./data/residences";
import { HOME_POSITIONS, type RegionPos } from "./data/regions";
import { resolveRegionPos } from "./data/koreaRegions";
import { type Mission } from "./data/missions";
import {
  advanceDay,
  bumpVisit,
  calculateMatchV2,
  completeMissionFor,
  type RegionRecord,
  type MigrationReport,
} from "./data/journey";
import { keyInfosFor } from "./data/missionKeyInfos";
import {
  generateMigrationReport,
  markReportViewed,
  saveReport,
} from "./data/migrationReport";
import { missionsForResidence } from "./data/regionMissions";
import {
  buildDayPlan,
  isDayComplete,
} from "./data/dayPlan";

// hash 라우팅 — #hospital 해시로 단독 프리뷰
function useHashRoute() {
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

// 탭1 화면 흐름 — 시뮬레이션 탭. "letter" 는 ResidenceHomeScreen 의 편지 버튼에서 진입.
type Tab1Route =
  | "home"
  | "departure"
  | "traveling"
  | "arrival"
  | "residence-home"
  | "mission-list"
  | "mission-info"
  | "mission-traveling"
  | "mission-execute"
  | "mission-complete"
  | "traveling-back"
  | "day-end-ceremony"
  | "letter"
  | "puzzle";

// 탭2 화면 흐름 (여정)
type Tab2Route =
  | "journey"
  | "report"
  | "move-in"
  | "settings"
  | "residence-list"
  | "residence-detail";

// 레지던스 예약 탭 화면 흐름
type Tab4Route = "booking" | "booking-detail" | "booking-form" | "booking-done";

// localStorage 키
const PROFILE_KEY = "cheongpung.onboarding.v1";
const PROGRESS_KEY = "cheongpung.progress.v1";
const LIKED_KEY = "cheongpung.bookingLiked.v1";
const LETTERS_KEY = "cheongpung.letters.v1"; // letters.ts와 동일 키 — reset에서 함께 제거
const PUZZLE_KEY = "cheongpung.puzzleFilled.v1"; // 주간 퍼즐 — 지역별 채운 조각 수

type SavedProfile = {
  homeRegionName: string;
  lifestyle: LifeStyleType;
  // v2: 새 유형 시스템 — 추천 매칭과 결과 화면에서 사용
  profileV2?: import("./data/lifestyle").LifestyleProfile;
  email?: string;
  nickname?: string;
  // v3: 온보딩 답변 raw 데이터 — 내 정보 탭에서 가치 칩·풍경·힐링 표시용
  onboarding?: import("./data/quiz").OnboardingData;
};

function loadProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedProfile;
  } catch {
    return null;
  }
}

function loadProgress(): Record<string, RegionRecord> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, RegionRecord>;
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, RegionRecord>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// 좋아요한 청년마을 — 내 정보 탭 컬렉션에서 다시 보기 위해 영속화
function loadLiked(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLiked(s: Set<string>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export default function App() {
  // 훅은 모두 조건부 리턴보다 먼저
  const hash = useHashRoute();
  const [profile, setProfile] = useState<SavedProfile | null>(() => loadProfile());
  const [tab, setTab] = useState<TabKey>("simulation");
  const [tab1Route, setTab1Route] = useState<Tab1Route>("home");
  const [tab2Route, setTab2Route] = useState<Tab2Route>("journey");
  // 편지함 — localStorage 영속. 첫 진입자는 환영 편지 시드.
  const [letters, setLetters] = useState<Letter[]>(() => {
    const saved = loadLetters();
    return saved.length > 0 ? saved : getInitialLetters();
  });
  // 수집한 기념품 — 미션 완료 시 드롭. localStorage 영속.
  const [acquiredItems, setAcquiredItems] = useState<Item[]>(() =>
    loadAcquiredItems()
  );
  // 수집한 꾸미기 자재 — B-1 별도 트랙. 미션 완료 시 기념품과 함께 드롭.
  const [acquiredDecorItems, setAcquiredDecorItems] = useState<DecorItem[]>(
    () => loadAcquiredDecor()
  );
  // 마당 배치 — 어느 슬롯에 어떤 아이템을 놓았는지. residenceId 별.
  const [placedDecor, setPlacedDecor] = useState<PlacedDecorMap>(() =>
    loadPlacedDecor()
  );
  // 기억한 말들 — 사용자가 NPC 발언 중 직접 고른 인용구. localStorage 영속.
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() =>
    loadQuotes()
  );
  const [tab4Route, setTab4Route] = useState<Tab4Route>("booking");
  const [selected, setSelected] = useState<Residence | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  // 미션 완료 결과 카드 데이터 — 완료 직후 채워서 mission-complete 화면에 노출
  const [completionData, setCompletionData] = useState<{
    mission: Mission;
    reward: number;
    totalScore: number;
    fitScore: number;
    fitScoreDelta: number;
    keyInfos: MissionKeyInfo[];
    pickedLabels: string[];
    isLastMissionToday: boolean;
    // 미션에서 떨어진 아이템 — 정의된 드롭이 있고 처음 획득일 때만 set
    acquiredItem?: Item;
  } | null>(null);
  const [regionProgress, setRegionProgress] = useState<
    Record<string, RegionRecord>
  >(() => loadProgress());
  const [reportResidenceId, setReportResidenceId] = useState<string | null>(null);
  const [moveInResidenceId, setMoveInResidenceId] = useState<string | null>(null);
  // 레지던스 상세 화면용
  const [viewingResidenceId, setViewingResidenceId] = useState<string | null>(null);
  // 레지던스 리스트 진입 시 필터(지역)
  const [residenceListRegion, setResidenceListRegion] = useState<string | null>(null);
  // 상세에서 뒤로 갈 때 list로 갈지 report로 갈지 추적
  const [detailEntry, setDetailEntry] = useState<"list" | "report">("list");
  // 미션 리스트에서 우편함 미션을 누른 경우 (모달로 노출)
  const [mailboxFromMission, setMailboxFromMission] = useState(false);
  // 예약 탭 — 선택된 레지던스 id + 진행 중인 예약 폼 데이터(완료 화면에서 사용)
  const [bookingResidenceId, setBookingResidenceId] = useState<string | null>(null);
  const [bookingDraft, setBookingDraft] = useState<{
    startDate: string;
    durationMonths: number;
  } | null>(null);
  // 예약 찜(하트) — 화면 상태만, 영속 X
  const [bookingLiked, setBookingLiked] = useState<Set<string>>(() => loadLiked());
  // 이주 리포트 시네마틱 — 풀스크린 모달 (열려있는 청년마을 id)
  const [cinematicResidenceId, setCinematicResidenceId] = useState<string | null>(null);
  const [cinematicLoading, setCinematicLoading] = useState(false);

  // === 현재 지역 진행 derivation (훅 입력) ===
  // 조기 반환(`if (!profile)`) 전에 useDayComplete 가 호출돼야 React 훅 순서 보존.
  const currentRecord = selected ? regionProgress[selected.id] : undefined;
  const currentCompletedIds = new Set(currentRecord?.completedMissionIds ?? []);
  const currentScore = currentRecord?.score ?? 0;
  const currentDayPlan = selected
    ? buildDayPlan(selected, missionsForResidence(selected.id))
    : null;
  const currentDay = currentRecord?.currentDay ?? 1;
  const dayState = useDayComplete({
    missionsByDay: currentDayPlan?.missionsByDay ?? [],
    bonusMissionIds: currentDayPlan?.bonusMissionIds ?? [],
    currentDay,
    completedIds: currentCompletedIds,
  });
  const hasBonusFlow = (currentDayPlan?.bonusMissionIds.length ?? 0) > 0;

  // === 바람이지음 마스코트 게이팅 — 변형 × 일차 × 지역 단위 하루 1회 (in-memory) ===
  const [mascotShown, setMascotShown] = useState<Record<string, boolean>>({});

  // === 주간 퍼즐 진행 — 지역별 채워진 조각 수 (localStorage 영속) ===
  //   채워진 조각 수 = 그 지역에서 종료 충족된 일차 수.
  //   PuzzleScreen 의 prev → new 전환 애니메이션은 별도 transition state.
  const [puzzleFilled, setPuzzleFilled] = useState<Record<string, number>>(
    () => {
      try {
        const raw = localStorage.getItem(PUZZLE_KEY);
        return raw ? (JSON.parse(raw) as Record<string, number>) : {};
      } catch {
        return {};
      }
    }
  );
  const [puzzleTransition, setPuzzleTransition] = useState<{
    residenceId: string;
    prev: number;
    next: number;
  } | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(PUZZLE_KEY, JSON.stringify(puzzleFilled));
    } catch {
      /* ignore */
    }
  }, [puzzleFilled]);

  // === 이주 리포트 자동 생성 백필 ===
  //   이미 미션을 다 끝낸 지역이 있는데 리포트가 안 생긴 경우 — 백그라운드 자동 생성.
  //   (옛 데이터에 적용, 또는 미션 완료 시 자동 트리거가 어떤 이유로 실패한 경우 보완.)
  //   useEffect 의 콜백이 ensureReportGenerated 를 참조하지만, 콜백은 렌더 이후에 실행되므로
  //   클로저는 (그때) 정의된 ensureReportGenerated 를 찾을 수 있음 — 선언 순서 안전.
  const reportGeneratingRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!profile) return; // 온보딩 전엔 진행 데이터 자체가 없으니 skip
    for (const r of residences) {
      if (reportGeneratingRef.current.has(r.id)) continue;
      const rec = regionProgress[r.id];
      if (!rec || rec.migrationReport) continue;
      if ((rec.visitCount ?? 0) === 0) continue;
      const { missionsByDay, dayCount } = buildDayPlan(
        r,
        missionsForResidence(r.id)
      );
      if ((rec.currentDay ?? 1) < dayCount) continue;
      const completedSet = new Set(rec.completedMissionIds);
      const allDaysDone = missionsByDay
        .slice(0, dayCount)
        .every((ids) => ids.every((id) => completedSet.has(id)));
      if (!allDaysDone) continue;
      reportGeneratingRef.current.add(r.id);
      void ensureReportGenerated(r, rec).finally(() => {
        reportGeneratingRef.current.delete(r.id);
      });
    }
  }, [regionProgress, profile]);

  // 좋아요한 청년마을 localStorage 영속
  useEffect(() => {
    saveLiked(bookingLiked);
  }, [bookingLiked]);

  // 편지함 localStorage 영속
  useEffect(() => {
    saveLetters(letters);
  }, [letters]);

  // 수집 아이템 localStorage 영속
  useEffect(() => {
    saveAcquiredItems(acquiredItems);
  }, [acquiredItems]);

  // 수집 꾸미기 자재 localStorage 영속
  useEffect(() => {
    saveAcquiredDecor(acquiredDecorItems);
  }, [acquiredDecorItems]);

  // 마당 배치 localStorage 영속
  useEffect(() => {
    savePlacedDecor(placedDecor);
  }, [placedDecor]);

  // 기억한 인용구 localStorage 영속
  useEffect(() => {
    saveQuotes(savedQuotes);
  }, [savedQuotes]);

  // 편지 추가 헬퍼 — 중복 트리거(같은 trigger + residence) 가벼운 방지
  const addLetter = (letter: Letter) => {
    setLetters((prev) => [letter, ...prev]);
  };

  // 진행 상태 localStorage 영속
  useEffect(() => {
    saveProgress(regionProgress);
  }, [regionProgress]);

  // 데모 리셋 + mock 진행도 채우기 (콘솔 헬퍼)
  useEffect(() => {
    const api = {
      // 모든 상태 초기화 → 온보딩부터
      reset: () => {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(LIKED_KEY);
        localStorage.removeItem(LETTERS_KEY);
        localStorage.removeItem(ITEMS_STORAGE_KEY);
        localStorage.removeItem(DECOR_STORAGE_KEY);
        localStorage.removeItem(PLACED_STORAGE_KEY);
        localStorage.removeItem(QUOTES_STORAGE_KEY);
        localStorage.removeItem(PUZZLE_KEY);
        setLetters(getInitialLetters());
        setAcquiredItems([]);
        setAcquiredDecorItems([]);
        setPlacedDecor({});
        setSavedQuotes([]);
        setPuzzleFilled({});
        setPuzzleTransition(null);
        setMascotShown({});
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab2Route("journey");
        setTab4Route("booking");
        setBookingResidenceId(null);
        setBookingDraft(null);
        setBookingLiked(new Set());
        setTab("simulation");
        setActiveMission(null);
        setRegionProgress({});
        setReportResidenceId(null);
        setMoveInResidenceId(null);
        setViewingResidenceId(null);
        setResidenceListRegion(null);
      },
      // 지역 진입만 시켜주는 단축 — 미션 미완료, 1일차, 마을 홈으로 이동.
      //   cheongpung.enter("ganghwa") → 강화 ResidenceHomeScreen, Day 1
      //   cheongpung.enter() → 첫 번째 지역
      enter: (residenceId?: string) => {
        const target = residenceId
          ? residences.find((r) => r.id === residenceId)
          : residences[0];
        if (!target) {
          console.warn(
            `[cheongpung] 지역을 찾을 수 없어요: ${residenceId}. 사용 가능한 id:`,
            residences.map((r) => r.id)
          );
          return;
        }
        // 비어있는 진행 기록 + 1일차로 — 미션 모두 미완료 상태
        const fresh: RegionRecord = {
          residenceId: target.id,
          visitCount: 1,
          completedMissionIds: [],
          score: 0,
          fitScore: 0,
          currentDay: 1,
        };
        setRegionProgress((p) => ({ ...p, [target.id]: fresh }));
        setSelected(target);
        setActiveMission(null);
        setTab("simulation");
        setTab1Route("residence-home");
        console.log(
          `[cheongpung] ${target.region} 진입 — Day 1, 미션 0/N`
        );
      },
      // 지역의 8개 미션을 모두 완료 처리하고 '하루 요약' 화면으로 점프
      // 사용법: cheongpung.skipTo()  → 첫 번째 지역
      //        cheongpung.skipTo("ganghwa") → 특정 지역
      skipTo: (residenceId?: string) => {
        const target = residenceId
          ? residences.find((r) => r.id === residenceId)
          : residences[0];
        if (!target) {
          console.warn(
            `[cheongpung] 지역을 찾을 수 없어요: ${residenceId}. 사용 가능한 id:`,
            residences.map((r) => r.id)
          );
          return;
        }
        // 전체 미션 완료(공통+지역) + 적합도 보너스 + 마지막 일차로 점프
        const missions = missionsForResidence(target.id);
        const { dayCount } = buildDayPlan(target, missions);
        const filled: RegionRecord = {
          residenceId: target.id,
          visitCount: 1,
          completedMissionIds: missions.map((m) => m.id),
          score: missions.reduce((sum, m) => sum + m.reward, 0),
          fitScore: 12,
          currentDay: dayCount,
        };
        setRegionProgress((p) => ({ ...p, [target.id]: filled }));
        // === skipTo 데모 보강 — 자재·기념품도 함께 채워서 마지막 날 의식이 풍성하게 ===
        // 미션 완료 부수효과(드롭)는 handleMissionComplete 에서만 도는데,
        // skipTo 는 우회 점프라 부수효과가 비어 있음. 상태 A 갤러리·뱃지가 의미를 갖도록 동시 적용.
        const decorDrops: DecorItem[] = missions.map((m) =>
          getDecorDropFor(m.id, target.id, target.region, m.title)
        );
        const itemDrops: Item[] = missions
          .map((m) => getItemDropFor(m.id, target.id))
          .filter((it): it is Item => it !== null);
        setAcquiredDecorItems((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          return [...prev, ...decorDrops.filter((d) => !existingIds.has(d.id))];
        });
        setAcquiredItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          return [...prev, ...itemDrops.filter((i) => !existingIds.has(i.id))];
        });
        // 마지막 날 상태 A 가 깨끗하게 보이도록 해당 레지던스 placed 배치는 비움
        setPlacedDecor((prev) => ({ ...prev, [target.id]: {} }));
        setSelected(target);
        setActiveMission(null);
        setTab("simulation");
        setTab1Route("day-end-ceremony");
        console.log(
          `[cheongpung] ${target.region} ${missions.length}개 미션 완료 mock + 자재 ${decorDrops.length}/기념품 ${itemDrops.length} 채움 → 하루 끝 의식`
        );
      },
      // 하루만 +1 (미션 진행 없이 일차만 올림) — 나의 공간 단계 전환 확인용
      // 사용법: cheongpung.bumpDay()  → 첫 지역 Day +1
      //        cheongpung.bumpDay("ganghwa") → 특정 지역 Day +1
      bumpDay: (residenceId?: string) => {
        const target = residenceId
          ? residences.find((r) => r.id === residenceId)
          : residences[0];
        if (!target) {
          console.warn(
            `[cheongpung] 지역을 찾을 수 없어요: ${residenceId}. 사용 가능한 id:`,
            residences.map((r) => r.id)
          );
          return;
        }
        const { dayCount } = buildDayPlan(
          target,
          missionsForResidence(target.id)
        );
        setRegionProgress((prev) => {
          const existing = prev[target.id];
          // visitCount 0이면 풍경에서 안 보이니 1로 올려줌. 그 외엔 그대로.
          const base: RegionRecord = existing ?? {
            residenceId: target.id,
            visitCount: 1,
            completedMissionIds: [],
            score: 0,
            fitScore: 0,
            currentDay: 1,
          };
          const seeded = {
            ...base,
            visitCount: Math.max(1, base.visitCount),
          };
          const stepped = advanceDay({ ...prev, [target.id]: seeded }, target.id, dayCount);
          const next = stepped[target.id].currentDay ?? 1;
          console.log(
            `[cheongpung] ${target.region} Day ${next} / 총 ${dayCount}`
          );
          return stepped;
        });
      },
      // 특정 일차로 직접 점프 (앞/뒤 자유) — 미션 진행 없이 currentDay만 설정
      // 사용법: cheongpung.setDay(1)              → 첫 지역 Day=1 (전단계로 되돌리기)
      //        cheongpung.setDay(3, "ganghwa")   → 강화도 Day=3
      setDay: (day: number, residenceId?: string) => {
        const target = residenceId
          ? residences.find((r) => r.id === residenceId)
          : residences[0];
        if (!target) {
          console.warn(
            `[cheongpung] 지역을 찾을 수 없어요: ${residenceId}. 사용 가능한 id:`,
            residences.map((r) => r.id)
          );
          return;
        }
        const { dayCount } = buildDayPlan(
          target,
          missionsForResidence(target.id)
        );
        const clamped = Math.max(1, Math.min(dayCount, Math.floor(day)));
        setRegionProgress((prev) => {
          const existing = prev[target.id];
          const base: RegionRecord = existing ?? {
            residenceId: target.id,
            visitCount: 1,
            completedMissionIds: [],
            score: 0,
            fitScore: 0,
            currentDay: 1,
          };
          console.log(
            `[cheongpung] ${target.region} Day ${clamped} / 총 ${dayCount}`
          );
          return {
            ...prev,
            [target.id]: {
              ...base,
              visitCount: Math.max(1, base.visitCount),
              currentDay: clamped,
            },
          };
        });
      },
      // 사용 가능한 지역 id 목록 출력
      regions: () => {
        const list = residences.map((r) => ({ id: r.id, region: r.region }));
        console.table(list);
        return list;
      },
      // 강화 한설 환영 모달 재테스트용 — storyIntroShown 플래그 해제
      // 사용법: cheongpung.resetIntro()             → 강화 ("ganghwa") 기본
      //        cheongpung.resetIntro("yeongwol")    → 다른 지역도 동일하게
      resetIntro: (residenceId: string = "ganghwa") => {
        setRegionProgress((p) => {
          const base = p[residenceId];
          if (!base) {
            console.warn(
              `[cheongpung] ${residenceId} 진행 기록이 아직 없어요. enter() 먼저 호출하세요.`
            );
            return p;
          }
          const next: RegionRecord = { ...base, storyIntroShown: false };
          console.log(
            `[cheongpung] ${residenceId} storyIntroShown 해제 — Day 1 진입 시 인사 모달 다시 노출`
          );
          return { ...p, [residenceId]: next };
        });
      },
      // 강화 shop 미션 게임식 튜토리얼 재테스트용 — shopTutorialShown 해제.
      resetShopTutorial: (residenceId: string = "ganghwa") => {
        setRegionProgress((p) => {
          const base = p[residenceId];
          if (!base) {
            console.warn(
              `[cheongpung] ${residenceId} 진행 기록이 아직 없어요. enter() 먼저 호출하세요.`
            );
            return p;
          }
          const next: RegionRecord = { ...base, shopTutorialShown: false };
          console.log(
            `[cheongpung] ${residenceId} shopTutorialShown 해제 — shop 미션 정보 화면에서 튜토리얼 다시 노출`
          );
          return { ...p, [residenceId]: next };
        });
      },
      // 시간대 흐름 안내 재테스트용 — nextSlotGuidesShown 전부 해제.
      // 미션 완료 후 다음 시간대(점심/저녁) 탭 안내가 다시 뜸. Day 1/2/3 공통.
      resetSlotGuides: (residenceId: string = "ganghwa") => {
        setRegionProgress((p) => {
          const base = p[residenceId];
          if (!base) {
            console.warn(
              `[cheongpung] ${residenceId} 진행 기록이 아직 없어요. enter() 먼저 호출하세요.`
            );
            return p;
          }
          const next: RegionRecord = { ...base, nextSlotGuidesShown: {} };
          console.log(
            `[cheongpung] ${residenceId} nextSlotGuidesShown 해제 — 미션 완료 후 시간대 안내 재노출`
          );
          return { ...p, [residenceId]: next };
        });
      },
    };
    (window as unknown as { cheongpung?: typeof api }).cheongpung = api;
    console.log(
      "%c[cheongpung] 데모 헬퍼 준비됨 — reset() / enter(id?) / skipTo(id?) / bumpDay(id?) / setDay(day, id?) / regions() / resetIntro(id?) / resetShopTutorial(id?) / resetSlotGuides(id?)",
      "color:#FF7043;font-weight:bold"
    );
  }, []);

  if (hash === "#hospital") return <HospitalMissionScreen />;

  const handleOnboardingComplete = (r: OnboardingResult) => {
    const email = r.data.email || "";
    const nickname = r.data.nickname.trim() || "여행자";
    const next: SavedProfile = {
      homeRegionName: r.data.homeRegion || "서울",
      lifestyle: r.lifestyle,
      profileV2: r.profile,
      email,
      nickname,
      onboarding: r.data, // 내 정보 탭에서 가치 칩·풍경·힐링 답 노출용
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setProfile(next);
  };

  if (!profile) {
    return <OnboardingShell onComplete={handleOnboardingComplete} />;
  }

  const homeRegion = profile.homeRegionName;
  const nickname = profile.nickname ?? "여행자";
  const matchedResidence = residences.find((r) => r.region === homeRegion);
  const homePos: RegionPos =
    resolveRegionPos(homeRegion) ??
    HOME_POSITIONS[homeRegion] ??
    (matchedResidence
      ? { xPct: matchedResidence.xPct, yPct: matchedResidence.yPct }
      : HOME_POSITIONS["서울"]);

  // 마스코트/퍼즐 state + useDayComplete 훅은 조기 반환 전(파일 상단)에서 호출됨.
  // 여기서는 그 결과를 받아 derivation 만 계산.
  // 여기서는 그 state 들을 기반으로 한 derivation 만 계산.
  const mascotKey = selected
    ? `${selected.id}::day${currentDay}`
    : null;
  const mascotVariant: "urgent" | "complete" | null = (() => {
    if (!hasBonusFlow || !mascotKey) return null;
    if (dayState.isDayComplete && !mascotShown[`${mascotKey}::complete`])
      return "complete";
    if (dayState.isUrgent && !mascotShown[`${mascotKey}::urgent`])
      return "urgent";
    return null;
  })();
  const dismissMascot = (variant: "urgent" | "complete") => {
    if (!mascotKey) return;
    setMascotShown((prev) => ({ ...prev, [`${mascotKey}::${variant}`]: true }));
  };

  // 시뮬레이션 탭 안에서 "레지던스 진입 후 흐름"으로 인정할 화면들.
  // 다른 탭에 다녀와도 이 화면 중 하나에 있었다면 그대로 보존 (사용자 멘탈 모델:
  // "들어가기 = 첫 애니메이션, 그 뒤로는 본가로 돌아가기 전까지 마을 안에 머무름").
  const IN_RESIDENCE_FLOW: Tab1Route[] = [
    "residence-home",
    "mission-list",
    "mission-info",
    "mission-traveling",
    "mission-execute",
    "mission-complete",
    "day-end-ceremony",
    "puzzle",
  ];

  const handleTabChange = (next: TabKey) => {
    // 이동 애니메이션 중에는 tab1Route 손대지 않음
    const inTransit = tab1Route === "traveling" || tab1Route === "traveling-back";
    if (next === "simulation" && !inTransit) {
      if (selected) {
        // 레지던스 체류 중 — 이미 residence 흐름 안이면 그대로 보존.
        // arrival(들어가기 애니메이션) 만 있는 경우는 한 번 본 것으로 간주, 마을 홈으로 점프.
        if (!IN_RESIDENCE_FLOW.includes(tab1Route)) {
          setTab1Route("residence-home");
        }
        // IN_RESIDENCE_FLOW 안에 있으면 setTab1Route 호출 X → 화면 상태 그대로 유지
      } else {
        // 본가 흐름 — 본가 홈으로
        setTab1Route("home");
      }
    }
    if (next === "journey") setTab2Route("journey");
    if (next === "booking") setTab4Route("booking");
    setTab(next);
  };

  const handleTravelComplete = () => {
    if (selected) setRegionProgress((p) => bumpVisit(p, selected.id));
    setTab1Route("arrival");
  };

  // 마을 → 본 지역 역방향 이동 완료
  const handleReturnHomeComplete = () => {
    setSelected(null);
    setActiveMission(null);
    setTab1Route("home");
  };

  const handleMissionComplete = (
    fitDelta = 0,
    pickStats?: { totalPicks: number; alignedPicks: number },
    pickedLabels?: string[]
  ) => {
    if (!activeMission || !selected) return;

    // 적합도 변화량 계산을 위해 완료 전 점수 먼저 측정
    const beforeMatch = calculateMatchV2(
      profile.profileV2,
      selected,
      regionProgress[selected.id]
    ).total;

    const newProgress = completeMissionFor(
      regionProgress,
      selected.id,
      activeMission,
      fitDelta,
      pickStats,
      pickedLabels
    );

    const updatedRecord = newProgress[selected.id]!;
    const afterMatch = calculateMatchV2(
      profile.profileV2,
      selected,
      updatedRecord
    ).total;

    // 현재 일차의 모든 미션이 끝났는지 확인
    const completedSet = new Set(updatedRecord.completedMissionIds);
    const { missionsByDay, dayCount } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const day = updatedRecord.currentDay ?? 1;
    const dayDone = isDayComplete(missionsByDay, day, completedSet);

    // 마지막 날 마지막 미션 → 이주 리포트 백그라운드 생성.
    // ceremony 에서 다른 옵션을 골라도 JourneyScreen 의 리포트 카드가 잠금 해제되도록.
    if (dayDone && day >= dayCount && !updatedRecord.migrationReport) {
      void ensureReportGenerated(selected, updatedRecord);
    }

    // === 기념품 드롭 — 미션 + 마을 조합에 정의된 아이템이 있고, 아직 미수집이면 획득 ===
    const drop = getItemDropFor(activeMission.id, selected.id);
    const alreadyHave = drop
      ? acquiredItems.some((it) => it.id === drop.id)
      : false;
    const newlyAcquired = drop && !alreadyHave ? drop : undefined;
    if (newlyAcquired) {
      setAcquiredItems((prev) => [...prev, newlyAcquired]);
    }

    // === 꾸미기 자재 드롭 — B-1 별도 트랙. 미션마다 항상 1개 (deterministic). ===
    const decorDrop = getDecorDropFor(
      activeMission.id,
      selected.id,
      selected.region,
      activeMission.title
    );
    const alreadyHaveDecor = acquiredDecorItems.some(
      (d) => d.id === decorDrop.id
    );
    if (!alreadyHaveDecor) {
      setAcquiredDecorItems((prev) => [...prev, decorDrop]);
    }

    // 미션 완료 결과 카드용 데이터 저장
    setCompletionData({
      mission: activeMission,
      reward: activeMission.reward,
      totalScore: updatedRecord.score,
      fitScore: afterMatch,
      fitScoreDelta: afterMatch - beforeMatch,
      keyInfos: keyInfosFor(activeMission.id),
      pickedLabels:
        updatedRecord.pickedLabels?.[activeMission.id] ?? pickedLabels ?? [],
      isLastMissionToday: dayDone,
      acquiredItem: newlyAcquired,
    });

    setRegionProgress(newProgress);
    setActiveMission(null);
    setTab1Route("mission-complete");
  };

  // 하루 끝 의식에서 어디론가 떠날 때 — 일차 +1 후 목적지로
  // 마지막 날 닫기는 일차 진행 없이 하루 요약으로 (체류 종료 흐름)
  const finishDayAnd = (then: () => void) => {
    if (!selected) return;
    const { dayCount } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const cur = currentRecord?.currentDay ?? 1;
    if (cur < dayCount) {
      // 다음 일차 아침 안부 편지 한 통만. (저녁 회고 편지는 "오늘 끝" 의식 화면이 대신함)
      addLetter(makeNextDayLetter(selected, cur + 1));
      setRegionProgress((p) => advanceDay(p, selected.id, dayCount));
    }
    then();
  };

  const handleDayCeremonyClose = () => {
    if (!selected) return;
    const { dayCount } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const cur = currentRecord?.currentDay ?? 1;
    if (cur >= dayCount) {
      // 마지막 날 닫기 — 곧장 이주 리포트 시네마틱으로 (DailySummary 제거)
      void handleOpenCinematic(selected);
      return;
    }
    finishDayAnd(() => setTab1Route("arrival"));
  };

  const handleCeremonyGoJourney = () =>
    finishDayAnd(() => {
      setTab("journey");
      setTab2Route("journey");
    });

  const handleCeremonyGoCommunity = () =>
    finishDayAnd(() => {
      setTab("community");
    });

  // 리포트 자동 생성 훅은 조기 반환 전으로 이동됨 — 본체 derivation 만 여기에.
  // 이주 리포트 생성만 — 캐시 있으면 no-op. UI 안 띄움. 백그라운드에서도 호출 가능.
  // rec 을 직접 받아 호출 시점의 최신 progress 를 보장 (state 업데이트 race 회피).
  const ensureReportGenerated = async (
    residence: Residence,
    rec: RegionRecord
  ): Promise<MigrationReport> => {
    if (rec.migrationReport) return rec.migrationReport;
    const missions = missionsForResidence(residence.id);
    const report = await generateMigrationReport(
      residence,
      rec,
      missions,
      profile?.lifestyle ?? null
    );
    setRegionProgress((p) => saveReport(p, residence.id, report));
    // 이주 리포트 처음 생성될 때 — "먼저 온 이주자" 회고 편지 도착
    addLetter(makeReportLetter(residence));
    return report;
  };

  // 이주 리포트 시네마틱 열기 — 없으면 생성 후 노출
  const handleOpenCinematic = async (residence: Residence) => {
    const rec = regionProgress[residence.id];
    if (!rec) return;
    setCinematicLoading(true);
    try {
      await ensureReportGenerated(residence, rec);
      setCinematicResidenceId(residence.id);
    } finally {
      setCinematicLoading(false);
    }
  };

  // 의식 화면 추천에서 시네마틱 열기
  const handleCeremonyOpenCinematic = () =>
    finishDayAnd(() => {
      if (selected) void handleOpenCinematic(selected);
    });

  const handleCloseCinematic = () => {
    if (cinematicResidenceId) {
      setRegionProgress((p) => markReportViewed(p, cinematicResidenceId));
    }
    setCinematicResidenceId(null);
  };

  // 강화 한설 환영 모달 — Day 1 첫 진입 시 1회 노출 후 영속 처리.
  const handleDismissHanseolIntro = () => {
    if (!selected) return;
    setRegionProgress((p) => {
      const base = p[selected.id];
      if (!base) return p;
      return { ...p, [selected.id]: { ...base, storyIntroShown: true } };
    });
  };

  // 강화 shop 미션 — 게임식 튜토리얼 1회 노출 후 영속 처리 (체험하기 버튼 클릭 시 호출).
  const handleDismissShopTutorial = () => {
    if (!selected) return;
    setRegionProgress((p) => {
      const base = p[selected.id];
      if (!base) return p;
      return { ...p, [selected.id]: { ...base, shopTutorialShown: true } };
    });
  };

  // 시간대 흐름 안내 — 다음 시간대 탭 클릭 시 해당 일차-슬롯의 1회 노출 플래그 영속화.
  // key: "day{N}-{sourceSlot}" — 예: Day 1 아침 완료 후 점심 안내를 dismiss 하면 "day1-아침" 저장.
  const handleDismissNextSlotGuide = (key: string) => {
    if (!selected) return;
    setRegionProgress((p) => {
      const base = p[selected.id];
      if (!base) return p;
      return {
        ...p,
        [selected.id]: {
          ...base,
          nextSlotGuidesShown: {
            ...(base.nextSlotGuidesShown ?? {}),
            [key]: true,
          },
        },
      };
    });
  };

  // 미션 선택 시 — 먼저 정보 화면으로. 진행 분기는 정보 화면의 "체험하기" 버튼에서.
  const handleSelectMission = (m: Mission) => {
    setActiveMission(m);
    setTab1Route("mission-info");
  };

  // 정보 화면 "체험하기" — 기존 mode 분기 로직 (예전 handleSelectMission 내용)
  const handleStartActiveMission = () => {
    if (!activeMission) return;
    if (activeMission.mode === "mailbox") {
      // 우편함 모달 노출 + 모달 닫으면 정보 화면이 아닌 미션 리스트가 보이도록 라우트 미리 복귀
      setTab1Route("mission-list");
      setMailboxFromMission(true);
      return;
    }
    if (
      activeMission.mode === "map-dialogue" ||
      activeMission.mode === "map-info"
    ) {
      setTab1Route("mission-traveling");
    } else {
      // dialogue / numeric / final — 바로 수행 화면
      setTab1Route("mission-execute");
    }
  };

  // 우편함 모달 닫힐 때 — 미션 완료 처리
  const handleMailboxMissionClose = () => {
    if (activeMission) {
      // 우편함 미션: 보상 +3 고정, fitDelta 0
      handleMissionComplete(0);
    }
    setMailboxFromMission(false);
  };

  const handleOpenReport = (residence: Residence) => {
    setReportResidenceId(residence.id);
    setTab2Route("report");
    // 탭1(하루 요약)에서 진입해도 탭2 리포트로 전환되도록
    setTab("journey");
  };

  const handleDecideMove = () => {
    if (!reportResidenceId) return;
    setMoveInResidenceId(reportResidenceId);
    setTab2Route("move-in");
  };

  const handleMoveInDone = () => {
    if (!moveInResidenceId) return;
    const res = residences.find((r) => r.id === moveInResidenceId);
    if (!res) return;
    const next: SavedProfile = { ...profile, homeRegionName: res.region };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setProfile(next);
    setMoveInResidenceId(null);
    setReportResidenceId(null);
    setSelected(null);
    setTab1Route("home");
    setTab("simulation");
    setTab2Route("journey");
  };

  // 리스트에서 카드 탭 → 상세
  const handleSelectResidenceFromList = (r: Residence) => {
    setViewingResidenceId(r.id);
    setDetailEntry("list");
    setTab("journey");
    setTab2Route("residence-detail");
  };

  // 리포트에서 "신청하기" → 상세 (back은 report로)
  const handleApplyFromReport = (r: Residence) => {
    setViewingResidenceId(r.id);
    setDetailEntry("report");
    setTab2Route("residence-detail");
  };

  // 설정 화면 진입
  const handleOpenSettings = () => {
    setTab("journey");
    setTab2Route("settings");
  };

  const reportResidence = reportResidenceId
    ? residences.find((r) => r.id === reportResidenceId)
    : null;
  const moveInResidence = moveInResidenceId
    ? residences.find((r) => r.id === moveInResidenceId)
    : null;
  const viewingResidence = viewingResidenceId
    ? residences.find((r) => r.id === viewingResidenceId)
    : null;

  return (
    // outer wrapper:
    //   · overflow-x-hidden 만 — 세로 콘텐츠 자라남은 허용 (옛 overflow-hidden 은 잘림 위험)
    //   · min-h-[100dvh] — 모바일 주소창 변화 대응
    //   · BottomNav 는 fixed 라 wrapper 흐름 영향 X
    <div className="relative w-full max-w-[420px] min-h-[100dvh] bg-cream shadow-soft overflow-x-hidden">
      <main className="min-h-[100dvh]">
        {/* ===== 탭1 ===== */}
        {tab === "simulation" && tab1Route === "home" && (
          <HomeScreen
            homeRegion={homeRegion}
            onDepart={() => setTab1Route("departure")}
          />
        )}

        {/* 찐 홈 — 레지던스 진입 후 일상 화면 */}
        {tab === "simulation" &&
          tab1Route === "residence-home" &&
          selected &&
          currentDayPlan && (() => {
            const todayMissions =
              currentDayPlan.missionsByDay[currentDay - 1] ?? [];
            const todayDone = todayMissions.filter((id) =>
              currentCompletedIds.has(id)
            ).length;
            return (
              <ResidenceHomeScreen
                residence={selected}
                nickname={nickname}
                homeRegion={homeRegion}
                currentDay={currentDay}
                dayCount={currentDayPlan.dayCount}
                todayMissionCount={todayMissions.length}
                todayMissionDoneCount={todayDone}
                onGoMissionList={() => setTab1Route("mission-list")}
                onReturnHome={() => setTab1Route("traveling-back")}
                onOpenLetters={() => setTab1Route("letter")}
                letterUnread={unreadCount(letters)}
                decorInventory={acquiredDecorItems.filter(
                  (d) => d.residenceId === selected.id
                )}
                placedDecor={placedDecor[selected.id] ?? {}}
                onUpdatePlaced={(next) =>
                  setPlacedDecor((prev) => ({
                    ...prev,
                    [selected.id]: next,
                  }))
                }
                mascot={
                  mascotVariant === "complete"
                    ? {
                        variant: "complete",
                        onDismiss: () => {
                          dismissMascot("complete");
                          // Phase 4 — 바람이지음 마무리 → 퍼즐 조각 채우기 → 의식.
                          // prev/next 를 transition state 에 박아두면 PuzzleScreen 이
                          // 새 조각이 들어오는 애니메이션을 보여줄 수 있음.
                          const prev = puzzleFilled[selected.id] ?? 0;
                          if (currentDay > prev) {
                            setPuzzleTransition({
                              residenceId: selected.id,
                              prev,
                              next: currentDay,
                            });
                            setPuzzleFilled((prevAll) => ({
                              ...prevAll,
                              [selected.id]: currentDay,
                            }));
                          }
                          setTab1Route("puzzle");
                        },
                      }
                    : mascotVariant === "urgent"
                    ? {
                        variant: "urgent",
                        remaining: dayState.remainingToComplete,
                        onDismiss: () => dismissMascot("urgent"),
                      }
                    : undefined
                }
                showHanseolIntro={
                  selected.id === "ganghwa" &&
                  currentDay === 1 &&
                  !currentRecord?.storyIntroShown
                }
                onDismissHanseolIntro={handleDismissHanseolIntro}
              />
            );
          })()}

        {tab === "simulation" && tab1Route === "departure" && (
          <DepartureScreen
            homeRegion={homeRegion}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            onBack={() => setTab1Route("home")}
            onDepart={(r: Residence) => {
              setSelected(r);
              setTab1Route("traveling");
            }}
          />
        )}

        {tab === "simulation" && tab1Route === "traveling" && selected && (
          <TravelingScreen
            origin={{ ...homePos, region: homeRegion }}
            destination={selected}
            onComplete={handleTravelComplete}
          />
        )}

        {tab === "simulation" && tab1Route === "arrival" && selected && (
          <ArrivalScreen
            residence={selected}
            homeRegion={homeRegion}
            onReturnHome={() => setTab1Route("traveling-back")}
            onStartMissions={() => {
              // 레지던스 진입 시 — 그 지역의 환영 편지가 도착 (한 번만)
              const already = letters.some(
                (l) =>
                  l.trigger === "arrival" && l.residenceId === selected.id
              );
              if (!already) addLetter(makeArrivalLetter(selected));
              setTab1Route("residence-home");
            }}
          />
        )}

        {tab === "simulation" && tab1Route === "traveling-back" && selected && (
          <TravelingScreen
            origin={{
              xPct: selected.xPct,
              yPct: selected.yPct,
              region: selected.region,
            }}
            destination={{ ...homePos, region: homeRegion }}
            caption="집으로 돌아가는 중"
            onComplete={handleReturnHomeComplete}
          />
        )}

        {tab === "simulation" && tab1Route === "mission-list" && selected && (() => {
          // === 시간대 흐름 안내 — 강화도 한정. 미션 완료 후 다음 시간대 탭으로 이끔. ===
          // currentDayPlan.missionsByDay[day-1] 에서 timeOfDay 가 정렬되어 들어 있음(아침→낮→저녁).
          // 아침 미션이 완료됐고 점심 안내가 아직 안 보였으면 → "낮" 탭 안내
          // 낮 미션이 완료됐고 저녁 안내가 아직 안 보였으면 → "저녁" 탭 안내
          // (낮 완료 안내가 우선순위 더 높음 — 단계가 더 뒤이기 때문)
          let nextSlotGuide:
            | { target: "낮" | "저녁"; caption: string; key: string }
            | undefined = undefined;
          if (selected.id === GANGHWA_ID && currentDayPlan) {
            const todayIds = currentDayPlan.missionsByDay[currentDay - 1] ?? [];
            const allMissions = missionsForResidence(selected.id);
            const todayMissions = todayIds
              .map((id) => allMissions.find((m) => m.id === id))
              .filter((m): m is Mission => !!m);
            const morningMission = todayMissions.find((m) => m.timeOfDay === "아침");
            const middayMission = todayMissions.find((m) => m.timeOfDay === "낮");
            const eveningMission = todayMissions.find((m) => m.timeOfDay === "저녁");
            const shown = currentRecord?.nextSlotGuidesShown ?? {};
            const middayKey = `day${currentDay}-낮`;
            const morningKey = `day${currentDay}-아침`;
            if (
              middayMission &&
              currentCompletedIds.has(middayMission.id) &&
              eveningMission &&
              !shown[middayKey]
            ) {
              nextSlotGuide = {
                target: "저녁",
                caption: HANSEOL_EVENING_HINT,
                key: middayKey,
              };
            } else if (
              morningMission &&
              currentCompletedIds.has(morningMission.id) &&
              middayMission &&
              !shown[morningKey]
            ) {
              nextSlotGuide = {
                target: "낮",
                caption: HANSEOL_LUNCH_HINT,
                key: morningKey,
              };
            }
          }
          return (
            <MissionListScreen
              region={selected.region}
              residence={selected}
              completedIds={currentCompletedIds}
              totalScore={currentScore}
              fitScore={currentRecord?.fitScore ?? 0}
              currentDay={currentDay}
              onBack={() => setTab1Route("arrival")}
              onSelectMission={handleSelectMission}
              nextSlotGuide={nextSlotGuide}
              onDismissNextSlotGuide={() => {
                if (nextSlotGuide) handleDismissNextSlotGuide(nextSlotGuide.key);
              }}
            />
          );
        })()}

        {tab === "simulation" && tab1Route === "mission-info" && activeMission && selected && (
          <MissionInfoScreen
            region={selected.region}
            residenceId={selected.id}
            mission={activeMission}
            onBack={() => {
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onStart={handleStartActiveMission}
            // 게임식 튜토리얼은 비활성화 — Day 1 shop "체험하기" 버튼 안내 오버레이 제거.
            showShopTutorial={false}
          />
        )}

        {tab === "simulation" && tab1Route === "day-end-ceremony" && selected && currentDayPlan && (
          <DayEndCeremonyScreen
            region={selected.region}
            residenceId={selected.id}
            finishedDay={currentDay}
            totalDays={currentDayPlan.dayCount}
            onClose={handleDayCeremonyClose}
            suggestions={
              currentDay >= currentDayPlan.dayCount
                ? [
                    {
                      icon: cinematicLoading ? "⏳" : "🎬",
                      title: cinematicLoading
                        ? "이주 리포트 만드는 중..."
                        : "이주 리포트 열기",
                      subtitle: "당신의 시간을 한 편의 시퀀스로",
                      onClick: handleCeremonyOpenCinematic,
                    },
                    {
                      icon: "🗺️",
                      title: "나의 여정에서 돌아보기",
                      subtitle: "다녀온 지역과 짓고 있는 집",
                      onClick: handleCeremonyGoJourney,
                    },
                  ]
                : [
                    {
                      icon: "🌿",
                      title: "내 자리 가서 마당 꾸미기",
                      subtitle: "오늘 받은 자재로 마당 한 곳에",
                      onClick: () => {
                        // 비-마지막일: 다음 일차로 진행(finishDayAnd) 후 residence-home 으로.
                        // finishDayAnd 가 일차 +1 + 안부 편지 처리.
                        finishDayAnd(() => setTab1Route("residence-home"));
                      },
                    },
                    {
                      icon: "🗺️",
                      title: "나의 여정에서 진행 보기",
                      subtitle: "오늘까지 쌓인 흔적",
                      onClick: handleCeremonyGoJourney,
                    },
                  ]
            }
            // === 마지막 날 분기 (상태 A) 용 데이터 ===
            acquiredDecorItems={acquiredDecorItems}
            acquiredItems={acquiredItems}
            placedDecor={placedDecor[selected.id] ?? {}}
            onGoYard={() => setTab1Route("residence-home")}
            onOpenCinematic={handleCeremonyOpenCinematic}
          />
        )}

        {tab === "simulation" && tab1Route === "mission-traveling" && activeMission && (
          <MissionTravelingScreen
            mission={activeMission}
            // 미션에 좌표 없으면 현재 머무는 마을 중심 좌표로 fallback
            // → 모든 로드뷰 미션이 실제 카카오 로드뷰로 보임
            fallbackPosition={selected?.kakaoPosition}
            onBack={() => {
              // 이동 화면 닫고 미션 리스트로 복귀
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onComplete={() => {
              // 지도 안내 미션은 도착 후 바로 완료 처리(짧은 정보 카드만 짚고)
              if (activeMission.mode === "map-info") {
                setTab1Route("mission-execute");
              } else {
                setTab1Route("mission-execute");
              }
            }}
          />
        )}

        {tab === "simulation" && tab1Route === "mission-execute" && activeMission && selected && (
          <MissionExecuteScreen
            mission={activeMission}
            residenceStance={selected.stance}
            residenceStanceAlt={selected.stanceAlt}
            residenceEnv={selected.envType}
            onClose={() => {
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onComplete={handleMissionComplete}
            onSaveQuote={(text) => {
              if (!activeMission || !selected) return;
              const newQuote: SavedQuote = {
                id: `${Date.now()}-${activeMission.id}`,
                text,
                speaker: activeMission.npc.name,
                speakerEmoji: activeMission.npc.emoji,
                missionId: activeMission.id,
                missionTitle: activeMission.title,
                residenceId: selected.id,
                residenceRegion: selected.region,
                savedAt: Date.now(),
              };
              setSavedQuotes((prev) => [newQuote, ...prev]);
            }}
          />
        )}

        {/* === 미션 완료 결과 카드 === */}
        {tab === "simulation" &&
          tab1Route === "mission-complete" &&
          completionData && (
            <MissionCompleteScreen
              mission={completionData.mission}
              reward={completionData.reward}
              totalScore={completionData.totalScore}
              fitScore={completionData.fitScore}
              fitScoreDelta={completionData.fitScoreDelta}
              keyInfos={completionData.keyInfos}
              pickedLabels={completionData.pickedLabels}
              isLastMissionToday={completionData.isLastMissionToday}
              acquiredItem={completionData.acquiredItem}
              onNext={() => {
                const dayDone = completionData.isLastMissionToday;
                setCompletionData(null);
                // 강화 (보너스 흐름 있음):
                //   · 종료 충족(mains + bonus 2+) → ResidenceHome 으로 (마스코트 complete → 퍼즐 → 의식)
                //   · 아직 종료 X → 바로 mission-list 로 (점심/저녁 안내 자연스럽게)
                // 다른 지역: mains 끝났으면 의식, 아니면 mission-list (기존).
                if (hasBonusFlow) {
                  setTab1Route(
                    dayState.isDayComplete ? "residence-home" : "mission-list"
                  );
                } else {
                  setTab1Route(dayDone ? "day-end-ceremony" : "mission-list");
                }
              }}
            />
          )}

        {/* ===== 탭2 ===== */}
        {tab === "journey" && tab2Route === "journey" && (
          <JourneyScreen
            regionProgress={regionProgress}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            onOpenReport={handleOpenReport}
            onOpenCinematic={(r) => void handleOpenCinematic(r)}
            acquiredItems={acquiredItems}
            savedQuotes={savedQuotes}
          />
        )}

        {tab === "journey" && tab2Route === "settings" && (
          <SettingsScreen
            nickname={nickname}
            email={profile.email}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            homeRegion={homeRegion}
            onBack={() => setTab2Route("journey")}
            onLogout={() => {
              (window as unknown as { cheongpung?: { reset: () => void } })
                .cheongpung?.reset();
            }}
            onDeleteAccount={() => {
              (window as unknown as { cheongpung?: { reset: () => void } })
                .cheongpung?.reset();
            }}
            onResetOnboarding={() => {
              (window as unknown as { cheongpung?: { reset: () => void } })
                .cheongpung?.reset();
            }}
          />
        )}

        {tab === "journey" &&
          tab2Route === "report" &&
          reportResidence &&
          regionProgress[reportResidence.id] && (
            <MigrationReportScreen
              residence={reportResidence}
              record={regionProgress[reportResidence.id]}
              lifestyle={profile.lifestyle}
              allProgress={regionProgress}
              onBack={() => {
                setReportResidenceId(null);
                setTab2Route("journey");
              }}
              onDecideMove={handleDecideMove}
              onApplyResidence={handleApplyFromReport}
            />
          )}

        {tab === "journey" && tab2Route === "move-in" && moveInResidence && (
          <MoveInScreen
            residence={moveInResidence}
            onGoHome={handleMoveInDone}
          />
        )}

        {tab === "journey" && tab2Route === "residence-list" && (
          <ResidenceListScreen
            filterRegion={residenceListRegion ?? undefined}
            lifestyle={profile.lifestyle}
            onBack={() => {
              setResidenceListRegion(null);
              setTab2Route("journey");
            }}
            onSelectResidence={handleSelectResidenceFromList}
          />
        )}

        {tab === "journey" && tab2Route === "residence-detail" && viewingResidence && (
          <ResidenceDetailScreen
            residence={viewingResidence}
            lifestyle={profile.lifestyle}
            record={regionProgress[viewingResidence.id]}
            onBack={() => {
              setViewingResidenceId(null);
              setTab2Route(detailEntry === "report" ? "report" : "residence-list");
            }}
          />
        )}

        {/* ===== 커뮤니티 탭 — 이주민 이야기 모음 ===== */}
        {tab === "community" && <CommunityScreen />}

        {/* ===== 편지 — 시뮬레이션 탭의 sub-route. ResidenceHomeScreen 의 편지 버튼에서 진입 ===== */}
        {tab === "simulation" && tab1Route === "letter" && (
          <LetterScreen
            letters={letters}
            onMarkRead={(id) =>
              setLetters((prev) =>
                prev.map((l) => (l.id === id ? { ...l, read: true } : l))
              )
            }
            onMarkAllRead={() =>
              setLetters((prev) => prev.map((l) => ({ ...l, read: true })))
            }
            onBack={() => setTab1Route("residence-home")}
            nickname={nickname}
          />
        )}

        {/* ===== 주간 퍼즐 — 바람이지음 마무리 → 조각 채우기 → 의식 ===== */}
        {tab === "simulation" && tab1Route === "puzzle" && selected && currentDayPlan && (
          <PuzzleScreen
            region={selected.region}
            totalPieces={currentDayPlan.dayCount}
            prev={
              puzzleTransition?.residenceId === selected.id
                ? puzzleTransition.prev
                : puzzleFilled[selected.id] ?? 0
            }
            next={
              puzzleTransition?.residenceId === selected.id
                ? puzzleTransition.next
                : puzzleFilled[selected.id] ?? 0
            }
            imageSrc="/puzzle/puzzle2.png"
            onContinue={() => {
              // 조각 다 채우면 마지막 — TODO(final-day): 이주 리포트/마당 진입점 분기.
              // 지금은 모든 일차에서 일관되게 day-end-ceremony 로.
              setPuzzleTransition(null);
              setTab1Route("day-end-ceremony");
            }}
          />
        )}

        {/* === 내 정보 탭 — 정체성 + 좋아요 청년마을 + 설정 === */}
        {tab === "profile" && (
          <ProfileScreen
            nickname={nickname}
            homeRegion={homeRegion}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            onboarding={profile.onboarding}
            likedResidences={recommendedResidences.filter((r) =>
              bookingLiked.has(r.id)
            )}
            onOpenSettings={handleOpenSettings}
            onSelectResidence={(r) => {
              setBookingResidenceId(r.id);
              setTab4Route("booking-detail");
              setTab("booking");
            }}
          />
        )}

        {/* ===== 탭4: 레지던스 예약 ===== */}
        {tab === "booking" && tab4Route === "booking" && (
          <BookingScreen
            residences={recommendedResidences}
            onSelectResidence={(r) => {
              setBookingResidenceId(r.id);
              setTab4Route("booking-detail");
            }}
            liked={bookingLiked}
            onToggleLike={(id) =>
              setBookingLiked((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
          />
        )}

        {tab === "booking" &&
          tab4Route === "booking-detail" &&
          bookingResidenceId &&
          (() => {
            const r = recommendedResidences.find(
              (x) => x.id === bookingResidenceId
            );
            if (!r) return null;
            return (
              <BookingDetailScreen
                residence={r}
                liked={bookingLiked.has(r.id)}
                onToggleLike={() =>
                  setBookingLiked((prev) => {
                    const next = new Set(prev);
                    if (next.has(r.id)) next.delete(r.id);
                    else next.add(r.id);
                    return next;
                  })
                }
                onBack={() => {
                  // 레지던스 예약 리스트로 복귀
                  setBookingResidenceId(null);
                  setTab4Route("booking");
                  setTab("booking");
                }}
                onBook={() => setTab4Route("booking-form")}
              />
            );
          })()}

        {tab === "booking" &&
          tab4Route === "booking-form" &&
          bookingResidenceId &&
          (() => {
            const r = recommendedResidences.find(
              (x) => x.id === bookingResidenceId
            );
            if (!r) return null;
            return (
              <BookingFormScreen
                residence={r}
                onBack={() => setTab4Route("booking-detail")}
                onSubmit={(draft) => {
                  setBookingDraft(draft);
                  setTab4Route("booking-done");
                  // 예약 확정 알림 편지 도착
                  addLetter(
                    makeBookingConfirmedLetter(
                      r,
                      draft.startDate,
                      draft.durationMonths
                    )
                  );
                }}
              />
            );
          })()}

        {tab === "booking" &&
          tab4Route === "booking-done" &&
          bookingResidenceId &&
          bookingDraft &&
          (() => {
            const r = recommendedResidences.find(
              (x) => x.id === bookingResidenceId
            );
            if (!r) return null;
            return (
              <BookingDoneScreen
                residence={r}
                draft={bookingDraft}
                onBackToList={() => {
                  // 레지던스 예약 리스트로 복귀
                  setBookingResidenceId(null);
                  setBookingDraft(null);
                  setTab4Route("booking");
                  setTab("booking");
                }}
                onGoHome={() => {
                  setBookingResidenceId(null);
                  setBookingDraft(null);
                  setTab4Route("booking");
                  setTab("simulation");
                }}
              />
            );
          })()}
      </main>

      <BottomNav
        active={tab}
        onChange={handleTabChange}
      />

      {/* 우편함 미션 모달 — 미션 리스트에서 우편함 카드 누른 경우 */}
      <MailboxModal
        open={mailboxFromMission}
        story={selected ? storiesByResidenceId[selected.id] ?? null : null}
        onClose={handleMailboxMissionClose}
      />

      {/* 이주 리포트 시네마틱 — 풀스크린 모달 */}
      {cinematicResidenceId && (() => {
        const residence = residences.find((r) => r.id === cinematicResidenceId);
        const rec = regionProgress[cinematicResidenceId];
        const report = rec?.migrationReport;
        if (!residence || !report) return null;
        return (
          <MigrationReportCinematic
            residence={residence}
            report={report}
            isFirstView={!report.hasBeenViewed}
            onClose={handleCloseCinematic}
            onApplyResidence={() => {
              // 이주 리포트 끝나면 "진짜 가보기" CTA → 예약 탭의 해당 레지던스 상세로.
              // (옛 흐름: MoveInScreen으로 현재 거주지를 바꿈 → 제거)
              handleCloseCinematic();
              setBookingResidenceId(residence.id);
              setTab4Route("booking-detail");
              setTab("booking");
            }}
          />
        );
      })()}
    </div>
  );
}
