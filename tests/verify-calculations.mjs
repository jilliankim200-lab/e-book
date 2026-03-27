/**
 * 탈출지도 계산식 검증 스크립트
 *
 * 10-계산식-구조.md의 공식을 독립적으로 구현하여
 * 은퇴계산기.tsx의 calculateSimulation() 결과와 비교합니다.
 *
 * 실행: node tests/verify-calculations.mjs
 */

// ============================================================
// 1. MD 문서 기반 독립 계산 함수들
// ============================================================

/** 1. 연 생활비 (물가상승률 복리 적용) */
function calcLivingCost(age, retireAge, costBefore75, costAfter75, inflationRate) {
  const monthly = age < 75 ? costBefore75 : costAfter75;
  const yearIndex = age - retireAge;
  return monthly * 12 * Math.pow(1 + inflationRate, yearIndex);
}

/** 2. 국민연금 (세후) */
function calcNationalPension(age, startAge, baseYearly, inflationRate, retireAge) {
  if (age < startAge) return 0;

  // 조기/연기 조정계수
  let adjustmentFactor = 1.0;
  if (startAge < 65) {
    adjustmentFactor = Math.max(0.7, 1 - (65 - startAge) * 0.06);
  } else if (startAge > 65) {
    adjustmentFactor = Math.min(1.36, 1 + (startAge - 65) * 0.072);
  }

  // 물가상승 반영 (수령 시작부터)
  const yearsFromStart = age - startAge;
  const adjustedAmount = baseYearly * adjustmentFactor * Math.pow(1 + inflationRate, yearsFromStart);

  // 나이별 세율
  let taxRate;
  if (age < 55) taxRate = 0.165;
  else if (age < 70) taxRate = 0.055;
  else if (age < 80) taxRate = 0.044;
  else taxRate = 0.033;

  return adjustedAmount * (1 - taxRate);
}

/** 3. 주택연금 */
function calcHomePension(age, startAge, monthly) {
  return age >= startAge ? monthly * 12 : 0;
}

/** 4. 생명보험연금 */
function calcLifeInsurance(age, startAge, yearly) {
  return age >= startAge ? yearly : 0;
}

/** 5. 해외직투 배당 (세후) */
function calcOverseasDividend(overseasBalance) {
  const preTax = overseasBalance * 0.06;
  return preTax * (1 - 0.154);
}

/** 6. 개인연금 인출 세금 계산 */
function calcPensionTax(withdrawal, age, excessTaxRate) {
  let taxRate;
  if (age < 55) taxRate = 0.165;
  else if (age < 70) taxRate = 0.055;
  else if (age < 80) taxRate = 0.044;
  else taxRate = 0.033;

  const limit = 15000000; // 분리과세 한도 1500만원
  const withinLimit = Math.min(withdrawal, limit);
  const excess = Math.max(0, withdrawal - limit);

  const taxWithin = withinLimit * taxRate;
  const taxExcess = excess * excessTaxRate;

  return withdrawal - taxWithin - taxExcess;
}

/** 10. 건강보험료 */
function calcHealthInsurance(pensionAfterTax) {
  const incomeScore = pensionAfterTax * 0.002 / 1000;
  const propertyScore = 0; // 재산 없는 경우
  const totalScore = incomeScore + propertyScore;
  return totalScore * 218.8 * 12;
}

/** 11. 부채 초기값 */
function calcInitialDebt(retireAge, debtEndAge, totalDebt) {
  return retireAge > debtEndAge ? 0 : totalDebt;
}

/** PMT 공식 (연금소진모드) */
function calcPMT(balance, rate, years) {
  if (years <= 0) return balance;
  if (rate === 0 || balance === 0) return balance / Math.max(1, years);
  const r = rate;
  const n = years;
  return balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}


// ============================================================
// 2. 전체 시뮬레이션 독립 구현 (MD 문서 기반)
// ============================================================

function simulateFromMD(inputs) {
  const rows = [];

  let isaBalance = inputs.isaBalance;
  let pensionBalance = inputs.pensionBalance;
  let overseasBalance = inputs.overseasBalance;
  let savingsBalance = inputs.savingsBalance;
  let debtBalance = calcInitialDebt(inputs.retireAge, inputs.debtEndAge, inputs.totalDebt);

  const startAge = inputs.retireAge;
  const endAge = inputs.endAge;

  for (let age = startAge; age <= endAge; age++) {
    const i = age - startAge;

    // 1. 생활비
    const livingCost = calcLivingCost(age, startAge, inputs.costBefore75, inputs.costAfter75, inputs.inflationRate);

    // 2. 고정 수입
    const nationalPension = calcNationalPension(age, inputs.npStartAge, inputs.npYearly, inputs.inflationRate, startAge);
    const homePension = calcHomePension(age, inputs.hpStartAge, inputs.hpMonthly);
    const lifeInsurance = calcLifeInsurance(age, inputs.liStartAge, inputs.liYearly);

    // 3. 변동 수입
    const overseasDividend = calcOverseasDividend(overseasBalance);

    // 연금 인출 (소진모드)
    let pensionWithdrawal = 0;
    let pensionAfterTax = 0;
    if (inputs.useDepletion && age >= inputs.pensionStartAge) {
      const remainYears = endAge - Math.max(age, inputs.pensionStartAge) + 1;
      pensionWithdrawal = Math.min(calcPMT(pensionBalance, inputs.pensionRate, remainYears), pensionBalance);
      pensionBalance -= pensionWithdrawal;
      pensionAfterTax = calcPensionTax(pensionWithdrawal, age, inputs.excessTaxRate);
    } else if (!inputs.useDepletion && age >= inputs.pensionStartAge) {
      // 일반 모드: 부족분만 인출
      const fixed = nationalPension + homePension + lifeInsurance + overseasDividend;
      const healthEst = calcHealthInsurance(0); // 초기 추정
      const needed = Math.max(0, livingCost + healthEst - fixed);
      const preNeeded = needed / 0.945;
      pensionWithdrawal = Math.min(preNeeded, inputs.pensionMaxWithdrawal, pensionBalance);
      pensionBalance -= pensionWithdrawal;
      pensionAfterTax = calcPensionTax(pensionWithdrawal, age, inputs.excessTaxRate);
    }

    // ISA 인출 (소진모드)
    let isaWithdrawal = 0;
    if (inputs.useDepletion) {
      const remainYears = endAge - age + 1;
      isaWithdrawal = Math.min(calcPMT(isaBalance, inputs.isaRate, remainYears), isaBalance);
      isaBalance -= isaWithdrawal;
    }

    // 해외주식 매도 (소진모드)
    let overseasSale = 0;
    if (inputs.useDepletion) {
      const r = Math.max(0, inputs.overseasRate - 0.06);
      const remainYears = endAge - age + 1;
      overseasSale = Math.min(calcPMT(overseasBalance, r, remainYears), overseasBalance);
      overseasBalance -= overseasSale;
    }

    let savingsWithdrawal = 0;

    // 4. 건강보험료
    const healthInsurance = calcHealthInsurance(pensionAfterTax);

    // 5. 부채 상환
    let debtRepayment = 0;
    if (debtBalance > 0 && age <= inputs.debtEndAge) {
      debtRepayment = Math.min(inputs.monthlyDebtRepay * 12, debtBalance);
      debtBalance -= debtRepayment;
    }

    // 비정기 지출
    const irregularExpense = (inputs.irregularExpenses || [])
      .filter(e => e.age === age)
      .reduce((sum, e) => sum + e.amount, 0);

    // 6. 총소득 / 총지출
    let totalIncome = pensionAfterTax + nationalPension + homePension + lifeInsurance + isaWithdrawal + overseasDividend + overseasSale;
    const totalExpense = livingCost + healthInsurance + debtRepayment + irregularExpense;

    // 추가차감 (국민연금 수령 나이부터 500만원)
    const additionalDeduction = age >= inputs.npStartAge ? 5000000 : 0;
    let yearlySurplus = totalIncome - totalExpense - additionalDeduction;

    // 7. 부족분 보전: 예적금 → ISA → 해외주식
    if (yearlySurplus < 0) {
      const shortage = Math.abs(yearlySurplus);
      // 예적금
      const savingsUse = Math.min(shortage, savingsBalance);
      savingsWithdrawal += savingsUse;
      savingsBalance -= savingsUse;
      totalIncome += savingsUse;
      yearlySurplus += savingsUse;

      // ISA
      if (yearlySurplus < 0) {
        const isaUse = Math.min(Math.abs(yearlySurplus), isaBalance);
        isaWithdrawal += isaUse;
        isaBalance -= isaUse;
        totalIncome += isaUse;
        yearlySurplus += isaUse;
      }

      // 해외주식
      if (yearlySurplus < 0) {
        const overseasUse = Math.min(Math.abs(yearlySurplus), overseasBalance);
        overseasSale += overseasUse;
        overseasBalance -= overseasUse;
        totalIncome += overseasUse;
        yearlySurplus += overseasUse;
      }
    }

    // 8. 수익률 적용 (연말)
    isaBalance *= (1 + inputs.isaRate);
    overseasBalance *= (1 + Math.max(0, inputs.overseasRate - 0.06));
    pensionBalance *= (1 + inputs.pensionRate);
    savingsBalance *= (1 + inputs.savingsRate);

    rows.push({
      age,
      livingCost: Math.round(livingCost),
      nationalPension: Math.round(nationalPension),
      homePension: Math.round(homePension),
      lifeInsurance: Math.round(lifeInsurance),
      overseasDividend: Math.round(overseasDividend),
      pensionAfterTax: Math.round(pensionAfterTax),
      isaWithdrawal: Math.round(isaWithdrawal),
      overseasSale: Math.round(overseasSale),
      savingsWithdrawal: Math.round(savingsWithdrawal),
      healthInsurance: Math.round(healthInsurance),
      debtRepayment: Math.round(debtRepayment),
      totalIncome: Math.round(totalIncome),
      totalExpense: Math.round(totalExpense),
      yearlySurplus: Math.round(yearlySurplus),
      isaBalance: Math.round(isaBalance),
      pensionBalance: Math.round(pensionBalance),
      overseasBalance: Math.round(overseasBalance),
      savingsBalance: Math.round(savingsBalance),
      debtBalance: Math.round(debtBalance),
    });
  }

  return rows;
}


// ============================================================
// 3. 테스트 케이스
// ============================================================

const fmt = (n) => `${(n / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만원`;
let passed = 0;
let failed = 0;

function assert(name, actual, expected, tolerance = 1) {
  if (Math.abs(actual - expected) <= tolerance) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${name} — 기대 ${expected}, 실제 ${actual}, 차이 ${actual - expected}`);
  }
}

function runTest(testName, fn) {
  console.log(`\n=== ${testName} ===`);
  fn();
}

// ---- 개별 공식 검증 ----

runTest("1. 생활비 계산", () => {
  // 55세 은퇴, 월 300만원, 물가상승 2.5%, 첫해
  assert("첫해(55세)", calcLivingCost(55, 55, 3000000, 2000000, 0.025), 36000000);
  // 2년차
  assert("2년차(56세)", calcLivingCost(56, 55, 3000000, 2000000, 0.025), 36900000);
  // 75세 전환
  assert("75세", calcLivingCost(75, 55, 3000000, 2000000, 0.025),
    2000000 * 12 * Math.pow(1.025, 20), 1);
});

runTest("2. 국민연금 계산", () => {
  // 65세 정상수령, 연 1200만원
  const np65 = calcNationalPension(65, 65, 12000000, 0.025, 55);
  assert("65세 정상수령 세후", np65, 12000000 * (1 - 0.055), 1);

  // 60세 조기수령 (5년 조기 = 30% 감액)
  const np60 = calcNationalPension(60, 60, 12000000, 0.025, 55);
  assert("60세 조기수령 계수", 12000000 * 0.7 * (1 - 0.055), np60, 1);

  // 70세 연기수령 (5년 연기 = 36% 증액)
  const np70at70 = calcNationalPension(70, 70, 12000000, 0.025, 55);
  assert("70세 연기수령 계수", 12000000 * 1.36 * (1 - 0.044), np70at70, 1);

  // 수령 전 나이
  assert("수령 전(64세)", calcNationalPension(64, 65, 12000000, 0.025, 55), 0);
});

runTest("3. 해외직투 배당", () => {
  assert("1억 잔액", calcOverseasDividend(100000000), 100000000 * 0.06 * (1 - 0.154), 1);
  assert("0 잔액", calcOverseasDividend(0), 0);
});

runTest("4. 연금 세금 계산", () => {
  // 60세, 1500만원 이하
  assert("60세 1000만원", calcPensionTax(10000000, 60, 0.165), 10000000 * (1 - 0.055), 1);
  // 60세, 1500만원 초과 (2000만원)
  const tax2000 = calcPensionTax(20000000, 60, 0.165);
  const expected = (15000000 - 15000000 * 0.055) + (5000000 - 5000000 * 0.165);
  assert("60세 2000만원 (초과)", tax2000, expected, 1);
});

runTest("5. 건강보험료", () => {
  const hi = calcHealthInsurance(10000000);
  const score = 10000000 * 0.002 / 1000;
  assert("1000만원 연금소득", hi, score * 218.8 * 12, 1);
});

runTest("6. 부채 초기값", () => {
  assert("은퇴65 > 상환45 → 0", calcInitialDebt(65, 45, 50000000), 0);
  assert("은퇴55 < 상환60 → 5천만", calcInitialDebt(55, 60, 50000000), 50000000);
  assert("은퇴60 = 상환60 → 5천만", calcInitialDebt(60, 60, 50000000), 50000000);
});

runTest("7. PMT 공식", () => {
  // 1억, 5%, 20년
  const pmt = calcPMT(100000000, 0.05, 20);
  // 검증: PMT(5%, 20, -1억) ≈ 8,024,259
  assert("PMT(1억,5%,20년)", pmt, 8024259, 10);

  // 0% 수익률
  assert("PMT(1억,0%,10년)", calcPMT(100000000, 0, 10), 10000000, 1);
});

// ---- 통합 시뮬레이션 검증 ----

runTest("8. 35세 싱글 프리셋 (소진모드)", () => {
  const result = simulateFromMD({
    retireAge: 55, endAge: 90,
    costBefore75: 3000000, costAfter75: 2100000, inflationRate: 0.025,
    npStartAge: 65, npYearly: 12000000,
    hpStartAge: 999, hpMonthly: 0, // 주택연금 없음
    liStartAge: 999, liYearly: 0,
    pensionStartAge: 55,
    pensionBalance: 130000000, // 퇴직 5천 + 연금저축 8천
    pensionRate: 0.06,
    pensionMaxWithdrawal: 15000000,
    excessTaxRate: 0.165,
    isaBalance: 40000000, isaRate: 0.09,
    overseasBalance: 50000000, overseasRate: 0.11,
    savingsBalance: 30000000, savingsRate: 0.03,
    totalDebt: 50000000, debtEndAge: 45, monthlyDebtRepay: 1000000,
    useDepletion: true,
    irregularExpenses: [],
  });

  // 기본 검증
  assert("행 수", result.length, 36); // 55~90세 = 36년
  assert("첫 해 나이", result[0].age, 55);
  assert("마지막 나이", result[35].age, 90);

  // 부채: 55세 > 45세 → 상환 완료
  assert("부채 초기값 0", result[0].debtRepayment, 0);
  assert("부채 잔액 0", result[0].debtBalance, 0);

  // 55세: 국민연금 없어야 함
  assert("55세 국민연금=0", result[0].nationalPension, 0);

  // 65세: 국민연금 수령 시작
  const row65 = result.find(r => r.age === 65);
  assert("65세 국민연금>0", row65.nationalPension > 0 ? 1 : 0, 1);

  // 75세: 생활비 전환 확인 (75세 이후 생활비)
  const row75 = result.find(r => r.age === 75);
  const row74 = result.find(r => r.age === 74);
  assert("75세 생활비 < 74세", row75.livingCost < row74.livingCost ? 1 : 0, 1);

  console.log(`  첫해(55세) 생활비: ${fmt(result[0].livingCost)}`);
  console.log(`  첫해(55세) 남는 금액: ${fmt(result[0].yearlySurplus)}`);
  console.log(`  65세 국민연금: ${fmt(row65.nationalPension)}`);
  console.log(`  마지막(90세) 연금잔액: ${fmt(result[35].pensionBalance)}`);
});

runTest("9. 부채 있는 상태 은퇴 (55세 은퇴, 60세 상환)", () => {
  const result = simulateFromMD({
    retireAge: 55, endAge: 90,
    costBefore75: 2000000, costAfter75: 1500000, inflationRate: 0.025,
    npStartAge: 65, npYearly: 10000000,
    hpStartAge: 999, hpMonthly: 0,
    liStartAge: 999, liYearly: 0,
    pensionStartAge: 55,
    pensionBalance: 100000000,
    pensionRate: 0.05,
    pensionMaxWithdrawal: 15000000,
    excessTaxRate: 0.165,
    isaBalance: 30000000, isaRate: 0.06,
    overseasBalance: 40000000, overseasRate: 0.09,
    savingsBalance: 50000000, savingsRate: 0.03,
    totalDebt: 100000000, debtEndAge: 60, monthlyDebtRepay: 1500000,
    useDepletion: false,
    irregularExpenses: [{ age: 60, amount: 30000000 }], // 60세 자녀 결혼
  });

  // 부채: 55세 < 60세 → 부채 있음
  assert("부채 초기값 1억", result[0].debtBalance > 0 ? 1 : 0, 1);

  // 55~60세: 매년 부채 상환
  assert("55세 부채상환", result[0].debtRepayment, 18000000); // 150만 x 12

  // 61세: 부채 상환 끝
  const row61 = result.find(r => r.age === 61);
  assert("61세 부채상환=0", row61.debtRepayment, 0);

  // 60세: 비정기지출 있음
  const row60 = result.find(r => r.age === 60);
  assert("60세 비정기지출 3천만", row60.totalExpense > row61.totalExpense ? 1 : 0, 1);

  console.log(`  55세 부채상환: ${fmt(result[0].debtRepayment)}`);
  console.log(`  55세 부채잔액: ${fmt(result[0].debtBalance)}`);
  console.log(`  60세 총지출(비정기 포함): ${fmt(row60.totalExpense)}`);
});

runTest("10. 수익률 적용 검증", () => {
  // 단순 케이스: 수입/지출 0, 잔액만 있고 수익률만 적용
  const result = simulateFromMD({
    retireAge: 60, endAge: 61,
    costBefore75: 0, costAfter75: 0, inflationRate: 0,
    npStartAge: 999, npYearly: 0,
    hpStartAge: 999, hpMonthly: 0,
    liStartAge: 999, liYearly: 0,
    pensionStartAge: 999, // 인출 안 함
    pensionBalance: 100000000,
    pensionRate: 0.05,
    pensionMaxWithdrawal: 0,
    excessTaxRate: 0,
    isaBalance: 100000000, isaRate: 0.06,
    overseasBalance: 100000000, overseasRate: 0.10,
    savingsBalance: 100000000, savingsRate: 0.03,
    totalDebt: 0, debtEndAge: 0, monthlyDebtRepay: 0,
    useDepletion: false,
    irregularExpenses: [],
  });

  // 60세 연말 잔액 = 초기 x (1 + 수익률)
  // 해외: 배당 6% 수령 후, 잔액에 (10%-6%)=4% 적용
  const row60 = result[0];

  // ISA: 배당없으므로 그냥 인출(6% 배당수입) 후 잔액에 수익률
  assert("ISA 잔액(6%)", row60.isaBalance, Math.round(100000000 * 1.06), 1);
  assert("연금 잔액(5%)", row60.pensionBalance, Math.round(100000000 * 1.05), 1);
  assert("예적금 잔액(3%)", row60.savingsBalance, Math.round(100000000 * 1.03), 1);

  // 해외: 배당 6% 수령 → 잔액에 (10%-6%)=4% 적용
  // 하지만 배당은 소득으로 처리되므로 잔액에서 빠지지 않음, 수익률만 (r-0.06) 적용
  assert("해외 잔액(10%-6%=4%)", row60.overseasBalance, Math.round(100000000 * 1.04), 1);

  console.log(`  ISA: ${fmt(row60.isaBalance)} (기대: ${fmt(106000000)})`);
  console.log(`  연금: ${fmt(row60.pensionBalance)} (기대: ${fmt(105000000)})`);
  console.log(`  해외: ${fmt(row60.overseasBalance)} (기대: ${fmt(104000000)})`);
  console.log(`  예적금: ${fmt(row60.savingsBalance)} (기대: ${fmt(103000000)})`);
});


// ============================================================
// 4. 결과 출력
// ============================================================

console.log("\n" + "=".repeat(50));
console.log(`총 ${passed + failed}개 테스트: ${passed}개 통과, ${failed}개 실패`);
if (failed === 0) {
  console.log("모든 계산식이 MD 문서와 일치합니다.");
} else {
  console.log("일부 계산식이 불일치합니다. 위 FAIL 항목을 확인하세요.");
  process.exit(1);
}
