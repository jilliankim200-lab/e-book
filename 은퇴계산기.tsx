import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Calculator, TrendingUp, Info, X, Download, FileText, FileSpreadsheet, FileJson, CheckCircle, AlertTriangle, Loader2, Check, Sparkles, Trash2, PenLine } from "lucide-react";
import { isAdmin } from "./src/PasswordGate";

interface SimulationCompleteData {
  results: SimulationRow[];
  isFireSuccess: boolean;
  assetDepletionAge: number | null;
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
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
    setTipStyle({
      position: 'fixed',
      bottom: window.innerHeight - rect.top + 8,
      left,
      width: tipWidth,
      padding: '12px 16px',
      borderRadius: 10,
      background: '#fff',
      color: 'var(--text-primary)',
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.8,
      textAlign: 'left' as const,
      whiteSpace: 'normal',
      boxShadow: '0 6px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
      zIndex: 10000,
      pointerEvents: 'none' as const,
    });
    setArrowStyle({
      position: 'absolute' as const,
      bottom: -6,
      left: Math.max(12, Math.min(arrowLeft, tipWidth - 20)),
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid #fff',
      pointerEvents: 'none' as const,
    });
    setShow(true);
  };

  const formatText = (t: string) => t.split(/(?<=\. )/).map((s, i) => <span key={i}>{i > 0 && <br />}{s}</span>);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
      style={{ cursor: 'help', fontSize: 'inherit' }}
    >
      {children}
      {show && createPortal(
        <div style={tipStyle}>
          {formatText(text)}
          <div style={arrowStyle} />
        </div>,
        document.body
      )}
    </span>
  );
}

interface StrategyChange {
  field: string;
  value: number | string | boolean;
  delta?: number;
  label: string;
}

interface CashFlowProps {
  isAmountHidden?: boolean;
  onSimulationComplete?: (data: SimulationCompleteData) => void;
  pendingStrategyChanges?: StrategyChange[] | null;
  autoRecalculate?: boolean;
  onStrategyApplied?: () => void;
  onInputDirty?: () => void;
  triggerRecalc?: number;
  initialTcData?: Record<string, any> | null;
}

interface InputValues {
  currentAge: number;
  startYear: number;
  retirementStartAge: number;
  simulationEndAge: number;
  monthlyLivingCostBefore75: number;
  monthlyLivingCostAfter75: number;
  inflationRate: number;
  // 1층: 국민연금
  nationalPensionStartAge: number;
  nationalPensionYearly: number;
  // 2층: 퇴직연금 (복수 계좌)
  retirementPensions: RetirementPension[];
  // 하위 호환용 (계산에 사용 - retirementPensions에서 합산)
  retirementPensionType: 'irp' | 'db' | 'dc';
  retirementPensionBalance: number;
  retirementPensionReturnRate: number;
  // 3층: 개인연금 (복수 계좌)
  personalPensions: PersonalPension[];
  // 하위 호환용 (계산에 사용 - personalPensions에서 합산)
  totalPension: number;
  pensionWithdrawalAmount: number;
  pensionReturnRate: number;
  pensionExcessTaxRate: number;
  pensionStartAge: number;
  usePensionDepletion: boolean;
  // 4. 추가자산 (기존 호환용 - 계산에 사용)
  husbandISA: number;
  wifeISA: number;
  isaReturnRate: number;
  overseasInvestmentAmount: number;
  overseasReturnRate: number;
  savingsAmount: number;
  savingsReturnRate: number;
  lifeInsurancePensionStartAge: number;
  lifeInsurancePensionYearly: number;
  homeValue: number;
  homePensionStartAge: number;
  homePensionMonthly: number;
  // 추가자산 동적 목록
  additionalAssets: AdditionalAsset[];
  // 부채 & 비정기지출
  totalDebt: number;
  monthlyDebtRepayment: number;
  debtEndAge: number;
  irregularExpenses: IrregularExpense[];
  // 옵션
  returnRateType: 'pretax' | 'posttax';
}

interface RetirementPension {
  id: string;
  type: 'irp' | 'db' | 'dc';
  name: string;
  balance: number;
  returnRate: number;
}

function createDefaultRetirementPension(type: 'irp' | 'db' | 'dc'): RetirementPension {
  const id = 'rp-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const name = type === 'irp' ? 'IRP' : type === 'db' ? 'DB형' : 'DC형';
  return { id, type, name, balance: 0, returnRate: type === 'db' ? 0 : 0.05 };
}

type PersonalPensionType = 'pension_savings' | 'pension_insurance';

interface PersonalPension {
  id: string;
  type: PersonalPensionType;
  name: string;
  balance: number;
  returnRate: number;
  currentBalance?: number;
  yearlyContribution?: number;
}

function createDefaultPersonalPension(type: PersonalPensionType): PersonalPension {
  const id = 'pp-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const name = type === 'pension_savings' ? '연금저축' : '연금보험';
  return { id, type, name, balance: 0, returnRate: 0.05 };
}

type AssetType = 'isa' | 'overseas' | 'savings' | 'life_insurance' | 'real_estate' | 'custom';

interface AdditionalAsset {
  id: string;
  type: AssetType;
  name: string;
  balance: number;
  returnRate: number;
  startAge?: number; // 연금형 자산의 개시 나이
  monthlyAmount?: number; // 주택연금 월수령액, 생명보험 연수령액 등
  inputMode?: 'direct' | 'accumulate'; // 직접입력 / 적립식계산
  currentBalance?: number; // 적립식: 현재 잔액
  yearlyContribution?: number; // 적립식: 연간 납입액
}

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'isa', label: 'ISA' },
  { value: 'overseas', label: '해외직투' },
  { value: 'savings', label: '예적금/현금' },
  { value: 'life_insurance', label: '생명보험연금' },
  { value: 'real_estate', label: '부동산/주택연금' },
  { value: 'custom', label: '기타 자산' },
];

function createDefaultAsset(type: AssetType): AdditionalAsset {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  switch (type) {
    case 'isa': return { id, type, name: 'ISA', balance: 0, returnRate: 0.05 };
    case 'overseas': return { id, type, name: '해외직투', balance: 0, returnRate: 0.07 };
    case 'savings': return { id, type, name: '예적금/현금', balance: 0, returnRate: 0.03 };
    case 'life_insurance': return { id, type, name: '생명보험연금', balance: 0, returnRate: 0, startAge: 55, monthlyAmount: 0 };
    case 'real_estate': return { id, type, name: '부동산/주택연금', balance: 0, returnRate: 0, startAge: 55, monthlyAmount: 0 };
    case 'custom': return { id, type, name: '', balance: 0, returnRate: 0.03 };
  }
}

interface IrregularExpense {
  name: string; // 이벤트 이름 (자녀 결혼, 의료비 등)
  age: number; // 발생 나이
  amount: number; // 금액
}

interface SimulationRow {
  year: number;
  age: number;
  livingCost: number;
  isaWithdrawal: number;
  overseasDividend: number; // 해외 배당금
  overseasStockSale: number; // 해외주식매도
  pensionAfterTax: number;
  nationalPension: number;
  homePension: number;
  lifeInsurancePension: number; // 생명보험연금
  totalIncome: number;
  totalExpense: number;
  yearlySurplus: number;
  isaBalance: number;
  pensionBalance: number;
  overseasBalance: number; // 해외주식 잔액
  healthInsurance: number;
  // === 신규 항목 ===
  savingsWithdrawal: number; // 예적금 인출
  savingsBalance: number; // 예적금 잔액
  debtRepayment: number; // 부채 상환액
  debtBalance: number; // 부채 잔액
  irregularExpense: number; // 비정기 지출
}

export function CashFlow({ isAmountHidden = false, onSimulationComplete, pendingStrategyChanges, autoRecalculate, onStrategyApplied, onInputDirty, triggerRecalc, initialTcData }: CashFlowProps) {
  const [showResults, setShowResults] = useState(false);
  const isAdminUser = isAdmin();
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showLivingCostHelper, setShowLivingCostHelper] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [inputsDirty, setInputsDirty] = useState(false);
  const [assetInputMode, setAssetInputMode] = useState<'direct' | 'accumulate'>('direct');
  const [pensionInputMode, setPensionInputMode] = useState<'direct' | 'accumulate'>('direct');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  }, []);

  const [inputs, setInputs] = useState<InputValues>({
    currentAge: 35,
    startYear: new Date().getFullYear() + 20,
    retirementStartAge: 55,
    simulationEndAge: 90,
    monthlyLivingCostBefore75: 0,
    monthlyLivingCostAfter75: 0,
    inflationRate: 2,
    // 1층: 국민연금
    nationalPensionStartAge: 65,
    nationalPensionYearly: 0,
    // 2층: 퇴직연금
    retirementPensions: [],
    retirementPensionType: 'irp',
    retirementPensionBalance: 0,
    retirementPensionReturnRate: 0.05,
    // 3층: 개인연금
    personalPensions: [],
    totalPension: 0,
    pensionWithdrawalAmount: 0,
    pensionReturnRate: 0.05,
    pensionExcessTaxRate: 0.15,
    pensionStartAge: 55,
    usePensionDepletion: false,
    // 추가자산 (기존 호환)
    husbandISA: 0, wifeISA: 0, isaReturnRate: 0.05,
    overseasInvestmentAmount: 0, overseasReturnRate: 0.07,
    savingsAmount: 0, savingsReturnRate: 0.03,
    lifeInsurancePensionStartAge: 55, lifeInsurancePensionYearly: 0,
    homeValue: 0, homePensionStartAge: 55, homePensionMonthly: 0,
    additionalAssets: [],
    // 부채
    totalDebt: 0,
    monthlyDebtRepayment: 0,
    debtEndAge: 65,
    irregularExpenses: [],
    returnRateType: 'pretax',
  });

  const canCalculate = inputs.monthlyLivingCostBefore75 > 0 || inputs.additionalAssets.length > 0 || inputs.personalPensions.length > 0 || inputs.retirementPensions.length > 0 || inputs.nationalPensionYearly > 0 || inputs.totalPension > 0;

  // 전략 반영된 필드 추적 (field -> label)
  const [appliedFields, setAppliedFields] = useState<Record<string, string>>({});

  const [results, setResults] = useState<SimulationRow[]>([]);
  const [assetDepletionAge, setAssetDepletionAge] = useState<number | null>(null);
  const [isFireSuccess, setIsFireSuccess] = useState<boolean>(true);
  const [failureInfo, setFailureInfo] = useState<{
    age: number;
    deficit: number;
    totalIncome: number;
    totalExpense: number;
    livingCost: number;
    reason: string[];
  } | null>(null);

  // localStorage에서 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('cashFlowData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // 입력값 복원
        if (parsed.inputs) {
          setInputs({
            ...parsed.inputs,
            pensionWithdrawalAmount: parsed.inputs.pensionWithdrawalAmount ?? 50000000,
            usePensionDepletion: parsed.inputs.usePensionDepletion ?? false,
            // 기존 데이터 호환성: monthlyLivingCost를 75세 이전 값으로 변환
            monthlyLivingCostBefore75: parsed.inputs.monthlyLivingCostBefore75 ?? parsed.inputs.monthlyLivingCost ?? 7000000,
            monthlyLivingCostAfter75: parsed.inputs.monthlyLivingCostAfter75 ?? 5000000,
            // 생명보험연금 기본값
            lifeInsurancePensionStartAge: parsed.inputs.lifeInsurancePensionStartAge ?? 55,
            lifeInsurancePensionYearly: parsed.inputs.lifeInsurancePensionYearly ?? 1450000,
            // 배우자 은퇴시작나이 기본값
            // 현재나이, 시작년도 기본값
            currentAge: parsed.inputs.currentAge ?? 50,
            startYear: parsed.inputs.startYear ?? 2026,
            // ISA와 해외주식 수익률 기본값
            isaReturnRate: parsed.inputs.isaReturnRate ?? 0.05,
            overseasReturnRate: parsed.inputs.overseasReturnRate ?? 0.07,
            // 연금 수익률 기본값
            pensionReturnRate: parsed.inputs.pensionReturnRate ?? 0.05,
            // 퇴직연금 기본값
            retirementPensions: parsed.inputs.retirementPensions ?? [],
            retirementPensionType: parsed.inputs.retirementPensionType ?? 'irp',
            retirementPensionBalance: parsed.inputs.retirementPensionBalance ?? 0,
            retirementPensionReturnRate: parsed.inputs.retirementPensionReturnRate ?? 0.05,
            personalPensions: parsed.inputs.personalPensions ?? [],
            // 신규 항목 기본값
            savingsAmount: parsed.inputs.savingsAmount ?? 0,
            savingsReturnRate: parsed.inputs.savingsReturnRate ?? 0.03,
            totalDebt: parsed.inputs.totalDebt ?? 0,
            monthlyDebtRepayment: parsed.inputs.monthlyDebtRepayment ?? 0,
            debtEndAge: parsed.inputs.debtEndAge ?? 65,
            irregularExpenses: parsed.inputs.irregularExpenses ?? [],
            additionalAssets: parsed.inputs.additionalAssets ?? [],
            returnRateType: parsed.inputs.returnRateType ?? 'pretax',
          });
        }
        
        // 시뮬레이션 결과는 복원하지 않음 — 계산하기 버튼을 눌러야 결과가 표시됨
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  // 데이터가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    const dataToSave = {
      inputs,
      results,
      showResults,
      isFireSuccess,
      assetDepletionAge,
      failureInfo
    };
    localStorage.setItem('cashFlowData', JSON.stringify(dataToSave));
  }, [inputs, results, showResults, isFireSuccess, assetDepletionAge, failureInfo]);

  // 전략 적용 (ActionPlan에서 체크한 항목 반영)
  useEffect(() => {
    if (!pendingStrategyChanges || pendingStrategyChanges.length === 0) return;
    const newApplied: Record<string, string> = {};
    setInputs(prev => {
      const updated = { ...prev };
      for (const change of pendingStrategyChanges) {
        const key = change.field as keyof InputValues;
        // 국민연금 수령액이 0이면 개시나이 변경 스킵
        if (key === 'nationalPensionStartAge' && updated.nationalPensionYearly === 0) continue;
        if (key in updated && typeof (updated as any)[key] === 'number') {
          if (change.delta) {
            let newVal = (updated as any)[key] + change.delta;
            // 상한/하한 제한
            if (key === 'nationalPensionStartAge') newVal = Math.min(70, newVal);
            if (key === 'monthlyLivingCostBefore75' || key === 'monthlyLivingCostAfter75') newVal = Math.max(1000000, newVal); // 최소 100만원
            if (key === 'husbandISA' || key === 'wifeISA') newVal = Math.min(100000000, newVal); // ISA 인당 최대 1억
            (updated as any)[key] = Math.max(0, newVal);
          } else {
            (updated as any)[key] = change.value;
          }
          newApplied[change.field] = change.label;
        }
        if (change.delta) {
          if (key === 'isaReturnRate') {
            updated.additionalAssets = updated.additionalAssets.map(a => a.type === 'isa' ? { ...a, returnRate: Math.max(0, a.returnRate + change.delta!) } : a);
            newApplied['asset_isa_returnRate'] = change.label;
          }
          if (key === 'overseasReturnRate') {
            updated.additionalAssets = updated.additionalAssets.map(a => a.type === 'overseas' ? { ...a, returnRate: Math.max(0, a.returnRate + change.delta!) } : a);
            newApplied['asset_overseas_returnRate'] = change.label;
          }
          if (key === 'savingsReturnRate') {
            updated.additionalAssets = updated.additionalAssets.map(a => a.type === 'savings' ? { ...a, returnRate: Math.max(0, a.returnRate + change.delta!) } : a);
            newApplied['asset_savings_returnRate'] = change.label;
          }
          // 채우기: 연금 잔액 변경 시 personalPensions 첫 번째 항목 동기화
          if (key === 'totalPension' && updated.personalPensions.length > 0) {
            updated.personalPensions = updated.personalPensions.map((pp, idx) => idx === 0 ? { ...pp, balance: Math.max(0, pp.balance + change.delta!) } : pp);
          }
          // 채우기: ISA/해외직투/예적금 잔액 변경 시 additionalAssets도 동기화
          if (key === 'husbandISA') {
            updated.additionalAssets = updated.additionalAssets.map(a => a.type === 'isa' ? { ...a, balance: Math.max(0, a.balance + change.delta!) } : a);
          }
          if (key === 'overseasInvestmentAmount') {
            updated.additionalAssets = updated.additionalAssets.map(a => a.type === 'overseas' ? { ...a, balance: Math.max(0, a.balance + change.delta!) } : a);
          }
          if (key === 'savingsAmount') {
            updated.additionalAssets = updated.additionalAssets.map(a => a.type === 'savings' ? { ...a, balance: Math.max(0, a.balance + change.delta!) } : a);
          }
        }
      }
      return updated;
    });
    setAppliedFields(prev => ({ ...prev, ...newApplied }));
    if (autoRecalculate) {
      setShouldAutoCalc(true);
    } else {
      if (showResults) setInputsDirty(true);
    }
    onStrategyApplied?.();
  }, [pendingStrategyChanges]);

  // 전략 적용 후 inputs가 반영된 다음 렌더에서 자동 재계산
  const [shouldAutoCalc, setShouldAutoCalc] = useState(false);
  useEffect(() => {
    if (!shouldAutoCalc) return;
    setShouldAutoCalc(false);
    setIsSimulating(true);
    setSimDone(false);
    setTimeout(() => {
      const simData = calculateSimulation();
      setIsSimulating(false);
      setSimDone(true);
      setInputsDirty(false);
      onSimulationComplete?.(simData);
      setTimeout(() => setSimDone(false), 2500);
    }, 300);
  }, [shouldAutoCalc]);

  // 우측 패널에서 "채운 금액으로 다시 계산하기" 트리거 + 생활비 자동 최적화
  const [pendingOptimize, setPendingOptimize] = useState(false);
  useEffect(() => {
    if (!triggerRecalc) return;
    setIsSimulating(true);
    setSimDone(false);
    setTimeout(() => {
      const firstResult = calculateSimulation();

      if (firstResult.isFireSuccess && firstResult.results.length > 0) {
        const minSurplus = firstResult.results.reduce((min: number, r: any) => Math.min(min, r.yearlySurplus), Infinity);
        if (minSurplus > 0) {
          const additionalMonthly = Math.floor(minSurplus * 0.6 / 12 / 100000) * 100000;
          if (additionalMonthly >= 100000) {
            const currentCost = inputs.monthlyLivingCostBefore75;
            const newCost = currentCost + additionalMonthly;
            const newCostAfter75 = Math.round(newCost * 0.7);
            setInputs(prev => ({
              ...prev,
              monthlyLivingCostBefore75: newCost,
              monthlyLivingCostAfter75: newCostAfter75,
            }));
            setAppliedFields(prev => ({
              ...prev,
              monthlyLivingCostBefore75: `생활비 +${Math.round(additionalMonthly / 10000)}만원`,
              monthlyLivingCostAfter75: `75세 이후 자동 조정`,
            }));
            setPendingOptimize(true);
            return;
          }
        }
      }

      setIsSimulating(false);
      setSimDone(true);
      setInputsDirty(false);
      onSimulationComplete?.(firstResult);
      setTimeout(() => setSimDone(false), 2500);
    }, 300);
  }, [triggerRecalc]);

  // 생활비 최적화 2차 계산 (state 반영 후 다음 렌더에서 실행)
  useEffect(() => {
    if (!pendingOptimize) return;
    setPendingOptimize(false);
    setTimeout(() => {
      const optimizedResult = calculateSimulation();
      setIsSimulating(false);
      setSimDone(true);
      setInputsDirty(false);
      onSimulationComplete?.(optimizedResult);
      setTimeout(() => setSimDone(false), 2500);
    }, 100);
  }, [pendingOptimize]);

  // 전략 반영 배지 렌더 (뱃지 없이 null 반환)
  const strategyBadge = (_field: string) => null;

  // 전략 반영된 input 스타일
  const appliedInputStyle = (field: string): React.CSSProperties => {
    if (!appliedFields[field]) return {};
    return { background: '#00b1bb', borderColor: '#00b1bb', color: '#fff' };
  };

  const FLOAT_FIELDS: (keyof InputValues)[] = ['inflationRate', 'pensionReturnRate', 'retirementPensionReturnRate', 'pensionExcessTaxRate'];

  // 선행 0 제거: onBlur 시 input DOM 값을 정리
  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (el.type === 'number' && el.value) {
      el.value = String(Number(el.value));
    }
  };

  const handleInputChange = (field: keyof InputValues, value: string) => {
    const numericValue = value.replace(/,/g, '');
    const isFloat = FLOAT_FIELDS.includes(field);
    const parsed = isFloat ? (parseFloat(numericValue) || 0) : (parseInt(numericValue, 10) || 0);
    setInputs(prev => {
      const next = { ...prev, [field]: parsed };
      const thisYear = new Date().getFullYear();
      // 현재나이 또는 희망은퇴나이가 변경되면 시작년도 자동 계산
      if (field === 'currentAge' || field === 'retirementStartAge') {
        const age = field === 'currentAge' ? parsed : next.currentAge;
        const retireAge = field === 'retirementStartAge' ? parsed : next.retirementStartAge;
        next.startYear = thisYear + (retireAge - age);
      }
      // 시작년도가 변경되면 희망은퇴나이 자동 계산
      if (field === 'startYear') {
        next.retirementStartAge = next.currentAge + (parsed - thisYear);
      }
      // 75세 이전 생활비 변경 시 75세 이후를 70%로 자동 채움
      if (field === 'monthlyLivingCostBefore75') {
        next.monthlyLivingCostAfter75 = Math.round(parsed * 0.7);
      }
      return next;
    });
    if (showResults) {
      setInputsDirty(true);
      onInputDirty?.();
    }
  };

  const formatInputAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
  };

  const formatKoreanAmount = (amount: number): string => {
    if (amount === 0) return '';
    
    const absAmount = Math.abs(amount);
    const eok = Math.floor(absAmount / 100000000);
    const man = Math.floor((absAmount % 100000000) / 10000);
    
    let result = '';
    
    if (amount < 0) {
      result += '마이너스 ';
    }
    
    if (eok > 0) {
      result += `${eok}억`;
      if (man > 0) {
        result += ` ${man.toLocaleString('ko-KR')}만`;
      }
    } else if (man > 0) {
      result += `${man.toLocaleString('ko-KR')}만`;
    }
    
    return result ? `${result}원` : '';
  };

  const runSimulation = () => {
    if (!canCalculate || isSimulating) return;
    setIsSimulating(true);
    setSimDone(false);
    setTimeout(() => {
      const simData = calculateSimulation();
      setIsSimulating(false);
      setSimDone(true);
      setInputsDirty(false);
      onSimulationComplete?.(simData);
      setTimeout(() => setSimDone(false), 2500);
    }, 600);
  };

  const calculateSimulation = () => {
    const rows: SimulationRow[] = [];

    // 적립식 모드 자산의 은퇴 시점 예상 잔액 계산
    const yearsToRetire = Math.max(0, inputs.retirementStartAge - inputs.currentAge);
    const resolveBalance = (asset: AdditionalAsset) => {
      if (assetInputMode === 'accumulate' && ['isa', 'overseas', 'savings'].includes(asset.type)) {
        const cb = asset.currentBalance || 0;
        const yc = asset.yearlyContribution || 0;
        const r = asset.returnRate || 0;
        const n = yearsToRetire;
        if (n <= 0) return cb;
        if (r === 0) return cb + yc * n;
        const compounded = Math.pow(1 + r, n);
        return Math.round(cb * compounded + yc * (compounded - 1) / r);
      }
      return asset.balance;
    };
    // 적립식 모드 잔액을 호환 필드에 반영
    let resolvedISA = inputs.husbandISA + inputs.wifeISA;
    let resolvedOverseas = inputs.overseasInvestmentAmount;
    let resolvedSavings = inputs.savingsAmount;
    for (const asset of inputs.additionalAssets) {
      const bal = resolveBalance(asset);
      if (asset.type === 'isa') resolvedISA = bal;
      if (asset.type === 'overseas') resolvedOverseas = bal;
      if (asset.type === 'savings') resolvedSavings = bal;
    }

    // 복수 퇴직연금 합산 (잔액 합계 + 가중평균 수익률)
    let totalRetirementBalance = 0;
    let weightedRetirementRate = 0;
    if (inputs.retirementPensions.length > 0) {
      for (const rp of inputs.retirementPensions) {
        totalRetirementBalance += rp.balance;
        weightedRetirementRate += rp.balance * (rp.type === 'db' ? 0 : rp.returnRate);
      }
      weightedRetirementRate = totalRetirementBalance > 0 ? weightedRetirementRate / totalRetirementBalance : 0;
    } else {
      // 하위 호환: retirementPensions가 비어있으면 기존 단일 필드 사용
      totalRetirementBalance = inputs.retirementPensionBalance;
      weightedRetirementRate = inputs.retirementPensionType === 'db' ? 0 : (inputs.retirementPensionReturnRate || 0.05);
    }

    // 복수 개인연금 합산 (잔액 합계 + 가중평균 수익률)
    let totalPersonalPensionBalance = 0;
    let weightedPersonalRate = 0;
    if (inputs.personalPensions.length > 0) {
      const ppYearsToRetire = Math.max(0, inputs.retirementStartAge - inputs.currentAge);
      for (const pp of inputs.personalPensions) {
        let ppBal = pp.balance;
        if (pensionInputMode === 'accumulate') {
          const cb = pp.currentBalance || 0;
          const yc = pp.yearlyContribution || 0;
          const r = pp.returnRate || 0;
          const n = ppYearsToRetire;
          if (n <= 0) { ppBal = cb; }
          else if (r === 0) { ppBal = cb + yc * n; }
          else { const c = Math.pow(1 + r, n); ppBal = Math.round(cb * c + yc * (c - 1) / r); }
        }
        totalPersonalPensionBalance += ppBal;
        weightedPersonalRate += ppBal * pp.returnRate;
      }
      weightedPersonalRate = totalPersonalPensionBalance > 0 ? weightedPersonalRate / totalPersonalPensionBalance : 0.05;
    } else {
      totalPersonalPensionBalance = inputs.totalPension;
      weightedPersonalRate = inputs.pensionReturnRate || 0.05;
    }

    // 초기값 설정 (퇴직연금 + 개인연금을 합산하여 연금 잔액으로 관리)
    let isaBalance = resolvedISA;
    let pensionBalance = totalPersonalPensionBalance + totalRetirementBalance;
    let overseasBalance = resolvedOverseas;
    let savingsBalance = resolvedSavings; // 예적금 잔액
    // 은퇴 시작 나이가 상환 종료 나이보다 크면 이미 상환 완료
    let debtBalance = inputs.retirementStartAge > inputs.debtEndAge ? 0 : inputs.totalDebt;
    const savingsReturnRate = inputs.savingsReturnRate || 0.03;

    // 수익률 기본값 설정 (NaN 방지)
    const isaReturnRate = inputs.isaReturnRate || 0.05;
    const overseasReturnRate = inputs.overseasReturnRate || 0.07;
    const personalPensionRate = weightedPersonalRate;
    const retirementPensionRate = weightedRetirementRate;

    // 퇴직연금 + 개인연금 가중평균 수익률 계산
    const totalPensionInit = totalPersonalPensionBalance + totalRetirementBalance;
    const pensionReturnRate = totalPensionInit > 0
      ? (totalPersonalPensionBalance * personalPensionRate + totalRetirementBalance * retirementPensionRate) / totalPensionInit
      : personalPensionRate;
    
    // 세금 및 건보 파라미터 (2025년 기준)
    const overseasDividendTaxRate = 0.154; // 해외배당 원천징수 15.4%
    const pensionTaxRate = 0.055;
    const pensionSeparateTaxLimit = 15000000; // 1인당 분리과세 한도 (2024년 개정)
    const financialIncomeDeduction = 10000000; // 금융소득 기본공제
    const propertyBasicDeduction = 100000000; // 재산 기본공제 (일괄 1억원)
    const propertyScoreRate = 0.0000005; // 재산 점수 환산율
    const financialScoreRate = 0.0000005; // 금융소득 점수 환산율
    const scoreMonthlyPremium = 218.8; // 점수당 월 보험료 (2025년 기준)

    for (let i = 0; i < inputs.simulationEndAge - inputs.retirementStartAge + 1; i++) {
      const currentAge = inputs.retirementStartAge + i;
      const currentYear = inputs.startYear + i;
      
      // 생활비 (75세 기준으로 다른 금액, 물가상승률 적용)
      const baseMonthlyLivingCost = currentAge < 75 
        ? inputs.monthlyLivingCostBefore75 
        : inputs.monthlyLivingCostAfter75;
      const yearlyBaseLivingCost = baseMonthlyLivingCost * 12;
      const livingCost = yearlyBaseLivingCost * Math.pow(1 + inputs.inflationRate / 100, i);
      
      // ========================================
      // 2단계: 고정 수입 계산 (나중에 계산)
      // ========================================
      
      // 주택연금
      const homePension = currentAge >= inputs.homePensionStartAge
        ? inputs.homePensionMonthly * 12
        : 0;

      // 생명보험연금
      const lifeInsurancePension = currentAge >= inputs.lifeInsurancePensionStartAge
        ? inputs.lifeInsurancePensionYearly
        : 0;
      
      // 국민연금 - 나이별 세율 적용 + 물가상승률 반영 + 조기/연기 수령 반영
      let nationalPension = 0;
      let nationalPensionPreTax = 0; // 건보료 계산용

      // 국민연금 조기/연기 수령 상수 (2025년 기준, 1969년생 이후)
      const NORMAL_PENSION_AGE = 65; // 정상수령 나이
      const EARLY_REDUCTION_RATE_PER_YEAR = 0.06; // 조기: 1년당 6% 감액 (최대 5년, 30%)
      const DELAY_INCREASE_RATE_PER_YEAR = 0.072; // 연기: 1년당 7.2% 증액 (최대 5년, 36%)
      
      if (currentAge >= inputs.nationalPensionStartAge) {
        const yearsFromStart = currentAge - inputs.nationalPensionStartAge;

        let adjustmentFactor = 1;
        if (inputs.nationalPensionStartAge < NORMAL_PENSION_AGE) {
          const earlyYears = Math.min(5, NORMAL_PENSION_AGE - inputs.nationalPensionStartAge);
          adjustmentFactor = 1 - (earlyYears * EARLY_REDUCTION_RATE_PER_YEAR);
        } else if (inputs.nationalPensionStartAge > NORMAL_PENSION_AGE) {
          const delayYears = Math.min(5, inputs.nationalPensionStartAge - NORMAL_PENSION_AGE);
          adjustmentFactor = 1 + (delayYears * DELAY_INCREASE_RATE_PER_YEAR);
        }

        const adjustedNationalPension = inputs.nationalPensionYearly * adjustmentFactor * Math.pow(1 + inputs.inflationRate / 100, yearsFromStart);

        let agePensionTaxRate: number;
        if (currentAge < 55) {
          agePensionTaxRate = 0.165;
        } else if (currentAge < 70) {
          agePensionTaxRate = 0.055;
        } else if (currentAge < 80) {
          agePensionTaxRate = 0.044;
        } else {
          agePensionTaxRate = 0.033;
        }

        nationalPensionPreTax = adjustedNationalPension;
        const nationalPensionTax = adjustedNationalPension * agePensionTaxRate;
        nationalPension = adjustedNationalPension - nationalPensionTax;
      }
      
      // ========================================
      // 3단계: 효율적 인출 전략 (세금 최적화 + 연금소진모드)
      // ========================================
      
      // 3-1. 건보료 예측 (개인연금 포함하여 정확하게 계산)
      const propertyScore = Math.max(0, inputs.homeValue - propertyBasicDeduction) * propertyScoreRate;
      
      // 개인연금 예상 인출액 계산 (건보료 예측용)
      const canPerson1Withdraw = currentAge >= inputs.pensionStartAge;
                  
      let estimatedPensionIncome = 0;
      if (canPerson1Withdraw && pensionBalance > 0) {
        const maxWithdrawal = inputs.pensionWithdrawalAmount;
        estimatedPensionIncome = Math.min(maxWithdrawal, pensionBalance) * 0.945; // 세후 예상
      }
      
      const estimatedIncomeScore = estimatedPensionIncome * 0.002 / 1000;
      const estimatedTotalScore = estimatedIncomeScore + propertyScore;
      const estimatedHealthInsurance = estimatedTotalScore * scoreMonthlyPremium * 12;
      
      // 3-2. 고정 수입 합계
      const fixedIncome = nationalPension + homePension + lifeInsurancePension;
      
      // 3-3. 필요액 계산
      let remainingNeeded = livingCost + estimatedHealthInsurance - fixedIncome;
      
      // ========================================
      // 💡 연금소진모드: 세 자산을 모두 균등하게 소진
      // ========================================
      let pensionAfterTax = 0;
      let pensionPreTax = 0;
      let isaWithdrawal = 0;
      let overseasDividend = 0;
      let overseasStockSale = 0;
      
      if (inputs.usePensionDepletion) {
        // 🔥 연금소진모드 ON: 모든 자산을 시뮬레이션 종료까지 균등 소진
        const remainingYears = inputs.simulationEndAge - currentAge + 1;
        
        // 1️⃣ 개인연금 균등 소진
        const canPerson1Withdraw = currentAge >= inputs.pensionStartAge;
                        
        if (canPerson1Withdraw && pensionBalance > 0) {
          // ⚠️ 연금 수령 나이 도달 시부터 남은 기간 동안 균등 소진
          const pensionRemainingYears = inputs.simulationEndAge - Math.max(currentAge, inputs.pensionStartAge) + 1;
          const r = pensionReturnRate;
          
          if (pensionRemainingYears > 0 && r > 0) {
            const factor = Math.pow(1 + r, pensionRemainingYears);
            pensionPreTax = pensionBalance * (r * factor) / (factor - 1);
          } else if (pensionRemainingYears === 1) {
            pensionPreTax = pensionBalance;
          } else {
            pensionPreTax = pensionBalance / Math.max(1, pensionRemainingYears);
          }
          pensionPreTax = Math.min(pensionPreTax, pensionBalance);
          
          // 인출 (수익률은 루프 끝에서 공통 적용 위해 여기서는 차감만)
          pensionBalance = Math.max(0, pensionBalance - pensionPreTax);
          
          // 세금 계산 (55세 미만: 기타소득세 16.5%, 55~69세: 5.5%, 70~79세: 4.4%, 80세+: 3.3%)
          let agePensionTaxRate: number;
          if (currentAge < 55) {
            agePensionTaxRate = 0.165;
          } else if (currentAge < 70) {
            agePensionTaxRate = 0.055;
          } else if (currentAge < 80) {
            agePensionTaxRate = 0.044;
          } else {
            agePensionTaxRate = 0.033;
          }

          const pensionSeparateTaxLimit2 = 15000000;
          const withinLimit = Math.min(pensionPreTax, pensionSeparateTaxLimit2);
          const taxWithinLimit = withinLimit * agePensionTaxRate;
          const afterTaxWithinLimit = withinLimit - taxWithinLimit;
          
          const excessAmount = Math.max(0, pensionPreTax - pensionSeparateTaxLimit2);
          const excessTax = excessAmount * inputs.pensionExcessTaxRate;
          const afterTaxExcess = excessAmount - excessTax;
          
          pensionAfterTax = afterTaxWithinLimit + afterTaxExcess;
        }
        
        // 2️⃣ ISA 균등 소진
        if (isaBalance > 0) {
          const r = isaReturnRate;
          
          if (remainingYears > 0 && r > 0) {
            const factor = Math.pow(1 + r, remainingYears);
            isaWithdrawal = isaBalance * (r * factor) / (factor - 1);
          } else if (remainingYears === 1) {
            isaWithdrawal = isaBalance;
          } else {
            isaWithdrawal = isaBalance / Math.max(1, remainingYears);
          }
          isaWithdrawal = Math.min(isaWithdrawal, isaBalance);
          
          // 인출
          isaBalance = Math.max(0, isaBalance - isaWithdrawal);
        }
        
        // 3️⃣ 해외배당 (자동 수입)
        const overseasDividendPreTax = overseasBalance * 0.06;
        const overseasDividendTax = overseasDividendPreTax * overseasDividendTaxRate;
        overseasDividend = overseasDividendPreTax - overseasDividendTax;
        
        // 4️⃣ 해외주식 균등 소진 (배당 제외한 원금만)
        if (overseasBalance > 0) {
          const r = Math.max(0, overseasReturnRate - 0.06);
          
          if (remainingYears > 0 && r > 0) {
            const factor = Math.pow(1 + r, remainingYears);
            overseasStockSale = overseasBalance * (r * factor) / (factor - 1);
          } else if (remainingYears === 1) {
            overseasStockSale = overseasBalance;
          } else {
            overseasStockSale = overseasBalance / Math.max(1, remainingYears);
          }
          overseasStockSale = Math.min(overseasStockSale, overseasBalance);
          
          // 인출
          overseasBalance = Math.max(0, overseasBalance - overseasStockSale);
        }
      } else {
        // ========================================
        // 💼 일반 모드: 필요한 만큼만 인출 (세금 최적화)
        // ========================================
        
        // 3-4. 해외배당 (자동 수입, 세율 고정 15.4%)
        const overseasDividendPreTax = overseasBalance * 0.06;
        const overseasDividendTax = overseasDividendPreTax * overseasDividendTaxRate;
        overseasDividend = overseasDividendPreTax - overseasDividendTax;
        remainingNeeded -= overseasDividend;
        
        // 3-5. 개인연금 인출
        if (canPerson1Withdraw && pensionBalance > 0) {
          const neededPreTax = remainingNeeded / 0.945;
          const maxWithdrawal = inputs.pensionWithdrawalAmount;
          const actualWithdrawal = Math.min(neededPreTax, maxWithdrawal, pensionBalance);
          
          pensionPreTax = actualWithdrawal;
          pensionBalance = Math.max(0, pensionBalance - actualWithdrawal);
          
          // 세금 계산 (55세 미만: 기타소득세 16.5%, 55~69세: 5.5%, 70~79세: 4.4%, 80세+: 3.3%)
          let agePensionTaxRate: number;
          if (currentAge < 55) {
            agePensionTaxRate = 0.165;
          } else if (currentAge < 70) {
            agePensionTaxRate = 0.055;
          } else if (currentAge < 80) {
            agePensionTaxRate = 0.044;
          } else {
            agePensionTaxRate = 0.033;
          }

          const pensionSeparateTaxLimit2 = 15000000;
          const withinLimit = Math.min(actualWithdrawal, pensionSeparateTaxLimit2);
          const taxWithinLimit = withinLimit * agePensionTaxRate;
          const afterTaxWithinLimit = withinLimit - taxWithinLimit;
          
          const excessAmount = Math.max(0, actualWithdrawal - pensionSeparateTaxLimit2);
          const excessTax = excessAmount * inputs.pensionExcessTaxRate;
          const afterTaxExcess = excessAmount - excessTax;
          
          pensionAfterTax = afterTaxWithinLimit + afterTaxExcess;
          remainingNeeded -= pensionAfterTax;
        }
        
        // 3-6. ISA 인출 (부족할 때만 사용)
        isaWithdrawal = Math.min(Math.max(0, remainingNeeded), isaBalance);
        remainingNeeded -= isaWithdrawal;
        isaBalance = Math.max(0, isaBalance - isaWithdrawal);
        
        // 3-7. 해외주식 매도
        overseasStockSale = Math.min(Math.max(0, remainingNeeded), overseasBalance);
        remainingNeeded -= overseasStockSale;
        overseasBalance = Math.max(0, overseasBalance - overseasStockSale);
      }
      
      // ========================================
      // 4단계: 건보료 재계산 (개인연금 확정 후)
      // ========================================
      const healthInsuranceBaseIncome = pensionAfterTax;
      
      const incomeScore = healthInsuranceBaseIncome * 0.002 / 1000;
      const totalScore = incomeScore + propertyScore;
      const healthInsurance = totalScore * scoreMonthlyPremium * 12;
      
      // ========================================
      // 5단계: 부채 상환 계산
      // ========================================
      let debtRepayment = 0;
      if (debtBalance > 0 && currentAge <= inputs.debtEndAge) {
        debtRepayment = Math.min(inputs.monthlyDebtRepayment * 12, debtBalance);
        debtBalance = Math.max(0, debtBalance - debtRepayment);
      }

      // ========================================
      // 5-1단계: 비정기 지출 계산
      // ========================================
      let irregularExpense = 0;
      for (const expense of inputs.irregularExpenses) {
        if (expense.age === currentAge && expense.amount > 0) {
          irregularExpense += expense.amount;
        }
      }

      // ========================================
      // 5-2단계: 예적금 인출 (다른 자산보다 먼저 사용)
      // ========================================
      let savingsWithdrawal = 0;

      // ========================================
      // 6단계: 총계 계산
      // ========================================
      let totalIncome = pensionAfterTax + nationalPension + homePension + lifeInsurancePension + isaWithdrawal + overseasDividend + overseasStockSale;
      const totalExpense = livingCost + healthInsurance + debtRepayment + irregularExpense;

      // 국민연금 수령 나이부터 500만원 추가 차감 (생활비 0원이면 미적용)
      const hasLivingCost = inputs.monthlyLivingCostBefore75 > 0 || inputs.monthlyLivingCostAfter75 > 0;
      const additionalDeduction = hasLivingCost && currentAge >= inputs.nationalPensionStartAge ? 5000000 : 0;
      let yearlySurplus = totalIncome - totalExpense - additionalDeduction;

      // ========================================
      // 부족분 보전: 예적금 → ISA → 해외주식 순으로 추가 인출
      // ========================================
      if (yearlySurplus < 0) {
        const shortage = Math.abs(yearlySurplus);

        // 0단계: 예적금에서 먼저 인출
        const savingsUse = Math.min(shortage, savingsBalance);
        savingsWithdrawal += savingsUse;
        savingsBalance = Math.max(0, savingsBalance - savingsUse);
        totalIncome += savingsUse;
        yearlySurplus += savingsUse;

        // 1단계: ISA에서 추가 인출
        if (yearlySurplus < 0) {
          const isaNeed = Math.abs(yearlySurplus);
          const additionalIsaWithdrawal = Math.min(isaNeed, isaBalance);
          isaWithdrawal += additionalIsaWithdrawal;
          isaBalance = Math.max(0, isaBalance - additionalIsaWithdrawal);
          totalIncome += additionalIsaWithdrawal;
          yearlySurplus += additionalIsaWithdrawal;
        }

        // 2단계: 여전히 부족하면 해외주식 추가 매도
        if (yearlySurplus < 0) {
          const remainingShortage = Math.abs(yearlySurplus);
          const additionalStockSale = Math.min(remainingShortage, overseasBalance);
          overseasStockSale += additionalStockSale;
          overseasBalance = Math.max(0, overseasBalance - additionalStockSale);
          totalIncome += additionalStockSale;
          yearlySurplus += additionalStockSale;
        }
      }

      // ========================================
      // 7단계: 모든 자산 수익률 적용 (연말 기준, 인출 후 잔액에 적용)
      // ========================================
      isaBalance = isaBalance * (1 + isaReturnRate);
      overseasBalance = overseasBalance * (1 + Math.max(0, overseasReturnRate - 0.06));
      pensionBalance = pensionBalance * (1 + pensionReturnRate);
      savingsBalance = savingsBalance * (1 + savingsReturnRate);

      rows.push({
        year: currentYear,
        age: currentAge,
        livingCost,
        isaWithdrawal,
        overseasDividend,
        overseasStockSale,
        pensionAfterTax,
        nationalPension,
        homePension,
        lifeInsurancePension,
        totalIncome: totalIncome, // ✅ 명시적으로 할당
        totalExpense: totalExpense, // ✅ 명시적으로 할당
        yearlySurplus,
        isaBalance,
        pensionBalance,
        overseasBalance,
        healthInsurance,
        savingsWithdrawal,
        savingsBalance,
        debtRepayment,
        debtBalance,
        irregularExpense,
      });
    }
    
    // ✅ 남는금액 마이너스 감지 (파이어족 실패 체크)
    let depletionAge: number | null = null;
    let fireSuccess = true;
    let failureData: typeof failureInfo = null;
    
    for (const row of rows) {
      // ⚠️ 연 남는 금액이 마이너스인 경우 = 현금흐름 실패
      if (row.age < inputs.simulationEndAge && row.yearlySurplus < 0) {
        depletionAge = row.age;
        fireSuccess = false;
        
        // 실패 원인 분석
        const reasons: string[] = [];
        const deficit = Math.abs(row.yearlySurplus);
        
        // 1. 생활비 과다 체크 (총 지출의 50% 이상)
        if (row.livingCost > row.totalExpense * 0.5) {
          const excessAmount = Math.round((row.livingCost - row.totalExpense * 0.4) / 10000);
          reasons.push(`생활비 과다 (연 ${Math.round(row.livingCost/10000)}만원, 약 ${excessAmount}만원 초과)`);
        }
        
        // 2. 연금/ISA 수입 부족 체크
        const capitalIncome = row.pensionAfterTax + row.overseasDividend + row.overseasStockSale;
        if (capitalIncome < row.livingCost * 0.7) {
          reasons.push(`자산소득 부족 (연 ${Math.round(capitalIncome/10000)}만원, 생활비의 ${Math.round(capitalIncome/row.livingCost*100)}%)`);
        }
        
        // 3. 국민연금 미수령 체크
        if (row.age >= 65 && row.nationalPension === 0) {
          reasons.push(`국민연금 미수령 (${inputs.nationalPensionStartAge}세 수령 예정)`);
        }
        
        // 4. 세금/건보료 과다 체크 (총 지출의 20% 이상)
        const taxAndInsurance = row.totalExpense - row.livingCost;
        if (taxAndInsurance > row.totalExpense * 0.2) {
          reasons.push(`세금/건보료 과다 (연 ${Math.round(taxAndInsurance/10000)}만원, 지출의 ${Math.round(taxAndInsurance/row.totalExpense*100)}%)`);
        }
        
        // 5. 자산 고갈 체크
        const totalAssets = row.isaBalance + row.pensionBalance + row.overseasBalance;
        if (totalAssets < (inputs.totalPension + inputs.husbandISA + inputs.wifeISA) * 0.3) {
          reasons.push(`자산 고갈 위험 (총자산 ${Math.round(totalAssets/100000000)}억원, 초기 대비 ${Math.round(totalAssets/(inputs.totalPension+inputs.husbandISA+inputs.wifeISA+inputs.overseasInvestmentAmount)*100)}%)`);
        }
        
        failureData = {
          age: row.age,
          deficit: deficit,
          totalIncome: row.totalIncome,
          totalExpense: row.totalExpense,
          livingCost: row.livingCost,
          reason: reasons.length > 0 ? reasons : ['수입 부족으로 지출을 감당할 수 없습니다']
        };
        
        break;
      }
    }
    
    setAssetDepletionAge(depletionAge);
    setIsFireSuccess(fireSuccess);
    setFailureInfo(failureData);
    setResults(rows);
    setShowResults(true);

    // 토스트 메시지 표시
    showToast('계산이 완료되었습니다');

    return { results: rows, isFireSuccess: fireSuccess, assetDepletionAge: depletionAge, inputs: { retirementStartAge: inputs.retirementStartAge, simulationEndAge: inputs.simulationEndAge, currentAge: inputs.currentAge, startYear: inputs.startYear, monthlyLivingCostBefore75: inputs.monthlyLivingCostBefore75, monthlyLivingCostAfter75: inputs.monthlyLivingCostAfter75, nationalPensionStartAge: inputs.nationalPensionStartAge, nationalPensionYearly: inputs.nationalPensionYearly, usePensionDepletion: inputs.usePensionDepletion, totalDebt: inputs.totalDebt } };
  };

  const formatAmount = (amount: number, hideAmount: boolean = false): string => {
    if (hideAmount) return "••••••";
    return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
  };

  const getAmountColor = (amount: number): string => {
    if (amount > 0) return 'var(--color-profit)';
    if (amount < 0) return 'var(--color-loss)';
    return 'var(--text-primary)';
  };

  const EMPTY_INPUTS: InputValues = {
    currentAge: 0,
    startYear: new Date().getFullYear(),
    retirementStartAge: 0,
       simulationEndAge: 0,
    monthlyLivingCostBefore75: 0,
    monthlyLivingCostAfter75: 0,
    inflationRate: 2,
    nationalPensionStartAge: 65,
    nationalPensionYearly: 0,
    retirementPensions: [],
    retirementPensionType: 'irp',
    retirementPensionBalance: 0,
    retirementPensionReturnRate: 0.05,
    personalPensions: [],
    totalPension: 0,
    pensionWithdrawalAmount: 0,
    pensionReturnRate: 0.05,
    pensionExcessTaxRate: 0.15,
    pensionStartAge: 55,
    usePensionDepletion: false,
    husbandISA: 0, wifeISA: 0, isaReturnRate: 0.05,
    overseasInvestmentAmount: 0, overseasReturnRate: 0.07,
    savingsAmount: 0, savingsReturnRate: 0.03,
    lifeInsurancePensionStartAge: 55, lifeInsurancePensionYearly: 0,
    homeValue: 0, homePensionStartAge: 55, homePensionMonthly: 0,
    additionalAssets: [],
    totalDebt: 0, monthlyDebtRepayment: 0, debtEndAge: 65,
    irregularExpenses: [],
    returnRateType: 'pretax',
  };

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [presetDescExpanded, setPresetDescExpanded] = useState(true);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!presetDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(e.target as Node)) {
        setPresetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [presetDropdownOpen]);

  const B = ({ children }: { children: React.ReactNode }) => <strong style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{children}</strong>;
  const EXAMPLE_PRESETS: { label: string; desc: React.ReactNode; img: string; data: Partial<InputValues> }[] = [
    {
      label: '35세 싱글 (자산 2.5억)',
      img: '/images/tip1.png',
      desc: <>현재 <B>35세</B> 싱글이고, 은퇴는 <B>55세</B>를 하려고 해요. 희망하는 한달 생활비는 <B>300만원</B>이에요. 은퇴 시점에 퇴직연금(DC형) <B>5,000만원</B>, 연금저축 <B>8,000만원</B>, ISA <B>4,000만원</B>, 해외직투 <B>5,000만원</B>, 예적금 <B>3,000만원</B>이 예상돼요. 현재 대출이 <B>5,000만원</B> 남아있고, <B>45세</B>까지 갚을 계획이에요.</>,
      data: {
        currentAge: 35, retirementStartAge: 55, simulationEndAge: 90,
        monthlyLivingCostBefore75: 3000000, monthlyLivingCostAfter75: 2500000, inflationRate: 2.5,
        nationalPensionStartAge: 65, nationalPensionYearly: 12000000,
        retirementPensions: [
          { id: 'ex-30s-dc', type: 'dc', name: 'DC형', balance: 50000000, returnRate: 0.06 },
        ],
        retirementPensionType: 'dc', retirementPensionBalance: 50000000, retirementPensionReturnRate: 0.06,
        personalPensions: [
          { id: 'ex-30s-ps', type: 'pension_savings' as PersonalPensionType, name: '연금저축', balance: 80000000, returnRate: 0.06 },
        ],
        totalPension: 80000000, pensionWithdrawalAmount: 15000000, pensionReturnRate: 0.06, pensionStartAge: 55, usePensionDepletion: true,
        husbandISA: 40000000, wifeISA: 0, isaReturnRate: 0.06,
        overseasInvestmentAmount: 50000000, overseasReturnRate: 0.08,
        savingsAmount: 30000000, savingsReturnRate: 0.035,
        homeValue: 0, homePensionStartAge: 65, homePensionMonthly: 0,
        lifeInsurancePensionStartAge: 55, lifeInsurancePensionYearly: 0,
        additionalAssets: [
          { id: 'ex-30s-isa', type: 'isa' as AssetType, name: 'ISA', balance: 40000000, returnRate: 0.06 },
          { id: 'ex-30s-overseas', type: 'overseas' as AssetType, name: '해외직투', balance: 50000000, returnRate: 0.08 },
          { id: 'ex-30s-savings', type: 'savings' as AssetType, name: '예적금', balance: 30000000, returnRate: 0.035 },
        ],
        totalDebt: 50000000, monthlyDebtRepayment: 1000000, debtEndAge: 45,
        irregularExpenses: [],
      },
    },
    {
      label: '42세 싱글 (자산 3억)',
      img: '/images/tip2.png',
      desc: <>현재 <B>42세</B> 싱글이고, 은퇴는 <B>55세</B>를 하려고 해요. 희망하는 한달 생활비는 <B>350만원</B>이에요. 은퇴 시점에 퇴직연금(DC형) <B>8,000만원</B>, 연금저축 <B>6,000만원</B>, 연금보험 <B>4,000만원</B>, ISA <B>4,000만원</B>, 해외직투 <B>5,000만원</B>, 예적금 <B>3,000만원</B>이 예상돼요. 부동산 <B>3억</B>이 있고, <B>70세</B>부터 주택연금 월 <B>50만원</B>을 받을 수 있어요. 현재 대출 <B>3,000만원</B>은 <B>55세</B>까지 상환할 계획이에요.</>,
      data: {
        currentAge: 42, retirementStartAge: 55, simulationEndAge: 90,
        monthlyLivingCostBefore75: 3500000, monthlyLivingCostAfter75: 2500000, inflationRate: 2,
        nationalPensionStartAge: 65, nationalPensionYearly: 15000000,
        retirementPensions: [
          { id: 'ex-40s-dc', type: 'dc', name: 'DC형', balance: 80000000, returnRate: 0.05 },
        ],
        retirementPensionType: 'dc', retirementPensionBalance: 80000000, retirementPensionReturnRate: 0.05,
        personalPensions: [
          { id: 'ex-40s-ps', type: 'pension_savings' as PersonalPensionType, name: '연금저축', balance: 60000000, returnRate: 0.05 },
          { id: 'ex-40s-pi', type: 'pension_insurance' as PersonalPensionType, name: '연금보험', balance: 40000000, returnRate: 0.04 },
        ],
        totalPension: 100000000, pensionWithdrawalAmount: 18000000, pensionReturnRate: 0.05, pensionStartAge: 55, usePensionDepletion: true,
        husbandISA: 40000000, wifeISA: 0, isaReturnRate: 0.05,
        overseasInvestmentAmount: 50000000, overseasReturnRate: 0.07,
        savingsAmount: 30000000, savingsReturnRate: 0.03,
        homeValue: 300000000, homePensionStartAge: 70, homePensionMonthly: 500000,
        lifeInsurancePensionStartAge: 55, lifeInsurancePensionYearly: 0,
        additionalAssets: [
          { id: 'ex-40s-isa', type: 'isa' as AssetType, name: 'ISA', balance: 40000000, returnRate: 0.05 },
          { id: 'ex-40s-overseas', type: 'overseas' as AssetType, name: '해외직투', balance: 50000000, returnRate: 0.07 },
          { id: 'ex-40s-savings', type: 'savings' as AssetType, name: '예적금', balance: 30000000, returnRate: 0.03 },
          { id: 'ex-40s-home', type: 'real_estate' as AssetType, name: '부동산/주택연금', balance: 300000000, returnRate: 0, startAge: 70, monthlyAmount: 500000 },
        ],
        totalDebt: 30000000, monthlyDebtRepayment: 800000, debtEndAge: 55,
        irregularExpenses: [],
      },
    },
    {
      label: '52세 싱글 (자산 5억)',
      img: '/images/tip3.png',
      desc: <>현재 <B>52세</B> 싱글이고, 은퇴는 <B>55세</B>를 하려고 해요. 희망하는 한달 생활비는 <B>400만원</B>이에요. 은퇴 시점에 퇴직연금(IRP) <B>1.5억</B>, 연금저축 2개(<B>8,000만원</B> + <B>3,000만원</B>), 연금보험 <B>4,000만원</B>, ISA <B>5,000만원</B>, 해외직투 <B>5,000만원</B>, 예적금 <B>5,000만원</B>이 예상돼요. 생명보험연금(<B>55세</B>부터 연 <B>200만원</B>), 부동산 <B>4억</B>(<B>65세</B>부터 주택연금 월 <B>80만원</B>)도 있어요. 대출은 없고, <B>70세</B>에 의료비 <B>2,000만원</B>을 예상하고 있어요.</>,
      data: {
        currentAge: 52, retirementStartAge: 55, simulationEndAge: 90,
        monthlyLivingCostBefore75: 4000000, monthlyLivingCostAfter75: 3000000, inflationRate: 2,
        nationalPensionStartAge: 65, nationalPensionYearly: 20000000,
        retirementPensions: [
          { id: 'ex-50s-irp', type: 'irp', name: 'IRP', balance: 150000000, returnRate: 0.05 },
        ],
        retirementPensionType: 'irp', retirementPensionBalance: 150000000, retirementPensionReturnRate: 0.05,
        personalPensions: [
          { id: 'ex-50s-ps1', type: 'pension_savings' as PersonalPensionType, name: '연금저축 1', balance: 80000000, returnRate: 0.05 },
          { id: 'ex-50s-ps2', type: 'pension_savings' as PersonalPensionType, name: '연금저축 2', balance: 30000000, returnRate: 0.05 },
          { id: 'ex-50s-pi', type: 'pension_insurance' as PersonalPensionType, name: '연금보험', balance: 40000000, returnRate: 0.04 },
        ],
        totalPension: 150000000, pensionWithdrawalAmount: 24000000, pensionReturnRate: 0.05, pensionStartAge: 55, usePensionDepletion: false,
        husbandISA: 50000000, wifeISA: 0, isaReturnRate: 0.05,
        overseasInvestmentAmount: 50000000, overseasReturnRate: 0.07,
        savingsAmount: 50000000, savingsReturnRate: 0.03,
        homeValue: 400000000, homePensionStartAge: 65, homePensionMonthly: 800000,
        lifeInsurancePensionStartAge: 55, lifeInsurancePensionYearly: 2000000,
        additionalAssets: [
          { id: 'ex-50s-isa', type: 'isa' as AssetType, name: 'ISA', balance: 50000000, returnRate: 0.05 },
          { id: 'ex-50s-overseas', type: 'overseas' as AssetType, name: '해외직투', balance: 50000000, returnRate: 0.07 },
          { id: 'ex-50s-savings', type: 'savings' as AssetType, name: '예적금', balance: 50000000, returnRate: 0.03 },
          { id: 'ex-50s-insurance', type: 'life_insurance' as AssetType, name: '생명보험연금', balance: 0, returnRate: 0, startAge: 55, monthlyAmount: 2000000 },
          { id: 'ex-50s-home', type: 'real_estate' as AssetType, name: '부동산/주택연금', balance: 400000000, returnRate: 0, startAge: 65, monthlyAmount: 800000 },
        ],
        totalDebt: 0, irregularExpenses: [{ name: '의료비', age: 70, amount: 20000000 }],
      },
    },
    {
      label: '45세 직장인 (자산 5억)',
      img: '/images/tip1.png',
      desc: <>현재 <B>45세</B> 직장인이고, 은퇴는 <B>55세</B>를 하려고 해요. 희망하는 한달 생활비는 <B>400만원</B>이에요. 은퇴 시점에 퇴직연금(DC형) <B>1억</B>, 연금저축 <B>1억</B>, 연금보험 <B>5,000만원</B>, ISA <B>5,000만원</B>, 예적금 <B>1억</B>이 예상돼요. 부동산 <B>5억</B>이 있고, <B>70세</B>부터 주택연금 월 <B>80만원</B>을 받을 수 있어요. 현재 대출이 <B>1억</B> 남아있고, <B>60세</B>까지 갚을 예정이에요. <B>60세</B>에 자녀 결혼 비용 <B>5,000만원</B>도 예상하고 있어요.</>,
      data: {
        currentAge: 45, retirementStartAge: 55, simulationEndAge: 90,
        monthlyLivingCostBefore75: 4000000, monthlyLivingCostAfter75: 3000000, inflationRate: 2.5,
        nationalPensionStartAge: 65, nationalPensionYearly: 18000000,
        retirementPensions: [
          { id: 'ex-45-dc', type: 'dc', name: 'DC형', balance: 100000000, returnRate: 0.05 },
        ],
        retirementPensionType: 'dc', retirementPensionBalance: 100000000, retirementPensionReturnRate: 0.05,
        personalPensions: [
          { id: 'ex-45-ps', type: 'pension_savings' as PersonalPensionType, name: '연금저축', balance: 100000000, returnRate: 0.06 },
          { id: 'ex-45-pi', type: 'pension_insurance' as PersonalPensionType, name: '연금보험', balance: 50000000, returnRate: 0.04 },
        ],
        totalPension: 150000000, pensionWithdrawalAmount: 20000000, pensionReturnRate: 0.06, pensionStartAge: 55, usePensionDepletion: true,
        husbandISA: 50000000, wifeISA: 0, isaReturnRate: 0.05,
        overseasInvestmentAmount: 50000000, overseasReturnRate: 0.07,
        savingsAmount: 100000000, savingsReturnRate: 0.035,
        homeValue: 500000000, homePensionStartAge: 70, homePensionMonthly: 800000,
        additionalAssets: [
          { id: 'ex2-isa', type: 'isa' as AssetType, name: 'ISA', balance: 50000000, returnRate: 0.05 },
          { id: 'ex2-savings', type: 'savings' as AssetType, name: '예적금', balance: 100000000, returnRate: 0.035 },
          { id: 'ex2-home', type: 'real_estate' as AssetType, name: '부동산/주택연금', balance: 500000000, returnRate: 0, startAge: 70, monthlyAmount: 800000 },
        ],
        totalDebt: 100000000, monthlyDebtRepayment: 1500000, debtEndAge: 60,
        irregularExpenses: [{ name: '자녀 결혼', age: 60, amount: 50000000 }],
      },
    },
    {
      label: '53세 고자산 (자산 10억)',
      img: '/images/tip2.png',
      desc: <>현재 <B>53세</B>이고, 은퇴는 내년 <B>54세</B>를 하려고 해요. 희망하는 한달 생활비는 <B>500만원</B>이에요. 은퇴 시점에 퇴직연금(IRP) 2개(<B>1.2억</B> + <B>8,000만원</B>), 연금저축 2개(<B>1.5억</B> + <B>1억</B>), 연금보험 <B>5,000만원</B>, ISA <B>2억</B>(부부 각 <B>1억</B>), 해외직투 <B>1억</B>, 예적금 <B>5,000만원</B>이 예상돼요. 부동산 <B>6억</B>이 있고, <B>65세</B>부터 주택연금 월 <B>100만원</B>을 받을 수 있어요. 대출은 없어요.</>,
      data: {
        currentAge: 53, retirementStartAge: 54, simulationEndAge: 85,
        monthlyLivingCostBefore75: 5000000, monthlyLivingCostAfter75: 4000000, inflationRate: 2,
        nationalPensionStartAge: 65, nationalPensionYearly: 24000000,
        retirementPensions: [
          { id: 'ex-53-irp1', type: 'irp', name: 'IRP 1', balance: 120000000, returnRate: 0.05 },
          { id: 'ex-53-irp2', type: 'irp', name: 'IRP 2', balance: 80000000, returnRate: 0.05 },
        ],
        retirementPensionType: 'irp', retirementPensionBalance: 200000000, retirementPensionReturnRate: 0.05,
        personalPensions: [
          { id: 'ex-53-ps1', type: 'pension_savings' as PersonalPensionType, name: '연금저축 1', balance: 150000000, returnRate: 0.05 },
          { id: 'ex-53-ps2', type: 'pension_savings' as PersonalPensionType, name: '연금저축 2', balance: 100000000, returnRate: 0.05 },
          { id: 'ex-53-pi', type: 'pension_insurance' as PersonalPensionType, name: '연금보험', balance: 50000000, returnRate: 0.04 },
        ],
        totalPension: 300000000, pensionWithdrawalAmount: 30000000, pensionReturnRate: 0.05, pensionStartAge: 55, usePensionDepletion: false,
        husbandISA: 100000000, wifeISA: 100000000, isaReturnRate: 0.05,
        overseasInvestmentAmount: 100000000, overseasReturnRate: 0.07,
        savingsAmount: 50000000, savingsReturnRate: 0.03,
        homeValue: 600000000, homePensionStartAge: 65, homePensionMonthly: 1000000,
        additionalAssets: [
          { id: 'ex1-isa', type: 'isa' as AssetType, name: 'ISA', balance: 200000000, returnRate: 0.05 },
          { id: 'ex1-overseas', type: 'overseas' as AssetType, name: '해외직투', balance: 100000000, returnRate: 0.07 },
          { id: 'ex1-savings', type: 'savings' as AssetType, name: '예적금', balance: 50000000, returnRate: 0.03 },
          { id: 'ex1-home', type: 'real_estate' as AssetType, name: '부동산/주택연금', balance: 600000000, returnRate: 0, startAge: 65, monthlyAmount: 1000000 },
        ],
        totalDebt: 0, irregularExpenses: [],
      },
    },
    {
      label: '62세 은퇴자 (연금 중심)',
      img: '/images/tip3.png',
      desc: <>현재 <B>62세</B>이고, 지금 바로 은퇴를 하려고 해요. 희망하는 한달 생활비는 <B>350만원</B>이에요. 국민연금은 <B>63세</B>부터 연 <B>2,000만원</B> 수령 예정이에요. 퇴직연금(IRP) <B>1.5억</B>, 연금저축 <B>1.2억</B>, 연금보험 <B>8,000만원</B>이 있어요. ISA <B>3,000만원</B>, 예적금 <B>8,000만원</B>, 생명보험연금(<B>60세</B>부터 연 <B>300만원</B>), 부동산 <B>4억</B>(<B>65세</B>부터 주택연금 월 <B>70만원</B>)도 있어요. 대출은 없어요.</>,
      data: {
        currentAge: 62, retirementStartAge: 62, simulationEndAge: 90,
        monthlyLivingCostBefore75: 3500000, monthlyLivingCostAfter75: 2500000, inflationRate: 2,
        nationalPensionStartAge: 63, nationalPensionYearly: 20000000,
        retirementPensions: [
          { id: 'ex-62-irp', type: 'irp', name: 'IRP', balance: 150000000, returnRate: 0.04 },
        ],
        retirementPensionType: 'irp', retirementPensionBalance: 150000000, retirementPensionReturnRate: 0.04,
        personalPensions: [
          { id: 'ex-62-ps', type: 'pension_savings' as PersonalPensionType, name: '연금저축', balance: 120000000, returnRate: 0.04 },
          { id: 'ex-62-pi', type: 'pension_insurance' as PersonalPensionType, name: '연금보험', balance: 80000000, returnRate: 0.04 },
        ],
        totalPension: 200000000, pensionWithdrawalAmount: 24000000, pensionReturnRate: 0.04, pensionStartAge: 60, usePensionDepletion: true,
        husbandISA: 30000000, wifeISA: 0, isaReturnRate: 0.04,
        overseasInvestmentAmount: 0, overseasReturnRate: 0.07,
        savingsAmount: 80000000, savingsReturnRate: 0.03,
        homeValue: 400000000, homePensionStartAge: 65, homePensionMonthly: 700000,
        lifeInsurancePensionStartAge: 60, lifeInsurancePensionYearly: 3000000,
        additionalAssets: [
          { id: 'ex3-isa', type: 'isa' as AssetType, name: 'ISA', balance: 30000000, returnRate: 0.04 },
          { id: 'ex3-savings', type: 'savings' as AssetType, name: '예적금', balance: 80000000, returnRate: 0.03 },
          { id: 'ex3-insurance', type: 'life_insurance' as AssetType, name: '생명보험연금', balance: 0, returnRate: 0, startAge: 60, monthlyAmount: 3000000 },
          { id: 'ex3-home', type: 'real_estate' as AssetType, name: '부동산/주택연금', balance: 400000000, returnRate: 0, startAge: 65, monthlyAmount: 700000 },
        ],
        totalDebt: 0, irregularExpenses: [{ name: '의료비', age: 75, amount: 30000000 }],
      },
    },
  ];


  const resetForm = () => {
    setInputs({ ...EMPTY_INPUTS });
    setShowResults(false);
    setResults([]);
    setIsFireSuccess(true);
    setAssetDepletionAge(null);
    setFailureInfo(null);
    setSelectedPreset('');
    setAssetInputMode('direct');
    setPensionInputMode('direct');
    setAppliedFields({});
    localStorage.removeItem('cashFlowData');
    onSimulationComplete?.({ results: [], isFireSuccess: true, assetDepletionAge: null });
  };

  const loadPreset = (index: number) => {
    const preset = EXAMPLE_PRESETS[index];
    setSelectedPreset(String(index));
    if (!preset) return;
    const merged = { ...EMPTY_INPUTS, ...preset.data };
    // 현재나이와 희망은퇴나이로 시작년도 자동 계산
    const thisYear = new Date().getFullYear();
    if (merged.currentAge && merged.retirementStartAge) {
      merged.startYear = thisYear + (merged.retirementStartAge - merged.currentAge);
    }
    setInputs(merged);
    setShowResults(false);
    setResults([]);
    setInputsDirty(false);
    setAssetInputMode('direct');
    setPensionInputMode('direct');
    setAppliedFields({});
    setPresetDescExpanded(true);
    // 모바일: 20초 후 자동 숨김
    if (window.innerWidth <= 768) {
      setTimeout(() => setPresetDescExpanded(false), 20000);
    }
    onSimulationComplete?.({ results: [], isFireSuccess: true, assetDepletionAge: null });
  };

  // 사이드바 TC 클릭 시 외부에서 데이터 직접 로드
  const prevTcDataRef = useRef<Record<string, any> | null | undefined>(undefined);
  useEffect(() => {
    if (initialTcData && initialTcData !== prevTcDataRef.current) {
      prevTcDataRef.current = initialTcData;
      const merged = { ...EMPTY_INPUTS, ...initialTcData } as InputValues;
      const thisYear = new Date().getFullYear();
      if (merged.currentAge && merged.retirementStartAge) {
        merged.startYear = thisYear + (merged.retirementStartAge - merged.currentAge);
      }
      setInputs(merged);
      setSelectedPreset('');
      setShowResults(false);
      setResults([]);
      setInputsDirty(false);
      setAssetInputMode('direct');
      setPensionInputMode('direct');
      setAppliedFields({});
      onSimulationComplete?.({ results: [], isFireSuccess: true, assetDepletionAge: null });
    }
  }, [initialTcData]);

  // 📥 CSV 다운로드
  const downloadCSV = () => {
    const headers = [
      '나이', '년도', 'ISA인출', '해외배당', '해외매도', '개인연금(세후)', 
      '주택연금', '국민연금', '생명보험연금', '총수입', '생활비', '건보료', '총지출', '남는금액', 
      'ISA잔액', '연금잔액', '해외투자잔액'
    ];
    
    const rows = results.map(row => [
      row.age,
      row.year,
      Math.round(row.isaWithdrawal),
      Math.round(row.overseasDividend),
      Math.round(row.overseasStockSale),
      Math.round(row.pensionAfterTax),
      Math.round(row.homePension),
      Math.round(row.nationalPension),
      Math.round(row.lifeInsurancePension),
      Math.round(row.totalIncome),
      Math.round(row.livingCost),
      Math.round(row.healthInsurance),
      Math.round(row.totalExpense),
      Math.round(row.yearlySurplus),
      Math.round(row.isaBalance),
      Math.round(row.pensionBalance),
      Math.round(row.overseasBalance)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `탈출로드맵리포트_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 📥 Excel 형식 다운로드 (CSV with Excel 호환)
  const downloadExcel = () => {
    const headers = [
      '나이', '년도', 'ISA인출', '해외배당', '해외매도', '개인연금(세후)', 
      '주택연금', '국민연금', '생명보험연금', '총수입', '생활비', '건보료', '총지출', '남는금액', 
      'ISA잔액', '연금잔액', '해외투자잔액'
    ];
    
    const rows = results.map(row => [
      row.age,
      row.year,
      Math.round(row.isaWithdrawal),
      Math.round(row.overseasDividend),
      Math.round(row.overseasStockSale),
      Math.round(row.pensionAfterTax),
      Math.round(row.homePension),
      Math.round(row.nationalPension),
      Math.round(row.lifeInsurancePension),
      Math.round(row.totalIncome),
      Math.round(row.livingCost),
      Math.round(row.healthInsurance),
      Math.round(row.totalExpense),
      Math.round(row.yearlySurplus),
      Math.round(row.isaBalance),
      Math.round(row.pensionBalance),
      Math.round(row.overseasBalance)
    ]);

    // Excel 호환 CSV (탭 구분)
    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `탈출로드맵리포트_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  // 📥 JSON 다운로드
  const downloadJSON = () => {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        retirementStartAge: inputs.retirementStartAge,
        simulationEndAge: inputs.simulationEndAge,
        monthlyLivingCostBefore75: inputs.monthlyLivingCostBefore75,
        monthlyLivingCostAfter75: inputs.monthlyLivingCostAfter75,
        inflationRate: inputs.inflationRate,
        totalPension: inputs.totalPension,
        pensionReturnRate: inputs.pensionReturnRate,
        usePensionDepletion: inputs.usePensionDepletion,
        isFireSuccess: isFireSuccess,
        assetDepletionAge: assetDepletionAge,
        failureInfo: failureInfo
      },
      results: results
    };

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `탈출로드맵리포트_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // 📥 텍스트 리포트 다운로드
  const downloadReport = () => {
    const reportLines = [
      '='.repeat(80),
      '현금흐름 시뮬레이션 리포트',
      '='.repeat(80),
      '',
      `생성일시: ${new Date().toLocaleString('ko-KR')}`,
      '',
      '【 입력 조건 】',
      '-'.repeat(80),
      `은퇴 시작 나이: ${inputs.retirementStartAge}세`,
      `몇 세까지 계산할까요?: ${inputs.simulationEndAge}세`,
      `75세 이전 월 생활비: ${formatAmount(inputs.monthlyLivingCostBefore75)}원`,
      `75세 이후 월 생활비: ${formatAmount(inputs.monthlyLivingCostAfter75)}원`,
      `물가상승률: ${inputs.inflationRate}%`,
      `초기 총 연금: ${formatAmount(inputs.totalPension)}원`,
      `연금 연수익률: ${(inputs.pensionReturnRate * 100).toFixed(1)}%`,
      `연금소진 모드: ${inputs.usePensionDepletion ? 'ON' : 'OFF'}`,
      '',
      '【 시뮬레이션 결과 】',
      '-'.repeat(80),
      `파이어족 성공: ${isFireSuccess ? '✅ 성공' : '❌ 실패'}`,
      assetDepletionAge ? `실패 나이: ${assetDepletionAge}세` : '',
      failureInfo ? `연 부족액: ${formatAmount(failureInfo.deficit)}원` : '',
      '',
      '【 연도별 상세 데이터 】',
      '-'.repeat(80),
      '나이\t년도\t총수입\t\t총지출\t\t남는금액\t\t총자산',
      '-'.repeat(80),
      ...results.map(row => 
        `${row.age}세\t${row.year}\t${formatAmount(row.totalIncome)}\t${formatAmount(row.totalExpense)}\t${formatAmount(row.yearlySurplus)}\t${formatAmount(row.isaBalance + row.pensionBalance + row.overseasBalance)}`
      ),
      '',
      '='.repeat(80),
      'Report End',
      '='.repeat(80)
    ].filter(line => line !== undefined);

    const reportContent = reportLines.join('\n');
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `탈출로드맵리포트_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <>
      {toastMsg && (
        <div className="sim-toast" style={{
          position: 'fixed', bottom: 32, right: 32,
          background: 'var(--bg-elevated)', color: 'var(--text-primary)',
          padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)', border: '1px solid var(--border-primary)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
          animation: 'toast-in 0.25s ease',
        }}>
          <CheckCircle size={18} color="var(--color-success, #22c55e)" strokeWidth={2} />
          {toastMsg}
        </div>
      )}
      <div style={{ padding: 24, margin: '0 auto', maxWidth: 800 }}>

      {/* 페이지 타이틀 */}
      <div className="page-title-section">
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: '0 0 6px' }}>탈출지도</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 24 }}>Power J의 정밀 로직으로 분석하는 나의 자산 수명 예측</p>
      </div>

      {/* 입력 폼 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' as const, gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 'var(--font-bold)' as any, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0, flex: 'none' }}>
              <Calculator style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
              내 정보 입력
            </h2>
            <button
              onClick={resetForm}
              className="btn-reset-mobile"
              style={{ display: 'none', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 12, fontWeight: 500, color: 'var(--accent-blue)', borderRadius: 6, border: '1px solid var(--accent-blue)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}
            >
              <PenLine style={{ width: 12, height: 12 }} />
              직접 입력
            </button>
            {/* 셀렉트 + 계산하기 그룹 */}
            <div ref={presetDropdownRef} className="preset-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                className={!selectedPreset ? 'preset-cta' : ''}
                style={{ padding: '6px 28px 6px 12px', fontSize: 13, fontWeight: 600, color: selectedPreset ? 'var(--text-primary)' : '#fff', borderRadius: 8, border: selectedPreset ? '1px solid var(--border-primary)' : 'none', backgroundColor: selectedPreset ? 'var(--bg-secondary)' : '#3182F6', cursor: 'pointer', minWidth: 100, height: 33.5, boxShadow: selectedPreset ? 'none' : '0 2px 8px rgba(49, 130, 246, 0.3)', textAlign: 'left' as const, fontFamily: 'inherit', position: 'relative' as const, overflow: 'hidden' }}
              >
                {selectedPreset ? EXAMPLE_PRESETS[parseInt(selectedPreset)]?.label : '연령별 탈출 시나리오'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: 10, top: '50%', transform: `translateY(-50%) ${presetDropdownOpen ? 'rotate(180deg)' : ''}`, transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" stroke={selectedPreset ? '#999' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {presetDropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '100%', width: 'max-content', background: '#3182F6', borderRadius: 10, boxShadow: '0 8px 24px rgba(49, 130, 246, 0.35)', zIndex: 100, overflow: 'hidden', padding: '4px 0' }}>
                  {EXAMPLE_PRESETS.map((p, i) => {
                    const isTC = p.label.startsWith('TC-');
                    const prevIsTC = i > 0 && EXAMPLE_PRESETS[i-1].label.startsWith('TC-');
                    const showDivider = isTC && !prevIsTC;
                    return (
                      <div key={i}>
                        {showDivider && <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '4px 10px' }} />}
                        <div
                          onClick={() => { loadPreset(i); setPresetDropdownOpen(false); }}
                          style={{ padding: '7px 14px', fontSize: isTC ? 12 : 13, fontWeight: 500, color: isTC ? 'rgba(255,255,255,0.85)' : '#fff', cursor: 'pointer', transition: 'background 0.15s', background: selectedPreset === String(i) ? 'rgba(255,255,255,0.2)' : 'transparent', whiteSpace: 'nowrap' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = selectedPreset === String(i) ? 'rgba(255,255,255,0.2)' : 'transparent')}
                        >
                          {p.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedPreset && canCalculate && (!showResults || inputsDirty) && (
              <button
                className="calc-btn"
                onClick={runSimulation}
                disabled={isSimulating}
                style={{ padding: '6px 16px', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, cursor: 'pointer', height: 33.5, fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}
              >
                {isSimulating ? '분석 중...' : inputsDirty ? '다시 계산' : '계산하기'}
              </button>
            )}
            <button
              onClick={resetForm}
              className="btn-reset"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', fontSize: 13, fontWeight: 400, color: 'var(--text-tertiary)', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', height: 33.5, fontFamily: 'inherit', marginLeft: 'auto', transition: 'background 0.15s' }}
              title="내 정보 직접 입력하기"
            >
              <PenLine style={{ width: 14, height: 14 }} />
              <span className="reset-label">내 정보 직접 입력하기</span>
            </button>
            <div className="recent-calc-btn" style={{ marginLeft: 0, display: 'none' }}>
            {(() => { const hasSaved = !!localStorage.getItem('cashFlowData'); return (
            <button
              disabled={!hasSaved}
              onClick={() => {
                try {
                  const saved = localStorage.getItem('cashFlowData');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.inputs) {
                      setInputs(parsed.inputs);
                      if (parsed.results && parsed.results.length > 0) {
                        setResults(parsed.results);
                        setShowResults(true);
                        setIsFireSuccess(parsed.isFireSuccess ?? true);
                        setAssetDepletionAge(parsed.assetDepletionAge ?? null);
                        setFailureInfo(parsed.failureInfo ?? null);
                        onSimulationComplete?.({ results: parsed.results, isFireSuccess: parsed.isFireSuccess ?? true, assetDepletionAge: parsed.assetDepletionAge ?? null });
                      }
                      setSelectedPreset('');
                      setInputsDirty(false);
                      showToast('최근 계산 데이터를 불러왔습니다');
                    }
                  }
                } catch (e) {
                  showToast('데이터 불러오기 실패');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', fontSize: 13, fontWeight: 600, color: hasSaved ? 'var(--accent-blue)' : 'var(--text-tertiary)', borderRadius: 8, border: hasSaved ? '1px solid var(--accent-blue)' : '1px solid var(--border-primary)', background: 'transparent', cursor: hasSaved ? 'pointer' : 'default', opacity: hasSaved ? 1 : 0.5, whiteSpace: 'nowrap' as const, fontFamily: 'inherit', height: 33.5 }}
            >
              최근계산
            </button>
            ); })()}
            </div>
        </div>

        {/* 선택된 프리셋 설명 — 셀렉트 하단에 붙음 */}
        {selectedPreset && EXAMPLE_PRESETS[parseInt(selectedPreset)]?.desc && Object.keys(appliedFields).length === 0 && presetDescExpanded && (
          <div style={{ position: 'relative', margin: '0 0 8px' }}>
            {/* 위쪽 화살표 */}
            <div style={{ position: 'absolute', top: -6, left: 24, width: 12, height: 12, background: 'var(--accent-blue-bg)', border: '1px solid #c9e0f9', borderRight: 'none', borderBottom: 'none', transform: 'rotate(45deg)', zIndex: 1 }} />
            <div style={{ background: 'var(--accent-blue-bg)', borderRadius: 10, overflow: 'hidden', border: '1px solid #c9e0f9', position: 'relative' as const }}>
              <button onClick={() => setPresetDescExpanded(false)} style={{ position: 'absolute' as const, top: 8, right: 8, padding: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 7.5L6 4.5L9 7.5" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div style={{ padding: '14px 18px' }}>
                <div className="preset-desc-layout" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  {/* 좌: 캐릭터 + 설명 */}
                  <div style={{ flex: 1.2, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <img src={EXAMPLE_PRESETS[parseInt(selectedPreset)].img} alt="" style={{ width: 90, height: 'auto', flexShrink: 0 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, wordBreak: 'keep-all' as const, lineHeight: 1.7 }}>
                        {EXAMPLE_PRESETS[parseInt(selectedPreset)].desc}
                      </p>
                    </div>
                  </div>
                  {/* 우: 활용 팁 */}
                  <div style={{ flex: 0.8, minWidth: 0, paddingLeft: 20, borderLeft: '1px solid rgba(49,130,246,0.15)' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)', margin: '0 0 8px' }}>활용 팁</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                      {[
                        <>먼저 이대로 계산해서 결과를 확인해 보세요.</>,
                        <><B>은퇴 나이</B>·<B>생활비</B>·<B>자산</B>을 자유롭게 바꿔보세요.</>,
                        <>숫자를 조금만 바꿔도 결과가 크게 달라져요.</>,
                      ].map((tip, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                          <span style={{ flexShrink: 0, color: 'var(--accent-blue)', fontWeight: 600 }}>{i + 1}.</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 연도별 보기 안내 (모바일) - 하단 안내로 이동 */}


        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ===== 👤 기본 정보 ===== */}
          <div className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>기본 정보</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>현재 나이와 희망 은퇴 나이를 입력하면 시작 년도가 자동 계산됩니다.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 24px' }}>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}>현재 나이</span>
            <input type="number" value={inputs.currentAge} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('currentAge', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}><Tooltip text="은퇴 나이를 늦추면 결과가 크게 달라져요. ① 자산이 수익률로 더 오래 불어나고 ② 생활비를 쓰는 기간이 줄어들고 ③ 국민연금(65세) 수령까지 자산만으로 버텨야 하는 공백 기간이 짧아져요. 특히 55세 은퇴 시 65세까지 10년간 국민연금 없이 자산이 크게 소진되는 구간이 가장 위험해요.">희망 은퇴 나이 ⓘ</Tooltip></span>
            {strategyBadge('retirementStartAge')}
            <input type="number" value={inputs.retirementStartAge} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('retirementStartAge', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...appliedInputStyle('retirementStartAge') }} />
          </div>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}><Tooltip text="현재 나이와 희망 은퇴 나이로 자동 계산됩니다. 직접 수정도 가능합니다.">시작 년도 ⓘ</Tooltip></span>
            <input type="number" value={inputs.startYear} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('startYear', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}>몇 세까지 계산할까요?</span>
            <input type="number" value={inputs.simulationEndAge} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('simulationEndAge', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}><Tooltip text="생활비는 '현재 가치' 기준으로 입력하세요. 시뮬레이션이 매년 물가상승률을 자동 반영합니다.">물가상승률 (%) ⓘ</Tooltip></span>
            <input type="number" step="0.1" value={inputs.inflationRate} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('inflationRate', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          </div>
          </div>

          {/* ===== 💰 은퇴 후 목표 생활비 ===== */}
          <div className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>은퇴 후 목표 생활비</h3>
            <span
              onClick={() => setShowLivingCostHelper(true)}
              style={{ fontSize: 12, color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
            >생활비 계산 도우미</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>현재 가치 기준으로 입력하세요. 물가상승률이 자동 반영됩니다.</p>

          {/* 생활비 계산 도우미 팝업 */}
          {showLivingCostHelper && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLivingCostHelper(false)}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '90%', maxWidth: 400, background: 'var(--bg-primary)', borderRadius: 16, padding: '24px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>생활비 계산 도우미</h3>
                  <button onClick={() => setShowLivingCostHelper(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>&times;</button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.5 }}>
                  카드사 앱에서 최근 6개월 결제 내역을 확인하고, 항목별로 입력하세요. 합계가 자동으로 75세 이전 생활비에 반영됩니다.
                </p>
                {(() => {
                  const helperFields = [
                    { label: '카드 사용액 (월평균)', key: 'helper_card' },
                    { label: '현금 지출 (시장, 경조사 등)', key: 'helper_cash' },
                    { label: '고정비 (관리비, 통신, 보험)', key: 'helper_fixed' },
                    { label: '은퇴 후 추가 비용 (여행, 취미)', key: 'helper_add' },
                    { label: '은퇴 후 제외 비용 (교통, 학비)', key: 'helper_remove' },
                  ];
                  return (
                    <>
                      {helperFields.map(({ label, key }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                          <span style={{ fontSize: 13, color: key === 'helper_remove' ? 'var(--color-loss)' : 'var(--text-secondary)' }}>
                            {key === 'helper_remove' ? '(−) ' : key === 'helper_add' ? '(+) ' : ''}{label}
                          </span>
                          <input
                            type="text"
                            data-helper={key}
                            defaultValue=""
                            placeholder="0"
                            onChange={() => {
                              const getVal = (k: string) => parseInt(document.querySelector<HTMLInputElement>(`[data-helper="${k}"]`)?.value.replace(/,/g, '') || '0', 10) || 0;
                              const total = getVal('helper_card') + getVal('helper_cash') + getVal('helper_fixed') + getVal('helper_add') - getVal('helper_remove');
                              if (total > 0) handleInputChange('monthlyLivingCostBefore75', String(total));
                            }}
                            style={{ width: 110, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', marginTop: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>= 월 생활비 합계</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-blue)' }}>{formatInputAmount(inputs.monthlyLivingCostBefore75)}원</span>
                      </div>
                    </>
                  );
                })()}
                <button
                  onClick={() => setShowLivingCostHelper(false)}
                  style={{ width: '100%', marginTop: 12, padding: '12px 0', fontSize: 14, fontWeight: 700, color: '#fff', background: 'var(--accent-blue)', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                >확인</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 24px' }}>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}><Tooltip text="현재 가치 기준으로 입력하세요. 물가상승률이 자동 반영됩니다.">75세 이전 월 생활비 ⓘ</Tooltip></span>
            {strategyBadge('monthlyLivingCostBefore75')}
            <input type="text" value={formatInputAmount(inputs.monthlyLivingCostBefore75)} onChange={(e) => handleInputChange('monthlyLivingCostBefore75', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...appliedInputStyle('monthlyLivingCostBefore75') }} />
          </div>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}><Tooltip text="75세 이전의 70% 자동 적용. 활동량 감소를 반영한 값이며 직접 수정 가능합니다.">75세 이후 월 생활비 ⓘ</Tooltip></span>
            {strategyBadge('monthlyLivingCostAfter75')}
            <input type="text" value={formatInputAmount(inputs.monthlyLivingCostAfter75)} onChange={(e) => handleInputChange('monthlyLivingCostAfter75', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...appliedInputStyle('monthlyLivingCostAfter75') }} />
          </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
            ※ 75세 이후는 75세 이전의 70%로 자동 계산됩니다. 직접 수정도 가능합니다.
          </p>
          </div>

          {/* ===== 🏛️ 1층: 국민연금 ===== */}
          <div className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>1층: 국민연금</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>국민연금공단에서 받는 공적연금이에요. 내 연금 예상액은 국민연금공단 홈페이지에서 확인하세요.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0', borderBottom: '1px solid var(--border-secondary)' }}>
            <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1 }}><Tooltip text="조기수령(60~64세): 1년당 6% 감액. 연기수령(66~70세): 1년당 7.2% 증액.">개시 나이 ⓘ</Tooltip></span>
              {strategyBadge('nationalPensionStartAge')}
              <input type="number" value={inputs.nationalPensionStartAge} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('nationalPensionStartAge', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...appliedInputStyle('nationalPensionStartAge') }} />
            </div>
            {inputs.nationalPensionStartAge < 65 && (
              <p style={{ fontSize: 11, color: '#c2410c', marginTop: 4 }}>조기수령: {Math.min(5, 65 - inputs.nationalPensionStartAge) * 6}% 감액</p>
            )}
            {inputs.nationalPensionStartAge > 65 && (
              <p style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>연기수령: {(Math.min(5, inputs.nationalPensionStartAge - 65) * 7.2).toFixed(1)}% 증액</p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
            <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1 }}><Tooltip text="65세에 정상 수령할 때 받는 월 금액을 입력해 주세요. 조기수령이나 연기수령을 선택하면 감액·증액이 자동으로 반영돼요.">월 수령액 (65세 기준) ⓘ</Tooltip></span>
              <input type="text" value={formatInputAmount(inputs.nationalPensionYearly / 12)} onChange={(e) => { const v = parseInt(e.target.value.replace(/,/g, ''), 10) || 0; handleInputChange('nationalPensionYearly', (v * 12).toString()); }} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            {inputs.nationalPensionStartAge !== 65 && inputs.nationalPensionYearly > 0 && (
              <p style={{ fontSize: 11, color: inputs.nationalPensionStartAge < 65 ? '#ea580c' : '#059669', marginTop: 4 }}>
                {inputs.nationalPensionStartAge}세 수령 시: 월 {formatKoreanAmount((inputs.nationalPensionYearly / 12) * (inputs.nationalPensionStartAge < 65 ? (1 - Math.min(5, 65 - inputs.nationalPensionStartAge) * 0.06) : (1 + Math.min(5, inputs.nationalPensionStartAge - 65) * 0.072)))}
              </p>
            )}
          </div>
          </div>
          </div>

          {/* ===== 🏢 2층: 퇴직연금 ===== */}
          <div className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>2층: 퇴직연금</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>퇴직연금 계좌를 추가하세요.</p>

          {inputs.retirementPensions.map((rp, rpIdx) => {
            const updateRP = (field: string, value: any) => {
              const updated = [...inputs.retirementPensions];
              updated[rpIdx] = { ...updated[rpIdx], [field]: value };
              // DB형 전환 시 수익률 0으로 자동 세팅
              if (field === 'type' && value === 'db') updated[rpIdx].returnRate = 0;
              setInputs(prev => ({ ...prev, retirementPensions: updated }));
              if (showResults) setInputsDirty(true);
            };
            const removeRP = () => {
              setInputs(prev => ({ ...prev, retirementPensions: prev.retirementPensions.filter((_, i) => i !== rpIdx) }));
              if (showResults) setInputsDirty(true);
            };
            const isLastRP = rpIdx === inputs.retirementPensions.length - 1;
            return (
              <div key={rp.id} className="asset-card" style={{ padding: '14px 16px', marginBottom: 8, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 20px' }}>
                  <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <button className="btn-delete" onClick={removeRP} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}><Trash2 size={14} color="var(--text-tertiary, #aaa)" /></button>
                    <select value={rp.type} onChange={(e) => updateRP('type', e.target.value)}
                      className="blue-select" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none', background: '#4b5563', color: '#fff', cursor: 'pointer' }}>
                      <option value="irp">IRP</option>
                      <option value="dc">DC</option>
                      <option value="db">DB</option>
                    </select>
                    <span className="mobile-hide-label" style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>{rp.type === 'db' ? '예상 퇴직급여' : '적립금'} <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>(은퇴 시점)</span></span>
                    <input type="text" value={formatInputAmount(rp.balance)} onChange={(e) => updateRP('balance', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                      style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  {rp.type !== 'db' ? (
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>수익률(%)</span>
                      <input type="text" value={(rp.returnRate * 100).toFixed(1)} onChange={(e) => updateRP('returnRate', (parseFloat(e.target.value) || 0) / 100)}
                        style={{ width: 70, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                      <div style={{ padding: '5px 8px', borderRadius: 6, background: 'rgba(59, 130, 246, 0.06)', fontSize: 12, color: '#3b82f6' }}>수익률 미적용</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 퇴직연금 추가 버튼 */}
          <div style={{ marginTop: inputs.retirementPensions.length > 0 ? 12 : 0, paddingTop: inputs.retirementPensions.length > 0 ? 12 : 0, borderTop: inputs.retirementPensions.length > 0 ? '1px solid var(--border-secondary)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1px dashed var(--border-primary)', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setInputs(prev => ({ ...prev, retirementPensions: [...prev.retirementPensions, createDefaultRetirementPension('irp')] }))}>
              <span style={{ fontSize: 18, color: 'var(--accent-blue)', lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>퇴직연금 계좌 추가</span>
            </div>
          </div>
          </div>

          {/* ===== 💼 3층: 개인연금 ===== */}
          <div id="section-pension" className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>3층: 개인연금</h3>
            <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: 'var(--bg-tertiary, #f3f4f6)', cursor: 'pointer', userSelect: 'none' as const }}>
              <span onClick={() => setPensionInputMode('direct')}
                style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, borderRadius: 6, transition: 'all 0.2s', background: pensionInputMode === 'direct' ? '#fff' : 'transparent', color: pensionInputMode === 'direct' ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: pensionInputMode === 'direct' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>은퇴 시점</span>
              <span onClick={() => setPensionInputMode('accumulate')}
                style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, borderRadius: 6, transition: 'all 0.2s', background: pensionInputMode === 'accumulate' ? '#fff' : 'transparent', color: pensionInputMode === 'accumulate' ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: pensionInputMode === 'accumulate' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>적립식</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>{pensionInputMode === 'direct' ? '연금저축, 연금보험 계좌를 추가하세요.' : '현재 잔액과 연 납입액으로 은퇴 시점 자산을 자동 계산합니다.'}</p>

          {inputs.personalPensions.map((pp, ppIdx) => {
            const updatePP = (field: string, value: any) => {
              const updated = [...inputs.personalPensions];
              updated[ppIdx] = { ...updated[ppIdx], [field]: value };
              setInputs(prev => ({ ...prev, personalPensions: updated }));
              if (showResults) setInputsDirty(true);
            };
            const removePP = () => {
              setInputs(prev => ({ ...prev, personalPensions: prev.personalPensions.filter((_, i) => i !== ppIdx) }));
              if (showResults) setInputsDirty(true);
            };
            const isLastPP = ppIdx === inputs.personalPensions.length - 1;
            const yearsToRetire = Math.max(0, inputs.retirementStartAge - inputs.currentAge);
            const calcPPAccumulated = () => {
              const cb = pp.currentBalance || 0;
              const yc = pp.yearlyContribution || 0;
              const r = pp.returnRate || 0;
              const n = yearsToRetire;
              if (n <= 0) return cb;
              if (r === 0) return cb + yc * n;
              const compounded = Math.pow(1 + r, n);
              return Math.round(cb * compounded + yc * (compounded - 1) / r);
            };
            return (
              <div key={pp.id} className="asset-card" style={{ padding: '14px 16px', marginBottom: 8, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 20px' }}>
                  {pensionInputMode === 'direct' ? (
                  <>
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <button className="btn-delete" onClick={removePP} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}><Trash2 size={14} color="var(--text-tertiary, #aaa)" /></button>
                      <select value={pp.type} onChange={(e) => updatePP('type', e.target.value)}
                        className="blue-select" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none', background: '#4b5563', color: '#fff', cursor: 'pointer' }}>
                        <option value="pension_savings">연금저축</option>
                        <option value="pension_insurance">연금보험</option>
                      </select>
                      <span className="mobile-hide-label" style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>잔액 <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>(은퇴 시점)</span></span>
                      <input type="text" value={formatInputAmount(pp.balance)} onChange={(e) => updatePP('balance', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                        className={appliedFields['totalPension'] ? 'strategy-applied' : ''}
                        style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...appliedInputStyle('totalPension') }} />
                    </div>
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>수익률(%)</span>
                      <input type="text" value={(pp.returnRate * 100).toFixed(1)} onChange={(e) => updatePP('returnRate', (parseFloat(e.target.value) || 0) / 100)}
                        style={{ width: 70, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  </>
                  ) : (
                  <>
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <button className="btn-delete" onClick={removePP} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}><Trash2 size={14} color="var(--text-tertiary, #aaa)" /></button>
                      <select value={pp.type} onChange={(e) => updatePP('type', e.target.value)}
                        className="blue-select" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none', background: '#4b5563', color: '#fff', cursor: 'pointer' }}>
                        <option value="pension_savings">연금저축</option>
                        <option value="pension_insurance">연금보험</option>
                      </select>
                      <span className="mobile-hide-label" style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>현재 잔액</span>
                      <input type="text" value={formatInputAmount(pp.currentBalance || 0)} onChange={(e) => updatePP('currentBalance', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                        style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>연 납입액</span>
                      <input type="text" value={formatInputAmount(pp.yearlyContribution || 0)} onChange={(e) => updatePP('yearlyContribution', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                        style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>수익률(%)</span>
                      <input type="text" value={(pp.returnRate * 100).toFixed(1)} onChange={(e) => updatePP('returnRate', (parseFloat(e.target.value) || 0) / 100)}
                        style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ width: '100%', padding: '6px 10px', marginTop: 4, borderRadius: 6, background: 'rgba(16, 185, 129, 0.06)', fontSize: 12, color: '#0b9936', lineHeight: 1.4 }}>
                      {yearsToRetire > 0
                        ? <>{inputs.retirementStartAge}세 예상 잔액: <strong>{calcPPAccumulated().toLocaleString()}원</strong> <span style={{ color: 'var(--text-tertiary)' }}>({yearsToRetire}년간 적립)</span></>
                        : '현재 나이와 은퇴 나이를 확인해주세요'}
                    </div>
                  </>
                  )}
                </div>
              </div>
            );
          })}

          {/* 개인연금 추가 버튼 */}
          <div style={{ marginTop: inputs.personalPensions.length > 0 ? 12 : 0, paddingTop: inputs.personalPensions.length > 0 ? 12 : 0, borderTop: inputs.personalPensions.length > 0 ? '1px solid var(--border-secondary)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1px dashed var(--border-primary)', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setInputs(prev => ({ ...prev, personalPensions: [...prev.personalPensions, createDefaultPersonalPension('pension_savings')] }))}>
              <span style={{ fontSize: 18, color: 'var(--accent-blue)', lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>개인연금 계좌 추가</span>
            </div>
          </div>

          {/* 공통 옵션: 인출/개시/소진 */}
          {inputs.personalPensions.length > 0 && (
          <div className="asset-card" style={{ marginTop: 16, padding: '14px 16px', borderRadius: 8, background: 'var(--bg-secondary)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>인출 설정 <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(전체 합산 기준)</span></p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 24px' }}>
              <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}><Tooltip text="'매년 고르게 나눠 쓰기'를 끄면 매년 이 금액만큼 인출해요. 연금소득이 연 1,500만원 이하이면 3.3~5.5%의 낮은 세율로 분리과세를 선택할 수 있어 절세에 유리해요.">연 인출 금액 ⓘ</Tooltip></span>
                <input type="text" value={formatInputAmount(inputs.pensionWithdrawalAmount)} onChange={(e) => handleInputChange('pensionWithdrawalAmount', e.target.value)} disabled={inputs.usePensionDepletion} style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: inputs.usePensionDepletion ? 'var(--bg-tertiary, #e5e7eb)' : 'var(--bg-secondary)', color: inputs.usePensionDepletion ? 'var(--text-tertiary)' : 'var(--text-primary)', opacity: inputs.usePensionDepletion ? 0.6 : 1 }} />
              </div>
              <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}><Tooltip text="55세부터 수령 가능. 55세 미만 인출 시 기타소득세 16.5%.">개시 나이 ⓘ</Tooltip></span>
                <input type="number" value={inputs.pensionStartAge} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('pensionStartAge', e.target.value)} style={{ width: 70, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>
              <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}><Tooltip text="ON: 매년 고르게 나눠 쓰기. OFF: 필요할 때만 꺼내 쓰기.">연금 인출 방식 ⓘ</Tooltip></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#4b5563' }}>{inputs.usePensionDepletion ? '매년 고르게 나눠 쓰기' : '필요할 때만 꺼내 쓰기'}</span>
                  <button type="button" onClick={() => setInputs(prev => ({ ...prev, usePensionDepletion: !prev.usePensionDepletion }))}
                    style={{ position: 'relative', display: 'inline-flex', height: 18, width: 34, alignItems: 'center', borderRadius: 9999, backgroundColor: inputs.usePensionDepletion ? '#4b5563' : '#d1d5db', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                    <span style={{ position: 'absolute', display: 'inline-block', height: 14, width: 14, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'transform 0.2s ease', transform: inputs.usePensionDepletion ? 'translateX(17px)' : 'translateX(2px)' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
          </div>

          {/* ===== 🏦 추가 자산 ===== */}
          <div className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>추가 자산</h3>
            <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: 'var(--bg-tertiary, #f3f4f6)', cursor: 'pointer', userSelect: 'none' as const }}>
              <span onClick={() => setAssetInputMode('direct')}
                style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, borderRadius: 6, transition: 'all 0.2s', background: assetInputMode === 'direct' ? '#fff' : 'transparent', color: assetInputMode === 'direct' ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: assetInputMode === 'direct' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>은퇴 시점</span>
              <span onClick={() => setAssetInputMode('accumulate')}
                style={{ padding: '3px 8px', fontSize: 10, fontWeight: 500, borderRadius: 6, transition: 'all 0.2s', background: assetInputMode === 'accumulate' ? '#fff' : 'transparent', color: assetInputMode === 'accumulate' ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: assetInputMode === 'accumulate' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>적립식</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>{assetInputMode === 'direct' ? '은퇴 시점에 보유할 예상 자산을 입력하세요.' : '현재 잔액과 연 납입액으로 은퇴 시점 자산을 자동 계산합니다.'}</p>

          {inputs.additionalAssets.map((asset, idx) => {
            const updateAsset = (field: string, value: any) => {
              const updated = [...inputs.additionalAssets];
              updated[idx] = { ...updated[idx], [field]: value };
              setInputs(prev => ({ ...prev, additionalAssets: updated }));
              if (asset.type === 'isa') {
                if (field === 'balance') {
                  const cappedValue = Math.min(value as number, 100000000); // ISA 인당 최대 1억
                  const cappedAssets = updated.map(a => a.type === 'isa' ? { ...a, balance: cappedValue } : a);
                  setInputs(prev => ({ ...prev, additionalAssets: cappedAssets, husbandISA: cappedValue, wifeISA: 0 }));
                }
                if (field === 'returnRate') setInputs(prev => ({ ...prev, additionalAssets: updated, isaReturnRate: value }));
              }
              if (asset.type === 'overseas') {
                if (field === 'balance') setInputs(prev => ({ ...prev, additionalAssets: updated, overseasInvestmentAmount: value }));
                if (field === 'returnRate') setInputs(prev => ({ ...prev, additionalAssets: updated, overseasReturnRate: value }));
              }
              if (asset.type === 'savings') {
                if (field === 'balance') setInputs(prev => ({ ...prev, additionalAssets: updated, savingsAmount: value }));
                if (field === 'returnRate') setInputs(prev => ({ ...prev, additionalAssets: updated, savingsReturnRate: value }));
              }
              if (asset.type === 'life_insurance') {
                if (field === 'startAge') setInputs(prev => ({ ...prev, additionalAssets: updated, lifeInsurancePensionStartAge: value }));
                if (field === 'monthlyAmount') setInputs(prev => ({ ...prev, additionalAssets: updated, lifeInsurancePensionYearly: value }));
              }
              if (asset.type === 'real_estate') {
                if (field === 'balance') setInputs(prev => ({ ...prev, additionalAssets: updated, homeValue: value }));
                if (field === 'startAge') setInputs(prev => ({ ...prev, additionalAssets: updated, homePensionStartAge: value }));
                if (field === 'monthlyAmount') setInputs(prev => ({ ...prev, additionalAssets: updated, homePensionMonthly: value }));
              }
              if (showResults) setInputsDirty(true);
            };
            const removeAsset = () => {
              const resetFields: Partial<InputValues> = {};
              if (asset.type === 'isa') { resetFields.husbandISA = 0; resetFields.wifeISA = 0; resetFields.isaReturnRate = 0.05; }
              if (asset.type === 'overseas') { resetFields.overseasInvestmentAmount = 0; resetFields.overseasReturnRate = 0.07; }
              if (asset.type === 'savings') { resetFields.savingsAmount = 0; resetFields.savingsReturnRate = 0.03; }
              if (asset.type === 'life_insurance') { resetFields.lifeInsurancePensionStartAge = 55; resetFields.lifeInsurancePensionYearly = 0; }
              if (asset.type === 'real_estate') { resetFields.homeValue = 0; resetFields.homePensionStartAge = 55; resetFields.homePensionMonthly = 0; }
              setInputs(prev => ({ ...prev, ...resetFields, additionalAssets: prev.additionalAssets.filter((_, i) => i !== idx) }));
              if (showResults) setInputsDirty(true);
            };
            const isLast = idx === inputs.additionalAssets.length - 1;
            const canAccumulate = ['isa', 'overseas', 'savings'].includes(asset.type);
            const useAccumulate = assetInputMode === 'accumulate' && canAccumulate;
            const yearsToRetire = Math.max(0, inputs.retirementStartAge - inputs.currentAge);
            const calcAccumulatedBalance = () => {
              const cb = asset.currentBalance || 0;
              const yc = asset.yearlyContribution || 0;
              const r = asset.returnRate || 0;
              const n = yearsToRetire;
              if (n <= 0) return cb;
              if (r === 0) return cb + yc * n;
              const compounded = Math.pow(1 + r, n);
              return Math.round(cb * compounded + yc * (compounded - 1) / r);
            };

            return (
              <div key={asset.id} id={`asset-${asset.type}`} className="asset-card" style={{ padding: '14px 16px', marginBottom: 8, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 20px' }}>
                  {/* === 직접입력 모드 (또는 적립식 미지원 자산) === */}
                  {!useAccumulate && (
                  <>
                  <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <button className="btn-delete" onClick={removeAsset} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}><Trash2 size={14} color="var(--text-tertiary, #aaa)" /></button>
                    <select value={asset.type} onChange={(e) => updateAsset('type', e.target.value)}
                      className="blue-select" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none', background: '#4b5563', color: '#fff', cursor: 'pointer' }}>
                      {ASSET_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <span className="mobile-hide-label" style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>{asset.type === 'real_estate' ? '시가' : '잔액'} {canAccumulate && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>(은퇴 시점)</span>}</span>
                    <input type="text" value={formatInputAmount(asset.balance)} onChange={(e) => updateAsset('balance', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                      className={(asset.type === 'isa' && appliedFields['husbandISA']) || (asset.type === 'overseas' && appliedFields['overseasInvestmentAmount']) || (asset.type === 'savings' && appliedFields['savingsAmount']) ? 'strategy-applied' : ''}
                      style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...(asset.type === 'isa' ? appliedInputStyle('husbandISA') : asset.type === 'overseas' ? appliedInputStyle('overseasInvestmentAmount') : asset.type === 'savings' ? appliedInputStyle('savingsAmount') : {}) }} />
                  </div>
                  {!['life_insurance', 'real_estate'].includes(asset.type) && (
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>수익률(%)</span>
                      {strategyBadge(`asset_${asset.type}_returnRate`)}
                      <input type="text" value={(asset.returnRate * 100).toFixed(1)} onChange={(e) => updateAsset('returnRate', (parseFloat(e.target.value) || 0) / 100)}
                        style={{ width: 70, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  )}
                  </>
                  )}
                  {/* === 적립식 모드 === */}
                  {useAccumulate && (
                  <>
                  <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <button className="btn-delete" onClick={removeAsset} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}><Trash2 size={14} color="var(--text-tertiary, #aaa)" /></button>
                    <select value={asset.type} onChange={(e) => updateAsset('type', e.target.value)}
                      className="blue-select" style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none', background: '#4b5563', color: '#fff', cursor: 'pointer' }}>
                      {ASSET_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <span className="mobile-hide-label" style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>현재 잔액</span>
                    <input type="text" value={formatInputAmount(asset.currentBalance || 0)} onChange={(e) => updateAsset('currentBalance', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                      style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>연 납입액</span>
                    <input type="text" value={formatInputAmount(asset.yearlyContribution || 0)} onChange={(e) => updateAsset('yearlyContribution', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                      style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>수익률(%)</span>
                    {strategyBadge(`asset_${asset.type}_returnRate`)}
                    <input type="text" value={(asset.returnRate * 100).toFixed(1)} onChange={(e) => updateAsset('returnRate', (parseFloat(e.target.value) || 0) / 100)}
                      style={{ width: 70, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ width: '100%', padding: '6px 10px', marginTop: 4, borderRadius: 6, background: 'rgba(16, 185, 129, 0.06)', fontSize: 12, color: '#0b9936', lineHeight: 1.4 }}>
                    {yearsToRetire > 0
                      ? <>{inputs.retirementStartAge}세 예상 잔액: <strong>{calcAccumulatedBalance().toLocaleString()}원</strong> <span style={{ color: 'var(--text-tertiary)' }}>({yearsToRetire}년간 적립)</span></>
                      : '현재 나이와 은퇴 나이를 확인해주세요'}
                  </div>
                  </>
                  )}
                  {/* 개시 나이 (생명보험, 부동산) */}
                  {['life_insurance', 'real_estate'].includes(asset.type) && (
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>개시 나이</span>
                      <input type="number" value={asset.startAge || 55} onBlur={handleNumberBlur} onChange={(e) => updateAsset('startAge', parseInt(e.target.value) || 55)}
                        style={{ width: 70, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  )}
                  {/* 해외직투 수익률 6% 미만 경고 */}
                  {asset.type === 'overseas' && asset.returnRate < 0.06 && asset.returnRate > 0 && (
                    <div style={{ width: '100%', padding: '6px 10px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.06)', fontSize: 12, color: '#d97706', lineHeight: 1.4 }}>
                      배당률(6%)보다 낮은 수익률입니다. 잔액 성장이 0%로 계산됩니다. 최소 6% 이상 권장
                    </div>
                  )}
                  {/* 월/연 수령액 (생명보험, 부동산) */}
                  {asset.type === 'life_insurance' && (
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>연 수령액</span>
                      <input type="text" value={formatInputAmount(asset.monthlyAmount || 0)} onChange={(e) => updateAsset('monthlyAmount', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                        style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  )}
                  {asset.type === 'real_estate' && (
                    <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const }}>월 수령액</span>
                      <input type="text" value={formatInputAmount(asset.monthlyAmount || 0)} onChange={(e) => updateAsset('monthlyAmount', parseInt(e.target.value.replace(/,/g, ''), 10) || 0)}
                        style={{ width: 120, textAlign: 'right' as const, padding: '5px 8px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 추가 버튼 */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1px dashed var(--border-primary)', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setInputs(prev => ({ ...prev, additionalAssets: [...prev.additionalAssets, createDefaultAsset('isa')] }))}>
              <span style={{ fontSize: 18, color: 'var(--accent-blue)', lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>자산 추가</span>
            </div>
          </div>
          </div>

          {/* ===== 🔻 부채 & 지출 ===== */}
          <div className="sim-group-box" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>부채 & 비정기 지출</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>은퇴 시점의 부채와 자녀 결혼, 의료비 등 큰 지출 이벤트를 입력합니다.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 24px' }}>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}>부채 총액</span>
            <input type="text" value={formatInputAmount(inputs.totalDebt)} onChange={(e) => handleInputChange('totalDebt', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          {inputs.totalDebt > 0 && (
          <>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}>월 원리금 상환액</span>
            {strategyBadge('monthlyDebtRepayment')}
            <input type="text" value={formatInputAmount(inputs.monthlyDebtRepayment)} onChange={(e) => handleInputChange('monthlyDebtRepayment', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          <div className="sim-input-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' as const, flex: 1, textAlign: 'right' as const }}>상환 완료 나이</span>
            <input type="number" value={inputs.debtEndAge} onBlur={handleNumberBlur} onChange={(e) => handleInputChange('debtEndAge', e.target.value)} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          </>
          )}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', padding: '12px 0 4px', borderTop: '1px solid var(--border-secondary)', marginTop: 8 }}>비정기 지출</div>
          <div>
            {inputs.irregularExpenses.map((expense, idx) => (
              <div key={idx} className="sim-input-row irregular-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <input type="text" placeholder="이벤트명" value={expense.name} onChange={(e) => {
                  const updated = [...inputs.irregularExpenses];
                  updated[idx] = { ...updated[idx], name: e.target.value };
                  setInputs(prev => ({ ...prev, irregularExpenses: updated }));
                }} style={{ width: 120, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <input type="number" placeholder="나이" value={expense.age || ''} onBlur={handleNumberBlur} onChange={(e) => {
                  const updated = [...inputs.irregularExpenses];
                  updated[idx] = { ...updated[idx], age: parseInt(e.target.value) || 0 };
                  setInputs(prev => ({ ...prev, irregularExpenses: updated }));
                }} style={{ width: 70, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>세</span>
                <input type="text" placeholder="금액" value={expense.amount ? formatInputAmount(expense.amount) : ''} onChange={(e) => {
                  const updated = [...inputs.irregularExpenses];
                  updated[idx] = { ...updated[idx], amount: parseInt(e.target.value.replace(/,/g, ''), 10) || 0 };
                  setInputs(prev => ({ ...prev, irregularExpenses: updated }));
                }} style={{ width: 120, textAlign: 'right' as const, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>원</span>
                <button onClick={() => {
                  const updated = inputs.irregularExpenses.filter((_, i) => i !== idx);
                  setInputs(prev => ({ ...prev, irregularExpenses: updated }));
                }} className="btn-delete" style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}><Trash2 size={12} color="var(--text-tertiary, #aaa)" /></button>
              </div>
            ))}
            <button onClick={() => {
              setInputs(prev => ({ ...prev, irregularExpenses: [...prev.irregularExpenses, { name: '', age: inputs.retirementStartAge + 5, amount: 0 }] }));
            }} style={{ marginTop: 4, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: 'var(--accent-blue)', background: 'var(--accent-blue-bg)', border: '1px solid var(--accent-blue)', borderRadius: 6, cursor: 'pointer' }}>
              + 비정기 지출 추가 (자녀 결혼, 의료비 등)
            </button>
          </div>
          </div>

          {/* 안내사항 */}
          <details open style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', listStyle: 'none', borderBottom: '1px solid var(--border-secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span style={{ flex: 1 }}>안내드립니다.</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div style={{ padding: '14px 18px 16px' }}>
              <ul style={{ margin: 0, paddingLeft: 6, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--text-disabled)', flexShrink: 0 }}>·</span><span>수익률 기준 <strong style={{ color: 'var(--text-secondary)' }}>세후</strong>로 계산됩니다.</span></li>
                <li className="mobile-pc-notice-item" style={{ display: 'none', gap: 8 }}><span style={{ color: 'var(--text-disabled)', flexShrink: 0 }}>·</span><span>연도별 시뮬레이션 결과표와 다운로드는 <strong style={{ color: 'var(--text-secondary)' }}>PC 화면</strong>에서 확인하실 수 있습니다.</span></li>
              </ul>
            </div>
          </details>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
          {(!showResults || inputsDirty) && <button
            className="bottom-calc-btn"
            onClick={() => {
              if (isSimulating) return;
              setIsSimulating(true);
              setSimDone(false);
              setTimeout(() => {
                const simData = calculateSimulation();
                setIsSimulating(false);
                setSimDone(true);
                setInputsDirty(false);
                onSimulationComplete?.(simData);
                setTimeout(() => setSimDone(false), 2500);
              }, 600);
            }}
            disabled={isSimulating || !canCalculate}
            style={{
              position: 'relative',
              padding: '14px 36px',
              background: !canCalculate
                ? '#ccc'
                : isSimulating
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : simDone
                    ? 'linear-gradient(135deg, #059669, #10b981)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: 'none',
              cursor: !canCalculate ? 'default' : isSimulating ? 'wait' : 'pointer',
              opacity: !canCalculate ? 0.5 : 1,
              fontSize: 16,
              boxShadow: !canCalculate
                ? 'none'
                : simDone
                  ? '0 4px 20px rgba(5,150,105,0.4)'
                  : '0 4px 20px rgba(99,102,241,0.4)',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              minWidth: 220,
              justifyContent: 'center',
            }}
          >
            {/* 배경 shimmer */}
            {!isSimulating && !simDone && (
              <span style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                animation: 'shimmer 2.5s infinite',
              }} />
            )}
            {isSimulating ? (
              <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : simDone ? (
              <Check size={20} strokeWidth={3} />
            ) : (
              <Sparkles size={20} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isSimulating ? '분석 중...' : simDone ? '분석 완료!' : inputsDirty ? '다시 계산하기' : '계산하기'}
            </span>
          </button>}

          {showResults && results.length > 0 && !isSimulating && (
            <button
              className="download-btn"
              onClick={() => setShowDownloadModal(true)}
              style={{
                position: 'relative',
                padding: '14px 36px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                borderRadius: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                fontSize: 16,
                transition: 'all 0.3s ease',
                minWidth: 220,
                justifyContent: 'center',
              }}
            >
              <Download size={20} />
              다운로드
            </button>
          )}
        </div>
        {!canCalculate && (
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>
            ※ 생활비, 연금, 자산 중 하나 이상 입력하면 계산할 수 있어요.
          </p>
        )}

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .preset-cta::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 2.5s infinite;
          }
        `}</style>
        </div>
      </div>

      {/* 다운로드 모달 - 토스 스타일 */}
      {showDownloadModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setShowDownloadModal(false)}>
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 16, maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>다운로드</span>
              <button onClick={() => setShowDownloadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div style={{ padding: '4px 0' }}>
              {[
                { label: 'Excel', desc: '.xls', icon: FileSpreadsheet, fn: downloadExcel },
                { label: '리포트', desc: '.txt', icon: FileText, fn: downloadReport },
              ].map((item, i) => (
                <button key={i} onClick={() => { item.fn(); setShowDownloadModal(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', border: 'none', background: 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={18} style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 모바일 PC 안내: 하단 안내사항 영역으로 통합 */}

      {/* 결과 테이블 */}
      {showResults && results.length > 0 && (
        <div className="result-table-section">
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' as any, color: 'var(--text-primary)' }}>연도별 시뮬레이션 결과</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isAdminUser && (
              <button onClick={() => setShowFormulaModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' as any, color: 'var(--accent-blue)', borderRadius: 4, border: '1px solid #93c5fd', backgroundColor: 'transparent', cursor: 'pointer' }} title="계산식 보기">
                <Info style={{ width: 16, height: 16 }} />
                계산식
              </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {(() => {
                const hasSavings = inputs.savingsAmount > 0;
                const hasISA = (inputs.husbandISA + inputs.wifeISA) > 0;
                const hasOverseas = inputs.overseasInvestmentAmount > 0;
                const totalRPBalance = inputs.retirementPensions.length > 0 ? inputs.retirementPensions.reduce((s, rp) => s + rp.balance, 0) : 0;
                const totalPPBalance = inputs.personalPensions.length > 0 ? inputs.personalPensions.reduce((s, pp) => s + pp.balance, 0) : 0;
                const hasPension = totalPPBalance > 0 || totalRPBalance > 0;
                const hasNationalPension = inputs.nationalPensionYearly > 0;
                const hasHomePension = inputs.homePensionMonthly > 0;
                const hasLifeInsurance = inputs.lifeInsurancePensionYearly > 0;
                const hasDebt = inputs.totalDebt > 0;
                const hasIrregular = inputs.irregularExpenses.length > 0;

                type Col = { header: string; render: (row: SimulationRow) => React.ReactNode; style?: (row: SimulationRow) => React.CSSProperties };
                const c: React.CSSProperties = { padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid var(--border-secondary)', whiteSpace: 'nowrap', fontSize: 12 };

                const columns: Col[] = [
                  { header: '나이', render: r => r.age, style: () => ({ ...c, fontWeight: 500, color: 'var(--text-primary)' }) },
                  { header: '년도', render: r => r.year, style: () => ({ ...c, color: 'var(--text-tertiary)' }) },
                  { header: '연 생활비', render: r => formatAmount(r.livingCost, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) },
                ];
                if (hasSavings) columns.push({ header: '예적금', render: r => formatAmount(r.savingsWithdrawal, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                if (hasISA) columns.push({ header: 'ISA 인출', render: r => formatAmount(r.isaWithdrawal, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                if (hasOverseas) {
                  columns.push({ header: '해외배당', render: r => formatAmount(r.overseasDividend, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                  columns.push({ header: '해외매도', render: r => formatAmount(r.overseasStockSale, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                }
                if (hasPension) columns.push({ header: '연금', render: r => formatAmount(r.pensionAfterTax, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                if (hasNationalPension) columns.push({ header: '국민연금', render: r => formatAmount(r.nationalPension, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                if (hasHomePension) columns.push({ header: '주택연금', render: r => formatAmount(r.homePension, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                if (hasLifeInsurance) columns.push({ header: '생명보험', render: r => formatAmount(r.lifeInsurancePension, false), style: () => ({ ...c, color: 'var(--text-secondary)' }) });
                columns.push({ header: '총소득', render: r => formatAmount(r.totalIncome, false), style: () => ({ ...c, fontWeight: 600, color: 'var(--text-primary)' }) });
                columns.push({ header: '건보료', render: r => formatAmount(r.healthInsurance, false), style: () => ({ ...c, color: 'var(--text-tertiary)' }) });
                if (hasDebt) columns.push({ header: '부채상환', render: r => formatAmount(r.debtRepayment, false), style: (r) => ({ ...c, color: r.debtRepayment > 0 ? '#dc2626' : 'var(--text-tertiary)' }) });
                if (hasIrregular) columns.push({ header: '비정기', render: r => formatAmount(r.irregularExpense, false), style: (r) => ({ ...c, color: r.irregularExpense > 0 ? '#ea580c' : 'var(--text-tertiary)' }) });
                columns.push({ header: '총지출', render: r => formatAmount(r.totalExpense, false), style: () => ({ ...c, fontWeight: 500, color: 'var(--text-primary)' }) });
                columns.push({ header: '남는 금액', render: r => formatAmount(r.yearlySurplus, false), style: (r) => ({ ...c, fontWeight: 600, color: getAmountColor(r.yearlySurplus) }) });
                if (hasSavings) columns.push({ header: '예적금잔액', render: r => formatAmount(r.savingsBalance, false), style: () => ({ ...c, color: 'var(--text-tertiary)' }) });
                if (hasISA) columns.push({ header: 'ISA잔액', render: r => formatAmount(r.isaBalance, false), style: () => ({ ...c, color: 'var(--text-tertiary)' }) });
                if (hasOverseas) columns.push({ header: '해외잔액', render: r => formatAmount(r.overseasBalance, false), style: () => ({ ...c, color: 'var(--text-tertiary)' }) });
                if (hasPension) columns.push({ header: '연금잔액', render: r => formatAmount(r.pensionBalance, false), style: () => ({ ...c, color: 'var(--text-tertiary)' }) });

                return (
              <table className="toss-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'auto' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    {columns.map(col => (
                      <th key={col.header} style={{ padding: '10px 10px', fontWeight: 600, color: 'var(--text-tertiary)', fontSize: 11, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)', textAlign: 'right' }}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {columns.map(col => (
                        <td key={col.header} style={{ ...(col.style ? col.style(row) : { ...c, color: 'var(--text-secondary)' }), borderRight: '1px solid var(--border-secondary)', padding: '8px 10px' }}>{col.render(row)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
                );
              })()}
            </div>
          </div>

        </div>
        </div>
      )}

      {/* 계산식 설명 모달 */}
      {showFormulaModal && (() => {
        const fc: React.CSSProperties = { background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: '16px 20px' };
        const fh: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 };
        const fdot = (color: string): React.CSSProperties => ({ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 });
        const fcode: React.CSSProperties = { display: 'block', padding: '8px 12px', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-secondary)', color: 'var(--text-primary)', lineHeight: 1.6 };
        const fnote: React.CSSProperties = { fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, marginTop: 8 };
        const formulaSections = [
          { title: '연 생활비', dot: 'var(--text-tertiary)', formula: '월 생활비 x 12 x (1 + 물가상승률/100) ^ 연차', note: '75세 미만/이상 월 생활비가 다르게 적용됩니다. 연차 = 현재나이 - 은퇴시작나이 (0부터 시작).' },
          { title: '국민연금 (세후)', dot: '#4f46e5', formula: '기준연금액 x 조정계수 x (1 + 물가상승률/100) ^ 경과년수 x (1 - 나이별 세율)', note: '조기: 1년당 6% 감액(최대 30%). 연기: 1년당 7.2% 증액(최대 36%). 경과년수 = 현재나이 - 수령시작나이 (첫 해 0 = 물가상승 미적용).' },
          { title: '주택연금', dot: '#ea580c', formula: '월 수령액 x 12', note: '비과세 소득. 설정한 개시 나이부터 매년 동일 금액.' },
          { title: '생명보험연금', dot: '#0891b2', formula: '연 수령액 (고정)', note: '설정한 개시 나이부터 매년 동일 금액을 수령합니다.' },
          { title: '해외직투 배당 (세후)', dot: '#059669', formula: '해외주식 잔액 x 6% x (1 - 15.4%)', note: '배당소득세 15.4% 원천징수 후 수령액.' },
          { title: '연금 (세후)', dot: '#9333ea', formula: '[일반] MIN(필요금액/0.945, 설정인출액, 잔액)\n[소진모드] 잔액 x (r x (1+r)^n) / ((1+r)^n - 1)', note: '퇴직연금 + 개인연금 합산 잔액. 수익률은 각각의 초기 잔액 비율로 가중평균 적용. 세금: 1,500만원 이내 나이별 세율(5.5/4.4/3.3%), 초과분 별도 세율.' },
          { title: 'ISA 인출', dot: 'var(--accent-blue)', formula: '[일반] MIN(생활비+건보료-고정수입-해외배당-연금세후, ISA잔액)\n[소진모드] ISA잔액 x (r x (1+r)^n) / ((1+r)^n - 1)', note: '일반모드: 다른 소득으로 충당 후 부족분만 인출. 소진모드: PMT 균등 인출.' },
          { title: '해외주식 매도', dot: '#059669', formula: '[일반] MIN(잔여 부족분, 해외주식잔액)\n[소진모드] 잔액 x (r x (1+r)^n) / ((1+r)^n - 1), r = 수익률 - 6%', note: '일반모드: 배당+연금+ISA로도 부족 시에만 매도. 소진모드: 배당 6% 별도 수령, 성장분만 PMT 소진. * 양도소득세(22%, 250만 비과세)는 미반영 — 실제보다 유리하게 계산됩니다.' },
          { title: '건강보험료', dot: '#dc2626', formula: '(소득점수 + 재산점수) x 218.8원 x 12개월', note: '소득점수 = 개인연금세후 x 0.002 / 1,000. 재산점수 = MAX(0, 공시가격 - 1억) x 0.0000005. 주택은 시가가 아닌 공시가격(시가의 60~70%) 기준. 국민연금/주택연금/ISA/해외배당은 건보 미반영.' },
          { title: '부채 상환', dot: 'var(--text-tertiary)', formula: 'MIN(월 상환액 x 12, 부채잔액)', note: '설정한 상환 완료 나이까지만 적용.' },
          { title: '총소득', dot: 'var(--accent-blue)', formula: '연금세후 + 국민연금 + 주택연금 + 생명보험 + ISA인출 + 해외배당 + 해외매도 + 예적금인출', note: '모든 소득을 합산한 실제 사용 가능 금액.' },
          { title: '총지출', dot: 'var(--text-tertiary)', formula: '연 생활비 + 건보료 + 부채상환 + 비정기지출', note: null },
          { title: '남는 금액', dot: '#9333ea', formula: '총소득 - 총지출 - 추가차감(국민연금 수령 시작 후 연 500만)', note: '추가차감 500만원은 국민연금 수령 시 발생할 수 있는 추가 세금 및 비정기 의료비 등을 위한 안전 마진입니다. 마이너스 시 예적금 -> ISA -> 해외주식 순으로 추가 인출하여 보전.' },
          { title: '잔액 (연말 수익률 적용)', dot: '#16a34a', formula: 'ISA: (잔액-인출) x (1+ISA수익률)\n해외: (잔액-매도) x (1+수익률-6%)\n연금: (잔액-인출) x (1+연금수익률)\n예적금: (잔액-인출) x (1+예적금수익률)', note: '모든 인출/매도 완료 후 잔액에 수익률 복리 적용. 해외주식은 배당 6%가 별도 수령되므로 성장분만 적용.' },
        ];
        return (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowFormulaModal(false)}
        >
          <div
            style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-primary)', padding: '20px 24px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>계산식 구조</h3>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>각 컬럼의 계산 방법을 확인하세요</p>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: 16, height: 16, color: 'var(--text-tertiary)' }} />
              </button>
            </div>

            {/* 내용 */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {formulaSections.map((s) => (
                <div key={s.title} style={fc}>
                  <h4 style={fh}>
                    <span style={fdot(s.dot)} />
                    {s.title}
                  </h4>
                  <code style={fcode}>{s.formula}</code>
                  {s.note && <p style={fnote}>{s.note}</p>}
                </div>
              ))}

            </div>
          </div>
        </div>
        );
      })()}
      </div>
    </>
  );
}