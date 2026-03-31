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
  const colors = {
    blue: { bg: "var(--accent-blue-bg)", border: "rgba(49,130,246,0.2)", accent: "var(--accent-blue)" },
    amber: { bg: "rgba(255,149,0,0.08)", border: "rgba(255,149,0,0.2)", accent: "var(--color-warning)" },
    green: { bg: "rgba(48,200,94,0.08)", border: "rgba(48,200,94,0.2)", accent: "var(--color-success)" },
    red: { bg: "rgba(240,68,82,0.08)", border: "rgba(240,68,82,0.2)", accent: "var(--color-error)" },
  };
  const c = colors[color];
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
          style={{ display: "flex", alignItems: "baseline", gap: 8, cursor: "pointer" }}
        >
          <span style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            border: checked[i] ? "none" : "1.5px solid var(--border-primary)",
            background: checked[i] ? "var(--accent-blue)" : "transparent",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#fff", lineHeight: 1, position: "relative", top: 2,
          }}>
            {checked[i] && "✓"}
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
    title: "1장. 왜 은퇴 설계가 필요한가",
    subsections: [
      {
        id: "1-1",
        title: "1.1 30년을 준비 없이 보낼 수 있을까?",
        content: (
          <>
            <Paragraph>
              대한민국 직장인의 평균 은퇴 나이는 약 53세입니다. 그런데 기대수명은 84세를 넘어섰습니다. 은퇴 후 30년이라는 시간이 주어지는 셈입니다. 이 30년은 단순히 "돈이 얼마 있느냐"의 문제가 아닙니다. 어떤 하루를 보낼 것인지, 어떤 관계를 유지할 것인지, 건강이 나빠졌을 때 어떻게 대처할 것인지를 포함한 삶 전체의 문제입니다.
            </Paragraph>
            <Heading>은퇴 후 시간의 무게</Heading>
            <Paragraph>
              직장에 다닐 때는 하루의 절반이 자동으로 채워집니다. 하지만 은퇴 후에는 매일 아침 "오늘 뭘 하지?"라는 질문이 찾아옵니다. 돈이 충분해도 시간을 어떻게 보낼지 모르면 공허함이 밀려옵니다. 반대로, 돈이 부족해도 계획이 있으면 불안은 줄어듭니다.
            </Paragraph>
            <MdTable
              headers={["구분", "직장 생활 30년", "은퇴 후 30년"]}
              rows={[
                ["하루 구조", "출근/퇴근으로 자동 편성", "스스로 설계해야 함"],
                ["사회적 관계", "동료/거래처 중심", "의도적으로 유지 필요"],
                ["소득 흐름", "월급이 매달 입금", "자산에서 꺼내 써야 함"],
                ["건강 변화", "비교적 안정", "점진적 악화 대비 필요"],
                ["자아 정체성", "직함/역할로 정의", "새로운 정의 필요"],
              ]}
            />
            <InfoBox color="amber">
              은퇴 설계는 "돈 계산"이 아닙니다. 앞으로 30년을 어떤 모습으로 살고 싶은지 그려보는 것에서 시작합니다. 숫자는 그 그림을 현실로 만들어 주는 도구일 뿐입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-2",
        title: "1.2 내 통장의 수명을 아는 것이 첫걸음",
        content: (
          <>
            <Paragraph>
              "대충 괜찮겠지"라는 막연한 낙관과 "다 부족할 것 같다"라는 막연한 불안. 이 두 가지는 정반대 감정이지만, 공통점이 있습니다. 둘 다 숫자를 확인하지 않았기 때문에 생기는 감정이라는 점입니다.
            </Paragraph>
            <Heading>막연한 불안 vs 숫자로 확인하는 안심</Heading>
            <MdTable
              headers={["", "확인하지 않은 상태", "시뮬레이션 후"]}
              rows={[
                ["느낌", "왠지 불안하다", "구체적 숫자로 파악"],
                ["행동", "아무것도 안 하게 됨", "우선순위가 보임"],
                ["대응", "닥쳐야 움직임", "미리 조정 가능"],
                ["결과", "후회할 가능성 높음", "선택지가 넓어짐"],
              ]}
            />
            <Paragraph>
              탈출지도가 주는 진짜 가치는 "정확한 예측"이 아닙니다. 완벽하게 맞추는 것은 불가능하니까요. 진짜 가치는 <strong>"내 상황을 숫자로 마주하는 용기"</strong>를 주는 것입니다. 현재 자산으로 몇 세까지 버틸 수 있는지, 어디서 적자가 시작되는지, 무엇을 바꾸면 결과가 달라지는지를 한눈에 볼 수 있게 됩니다.
            </Paragraph>
            <InfoBox color="blue">
              많은 분들이 "나중에 제대로 해봐야지"라고 미루지만, 대략적인 숫자라도 한 번 확인해 보는 것과 아예 안 보는 것 사이에는 하늘과 땅 차이가 있습니다. 오늘 10분만 투자해 보세요.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-3",
        title: "1.3 10분이면 충분합니다",
        content: (
          <>
            <Paragraph>
              은퇴 시뮬레이션이라고 하면 복잡한 엑셀 시트를 떠올리는 분들이 많습니다. 금융 전문가만 다룰 수 있을 것 같다는 선입견도 있습니다. 하지만 이 탈출지도는 다릅니다. 약 10분이면 첫 번째 결과를 확인할 수 있습니다.
            </Paragraph>
            <Heading>시작하기 위해 필요한 것</Heading>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "12px 0" }}>
              {[
                { num: "1", title: "대략적인 월 생활비", desc: "정확하지 않아도 됩니다. '한 달에 대충 얼마 쓰지?' 수준이면 충분합니다" },
                { num: "2", title: "현재 자산 잔액", desc: "은행 앱을 열어 예적금, 주식계좌 잔액을 확인하세요" },
                { num: "3", title: "예상 연금 수령액", desc: "국민연금공단 사이트(nps.or.kr)에서 예상액 조회 가능" },
              ].map((item) => (
                <div key={item.num} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 8, background: "var(--bg-secondary)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-blue-bg)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{item.num}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Paragraph>
              처음부터 완벽하게 입력할 필요는 없습니다. 먼저 대략적인 숫자로 한 번 돌려보고, 결과를 본 뒤에 하나씩 정밀하게 수정하면 됩니다. 중요한 것은 "시작하는 것" 자체입니다.
            </Paragraph>
            <InfoBox color="green">
              완벽한 준비보다 불완전한 첫 시도가 훨씬 낫습니다. 지금 바로 탈출지도를 열어 첫 번째 숫자를 입력해 보세요. 그 10분이 앞으로의 30년을 바꿀 수 있습니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch2",
    title: "2장. 탈출지도에 입력하는 나의 재무 지도",
    subsections: [
      {
        id: "2-1",
        title: "2.1 생활비, 현실적으로 얼마가 필요할까?",
        content: (
          <>
            <Paragraph>
              탈출지도에서 가장 먼저 마주하는 항목이 "월 생활비"입니다. 이 숫자 하나가 전체 결과를 좌우하기 때문에 현실적으로 설정하는 것이 핵심입니다. 많은 분들이 현재 생활비를 그대로 넣지만, 은퇴 전후의 지출 구조는 상당히 다릅니다.
            </Paragraph>
            <Heading>은퇴 전후 생활비 변화</Heading>
            <MdTable
              headers={["항목", "은퇴 전", "은퇴 직후(60대)", "후기 노년(75세+)"]}
              rows={[
                ["교통/출퇴근비", "높음", "크게 감소", "거의 없음"],
                ["외식/사교비", "높음", "다소 감소", "크게 감소"],
                ["여행/취미", "보통", "증가 가능", "감소"],
                ["의료/건강비", "낮음", "다소 증가", "크게 증가"],
                ["보험료/건보료", "회사 분담", "전액 본인", "전액 본인"],
                ["자녀 관련 지출", "높음", "간헐적", "거의 없음"],
              ]}
            />
            <InfoBox color="amber">
              일반적으로 은퇴 직후 생활비는 현재의 <strong>70~80%</strong> 수준이지만, 75세 이후에는 의료비가 급증하면서 다시 올라갈 수 있습니다. 탈출지도에서 "70세 이후 생활비"를 별도로 설정할 수 있다면 반드시 활용하세요.
            </InfoBox>
            <Heading>생활비 산정 실전 팁</Heading>
            <BulletList items={[
              "최근 3개월 카드/통장 내역을 뽑아보면 실제 지출이 보입니다",
              "고정지출(관리비, 보험, 통신비)과 변동지출(식비, 쇼핑)을 분리하세요",
              "자녀 독립 후 줄어드는 항목을 미리 반영하세요",
              "의료비는 별도 항목으로 넉넉하게 잡는 것이 안전합니다",
              "건강보험료 본인 부담분(지역가입자 전환 시)을 꼭 포함하세요",
            ]} />
          </>
        ),
      },
      {
        id: "2-2",
        title: "2.2 흩어진 내 자산을 한눈에",
        content: (
          <>
            <Paragraph>
              탈출지도에 자산을 입력하려면, 먼저 내 자산이 어디에 얼마나 있는지 파악해야 합니다. 대부분의 사람들은 자산이 여러 금융기관에 흩어져 있어서 전체 그림을 모르는 경우가 많습니다.
            </Paragraph>
            <Heading>내 자산 확인하는 방법</Heading>
            <MdTable
              headers={["자산 종류", "확인 방법", "비고"]}
              rows={[
                ["예적금", "각 은행 앱 또는 어카운트인포", "어카운트인포(accountinfo.or.kr)에서 전 금융기관 조회"],
                ["주식/펀드", "증권사 앱 또는 금투세 조회", "여러 증권사 보유 시 각각 확인 필요"],
                ["연금저축/IRP", "각 금융기관 앱", "금감원 통합연금포털(100lifeplan.fss.or.kr)"],
                ["퇴직연금", "근무 중인 회사 퇴직연금 운용사", "퇴직 전이면 예상 퇴직금으로 입력"],
                ["부동산", "국토부 실거래가 또는 KB시세", "탈출지도에는 주택연금 활용 시 입력"],
                ["보험", "보험다모아(e-insmarket.or.kr)", "해지환급금/만기환급금 확인"],
              ]}
            />
            <Heading>모르는 항목이 있다면?</Heading>
            <Paragraph>
              정확한 잔액을 모르는 계좌가 있다면, 대략적인 금액이라도 넣는 것이 빈칸으로 두는 것보다 낫습니다. 탈출지도는 언제든 수정하고 다시 돌릴 수 있습니다. "나중에 정확히 알아보고 입력해야지"라며 미루지 마세요.
            </Paragraph>
            <InfoBox color="blue">
              <strong>숨은 자산 찾기:</strong> 어카운트인포(accountinfo.or.kr)에서 본인 명의 전 금융기관 계좌를 한 번에 조회할 수 있습니다. 잊고 있던 휴면계좌를 발견하는 분들도 많습니다.
            </InfoBox>
            <Heading>탈출지도 입력 시 유의점</Heading>
            <BulletList items={[
              "계좌별로 구분해서 입력하면 수익률을 다르게 설정할 수 있어 더 정확합니다",
              "부채가 있다면 순자산(자산 - 부채)으로 입력하거나 부채 항목에 별도 입력하세요",
              "배우자 자산은 합산 vs 별도 중 탈출지도 설정에 맞게 입력하세요",
              "부동산은 거주용이면 자산에서 제외하고, 주택연금 활용 시에만 포함하세요",
            ]} />
          </>
        ),
      },
      {
        id: "2-3",
        title: "2.3 연금은 몇 개나 받을 수 있을까?",
        content: (
          <>
            <Paragraph>
              많은 분들이 "나는 국민연금밖에 없다"고 생각하지만, 하나씩 따져보면 의외로 여러 종류의 연금을 받을 수 있는 경우가 많습니다. 탈출지도에서 각 연금의 수령 시기와 금액을 정확히 설정하면 현금흐름 예측의 정밀도가 크게 올라갑니다.
            </Paragraph>
            <Heading>연금의 종류와 역할</Heading>
            <MdTable
              headers={["연금 종류", "역할", "탈출지도 설정 시 확인할 것"]}
              rows={[
                ["국민연금", "은퇴 후 기본 생활 안전망", "예상 수령액(nps.or.kr), 수령 개시 나이"],
                ["퇴직연금(DB/DC)", "직장에서 쌓인 퇴직금의 연금화", "일시금 vs 연금 수령 선택, 예상 금액"],
                ["개인연금(연금저축)", "자발적으로 준비한 노후 자금", "현재 적립액, 추가 납입 계획, 수령 개시 나이"],
                ["주택연금", "집에 살면서 집값을 연금으로 수령", "주택 시세, 가입 나이(55세+), 예상 월 수령액"],
              ]}
            />
            <Heading>연금별 탈출지도 설정 가이드</Heading>
            <BulletList items={[
              "국민연금: 국민연금공단(nps.or.kr) '내 연금 알아보기'에서 예상액 조회 후 입력",
              "퇴직연금: 일시금 수령 예정이면 자산에, 연금 수령이면 연금 항목에 입력",
              "개인연금: 55세 이후 수령 예정이면 수령 시작 나이와 월 수령액 입력",
              "주택연금: 한국주택금융공사(hf.go.kr) 예상 연금 조회 후 입력. 부부 중 연장자 기준",
            ]} />
            <InfoBox color="green">
              연금은 "매달 들어오는 확정 수입"이기 때문에 시뮬레이션 결과에 큰 영향을 줍니다. 빠뜨리면 결과가 실제보다 비관적으로 나올 수 있으니, 하나도 놓치지 말고 입력하세요.
            </InfoBox>
          </>
        ),
      },
      {
        id: "2-4",
        title: "2.4 수익률, 얼마로 넣어야 현실적일까?",
        content: (
          <>
            <Paragraph>
              수익률 설정은 시뮬레이션에서 가장 고민되는 항목입니다. 너무 낙관적으로 넣으면 거짓 안심을, 너무 보수적으로 넣으면 불필요한 불안을 줍니다. 현실적인 기대수익률을 어떻게 잡아야 할까요?
            </Paragraph>
            <Heading>투자 성향별 추천 수익률 가이드</Heading>
            <MdTable
              headers={["투자 성향", "자산 구성 예시", "세전 기대수익률", "세후 실질수익률"]}
              rows={[
                ["보수적", "예금/채권 위주", "연 3~4%", "연 1~2%"],
                ["중립적", "주식 40% + 채권 60%", "연 5~6%", "연 3~4%"],
                ["적극적", "주식 70% + 기타 30%", "연 7~8%", "연 5~6%"],
              ]}
            />
            <InfoBox color="red">
              <strong>주의:</strong> 탈출지도에 넣는 수익률이 "세전"인지 "세후"인지 반드시 확인하세요. 세전 6%와 세후 6%는 30년 후 결과에서 수천만원 이상 차이가 납니다.
            </InfoBox>
            <Heading>수익률 설정 시 체크포인트</Heading>
            <BulletList items={[
              "과거 수익률이 미래를 보장하지 않습니다. 최근 고수익에 현혹되지 마세요",
              "물가상승률(연 2~3%)을 빼면 '실질 수익률'이 됩니다. 실질 수익률로 생각하는 습관을 들이세요",
              "은퇴가 가까울수록 보수적 수익률을 적용하는 것이 안전합니다",
              "확신이 없다면 세후 연 3~4%로 먼저 돌려보고, 이후 시나리오를 바꿔가며 비교하세요",
            ]} />
            <Heading>낙관 vs 보수 시나리오 비교 방법</Heading>
            <Paragraph>
              탈출지도를 두 번 돌려보세요. 한 번은 낙관적 수익률(세후 5%)로, 한 번은 보수적 수익률(세후 2%)로. 두 결과 사이의 범위가 여러분의 "가능한 미래 범위"입니다. 보수적 시나리오에서도 자산이 유지된다면 안심해도 좋습니다.
            </Paragraph>
            <InfoBox color="blue">
              처음 입력할 때는 보수적 수익률(세후 연 3%)로 시작하는 것을 권장합니다. 결과가 괜찮다면 좋은 것이고, 부족하다면 그때부터 조정 전략을 세우면 됩니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch3",
    title: "3장. 시뮬레이션 결과 읽는 법",
    subsections: [
      {
        id: "3-1",
        title: "3.1 초록 vs 빨강, 내 결과는?",
        content: (
          <>
            <Paragraph>
              시뮬레이션을 돌리면 가장 먼저 눈에 들어오는 것이 Action Plan 히어로 배너입니다. 초록색이면 "현재 계획대로라면 자산이 유지된다"는 뜻이고, 빨간색이면 "일정 시점에 자산이 고갈될 수 있다"는 뜻입니다.
            </Paragraph>
            <Heading>결과 배너의 의미</Heading>
            <MdTable
              headers={["배너 색상", "의미", "핵심 메시지"]}
              rows={[
                ["초록", "자산 유지 가능", "현재 계획이 안정적. 더 풍요로운 노후를 설계해 볼 수 있음"],
                ["빨강", "자산 고갈 경고", "특정 나이에 자산이 바닥남. 조정이 필요함"],
              ]}
            />
            <Paragraph>
              빨간색이 나왔다고 당황하지 마세요. 오히려 지금 이 사실을 알게 된 것이 다행입니다. 탈출지도에서 몇 가지 변수만 조정하면 초록으로 바뀌는 경우가 대부분입니다. 반대로, 초록색이라고 방심하지 마세요. "겨우 초록"인지 "여유 있는 초록"인지를 세부 숫자에서 확인해야 합니다.
            </Paragraph>
            <InfoBox color="green">
              배너는 "요약 진단"이고, 진짜 이야기는 그 아래 연도별 테이블에 있습니다. 배너 색상만 보고 끝내지 말고, 반드시 아래 숫자들을 함께 확인하세요.
            </InfoBox>
          </>
        ),
      },
      {
        id: "3-2",
        title: "3.2 연도별 숫자가 말해주는 것",
        content: (
          <>
            <Paragraph>
              결과 화면의 연도별 테이블에는 매년의 수입, 지출, 잔여 자산이 표시됩니다. 이 숫자들을 어떻게 읽어야 할까요?
            </Paragraph>
            <Heading>테이블에서 반드시 확인해야 할 3가지</Heading>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "12px 0" }}>
              {[
                { num: "1", title: "적자 전환 시점", desc: "연간 지출이 연간 수입을 넘어서는 해를 찾으세요. 이때부터 자산이 줄어들기 시작합니다" },
                { num: "2", title: "자산 고갈 시점", desc: "잔여 자산이 0이 되는 해입니다. 이 나이가 기대수명보다 뒤에 있어야 안전합니다" },
                { num: "3", title: "연금 수령 시작 전후 변화", desc: "국민연금이 시작되는 65세 전후로 현금흐름이 크게 바뀝니다. 그 전까지 자산이 버티는지 확인하세요" },
              ].map((item) => (
                <div key={item.num} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 8, background: "var(--bg-secondary)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-blue-bg)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{item.num}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Heading>연도별 테이블 읽기 예시</Heading>
            <MdTable
              headers={["나이", "연간 수입", "연간 지출", "수지 차이", "잔여 자산"]}
              rows={[
                ["60세", "0원", "4,800만원", "-4,800만원", "4억 5,200만원"],
                ["65세", "1,800만원", "5,100만원", "-3,300만원", "2억 8,000만원"],
                ["70세", "1,800만원", "5,400만원", "-3,600만원", "9,200만원"],
                ["73세", "1,800만원", "5,600만원", "-3,800만원", "0원 (고갈)"],
              ]}
            />
            <InfoBox color="amber">
              위 예시에서 핵심 포인트: 60세부터 매년 적자이며, 65세에 국민연금이 시작되어도 적자가 계속됩니다. 73세에 자산이 고갈되므로, 생활비 조정이나 추가 수입원 확보가 필요합니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "3-3",
        title: "3.3 값을 바꿔가며 미래를 조정하기",
        content: (
          <>
            <Paragraph>
              탈출지도의 진정한 힘은 "한 번 돌려보는 것"이 아니라 "값을 바꿔가며 여러 번 돌려보는 것"에 있습니다. 어떤 변수를 바꿨을 때 결과가 얼마나 달라지는지를 비교하는 것, 이것이 바로 민감도 분석입니다.
            </Paragraph>
            <Heading>영향력이 큰 변수 순위</Heading>
            <MdTable
              headers={["순위", "변수", "1단위 변경 시 영향", "조정 난이도"]}
              rows={[
                ["1", "월 생활비", "월 50만원 감소 시 고갈 시점 약 5~7년 연장", "중간"],
                ["2", "은퇴 시기", "1년 늦출 때마다 약 2~3년 연장", "높음"],
                ["3", "국민연금 수령 시기", "5년 연기 시 수령액 36% 증가", "낮음"],
                ["4", "투자 수익률", "1%p 상승 시 30년 후 자산 15~20% 증가", "중간"],
                ["5", "물가상승률", "1%p 차이가 30년 후 실질 구매력 크게 변화", "조절 불가"],
              ]}
            />
            <Heading>실전 민감도 분석 방법</Heading>
            <BulletList items={[
              "기본 시나리오를 먼저 저장하거나 메모해 두세요",
              "한 번에 하나의 변수만 바꾸세요. 여러 개를 동시에 바꾸면 어떤 변수가 영향을 준 건지 알 수 없습니다",
              "생활비를 월 50만원 줄였을 때, 은퇴를 2년 늦췄을 때, 수익률을 1% 올렸을 때를 각각 비교하세요",
              "가장 적은 노력으로 가장 큰 변화를 만드는 변수를 찾는 것이 핵심입니다",
            ]} />
            <InfoBox color="blue">
              민감도 분석의 목적은 "최적의 정답"을 찾는 것이 아닙니다. <strong>"내가 조절할 수 있는 것"과 "조절할 수 없는 것"을 구분</strong>하고, 조절 가능한 것 중에서 효과가 큰 것부터 실행하기 위함입니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch4",
    title: "4장. 결과에 따른 행동 계획",
    subsections: [
      {
        id: "4-1",
        title: "4.1 부족하다면: 지금 당장 할 수 있는 3가지",
        content: (
          <>
            <Paragraph>
              시뮬레이션 결과 자산이 부족하다고 나왔다면, 가장 먼저 기억할 것은 이것입니다: <strong>지금 안 것이 다행입니다.</strong> 아직 조정할 시간이 있습니다. 아래 세 가지는 전문가 상담 없이도 탈출지도에서 바로 테스트해 볼 수 있는 전략들입니다.
            </Paragraph>
            <Heading>전략 1: 생활비 현실화</Heading>
            <Paragraph>
              월 생활비를 50만원 줄이면, 연간 600만원, 30년이면 1.8억원의 차이가 납니다. 여기에 투자 수익까지 고려하면 효과는 더 커집니다. 탈출지도에서 생활비를 현재보다 50만원, 100만원 낮춰서 돌려보세요. 결과가 놀라울 만큼 달라질 수 있습니다.
            </Paragraph>
            <BulletList items={[
              "매일 커피 한 잔 줄이기가 아닙니다. 보험 리뷰, 통신비 전환, 구독 정리 같은 구조적 절감을 말합니다",
              "자녀 독립 후 줄어드는 비용을 미리 반영하면 현실적인 수치가 됩니다",
            ]} />
            <Heading>전략 2: 연금 수령 시기 조정</Heading>
            <Paragraph>
              국민연금 수령을 65세에서 70세로 미루면 수령액이 36% 증가합니다. 월 100만원이 월 136만원이 됩니다. 탈출지도에서 수령 시작 나이를 바꿔보세요. 단, 이 전략은 65~70세 사이에 자산으로 버틸 수 있을 때만 유효합니다.
            </Paragraph>
            <Heading>전략 3: 은퇴 시기 재검토</Heading>
            <Paragraph>
              은퇴를 1~2년만 늦춰도 효과가 큽니다. 추가 근로 기간 동안 자산 소진이 멈추고, 오히려 축적이 됩니다. 동시에 연금 수령까지의 기간도 줄어듭니다. 탈출지도에서 은퇴 나이를 1년, 2년 뒤로 조정해서 결과를 비교해 보세요.
            </Paragraph>
            <InfoBox color="blue">
              세 가지를 조합하면 효과가 배가됩니다. 예: 생활비 50만원 절감 + 은퇴 1년 연기 + 국민연금 2년 연기. 탈출지도에서 이 조합을 직접 테스트해 보세요.
            </InfoBox>
          </>
        ),
      },
      {
        id: "4-2",
        title: "4.2 여유롭다면: 더 풍요로운 노후를 위해",
        content: (
          <>
            <Paragraph>
              시뮬레이션 결과 자산이 충분히 유지된다면, 축하합니다. 이제 "부족하지 않게"가 아닌 "더 풍요롭게"를 생각할 차례입니다. 여유 자산을 어떻게 활용할지도 탈출지도에서 테스트해 볼 수 있습니다.
            </Paragraph>
            <Heading>생활비 상향 시뮬레이션</Heading>
            <Paragraph>
              현재 설정한 생활비에 월 50만원, 100만원을 추가해 보세요. 여행 경비, 취미 활동비, 손주 용돈 등을 포함한 "풍요로운 생활비"를 넣어도 자산이 유지되는지 확인하세요.
            </Paragraph>
            <Heading>여유 자산 활용 아이디어</Heading>
            <MdTable
              headers={["활용 방안", "탈출지도에서 테스트하는 법", "고려 사항"]}
              rows={[
                ["연 1~2회 해외여행", "생활비에 연간 여행 예산 추가", "70대 이후 여행 빈도 감소 반영"],
                ["취미/자기계발", "월 생활비에 30~50만원 추가", "건강이 허락하는 동안의 투자"],
                ["자녀/손주 지원", "비정기 지출로 별도 반영", "증여세 면제 한도 고려"],
                ["사회 공헌/기부", "연간 고정 지출로 반영", "세액공제 혜택 가능"],
              ]}
            />
            <InfoBox color="green">
              여유가 있다는 결과가 나왔다면, 역으로 "얼마까지 더 쓸 수 있는지" 한계를 찾아보세요. 생활비를 점점 올려가며 탈출지도를 돌리다 보면, 자산이 고갈되기 시작하는 지점이 보입니다. 그 바로 아래가 여러분의 <strong>"안전한 풍요 라인"</strong>입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "4-3",
        title: "4.3 매년 한 번, 나의 은퇴 계획 점검하기",
        content: (
          <>
            <Paragraph>
              시뮬레이션은 한 번 하고 끝내는 것이 아닙니다. 경제 환경, 자산 규모, 건강 상태, 가족 상황은 매년 바뀝니다. 연 1회 탈출지도를 다시 돌리는 것만으로도 큰 차이를 만들 수 있습니다.
            </Paragraph>
            <Heading>연간 리뷰 루틴 (매년 1월 추천)</Heading>
            <CheckList items={[
              "각 계좌 잔액을 최신 금액으로 업데이트했는가?",
              "지난 1년간 실제 생활비를 확인하고 탈출지도에 반영했는가?",
              "연금 예상 수령액에 변동은 없는가? (국민연금공단에서 재조회)",
              "새로 가입한 금융 상품이나 해지한 상품이 있는가?",
              "건강 상태 변화로 의료비 예상을 수정할 필요가 있는가?",
              "가족 상황 변화(자녀 결혼, 부모 간병 등)를 반영했는가?",
            ]} />
            <Heading>리뷰할 때 비교하면 좋은 것</Heading>
            <BulletList items={[
              "작년 시뮬레이션 결과 vs 올해 시뮬레이션 결과: 자산 고갈 시점이 앞당겨졌는지 뒤로 갔는지",
              "계획한 생활비 vs 실제 지출: 괴리가 크다면 입력값을 현실에 맞게 조정",
              "예상 수익률 vs 실제 수익률: 지나치게 낙관적이었다면 수정",
            ]} />
            <InfoBox color="amber">
              가장 좋은 시뮬레이션은 <strong>"가장 정확한 시뮬레이션"</strong>이 아니라 <strong>"가장 최근의 시뮬레이션"</strong>입니다. 완벽하지 않아도 매년 업데이트하는 것이 3년 전 정밀한 시뮬레이션보다 훨씬 유용합니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch5",
    title: "5장. 자주 하는 질문과 실수",
    subsections: [
      {
        id: "5-1",
        title: "5.1 탈출지도 입력 시 자주 하는 실수 5가지",
        content: (
          <>
            <Paragraph>
              탈출지도를 처음 사용하는 분들이 공통적으로 빠지는 실수가 있습니다. 이 실수들만 피해도 시뮬레이션 결과의 신뢰도가 크게 올라갑니다.
            </Paragraph>
            <Heading>실수 모음</Heading>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "12px 0" }}>
              {[
                { num: "1", title: "물가상승률을 반영하지 않음", desc: "생활비를 현재 기준으로만 입력하고 물가상승률을 0%로 두면, 미래 생활비가 심각하게 과소 추정됩니다. 최소 연 2~3%는 반영하세요." },
                { num: "2", title: "투자 수익률을 과대 설정", desc: "유튜브나 뉴스에서 본 고수익 사례를 기준으로 잡지 마세요. 세후 실질 수익률로 보수적으로 잡는 것이 안전합니다." },
                { num: "3", title: "건강보험료를 무시", desc: "은퇴 후 지역가입자로 전환되면 건보료가 월 수십만원 추가됩니다. 생활비에 이 금액을 포함해야 합니다." },
                { num: "4", title: "비정기 지출을 누락", desc: "자녀 결혼 축의금, 주택 수선비, 차량 교체, 경조사비 등 매년 발생하지는 않지만 큰 금액이 나가는 지출을 빼먹기 쉽습니다." },
                { num: "5", title: "배우자를 고려하지 않음", desc: "부부의 은퇴 시기, 연금 수령 시기, 건강 상태가 다를 수 있습니다. 한 사람 기준으로만 계산하면 전체 그림이 왜곡됩니다." },
              ].map((item) => (
                <div key={item.num} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "var(--bg-secondary)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(240,68,82,0.1)", color: "var(--color-error)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{item.num}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <InfoBox color="red">
              이 다섯 가지 실수를 모두 범하면, 실제보다 자산이 <strong>30~50% 과대 추정</strong>될 수 있습니다. 결과가 "초록"이라도 실제로는 "빨강"일 수 있다는 뜻입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "5-2",
        title: "5.2 이런 경우 어떻게 입력하나요?",
        content: (
          <>
            <Paragraph>
              탈출지도를 사용하다 보면 "내 상황은 어떻게 입력하지?"라는 궁금증이 생깁니다. 자주 묻는 상황별 입력 가이드를 정리했습니다.
            </Paragraph>
            <Heading>상황별 입력 가이드</Heading>
            <MdTable
              headers={["상황", "입력 방법", "주의 사항"]}
              rows={[
                ["맞벌이 부부", "부부 합산 자산/수입으로 입력하거나, 각각 따로 시뮬레이션 후 결과를 종합", "은퇴 시기가 다르면 따로 돌리는 게 정확"],
                ["임대소득이 있는 경우", "연금 또는 확정 수입 항목에 월 임대료 입력", "공실 리스크 반영하여 80~90%만 입력 권장"],
                ["부채가 있는 경우", "부채를 자산에서 차감하여 순자산으로 입력하거나, 상환 일정을 지출에 반영", "변동금리 대출은 금리 상승 시나리오도 고려"],
                ["자녀 결혼 비용 예정", "비정기 지출 항목에 예상 시점과 금액을 입력", "자녀가 여러 명이면 각각 다른 시점에 반영"],
                ["조기 퇴직 예정", "은퇴 나이를 조기 퇴직 시점으로, 퇴직금을 자산에 추가", "조기 퇴직 ~ 연금 수령 사이 공백기 자금 확인 필수"],
              ]}
            />
            <Heading>추가 Q&A</Heading>
            <BulletList items={[
              "프리랜서/자영업자: 소득 변동이 크므로 최근 3년 평균 소득을 기준으로 입력하세요",
              "해외 자산: 원화로 환산하여 입력. 환율 변동 리스크가 있으므로 보수적으로 잡으세요",
              "상속 예정 자산: 확실하지 않으면 포함하지 않는 것이 안전합니다. 보너스로 생각하세요",
              "사업체 매각 예정: 매각가를 보수적으로 추정하여 예상 시점의 자산에 더하세요",
            ]} />
            <InfoBox color="blue">
              복잡한 상황일수록 "완벽하게 입력하려는 욕심"을 내려놓으세요. 대략적인 숫자로 먼저 돌려보고, 결과를 보면서 하나씩 정밀하게 조정하는 것이 훨씬 효과적입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "5-3",
        title: "5.3 탈출지도를 넘어서: 전문가 상담이 필요한 순간",
        content: (
          <>
            <Paragraph>
              탈출지도는 강력한 도구이지만, 모든 상황을 커버하지는 못합니다. 아래와 같은 경우에는 전문가의 도움을 받는 것이 현명합니다.
            </Paragraph>
            <Heading>전문가 상담이 필요한 케이스</Heading>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, margin: "12px 0" }}>
              {[
                { title: "세무사 상담", desc: "금융소득 종합과세 대상(연 2천만원 초과), 부동산 매매/임대소득 절세, 증여/상속세 계획, 해외 자산 신고 등" },
                { title: "재무설계사(CFP) 상담", desc: "복잡한 자산 구조의 통합 관리, 보험 포트폴리오 리뷰, 은퇴 전환기 현금흐름 설계, 가족 상황을 고려한 맞춤 전략" },
                { title: "법률 상담(변호사)", desc: "유언장/신탁 설정, 가업 승계, 이혼 시 재산 분할, 후견인 지정 등 법적 판단이 필요한 경우" },
              ].map((item) => (
                <div key={item.title} style={{ padding: 16, borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <Heading>탈출지도와 전문가 상담의 조합</Heading>
            <Paragraph>
              가장 좋은 방법은 탈출지도로 먼저 자신의 상황을 파악한 뒤, 그 결과를 가지고 전문가를 찾는 것입니다. "저는 이런 상황인데요"라고 막연히 설명하는 것보다, "시뮬레이션 결과 73세에 자산이 고갈되는데, 어떤 조정이 가능할까요?"라고 질문하는 것이 훨씬 효과적입니다.
            </Paragraph>
            <InfoBox color="green">
              탈출지도는 <strong>"나의 현재 위치를 파악하는 나침반"</strong>이고, 전문가는 <strong>"목적지까지의 최적 경로를 안내하는 가이드"</strong>입니다. 나침반 없이 가이드를 만나면 비효율적이고, 가이드 없이 나침반만 보면 복잡한 길에서 헤맬 수 있습니다. 둘을 함께 활용하세요.
            </InfoBox>
          </>
        ),
      },
    ],
  },
];

interface EBookProps {
  onNavigate?: (page: string) => void;
}

export function EBook({ onNavigate }: EBookProps) {
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
            은퇴 가이드북
          </h1>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          내 통장은 몇 살까지 버틸까? 10분 만에 끝내는 노후 자산 시뮬레이션 가이드
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
                  {sub.id === "1-3" && onNavigate && (
                    <button
                      onClick={() => onNavigate("retirement-calc")}
                      style={{
                        marginTop: 16, width: "100%", padding: "12px 0",
                        borderRadius: 10, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff", fontSize: 14, fontWeight: 700,
                        fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.3)"; }}
                    >
                      은퇴 시뮬레이션 바로가기
                    </button>
                  )}
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
