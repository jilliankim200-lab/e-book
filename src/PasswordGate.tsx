import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

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

export function PasswordGate({ children }: PasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const BG_IMAGES = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80",
    "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1920&q=80",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80",
    "https://images.unsplash.com/photo-1469796466635-455ede028aca?w=1920&q=80",
    "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1920&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % 10);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(ACCESS_KEY);
    if (saved === "true") {
      setIsUnlocked(true);
    }
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

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "var(--font-family)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Images - 5장 롤링 */}
      {BG_IMAGES.map((url, i) => (
        <div key={i} style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('${url}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: bgIndex === i ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
        }} />
      ))}
      {/* Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(15,15,26,0.75) 0%, rgba(26,26,46,0.70) 50%, rgba(22,33,62,0.65) 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          zIndex: 1,
          width: isMobile ? 'calc(100vw - 48px)' : 380,
          maxWidth: 380,
          padding: isMobile ? "40px 24px" : "48px 40px",
          borderRadius: 20,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          textAlign: "center",
          animation: shake ? "shake 0.5s ease" : "none",
        }}
      >
        {/* Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #3182F6, #6366f1)",
          backgroundSize: "200% 200%",
          animation: "gradientBG 5s ease infinite, floating 3s ease-in-out infinite",
          boxShadow: "0 8px 24px rgba(49,130,246,0.4)",
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path className="map-path" d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
            <path className="map-line line-1" d="M15 5.764v15" />
            <path className="map-line line-2" d="M9 3.236v15" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 700, color: "#fff",
          margin: "0 0 8px", letterSpacing: "-0.02em",
        }}>
          탈출로드맵
        </h1>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.5)",
          margin: "0 0 32px", lineHeight: 1.5,
        }}>
          전자책 구매자 전용 서비스입니다<br />
          책에 안내된 비밀번호를 입력해주세요
        </p>

        {/* Password Input */}
        <div style={{
          position: "relative",
          marginBottom: 16,
        }}>
          <div style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            display: "flex", alignItems: "center",
          }}>
            <Lock size={16} color="rgba(255,255,255,0.3)" />
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
              border: error ? "1px solid #F04452" : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              outline: "none",
              transition: "all 0.2s",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = error ? "#F04452" : "#3182F6"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#F04452" : "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
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
          <p style={{
            fontSize: 13, color: "#F04452", margin: "0 0 12px",
            textAlign: "left",
          }}>
            비밀번호가 올바르지 않습니다
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(135deg, #3182F6, #6366f1)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(49,130,246,0.3)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(49,130,246,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(49,130,246,0.3)"; }}
        >
          입장하기
        </button>

        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.3)",
          margin: "20px 0 0", lineHeight: 1.5,
        }}>
          비밀번호를 분실하셨다면 전자책을 다시 확인해주세요
        </p>
      </form>
      {/* Character (PC only) */}
      {!isMobile && <video
        src="/images/login-character.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          right: -110,
          bottom: -30,
          width: 180,
          zIndex: 2,
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
          clipPath: "inset(1px 2px 1px 1px)",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .map-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw 2s ease-out forwards;
        }
        .map-line {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
        }
        .line-1 { animation: draw 1s ease-out 0.8s forwards; }
        .line-2 { animation: draw 1s ease-out 1.1s forwards; }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
