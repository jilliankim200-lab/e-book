import { createRoot } from "react-dom/client";
import App from "./App";
import { PasswordGate2 as PasswordGate } from "./PasswordGate2";
import "./index.css";
import "./design-tokens.css";

// 모바일 기기 감지 (UA 기반) → 클래스 추가 + CSS 변수 설정
const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Fold|Flip/i.test(navigator.userAgent);
if (isMobileUA) {
  document.documentElement.classList.add("mobile-device");
  // 폴더블 등 넓은 모바일에서도 모바일 CSS가 적용되도록
  const style = document.createElement("style");
  style.textContent = `
    .mobile-device .app-sidebar {
      position: fixed !important;
      z-index: 200 !important;
      left: 0 !important;
      top: 0 !important;
      width: 80vw !important;
      max-width: 320px !important;
      height: 100vh !important;
      box-shadow: none !important;
      border-right: none !important;
      background: var(--bg-primary) !important;
      transform: translateX(-100%) !important;
      transition: transform 0.25s ease !important;
    }
    .mobile-device .app-sidebar[style*="width: 240"] {
      transform: translateX(0) !important;
    }
    .mobile-device .sidebar-overlay { display: block !important; z-index: 199 !important; }
    .mobile-device .sidebar-close-btn { display: flex !important; }
    .mobile-device .header-greeting { display: none !important; }
    .mobile-device .header-right-btns .font-size-group { display: none !important; }
    .mobile-device .mobile-page-title { display: block !important; }
    .mobile-device .page-title-section { display: none !important; }
    .mobile-device .mobile-pc-notice { display: block !important; }
    .mobile-device .action-panel[style*="width: 0"] { display: none !important; }
    .mobile-device .action-panel[style*="width: 520"] { display: block !important; position: fixed !important; left: 0 !important; right: 0 !important; top: 0 !important; width: 100vw !important; max-width: 100vw !important; height: 100vh !important; z-index: 60 !important; box-shadow: none !important; border-left: none !important; zoom: 1 !important; overflow-x: hidden !important; }
    .mobile-device .mobile-back-btn { display: block !important; }
    .mobile-device .sim-input-row { justify-content: space-between !important; gap: 8px !important; width: 100% !important; }
    .mobile-device .sim-input-row span { text-align: left !important; flex: 1 1 0 !important; white-space: normal !important; line-height: 1.4 !important; min-width: 0 !important; font-size: 15px !important; }
    .mobile-device .sim-input-row input { width: 140px !important; min-width: 140px !important; max-width: 140px !important; flex: 0 0 140px !important; margin-left: auto !important; font-size: 17px !important; }
    .mobile-device .sim-input-row span span { font-size: 13px !important; }
    .mobile-device .sim-toast { bottom: 32px !important; right: auto !important; left: 50% !important; transform: translateX(-50%) !important; }
    .mobile-device .preset-desc-layout { flex-direction: column !important; gap: 12px !important; }
    .mobile-device .preset-desc-layout > div:last-child { padding-left: 0 !important; border-left: none !important; padding-top: 12px !important; border-top: 1px solid rgba(49,130,246,0.15) !important; }
    .mobile-device .mobile-hide-label { display: none !important; }
    .mobile-device .result-metrics { grid-template-columns: 1fr !important; }
    .mobile-device .result-metrics > div { border-right: none !important; border-bottom: 1px solid var(--border-secondary) !important; text-align: left !important; }
    .mobile-device .result-metrics > div:last-child { border-bottom: none !important; }
    .mobile-device .asset-card input.strategy-applied { background: var(--bg-secondary) !important; border-color: var(--border-primary) !important; color: var(--text-primary) !important; }
    .mobile-device .action-panel { font-size: 15px !important; }
    .mobile-device .info-box { font-size: 15px !important; line-height: 1.9 !important; padding: 16px 18px !important; word-break: keep-all !important; }
    .mobile-device .header-panel-open { border-bottom: none !important; box-shadow: none !important; }
    .mobile-device .accum-pc-row { display: none !important; }
    .mobile-device .accum-mobile-row { display: flex !important; }
    .mobile-device .sim-guide-cta { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; z-index: 100 !important; height: 53px !important; border-radius: 0 !important; flex: none !important; font-size: 16px !important; box-shadow: 0 -2px 12px rgba(0,0,0,0.1) !important; }
    .mobile-device .hero-banner { margin: 0 16px 24px !important; border-radius: 16px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; border: 1px solid var(--border-primary) !important; }
    .mobile-device .hero-character { display: none !important; }
    .mobile-device .hero-character-mobile { display: none !important; }
    .mobile-device .hero-title-row { margin-bottom: 10px !important; }
    .mobile-device .sim-input-row .blue-select { flex: 1 1 0 !important; }
  `;
  document.head.appendChild(style);
}

// --- DevTools / 우클릭 / 키보드 단축키 차단 (프로덕션 전용) ---
if (import.meta.env.PROD) {
  // 우클릭 차단
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // 개발자 도구 단축키 차단
  document.addEventListener("keydown", (e) => {
    // F12
    if (e.key === "F12") { e.preventDefault(); return; }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
    // Ctrl+U (소스 보기)
    if (e.ctrlKey && e.key.toUpperCase() === "U") { e.preventDefault(); return; }
  });

  // DevTools 열림 감지 (모바일 제외 — 주소창/하단바 오탐지 방지)
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobileDevice) {
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f0f1a;color:#fff;font-family:sans-serif;text-align:center;padding:40px"><div><h2>접근이 제한되었습니다</h2><p style="color:rgba(255,255,255,0.5)">개발자 도구를 닫고 새로고침 해주세요</p></div></div>';
      }
    };
    setInterval(detectDevTools, 1000);
  }

  // console 메서드 비활성화 (error는 유지)
  const noop = () => {};
  const origError = console.error;
  Object.defineProperty(window, "console", {
    value: { log: noop, warn: noop, error: origError, info: noop, debug: noop, table: noop, dir: noop, trace: noop },
    writable: false,
    configurable: false,
  });
}

createRoot(document.getElementById("root")!).render(
  <PasswordGate>
    <App />
  </PasswordGate>
);
