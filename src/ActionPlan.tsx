import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Wallet, TrendingUp, Clock, RefreshCw, Target, Info, X } from "lucide-react";
import { isAdmin } from "./PasswordGate2";

function PlanTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [tipStyle, setTipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLSpanElement>(null);
  const handleEnter = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tipWidth = Math.min(260, window.innerWidth * 0.9);
    let left = rect.left + rect.width / 2 - tipWidth / 2;
    if (left < 8) left = 8;
    if (left + tipWidth > window.innerWidth - 8) left = window.innerWidth - 8 - tipWidth;
    const arrowLeft = rect.left + rect.width / 2 - left - 6;
    const showBelow = rect.top < 120;
    if (showBelow) {
      setTipStyle({
        position: 'fixed', top: rect.bottom + 8, left, width: tipWidth,
        padding: '12px 16px', borderRadius: 10, background: '#fff', color: 'var(--text-primary)',
        fontSize: 13, fontWeight: 500, lineHeight: 1.8, textAlign: 'left' as const, whiteSpace: 'normal',
        boxShadow: '0 6px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)', zIndex: 10000, pointerEvents: 'none' as const,
      });
      setArrowStyle({
        position: 'absolute' as const, top: -6, left: Math.max(12, Math.min(arrowLeft, tipWidth - 20)),
        width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderBottom: '6px solid #fff',
      });
    } else {
      setTipStyle({
        position: 'fixed', bottom: window.innerHeight - rect.top + 8, left, width: tipWidth,
        padding: '12px 16px', borderRadius: 10, background: '#fff', color: 'var(--text-primary)',
        fontSize: 13, fontWeight: 500, lineHeight: 1.8, textAlign: 'left' as const, whiteSpace: 'normal',
        boxShadow: '0 6px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)', zIndex: 10000, pointerEvents: 'none' as const,
      });
      setArrowStyle({
        position: 'absolute' as const, bottom: -6, left: Math.max(12, Math.min(arrowLeft, tipWidth - 20)),
        width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '6px solid #fff',
      });
    }
    setShow(true);
  };
  return (
    <span ref={triggerRef} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); show ? setShow(false) : handleEnter(); }}
      style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      {show && createPortal(<div style={tipStyle}>{text}<div style={arrowStyle} /></div>, document.body)}
    </span>
  );
}

interface SimulationRow {
  year: number;
  age: number;
  livingCost: number;
  isaWithdrawal: number;
  overseasDividend: number;
  overseasStockSale: number;
  pensionAfterTax: number;
  nationalPension: number;
  homePension: number;
  lifeInsurancePension: number;
  totalIncome: number;
  totalExpense: number;
  yearlySurplus: number;
  isaBalance: number;
  pensionBalance: number;
  overseasBalance: number;
  healthInsurance: number;
  savingsWithdrawal: number;
  savingsBalance: number;
  debtRepayment: number;
  debtBalance: number;
  irregularExpense: number;
}

interface StrategyChange {
  field: string;
  value: number | string | boolean;
  delta?: number; // 상대값 변경 (현재값에서 +/- delta)
  label: string;
}

interface ActionPlanInputs {
  retirementStartAge: number;
  simulationEndAge: number;
  currentAge: number;
  startYear: number;
  monthlyLivingCostBefore75: number;
  monthlyLivingCostAfter75: number;
  nationalPensionStartAge: number;
  nationalPensionYearly: number;
  usePensionDepletion: boolean;
  totalDebt: number;
}

interface ActionPlanProps {
  results: SimulationRow[];
  isFireSuccess: boolean;
  assetDepletionAge: number | null;
  onApplyStrategies?: (changes: StrategyChange[], autoRecalculate?: boolean) => void;
  onRecalculate?: () => void;
  inputs?: ActionPlanInputs;
  originalInputs?: ActionPlanInputs;
  onClose?: () => void;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  impact: string;
  impactType: "positive" | "negative" | "neutral";
  details: string[];
  advice?: string;
  actionTip?: string;
  changes?: StrategyChange[];
}

const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile|Fold|Flip/i.test(navigator.userAgent);

// 스켈레톤 컴포넌트
function ActionPlanSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-secondary) 50%, var(--bg-secondary) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 8,
  } as React.CSSProperties;

  return (
    <div style={{ padding: 20 }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      {/* 히어로 배너 스켈레톤 */}
      <div style={{ ...shimmer, height: 160, borderRadius: 16, marginBottom: 20 }} />
      {/* 지표 스켈레톤 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ ...shimmer, flex: 1, height: 72, borderRadius: 12 }} />
        <div style={{ ...shimmer, flex: 1, height: 72, borderRadius: 12 }} />
      </div>
      {/* 전략 카드 스켈레톤 */}
      <div style={{ ...shimmer, height: 20, width: '40%', marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...shimmer, height: 64, borderRadius: 12 }} />
        <div style={{ ...shimmer, height: 64, borderRadius: 12 }} />
        <div style={{ ...shimmer, height: 64, borderRadius: 12 }} />
      </div>
      {/* 계좌 스켈레톤 */}
      <div style={{ ...shimmer, height: 20, width: '50%', marginTop: 28, marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...shimmer, height: 52, borderRadius: 10 }} />
        <div style={{ ...shimmer, height: 52, borderRadius: 10 }} />
        <div style={{ ...shimmer, height: 52, borderRadius: 10 }} />
        <div style={{ ...shimmer, height: 52, borderRadius: 10 }} />
      </div>
    </div>
  );
}

export function ActionPlan({ results, isFireSuccess, assetDepletionAge, onApplyStrategies, onRecalculate, inputs: planInputs, originalInputs, onClose }: ActionPlanProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [applyMode, setApplyMode] = useState(false);
  const [checkedStrategies, setCheckedStrategies] = useState<Set<string>>(new Set());
  const [showDevNote, setShowDevNote] = useState(false);
  const [filledAccounts, setFilledAccounts] = useState<Record<string, number>>({});
  const [dragAmounts, setDragAmounts] = useState<Record<string, number>>({});
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // phase: 0=초기(아무것도 안 보임), 1=즉시탈출 직후(앞당기기+채우기+여유 모두 표시), 2=재계산 후(채우기만), 3=채우기 재계산 후(모두 숨김)
  const [solutionPhase, setSolutionPhase] = useState(0);
  const prevResultsRef = useRef(results);

  // 최초 마운트 + 결과 변경 시 스켈레톤
  useEffect(() => {
    const changed = prevResultsRef.current !== results;

    if (changed) {
      if (solutionPhase === 1) setSolutionPhase(2);
      const panel = document.querySelector('.action-panel');
      if (panel) panel.scrollTop = 0;
      prevResultsRef.current = results;
    }

    // 스켈레톤 시작
    setShowSkeleton(true);
    if (skeletonTimerRef.current) clearTimeout(skeletonTimerRef.current);
    const duration = 3000 + Math.random() * 2000; // 3~5초
    skeletonTimerRef.current = setTimeout(() => setShowSkeleton(false), duration);

    return () => { if (skeletonTimerRef.current) clearTimeout(skeletonTimerRef.current); };
  }, [results]);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR").format(Math.round(amount));
  };

  const formatKorean = (amount: number): string => {
    const abs = Math.abs(amount);
    const eok = Math.floor(abs / 100000000);
    const man = Math.floor((abs % 100000000) / 10000);
    let r = amount < 0 ? "-" : "";
    if (eok > 0) r += `${eok}억`;
    if (man > 0) r += ` ${man.toLocaleString()}만`;
    return r ? `${r}원` : "0원";
  };

  const analysis = useMemo(() => {
    if (!results || results.length === 0) return null;

    const lastRow = results[results.length - 1];
    const firstRow = results[0];
    const totalSurplus = results.reduce((s, r) => s + r.yearlySurplus, 0);
    const minSurplusRow = results.reduce((min, r) => (r.yearlySurplus < min.yearlySurplus ? r : min), results[0]);
    const firstDeficitRow = results.find((r) => r.yearlySurplus < 0);
    const totalAssetEnd = lastRow.isaBalance + lastRow.pensionBalance + lastRow.overseasBalance + lastRow.savingsBalance;
    const totalAssetStart = firstRow.isaBalance + firstRow.pensionBalance + firstRow.overseasBalance + firstRow.savingsBalance;
    const avgLivingCost = results.reduce((s, r) => s + r.livingCost, 0) / results.length;
    const avgIncome = results.reduce((s, r) => s + r.totalIncome, 0) / results.length;

    // 계좌별 목표 잔액 역산 (시뮬레이션 실제 인출 데이터 기반)
    const retireAge = planInputs?.retirementStartAge ?? firstRow.age;
    const pensionAge = planInputs?.nationalPensionStartAge ?? 65;
    const bridgeYears = Math.max(0, pensionAge - retireAge);

    // 시뮬레이션 기간 동안 각 계좌에서 실제로 인출한 총액 = 그 계좌에 최소한 있어야 할 금액
    const totalPensionWithdrawal = results.reduce((s, r) => s + r.pensionAfterTax, 0);
    const totalISAWithdrawal = results.reduce((s, r) => s + r.isaWithdrawal, 0);
    const totalOverseasWithdrawal = results.reduce((s, r) => s + r.overseasDividend + r.overseasStockSale, 0);
    const totalSavingsWithdrawal = results.reduce((s, r) => s + r.savingsWithdrawal, 0);

    // 목표 = 실제 인출 총액 (1천만 단위 올림, 수익률 효과를 감안해 인출액의 80%로 조정)
    const targetPension = Math.max(0, Math.ceil(totalPensionWithdrawal * 0.8 / 10000000) * 10000000);
    const targetISA = Math.max(0, Math.ceil(totalISAWithdrawal * 0.8 / 10000000) * 10000000);
    const targetOverseas = Math.max(0, Math.ceil(totalOverseasWithdrawal * 0.8 / 10000000) * 10000000);
    const targetSavings = Math.max(0, Math.ceil(totalSavingsWithdrawal * 0.8 / 10000000) * 10000000);

    const accountTargets = {
      pension: { target: targetPension, current: firstRow.pensionBalance, label: "연금계좌 (퇴직+개인)" },
      isa: { target: targetISA, current: firstRow.isaBalance, label: "ISA" },
      overseas: { target: targetOverseas, current: firstRow.overseasBalance, label: "해외직투" },
      savings: { target: targetSavings, current: firstRow.savingsBalance, label: "예적금" },
    };

    // === 여유분 배분: 총 여유분의 50%만 활용 ===
    const safeBudget = Math.max(0, totalSurplus * 0.5);
    const currentMonthly = planInputs?.monthlyLivingCostBefore75 ?? 0;
    const currentRetireAge = planInputs?.retirementStartAge ?? firstRow.age;
    const simYears = results.length;
    const avgReturnRate = 0.04; // 평균 자산 수익률 가정 (4%)

    // 생활비 증가 역산: 월 X원 늘리면 → 연간 X*12원 추가지출 × 시뮬기간
    // + 복리 감소분: 늘린 만큼 자산이 덜 굴려지므로 복리 손실 반영
    // 복리 승수: 매년 추가지출이 수익률로 불어났을 금액의 합
    // = Σ(1+r)^(simYears-k) for k=1..simYears ≈ ((1+r)^n - 1) / r
    const compoundMultiplier = avgReturnRate > 0
      ? (Math.pow(1 + avgReturnRate, simYears) - 1) / avgReturnRate
      : simYears;
    // 월 추가금액 = safeBudget / (연간지출승수)
    // 연간지출승수 = 12 * compoundMultiplier (복리 손실 포함)
    const maxAdditionalMonthly = safeBudget > 0
      ? Math.floor(safeBudget / (12 * compoundMultiplier) / 100000) * 100000
      : 0;
    const maxAllowedMonthly = currentMonthly + maxAdditionalMonthly;

    // 은퇴 앞당기기 역산: n년 앞당기면
    // 비용 = n년분 추가 생활비 + 복리 손실 (n년간 자산이 굴려지지 않음)
    // 1년 앞당기기 비용 = 연생활비 × (1+r)^(simYears) (복리 기회비용 포함)
    let earlyRetireYears = 0;
    let cumulativeCost = 0;
    const maxEarly = Math.min(5, currentRetireAge - (planInputs?.currentAge ?? 35) - 5);
    for (let n = 1; n <= maxEarly; n++) {
      // n번째 해 앞당기기 비용: 생활비 + 그 금액이 복리로 굴려졌을 기회비용
      const yearlyCostWithCompound = avgLivingCost * Math.pow(1 + avgReturnRate, simYears - n + 1);
      cumulativeCost += yearlyCostWithCompound;
      if (cumulativeCost <= safeBudget) {
        earlyRetireYears = n;
      } else {
        break;
      }
    }
    const earliestRetireAge = earlyRetireYears > 0 ? currentRetireAge - earlyRetireYears : currentRetireAge;

    return {
      lastRow,
      firstRow,
      totalSurplus,
      minSurplusRow,
      firstDeficitRow,
      totalAssetEnd,
      totalAssetStart,
      avgLivingCost,
      avgIncome,
      simulationYears: results.length,
      bridgeYears,
      maxAdditionalMonthly,
      maxAllowedMonthly,
      earlyRetireYears,
      earliestRetireAge,
      accountTargets,
    };
  }, [results]);

  const scenarios = useMemo((): Scenario[] => {
    if (!analysis) return [];
    const items: Scenario[] = [];
    const isDeficit = !isFireSuccess;
    const totalDeficit = Math.abs(Math.min(0, analysis.totalSurplus));
    const simYears = analysis.simulationYears;

    if (isDeficit) {
      // ===== 적자 시: 적자 총액에서 역산하여 전략 강도 결정 =====
      const coverTarget = totalDeficit * 1.5; // 50% 안전 마진 (복리 효과 고려)

      // 전략별 커버 비율: 은퇴연기 40%, 생활비 25%, 추가저축 25%, 수익률 10%
      const delayBudget = coverTarget * 0.4;
      const livingBudget = coverTarget * 0.25;
      const savingsBudget = coverTarget * 0.25;

      // 1. 은퇴 시점 연기
      const delayYears = Math.min(10, Math.max(2, Math.ceil(delayBudget / Math.max(1, analysis.avgLivingCost))));
      items.push({
        id: "retire-delay",
        title: `은퇴 나이를 ${delayYears}년 늦추면?`,
        description: `지출은 ${formatKorean(delayYears * analysis.avgLivingCost)} 줄고, 은퇴 자산은 복리의 마법으로 더 단단해집니다.`,
        impact: `약 ${formatKorean(delayYears * analysis.avgLivingCost)} 지출 감소 + 복리 성장`,
        impactType: "positive",
        details: [
          `월급을 ${delayYears}년 더 받고, 모아둔 돈도 계속 불어나요`,
          "연금 받기 전 버텨야 할 기간도 짧아져요",
        ],
        advice: `${delayYears}년이라는 시간이 길게 느껴지시죠? 저도 그 무게를 잘 압니다. 하지만 이 ${delayYears}년은 단순히 '더 일하는 시간'이 아니라, 평생 마르지 않는 샘물을 파는 시간입니다. 자산이 스스로 불어날 시간을 벌어주면, 당신의 노후는 누구보다 단단해질 거예요.`,
        actionTip: "퇴근 후 루틴(운동, 취미)을 하나 만들어 번아웃을 관리하세요. 10년을 버티는 건 체력이 아니라 페이스 조절입니다. 본업 외 월 30~50만원의 소소한 부수입(블로그, 강의, 재능판매)을 만들어 두면, '언제든 그만둘 수 있다'는 심리적 여유가 생깁니다.",
        changes: [
          { field: 'retirementStartAge', value: 0, delta: delayYears, label: `은퇴 나이 +${delayYears}년` },
        ],
      });

      // 2. 생활비 절감
      const adjSimYears = simYears - delayYears;
      const monthlyCut = Math.min(1500000, Math.max(300000, Math.ceil(livingBudget / Math.max(1, adjSimYears) / 12 / 100000) * 100000));
      items.push({
        id: "expense-cut",
        title: `월 생활비를 ${(monthlyCut / 10000).toFixed(0)}만원 줄이면?`,
        description: `숨만 쉬어도 나가는 돈을 막으면, ${formatKorean(monthlyCut * 12 * adjSimYears)}이라는 거대한 방어막이 생깁니다.`,
        impact: `${adjSimYears}년간 약 ${formatKorean(monthlyCut * 12 * adjSimYears)} 절약`,
        impactType: "positive",
        details: [
          `매달 ${(monthlyCut / 10000).toFixed(0)}만원 아끼면, 1년에 ${formatAmount(monthlyCut * 12)}원이 남아요`,
        ],
        advice: `수익률 1% 올리기는 운에 맡겨야 하지만, 지출 ${(monthlyCut / 10000).toFixed(0)}만원 줄이기는 오늘부터 당신이 통제할 수 있는 영역입니다. 통제권을 되찾으세요.`,
        actionTip: "고정 지출 중 안 쓰는 OTT 구독, 과다한 보장성 보험부터 다이어트 해보세요.",
        changes: [
          { field: 'monthlyLivingCostBefore75', value: 0, delta: -monthlyCut, label: `75세 이전 -${(monthlyCut/10000).toFixed(0)}만원` },
          { field: 'monthlyLivingCostAfter75', value: 0, delta: -Math.round(monthlyCut * 0.7), label: `75세 이후 -${(Math.round(monthlyCut*0.7)/10000).toFixed(0)}만원` },
        ],
      });

      // 3. 추가 저축
      const additionalSavings = Math.max(10000000, Math.ceil(savingsBudget / 10000000) * 10000000);
      items.push({
        id: "add-savings",
        title: `예적금을 ${formatKorean(additionalSavings)} 더 모으면?`,
        description: `은퇴 시점까지 ${formatKorean(additionalSavings)}을 더 모으면 부족 자금을 직접 보전할 수 있습니다.`,
        impact: `월 ${formatAmount(Math.round(additionalSavings / Math.max(1, delayYears) / 12))}원씩 추가 적립 시 달성`,
        impactType: "positive",
        details: [
          `은퇴 전까지 ${formatKorean(additionalSavings)}을 더 모아야 해요`,
        ],
        advice: `갑작스러운 비정기 지출은 로드맵을 흔드는 가장 큰 적입니다. ${formatKorean(additionalSavings)}이라는 숫자가 커 보이지만, 보너스나 부업 수입을 차곡차곡 모으다 보면 어느덧 탈출을 위한 튼튼한 점프대가 완성될 거예요.`,
        actionTip: `월 ${formatAmount(Math.round(additionalSavings / Math.max(1, delayYears) / 12))}원이 부담된다면, 우선 부업이나 중고 거래 등 '작은 수입'부터 예적금 계좌로 자동 이체되도록 설정해 보세요.`,
        // changes 없음: 예적금 추가는 "채우기" 버튼에서만 반영 (중복 적용 방지)
      });

      // 4. 수익률 상향
      const rateBoost = totalDeficit > 500000000 ? 0.03 : 0.02;
      const rateBoostPct = Math.round(rateBoost * 100);
      items.push({
        id: "rate-boost",
        title: `투자 수익률을 ${rateBoostPct}%p 올리면?`,
        description: `수익률 ${rateBoostPct}% 차이가 노후 20년을 바꿉니다. 복리 효과로 자산 수명이 크게 연장됩니다.`,
        impact: `복리 효과로 자산 수명이 연장됩니다`,
        impactType: "positive",
        details: [
          "1년에 1~2번 자산 비중만 조정하면 돼요",
        ],
        advice: `수익률 ${rateBoostPct}% 차이가 노후 20년을 바꿉니다. 공격적인 투자보다는 배당 재투자와 정기적인 리밸런싱만으로도 충분히 도달 가능한 목표입니다. 시간이 당신의 편이 되게 만드세요.`,
        actionTip: "연 1~2회, 자산 비중이 깨졌을 때만 기계적으로 매수/매도하는 '리밸런싱 알람'을 설정하세요.",
        changes: [
          { field: 'isaReturnRate', value: 0, delta: rateBoost, label: `ISA +${rateBoostPct}%p` },
          { field: 'overseasReturnRate', value: 0, delta: rateBoost, label: `해외직투 +${rateBoostPct}%p` },
          { field: 'savingsReturnRate', value: 0, delta: rateBoost, label: `예적금 +${rateBoostPct}%p` },
        ],
      });

      // 5. 국민연금 연기
      const pensionDelay = Math.min(5, 70 - 65);
      items.push({
        id: "pension-delay",
        title: `국민연금을 ${pensionDelay}년 늦게 받으면?`,
        description: `${pensionDelay}년을 참으면 수령액이 ${(pensionDelay * 7.2).toFixed(1)}%나 늘어납니다. 종신 지급이라 오래 살수록 유리합니다.`,
        impact: `월 수령액 ${(pensionDelay * 7.2).toFixed(1)}% 증가 (종신 지급)`,
        impactType: "positive",
        details: [
          `${pensionDelay}년만 늦게 받으면 매달 연금이 ${(pensionDelay * 7.2).toFixed(1)}% 더 나와요`,
          "오래 살수록 이득, 77세부터 본전 이상",
        ],
        advice: `지금 당장 받는 것보다 ${pensionDelay}년을 참으면 수령액이 ${(pensionDelay * 7.2).toFixed(1)}%나 늘어납니다. 건강 관리에 자신 있다면, 이보다 확실하고 안전한 고수익 투자는 세상에 없습니다.`,
        actionTip: "연금 수령 전 기간 동안의 생활비를 ISA나 개인연금에서 꺼내 쓰는 '브릿지 전략'을 활용해 보세요.",
        changes: [
          { field: 'nationalPensionStartAge', value: 0, delta: pensionDelay, label: `국민연금 +${pensionDelay}년` },
        ],
      });

      // 6. 연금 골든라인 확보
      const retireAge = planInputs?.retirementStartAge ?? analysis.firstRow.age;
      const pensionAge = planInputs?.nationalPensionStartAge ?? 65;
      const bridgeYears = analysis.bridgeYears;
      if (analysis.accountTargets.pension.current < analysis.accountTargets.pension.target) {
        const pensionGap = analysis.accountTargets.pension.target - analysis.accountTargets.pension.current;
        items.push({
          id: "pension-golden",
          title: `세금은 줄이고 수령액은 높이는 연금 목표액: ${formatKorean(analysis.accountTargets.pension.target)}`,
          description: `${retireAge}세 은퇴 시점에 연금계좌 잔액이 최소 ${formatKorean(analysis.accountTargets.pension.target)}이 되어야 합니다. 연금 소득세 저율 과세 구간을 활용하면서 안정적인 현금흐름을 유지할 수 있어요.`,
          impact: `연금계좌 ${formatKorean(pensionGap)} 추가 확보 필요`,
          impactType: "positive",
          details: [
            `현재 잔액: ${formatKorean(analysis.accountTargets.pension.current)}`,
            `목표 잔액: ${formatKorean(analysis.accountTargets.pension.target)}`,
            "연금저축 연 900만원 납입 시 세액공제 최대 148.5만원",
          ],
          advice: `연금은 많이 넣는 것보다 '어떻게 인출하느냐'가 중요합니다. ${retireAge}세까지 이 금액을 맞추면 연간 1,500만원 이하 분리과세 혜택을 극대화할 수 있어요.`,
          actionTip: "연금저축 + IRP 합산 연 900만원 납입을 목표로 자동이체를 설정하세요.",
        });
      }

      // 7. 브릿지 자금 확보 (소득 공백기)
      if (bridgeYears > 0) {
        const bridgeTarget = analysis.accountTargets.isa.target + analysis.accountTargets.savings.target;
        const bridgeCurrent = analysis.accountTargets.isa.current + analysis.accountTargets.savings.current;
        if (bridgeCurrent < bridgeTarget) {
          const bridgeGap = bridgeTarget - bridgeCurrent;
          items.push({
            id: "bridge-fund",
            title: `국민연금 전까지 버틸 브릿지 자금: ${formatKorean(bridgeTarget)}`,
            description: `${retireAge}세부터 국민연금이 나오는 ${pensionAge}세까지 ${bridgeYears}년 동안 쓸 비과세 자산이 필요합니다. ISA와 예적금으로 이 금액을 미리 준비하세요.`,
            impact: `비과세 자산 ${formatKorean(bridgeGap)} 추가 확보 필요`,
            impactType: "positive",
            details: [
              `소득 공백기: ${retireAge}~${pensionAge - 1}세 (${bridgeYears}년)`,
              `현재 ISA+예적금: ${formatKorean(bridgeCurrent)}`,
              `목표: ${formatKorean(bridgeTarget)}`,
            ],
            advice: `연금 수령 전 ${bridgeYears}년이 가장 위험한 구간입니다. 이 '브릿지 자금'만 확보되면 당신의 탈출은 성공에 훨씬 가까워집니다.`,
            actionTip: "ISA 계좌에 매월 자동이체를 설정하고, 만기 시 연금계좌로 이전하면 추가 세액공제도 받을 수 있어요.",
          });
        }
      }

      // 8. 연금저축 신규 가입 (2·3층이 없는 경우)
      const hasPension = analysis.firstRow.pensionBalance > 0;
      if (!hasPension) {
        const remainingYearsToRetire = Math.max(0, (planInputs?.retirementStartAge ?? 65) - (planInputs?.currentAge ?? 50));
        const yearlyContrib = 6000000; // 연금저축 연 600만원
        const estimatedBalance = remainingYearsToRetire > 0
          ? Math.round(yearlyContrib * remainingYearsToRetire * 1.15) // 수익률 감안 대략치
          : yearlyContrib * 5; // 이미 은퇴했어도 5년 납입 가정
        items.push({
          id: "pension-new",
          title: "지금이라도 연금저축 가입: 절세 + 노후소득 확보",
          description: `퇴직연금·개인연금이 없으면 국민연금만으로 생활비를 감당해야 합니다. 연금저축은 나이·직업 제한 없이 누구나 가입 가능하며, 매년 최대 148.5만원의 세액공제와 저율 연금소득세(3.3~5.5%) 혜택을 받을 수 있어요.`,
          impact: `연 600만원 납입 시 매년 세액공제 최대 99만원`,
          impactType: "positive",
          details: [
            "가입 자격: 나이·소득 제한 없음 (은퇴자도 가능)",
            "세액공제: 연금저축 연 600만원 + IRP 합산 900만원까지",
            "수령 시 세금: 55세 이후 연 1,500만원 이하 분리과세 (3.3~5.5%)",
            remainingYearsToRetire > 0
              ? `${remainingYearsToRetire}년 납입 시 예상 잔액: 약 ${formatKorean(estimatedBalance)}`
              : "은퇴 후에도 가입·납입 가능 — 5년만 넣어도 세금 혜택이 큽니다",
          ],
          advice: "2층·3층 연금이 없다면, 지금 당장 연금저축 계좌를 하나 여는 것이 가장 먼저 할 일입니다. 은퇴 후라도 소득이 있으면 세액공제를 받을 수 있고, 소득이 없더라도 나중에 저율 과세로 수령할 수 있어요.",
          actionTip: "증권사 앱에서 '연금저축펀드' 계좌를 개설하고, 월 50만원 자동이체부터 시작하세요. ISA 만기 자금을 연금으로 이전하면 추가 세액공제도 받을 수 있습니다.",
          changes: [
            { field: 'totalPension', value: 0, delta: estimatedBalance, label: `연금저축 +${formatKorean(estimatedBalance)}` },
          ],
        });
      }

    } else {
      // ===== 성공 시: 보수적 최적화 =====
      items.push({
        id: "rate-boost",
        title: "투자 수익률 1%p 상향",
        description: `수익률을 1%p만 높여도 복리 효과로 최종 자산이 약 ${formatKorean(analysis.totalAssetEnd * 0.15)} 늘어납니다. 큰 변화 없이도 자산의 수명이 달라져요.`,
        impact: `최종 자산이 약 ${formatKorean(analysis.totalAssetEnd * 0.15)} 증가`,
        impactType: "positive",
        details: [
          "인덱스 펀드(S&P500, KOSPI200)로 시장 평균 수익률 확보",
          "배당금은 재투자하여 복리 효과 극대화",
          "연 1~2회 리밸런싱으로 수익률 안정화",
        ],
        advice: "공격적인 종목 선택보다 꾸준한 시장 평균 수익이 장기적으로 더 유리합니다. 시간이 당신의 편이 되게 만드세요.",
        actionTip: "매월 자동이체로 인덱스 ETF에 적립하고, 배당금 재투자 설정을 켜두세요.",
        changes: [
          { field: 'isaReturnRate', value: 0, delta: 0.01, label: 'ISA +1%p' },
          { field: 'overseasReturnRate', value: 0, delta: 0.01, label: '해외직투 +1%p' },
          { field: 'savingsReturnRate', value: 0, delta: 0.01, label: '예적금 +1%p' },
        ],
      });
      items.push({
        id: "expense-cut",
        title: "월 생활비 50만원 절감",
        description: `월 50만원을 줄이면 ${simYears}년간 ${formatKorean(500000 * 12 * simYears)}을 아낄 수 있어요. 가장 확실하고 즉각적인 효과를 볼 수 있는 전략입니다.`,
        impact: `${simYears}년간 ${formatKorean(500000 * 12 * simYears)} 절약`,
        impactType: "positive",
        details: [
          "안 쓰는 OTT·앱 구독 정리 (월 5~10만원)",
          "과다 보장성 보험 리뷰 (월 10~30만원)",
          "외식 빈도 조정, 통신비 요금제 변경",
        ],
        advice: "수익률 1% 올리기는 시장에 맡겨야 하지만, 지출 50만원 줄이기는 오늘부터 통제할 수 있는 영역입니다.",
        actionTip: "카드사 앱에서 최근 6개월 지출 내역을 뽑아보세요. 반복되는 소액 결제가 의외로 큽니다.",
        changes: [
          { field: 'monthlyLivingCostBefore75', value: 0, delta: -500000, label: '75세 이전 -50만원' },
          { field: 'monthlyLivingCostAfter75', value: 0, delta: -350000, label: '75세 이후 -35만원' },
        ],
      });
      items.push({
        id: "pension-delay",
        title: "국민연금 1년 연기",
        description: "국민연금을 1년 늦추면 월 수령액이 7.2% 늘어납니다. 종신 지급이라 오래 살수록 유리해요. 최대 5년 연기 시 36%까지 증가합니다.",
        impact: "월 수령액이 7.2% 증가",
        impactType: "positive",
        details: [
          "1년 연기: +7.2%, 3년 연기: +21.6%, 5년 연기: +36%",
          "종신 지급이므로 장수 리스크에 가장 강력한 대비책",
          "연기 기간 동안 다른 자산으로 생활비 충당 필요",
        ],
        advice: "국민연금 연기는 국가가 보증하는 최고의 수익률입니다. 다른 자산으로 연기 기간을 버틸 수 있다면 적극 고려하세요.",
        actionTip: "국민연금공단(nps.or.kr)에서 '연기연금' 신청이 가능합니다. 수령 개시 전에 신청해야 해요.",
        changes: [
          { field: 'nationalPensionStartAge', value: 0, delta: 1, label: '국민연금 +1년' },
        ],
      });
    }

    // 공통: 부채 조기 상환
    if (analysis.firstRow.debtBalance > 0) {
      items.push({
        id: "debt-payoff",
        title: "발목을 잡는 사슬을 끊어내세요: 부채 조기 상환",
        description: "대출 이자율이 투자 수익률보다 높다면, 빚을 갚는 것이 가장 확실한 재테크입니다.",
        impact: "이자 절감 + 현금흐름 개선",
        impactType: "positive",
        details: ["이자율 > 수익률이면 조기상환 유리", "상환 후 월 여유 발생"],
        advice: "매달 나가는 이자만 줄여도 당신의 심리적 은퇴 온도는 훨씬 따뜻해집니다.",
        actionTip: "금리가 높은 신용대출부터 우선 상환하고, 상환 후 남는 여유 자금은 즉시 투자 계좌로 돌리세요.",
        changes: [
          { field: 'monthlyDebtRepayment', value: 0, delta: 500000, label: '월 상환 +50만원' },
        ],
      });
    }

    // 공통: 자산 배분 (참고용, changes 없음)
    items.push({
      id: "rebalance",
      title: "자산 배분 조정",
      description: "나이에 따라 공격과 방어의 비중을 조정하면 시장 폭락에도 흔들리지 않습니다.",
      impact: "위험을 줄이면서 안정적 수입 확보",
      impactType: "neutral",
      details: [
        "50~60대: 주식 50% + 채권 30% + 현금 20%",
        "70대+: 주식 20% + 채권 40% + 현금 40%",
      ],
      advice: "젊을 때는 '창(주식)'을 크게 휘둘러 자산을 키워야 하지만, 나이가 들수록 '방패(채권/현금)'를 두껍게 다져야 합니다. 시장의 폭락에도 평온한 잠을 잘 수 있는 포트폴리오를 만드세요.",
      actionTip: "10년 주기로 주식 비중을 10%씩 낮추고 현금성 자산을 높이는 나만의 '자산 배분 스케줄'을 메모해 두세요.",
    });

    // 공통: 직장인 절세 계좌 최적화 (은퇴까지 2년 이상 남은 경우)
    const remainingYears = Math.max(0, (planInputs?.retirementStartAge ?? 65) - (planInputs?.currentAge ?? 50));
    if (remainingYears >= 2) {
      const annualPensionCredit = 9000000; // 연금저축+IRP 연 900만원
      const taxCreditRate = 0.132; // 13.2% (총급여 5,500만원 초과)
      const annualRefund = Math.round(annualPensionCredit * taxCreditRate);
      const totalRefund = annualRefund * remainingYears;
      const annualISA = 20000000; // ISA 연 2,000만원
      const isaTransferCredit = 3000000; // ISA 만기 시 연금 전환 추가 공제 (최대 300만원)
      const totalTaxBenefit = totalRefund + isaTransferCredit;
      // 환급금 재투자 수익 (연 5% 복리)
      const reinvestGrowth = (() => {
        let acc = 0;
        for (let y = 0; y < remainingYears; y++) {
          acc = (acc + annualRefund) * 1.05;
        }
        return Math.round(acc);
      })();

      items.push({
        id: "tax-optimization",
        title: `절세 3총사로 ${remainingYears}년간 ${formatKorean(reinvestGrowth)} 만들기`,
        description: `은퇴까지 남은 ${remainingYears}년, 세금만 잘 챙겨도 은퇴 자산이 크게 달라집니다. 매년 연말정산 환급금 ${formatKorean(annualRefund)}을 재투자하면 ${formatKorean(reinvestGrowth)}의 추가 자산이 생깁니다.`,
        impact: `${remainingYears}년간 절세 혜택 + 재투자 수익 약 ${formatKorean(reinvestGrowth)}`,
        impactType: "positive",
        details: [
          `연금저축/IRP: 매년 900만원 납입 → ${formatKorean(annualRefund)} 환급 (세율 13.2%)`,
          `ISA: 매년 2,000만원 납입 → 수익 비과세 + 만기 시 연금 전환으로 300만원 추가 공제`,
          `${remainingYears}년간 환급금 재투자 시 복리 효과: ${formatKorean(reinvestGrowth)}`,
        ],
        advice: `해외직투나 예적금에 잠자고 있는 돈을 ISA와 연금계좌로 옮기기만 해도 국가에서 매년 ${formatKorean(annualRefund)}의 현금을 돌려줍니다. 이 환급금만 모아 재투자해도 은퇴 시점에 ${formatKorean(reinvestGrowth)}의 추가 자산이 생깁니다. 같은 돈인데 어디에 담느냐에 따라 결과가 이렇게 달라져요.`,
        actionTip: `1. 연금저축: 매월 75만원 자동이체 설정 (연 900만원)\n2. ISA: 매월 167만원 납입 (연 2,000만원)\n3. 해외직투: 양도차익 250만원 공제 범위 내에서 수익 실현 후 절세 계좌로 재입금\n4. ISA 3년 만기 시 연금계좌 전환 → 추가 300만원 세액공제`,
      });
    }

    return items;
  }, [analysis, results, isFireSuccess]);

  if (!results || results.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)", margin: "0 0 6px" }}>
          Action Plan
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginBottom: 24 }}>
          은퇴 후 재무 전략 제안
        </p>
        <div style={{ padding: 40, textAlign: "center", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>시뮬레이션을 먼저 실행해주세요</p>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>은퇴 시뮬레이션 결과를 기반으로 맞춤형 Action Plan을 제안합니다</p>
        </div>
      </div>
    );
  }

  if (showSkeleton) return <ActionPlanSkeleton />;

  return (
    <div>
      {/* 모바일 뒤로가기 버튼 */}
      {onClose && (
        <div className="mobile-back-btn" style={{ display: "none", padding: "12px 16px", borderBottom: "1px solid var(--border-secondary)" }}>
          <button
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "inherit" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            시뮬레이션으로 돌아가기
          </button>
        </div>
      )}

      {/* 시뮬레이션 결과 히어로 배너 */}
      <div className="hero-banner" style={{
        marginBottom: 24,
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}>
        {/* 상단 색상 영역 */}
        <div style={{
          background: isFireSuccess
            ? "#00b1bb"
            : "linear-gradient(135deg, #dc2626 0%, #F04452 50%, #f87171 100%)",
          padding: "24px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "relative" as const,
          overflow: "hidden" as const,
        }}>
          {/* 닫기 버튼 */}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                position: "absolute" as const, top: 12, right: 12, zIndex: 2,
                width: 28, height: 28, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {/* 배경 장식 원형 */}
          <div style={{
            position: "absolute" as const, top: -40, right: -40,
            width: 140, height: 140, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }} />
          <div style={{
            position: "absolute" as const, bottom: -30, left: -20,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }} />
          {/* PC: 캐릭터 좌측 고정 */}
          <img
            className="hero-character"
            src={isFireSuccess ? "/images/result-success.png" : "/images/result-fail.png"}
            alt={isFireSuccess ? "성공" : "실패"}
            style={{
              width: 100, height: "auto",
              flexShrink: 0,
              position: "relative" as const,
              top: 10,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
            }}
          />
          {/* 우측: 텍스트 */}
          <div style={{ position: "relative" as const, flex: 1, minWidth: 0 }}>
            {/* 모바일: 캐릭터+제목 한 줄 */}
            <div className="hero-title-row" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <img
                className="hero-character-mobile"
                src={isFireSuccess ? "/images/result-success.png" : "/images/result-fail.png"}
                alt={isFireSuccess ? "성공" : "실패"}
                style={{
                  display: "none",
                  width: 80, height: "auto",
                  flexShrink: 0,
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
                }}
              />
              <div style={{ fontSize: isMobileDevice ? 21 : 17, fontWeight: 700, color: "#fff", lineHeight: isMobileDevice ? 1.5 : 1.4 }}>
                {isFireSuccess
                  ? (() => {
                      const parts: string[] = [];
                      if (originalInputs && planInputs) {
                        if (planInputs.retirementStartAge !== originalInputs.retirementStartAge) parts.push("은퇴시기");
                        if (planInputs.monthlyLivingCostBefore75 !== originalInputs.monthlyLivingCostBefore75) parts.push("생활비");
                        if (planInputs.nationalPensionStartAge !== originalInputs.nationalPensionStartAge) parts.push("연금수령시기");
                      }
                      return parts.length > 0
                        ? <>{parts.join(', ')}를<br />조절해서 탈출전략이 만들어졌어요.</>
                        : "든든한 계획이 완성되었어요.";
                    })()
                  : isMobileDevice ? <>{assetDepletionAge}세부터<br />지출이 수입을 추월하기 시작해요.</> : `${assetDepletionAge}세부터 지출이 수입을 추월하기 시작해요.`}
              </div>
            </div>
            {/* 설명 텍스트 */}
            {isFireSuccess && analysis && planInputs ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" as const }}>
                {planInputs.retirementStartAge}세에 은퇴하더라도 {planInputs.nationalPensionStartAge > planInputs.retirementStartAge
                  ? `${planInputs.nationalPensionStartAge}세부터 국민연금이 매년 ${formatKorean(planInputs.nationalPensionYearly)}씩 들어오고, `
                  : `국민연금이 매년 ${formatKorean(planInputs.nationalPensionYearly)}씩 뒷받침해주고, `}
                퇴직연금과 개인연금이 빈 자리를 채워주기 때문에 {planInputs.simulationEndAge}세까지 매년 현금흐름이 플러스를 유지합니다.
              </p>
            ) : analysis ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" as const }}>
                <p style={{ margin: '0 0 6px' }}>
                  {planInputs ? `${planInputs.retirementStartAge}세에 은퇴하면 ` : ''}
                  월 생활비 <PlanTooltip text={planInputs ? `입력한 생활비 ${formatAmount(planInputs.monthlyLivingCostBefore75)}원 + 건보료 약 ${formatAmount(Math.round(analysis.avgLivingCost / 12 - planInputs.monthlyLivingCostBefore75))}원이 합산된 금액이에요.` : '입력한 생활비에 건강보험료가 합산된 금액이에요.'}><span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' as const, textUnderlineOffset: 3, cursor: 'help' }}>{formatKorean(analysis.avgLivingCost / 12)}</span></PlanTooltip>으로
                  {planInputs && planInputs.nationalPensionStartAge > (planInputs.retirementStartAge || 55)
                    ? ` 국민연금 수령 전(${planInputs.retirementStartAge}~${planInputs.nationalPensionStartAge - 1}세) ${planInputs.nationalPensionStartAge - planInputs.retirementStartAge}년 동안 자산이 빠르게 줄어들기 시작합니다.`
                    : ' 수입보다 지출이 커서 자산이 빠르게 줄어들기 시작합니다.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* 하단 지표 */}
        {analysis && !isFireSuccess && (
          <div className="result-metrics" style={{ display: "grid", gridTemplateColumns: isMobileDevice ? "1fr" : "repeat(2, 1fr)", gap: 0 }}>
            <div style={{
              padding: "16px 12px",
              textAlign: isMobileDevice ? "left" as const : "center" as const,
              borderRight: isMobileDevice ? "none" : "1px solid var(--border-secondary)",
              borderBottom: isMobileDevice ? "1px solid var(--border-secondary)" : "none",
            }}>
              <div style={{ fontSize: isMobileDevice ? 15 : 13, fontWeight: isMobileDevice ? 600 : 500, color: isMobileDevice ? "var(--text-secondary)" : "var(--text-tertiary)", marginBottom: 4 }}>{isFireSuccess ? `${planInputs?.simulationEndAge ?? 90}세까지 남는 금액` : <>{`월 ${formatAmount(planInputs?.monthlyLivingCostBefore75 ?? 0)}원 기준,`}<br />{`${planInputs?.simulationEndAge ?? 90}세까지 부족한 모든 금액`}</>}</div>
              <div className="toss-number" style={{ fontSize: isMobileDevice ? 20 : 17, fontWeight: 800, color: isFireSuccess ? "var(--color-success)" : "var(--color-error)" }}>
                {formatKorean(Math.abs(analysis.totalSurplus))}
              </div>
            </div>
            <div style={{
              padding: "16px 12px",
              textAlign: isMobileDevice ? "left" as const : "center" as const,
            }}>
              <div style={{ fontSize: isMobileDevice ? 15 : 13, fontWeight: isMobileDevice ? 600 : 500, color: isMobileDevice ? "var(--text-secondary)" : "var(--text-tertiary)", marginBottom: 4 }}>가장 어려운 시점</div>
              <div style={{ fontSize: isMobileDevice ? 20 : 17, fontWeight: 800, color: "var(--text-primary)" }}>
                {analysis.minSurplusRow.age}세 ({formatKorean(analysis.minSurplusRow.yearlySurplus)})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 성공 시: 요약 섹션 */}
      {isFireSuccess && analysis && planInputs && (
        <div style={{ margin: "0 16px 16px", padding: 16, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: isMobileDevice ? 19 : 14, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: isMobileDevice ? 19 : 15 }}>&#128203;</span> 내 은퇴 플랜 요약
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(() => {
              const orig = originalInputs;
              const changed = (origVal: any, newVal: any) => orig && origVal !== newVal;
              const retireChanged = changed(orig?.retirementStartAge, planInputs.retirementStartAge);
              const costChanged = changed(orig?.monthlyLivingCostBefore75, planInputs.monthlyLivingCostBefore75);
              const pensionChanged = changed(orig?.nationalPensionStartAge, planInputs.nationalPensionStartAge);
              const tooltips: Record<string, string> = {
                "은퇴 시작": retireChanged
                  ? `은퇴 시기를 ${orig!.retirementStartAge}세에서 ${planInputs.retirementStartAge}세로 늦추면, 자산이 수익률로 ${planInputs.retirementStartAge - orig!.retirementStartAge}년 더 불어나고 생활비 지출 기간이 줄어듭니다. 국민연금 수령까지 공백 기간도 짧아져 자산 소진 위험이 크게 줄어요.`
                  : "은퇴 나이를 늦추면 ① 자산이 더 오래 불어나고 ② 생활비 기간이 줄고 ③ 국민연금 수령까지 공백이 짧아져요.",
                "월 생활비": costChanged
                  ? `월 생활비를 ${formatAmount(orig!.monthlyLivingCostBefore75)}원에서 ${formatAmount(planInputs.monthlyLivingCostBefore75)}원으로 줄이면, 연간 ${formatAmount((orig!.monthlyLivingCostBefore75 - planInputs.monthlyLivingCostBefore75) * 12)}원이 절감됩니다. 이 금액이 매년 쌓이면 은퇴 기간 전체로는 수억 원의 차이를 만들어요.`
                  : "생활비는 현재 가치 기준이며 물가상승률이 자동 반영됩니다.",
                "국민연금": pensionChanged
                  ? `국민연금 수령을 ${orig!.nationalPensionStartAge}세에서 ${planInputs.nationalPensionStartAge}세로 조정했습니다. ${planInputs.nationalPensionStartAge > 65 ? `연기수령은 1년당 7.2% 증액되어 더 많은 연금을 종신으로 받을 수 있어요.` : planInputs.nationalPensionStartAge < 65 ? `조기수령은 1년당 6% 감액되지만, 소득 공백기를 줄여 자산 소진을 막아줍니다.` : `정상 수령 시점입니다.`}`
                  : "국민연금은 물가상승률이 반영되는 종신연금입니다. 수령 시점이 은퇴 전략의 핵심이에요.",
                "연금 인출": planInputs.usePensionDepletion
                  ? "매년 균등하게 나눠 인출하여 종료 시점에 잔액이 0원이 됩니다. 자산을 남김없이 활용하는 전략이에요."
                  : "부족분만 꺼내 쓰므로 잔액이 최대한 유지됩니다. 연금소득 연 1,500만원 이하 시 분리과세로 절세할 수 있어요.",
                "시뮬 기간": `${planInputs.retirementStartAge}세부터 ${planInputs.simulationEndAge}세까지 ${analysis.simulationYears}년간 매년 현금흐름을 계산합니다. 이 기간 동안 자산이 유지되면 성공이에요.`,
                "부채": "은퇴 시점의 부채는 매년 원리금 상환으로 현금흐름을 압박합니다. 가능하면 은퇴 전 상환이 유리해요.",
              };
              // 은퇴 시작 값에 앞당기기 가능 정보 포함 (채우기+재계산 후에만)
              const showExtra = solutionPhase >= 3;
              const retireValue = showExtra && analysis.earlyRetireYears > 0
                ? `${planInputs.retirementStartAge}세 (${analysis.earliestRetireAge}세로 줄일 수 있어요)`
                : `${planInputs.retirementStartAge}세 (${planInputs.startYear}년)`;
              // 월 생활비 값에 증가 가능 정보 포함 (전략 반영 후에만)
              const maxMonthly = (planInputs.monthlyLivingCostBefore75 ?? 0) + analysis.maxAdditionalMonthly;
              const costValue = showExtra && analysis.maxAdditionalMonthly >= 100000
                ? `${formatAmount(planInputs.monthlyLivingCostBefore75)}원 (${formatAmount(maxMonthly)}원까지 늘려도 돼요)`
                : `${formatAmount(planInputs.monthlyLivingCostBefore75)}원 / 75세 이후 ${formatAmount(planInputs.monthlyLivingCostAfter75)}원`;
              return [
                { label: "은퇴 시작", value: retireValue, prev: changed(orig?.retirementStartAge, planInputs.retirementStartAge) ? `${orig!.retirementStartAge}세` : null },
                { label: "월 생활비", value: costValue, prev: changed(orig?.monthlyLivingCostBefore75, planInputs.monthlyLivingCostBefore75) ? `${formatAmount(orig!.monthlyLivingCostBefore75)}원` : null },
                ...(planInputs.nationalPensionYearly > 0 ? [{ label: "국민연금", value: `${planInputs.nationalPensionStartAge}세부터 연 ${formatAmount(planInputs.nationalPensionYearly)}원`, prev: changed(orig?.nationalPensionStartAge, planInputs.nationalPensionStartAge) ? `${orig!.nationalPensionStartAge}세` : null }] : []),
                { label: "연금 인출", value: planInputs.usePensionDepletion ? "매년 고르게 나눠 쓰기" : "필요할 때만 꺼내 쓰기", prev: null },
                { label: "시뮬 기간", value: `${analysis.simulationYears}년 (${planInputs.retirementStartAge}~${planInputs.simulationEndAge}세)`, prev: null },
                ...(planInputs.totalDebt > 0 && analysis.firstRow.debtBalance > 0 ? [{ label: "부채", value: `${formatAmount(analysis.firstRow.debtBalance)}원 (은퇴 시점 잔액)`, prev: null }] : planInputs.totalDebt > 0 ? [{ label: "부채", value: "은퇴 전 상환 완료", prev: null }] : []),
              ].map((item, i) => (
                isMobileDevice ? (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "6px 0", borderBottom: "1px solid var(--border-secondary)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "#00b1bb", fontWeight: 700 }}>&#10003;</span>
                      {tooltips[item.label] ? (
                        <PlanTooltip text={tooltips[item.label]}>{item.label} <Info size={14} style={{ opacity: 0.5, verticalAlign: "middle" }} /></PlanTooltip>
                      ) : item.label}
                    </span>
                    {item.prev ? (
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#00b1bb", paddingLeft: 18, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const, wordBreak: "keep-all" as const }}>
                        <span style={{ color: "var(--text-tertiary)", fontSize: 13, fontWeight: 400, whiteSpace: "nowrap" as const }}>{item.prev}</span>
                        <span style={{ fontSize: 13 }}>→</span>
                        <span style={{ wordBreak: "keep-all" as const }}>{item.value}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", paddingLeft: 18, wordBreak: "keep-all" as const }}>{item.value}</div>
                    )}
                  </div>
                ) : (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{ color: "#00b1bb", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>&#10003;</span>
                    <span style={{ color: "var(--text-tertiary)", minWidth: 65, flexShrink: 0 }}>
                      {tooltips[item.label] ? (
                        <PlanTooltip text={tooltips[item.label]}>{item.label} <Info size={11} style={{ opacity: 0.5, verticalAlign: "middle" }} /></PlanTooltip>
                      ) : item.label}
                    </span>
                    {item.prev ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, wordBreak: "keep-all" as const }}>
                        <span style={{ color: "var(--text-tertiary)", fontSize: 12, whiteSpace: "nowrap" as const }}>{item.prev}</span>
                        <span style={{ color: "#00b1bb", fontSize: 12 }}>→</span>
                        <span style={{ color: "#00b1bb", fontWeight: 700, wordBreak: "keep-all" as const }}>{item.value}</span>
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-primary)", fontWeight: 500, wordBreak: "keep-all" as const }}>{item.value}</span>
                    )}
                  </div>
                )
              ));
            })()}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-secondary)" }}>
            <div style={{ fontSize: isMobileDevice ? 15 : 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: isMobileDevice ? 15 : 13 }}>&#128161;</span> 핵심 포인트
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                `가장 어려운 시점: ${analysis.minSurplusRow.age}세 (남는 금액 ${formatKorean(analysis.minSurplusRow.yearlySurplus)})`,
                planInputs.nationalPensionStartAge > planInputs.retirementStartAge
                  ? `국민연금 수령 전(${planInputs.retirementStartAge}~${planInputs.nationalPensionStartAge - 1}세) ${planInputs.nationalPensionStartAge - planInputs.retirementStartAge}년이 관건`
                  : `국민연금이 은퇴 초기부터 현금흐름을 뒷받침합니다`,
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: isMobileDevice ? 14 : 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>&#8226;</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>


        </div>
      )}

      {/* 전략 안내 + 반영 버튼 (채우기 전에만 표시) */}
      {!isFireSuccess && Object.keys(filledAccounts).length === 0 && (
        <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0, textAlign: "center", lineHeight: 1.6, wordBreak: "keep-all" as const }}>
            어떻게 계획을 수정해야 탈출을 할 수 있을까요?
          </p>
          <button
            className={`apply-strategy-btn${isMobileDevice ? ' btn-escape-pulse' : ''}`}
            onClick={() => {
              const allChanges: StrategyChange[] = [];
              for (const s of scenarios) {
                if (s.changes && s.changes.length > 0) {
                  allChanges.push(...s.changes);
                }
              }
              setSolutionPhase(1);
              setFilledAccounts({});
              onApplyStrategies?.(allChanges, true);
            }}
            style={{ padding: "10px 24px", height: 53, fontSize: 14, fontWeight: 700, color: "#fff", background: "#00b1bb", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,177,187,0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> 탈출을 성공하려면?
          </button>
        </div>
      )}

      {/* 계좌별 목표 잔액 (실패 시 표시) */}
      {!isFireSuccess && analysis && analysis.accountTargets && (
        <div style={{ margin: "32px 16px 12px", padding: 16, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderTop: "3px solid var(--border-primary)" }}>
          <div style={{ fontSize: isMobileDevice ? 17 : 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            은퇴 전까지 최선을 다해서 채워볼까요?
          </div>
          <p style={{ fontSize: isMobileDevice ? 14 : 13, fontWeight: 500, color: isMobileDevice ? "var(--text-secondary)" : "var(--text-tertiary)", margin: "0 0 12px" }}>
            {planInputs?.retirementStartAge ?? 55}세까지 각 계좌에 이만큼 있으면, {planInputs?.simulationEndAge ?? 90}세까지 버틸 수 있어요.
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {Object.entries(analysis.accountTargets).filter(([, a]) => (a.target > 0 || a.current > 0) && (!isFireSuccess ? a.current < a.target : true)).map(([key, account]) => {
              const filledAmount = filledAccounts[key] ?? 0;
              const dragExtra = dragAmounts[key] ?? 0;
              const adjustedCurrent = account.current + filledAmount + dragExtra;
              const diff = adjustedCurrent - account.target;
              const isEnough = diff >= 0;
              const percent = account.target > 0 ? Math.round((adjustedCurrent / account.target) * 100) : 100;
              const gap = Math.max(0, account.target - (account.current + filledAmount));
              const isFilled = key in filledAccounts;
              return (
                <div key={key} style={{ padding: "10px 12px", borderRadius: 8, background: isFilled ? "rgba(0,177,187,0.06)" : "var(--bg-secondary)", border: isFilled ? "1px solid rgba(0,177,187,0.3)" : "1px solid transparent" }}>
                  {(() => {
                    const barColor = "#00b1bb";
                    const basePercent = account.target > 0 ? Math.min(100, Math.round((account.current + filledAmount) / account.target * 100)) : 0;
                    const fillPercent = Math.min(100, percent);
                    return (
                      <>
                        {/* 헤더: 라벨 + 채우기 */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: isMobileDevice ? 16 : 14, fontWeight: 700, color: "var(--text-primary)" }}>{account.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {isFilled ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {!isMobileDevice && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#00b1bb" }}>
                                  +{formatKorean(filledAccounts[key])} 반영됨 ✓
                                </span>
                                )}
                                <button
                                  onClick={() => {
                                    const amount = filledAccounts[key];
                                    const changes: StrategyChange[] = [];
                                    if (key === 'pension') {
                                      changes.push({ field: 'totalPension', value: 0, delta: -amount, label: `연금 -${formatKorean(amount)}` });
                                    } else if (key === 'isa') {
                                      changes.push({ field: 'husbandISA', value: 0, delta: -amount, label: `ISA -${formatKorean(amount)}` });
                                    } else if (key === 'overseas') {
                                      changes.push({ field: 'overseasInvestmentAmount', value: 0, delta: -amount, label: `해외직투 -${formatKorean(amount)}` });
                                    } else if (key === 'savings') {
                                      changes.push({ field: 'savingsAmount', value: 0, delta: -amount, label: `예적금 -${formatKorean(amount)}` });
                                    }
                                    if (changes.length > 0) {
                                      onApplyStrategies?.(changes, false);
                                      setFilledAccounts(prev => { const next = { ...prev }; delete next[key]; return next; });
                                    }
                                  }}
                                  style={{ padding: "2px 8px", fontSize: 10, fontWeight: 500, color: "var(--text-tertiary)", background: "none", border: "1px solid var(--border-primary)", borderRadius: 12, cursor: "pointer" }}
                                >
                                  취소
                                </button>
                              </div>
                            ) : isEnough ? (
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#00b1bb" }}>달성 ✓</span>
                            ) : (key === 'isa' && account.current >= 100000000) ? null : (
                              <button
                                onClick={() => {
                                  const amount = gap;
                                  const changes: StrategyChange[] = [];
                                  let filledAmt = amount;
                                  if (key === 'pension') {
                                    changes.push({ field: 'totalPension', value: 0, delta: amount, label: `연금 +${formatKorean(amount)}` });
                                  } else if (key === 'isa') {
                                    const isaMax = 100000000;
                                    const isaGap = Math.min(amount, Math.max(0, isaMax - account.current));
                                    filledAmt = isaGap;
                                    if (isaGap > 0) changes.push({ field: 'husbandISA', value: 0, delta: isaGap, label: `ISA +${formatKorean(isaGap)}` });
                                  } else if (key === 'overseas') {
                                    changes.push({ field: 'overseasInvestmentAmount', value: 0, delta: amount, label: `해외직투 +${formatKorean(amount)}` });
                                  } else if (key === 'savings') {
                                    changes.push({ field: 'savingsAmount', value: 0, delta: amount, label: `예적금 +${formatKorean(amount)}` });
                                  }
                                  if (changes.length > 0) {
                                    onApplyStrategies?.(changes, false);
                                    setFilledAccounts(prev => ({ ...prev, [key]: filledAmt }));
                                    setDragAmounts(prev => { const next = { ...prev }; delete next[key]; return next; });
                                    setTimeout(() => {
                                      if (isMobileDevice) {
                                        const recalcBtn = document.getElementById('btn-recalculate');
                                        if (recalcBtn) recalcBtn.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                      } else {
                                        const targetId = key === 'pension' ? 'section-pension' : `asset-${key}`;
                                        const el = document.getElementById(targetId);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }, 300);
                                  }
                                }}
                                style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#00b1bb", background: "none", border: "1.5px solid #00b1bb", borderRadius: 14, cursor: "pointer" }}
                              >
                                채우기
                              </button>
                            )}
                          </div>
                        </div>
                        {/* 프로그레스 바 */}
                        <div style={{ height: 6, borderRadius: 3, background: "var(--border-secondary)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3, width: `${fillPercent}%`,
                            background: isEnough
                              ? barColor
                              : `linear-gradient(90deg, ${barColor} ${Math.round(basePercent / Math.max(1, fillPercent) * 100)}%, ${barColor}88 ${Math.round(basePercent / Math.max(1, fillPercent) * 100)}%)`,
                            transition: "width 0.3s ease",
                          }} />
                        </div>
                        {/* 금액 라벨 */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: isMobileDevice ? 14 : 12, fontWeight: isMobileDevice ? 600 : 500 }}>
                          <span style={{ color: barColor }}>{formatKorean(adjustedCurrent)}</span>
                          <span style={{ color: isMobileDevice ? "var(--text-secondary)" : "var(--text-tertiary)" }}>{formatKorean(account.target)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              );
            })}
          </div>
          {analysis.bridgeYears > 0 && (
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-tertiary)", marginTop: 10, lineHeight: 1.5 }}>
              * 은퇴({planInputs?.retirementStartAge}세)부터 국민연금 수령({planInputs?.nationalPensionStartAge}세)까지 <strong style={{ color: "var(--text-secondary)" }}>{analysis.bridgeYears}년</strong>의 소득 공백기가 있습니다. ISA·예적금으로 이 기간을 버틸 수 있어야 합니다.
            </p>
          )}
          {Object.keys(filledAccounts).length > 0 && onRecalculate && (
            <button
              onClick={() => {
                // 전략 카드 변경사항도 함께 반영
                const allChanges: StrategyChange[] = [];
                for (const s of scenarios) {
                  if (s.changes && s.changes.length > 0) {
                    allChanges.push(...s.changes);
                  }
                }
                if (allChanges.length > 0) {
                  onApplyStrategies?.(allChanges, true);
                } else {
                  onRecalculate();
                }
                setFilledAccounts({});
                setSolutionPhase(3);
              }}
              id="btn-recalculate"
              className={isMobileDevice ? '' : 'recalc-btn-animate'}
              style={{
                width: "100%", marginTop: 12, padding: "12px 0",
                fontSize: 14, fontWeight: 700, color: "#fff",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 8, cursor: "pointer",
              }}
            >
              채운 금액으로 다시 계산하기
            </button>
          )}
        </div>
      )}

      {/* 시나리오 카드 목록 */}
      {isMobileDevice && (
        <div style={{ padding: "0 16px", marginBottom: 8, marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px 0" }}>제이의 추천 전략</h3>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>현재 상황에서 탈출 확률을 높이는 방법이에요.</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" }}>
        {scenarios.map((scenario, idx) => {
          const isChecked = checkedStrategies.has(scenario.id);
          const hasChanges = scenario.changes && scenario.changes.length > 0;
          return (
          <div
            key={scenario.id}
            style={{
              borderRadius: 12,
              border: "1px solid var(--border-primary)",
              background: "var(--bg-primary)",
              overflow: "hidden",
              transition: "box-shadow 0.2s, border 0.2s",
            }}
          >
            <div
              onClick={() => {
                setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id);
              }}
              style={{
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column" as const,
                gap: isMobileDevice ? 8 : 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!isMobileDevice && <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--color-profit-bg)",
                    fontSize: 13, fontWeight: 700,
                    color: "var(--color-profit)",
                  }}>
                    {idx + 1}
                  </div>}
                <div style={{ flex: 1, minWidth: 0, fontSize: isMobileDevice ? 19 : 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: isMobileDevice ? "-0.5px" : undefined }}>
                  {scenario.title}
                </div>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: expandedScenario === scenario.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: isMobileDevice ? 15 : 13, fontWeight: 500, color: isMobileDevice ? "var(--text-secondary)" : "var(--text-tertiary)", marginTop: 2, lineHeight: 1.6, wordBreak: "keep-all" as const, paddingLeft: isMobileDevice ? 0 : 38 }}>
                {scenario.description}
              </div>
            </div>

            {expandedScenario === scenario.id && (
              <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--border-secondary)" }}>
                {/* J의 조언 - 숨김 */}
                {/* 실행 팁 */}
                {scenario.actionTip && (
                  <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, border: "1px dashed var(--border-primary)", lineHeight: 1.7 }}>
                    <div style={{ fontSize: isMobileDevice ? 15 : 13, fontWeight: 700, color: "var(--color-profit)", marginBottom: 4 }}>실행 팁</div>
                    <div style={{ fontSize: isMobileDevice ? 15 : 13, color: isMobileDevice ? "var(--text-primary)" : "var(--text-secondary)", margin: 0, wordBreak: "keep-all" as const }}>{scenario.actionTip!.split(/\n|(?=\d+\.\s)/).filter(Boolean).map((line, i) => <p key={i} style={{ margin: '0 0 4px' }}>{line.trim()}</p>)}</div>
                  </div>
                )}
                {/* 상세 정보 */}
                <div style={{ paddingTop: 10 }}>
                  {scenario.details.map((detail, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "6px 0", paddingLeft: 12, fontSize: isMobileDevice ? 15 : 13, color: "var(--text-primary)", lineHeight: 1.5, borderBottom: i < scenario.details.length - 1 ? "1px solid var(--border-secondary)" : "none" }}>
                      {scenario.details.length > 1 && <span style={{ color: "var(--accent-blue)", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>}
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div style={{ height: 120 }} />

      {/* 관리자 전용: 기능 설명 버튼 */}
      {isAdmin() && (
        <button
          onClick={() => setShowDevNote(true)}
          style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 100,
            width: 40, height: 40, borderRadius: "50%",
            background: "#6366f1", color: "#fff", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(99,102,241,0.4)",
          }}
        >
          <Info size={20} />
        </button>
      )}

      {/* 관리자 전용: 기능 설명 팝업 */}
      {showDevNote && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-primary)", borderRadius: 16, maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto", padding: "24px 28px", position: "relative" }}>
            <button onClick={() => setShowDevNote(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>v2.4 업데이트 노트</h2>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
              <div style={{ padding: 14, borderRadius: 10, background: "var(--accent-blue-bg)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 6 }}>1. 계좌별 권장 잔액</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  시뮬레이션에서 각 계좌(연금/ISA/해외직투/예적금)의 <strong>실제 인출 총액</strong>을 역산하여 은퇴 시점 최소 필요 잔액을 자동 계산합니다.
                  수익률 효과를 감안해 인출 총액의 80%를 목표로 설정합니다. 프로그레스 바로 달성률을 시각화합니다.
                </p>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "#FFF0F0" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>2. 전략 카드: 연금 골든라인</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  실패 시, 연금계좌 잔액이 목표에 미달하면 <strong>"연금 골든라인 확보"</strong> 카드가 자동 생성됩니다.
                  연금 소득세 분리과세(1,500만원 이하) 혜택과 연결하여 목표 금액을 안내합니다.
                </p>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "#FFFBEB" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#d97706", marginBottom: 6 }}>3. 전략 카드: 브릿지 자금</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  은퇴~국민연금 수령 전 <strong>"소득 공백기"</strong>를 ISA+예적금으로 메울 수 있도록
                  목표 금액과 현재 잔액의 차이를 안내합니다. 공백기가 0년이면 이 카드는 표시되지 않습니다.
                </p>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-secondary)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>4. 역산 로직 상세</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  <strong>목표 = 시뮬레이션 기간 실제 인출 총액 × 0.8</strong><br />
                  • 연금: pensionAfterTax 합계<br />
                  • ISA: isaWithdrawal 합계<br />
                  • 해외: overseasDividend + overseasStockSale 합계<br />
                  • 예적금: savingsWithdrawal 합계<br />
                  수익률 복리 효과로 시작 잔액 &lt; 인출 총액이 가능하므로 80% 조정 적용.
                </p>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "#F0FDF4" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#059669", marginBottom: 6 }}>5. 전략 카드: 직장인 절세 3총사</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  은퇴까지 <strong>2년 이상 남은 직장인</strong>에게 표시됩니다. 성공/실패 모두 공통으로 노출.<br /><br />
                  <strong>계산 로직:</strong><br />
                  • 연금저축+IRP: 연 900만원 × 세율 13.2% = 연 118.8만원 환급<br />
                  • 환급금 재투자: 매년 환급액을 연 5% 복리로 누적 → 은퇴 시점 총액 산출<br />
                  • ISA: 연 2,000만원 납입, 만기 시 연금 전환 → 추가 300만원 세액공제<br /><br />
                  <strong>표시 조건:</strong> (retirementStartAge - currentAge) &gt;= 2<br />
                  <strong>핵심 메시지:</strong> 같은 돈이라도 어디에 담느냐에 따라 세금 환급 + 복리 효과로 수천만원 차이 발생
                </p>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "#EFF6FF" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>6. 계좌별 채우기 기능</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  <strong>표시 조건:</strong> 성공 시에만 부족한 계좌에 "채우기" 버튼 노출. 실패 시 숨김.<br /><br />
                  <strong>동작:</strong> 채우기 클릭 → 부족 금액만큼 해당 계좌 입력값에 delta 추가 → additionalAssets/personalPensions 배열도 동기화 → autoRecalculate=false로 "다시 계산" 버튼 노출<br /><br />
                  <strong>연금계좌:</strong> totalPension + personalPensions[0].balance에 반영<br />
                  <strong>ISA:</strong> husbandISA + additionalAssets(isa).balance에 반영<br />
                  <strong>해외직투:</strong> overseasInvestmentAmount + additionalAssets(overseas).balance에 반영<br />
                  <strong>예적금:</strong> savingsAmount + additionalAssets(savings).balance에 반영
                </p>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: "#FEFCE8" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#a16207", marginBottom: 6 }}>7. 세금 반영 여부</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
                  • <strong>연금(pensionAfterTax):</strong> 세후. 1,500만원 이하 저율과세(3.3~5.5%), 초과분 사용자설정세율(기본15%) 적용<br />
                  • <strong>ISA(isaWithdrawal):</strong> 비과세/분리과세. 인출액 = 세후<br />
                  • <strong>해외(overseasDividend):</strong> 15.4% 원천징수 반영 세후<br />
                  • <strong>예적금(savingsWithdrawal):</strong> 세금 없음. 인출액 = 세후<br /><br />
                  <strong>권장 잔액 = 세후 인출 총액 × 0.8</strong> (복리 운용 효과 감안)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
