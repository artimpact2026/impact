// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ResidenceHomeScreen from "./screens/ResidenceHomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import MissionListScreen from "./screens/MissionListScreen";
import MissionTravelingScreen from "./screens/MissionTravelingScreen";
import MissionExecuteScreen from "./screens/MissionExecuteScreen";
import DayEndCeremonyScreen from "./screens/DayEndCeremonyScreen";
import MigrationReportCinematic from "./screens/MigrationReportCinematic";
import JourneyScreen from "./screens/JourneyScreen";
import MigrationReportScreen from "./screens/MigrationReportScreen";
import MoveInScreen from "./screens/MoveInScreen";
import ResidenceListScreen from "./screens/ResidenceListScreen";
import ResidenceDetailScreen from "./screens/ResidenceDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";
import DiscoverScreen, { type DiscoverSubTab } from "./screens/DiscoverScreen";
import CommunityScreen from "./screens/CommunityScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LetterScreen from "./screens/LetterScreen";
import {
  getInitialLetters,
  loadLetters,
  makeArrivalLetter,
  makeBookingConfirmedLetter,
  makeDayCompleteLetter,
  makeNextDayLetter,
  makeReportLetter,
  saveLetters,
  unreadCount,
  type Letter,
} from "./data/letters";
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
  completeMissionFor,
  type RegionRecord,
} from "./data/journey";
import {
  generateMigrationReport,
  markReportViewed,
  saveReport,
} from "./data/migrationReport";
import { missionsForResidence } from "./data/regionMissions";
import {
  buildDayPlan,
  houseStageFromProgress,
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

// 탭1 화면 흐름
type Tab1Route =
  | "home"
  | "departure"
  | "traveling"
  | "arrival"
  | "residence-home"
  | "mission-list"
  | "mission-traveling"
  | "mission-execute"
  | "traveling-back"
  | "day-end-ceremony";

// 탭2 화면 흐름
type Tab2Route =
  | "journey"
  | "report"
  | "move-in"
  | "settings"
  | "residence-list"
  | "residence-detail";

// 탭3(커뮤니티) 화면 흐름 — 골격 단계, 추후 detail/write 등 확장
type Tab3Route = "discover" | "community-list";

// 탭4(레지던스 예약) 화면 흐름
type Tab4Route = "booking" | "booking-detail" | "booking-form" | "booking-done";

// localStorage 키
const PROFILE_KEY = "cheongpung.onboarding.v1";
const PROGRESS_KEY = "cheongpung.progress.v1";
const LIKED_KEY = "cheongpung.bookingLiked.v1";
const LETTERS_KEY = "cheongpung.letters.v1"; // letters.ts와 동일 키 — reset에서 함께 제거

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
  const [tab3Route, setTab3Route] = useState<Tab3Route>("discover");
  // 발견 탭 내부 서브 토글 — 이야기 / 청년마을
  const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverSubTab>("stories");
  // 편지함 — localStorage 영속. 첫 진입자는 환영 편지 시드.
  const [letters, setLetters] = useState<Letter[]>(() => {
    const saved = loadLetters();
    return saved.length > 0 ? saved : getInitialLetters();
  });
  const [tab4Route, setTab4Route] = useState<Tab4Route>("booking");
  const [selected, setSelected] = useState<Residence | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
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

  // 좋아요한 청년마을 localStorage 영속
  useEffect(() => {
    saveLiked(bookingLiked);
  }, [bookingLiked]);

  // 편지함 localStorage 영속
  useEffect(() => {
    saveLetters(letters);
  }, [letters]);

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
        setLetters(getInitialLetters());
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab2Route("journey");
        setTab3Route("discover");
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
        setSelected(target);
        setActiveMission(null);
        setTab("simulation");
        setTab1Route("day-end-ceremony");
        console.log(
          `[cheongpung] ${target.region} 8/8 미션 완료 mock 적용 → 하루 끝 의식`
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
    };
    (window as unknown as { cheongpung?: typeof api }).cheongpung = api;
    console.log(
      "%c[cheongpung] 데모 헬퍼 준비됨 — reset() / skipTo(id?) / bumpDay(id?) / setDay(day, id?) / regions()",
      "color:#FF7043;font-weight:bold"
    );
  }, []);

  if (hash === "#hospital") return <HospitalMissionScreen />;

  const handleOnboardingComplete = (r: OnboardingResult) => {
    const email = r.data.email || "";
    const nickname = email.split("@")[0] || "여행자";
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

  // 현재 지역 진행 데이터
  const currentRecord = selected ? regionProgress[selected.id] : undefined;
  const currentCompletedIds = new Set(currentRecord?.completedMissionIds ?? []);
  const currentScore = currentRecord?.score ?? 0;

  // 현재 지역의 일차 계획
  const currentDayPlan = selected
    ? buildDayPlan(selected, missionsForResidence(selected.id))
    : null;
  const currentDay = currentRecord?.currentDay ?? 1;

  const handleTabChange = (next: TabKey) => {
    // 이동 애니메이션 중에는 무시
    const inTransit = tab1Route === "traveling" || tab1Route === "traveling-back";
    if (next === "simulation" && !inTransit) {
      // 강화도 등 마을에 체류 중이면 '홈'은 마을 홈(ArrivalScreen)
      if (selected) setTab1Route("arrival");
      else setTab1Route("home");
    }
    if (next === "journey") setTab2Route("journey");
    if (next === "discover") setTab3Route("discover");
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
    const newProgress = completeMissionFor(
      regionProgress,
      selected.id,
      activeMission,
      fitDelta,
      pickStats,
      pickedLabels
    );
    setRegionProgress(newProgress);
    setActiveMission(null);

    // 현재 일차의 모든 미션이 끝났는지 확인 → 하루 끝 의식으로
    const updatedRecord = newProgress[selected.id];
    const completedSet = new Set(updatedRecord?.completedMissionIds ?? []);
    const { missionsByDay } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const day = updatedRecord?.currentDay ?? 1;
    const dayDone = isDayComplete(missionsByDay, day, completedSet);
    setTab1Route(dayDone ? "day-end-ceremony" : "mission-list");
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
      // 일차 완료 편지 (방금 마친 cur일) + 다음 일차 안부 편지 (cur+1) 두 통.
      const doneCount =
        (currentRecord?.completedMissionIds.length ?? 0);
      addLetter(makeDayCompleteLetter(selected, cur, doneCount));
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
      setTab("discover");
      setTab3Route("discover");
    });

  // 이주 리포트 시네마틱 열기 — 캐시 없으면 생성
  const handleOpenCinematic = async (residence: Residence) => {
    const rec = regionProgress[residence.id];
    if (!rec) return;
    setCinematicLoading(true);
    try {
      let report = rec.migrationReport;
      if (!report) {
        const missions = missionsForResidence(residence.id);
        report = await generateMigrationReport(
          residence,
          rec,
          missions,
          profile?.lifestyle ?? null
        );
        setRegionProgress((p) => saveReport(p, residence.id, report!));
        // 이주 리포트 처음 생성될 때 — "먼저 온 이주자" 회고 편지 도착
        addLetter(makeReportLetter(residence));
      }
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

  // 미션 선택 시 mode에 따라 라우팅 분기
  const handleSelectMission = (m: Mission) => {
    setActiveMission(m);
    if (m.mode === "mailbox") {
      // 우편함은 별도 — 도착 화면의 모달 흐름과 동일하게 모달 노출
      setMailboxFromMission(true);
      return;
    }
    if (m.mode === "map-dialogue" || m.mode === "map-info") {
      setTab1Route("mission-traveling");
    } else {
      // dialogue / numeric — 바로 수행 화면
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
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      <main className="min-h-screen">
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

        {tab === "simulation" && tab1Route === "mission-list" && selected && (
          <MissionListScreen
            region={selected.region}
            residence={selected}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            fitScore={currentRecord?.fitScore ?? 0}
            currentDay={currentDay}
            onBack={() => setTab1Route("arrival")}
            onSelectMission={handleSelectMission}
          />
        )}

        {tab === "simulation" && tab1Route === "day-end-ceremony" && selected && currentDayPlan && (
          <DayEndCeremonyScreen
            region={selected.region}
            finishedDay={currentDay}
            totalDays={currentDayPlan.dayCount}
            prevStage={houseStageFromProgress(
              currentDay - 1,
              currentDayPlan.dayCount
            )}
            newStage={houseStageFromProgress(
              currentDay,
              currentDayPlan.dayCount
            )}
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
                      icon: "🗺️",
                      title: "나의 여정에서 진행 보기",
                      subtitle: "오늘까지 쌓인 흔적과 자라는 집",
                      onClick: handleCeremonyGoJourney,
                    },
                    {
                      icon: "💬",
                      title: "커뮤니티 가보기",
                      subtitle: "다른 사람들의 잠시섬 이야기",
                      onClick: handleCeremonyGoCommunity,
                    },
                  ]
            }
          />
        )}

        {tab === "simulation" && tab1Route === "mission-traveling" && activeMission && (
          <MissionTravelingScreen
            mission={activeMission}
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

        {/* ===== 탭3: 커뮤니티(이야기) — 골격 ===== */}
        {tab === "discover" && tab3Route === "discover" && (
          <DiscoverScreen
            subTab={discoverSubTab}
            onSubTabChange={setDiscoverSubTab}
            onSelectResidence={(r) => {
              setBookingResidenceId(r.id);
              setTab4Route("booking-detail");
              setTab("booking");
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
            onSeeAllStories={() => setTab3Route("community-list")}
            onSeeAllResidences={() => {
              setTab4Route("booking");
              setTab("booking");
            }}
          />
        )}

        {/* === 발견 → 전체 이야기 (옛 CommunityScreen) === */}
        {tab === "discover" && tab3Route === "community-list" && (
          <CommunityScreen onBack={() => setTab3Route("discover")} />
        )}

        {/* === 편지 탭 === */}
        {tab === "letter" && (
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
              setDiscoverSubTab("residences");
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
            onBack={() => setTab("discover")}
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
                  // 발견 탭의 청년마을 리스트로 복귀
                  setBookingResidenceId(null);
                  setTab4Route("booking");
                  setDiscoverSubTab("residences");
                  setTab("discover");
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
                  // 발견 탭 청년마을 리스트로 복귀
                  setBookingResidenceId(null);
                  setBookingDraft(null);
                  setTab4Route("booking");
                  setDiscoverSubTab("residences");
                  setTab("discover");
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
        letterUnread={unreadCount(letters)}
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
