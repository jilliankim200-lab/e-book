import React, { useState, useEffect, useRef, useCallback } from "react";
import { CashFlow } from "../은퇴계산기";
import { ActionPlan } from "./ActionPlan";
import { EBook2 } from "./EBook2";
import { EBook3 } from "./EBook3";
import { SimGuide } from "./SimGuide";
import { Welcome } from "./Welcome";
import { AuthorNote } from "./AuthorNote";
import {
  Calculator,
  Compass,
  Users,
  Pen,
  Menu,
  BookOpen,
  Coffee,
  Sun,
  Map,
  PanelRightOpen,
  PanelRightClose,
  Play,
} from "lucide-react";
import { useAutoDemo, DemoOverlay } from "./AutoDemo";
import { FaqChatbot } from "./FaqChatbot";

type Page = "welcome" | "retirement-calc" | "sim-guide" | "ebook2" | "ebook3" | "author";

const MENU_ITEMS = [
  { id: "retirement-calc" as Page, label: "탈출지도", icon: Calculator },
  { id: "sim-guide" as Page, label: "탈출지도 사용법", icon: BookOpen },
  { id: "ebook2" as Page, label: "실전 전략 가이드", icon: Compass },
  { id: "ebook3" as Page, label: "사례로 배우기", icon: Users },
  { id: "author" as Page, label: "MAKER: 지독한 J의 기록", icon: Pen },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("welcome");
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(window.innerWidth > 768);

  const [simResults, setSimResults] = useState<any[]>([]);
  const [isFireSuccess, setIsFireSuccess] = useState(true);
  const [assetDepletionAge, setAssetDepletionAge] = useState<number | null>(null);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [simInputs, setSimInputs] = useState<any>(null);
  const [originalSimInputs, setOriginalSimInputs] = useState<any>(null);
  const [pendingStrategyChanges, setPendingStrategyChanges] = useState<any[] | null>(null);
  const [autoRecalculate, setAutoRecalculate] = useState(false);
  const [triggerRecalc, setTriggerRecalc] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(2);
  const [showDemoBanner, setShowDemoBanner] = useState(!localStorage.getItem("demo-banner-dismissed"));
  const mainRef = useRef<HTMLDivElement>(null);

  const handleMainScroll = useCallback(() => {
    if (mainRef.current) {
      setIsScrolled(mainRef.current.scrollTop > 0);
    }
  }, []);

  const loadSimResults = () => {
    try {
      const saved = localStorage.getItem("cashFlowData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
          setSimResults(parsed.results);
          setIsFireSuccess(parsed.isFireSuccess ?? true);
          setAssetDepletionAge(parsed.assetDepletionAge ?? null);
          if (parsed.inputs) setSimInputs(parsed.inputs);
        }
      }
    } catch (e) {
      console.error("Failed to load simulation results:", e);
    }
  };

  useEffect(() => {
    loadSimResults();

    // 폰트 사이즈 offset 복원
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // 모바일: 항상 가장 큰 폰트
      setFontSizeOffset(2);
      document.documentElement.style.setProperty("--font-size-offset", "2px");
      setIsLeftSidebarOpen(false);
    } else {
      const savedOffset = localStorage.getItem("fontSizeOffset");
      if (savedOffset) {
        const offset = parseInt(savedOffset);
        setFontSizeOffset(offset);
        document.documentElement.style.setProperty("--font-size-offset", `${offset}px`);
      }
    }
  }, []);

  const FONT_LEVELS = [
    { label: "가", offset: 0 },
    { label: "가", offset: 2 },
  ];

  const setFontLevel = (offset: number) => {
    setFontSizeOffset(offset);
    document.documentElement.style.setProperty("--font-size-offset", `${offset}px`);
    localStorage.setItem("fontSizeOffset", String(offset));
  };

  useEffect(() => {
    setIsScrolled(false);
    if (currentPage === "retirement-calc") {
      loadSimResults();
    }
  }, [currentPage]);


  const getGreetingIcon = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { Icon: Coffee, text: "Good Morning" };
    if (h >= 12 && h < 18) return { Icon: Sun, text: "Good Afternoon" };
    return { Icon: Coffee, text: "Good Evening" };
  };

  const greeting = getGreetingIcon();

  const { isRunning: isDemoRunning, startDemo, stopDemo, demoState, speed: demoSpeed, setSpeed: setDemoSpeed } = useAutoDemo(() => {
    // 데모 완료 시 처리
  });

  const handleStartDemo = () => {
    setCurrentPage("retirement-calc");
    setTimeout(() => startDemo(), 500);
  };


  const handleSimulationComplete = (data?: { results: any[]; isFireSuccess: boolean; assetDepletionAge: number | null; inputs?: any }) => {
    if (data && data.results.length > 0) {
      setSimResults(data.results);
      setIsFireSuccess(data.isFireSuccess);
      setAssetDepletionAge(data.assetDepletionAge);
      if (data.inputs) {
        if (!originalSimInputs) setOriginalSimInputs(data.inputs);
        setSimInputs(data.inputs);
      }
      setShowActionPanel(true);
    } else if (data && data.results.length === 0) {
      setSimResults([]);
      setSimInputs(null);
      setOriginalSimInputs(null);
      setShowActionPanel(false);
    } else {
      loadSimResults();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "welcome":
        return <div style={{ height: "100%", overflow: "auto" }}><Welcome onNavigate={(page) => setCurrentPage(page as Page)} /></div>;
      case "retirement-calc":
        return (
          <div className="auto-hide-scrollbar" style={{ height: "100%", overflowY: "auto" }} onScroll={(e) => setIsScrolled((e.target as HTMLElement).scrollTop > 0)}>
            <CashFlow onSimulationComplete={handleSimulationComplete} pendingStrategyChanges={pendingStrategyChanges} autoRecalculate={autoRecalculate} onStrategyApplied={() => { setPendingStrategyChanges(null); setAutoRecalculate(false); }} onInputDirty={() => { setShowActionPanel(false); setSimResults([]); }} triggerRecalc={triggerRecalc} />
          </div>
        );
      case "sim-guide":
        return <div style={{ height: "100%", overflowY: "auto" }} onScroll={(e) => setIsScrolled((e.target as HTMLElement).scrollTop > 0)}><SimGuide onNavigate={(page) => setCurrentPage(page as Page)} /></div>;
      case "ebook2":
        return <div style={{ height: "100%", overflowY: "auto" }} onScroll={(e) => setIsScrolled((e.target as HTMLElement).scrollTop > 0)}><EBook2 onNavigate={(page) => setCurrentPage(page as Page)} /></div>;
      case "ebook3":
        return <div style={{ height: "100%", overflowY: "auto" }} onScroll={(e) => setIsScrolled((e.target as HTMLElement).scrollTop > 0)}><EBook3 onNavigate={(page) => setCurrentPage(page as Page)} /></div>;
      case "author":
        return <div style={{ height: "100%", overflowY: "auto" }} onScroll={(e) => setIsScrolled((e.target as HTMLElement).scrollTop > 0)}><AuthorNote onNavigate={(page) => setCurrentPage(page as Page)} /></div>;
      default:
        return <CashFlow />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)" }}>
      {/* Sidebar Overlay (모바일) */}
      {isLeftSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsLeftSidebarOpen(false)}
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 199,
          }}
        />
      )}
      {/* Sidebar */}
      <aside
        className="app-sidebar"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isLeftSidebarOpen ? 240 : 0,
          flexShrink: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          background: "var(--bg-primary)",
          borderRight: isLeftSidebarOpen ? "1px solid var(--border-secondary)" : "none",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
        }}
      >
        {/* Logo + 닫기(모바일) */}
        <div
          style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 20, paddingRight: 12 }}
        >
          <div
            onClick={() => { setCurrentPage("retirement-calc"); if (window.innerWidth <= 768) setIsLeftSidebarOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #3182F6, #6366f1)",
              }}
            >
              <Map size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>탈출로드맵</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={(e) => { e.stopPropagation(); setIsLeftSidebarOpen(false); }}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8, color: "var(--text-secondary)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav style={{ padding: "8px 12px", flex: 1 }}>
          {MENU_ITEMS.map((item) => {
            const active = currentPage === item.id;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(item.id); if (window.innerWidth <= 768) setIsLeftSidebarOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 2,
                  transition: "background 0.15s",
                  background: active ? "var(--bg-tertiary)" : "transparent",
                  color: active ? "var(--accent-blue)" : "var(--text-tertiary)",
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = active ? "var(--bg-tertiary)" : "transparent";
                }}
              >
                <IconComp
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  color={active ? "var(--accent-blue)" : "var(--text-tertiary)"}
                />
                <span style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid var(--border-secondary)" }}>
          <button
            onClick={() => { sessionStorage.removeItem("ebook_access_granted"); sessionStorage.removeItem("ebook_user_role"); window.location.reload(); }}
            style={{
              width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 500,
              color: "var(--text-tertiary)", background: "transparent",
              border: "1px solid var(--border-primary)", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
            }}
          >
            로그아웃
          </button>
          <div style={{ fontSize: 10, color: "var(--text-disabled)", lineHeight: 1.5 }}>
            &copy; 탈출로드맵. All rights reserved.<br />
            무단 복제 및 배포를 금지합니다.
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Header + Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* 데모 배너 — 헤더 위 고정 띠 */}
        {showDemoBanner && currentPage === "retirement-calc" && !isDemoRunning && window.innerWidth > 768 && (
          <div
            id="demo-banner"
            onClick={handleStartDemo}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "8px 40px 8px 20px", flexShrink: 0,
              background: "#1e293b", cursor: "pointer",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>처음이신가요?</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
              ▶ 데모 보기
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>1분 안에 사용법을 알려드려요</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDemoBanner(false); localStorage.setItem("demo-banner-dismissed", "1"); }}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 18, padding: 4, lineHeight: 1 }}
            >×</button>
          </div>
        )}

        {/* Header */}
        <header
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-secondary)",
            flexShrink: 0,
            boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "box-shadow 0.2s ease",
            zIndex: 5,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsLeftSidebarOpen((prev) => !prev)}
              style={{
                padding: 6,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: "var(--text-secondary)",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              title={isLeftSidebarOpen ? "메뉴 접기" : "메뉴 펼치기"}
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <div className="header-greeting" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-tertiary)",
                }}
              >
                <greeting.Icon size={15} strokeWidth={1.8} color="var(--text-primary)" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                {greeting.text}
              </span>
            </div>
          </div>
          {/* 모바일 전용 페이지 제목 */}
          <span className="mobile-page-title" style={{ display: "none", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", position: "absolute", left: "50%", transform: "translateX(-50%)", letterSpacing: "-0.5px" }}>
            {MENU_ITEMS.find(m => m.id === currentPage)?.label || (currentPage === "welcome" ? "탈출로드맵" : "")}
          </span>

          {/* Right buttons */}
          <div className="header-right-btns" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {currentPage === "retirement-calc" && simResults.length > 0 && (
              <button
                onClick={() => setShowActionPanel((prev) => !prev)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: showActionPanel ? "var(--accent-blue-bg)" : "transparent",
                  color: showActionPanel ? "var(--accent-blue)" : "var(--text-secondary)",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = showActionPanel ? "var(--accent-blue-bg)" : "var(--bg-tertiary)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = showActionPanel ? "var(--accent-blue-bg)" : "transparent")}
                title={showActionPanel ? "Action Plan 닫기" : "Action Plan 열기"}
              >
                {showActionPanel ? <PanelRightClose size={18} strokeWidth={1.8} /> : <PanelRightOpen size={18} strokeWidth={1.8} />}
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 2, borderRadius: 8, background: "var(--bg-secondary)", padding: "3px 4px" }}>
              {FONT_LEVELS.map((level, i) => {
                const isActive = fontSizeOffset === level.offset;
                return (
                  <button
                    key={i}
                    onClick={() => setFontLevel(level.offset)}
                    style={{
                      padding: "2px 6px", borderRadius: 6, border: "none",
                      cursor: "pointer", fontFamily: "inherit",
                      fontSize: [11, 13, 15][i], fontWeight: isActive ? 700 : 500,
                      background: isActive ? "var(--accent-blue)" : "transparent",
                      color: isActive ? "#fff" : "var(--text-tertiary)",
                      transition: "all 0.15s", lineHeight: 1.4,
                    }}
                    title={["작게", "기본", "크게"][i]}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "hidden", background: "var(--bg-primary)", zoom: fontSizeOffset === -1 ? 0.92 : fontSizeOffset === 2 ? 1.12 : 1, position: "relative" }}>
          {renderPage()}
        </main>
        </div>

        {/* Right: ActionPanel (전체 높이) */}
        <div className="action-panel" style={{
          width: showActionPanel && simResults.length > 0 && currentPage === 'retirement-calc' ? 520 : 0,
          flexShrink: 0,
          overflowY: "auto",
          overflowX: "hidden",
          borderLeft: showActionPanel && simResults.length > 0 && currentPage === 'retirement-calc' ? "1px solid var(--border-primary)" : "none",
          background: "var(--bg-secondary)",
          boxShadow: "none",
          transition: "width 0.25s ease",
          zoom: fontSizeOffset === -1 ? 0.92 : fontSizeOffset === 2 ? 1.12 : 1,
        }}>
          {simResults.length > 0 && (
            <ActionPlan
              results={simResults}
              isFireSuccess={isFireSuccess}
              assetDepletionAge={assetDepletionAge}
              inputs={simInputs}
              originalInputs={originalSimInputs}
              onApplyStrategies={(changes, auto) => { setPendingStrategyChanges(changes); if (auto) setAutoRecalculate(true); }}
              onRecalculate={() => setTriggerRecalc(prev => prev + 1)}
              onClose={() => setShowActionPanel(false)}
            />
          )}
        </div>
      </div>
      <FaqChatbot hidden={isDemoRunning || (showActionPanel && simResults.length > 0)} />
      {isDemoRunning && <DemoOverlay demoState={demoState} onStop={stopDemo} speed={demoSpeed} onSpeedChange={setDemoSpeed} />}
    </div>
  );
}
