export function CashFlowTable() {
  const card = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: 'var(--shadow-sm)',
  } as const;

  const sectionTitle = {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as const;

  const sectionDesc = {
    fontSize: 12,
    color: 'var(--text-tertiary)',
    marginBottom: 16,
  } as const;

  const th = {
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    borderBottom: '1px solid var(--border-primary)',
    background: 'var(--bg-secondary)',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
  };

  const td = {
    padding: '10px 12px',
    fontSize: 13,
    textAlign: 'center' as const,
    borderBottom: '1px solid var(--border-secondary)',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap' as const,
  };

  const tdBold = {
    ...td,
    fontWeight: 600,
    color: 'var(--accent-blue)',
  };

  const infoBox = (bg: string, border: string) => ({
    marginTop: 12,
    padding: '12px 16px',
    borderRadius: 8,
    background: bg,
    border: `1px solid ${border}`,
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  });

  const phases = [
    {
      title: '① 51~54세 (ISA 브리지 구간)',
      ages: [51, 52, 53, 54],
      accent: 'var(--accent-blue)',
      cols: ['ISA 2,650만', 'ISA 2,650만', '배당 1,200만', '6,500만'],
      note: 'ISA 연 소진액: 남편 1.06억 / 아내 1.06억 → 은퇴 전 ISA 추가 적립 전제',
    },
    {
      title: '② 55~64세 (연금 개시, 안정 구간)',
      ages: ['55~64'],
      accent: '#9333ea',
      cols: ['연금 2,650만', '연금 2,650만', '배당 1,200만', '6,500만'],
      note: '연금소득 = 금융소득 아님 / 건보 점수 변화 거의 없음 / ISA 보존',
    },
    {
      title: '③ 65~69세 (국민연금 합류)',
      ages: ['65~69'],
      accent: '#059669',
      cols: ['연금 2,050만', '연금 2,050만', '배당 1,200만\n+ 국민연금 1,200만', '6,500만'],
      note: '연금 인출액 자동 감소 → 연금 고갈 리스크 ↓',
    },
    {
      title: '④ 70~90세 (고령 안정 구간)',
      ages: ['70~90'],
      accent: '#4f46e5',
      cols: ['연금 2,200만', '연금 2,200만', '배당 1,200만\n+ 국민연금 1,200만', '6,800만'],
      note: '의료비 증가 반영 / 연금 인출은 실질 원금 비소진 속도',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: '0 0 6px' }}>
        현금흐름표
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 24 }}>
        연령 구간별 수입·지출 구조와 현금흐름 전략을 확인합니다
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 공통 전제 */}
        <div style={card}>
          <h3 style={sectionTitle}>🔧 시뮬레이션 공통 전제</h3>
          <p style={sectionDesc}>모든 구간에 동일하게 적용되는 전제 조건입니다</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>💸 지출</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                월 생활비: 500만 (연 6,000만)<br/>
                의료비+건보료: ~69세 연 500만 / 70세~ 연 800만<br/>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  총 필요: 51~69세 연 6,500만 / 70~90세 연 6,800만
                </span>
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>💰 확정 수입</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                과세계좌 배당: 연 1,200만 (월 100만)<br/>
                ISA/연금 내부 배당: 계좌 내 재투자<br/>
                국민연금: 65세부터 연 1,200만 (부부 합산)
              </div>
            </div>
          </div>
        </div>

        {/* 연령 구간별 테이블 */}
        {phases.map((phase, idx) => (
          <div key={idx} style={card}>
            <h3 style={sectionTitle}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: phase.accent }}></span>
              {phase.title}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>나이</th>
                    <th style={th}>남편</th>
                    <th style={th}>아내</th>
                    <th style={th}>공통</th>
                    <th style={{ ...th, color: phase.accent, fontWeight: 700 }}>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {phase.ages.map((age) => (
                    <tr key={String(age)}>
                      <td style={{ ...td, fontWeight: 500, color: 'var(--text-primary)' }}>{age}</td>
                      <td style={td}>{phase.cols[0]}</td>
                      <td style={td}>{phase.cols[1]}</td>
                      <td style={td}>{String(phase.cols[2]).split('\n').map((line, i) => <span key={i}>{line}{i === 0 && phase.cols[2].includes('\n') ? <br/> : null}</span>)}</td>
                      <td style={tdBold}>{phase.cols[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={infoBox('var(--bg-secondary)', 'var(--border-primary)')}>
              📌 {phase.note}
            </div>
          </div>
        ))}

        {/* 전체 흐름 요약 */}
        <div style={card}>
          <h3 style={sectionTitle}>🔍 전체 흐름 한눈 요약</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 8 }}>
            {[
              { age: '51~54', desc: 'ISA → 시간 벌기', color: 'var(--accent-blue)' },
              { age: '55~64', desc: '연금 → 주력 엔진', color: '#9333ea' },
              { age: '65~69', desc: '연금 ↓ + 국민연금 →', color: '#059669' },
              { age: '70~90', desc: '연금 + 국민연금 안정', color: '#4f46e5' },
            ].map((item) => (
              <div key={item.age} style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.age}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 성립 이유 */}
        <div style={card}>
          <h3 style={sectionTitle}>✅ 이 구조가 성립하는 이유</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
            {[
              '금융소득 2천만 이하 유지',
              '연금·ISA 인출 → 건보 점수 영향 없음',
              '부부 분산 → 세금·리스크 분산',
              'ISA를 "아끼지 않고 써서" 연금 보호',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-secondary)' : 'none' }}>
                <span style={{ color: '#059669', fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 체크 포인트 */}
        <div style={{ ...card, border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 style={{ ...sectionTitle, color: 'var(--color-error)' }}>⚠️ 체크해야 할 현실 포인트</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12, marginTop: 8 }}>
            <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>1. ISA 총액</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                최소 필요: 약 2.2억<br/>현재 1.2억 → 은퇴 전 증액 필수
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>2. 연금 총액</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                부부 합산 5억+ 필요<br/>→ 위 인출 구조 90세까지 유지 가능
              </div>
            </div>
          </div>
        </div>

        {/* 최종 요약 */}
        <div style={{ padding: '20px 24px', borderRadius: 12, background: 'var(--accent-blue)', color: '#fff' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🧠 최종 한 문장</div>
          <p style={{ fontSize: 14, lineHeight: 1.8 }}>
            월 500만 생활비 구조에서도 ISA는 브리지로 사라지고, 연금은 90세까지 살아남는다.<br/>
            <span style={{ fontWeight: 700 }}>이게 '실패하지 않는 FIRE'다.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
