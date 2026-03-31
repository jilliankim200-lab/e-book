import { useState } from "react";
import { Pen } from "lucide-react";

interface AuthorNoteProps {
  onNavigate?: (page: string) => void;
}

export function AuthorNote({ onNavigate }: AuthorNoteProps) {
  const sections = [
    {
      content: (
        <>
          <div className="author-row" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p>솔직히 말하면, 회사가 너무 힘들었습니다.</p>
              <p>매일 아침 출근하면서 "이걸 언제까지 해야 하지?"라는 생각이 머리를 떠나지 않았습니다. 그렇다고 아무 준비 없이 그만둘 수도 없었습니다. 아파트 한 채가 전부인 상황에서 무턱대고 사표를 쓰는 건, 저 같은 성격으로는 불가능한 일이었습니다.</p>
              <p>저는 소위 말하는 "POWER J" 성향입니다. 계획 없이는 밥도 못 먹는 사람이요. 그래서 퇴사 대신 계획을 세우기 시작했습니다.</p>
            </div>
            <img src="/images/01-tired-commute.png" alt="지친 출근길" style={{ width: 160, borderRadius: 12, flexShrink: 0, alignSelf: "center" }} />
          </div>
        </>
      ),
    },
    {
      title: "하나씩, 천천히 쌓아간 것들",
      content: (
        <>
          <p>처음에는 거창한 게 아니었습니다.</p>
          <p>직장인이니까 연말정산 세제 혜택이라도 제대로 받자 싶어 <strong>IRP와 연금저축</strong>에 넣기 시작했습니다. 그러다 절세 계좌라는 걸 알게 되어 <strong>ISA</strong>에 가입했고요. 어느 순간부터는 "월급 말고 다른 소득이 있으면 좋겠다"는 생각에 <strong>해외 배당주</strong>에 관심을 갖게 되었습니다.</p>
          <p>직접투자도 했고, 괜찮은 IPO가 나오면 공모주에도 참여했습니다. 별도의 부업은 없었습니다. 본업 하나도 벅찬데 부업까지 할 여력은 솔직히 없었거든요.</p>
          <p>시장이 좋을 때는 자산을 불리는 데 집중했고, 나이가 들면서 자연스럽게 배당주의 비중을 늘려갔습니다. 목표는 단순했습니다. <strong>"목표한 월 배당금이 나오면 그만두자."</strong> 부부가 함께 정한 약속이었습니다. 그때까지는 아무리 힘들어도 참기로 했습니다.</p>
        </>
      ),
    },
    {
      title: "엑셀에서 탈출지도로",
      content: (
        <>
          <div className="author-row" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <img src="/images/02-late-night-excel.png" alt="늦은 밤 엑셀 작업" style={{ width: 160, borderRadius: 12, flexShrink: 0, alignSelf: "center" }} />
            <div style={{ flex: 1 }}>
              <p>참는 데도 기술이 필요합니다.</p>
              <p>저한테 그 기술은 <strong>숫자를 확인하는 것</strong>이었습니다. 지금 자산이 얼마고, 배당이 얼마나 나오고, 이 속도라면 몇 년 뒤에 목표에 닿을 수 있는지. 그걸 확인하는 것만으로도 월요일 아침이 조금은 견딜 만해졌습니다.</p>
              <p>처음에는 엑셀 시트로 관리했습니다. 시트가 점점 복잡해지고 시나리오가 늘어나면서 한계를 느꼈고, 결국 직접 시뮬레이션 시스템을 만들게 되었습니다.</p>
            </div>
          </div>
          <div className="author-row" style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 20 }}>
            <div style={{ flex: 1 }}>
              <p>물가상승률, 계좌별 세금, 건강보험료, 국민연금 수령 시기... 이런 것들을 하나하나 넣어가며 만들었더니, 어느새 꽤 쓸 만한 도구가 되었습니다.</p>
            </div>
            <img src="/images/03-simulator-complete.png" alt="탈출지도 완성의 뿌듯함" style={{ width: 160, borderRadius: 12, flexShrink: 0, alignSelf: "center" }} />
          </div>
        </>
      ),
    },
    {
      title: "왜 공유하게 되었나",
      content: (
        <>
          <p>이 시스템을 쓰면서 가장 도움이 됐던 건 <strong>"막연한 불안이 구체적인 숫자로 바뀌는 순간"</strong>이었습니다.</p>
          <p>"대충 괜찮겠지"가 아니라 "57세부터는 연금으로 커버가 되고, 65세에 국민연금이 들어오면 여유가 생긴다"처럼 구체적으로 보이니까, 오히려 마음이 편해졌습니다. 부족하면 부족한 대로 "그러면 2년만 더 다니면 되겠구나" 하고 계획을 조정할 수 있었고요.</p>
          <p>저와 비슷한 상황인 분들이 분명 있을 거라고 생각했습니다. 회사가 힘들지만 무턱대고 그만둘 수 없는 사람, 숫자로 확인해야 안심이 되는 사람, 계획이 있어야 움직일 수 있는 사람.</p>
          <p>그런 분들에게 이 시스템이 도움이 됐으면 합니다. 거창한 재테크 비법이 아닙니다. 평범한 직장인이 퇴근 후에 하나씩 쌓아가며 만든, 나를 위한 은퇴 로드맵입니다.</p>
        </>
      ),
    },
  ];

  const card: React.CSSProperties = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-primary)",
    borderRadius: 12,
    padding: "24px 28px",
    boxShadow: "var(--shadow-sm)",
  };

  const pStyle: React.CSSProperties = {
    fontSize: 15,
    color: "var(--text-secondary)",
    lineHeight: 2,
    margin: "0 0 16px",
    wordBreak: "keep-all",
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Pen size={20} strokeWidth={2} color="var(--accent-blue)" />
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)", margin: 0 }}>
            J의 기록
          </h1>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map((section, idx) => (
          <div key={idx} style={card}>
            {section.title && (
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid var(--border-secondary)" }}>
                {section.title}
              </h3>
            )}
            <div style={pStyle}>
              {section.content}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          padding: "24px 28px", borderRadius: 12,
          background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.8, margin: "0 0 16px", fontStyle: "italic" }}>
            사표를 던지기 전, 가장 먼저 확인해야 할 숫자.<br />
            자유까지 남은 거리, 탈출지도가 명확한 지도를 그려드립니다.
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate("retirement-calc")}
              style={{
                padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              나의 탈출 로드맵 확인하기
            </button>
          )}
        </div>

        {/* Copyright */}
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "var(--text-disabled)", lineHeight: 1.6 }}>
          &copy; 탈출로드맵. All rights reserved. 무단 복제 및 배포를 금지합니다.
        </div>
      </div>
    </div>
  );
}
