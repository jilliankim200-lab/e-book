import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Calculator, TrendingUp, PiggyBank, Landmark, Coins, Target, BarChart3, Wallet } from "lucide-react";

interface WelcomeProps {
  onNavigate: (page: string) => void;
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="welcome-wrapper" style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg-page)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative background icons */}
      {[
        { Icon: Calculator, top: "8%", left: "5%", size: 32, rotate: -15, opacity: 0.15 },
        { Icon: TrendingUp, top: "15%", right: "8%", size: 40, rotate: 12, opacity: 0.12 },
        { Icon: PiggyBank, bottom: "20%", left: "8%", size: 36, rotate: 20, opacity: 0.12 },
        { Icon: Landmark, top: "25%", left: "18%", size: 28, rotate: -8, opacity: 0.1 },
        { Icon: Coins, bottom: "12%", right: "12%", size: 34, rotate: 25, opacity: 0.15 },
        { Icon: Target, top: "10%", left: "40%", size: 26, rotate: -20, opacity: 0.1 },
        { Icon: BarChart3, bottom: "30%", right: "5%", size: 38, rotate: 10, opacity: 0.12 },
        { Icon: Wallet, bottom: "8%", left: "30%", size: 30, rotate: -12, opacity: 0.12 },
        { Icon: TrendingUp, top: "40%", left: "3%", size: 24, rotate: 30, opacity: 0.1 },
        { Icon: Calculator, bottom: "15%", right: "25%", size: 22, rotate: -25, opacity: 0.1 },
        { Icon: Coins, top: "5%", right: "30%", size: 28, rotate: 15, opacity: 0.12 },
        { Icon: PiggyBank, top: "50%", right: "3%", size: 30, rotate: -10, opacity: 0.1 },
      ].map(({ Icon, size, rotate, opacity, ...pos }, i) => (
        <Icon
          key={i}
          size={size}
          strokeWidth={1.5}
          className="welcome-bg-icon"
          style={{
            position: "absolute",
            ...pos,
            transform: `rotate(${rotate}deg)`,
            opacity,
            color: "var(--accent-blue)",
            pointerEvents: "none",
          }}
        />
      ))}

      <div className="welcome-card" style={{
        display: "flex",
        alignItems: "center",
        gap: 48,
        maxWidth: 840,
        width: "100%",
        background: "var(--bg-primary)",
        border: "1px solid var(--border-primary)",
        borderRadius: 24,
        padding: "48px 56px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* Left: Character */}
        <div className="welcome-character" style={{
          flex: "0 0 200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <video
            src="/videos/welcome.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: 200,
              height: "auto",
              objectFit: "contain",
              borderRadius: 12,
              clipPath: "inset(1px 2px 1px 1px)",
            }}
          />
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 40,
            background: "linear-gradient(to bottom, transparent, var(--bg-primary))",
            pointerEvents: "none",
          }} />
        </div>

        {/* Right: Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-bold)",
            color: "var(--text-primary)",
            lineHeight: 1.4,
            margin: "0 0 16px",
          }}>
            탈출 조력자 제이입니다.<br />
            당신이 마주할 자유로운 미래를<br />
            누구보다 먼저 확인하고 왔어요.
          </h1>

          <p style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            margin: "0 0 32px",
          }}>
            막연한 불안은 내려놓으세요.<br />
            저의 꼼꼼한 설계가 당신만의 탈출로드맵을 그려드릴게요.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => onNavigate("sim-guide")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-semibold)",
                color: "var(--accent-blue)",
                background: "transparent",
                border: "1.5px solid var(--accent-blue)",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-blue-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <BookOpen size={16} strokeWidth={2} />
              탈출지도 사용법 보기
            </button>

            <button
              onClick={() => onNavigate("retirement-calc")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-semibold)",
                color: "#fff",
                background: "var(--accent-blue)",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
                boxShadow: "0 2px 12px rgba(49, 130, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-blue-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent-blue)";
              }}
            >
              바로 시작하기
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
