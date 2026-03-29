import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Map, Calculator, TrendingUp, PiggyBank, Landmark, Coins, Target, BarChart3, Wallet } from "lucide-react";

const ACCESS_KEY = "ebook_access_granted";
const ROLE_KEY = "ebook_user_role";

const USER_HASH = -849505285;
const ADMIN_HASH = 20789456;

function getPasswordRole(input: string): "admin" | "user" | null {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  if (hash === ADMIN_HASH) return "admin";
  if (hash === USER_HASH) return "user";
  return null;
}

export function isAdmin(): boolean {
  return sessionStorage.getItem(ROLE_KEY) === "admin";
}

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate2({ children }: PasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState(0);
  // phase 0: 공 등장 (중앙)
  // phase 1: 공 위로 올라감
  // phase 2: 공 바닥으로 떨어짐 (바운스)
  // phase 3: 바닥에서 파란색 채워짐
  // phase 4: 콘텐츠 표시

  useEffect(() => {
    const saved = sessionStorage.getItem(ACCESS_KEY);
    if (saved === "true") {
      setIsUnlocked(true);
      return;
    }
    // 애니메이션 시퀀스
    setTimeout(() => setPhase(1), 400);   // 공 위로
    setTimeout(() => setPhase(2), 900);   // 공 떨어짐
    setTimeout(() => setPhase(3), 1500);  // 파란색 채워짐
    setTimeout(() => setPhase(4), 2800);  // 콘텐츠 표시
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = getPasswordRole(password);
    if (role) {
      sessionStorage.setItem(ACCESS_KEY, "true");
      sessionStorage.setItem(ROLE_KEY, role);
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      fontFamily: "var(--font-family)",
      position: "relative",
      overflow: "hidden",
      background: "#fff",
    }}>
      {/* 배경 아이콘 */}
      {[
        { Icon: Calculator, top: "8%", left: "5%", size: 32, rotate: -15, opacity: 0.08 },
        { Icon: TrendingUp, top: "15%", right: "8%", size: 40, rotate: 12, opacity: 0.06 },
        { Icon: PiggyBank, bottom: "20%", left: "8%", size: 36, rotate: 20, opacity: 0.07 },
        { Icon: Landmark, top: "25%", left: "18%", size: 28, rotate: -8, opacity: 0.05 },
        { Icon: Coins, bottom: "12%", right: "12%", size: 34, rotate: 25, opacity: 0.08 },
        { Icon: Target, top: "10%", left: "40%", size: 26, rotate: -20, opacity: 0.05 },
        { Icon: BarChart3, bottom: "30%", right: "5%", size: 38, rotate: 10, opacity: 0.06 },
        { Icon: Wallet, bottom: "8%", left: "30%", size: 30, rotate: -12, opacity: 0.07 },
        { Icon: TrendingUp, top: "40%", left: "3%", size: 24, rotate: 30, opacity: 0.05 },
        { Icon: Calculator, bottom: "15%", right: "25%", size: 22, rotate: -25, opacity: 0.06 },
        { Icon: Coins, top: "5%", right: "30%", size: 28, rotate: 15, opacity: 0.07 },
        { Icon: PiggyBank, top: "50%", right: "3%", size: 30, rotate: -10, opacity: 0.05 },
      ].map(({ Icon, size, rotate, opacity, ...pos }, i) => (
        <Icon
          key={i}
          size={size}
          strokeWidth={1.5}
          className={`login-bg-icon ${phase >= 4 ? "visible" : ""}`}
          style={{
            position: "absolute",
            ...pos,
            transform: `rotate(${rotate}deg)`,
            opacity: 0,
            color: "rgba(255,255,255,0.3)",
            pointerEvents: "none",
            zIndex: 6,
            transitionDelay: `${i * 0.05}s`,
          }}
        />
      ))}

      {/* 바운스 볼 */}
      <div className={`login-ball phase-${phase}`} />

      {/* 파란색 채우기 */}
      <div className={`login-fill ${phase >= 3 ? "active" : ""}`} />

      {/* 좌측 상단 로고 */}
      <div className={`login-logo ${phase >= 4 ? "visible" : ""}`}>
        <svg className="map-line-anim-white" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>탈출로드맵</span>
      </div>

      {/* 메인 콘텐츠: 캐릭터 + 로그인 */}
      <div className={`login-content ${phase >= 4 ? "visible" : ""}`}>
        {/* 캐릭터 */}
        <div className="login-character-area" style={{ position: "relative" }}>
          <video
            src="/images/login-character.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: 180, height: "auto", clipPath: "inset(2px 4px 2px 2px)" }}
          />
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 50,
            background: "linear-gradient(to bottom, transparent, #277fd1)",
            pointerEvents: "none",
          }} />
        </div>

        {/* 로그인 박스 */}
        <form
          onSubmit={handleSubmit}
          className="login-form"
          style={{ animation: shake ? "shake 0.5s ease" : "none" }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
            탈출을 시작해 볼까요?
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 28px", lineHeight: 1.5 }}>
            전자책에 안내된 비밀번호를 입력해주세요
          </p>

          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              display: "flex", alignItems: "center",
            }}>
              <Lock size={16} color="rgba(255,255,255,0.4)" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="비밀번호 입력"
              autoFocus
              style={{
                width: "100%",
                padding: "14px 44px 14px 42px",
                fontSize: 15,
                border: error ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                display: "flex", alignItems: "center",
              }}
            >
              {showPassword
                ? <EyeOff size={16} color="rgba(255,255,255,0.4)" />
                : <Eye size={16} color="rgba(255,255,255,0.4)" />}
            </button>
          </div>

          {error && (
            <div style={{ margin: "0 0 12px", padding: "10px 14px", borderRadius: 10, background: "rgba(240,68,82,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>비밀번호가 올바르지 않습니다</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 15,
              fontWeight: 700,
              color: "#3182F6",
              background: "#fff",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
          >
            입장하기
          </button>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "20px 0 0", lineHeight: 1.5 }}>
            비밀번호를 분실하셨다면 전자책을 다시 확인해주세요
          </p>
        </form>
      </div>

      <style>{`
        /* 바운스 볼 */
        .login-ball {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3182F6;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          transition: all 0.4s ease;
        }
        .login-ball.phase-0 {
          top: 50%;
          opacity: 1;
          animation: ballAppear 0.3s ease;
        }
        .login-ball.phase-1 {
          top: 15%;
          opacity: 1;
        }
        .login-ball.phase-2 {
          top: calc(100% - 10px);
          opacity: 1;
          transition: top 0.5s cubic-bezier(0.55, 0, 1, 0.45);
          animation: bounce 0.6s ease 0.5s;
        }
        .login-ball.phase-3,
        .login-ball.phase-4 {
          top: calc(100% - 10px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        @keyframes ballAppear {
          0% { transform: translate(-50%, -50%) scale(0); }
          60% { transform: translate(-50%, -50%) scale(1.3); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes bounce {
          0% { top: calc(100% - 10px); }
          30% { top: calc(100% - 80px); }
          50% { top: calc(100% - 10px); }
          70% { top: calc(100% - 30px); }
          100% { top: calc(100% - 10px); }
        }

        /* 파란색 채우기 */
        .login-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0;
          background: #277fd1;
          z-index: 5;
          transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .login-fill.active {
          height: 100%;
        }

        /* 로고 */
        .login-logo {
          position: absolute;
          top: 20px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 20;
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
        }
        .login-logo.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .map-line-anim-white polygon,
        .map-line-anim-white line {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
        }
        .login-logo.visible .map-line-anim-white polygon {
          animation: drawWhite 1.2s ease-out 0.3s forwards;
        }
        .login-logo.visible .map-line-anim-white line:nth-child(2) {
          animation: drawWhite 0.8s ease-out 0.6s forwards;
        }
        .login-logo.visible .map-line-anim-white line:nth-child(3) {
          animation: drawWhite 0.8s ease-out 0.9s forwards;
        }
        @keyframes drawWhite {
          to { stroke-dashoffset: 0; }
        }

        /* 메인 콘텐츠 */
        .login-content {
          position: absolute;
          inset: 0;
          z-index: 15;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          padding: 24px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .login-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .login-character-area {
          flex-shrink: 0;
          margin-top: -40px;
        }

        .login-bg-icon {
          opacity: 0 !important;
          transition: opacity 0.6s ease;
        }
        .login-bg-icon.visible {
          opacity: 0.5 !important;
        }

        .login-form {
          width: 380px;
          max-width: 380px;
          padding: 40px 36px;
          border-radius: 20px;
          background: transparent;
          backdrop-filter: none;
          border: none;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* 모바일 */
        @media (max-width: 768px) {
          .login-content {
            flex-direction: column;
            gap: 0;
            padding: 60px 24px 32px;
            justify-content: flex-end;
          }
          .login-character-area {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 0 !important;
            min-height: 0;
            overflow: hidden;
          }
          .login-character-area img,
          .login-character-area video {
            width: auto !important;
            max-height: 100% !important;
            max-width: 55vw !important;
            object-fit: contain;
          }
          .login-form {
            width: 100% !important;
            max-width: 100% !important;
            padding: 24px 20px !important;
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
}
