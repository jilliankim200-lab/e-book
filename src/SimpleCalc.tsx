import { useState } from "react";
import { Calculator, ArrowRight, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface SimpleResult {
  depletionAge: number | null; // null = 고갈 안 됨
  totalAssetAtRetire: number;
  monthlyShortfall: number; // 은퇴 첫해 기준 월 부족액
  yearsLastAfterRetire: number;
  isSuccess: boolean;
}

function formatKorean(amount: number): string {
  const abs = Math.abs(amount);
  const eok = Math.floor(abs / 100000000);
  const man = Math.floor((abs % 100000000) / 10000);
  let r = amount < 0 ? "-" : "";
  if (eok > 0) r += `${eok}억`;
  if (man > 0) r += ` ${man.toLocaleString()}만`;
  return r ? `${r}원` : "0원";
}

function simulate(
  currentAge: number,
  retireAge: number,
  endAge: number,
  monthlyLiving: number,
  totalAsset: number,
  monthlyNP: number,
): SimpleResult {
  const npStartAge = 65;
  const inflationRate = 0.025;
  const returnRate = 0.04;

  let balance = totalAsset;
  let depletionAge: number | null = null;

  for (let age = retireAge; age <= endAge; age++) {
    const yearIndex = age - retireAge;
    const livingCost = monthlyLiving * 12 * Math.pow(1 + inflationRate, yearIndex);
    const npIncome = age >= npStartAge ? monthlyNP * 12 * Math.pow(1 + inflationRate, age - npStartAge) * 0.945 : 0;
    const surplus = npIncome - livingCost;

    if (surplus < 0) {
      balance += surplus; // 부족분 자산에서 차감
    }

    // 연말 수익률
    if (balance > 0) {
      balance *= (1 + returnRate);
    }

    if (balance <= 0 && !depletionAge) {
      depletionAge = age;
    }
  }

  const firstYearLiving = monthlyLiving * 12;
  const firstYearNP = retireAge >= npStartAge ? monthlyNP * 12 * 0.945 : 0;
  const monthlyShortfall = Math.max(0, monthlyLiving - (firstYearNP / 12));

  return {
    depletionAge,
    totalAssetAtRetire: totalAsset,
    monthlyShortfall,
    yearsLastAfterRetire: depletionAge ? depletionAge - retireAge : endAge - retireAge,
    isSuccess: !depletionAge,
  };
}

export function SimpleCalc({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [currentAge, setCurrentAge] = useState(35);
  const [retireAge, setRetireAge] = useState(55);
  const [monthlyLiving, setMonthlyLiving] = useState(300);
  const [totalAsset, setTotalAsset] = useState(30000);
  const [monthlyNP, setMonthlyNP] = useState(100);
  const [result, setResult] = useState<SimpleResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isMobile = document.body.classList.contains('mobile-device');

  const handleCalc = () => {
    const r = simulate(
      currentAge,
      retireAge,
      90,
      monthlyLiving * 10000,
      totalAsset * 10000,
      monthlyNP * 10000,
    );
    setResult(r);
    setShowResult(true);
  };

  const inputStyle: React.CSSProperties = {
    width: isMobile ? '100%' : 160,
    padding: '12px 16px',
    fontSize: isMobile ? 18 : 16,
    fontWeight: 700,
    textAlign: 'right',
    border: '2px solid var(--border-primary)',
    borderRadius: 12,
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: isMobile ? 16 : 15,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    minWidth: isMobile ? 'auto' : 140,
  };

  const unitStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--text-tertiary)',
    fontWeight: 500,
    flexShrink: 0,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: isMobile ? 'stretch' : 'center',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 16,
    padding: '16px 0',
    borderBottom: '1px solid var(--border-secondary)',
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '24px 20px' : '40px 24px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Calculator size={22} color="var(--accent-blue)" />
          <h1 style={{ fontSize: isMobile ? 22 : 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            간편 계산
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
          5가지만 입력하면 내 자산이 몇 살까지 버티는지 바로 확인할 수 있어요.
        </p>
      </div>

      {/* 입력 폼 */}
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 16,
        padding: isMobile ? '8px 20px' : '8px 28px',
        marginBottom: 24,
      }}>
        <div style={rowStyle}>
          <span style={labelStyle}>현재 나이</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <input
              type="number"
              value={currentAge}
              onChange={e => setCurrentAge(Number(e.target.value))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
            />
            <span style={unitStyle}>세</span>
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>희망 은퇴 나이</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <input
              type="number"
              value={retireAge}
              onChange={e => setRetireAge(Number(e.target.value))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
            />
            <span style={unitStyle}>세</span>
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>월 생활비</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <input
              type="number"
              value={monthlyLiving}
              onChange={e => setMonthlyLiving(Number(e.target.value))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
            />
            <span style={unitStyle}>만원</span>
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>은퇴 시점 총 자산</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <input
              type="number"
              value={totalAsset}
              onChange={e => setTotalAsset(Number(e.target.value))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
            />
            <span style={unitStyle}>만원</span>
          </div>
        </div>

        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={labelStyle}>예상 월 국민연금</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <input
              type="number"
              value={monthlyNP}
              onChange={e => setMonthlyNP(Number(e.target.value))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
            />
            <span style={unitStyle}>만원</span>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div style={{ fontSize: 12, color: 'var(--text-disabled)', lineHeight: 1.6, marginBottom: 20, padding: '0 4px' }}>
        * 물가상승률 2.5%, 자산 수익률 4%, 국민연금 65세 수령 기준으로 계산됩니다.
      </div>

      {/* 계산 버튼 */}
      <button
        onClick={handleCalc}
        style={{
          width: '100%',
          padding: '16px 24px',
          fontSize: 17,
          fontWeight: 700,
          color: '#fff',
          background: 'var(--accent-blue)',
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 14px rgba(49,130,246,0.3)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        계산하기
      </button>

      {/* 결과 */}
      {showResult && result && (
        <div style={{ marginTop: 32 }}>
          {/* 메인 결과 카드 */}
          <div style={{
            background: result.isSuccess
              ? 'linear-gradient(135deg, #00b1bb 0%, #0ea5e9 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #F04452 50%, #f87171 100%)',
            borderRadius: 20,
            padding: '32px 28px',
            color: '#fff',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {result.isSuccess
                ? <CheckCircle size={28} />
                : <AlertTriangle size={28} />
              }
              <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>
                {result.isSuccess ? '자산이 유지됩니다' : '자산이 부족합니다'}
              </span>
            </div>
            <div style={{ fontSize: isMobile ? 28 : 32, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
              {result.isSuccess
                ? '90세까지 자산이 유지돼요!'
                : <>{result.depletionAge}세에 자산이 바닥나요</>
              }
            </div>
            <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6, margin: 0 }}>
              {result.isSuccess
                ? `${retireAge}세 은퇴 후 90세까지 ${90 - retireAge}년간 자산이 유지됩니다.`
                : `${retireAge}세 은퇴 후 약 ${result.yearsLastAfterRetire}년 뒤 자산이 소진됩니다.`
              }
            </p>
          </div>

          {/* 상세 지표 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              padding: '20px 22px',
              borderRadius: 14,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6 }}>은퇴 시점 총 자산</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatKorean(result.totalAssetAtRetire)}
              </div>
            </div>
            <div style={{
              padding: '20px 22px',
              borderRadius: 14,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                은퇴 후 월 부족액 {retireAge < 65 ? `(${retireAge}~64세)` : ''}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: result.monthlyShortfall > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                {result.monthlyShortfall > 0 ? `-${formatKorean(result.monthlyShortfall)}` : '부족 없음'}
              </div>
            </div>
            <div style={{
              padding: '20px 22px',
              borderRadius: 14,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6 }}>국민연금 공백기</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: retireAge < 65 ? '#f59e0b' : 'var(--color-success)' }}>
                {retireAge < 65 ? `${65 - retireAge}년 (${retireAge}~64세)` : '없음'}
              </div>
            </div>
            <div style={{
              padding: '20px 22px',
              borderRadius: 14,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6 }}>자산 유지 기간</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {result.isSuccess ? `${90 - retireAge}년 이상` : `약 ${result.yearsLastAfterRetire}년`}
              </div>
            </div>
          </div>

          {/* 상세 분석 안내 */}
          <div style={{
            padding: '20px 24px',
            borderRadius: 14,
            background: 'var(--accent-blue-bg, rgba(49,130,246,0.06))',
            border: '1px solid rgba(49,130,246,0.15)',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
              더 정확한 분석을 원하시나요? <strong>탈출지도</strong>에서 퇴직연금, 개인연금, ISA, 건보료, 세금까지 반영한 정밀 시뮬레이션을 해보세요.
            </p>
            <button
              onClick={() => onNavigate?.('retirement-calc')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                background: 'var(--accent-blue)',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <TrendingUp size={16} />
              탈출지도에서 상세 분석하기
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
