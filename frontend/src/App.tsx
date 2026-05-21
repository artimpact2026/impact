// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import MissionListScreen from "./screens/MissionListScreen";
import MissionExecuteScreen from "./screens/MissionExecuteScreen";
import RouteSummaryScreen from "./screens/RouteSummaryScreen";
import JourneyScreen from "./screens/JourneyScreen";
import MigrationReportScreen from "./screens/MigrationReportScreen";
import MoveInScreen from "./screens/MoveInScreen";
import HospitalMissionScreen from "./screens/mission/HospitalMissionScreen";
import OnboardingShell, {
  type OnboardingResult,
} from "./screens/onboarding/OnboardingShell";
import BottomNav, { type TabKey } from "./components/BottomNav";
import {
  residences,
  type Residence,
  type LifeStyleType,
} from "./data/residences";
import { HOME_POSITIONS, type RegionPos } from "./data/regions";
import { baseMissions, type Mission } from "./data/missions";
import {
  bumpVisit,
  completeMissionFor,
  type RegionRecord,
} from "./data/journey";

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
  | "mission-list"
  | "mission-execute"
  | "route-summary";

// 탭2 화면 흐름
type Tab2Route = "journey" | "report" | "move-in";

// localStorage 키
const PROFILE_KEY = "cheongpung.onboarding.v1";
const PROGRESS_KEY = "cheongpung.progress.v1";

type SavedProfile = {
  homeRegionName: string;
  lifestyle: LifeStyleType;
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
    /* 저장 실패 무시 */
  }
}

export default function App() {
  // 훅은 모두 조건부 리턴보다 먼저
  const hash = useHashRoute();
  const [profile, setProfile] = useState<SavedProfile | null>(() => loadProfile());
  const [tab, setTab] = useState<TabKey>("home");
  const [tab1Route, setTab1Route] = useState<Tab1Route>("home");
  const [tab2Route, setTab2Route] = useState<Tab2Route>("journey");
  const [selected, setSelected] = useState<Residence | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [regionProgress, setRegionProgress] = useState<
    Record<string, RegionRecord>
  >(() => loadProgress());
  // 탭2에서 리포트 보기로 들어간 지역
  const [reportResidenceId, setReportResidenceId] = useState<string | null>(
    null
  );
  // 이주 결정한 지역 (move-in 화면용)
  const [moveInResidenceId, setMoveInResidenceId] = useState<string | null>(
    null
  );

  // 진행 상태 변경 시 localStorage에 영속
  useEffect(() => {
    saveProgress(regionProgress);
  }, [regionProgress]);

  // 데모 편의: 콘솔 cheongpung.reset() — 온보딩 + 진행 상태 초기화
  useEffect(() => {
    (window as unknown as { cheongpung?: { reset: () => void } }).cheongpung = {
      reset: () => {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(PROGRESS_KEY);
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab2Route("journey");
        setTab("home");
        setActiveMission(null);
        setRegionProgress({});
        setReportResidenceId(null);
        setMoveInResidenceId(null);
      },
    };
  }, []);

  if (hash === "#hospital") return <HospitalMissionScreen />;

  const handleOnboardingComplete = (r: OnboardingResult) => {
    // 새 온보딩은 본 지역을 묻지 않음 — 기본 "서울"로 설정 (추후 설정에서 변경 가능)
    const next: SavedProfile = {
      homeRegionName: "서울",
      lifestyle: r.lifestyle,
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

  // 본 지역 좌표 — HOME_POSITIONS 우선, 없으면 residences 좌표 fallback
  const homeRegion = profile.homeRegionName;
  const matchedResidence = residences.find((r) => r.region === homeRegion);
  const homePos: RegionPos =
    HOME_POSITIONS[homeRegion] ??
    (matchedResidence
      ? { xPct: matchedResidence.xPct, yPct: matchedResidence.yPct }
      : HOME_POSITIONS["서울"]);

  // 현재 지역의 진행 데이터 (탭1 미션 화면용)
  const currentRecord = selected ? regionProgress[selected.id] : undefined;
  const currentCompletedIds = new Set(currentRecord?.completedMissionIds ?? []);
  const currentScore = currentRecord?.score ?? 0;

  const handleTabChange = (next: TabKey) => {
    if (next === "home" && tab1Route !== "traveling") setTab1Route("home");
    if (next === "journey") setTab2Route("journey");
    setTab(next);
  };

  // 도착 시 visit count +1
  const handleTravelComplete = () => {
    if (selected) {
      setRegionProgress((p) => bumpVisit(p, selected.id));
    }
    setTab1Route("arrival");
  };

  // 미션 완료 — 현재 지역에 점수 누적
  const handleMissionComplete = () => {
    if (!activeMission || !selected) return;
    const newProgress = completeMissionFor(
      regionProgress,
      selected.id,
      activeMission
    );
    setRegionProgress(newProgress);
    setActiveMission(null);

    const updatedRecord = newProgress[selected.id];
    const allDone = baseMissions.every((m) =>
      updatedRecord?.completedMissionIds.includes(m.id)
    );
    setTab1Route(allDone ? "route-summary" : "mission-list");
  };

  // 탭2 리포트 진입
  const handleOpenReport = (residence: Residence) => {
    setReportResidenceId(residence.id);
    setTab2Route("report");
  };

  // 이주 결정 → MoveIn 화면
  const handleDecideMove = () => {
    if (!reportResidenceId) return;
    setMoveInResidenceId(reportResidenceId);
    setTab2Route("move-in");
  };

  // MoveIn → 홈 (profile.homeRegionName 변경, 홈 탭으로 복귀)
  const handleMoveInDone = () => {
    if (!moveInResidenceId) return;
    const res = residences.find((r) => r.id === moveInResidenceId);
    if (!res) return;
    const next: SavedProfile = {
      ...profile,
      homeRegionName: res.region,
    };
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
    setTab("home");
    setTab2Route("journey");
  };

  // 탭2 리포트/이주 결정용 지역 조회
  const reportResidence = reportResidenceId
    ? residences.find((r) => r.id === reportResidenceId)
    : null;
  const moveInResidence = moveInResidenceId
    ? residences.find((r) => r.id === moveInResidenceId)
    : null;

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      <main className="min-h-screen pb-24">
        {/* ===== 탭1 ===== */}
        {tab === "home" && tab1Route === "home" && (
          <HomeScreen
            homeRegion={homeRegion}
            onDepart={() => setTab1Route("departure")}
          />
        )}

        {tab === "home" && tab1Route === "departure" && (
          <DepartureScreen
            homeRegion={homeRegion}
            onBack={() => setTab1Route("home")}
            onDepart={(r: Residence) => {
              setSelected(r);
              setTab1Route("traveling");
            }}
          />
        )}

        {tab === "home" && tab1Route === "traveling" && selected && (
          <TravelingScreen
            origin={{ ...homePos, region: homeRegion }}
            destination={selected}
            onComplete={handleTravelComplete}
          />
        )}

        {tab === "home" && tab1Route === "arrival" && selected && (
          <ArrivalScreen
            residence={selected}
            onBack={() => {
              setSelected(null);
              setTab1Route("home");
            }}
            onStartMissions={() => setTab1Route("mission-list")}
          />
        )}

        {tab === "home" && tab1Route === "mission-list" && selected && (
          <MissionListScreen
            region={selected.region}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            onBack={() => setTab1Route("arrival")}
            onSelectMission={(m) => {
              setActiveMission(m);
              setTab1Route("mission-execute");
            }}
            onSelectFinal={() => setTab1Route("route-summary")}
          />
        )}

        {tab === "home" &&
          tab1Route === "mission-execute" &&
          activeMission && (
            <MissionExecuteScreen
              mission={activeMission}
              onClose={() => {
                setActiveMission(null);
                setTab1Route("mission-list");
              }}
              onComplete={handleMissionComplete}
            />
          )}

        {tab === "home" && tab1Route === "route-summary" && selected && (
          <RouteSummaryScreen
            region={selected.region}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            onClose={() => setTab1Route("mission-list")}
          />
        )}

        {/* ===== 탭2 ===== */}
        {tab === "journey" && tab2Route === "journey" && (
          <JourneyScreen
            regionProgress={regionProgress}
            lifestyle={profile.lifestyle}
            onOpenReport={handleOpenReport}
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
            />
          )}

        {tab === "journey" && tab2Route === "move-in" && moveInResidence && (
          <MoveInScreen
            residence={moveInResidence}
            onGoHome={handleMoveInDone}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
