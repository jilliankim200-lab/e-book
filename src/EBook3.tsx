import React, { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

interface Section {
  id: string;
  title: string;
  subsections: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

const card: React.CSSProperties = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border-primary)",
  borderRadius: 12,
  padding: "20px 24px",
  boxShadow: "var(--shadow-sm)",
};

const MdTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <>
    <div className="md-table-pc" style={{ overflowX: "auto", margin: "12px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr>{headers.map((h, i) => (<th key={i} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
        <tbody>{rows.map((row, ri) => (<tr key={ri}>{row.map((cell, ci) => (<td key={ci} style={{ padding: "10px 12px", fontSize: 13, textAlign: "center", borderBottom: "1px solid var(--border-secondary)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{cell}</td>))}</tr>))}</tbody>
      </table>
    </div>
    <div className="md-table-mobile" style={{ display: "none", flexDirection: "column", gap: 8, margin: "12px 0" }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)" }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "4px 0", gap: 12, borderBottom: ci < row.length - 1 ? "1px solid var(--border-secondary)" : "none" }}>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, flexShrink: 0, minWidth: 60 }}>{headers[ci]}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, textAlign: "right" as const, wordBreak: "keep-all" as const }}>{cell}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </>
);

const InfoBox = ({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "amber" | "green" | "red" }) => {
  return (
    <div className="info-box" style={{ margin: "12px 0", padding: "14px 16px", borderRadius: 10, background: "hsl(169.44deg 100% 50% / 10%)", fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7 }}>
      {children}
    </div>
  );
};

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "20px 0 8px", paddingBottom: 6, borderBottom: "1px solid var(--border-secondary)" }}>{children}</h4>
);

const BulletList = ({ items }: { items: string[] }) => (
  <div style={{ margin: "8px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 2 }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ color: "var(--accent-blue)", fontSize: 8, flexShrink: 0, lineHeight: 2 }}>●</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const CheckList = ({ items }: { items: string[] }) => {
  const [checked, setChecked] = React.useState<boolean[]>(new Array(items.length).fill(false));
  return (
    <div style={{ margin: "8px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 2 }}>
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; })}
          style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}
        >
          <span style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            border: checked[i] ? "1.5px solid var(--accent-blue)" : "1.5px solid var(--border-primary)",
            background: checked[i] ? "var(--accent-blue)" : "transparent",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#fff", lineHeight: 1,
            marginTop: 5,
          }}>
            {checked[i] && "\u2713"}
          </span>
          <span style={{ textDecoration: checked[i] ? "line-through" : "none", opacity: checked[i] ? 0.5 : 1 }}>{item}</span>
        </div>
      ))}
    </div>
  );
};

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, margin: "8px 0" }}>{children}</p>
);

const chapters: Section[] = [
  {
    id: "ch1",
    title: "1장. 김영희 씨(52세)의 은퇴 설계",
    subsections: [
      {
        id: "1-1",
        title: "1.1 평범한 직장인 김영희 씨의 프로필",
        content: (
          <>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
              <img src="/images/kim1.png" alt="김영희 씨" style={{ width: 120, height: "auto", borderRadius: 12, flexShrink: 0 }} />
              <Paragraph>
                김영희 씨는 중견 제조업체에서 28년간 근무한 52세 사무직 직원입니다. 정년은 60세이며, 남편(54세)은 중소기업에 다니고 있습니다. 대학생 자녀 1명이 있으나 내년 졸업 예정입니다.
              </Paragraph>
            </div>
            <Heading>김영희 씨 가족의 재무 현황</Heading>
            <MdTable
              headers={["항목", "금액", "비고"]}
              rows={[
                ["ISA 계좌", "1억원", "국내 배당 ETF 중심, 만기 2년 남음"],
                ["연금저축 + IRP", "2억원", "TDF(타겟데이트펀드) 2030 위주"],
                ["해외주식", "3억원", "미국 나스닥100 ETF, 개별주식 일부"],
                ["예적금", "2억원", "시중은행 정기예금 1.5억 + CMA 0.5억"],
                ["총 금융자산", "8억원", "부동산 제외 순수 금융자산"],
              ]}
            />
            <MdTable
              headers={["항목", "상세"]}
              rows={[
                ["월 생활비", "400만원 (자녀 독립 후에도 유사 수준 예상)"],
                ["김영희 씨 국민연금", "월 120만원 (65세 수령 예정, NPS 조회 기준)"],
                ["남편 국민연금", "월 80만원 (65세 수령 예정)"],
                ["퇴직금 예상", "약 1.5억원 (DB형, 60세 퇴직 시)"],
              ]}
            />
            <Heading>김영희 씨가 탈출지도를 찾은 이유</Heading>
            <BulletList items={[
              "8억이 있지만 30년 넘게 써야 하니 과연 충분한지 확신이 없다",
              "해외주식 비중이 높아 환율과 시장 변동이 신경 쓰인다",
              "60세 퇴직 후 65세 연금 수령까지 5년 공백이 걱정된다",
              "남편이 먼저 은퇴할 수 있어서 맞벌이 소득이 줄어드는 시나리오도 고려해야 한다",
            ]} />
            <InfoBox color="blue">
              김영희 씨의 상황은 50대 직장인 중 자산 관리에 비교적 성실한 편에 속합니다. 하지만 총자산 8억원으로 부부가 35년 이상 생활해야 한다는 점에서, 구체적인 숫자 검증이 반드시 필요합니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-2",
        title: "1.2 첫 번째 계산: 현실 직시",
        content: (
          <>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
              <img src="/images/kim2.png" alt="충격받은 김영희 씨" style={{ width: 120, height: "auto", borderRadius: 12, flexShrink: 0 }} />
              <Paragraph>
                김영희 씨는 현재 상태를 그대로 탈출지도에 입력했습니다. "이 정도면 괜찮지 않을까"라는 기대와 함께 '계산하기' 버튼을 눌렀습니다.
              </Paragraph>
            </div>
            <Heading>입력값 상세</Heading>
            <MdTable
              headers={["항목", "입력값"]}
              rows={[
                ["현재 나이", "52세"],
                ["은퇴 나이", "60세"],
                ["목표 수명", "95세"],
                ["월 생활비", "400만원"],
                ["물가상승률", "2.5%"],
                ["ISA 잔액 / 기대수익률", "1억원 / 연 4%"],
                ["연금저축+IRP 잔액 / 기대수익률", "2억원 / 연 5%"],
                ["해외주식 잔액 / 기대수익률", "3억원 / 연 7%"],
                ["예적금 잔액 / 기대수익률", "2억원 / 연 3%"],
                ["국민연금 (본인)", "65세부터 월 120만원"],
                ["국민연금 (배우자)", "65세부터 월 80만원"],
              ]}
            />
            <Heading>결과: 68세에 적자 전환, 79세에 자산 고갈</Heading>
            <Paragraph>
              결과 요약 패널이 빨간색으로 표시되었습니다. 연도별 테이블을 살펴보니, 60세 퇴직 후 급격한 자산 감소가 시작되었습니다.
            </Paragraph>
            <MdTable
              headers={["나이", "잔여 자산", "연간 수입", "연간 지출", "남는 금액"]}
              rows={[
                ["60세", "9.5억", "0", "5,340만원", "-5,340만원"],
                ["63세", "7.8억", "0", "5,750만원", "-5,750만원"],
                ["65세", "6.6억", "2,400만원", "6,010만원", "-3,610만원"],
                ["68세", "4.7억", "2,400만원", "6,480만원", "-4,080만원"],
                ["73세", "2.1억", "2,400만원", "7,340만원", "-4,940만원"],
                ["79세", "0", "2,400만원", "8,420만원", "-6,020만원"],
              ]}
            />
            <Heading>원인 분석: 왜 79세에 바닥나는가?</Heading>
            <BulletList items={[
              "60~65세 연금 공백기 5년간 약 2.8억원이 순인출됨 (수익으로 일부 상쇄되지만 부족)",
              "65세부터 국민연금 합산 월 200만원이 들어오지만, 물가 반영된 생활비 월 500만원대에 크게 모자람",
              "예적금 2억원의 실질수익률(3% - 물가 2.5%)은 거의 0%에 가까워 자산 보전 역할을 못 함",
              "해외주식 기대수익률 7%는 세전 기준이며, 양도세(22%)와 환전 비용을 고려하면 실질 5% 수준",
              "400만원의 생활비가 물가상승률 2.5% 적용 시 20년 후(80세)에는 약 656만원으로 불어남",
            ]} />
            <InfoBox color="red">
              <strong>김영희 씨의 반응:</strong> "8억이 있는데 80세 전에 바닥난다니 믿기 어렵다." 하지만 숫자는 거짓말하지 않습니다. 35년(60~95세)이라는 긴 인출 기간, 물가상승률의 복리 효과, 그리고 연금 공백기가 겹치면 8억으로도 부족할 수 있습니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-3",
        title: "1.3 전략 조합으로 해결하기",
        content: (
          <>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
              <img src="/images/kim3.png" alt="해결책을 찾은 김영희 씨" style={{ width: 120, height: "auto", borderRadius: 12, flexShrink: 0 }} />
              <Paragraph>
                김영희 씨는 세 가지 변수를 동시에 조정하는 전략 조합을 시도했습니다. 각 변수를 단독으로 바꿔본 후, 가장 효과적인 조합을 찾았습니다.
              </Paragraph>
            </div>
            <Heading>변경한 세 가지 변수</Heading>
            <MdTable
              headers={["변수", "변경 전", "변경 후", "변경 근거"]}
              rows={[
                ["월 생활비", "400만원", "350만원", "외식 횟수 절반으로 줄이고, 구독서비스 정리"],
                ["국민연금 수령 시기", "65세", "68세", "3년 연기 시 월 120만원 → 약 146만원(21.6% 증액)"],
                ["해외주식 기대수익률", "7%", "6%", "세후 실질수익률 기준으로 보수적 재설정"],
              ]}
            />
            <Heading>변경 후 계산 결과</Heading>
            <MdTable
              headers={["나이", "잔여 자산", "연간 수입", "연간 지출", "남는 금액"]}
              rows={[
                ["60세", "9.5억", "0", "4,670만원", "-4,670만원"],
                ["65세", "7.2억", "960만원", "5,260만원", "-4,300만원"],
                ["68세", "5.6억", "2,712만원", "5,670만원", "-2,958만원"],
                ["75세", "3.8억", "2,712만원", "6,660만원", "-3,948만원"],
                ["85세", "1.2억", "2,712만원", "8,520만원", "-5,808만원"],
                ["90세", "0.3억", "2,712만원", "9,650만원", "-6,938만원"],
              ]}
            />
            <Paragraph>
              결과 요약 패널이 초록색으로 전환되었습니다. 90세에도 약 3,000만원의 자산이 남아 있고, 국민연금이 종신으로 지급되므로 기본 생활은 유지됩니다.
            </Paragraph>
            <Heading>각 변수의 개별 기여도 비교</Heading>
            <Paragraph>
              세 변수를 하나씩만 바꿨을 때의 결과를 비교하면, 어떤 전략이 가장 효과적인지 명확히 드러납니다.
            </Paragraph>
            <MdTable
              headers={["변경 항목", "단독 적용 시 자산 고갈 시점", "기준 대비 연장"]}
              rows={[
                ["생활비 350만원만 적용", "83세", "+4년"],
                ["국민연금 68세 연기만 적용", "84세", "+5년"],
                ["수익률 6%로 보수적 조정만 적용", "77세", "-2년 (악화)"],
                ["세 가지 동시 적용", "90세 이후 유지", "+11년 이상"],
              ]}
            />
            <BulletList items={[
              "국민연금 연기 수령이 단독으로 가장 큰 영향(+5년)을 미침: 종신연금이라 장기일수록 효과가 커짐",
              "생활비 50만원 절감은 +4년 효과: 매년 600만원 절약이 35년간 복리로 누적",
              "수익률을 보수적으로 낮추면 단독으로는 결과가 악화되지만, 현실적인 추정치를 사용하는 것이 안전",
              "단일 변수로는 해결이 안 되지만, 세 가지를 조합하면 시너지 효과로 문제가 해결됨",
            ]} />
            <InfoBox color="green">
              <strong>김영희 씨의 결론:</strong> "국민연금 3년 연기가 이렇게 큰 효과를 낼 줄 몰랐다." 월 26만원 증가가 작아 보이지만, 68세부터 95세까지 27년간 매달 추가로 들어오는 종신 수입입니다. 여기에 생활비 절감까지 더하면 90세까지 자산을 안정적으로 유지할 수 있게 되었습니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch2",
    title: "2장. 박준호 부부(48세)의 조기탈출 도전",
    subsections: [
      {
        id: "2-1",
        title: "2.1 맞벌이 FIRE족 박준호 부부 프로필",
        content: (
          <>
            <Paragraph>
              박준호 씨(48세)는 IT기업 시니어 개발자로 연봉 1.1억원, 아내 최수진 씨(47세)는 공공기관 행정직으로 연봉 6,500만원입니다. 자녀 없이 부부만 생활하며, 일찍부터 FIRE(Financial Independence, Retire Early)을 목표로 자산을 적극 축적해 왔습니다.
            </Paragraph>
            <Heading>박준호 부부의 재무 현황</Heading>
            <MdTable
              headers={["항목", "박준호", "최수진(배우자)", "합계"]}
              rows={[
                ["국민연금 예상", "월 130만원 (65세)", "월 70만원 (65세)", "월 200만원"],
                ["퇴직연금(DC형)", "2.5억원", "1.5억원", "4억원"],
                ["개인연금(연금저축)", "1.2억원", "0.8억원", "2억원"],
                ["해외주식", "3.5억원", "1.5억원", "5억원"],
                ["ISA", "1억원", "0.8억원", "1.8억원"],
                ["예적금/CMA", "1.2억원", "1억원", "2.2억원"],
              ]}
            />
            <Paragraph>
              총 금융자산은 약 15억원이며, 서울 외곽 아파트(시가 8억)에 거주 중입니다. 대출은 없고, 월 생활비는 600만원입니다.
            </Paragraph>
            <Heading>50세 은퇴를 꿈꾸는 이유</Heading>
            <BulletList items={[
              "20년 넘는 맞벌이 생활로 체력과 정신적 소진이 심각함",
              "자녀가 없어 교육비 부담이 없고, 부부 합산 자산이 충분하다고 판단",
              "은퇴 후 지방 이주, 텃밭 가꾸기, 여행 등 구체적인 계획이 있음",
              "50세에 은퇴하면 건강한 상태에서 자유 시간을 즐길 수 있다는 기대",
            ]} />
            <InfoBox color="amber">
              15억원은 상당한 금융자산입니다. 그러나 50세에 은퇴하면 국민연금 수령(65세)까지 15년의 공백이 발생합니다. 이 공백기에 매년 7,200만원 이상이 빠져나간다는 점을 반드시 검증해야 합니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "2-2",
        title: "2.2 50세 은퇴 계산: 조기탈출의 함정",
        content: (
          <>
            <Paragraph>
              박준호 부부는 부부 모드를 활성화하고, 둘 다 50세에 은퇴하는 시나리오를 탈출지도에 입력했습니다.
            </Paragraph>
            <Heading>입력값 상세</Heading>
            <MdTable
              headers={["항목", "입력값"]}
              rows={[
                ["은퇴 나이 (본인/배우자)", "50세 / 50세"],
                ["목표 수명", "95세"],
                ["월 생활비", "600만원"],
                ["물가상승률", "2.5%"],
                ["총 금융자산", "15억원 (계좌별 분리 입력)"],
                ["가중평균 기대수익률", "약 5.5%"],
                ["국민연금 (박준호)", "65세부터 월 130만원"],
                ["국민연금 (최수진)", "65세부터 월 70만원"],
              ]}
            />
            <Heading>결과: 62세에 적자 가속, 71세에 자산 고갈</Heading>
            <Paragraph>
              결과 요약 패널이 빨간색으로 표시되었습니다. 15억원의 자산이 21년 만에 바닥나는 결과가 나왔습니다.
            </Paragraph>
            <MdTable
              headers={["나이", "잔여 자산", "연간 지출", "비고"]}
              rows={[
                ["50세", "15억원", "7,200만원", "은퇴 시작, 수입 0"],
                ["55세", "11.4억원", "8,150만원", "물가상승으로 지출 증가"],
                ["60세", "7.3억원", "9,240만원", "연금 공백 10년째"],
                ["62세", "5.5억원", "9,710만원", "자산 감소 가속 구간"],
                ["65세", "2.8억원", "1.04억원", "연금 수령 시작, 그러나 이미 부족"],
                ["71세", "0", "1.18억원", "자산 완전 고갈"],
              ]}
            />
            <Heading>조기탈출의 세 가지 함정</Heading>
            <BulletList items={[
              "함정 1 — 인출 기간 45년: 50세부터 95세까지 자산을 꺼내 쓰는 기간이 거의 반세기. 일반 은퇴(60세)보다 10년 더 길다",
              "함정 2 — 연금 공백 15년: 50~65세 사이에 연금 수입이 전혀 없음. 이 기간에만 약 6억원이 순인출됨",
              "함정 3 — 물가의 복리 효과: 생활비 600만원이 물가 2.5% 적용 시 15년 후(65세)에는 약 882만원으로 증가. 연금이 시작되어도 격차가 줄어들지 않음",
            ]} />
            <Paragraph>
              50~65세의 15년 공백기가 결정적이었습니다. 이 기간에 자산이 15억에서 2.8억으로 급감하면서, 65세부터 시작되는 연금만으로는 회복이 불가능한 상태가 됩니다.
            </Paragraph>
            <InfoBox color="red">
              <strong>핵심 교훈:</strong> 조기탈출을 검토할 때는 "총자산이 얼마인가"보다 "연금 수령 전까지 몇 년을 버텨야 하는가"가 더 중요한 질문입니다. 15년간 무수입 상태로 매년 7,000만원 이상을 인출하면, 15억도 빠르게 소진됩니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "2-3",
        title: "2.3 53세로 조정한 극적 결과",
        content: (
          <>
            <Paragraph>
              50세 은퇴 계산 결과에 충격을 받은 박준호 부부는 은퇴 시기를 53세로 3년 늦추기로 했습니다. "겨우 3년 차이인데 얼마나 달라지겠어?"라는 반신반의로 다시 탈출지도를 실행했습니다.
            </Paragraph>
            <Heading>3년 추가 근무가 만드는 다섯 가지 효과</Heading>
            <MdTable
              headers={["효과", "구체적 수치", "설명"]}
              rows={[
                ["추가 근로소득", "+약 5.3억원", "부부 합산 세후 연 1.77억 x 3년"],
                ["자산 운용 기간 연장", "+3년 복리", "15억의 5.5% 복리가 3년 더 적용"],
                ["인출 기간 단축", "45년 → 42년", "자산 인출 기간이 3년 줄어듦"],
                ["연금 공백 단축", "15년 → 12년", "무연금 기간이 20% 감소"],
                ["국민연금 가입기간 증가", "+36개월", "예상 수령액이 월 10~15만원 추가 상승"],
              ]}
            />
            <Heading>건보료 피부양자 전략</Heading>
            <Paragraph>
              부부 모드에서 건보료 시나리오도 함께 검토했습니다. 박준호 씨가 53세에 먼저 퇴직하고, 최수진 씨가 직장을 유지하는 경우, 박준호 씨는 배우자의 건보 피부양자로 등록하여 별도 건보료가 발생하지 않습니다.
            </Paragraph>
            <BulletList items={[
              "피부양자 자격 조건: 연 소득 2,000만원 이하, 재산세 과세표준 5.4억 이하",
              "금융소득이 연 2,000만원을 넘지 않도록 이자/배당 수입을 조절해야 함",
              "해외주식 매도 시 양도차익이 250만원을 넘으면 소득으로 잡히므로 주의",
              "피부양자 유지 시 연간 약 200~350만원의 건보료를 절약할 수 있음",
            ]} />
            <Heading>53세 은퇴 계산 결과</Heading>
            <MdTable
              headers={["나이", "잔여 자산", "비고"]}
              rows={[
                ["53세", "20.8억원", "3년간 추가 저축 + 기존 자산 복리 성장"],
                ["60세", "15.3억원", "연금 공백기지만 자산 여유 충분"],
                ["65세", "11.5억원", "연금 수령 시작, 인출 속도 감소"],
                ["75세", "6.7억원", "안정적 감소 추이"],
                ["85세", "2.4억원", "여유 유지"],
                ["95세", "0.5억원", "목표 수명까지 자산 유지 성공"],
              ]}
            />
            <Paragraph>
              결과 요약 패널이 초록색으로 전환되었습니다. 3년의 추가 근무만으로 자산 고갈 시점이 71세에서 95세 이후로 24년 이상 늦춰졌습니다.
            </Paragraph>
            <Heading>50세 vs 53세 은퇴 비교 요약</Heading>
            <MdTable
              headers={["비교 항목", "50세 은퇴", "53세 은퇴"]}
              rows={[
                ["53세 시점 자산", "12.6억원", "20.8억원"],
                ["자산 고갈 시점", "71세", "95세 이후"],
                ["65세 시점 잔여 자산", "2.8억원", "11.5억원"],
                ["결과 요약 판정", "빨강 (위험)", "초록 (안정)"],
              ]}
            />
            <InfoBox color="green">
              <strong>박준호 부부의 결론:</strong> "3년이 이렇게 큰 차이를 만든다니 놀랍다." 추가 근로소득(5.3억) + 복리 효과 + 인출 기간 단축의 삼중 효과가 결합되어 극적인 결과가 나왔습니다. 감정적으로 은퇴 시기를 정하지 않고, 탈출지도의 숫자를 기반으로 최적의 시점을 찾은 것이 핵심이었습니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch3",
    title: "3장. 정미경 이사(58세)의 풍족한 은퇴",
    subsections: [
      {
        id: "3-1",
        title: "3.1 고자산 은퇴자 정미경 이사의 프로필",
        content: (
          <>
            <Paragraph>
              정미경 씨는 대기업 이사로 30년 근무 후 58세에 퇴임했습니다. 남편(60세)은 이미 퇴직하여 함께 은퇴 생활을 시작했습니다. 자녀 2명은 모두 직장인으로 독립한 상태입니다.
            </Paragraph>
            <Heading>정미경 이사의 재무 현황</Heading>
            <MdTable
              headers={["항목", "금액", "비고"]}
              rows={[
                ["퇴직금", "5억원", "IRP로 이전 완료"],
                ["해외주식", "7억원", "미국/유럽/아시아 분산 투자"],
                ["ISA", "2억원", "국내 채권 ETF 중심"],
                ["개인연금(연금저축)", "3억원", "55세부터 연간 1,200만원 수령 중"],
                ["예적금/채권", "8억원", "정기예금 3억 + 국채/회사채 5억"],
                ["총 금융자산", "25억원", "부동산 제외"],
              ]}
            />
            <MdTable
              headers={["항목", "상세"]}
              rows={[
                ["월 생활비", "700만원 (여행, 문화생활, 골프 포함)"],
                ["국민연금 예상", "월 170만원 (65세 수령 예정)"],
                ["남편 국민연금", "월 140만원 (현재 수령 중)"],
              ]}
            />
            <Heading>자산이 충분한데 왜 탈출지도가 필요한가?</Heading>
            <BulletList items={[
              "자산 고갈 걱정은 없지만, 불필요한 세금을 내고 있는지 확인하고 싶다",
              "금융소득종합과세에 해당되는지, 건보료가 얼마나 나오는지 궁금하다",
              "생활비를 더 여유 있게 쓸 수 있는지 숫자로 확인하고 싶다",
              "자녀에게 얼마까지 증여해도 본인 노후에 지장이 없는지 파악하고 싶다",
            ]} />
            <InfoBox color="blue">
              고자산 은퇴자의 탈출지도 활용 목적은 '자산 고갈 방지'가 아닙니다. <strong>"얼마나 더 쓸 수 있는가"</strong>와 <strong>"얼마를 자녀에게 이전할 수 있는가"</strong>를 구분하는 것, 그리고 <strong>세금과 건보료를 최소화</strong>하는 것이 핵심입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "3-2",
        title: "3.2 세금 최적화와 생활비 여력 계산",
        content: (
          <>
            <Paragraph>
              정미경 씨가 탈출지도를 돌린 결과, 95세까지 자산이 충분히 유지되었습니다. 그러나 연간 금융소득이 약 3,800만원으로 추정되어 금융소득종합과세 대상이었습니다. 세금과 건보료를 줄이면서도 풍족한 생활을 유지할 수 있는 전략을 탈출지도로 검증했습니다.
            </Paragraph>
            <Heading>금융소득 2,000만원 벽 관리</Heading>
            <Paragraph>
              금융소득(이자+배당)이 연 2,000만원을 초과하면 종합소득세 신고 대상이 됩니다. 정미경 씨의 경우 예적금/채권 이자(약 2,400만원)와 해외주식 배당(약 1,400만원)을 합치면 연 3,800만원의 금융소득이 발생하고 있었습니다.
            </Paragraph>
            <MdTable
              headers={["절세 전략", "실행 방법", "예상 절세 효과"]}
              rows={[
                ["ISA 계좌 활용 극대화", "이자/배당이 발생하는 자산을 ISA 내로 이동", "200만원 비과세 + 초과분 9.9% 분리과세"],
                ["배우자 명의 분산", "예적금 일부를 남편 명의로 분산 (증여세 비과세 한도 6억 이내)", "각각 2,000만원 기준 적용으로 종합과세 회피"],
                ["연금 수령액 조절", "개인연금 연간 수령을 1,200만원 이하로 유지", "분리과세(3.3~5.5%) 적용, 종합과세 회피"],
                ["국채/채권 매매차익 활용", "이자 수익 대신 할인채 매매차익으로 수익 실현", "개인의 채권 매매차익은 비과세(일부 예외 있음)"],
              ]}
            />
            <Heading>생활비를 더 써도 괜찮은가?</Heading>
            <Paragraph>
              정미경 씨는 현재 월 700만원을 쓰고 있지만, 퇴임 후 여유가 생기니 더 쓰고 싶은 마음이 있었습니다. 탈출지도에서 생활비를 단계적으로 올려가며 결과를 확인했습니다.
            </Paragraph>
            <MdTable
              headers={["월 생활비", "95세 잔여 자산", "판정"]}
              rows={[
                ["700만원 (현재)", "13.6억원", "매우 충분"],
                ["800만원", "10.1억원", "충분"],
                ["900만원", "6.3억원", "여유 있음"],
                ["1,000만원", "2.2억원", "가능하나 여유 감소"],
                ["1,100만원", "0", "85세 이후 자산 부족"],
              ]}
            />
            <Paragraph>
              월 900만원까지는 95세에도 6.3억원이 남아 안정적입니다. 1,000만원도 가능하지만 여유가 크게 줄어들고, 1,100만원부터는 위험 구간에 진입합니다.
            </Paragraph>
            <Heading>자녀 증여 여력 확인</Heading>
            <Paragraph>
              정미경 씨는 자녀 2명에게 자산을 일부 증여하고 싶었습니다. 탈출지도에서 총 자산을 줄여가며, 본인 노후에 지장이 없는 증여 한도를 검증했습니다.
            </Paragraph>
            <BulletList items={[
              "성인 자녀 1인당 10년간 5,000만원 비과세 증여 가능 (2자녀 합산 1억원)",
              "현재 자산에서 5억원을 증여해도 95세 잔여 자산이 5.8억원으로 안전 구간 유지",
              "월 생활비 800만원 + 증여 3억원 조합도 95세에 5.2억원 유지 가능",
              "증여 시점이 빠를수록 유리: 자산이 불어나기 전에 이전하면 증여세 절감",
              "증여 후에도 탈출지도를 다시 실행하여 안전마진을 반드시 확인할 것",
            ]} />
            <InfoBox color="green">
              <strong>정미경 이사의 결론:</strong> 탈출지도 덕분에 세 가지를 명확히 구분할 수 있었습니다. (1) 안심하고 쓸 수 있는 생활비 범위: 월 900만원까지, (2) 자녀에게 이전할 수 있는 금액: 약 5억원, (3) 세금을 줄이기 위한 자산 배치 전략. "쓸 수 있는 돈"과 "남겨야 할 돈"의 경계를 숫자로 확인하니 비로소 마음이 편해졌다고 합니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
];


interface EBook3Props {
  onNavigate?: (page: string) => void;
}

export function EBook3({ onNavigate }: EBook3Props) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(chapters[0].subsections.map((s) => s.id)));

  const chapter = chapters[currentChapter];

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goToChapter = (idx: number) => {
    setCurrentChapter(idx);
    setExpandedSections(new Set(chapters[idx].subsections.map((s) => s.id)));
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <BookOpen size={22} strokeWidth={2} color="var(--accent-blue)" />
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)", margin: 0 }}>
            사례로 배우기
          </h1>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          실전 사례로 배우는 은퇴 설계 전략
        </p>
      </div>

      {/* Chapter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {chapters.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => goToChapter(idx)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: currentChapter === idx ? 700 : 500,
              background: currentChapter === idx ? "var(--accent-blue)" : "var(--bg-secondary)",
              color: currentChapter === idx ? "#fff" : "var(--text-secondary)",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {idx + 1}장
          </button>
        ))}
      </div>

      {/* Chapter Title */}
      <div style={{ ...card, marginBottom: 16, background: "var(--accent-blue)", border: "none", color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>
          CHAPTER {currentChapter + 1} / {chapters.length}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{chapter.title}</div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {chapter.subsections.map((sub) => {
          const isExpanded = expandedSections.has(sub.id);
          return (
            <div key={sub.id} style={card}>
              <div
                onClick={() => toggleSection(sub.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {sub.title}
                </h3>
                {isExpanded
                  ? <ChevronUp size={18} color="var(--text-tertiary)" />
                  : <ChevronDown size={18} color="var(--text-tertiary)" />}
              </div>
              {isExpanded && (
                <div style={{ marginTop: 16 }}>
                  {sub.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
        <button
          onClick={() => goToChapter(currentChapter - 1)}
          disabled={currentChapter === 0}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid var(--border-primary)",
            background: "var(--bg-primary)",
            color: currentChapter === 0 ? "var(--text-disabled)" : "var(--text-primary)",
            fontSize: 14,
            fontWeight: 600,
            cursor: currentChapter === 0 ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          <ChevronLeft size={16} /> 이전 장
        </button>
        <button
          onClick={() => goToChapter(currentChapter + 1)}
          disabled={currentChapter === chapters.length - 1}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: currentChapter === chapters.length - 1 ? "var(--bg-tertiary)" : "var(--accent-blue)",
            color: currentChapter === chapters.length - 1 ? "var(--text-disabled)" : "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: currentChapter === chapters.length - 1 ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          다음 장 <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border-secondary)", textAlign: "center", fontSize: 11, color: "var(--text-disabled)", lineHeight: 1.6 }}>
        &copy; 탈출로드맵. All rights reserved. 무단 복제 및 배포를 금지합니다.
      </div>
    </div>
  );
}
