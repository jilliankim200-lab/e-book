import { useState, useMemo, useRef, useEffect } from "react";
import { Wallet, TrendingUp, Clock, RefreshCw, Target, Info, X } from "lucide-react";
import { isAdmin } from "./PasswordGate2";

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

export function ActionPlan({ results, isFireSuccess, assetDepletionAge, onApplyStrategies, onRecalculate, inputs: planInputs, originalInputs, onClose }: ActionPlanProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [applyMode, setApplyMode] = useState(false);
  const [checkedStrategies, setCheckedStrategies] = useState<Set<string>>(new Set());
  const [showDevNote, setShowDevNote] = useState(false);
  const [filledAccounts, setFilledAccounts] = useState<Record<string, number>>({});
  // phase: 0=초기(아무것도 안 보임), 1=즉시탈출 직후(앞당기기+채우기+여유 모두 표시), 2=재계산 후(채우기만), 3=채우기 재계산 후(모두 숨김)
  const [solutionPhase, setSolutionPhase] = useState(0);
  const prevResultsRef = useRef(results);
  useEffect(() => {
    if (prevResultsRef.current !== results && solutionPhase === 1) {
      setSolutionPhase(2);
    }
    prevResultsRef.current = results;
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

    // 최대 허용 생활비 역산: 가장 적은 잉여 연도 기준
    // minSurplus가 양수면 그만큼 생활비를 더 쓸 수 있음
    const minYearlySurplus = minSurplusRow.yearlySurplus;
    // 안전마진 30% 적용, 10만원 단위 내림
    const maxAdditionalMonthly = minYearlySurplus > 0
      ? Math.floor(minYearlySurplus * 0.7 / 12 / 100000) * 100000
      : 0;
    const currentMonthly = planInputs?.monthlyLivingCostBefore75 ?? 0;
    const maxAllowedMonthly = currentMonthly + maxAdditionalMonthly;

    // 은퇴 나이 앞당기기 역산
    // 1년 앞당기면: 추가 생활비 1년분 + 소득 공백 1년 늘어남 + 자산 운용 기간 1년 늘어남
    // 보수적 계산: 최소 잉여 연도 기준, 앞당긴 기간 × 첫해 생활비로 감당 가능한지
    const currentRetireAge = planInputs?.retirementStartAge ?? firstRow.age;
    const firstYearLivingCost = firstRow.livingCost;
    // 총 잉여에서 최소 잉여 연도의 안전마진을 뺀 순수 여유분
    // n년 앞당기면: n년분 생활비 추가 + n년간 소득공백 + 자산 축적 기간 단축
    // 보수적 공식: n년 앞당기는 비용 = n × (n+1) / 2 × 연생활비 (누적 복리 효과)
    // 즉 1년=1배, 2년=3배, 3년=6배, 4년=10배... 로 비용이 급증
    const safeTotal = Math.max(0, totalSurplus * 0.5); // 총 잉여의 50%만 사용
    let earlyRetireYears = 0;
    let cumulativeCost = 0;
    const maxEarly = Math.min(5, currentRetireAge - (planInputs?.currentAge ?? 35) - 5); // 최대 5년, 현재나이+5년은 남김
    for (let n = 1; n <= maxEarly; n++) {
      cumulativeCost += avgLivingCost * n; // 누적 비용이 가속
      if (cumulativeCost <= safeTotal) {
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
        title: `평생 마르지 않는 샘물을 파는 시간: 은퇴 ${delayYears}년 연기`,
        description: `지출은 ${formatKorean(delayYears * analysis.avgLivingCost)} 줄고, 은퇴 자산은 복리의 마법으로 더 단단해집니다.`,
        impact: `약 ${formatKorean(delayYears * analysis.avgLivingCost)} 지출 감소 + 복리 성장`,
        impactType: "positive",
        details: [
          `${delayYears}년간 추가 소득 + 복리 성장`,
          "국민연금 수령 시기까지의 간극도 줄어듭니다",
        ],
        advice: `${delayYears}년이라는 시간이 길게 느껴지시죠? 저도 그 무게를 잘 압니다. 하지만 이 ${delayYears}년은 단순히 '더 일하는 시간'이 아니라, 평생 마르지 않는 샘물을 파는 시간입니다. 자산이 스스로 불어날 시간을 벌어주면, 당신의 노후는 누구보다 단단해질 거예요.`,
        actionTip: "현재 직무에서 스트레스를 줄일 수 있는 '안식월'이나 '보직 변경'을 고려해 보세요. 무작정 버티기보다 환경을 바꾸는 것이 핵심입니다.",
        changes: [
          { field: 'retirementStartAge', value: 0, delta: delayYears, label: `은퇴 나이 +${delayYears}년` },
        ],
      });

      // 2. 생활비 절감
      const adjSimYears = simYears - delayYears;
      const monthlyCut = Math.min(1500000, Math.max(300000, Math.ceil(livingBudget / Math.max(1, adjSimYears) / 12 / 100000) * 100000));
      items.push({
        id: "expense-cut",
        title: `작은 구멍이 배를 가라앉힙니다: 월 ${(monthlyCut / 10000).toFixed(0)}만원 절감`,
        description: `숨만 쉬어도 나가는 돈을 막으면, ${formatKorean(monthlyCut * 12 * adjSimYears)}이라는 거대한 방어막이 생깁니다.`,
        impact: `${adjSimYears}년간 약 ${formatKorean(monthlyCut * 12 * adjSimYears)} 절약`,
        impactType: "positive",
        details: [
          `연간 절감액: ${formatAmount(monthlyCut * 12)}원`,
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
        title: `든든한 비상금, 탈출을 위한 안전 점프대: ${formatKorean(additionalSavings)} 확보`,
        description: `은퇴 시점까지 ${formatKorean(additionalSavings)}을 더 모으면 부족 자금을 직접 보전할 수 있습니다.`,
        impact: `월 ${formatAmount(Math.round(additionalSavings / Math.max(1, delayYears) / 12))}원씩 추가 적립 시 달성`,
        impactType: "positive",
        details: [
          `필요 추가 저축: ${formatKorean(additionalSavings)}`,
        ],
        advice: `갑작스러운 비정기 지출은 로드맵을 흔드는 가장 큰 적입니다. ${formatKorean(additionalSavings)}이라는 숫자가 커 보이지만, 보너스나 부업 수입을 차곡차곡 모으다 보면 어느덧 탈출을 위한 튼튼한 점프대가 완성될 거예요.`,
        actionTip: `월 ${formatAmount(Math.round(additionalSavings / Math.max(1, delayYears) / 12))}원이 부담된다면, 우선 부업이나 중고 거래 등 '작은 수입'부터 예적금 계좌로 자동 이체되도록 설정해 보세요.`,
        changes: [
          { field: 'savingsAmount', value: 0, delta: additionalSavings, label: `예적금 +${formatKorean(additionalSavings)}` },
        ],
      });

      // 4. 수익률 상향
      const rateBoost = totalDeficit > 500000000 ? 0.03 : 0.02;
      const rateBoostPct = Math.round(rateBoost * 100);
      items.push({
        id: "rate-boost",
        title: `복리의 마법에 가속도를 붙이세요: 수익률 ${rateBoostPct}%p 상향`,
        description: `수익률 ${rateBoostPct}% 차이가 노후 20년을 바꿉니다. 복리 효과로 자산 수명이 크게 연장됩니다.`,
        impact: `복리 효과로 자산 수명이 연장됩니다`,
        impactType: "positive",
        details: [
          "연 1~2회 리밸런싱으로 충분히 도달 가능",
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
        title: `기다림의 미학, 국가가 보증하는 최고의 수익률: ${pensionDelay}년 연기`,
        description: `${pensionDelay}년을 참으면 수령액이 ${(pensionDelay * 7.2).toFixed(1)}%나 늘어납니다. 종신 지급이라 오래 살수록 유리합니다.`,
        impact: `월 수령액 ${(pensionDelay * 7.2).toFixed(1)}% 증가 (종신 지급)`,
        impactType: "positive",
        details: [
          `${pensionDelay}년 연기 = ${(pensionDelay * 7.2).toFixed(1)}% 증액`,
          "기대수명이 길수록 유리 (손익분기: 77~80세)",
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
      title: "나이에 맞는 방패와 창의 조화: 자산 배분 조정",
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
        title: `직장인 최후의 보너스: 절세 3총사로 ${remainingYears}년간 ${formatKorean(reinvestGrowth)} 만들기`,
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
      <div style={{
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
          {/* 좌측: 캐릭터 */}
          <img
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
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              {isFireSuccess
                ? "든든한 계획이 완성되었어요."
                : `${assetDepletionAge}세부터 지출이 수입을 추월하기 시작해요.`}
            </div>
            {isFireSuccess && analysis && planInputs ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" as const }}>
                {planInputs.retirementStartAge}세에 은퇴하더라도 {planInputs.nationalPensionStartAge > planInputs.retirementStartAge
                  ? `${planInputs.nationalPensionStartAge}세부터 국민연금이 매년 ${formatKorean(planInputs.nationalPensionYearly)}씩 들어오고, `
                  : `국민연금이 매년 ${formatKorean(planInputs.nationalPensionYearly)}씩 뒷받침해주고, `}
                퇴직연금과 개인연금이 빈 자리를 채워주기 때문에 {planInputs.simulationEndAge}세까지 매년 현금흐름이 플러스를 유지합니다.
                {analysis.totalSurplus > 0 && ` 최종적으로 ${formatKorean(analysis.totalSurplus)}이 남습니다.`}
              </p>
            ) : analysis ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0, wordBreak: "keep-all" as const }}>
                <p style={{ margin: '0 0 6px' }}>
                  {planInputs ? `${planInputs.retirementStartAge}세에 은퇴하면 ` : ''}
                  월 생활비 {formatKorean(analysis.avgLivingCost / 12)}으로
                  {planInputs && planInputs.nationalPensionStartAge > (planInputs.retirementStartAge || 55)
                    ? ` 국민연금 수령 전(${planInputs.retirementStartAge}~${planInputs.nationalPensionStartAge - 1}세) ${planInputs.nationalPensionStartAge - planInputs.retirementStartAge}년 동안 자산이 버틸 수 있는 힘이 급격히 약해집니다.`
                    : ' 수입보다 지출이 커서 자산이 버틸 수 있는 힘이 급격히 약해집니다.'}
                </p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>
                  걱정 마세요. 제이가 찾은 아래 전략들을 반영하면 충분히 자산 수명을 늘릴 수 있어요.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* 하단 지표 */}
        {analysis && (
          <div className="result-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0 }}>
            <div style={{
              padding: "16px 12px",
              textAlign: "center" as const,
              borderRight: "1px solid var(--border-secondary)",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>{isFireSuccess ? `${planInputs?.simulationEndAge ?? 90}세까지 남는 금액` : `월 ${formatAmount(planInputs?.monthlyLivingCostBefore75 ?? 0)}원 기준, ${planInputs?.simulationEndAge ?? 90}세까지 부족한 금액`}</div>
              <div className="toss-number" style={{ fontSize: 15, fontWeight: 700, color: isFireSuccess ? "var(--color-success)" : "var(--color-error)", whiteSpace: "nowrap" }}>
                {formatKorean(Math.abs(analysis.totalSurplus))}
              </div>
            </div>
            <div style={{
              padding: "16px 12px",
              textAlign: "center" as const,
            }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>가장 어려운 시점</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                {analysis.minSurplusRow.age}세 ({formatKorean(analysis.minSurplusRow.yearlySurplus)})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 성공 시: 요약 섹션 */}
      {isFireSuccess && analysis && planInputs && (
        <div style={{ margin: "0 16px 16px", padding: 16, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>&#128203;</span> 내 은퇴 플랜 요약
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(() => {
              const orig = originalInputs;
              const changed = (origVal: any, newVal: any) => orig && origVal !== newVal;
              return [
                { label: "은퇴 시작", value: `${planInputs.retirementStartAge}세 (${planInputs.startYear}년)`, prev: changed(orig?.retirementStartAge, planInputs.retirementStartAge) ? `${orig!.retirementStartAge}세` : null },
                { label: "월 생활비", value: `${formatAmount(planInputs.monthlyLivingCostBefore75)}원 / 75세 이후 ${formatAmount(planInputs.monthlyLivingCostAfter75)}원`, prev: changed(orig?.monthlyLivingCostBefore75, planInputs.monthlyLivingCostBefore75) ? `${formatAmount(orig!.monthlyLivingCostBefore75)}원` : null },
                { label: "국민연금", value: `${planInputs.nationalPensionStartAge}세부터 연 ${formatAmount(planInputs.nationalPensionYearly)}원`, prev: changed(orig?.nationalPensionStartAge, planInputs.nationalPensionStartAge) ? `${orig!.nationalPensionStartAge}세` : null },
                { label: "연금 인출", value: planInputs.usePensionDepletion ? "매년 고르게 나눠 쓰기" : "필요할 때만 꺼내 쓰기", prev: null },
                { label: "시뮬 기간", value: `${analysis.simulationYears}년 (${planInputs.retirementStartAge}~${planInputs.simulationEndAge}세)`, prev: null },
                ...(planInputs.totalDebt > 0 && analysis.firstRow.debtBalance > 0 ? [{ label: "부채", value: `${formatAmount(analysis.firstRow.debtBalance)}원 (은퇴 시점 잔액)`, prev: null }] : planInputs.totalDebt > 0 ? [{ label: "부채", value: "은퇴 전 상환 완료", prev: null }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1.5 }}>
                  <span style={{ color: "#00b1bb", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>&#10003;</span>
                  <span style={{ color: "var(--text-tertiary)", minWidth: 65, flexShrink: 0 }}>{item.label}</span>
                  {item.prev ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{item.prev}</span>
                      <span style={{ color: "#00b1bb", fontSize: 12 }}>→</span>
                      <span style={{ color: "#00b1bb", fontWeight: 700 }}>{item.value}</span>
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.value}</span>
                  )}
                </div>
              ));
            })()}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-secondary)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13 }}>&#128161;</span> 핵심 포인트
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                `가장 어려운 시점: ${analysis.minSurplusRow.age}세 (남는 금액 ${formatKorean(analysis.minSurplusRow.yearlySurplus)})`,
                planInputs.nationalPensionStartAge > planInputs.retirementStartAge
                  ? `국민연금 수령 전(${planInputs.retirementStartAge}~${planInputs.nationalPensionStartAge - 1}세) ${planInputs.nationalPensionStartAge - planInputs.retirementStartAge}년이 관건`
                  : `국민연금이 은퇴 초기부터 현금흐름을 뒷받침합니다`,
                analysis.totalSurplus >= 0
                  ? `${planInputs?.simulationEndAge ?? 90}세까지 남는 금액: ${formatKorean(analysis.totalSurplus)}`
                  : `월 ${formatAmount(planInputs?.monthlyLivingCostBefore75 ?? 0)}원 기준, ${planInputs?.simulationEndAge ?? 90}세까지 부족한 금액: ${formatKorean(Math.abs(analysis.totalSurplus))}`,
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>&#8226;</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 잉여금 활용 옵션 (성공이고 여유가 있을 때) */}
          {isFireSuccess && (analysis.maxAdditionalMonthly >= 100000 || analysis.earlyRetireYears > 0) && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-secondary)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>자산에 여유가 있어요. 어떻게 활용할까요?</p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {analysis.earlyRetireYears > 0 && (
                  <button
                    onClick={() => {
                      const changes: StrategyChange[] = [
                        { field: 'retirementStartAge', value: 0, delta: -analysis.earlyRetireYears, label: `은퇴 -${analysis.earlyRetireYears}년` },
                      ];
                      onApplyStrategies?.(changes, false);
                      setSolutionPhase(2);
                      setTimeout(() => onRecalculate?.(), 100);
                    }}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ textAlign: "left" as const }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 2 }}>
                        <Clock size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        은퇴를 {analysis.earlyRetireYears}년 앞당길까요?
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {analysis.earliestRetireAge}세에 탈출해도 자산이 유지됩니다
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                )}
                {analysis.maxAdditionalMonthly >= 100000 && (
                  <button
                    onClick={() => {
                      const additional = analysis.maxAdditionalMonthly;
                      const newCost = (planInputs?.monthlyLivingCostBefore75 ?? 0) + additional;
                      const changes: StrategyChange[] = [
                        { field: 'monthlyLivingCostBefore75', value: 0, delta: additional, label: `생활비 +${Math.round(additional / 10000)}만원` },
                        { field: 'monthlyLivingCostAfter75', value: 0, delta: Math.round(additional * 0.7), label: `75세 이후 자동 조정` },
                      ];
                      onApplyStrategies?.(changes, false);
                      setSolutionPhase(2);
                      setTimeout(() => onRecalculate?.(), 100);
                    }}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(0,177,187,0.3)", background: "rgba(0,177,187,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ textAlign: "left" as const }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#00b1bb", marginBottom: 2 }}>
                        <Wallet size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        월 생활비를 {formatAmount(analysis.maxAdditionalMonthly)}원 늘려볼까요?
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        월 {formatAmount((planInputs?.monthlyLivingCostBefore75 ?? 0) + analysis.maxAdditionalMonthly)}원까지 안전합니다
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b1bb" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {/* 계좌별 목표 잔액 (phase 1,2에서 표시) */}
      {analysis && analysis.accountTargets && (solutionPhase === 1 || solutionPhase === 2) && (
        <div style={{ margin: "0 16px 16px", padding: 16, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Target size={15} /> {planInputs?.retirementStartAge ?? 55}세 은퇴 시점, 계좌별 권장 잔액
          </div>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 12px" }}>
            {planInputs?.simulationEndAge ?? 90}세까지 자산이 유지되기 위한 최소 금액입니다.
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {Object.entries(analysis.accountTargets).filter(([, a]) => a.target > 0 || a.current > 0).map(([key, account]) => {
              const filledAmount = filledAccounts[key] ?? 0;
              const adjustedCurrent = account.current + filledAmount;
              const diff = adjustedCurrent - account.target;
              const isEnough = diff >= 0;
              const percent = account.target > 0 ? Math.round((adjustedCurrent / account.target) * 100) : 100;
              const fieldMap: Record<string, string> = {
                pension: 'pensionBalance',
                isa: 'isaBalance',
                overseas: 'overseasBalance',
                savings: 'savingsBalance',
              };
              const gap = Math.abs(diff);
              const isFilled = key in filledAccounts;
              return (
                <div key={key} style={{ padding: "10px 12px", borderRadius: 8, background: isFilled ? "rgba(0,177,187,0.06)" : "var(--bg-secondary)", border: isFilled ? "1px solid rgba(0,177,187,0.3)" : "1px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{account.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isFilled ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#00b1bb" }}>
                            +{formatKorean(filledAccounts[key])} 반영됨 ✓
                          </span>
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
                            style={{ padding: "2px 8px", fontSize: 10, fontWeight: 500, color: "var(--text-tertiary)", background: "none", border: "1px solid var(--border-primary)", borderRadius: 4, cursor: "pointer" }}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 600, color: isEnough ? "#00b1bb" : "var(--color-error)" }}>
                          {isEnough ? "달성" : `${formatKorean(gap)} 부족`}
                        </span>
                      )}
                      {!isEnough && isFireSuccess && !isFilled && (
                        <button
                          onClick={() => {
                            const changes: StrategyChange[] = [];
                            let filledAmount = gap;
                            if (key === 'pension') {
                              changes.push({ field: 'totalPension', value: 0, delta: gap, label: `연금 +${formatKorean(gap)}` });
                            } else if (key === 'isa') {
                              const isaMax = 100000000;
                              const isaGap = Math.min(gap, Math.max(0, isaMax - account.current));
                              filledAmount = isaGap;
                              if (isaGap > 0) changes.push({ field: 'husbandISA', value: 0, delta: isaGap, label: `ISA +${formatKorean(isaGap)}` });
                            } else if (key === 'overseas') {
                              changes.push({ field: 'overseasInvestmentAmount', value: 0, delta: gap, label: `해외직투 +${formatKorean(gap)}` });
                            } else if (key === 'savings') {
                              changes.push({ field: 'savingsAmount', value: 0, delta: gap, label: `예적금 +${formatKorean(gap)}` });
                            }
                            if (changes.length > 0) {
                              onApplyStrategies?.(changes, false);
                              setFilledAccounts(prev => ({ ...prev, [key]: filledAmount }));
                              // 해당 입력 영역으로 스크롤 이동
                              setTimeout(() => {
                                const targetId = key === 'pension' ? 'section-pension' : `asset-${key}`;
                                const el = document.getElementById(targetId);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 300);
                            }
                          }}
                          style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#00b1bb", background: "rgba(0,177,187,0.1)", border: "none", borderRadius: 4, cursor: "pointer" }}
                        >
                          채우기
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>
                    <span>예상 잔액 {formatKorean(adjustedCurrent)}</span>
                    <span>권장 {formatKorean(account.target)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--border-secondary)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, percent)}%`, background: isEnough ? "#00b1bb" : "var(--color-error)", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
          {analysis.bridgeYears > 0 && (
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 10, lineHeight: 1.5 }}>
              * 은퇴({planInputs?.retirementStartAge}세)부터 국민연금 수령({planInputs?.nationalPensionStartAge}세)까지 <strong style={{ color: "var(--text-secondary)" }}>{analysis.bridgeYears}년</strong>의 소득 공백기가 있습니다. ISA·예적금으로 이 기간을 버틸 수 있어야 합니다.
            </p>
          )}
          {/* 채우기 후 다시 계산 버튼 */}
          {Object.keys(filledAccounts).length > 0 && onRecalculate && (
            <button
              onClick={() => {
                setFilledAccounts({});
                setSolutionPhase(3);
                onRecalculate();
              }}
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

      {/* 전략 안내 + 반영 버튼 */}
      {!isFireSuccess && (
        <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ flex: 1 }} />
          <button
            className="apply-strategy-btn"
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
            className="apply-strategy-btn"
            style={{ padding: "8px 16px", fontSize: 12, fontWeight: 700, color: "#fff", background: "#00b1bb", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,177,187,0.3)", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> 제이의 전략으로 즉시 탈출하기
          </button>
        </div>
      )}

      {/* 시나리오 카드 목록 */}
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
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: scenario.impactType === "positive" ? "var(--color-profit-bg)" : "var(--bg-tertiary)",
                    fontSize: 13, fontWeight: 700,
                    color: scenario.impactType === "positive" ? "var(--color-profit)" : "var(--text-tertiary)",
                  }}>
                    {idx + 1}
                  </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  {scenario.title}
                </div>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: expandedScenario === scenario.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6, lineHeight: 1.6, wordBreak: "keep-all" as const, paddingLeft: 38 }}>
                {scenario.description}
              </div>
            </div>

            {expandedScenario === scenario.id && (
              <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--border-secondary)" }}>
                {/* J의 조언 */}
                {scenario.advice && (
                  <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "var(--bg-secondary)", lineHeight: 1.7 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 4 }}>J의 조언</div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, wordBreak: "keep-all" as const }}>{scenario.advice}</p>
                  </div>
                )}
                {/* 실행 팁 */}
                {scenario.actionTip && (
                  <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, border: "1px dashed var(--border-primary)", lineHeight: 1.7 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-profit)", marginBottom: 4 }}>실행 팁</div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, wordBreak: "keep-all" as const }}>{scenario.actionTip}</p>
                  </div>
                )}
                {/* 상세 정보 */}
                <div style={{ paddingTop: 10 }}>
                  {scenario.details.map((detail, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "6px 0", paddingLeft: 12, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, borderBottom: i < scenario.details.length - 1 ? "1px solid var(--border-secondary)" : "none" }}>
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
      <div style={{ margin: "24px 16px 0", padding: "16px 20px", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
          활용 팁
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "생활비 절약은 가장 빠르고 확실한 탈출 비결이에요.",
            "수익률은 욕심내기보다 안전하게 설정하는 걸 추천해요.",
            "국민연금은 나의 건강과 계획에 맞춰 신중하게 선택하세요.",
            "자산에 변화가 생길 때마다 지도를 새로 그려보는 게 좋아요.",
          ].map((text, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <span style={{ flexShrink: 0, color: "var(--text-disabled)" }}>·</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
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
