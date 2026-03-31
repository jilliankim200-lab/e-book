import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface SpotlightRect { top: number; left: number; width: number; height: number; }

interface DemoState {
  message: string;
  spotlight: SpotlightRect | null;
  messagePosition: "top" | "bottom" | "center" | "right";
}

interface DemoStep {
  delay: number;
  message?: string;
  messagePosition?: "top" | "bottom" | "center" | "right";
  action?: () => void;
  spotlight?: () => SpotlightRect | null;
  clickSelector?: string;
}

function rect(el: Element | null, pad = 6): SpotlightRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
}

function qs(s: string) { return document.querySelector(s) as HTMLElement | null; }
function scrollTo(s: string) { qs(s)?.scrollIntoView({ behavior: "smooth", block: "center" }); }

function btnByText(text: string): HTMLElement | null {
  for (const b of document.querySelectorAll("button")) {
    if (b.textContent?.trim().includes(text)) return b as HTMLElement;
  }
  return null;
}

function panelScroll(top: number) { qs(".action-panel")?.scrollTo({ top, behavior: "smooth" }); }

// sim-input-row 안에서 label 포함하는 행의 teal 인풋 또는 일반 인풋 찾기
function findInputRow(label: string): HTMLElement | null {
  const rows = document.querySelectorAll(".sim-input-row");
  for (const row of rows) {
    if (row.textContent?.includes(label)) {
      // 행 전체를 리턴 (인풋 포함)
      return row as HTMLElement;
    }
  }
  return null;
}

function findAppliedInputs(): HTMLElement[] {
  const results: HTMLElement[] = [];
  document.querySelectorAll("input").forEach(inp => {
    const bg = inp.style.background || inp.style.backgroundColor;
    if (bg && (bg.includes("00b1bb") || bg.includes("rgb(0, 177, 187)"))) results.push(inp);
  });
  return results;
}

// ==================== Hook ====================
export function useAutoDemo(onComplete?: () => void) {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [demoState, setDemoState] = useState<DemoState>({ message: "", spotlight: null, messagePosition: "center" });
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 1.5x, 2x
  const stoppedRef = useRef(false);
  const speedRef = useRef(1);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const buildSteps = useCallback((): DemoStep[] => {
    return [
      { delay: 300, message: "탈출지도 데모를 시작합니다", messagePosition: "center" },

      // ── 시나리오 선택 ──
      {
        delay: 1700,
        message: "나와 비슷한 시나리오를 선택해볼게요",
        messagePosition: "top",
        action: () => scrollTo(".preset-dropdown"),
        spotlight: () => rect(qs(".preset-dropdown")),
      },
      { delay: 1300, clickSelector: ".preset-dropdown > button", spotlight: () => rect(qs(".preset-dropdown")) },
      {
        delay: 800,
        message: "35세 싱글 시나리오",
        messagePosition: "top",
        spotlight: () => {
          const items = document.querySelectorAll(".preset-dropdown > div > div");
          return items.length > 0 ? rect(items[0], 4) : null;
        },
      },
      {
        delay: 1000,
        action: () => {
          const items = document.querySelectorAll(".preset-dropdown > div > div");
          if (items.length > 0) (items[0] as HTMLElement).click();
        },
      },

      // ── 설명 박스 ──
      { delay: 1000, message: "정보가 자동으로 채워졌어요\n바로 계산해볼게요!", messagePosition: "top", spotlight: () => rect(qs(".preset-desc-layout")) },

      // ── 바로 계산 ──
      {
        delay: 1700, message: "계산하기!", messagePosition: "top",
        action: () => {
          const btn = qs(".calc-btn") || btnByText("계산하기");
          if (btn) btn.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        spotlight: () => rect(qs(".calc-btn") || btnByText("계산하기"), 4),
      },
      {
        delay: 1000,
        action: () => { (qs(".calc-btn") || btnByText("계산하기"))?.click(); },
      },

      // ── 결과: 실패 (우측 패널) ──
      {
        delay: 1700, message: "분석 결과가 나왔어요", messagePosition: "right",
        action: () => panelScroll(0), spotlight: () => rect(qs(".action-panel")),
      },
      {
        delay: 2300,
        message: "현재 조건에서는 자산이 부족해요\n\n55세 은퇴 후 국민연금(65세)까지\n10년 공백이 가장 위험한 구간이에요",
        messagePosition: "right",
        spotlight: () => rect(qs(".action-panel")),
      },

      // ── 계좌별 권장 잔액 확인 ──
      {
        delay: 2000, message: "계좌별로 얼마가 부족한지 확인해봐요", messagePosition: "right",
        action: () => panelScroll(400),
        spotlight: () => rect(qs(".action-panel")),
      },

      // ── 채우기 ──
      {
        delay: 2000, message: "채우기 버튼으로 부족분을 채워볼게요", messagePosition: "right",
        action: () => { const b = btnByText("채우기"); if (b) b.scrollIntoView({ behavior: "smooth", block: "center" }); },
        spotlight: () => rect(btnByText("채우기"), 4),
      },
      { delay: 1000, action: () => { const b = btnByText("채우기"); if (b) { b.click(); } } },
      { delay: 800, action: () => { const b = btnByText("채우기"); if (b) { b.click(); } } },
      { delay: 800, action: () => { const b = btnByText("채우기"); if (b) { b.click(); } } },
      { delay: 800, action: () => { const b = btnByText("채우기"); if (b) { b.click(); } } },

      // ── 채운 금액으로 다시 계산 (전략도 함께 반영) ──
      {
        delay: 1500, message: "채운 금액 + 제이의 전략을\n함께 반영해서 다시 계산해요!", messagePosition: "right",
        action: () => { const b = btnByText("채운 금액으로"); if (b) b.scrollIntoView({ behavior: "smooth", block: "center" }); },
        spotlight: () => rect(btnByText("채운 금액으로"), 4),
      },
      { delay: 1300, action: () => { btnByText("채운 금액으로")?.click(); } },

      // ── 성공 결과 확인 ──
      {
        delay: 1700, message: "성공! 탈출 계획이 완성되었어요", messagePosition: "right",
        action: () => panelScroll(0), spotlight: () => rect(qs(".action-panel")),
      },

      // ── 플랜 요약 확인 ──
      {
        delay: 2300,
        message: "제이가 조정한 은퇴 플랜을 확인해보세요\n은퇴 나이, 생활비, 국민연금이\n어떻게 바뀌었는지 한눈에 볼 수 있어요",
        messagePosition: "right",
        action: () => panelScroll(200),
        spotlight: () => rect(qs(".action-panel")),
      },

      // ── 마무리 ──
      {
        delay: 2500,
        message: "숫자를 조금만 조정해도\n결과가 크게 달라진답니다!\n\n직접 나의 정보를 입력해보세요",
        messagePosition: "center",
      },
      { delay: 2500, action: () => {} },
    ];
  }, []);

  const startDemo = useCallback(() => {
    stoppedRef.current = false; setIsRunning(true); setStepIndex(0);
    setDemoState({ message: "", spotlight: null, messagePosition: "center" });
  }, []);

  const stopDemo = useCallback(() => {
    stoppedRef.current = true; setIsRunning(false); setStepIndex(-1);
    setDemoState({ message: "", spotlight: null, messagePosition: "center" });
  }, []);

  useEffect(() => {
    if (!isRunning || stepIndex < 0 || stoppedRef.current) return;
    const steps = buildSteps();
    if (stepIndex >= steps.length) { stopDemo(); onComplete?.(); return; }
    const step = steps[stepIndex];
    const adjustedDelay = Math.max(300, step.delay / speedRef.current);
    const timer = setTimeout(() => {
      if (stoppedRef.current) return;
      if (step.action) step.action();
      if (step.clickSelector) qs(step.clickSelector)?.click();
      setTimeout(() => {
        if (stoppedRef.current) return;
        setDemoState({
          message: step.message || "",
          spotlight: step.spotlight ? step.spotlight() : null,
          messagePosition: step.messagePosition || "center",
        });
      }, 400);
      setStepIndex(prev => prev + 1);
    }, adjustedDelay);
    return () => clearTimeout(timer);
  }, [isRunning, stepIndex, buildSteps, stopDemo, onComplete]);

  return { isRunning, startDemo, stopDemo, demoState, speed, setSpeed };
}

// ==================== Overlay ====================
export function DemoOverlay({ demoState, onStop, speed, onSpeedChange }: { demoState: DemoState; onStop: () => void; speed: number; onSpeedChange: (s: number) => void }) {
  const { message, spotlight: sp, messagePosition } = demoState;
  const [msgVisible, setMsgVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState("");
  const [displayPos, setDisplayPos] = useState<"top" | "bottom" | "center" | "right">("center");
  const prevMsgRef = useRef("");
  const lastSpotlightRef = useRef<SpotlightRect | null>(null);

  // sp가 있으면 마지막 위치 저장
  useEffect(() => {
    if (sp) lastSpotlightRef.current = sp;
  }, [sp]);

  // 메시지 변경 시 fade out → 교체 → fade in
  useEffect(() => {
    if (message === prevMsgRef.current) return;
    prevMsgRef.current = message;

    if (!message) {
      setMsgVisible(false);
      return;
    }

    // fade out
    setMsgVisible(false);
    const t = setTimeout(() => {
      setDisplayMsg(message);
      setDisplayPos(messagePosition);
      setMsgVisible(true);
    }, 300);
    return () => clearTimeout(t);
  }, [message, messagePosition]);

  // spotlight 위치: sp가 없으면 마지막 위치 유지 (중앙 축소 방지)
  const activeSp = sp || lastSpotlightRef.current;
  const spRadius = activeSp ? Math.min(14, Math.min(activeSp.width, activeSp.height) / 3) : 0;
  const spStyle: React.CSSProperties = activeSp
    ? { top: activeSp.top, left: activeSp.left, width: activeSp.width, height: activeSp.height, borderRadius: spRadius }
    : { top: "50%", left: "50%", width: 0, height: 0, borderRadius: "50%" };

  // 메시지 위치
  const getMsgPos = (): React.CSSProperties => {
    if (displayPos === "right") {
      const panel = qs(".action-panel");
      if (panel) {
        const pr = panel.getBoundingClientRect();
        return { top: pr.top + 80, left: pr.left - 20, transform: "translateX(-100%)" };
      }
    }
    if (displayPos === "top") return { top: 60, left: "50%", transform: "translateX(-50%)" };
    if (displayPos === "bottom") return { bottom: 80, left: "50%", transform: "translateX(-50%)" };
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 19999, pointerEvents: "none" }}>
      {/* spotlight 구멍 — box-shadow로 주변을 어둡게, transition으로 부드럽게 이동 */}
      <div
        className="demo-spotlight"
        style={{
          position: "absolute",
          ...spStyle,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
        }}
      />

      {/* spotlight 테두리 */}
      {activeSp && (
        <div style={{
          position: "absolute", top: activeSp.top, left: activeSp.left, width: activeSp.width, height: activeSp.height,
          borderRadius: spRadius,
          border: "2px solid rgba(255,255,255,0.35)",
          pointerEvents: "none",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      )}

      {/* 메시지 — fade in/out */}
      {displayMsg && (
        <div style={{
          position: "absolute", ...getMsgPos(),
          padding: "16px 28px", borderRadius: 14,
          background: "rgba(0,0,0,0.82)", color: "#fff",
          fontSize: 16, fontWeight: 600, lineHeight: 1.7,
          textAlign: "center" as const, whiteSpace: "pre-line" as const,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)", maxWidth: 400,
          pointerEvents: "none" as const,
          opacity: msgVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          {displayMsg}
        </div>
      )}

      {/* 하단 컨트롤 */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto",
      }}>
        {/* 배속 */}
        <div style={{
          display: "flex", gap: 2, padding: 3, borderRadius: 50,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          border: "2px solid rgba(255,255,255,0.15)",
        }}>
          {[0.5, 1, 1.5, 2].map(s => (
            <button key={s} onClick={() => onSpeedChange(s)} style={{
              padding: "6px 10px", borderRadius: 50, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: speed === s ? 700 : 500,
              background: speed === s ? "rgba(255,255,255,0.2)" : "transparent",
              color: speed === s ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "all 0.15s",
            }}>
              {s}x
            </button>
          ))}
        </div>

        {/* 정지 */}
        <button onClick={onStop} style={{
          padding: "10px 24px", borderRadius: 50,
          border: "2px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.7)",
          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize: 10 }}>■</span> 데모 중지
        </button>
      </div>
    </div>,
    document.body
  );
}
