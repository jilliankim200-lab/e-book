import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

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
  <div style={{ overflowX: "auto", margin: "12px 0" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: "10px 12px", fontSize: 13, textAlign: "center", borderBottom: "1px solid var(--border-secondary)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: "12px 0", padding: "14px 16px", borderRadius: 10, background: "hsl(169.44deg 100% 50% / 10%)", fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7 }}>
    {children}
  </div>
);

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
        <div key={i} onClick={() => setChecked(prev => { const next = [...prev]; next[i] = !next[i]; return next; })} style={{ display: "flex", alignItems: "baseline", gap: 8, cursor: "pointer" }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: checked[i] ? "none" : "1.5px solid var(--border-primary)", background: checked[i] ? "var(--accent-blue)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", lineHeight: 1, position: "relative", top: 2 }}>
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
    title: "1장. 국민연금, 언제 받는 게 유리할까?",
    subsections: [
      {
        id: "1-1",
        title: "1.1 손익분기점으로 판단하기",
        content: (
          <>
            <Paragraph>
              국민연금 수령 시기를 결정할 때 가장 많이 하는 실수는 "월 수령액"만 보는 것입니다.
              진짜 중요한 건 <strong>누적 수령액이 역전되는 시점</strong>, 즉 손익분기점입니다.
            </Paragraph>
            <Heading>실전 시나리오: 월 100만원 기준</Heading>
            <MdTable
              headers={["수령 시기", "월 수령액", "77세 누적", "82세 누적", "87세 누적"]}
              rows={[
                ["60세 (조기)", "70만원", "1억 4,280만원", "1억 8,480만원", "2억 2,680만원"],
                ["65세 (정상)", "100만원", "1억 4,400만원", "2억 400만원", "2억 6,400만원"],
                ["70세 (연기)", "136만원", "1억 1,424만원", "1억 9,584만원", "2억 7,744만원"],
              ]}
            />
            <InfoBox>
              <strong>77세 전에 사망하면 조기수령이 유리</strong>, 82세 이후까지 살면 정상수령이 안정적, <strong>87세 이후까지 건강하다면 연기수령</strong>이 압도적으로 유리합니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-2",
        title: "1.2 나의 상황에 맞는 선택 기준",
        content: (
          <>
            <Heading>조기수령이 유리한 경우</Heading>
            <BulletList items={[
              "건강 상태가 좋지 않거나 가족력에 단명이 있는 경우",
              "은퇴 직후 소득이 전혀 없어 당장 생활비가 필요한 경우",
              "다른 자산을 매도해야 하는데 시장 상황이 좋지 않은 경우",
            ]} />
            <Heading>연기수령이 유리한 경우</Heading>
            <BulletList items={[
              "ISA, 연금저축 등 다른 자산으로 65~70세까지 생활비를 충당할 수 있는 경우",
              "건강하고 장수 가족력이 있는 경우",
              "배우자도 국민연금이 있어 한쪽만 연기하는 전략이 가능한 경우",
            ]} />
            <Heading>탈출지도 활용 팁</Heading>
            <Paragraph>
              탈출지도의 <strong>'국민연금 개시 나이'</strong>를 60세, 65세, 70세로 각각 바꿔서 실행해보세요.
              연도별 남는 금액 흐름이 어떻게 달라지는지 비교하면 최적 시점을 찾을 수 있습니다.
            </Paragraph>
          </>
        ),
      },
      {
        id: "1-3",
        title: "1.3 부부 전략: 한 명은 당기고 한 명은 미루기",
        content: (
          <>
            <Paragraph>
              부부 모두 국민연금이 있다면, <strong>한 명은 조기수령 + 한 명은 연기수령</strong>하는 조합이 효과적입니다.
              조기수령분으로 생활비를 충당하면서, 연기수령으로 장수 리스크를 헤지하는 전략입니다.
            </Paragraph>
            <InfoBox>
              배우자 사망 시 유족연금과 본인연금 중 선택해야 합니다. 둘 다 받을 수 없으므로, 부부 중 연금액이 큰 쪽을 연기수령하면 유족연금도 더 커집니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch2",
    title: "2장. 연금 계좌, 얼마나 넣어야 할까?",
    subsections: [
      {
        id: "2-1",
        title: "2.1 나의 소득에 맞는 최적 납입 전략",
        content: (
          <>
            <Paragraph>
              "무조건 한도까지 넣으세요"라는 조언은 절반만 맞습니다.
              연금저축에 넣은 돈은 <strong>55세까지 사실상 묶인다</strong>는 것을 고려해야 합니다.
            </Paragraph>
            <Heading>소득 구간별 판단 기준</Heading>
            <MdTable
              headers={["연 총소득", "권장 전략", "이유"]}
              rows={[
                ["3,000만원 이하", "연금저축만 400만원", "IRP는 유동성 제약이 너무 큼"],
                ["3,000~5,500만원", "연금저축 600만원 + IRP 300만원", "공제율 16.5%로 효과 극대화"],
                ["5,500만원~1억원", "연금저축 600만원 + IRP 300만원", "공제율 13.2%지만 여전히 유리"],
                ["1억원 초과", "한도 최대 + ISA 병행", "절세 채널 다각화 필요"],
              ]}
            />
            <InfoBox>
              50대 초반이라면 연금저축보다 <strong>ISA에 우선 투자</strong>하는 것도 방법입니다.
              ISA는 5년 만기 후 인출이 자유롭고, 만기 시 IRP로 전환하면 추가 공제까지 받을 수 있습니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "2-2",
        title: "2.2 연금저축 vs IRP, 어디에 먼저 넣을까?",
        content: (
          <>
            <Heading>의사결정 흐름</Heading>
            <BulletList items={[
              "비상자금 6개월분 확보 → 안 됐으면 연금보다 비상자금 먼저",
              "연금저축 600만원 채우기 → 공제 혜택 + 중도인출 가능성 확보",
              "IRP 300만원 추가 → 공제 한도 900만원 채우기",
              "그래도 여유 있으면 → ISA 연 2,000만원까지",
            ]} />
            <Heading>탈출지도에서 주의할 점</Heading>
            <Paragraph>
              탈출지도의 '연금 잔액'에는 <strong>연금저축 + IRP + 퇴직연금을 합산</strong>해서 입력하세요.
              개별 계좌가 아닌 '연금 계좌 전체'로 시뮬레이션합니다.
            </Paragraph>
          </>
        ),
      },
    ],
  },
  {
    id: "ch3",
    title: "3장. 퇴직금, 한번에 받을까 나눠 받을까?",
    subsections: [
      {
        id: "3-1",
        title: "3.1 퇴직금 규모별 최적 전략",
        content: (
          <>
            <Paragraph>
              퇴직금을 일시에 받으면 퇴직소득세가 한 번에 부과되고, 연금으로 나눠 받으면 연금소득세로 전환됩니다.
              핵심은 <strong>퇴직금 규모와 다른 소득의 합산 효과</strong>입니다.
            </Paragraph>
            <Heading>규모별 판단 가이드</Heading>
            <MdTable
              headers={["퇴직금 규모", "추천 방식", "핵심 이유"]}
              rows={[
                ["3,000만원 이하", "일시금 수령", "연금 전환 시 관리 비용이 절세 효과를 상쇄"],
                ["3,000만~1억원", "상황에 따라", "다른 연금소득과 합산 시 종합과세 여부 확인"],
                ["1억원 이상", "연금 수령 고려", "퇴직소득세 절감 효과가 뚜렷 (30~40% 감면)"],
                ["3억원 이상", "연금 수령 강력 추천", "일시금 세금이 수천만원, 연금화 시 크게 절감"],
              ]}
            />
          </>
        ),
      },
      {
        id: "3-2",
        title: "3.2 연금으로 받을 때 함정",
        content: (
          <>
            <Paragraph>
              퇴직연금을 연금으로 전환하면 세금이 줄지만, <strong>다른 연금소득과 합산</strong>된다는 점을 놓치면 안 됩니다.
            </Paragraph>
            <Heading>합산 시 주의 사항</Heading>
            <BulletList items={[
              "사적연금 합계가 연 1,200만원을 넘으면 종합과세 대상",
              "국민연금은 무조건 종합과세 (사적연금 한도에 포함 안 됨)",
              "퇴직연금 + 개인연금 인출을 합쳐서 1,200만원 이하로 관리하는 것이 핵심",
            ]} />
            <Heading>탈출지도 활용법</Heading>
            <Paragraph>
              탈출지도에 퇴직연금 적립금을 입력하면, 매년 얼마씩 인출할지 자동 계산됩니다.
              '연금소진 모드'를 ON으로 설정하면 시뮬레이션 종료 시점까지 균등 소진됩니다.
            </Paragraph>
          </>
        ),
      },
    ],
  },
  {
    id: "ch4",
    title: "4장. ISA 만기가 다가올 때 해야 할 3가지",
    subsections: [
      {
        id: "4-1",
        title: "4.1 만기 전 체크리스트",
        content: (
          <>
            <CheckList items={[
              "ISA 만기일을 캘린더에 등록했는가?",
              "IRP 또는 연금저축 계좌가 개설되어 있는가?",
              "만기 금액의 10% (최대 300만원) 추가 공제 계획을 세웠는가?",
              "기존 연금계좌 납입액과 합산하여 공제 한도를 초과하지 않는지 확인했는가?",
              "ISA 재가입 계획을 세웠는가? (만기 후 바로 새 ISA 개설 가능)",
            ]} />
          </>
        ),
      },
      {
        id: "4-2",
        title: "4.2 전환하면 안 되는 경우",
        content: (
          <>
            <Paragraph>
              ISA → IRP 전환이 항상 유리한 것은 아닙니다. 아래에 해당하면 전환을 재고하세요.
            </Paragraph>
            <BulletList items={[
              "55세까지 5년 이내: IRP에 넣으면 곧 연금으로 받아야 하므로 복리 효과가 미미",
              "당장 큰 지출 예정: 전환 후 IRP에서 중도인출이 매우 어려움",
              "이미 연금계좌 잔액이 충분: 추가 공제보다 유동성 확보가 더 중요할 수 있음",
            ]} />
            <Heading>탈출지도에서 ISA 반영하기</Heading>
            <Paragraph>
              ISA 잔액은 탈출지도의 <strong>'ISA 잔액'</strong> 항목에 입력하세요.
              만기 후 IRP 전환 예정이면 '연금 잔액'에 합산하고, 유지할 예정이면 ISA에 그대로 두세요.
            </Paragraph>
          </>
        ),
      },
    ],
  },
  {
    id: "ch5",
    title: "5장. 내 자산, 몇 살까지 버틸 수 있을까?",
    subsections: [
      {
        id: "5-1",
        title: "5.1 자산 고갈 위험 신호 5가지",
        content: (
          <>
            <Paragraph>
              탈출지도를 돌렸을 때 아래 신호가 나타나면 즉시 전략을 수정해야 합니다.
            </Paragraph>
            <BulletList items={[
              "60대 중반 이전에 '적자 전환' 표시 → 긴급: 생활비 즉시 조정",
              "ISA 잔액이 60세 이전에 0원 → 초기 인출 속도가 너무 빠름",
              "연금 개시 전(55세 이전)에 자산의 50% 이상 소진 → 은퇴 시기 재검토",
              "남는 금액 합계가 마이너스 → 수입과 지출 구조 자체를 재설계",
              "70대 이후 잔여 자산이 생활비 3년분 미만 → 장수 리스크 노출",
            ]} />
          </>
        ),
      },
      {
        id: "5-2",
        title: "5.2 탈출지도 결과 해석법",
        content: (
          <>
            <Heading>Action Plan 패널 읽는 법</Heading>
            <Paragraph>
              시뮬레이션을 실행하면 우측에 Action Plan이 나타납니다. 상단 색상이 핵심입니다.
            </Paragraph>
            <MdTable
              headers={["색상", "의미", "대응"]}
              rows={[
                ["초록", "시뮬레이션 기간 내 자산 유지", "현재 계획 유지, 여유분은 증여/여가 활용"],
                ["빨강", "특정 나이에 적자 전환", "하단 시나리오 카드에서 개선 전략 확인"],
              ]}
            />
            <Heading>연도별 테이블 핵심 포인트</Heading>
            <BulletList items={[
              "'남는 금액' 열이 마이너스로 바뀌는 첫 해가 핵심 전환점",
              "ISA/연금/해외주식 잔액이 0이 되는 순서를 확인 → 자산 고갈 패턴 파악",
              "건보료가 급등하는 해가 있는지 확인 → 소득 구조 변경 필요 신호",
            ]} />
          </>
        ),
      },
      {
        id: "5-3",
        title: "5.3 적자 전환 시 대응 우선순위",
        content: (
          <>
            <Paragraph>
              탈출지도에서 적자가 나왔다고 당황하지 마세요. 아래 순서대로 탈출지도 값을 조정하며 효과를 비교해보세요.
            </Paragraph>
            <Heading>효과가 큰 순서대로</Heading>
            <MdTable
              headers={["순위", "전략", "탈출지도 조정 방법", "기대 효과"]}
              rows={[
                ["1", "월 생활비 50만원 절감", "75세 이전/이후 생활비 각각 50만원 감소", "30년간 약 2억원 절약"],
                ["2", "국민연금 연기수령", "개시 나이를 70세로 변경", "월 수령액 36% 증가"],
                ["3", "수익률 1%p 상향", "수익률 항목 조정", "30년 후 자산 15~20% 증가"],
                ["4", "은퇴 시기 2년 연기", "은퇴 시작 나이 +2", "추가 저축 + 인출 기간 단축"],
              ]}
            />
            <InfoBox>
              <strong>1~2개만 조합해도 적자를 해소할 수 있는 경우가 많습니다.</strong> 탈출지도에서 직접 확인해보세요.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch6",
    title: "6장. 은퇴 자산을 3개 통장으로 나누는 실전법",
    subsections: [
      {
        id: "6-1",
        title: "6.1 나의 생활비로 버킷 사이즈 결정하기",
        content: (
          <>
            <Paragraph>
              버킷 전략의 핵심은 <strong>"내 월 생활비가 얼마인가"</strong>에서 시작합니다.
              탈출지도에 입력한 생활비를 기준으로 각 버킷을 설계하세요.
            </Paragraph>
            <Heading>월 생활비 400만원 기준 예시</Heading>
            <MdTable
              headers={["통장", "보관 기간", "필요 금액", "어디에 둘까"]}
              rows={[
                ["생활비 통장", "1~2년분", "9,600만원~1억 9,200만원", "예금, MMF"],
                ["중기 통장", "3~7년분", "1억 7,000만~3억 4,000만원", "채권형 펀드, ISA"],
                ["성장 통장", "8년 이상", "나머지 전액", "해외 ETF, 연금저축"],
              ]}
            />
          </>
        ),
      },
      {
        id: "6-2",
        title: "6.2 탈출지도 계좌와 버킷 연결",
        content: (
          <>
            <Paragraph>
              탈출지도의 각 자산 항목은 버킷과 자연스럽게 대응됩니다.
            </Paragraph>
            <MdTable
              headers={["탈출지도 항목", "버킷", "역할"]}
              rows={[
                ["예적금 잔액", "생활비 통장", "당장 쓸 돈, 가장 먼저 소진"],
                ["ISA 잔액", "중기 통장", "비과세 혜택 활용, 중기 인출"],
                ["연금 잔액", "성장 통장", "세금 이연 효과, 장기 운용"],
                ["해외주식 잔액", "성장 통장", "배당 + 성장, 가장 나중에 인출"],
              ]}
            />
            <InfoBox>
              탈출지도는 자동으로 예적금 → ISA → 연금 순서로 인출합니다. 이 순서가 바로 버킷 전략의 핵심입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "6-3",
        title: "6.3 매년 리밸런싱 판단 기준",
        content: (
          <>
            <CheckList items={[
              "생활비 통장(예적금)에 1년분 이상 남아있는가?",
              "ISA에서 올해 인출할 금액이 비과세 한도 이내인가?",
              "연금 인출액이 연 1,200만원을 넘지 않는가?",
              "해외주식 배당이 예상대로 들어오고 있는가?",
              "탈출지도를 올해 실적 기준으로 다시 돌려보았는가?",
            ]} />
          </>
        ),
      },
    ],
  },
  {
    id: "ch7",
    title: "7장. 은퇴 후 건보료 폭탄을 피하는 법",
    subsections: [
      {
        id: "7-1",
        title: "7.1 퇴직 직후 건보료가 급등하는 이유",
        content: (
          <>
            <Paragraph>
              직장을 다닐 때는 회사가 절반을 내주지만, 퇴직하면 <strong>지역가입자로 전환</strong>되면서 소득 + 재산 기준으로 건보료가 산정됩니다.
              특히 퇴직금, 금융소득이 한꺼번에 잡히면 건보료가 월 수십만원 이상 나올 수 있습니다.
            </Paragraph>
          </>
        ),
      },
      {
        id: "7-2",
        title: "7.2 소득 종류별 건보료 영향",
        content: (
          <>
            <Heading>건보료에 잡히는 소득 vs 안 잡히는 소득</Heading>
            <MdTable
              headers={["소득 종류", "건보료 부과", "비고"]}
              rows={[
                ["국민연금", "전액 부과", "피할 수 없음"],
                ["개인연금 (1,200만원 이하)", "미부과", "분리과세 선택 시"],
                ["개인연금 (1,200만원 초과)", "초과분 부과", "종합과세 전환"],
                ["ISA 인출", "미부과", "비과세/분리과세 상품"],
                ["해외주식 배당", "2,000만원 초과 시 부과", "금융소득종합과세 대상"],
                ["예금 이자", "2,000만원 초과 시 부과", "금융소득종합과세 대상"],
                ["주택연금", "미부과", "비과세 소득"],
              ]}
            />
            <InfoBox>
              탈출지도는 위 규칙을 자동 반영하여 매년 건보료를 계산합니다. 연금 인출액을 1,200만원 이하로 조절하면 건보료를 크게 줄일 수 있습니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "7-3",
        title: "7.3 건보료 절감 실전 전략",
        content: (
          <>
            <BulletList items={[
              "퇴직 직후 36개월간 '임의계속가입' 신청 → 직장 건보료 수준 유지 가능",
              "배우자가 직장가입자면 피부양자 등재 → 건보료 0원 (소득/재산 요건 충족 시)",
              "금융소득을 부부 각각 2,000만원 이하로 분산 → 종합과세 회피",
              "연금 인출을 연 1,200만원 이하로 관리 → 분리과세로 건보료 미부과",
            ]} />
          </>
        ),
      },
    ],
  },
  {
    id: "ch8",
    title: "8장. 자산이 남을 때 생각해야 할 것들",
    subsections: [
      {
        id: "8-1",
        title: "8.1 탈출지도에서 잔여자산이 클 때",
        content: (
          <>
            <Paragraph>
              시뮬레이션 결과 90세에도 자산이 많이 남는다면, 두 가지 선택지를 고민해야 합니다.
            </Paragraph>
            <Heading>선택지 비교</Heading>
            <MdTable
              headers={["선택", "장점", "고려사항"]}
              rows={[
                ["더 풍요롭게 쓰기", "삶의 질 향상, 건강할 때 여행/취미 투자", "예상보다 오래 살 리스크"],
                ["자녀에게 증여", "증여세 절감 (장기 분산), 자녀 도움", "증여 후 내 생활비 부족 리스크"],
                ["혼합 전략", "생활비 상향 + 소액 증여 병행", "가장 균형잡힌 접근"],
              ]}
            />
          </>
        ),
      },
      {
        id: "8-2",
        title: "8.2 증여 vs 상속 의사결정 가이드",
        content: (
          <>
            <Heading>증여가 유리한 경우</Heading>
            <BulletList items={[
              "자산이 10억원 이상으로 상속세 부담이 큰 경우",
              "10년 이상의 시간적 여유가 있는 경우 (10년 단위 증여 면제)",
              "자녀가 주택 구매 등 목돈이 필요한 시점",
            ]} />
            <Heading>상속이 유리한 경우</Heading>
            <BulletList items={[
              "자산 규모가 상속공제 범위 내 (배우자 있으면 최대 30억원까지 공제)",
              "증여 후 10년 이내 사망 시 증여분이 상속에 합산되는 리스크",
              "노후 생활비가 빠듯한 경우 → 증여하면 되돌릴 수 없음",
            ]} />
            <InfoBox>
              탈출지도에서 잔여자산이 5억원 이상이면, 생활비를 월 50만원 올려서 다시 돌려보세요. 삶의 질을 높이면서도 자산이 유지되는 균형점을 찾을 수 있습니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch9",
    title: "9장. 은퇴 후 세금, 이것만 알면 됩니다",
    subsections: [
      {
        id: "9-1",
        title: "9.1 은퇴자가 빠지기 쉬운 소득 합산 함정",
        content: (
          <>
            <Paragraph>
              은퇴하면 세금이 줄어들 거라 생각하지만, <strong>여러 소득이 합산</strong>되면 오히려 세율이 올라갈 수 있습니다.
            </Paragraph>
            <Heading>합산되는 소득 예시</Heading>
            <Paragraph>
              국민연금 월 150만원(연 1,800만원) + 개인연금 연 1,500만원 + 임대소득 연 1,000만원 = <strong>합산 4,300만원 → 세율 15% 구간</strong>
            </Paragraph>
            <InfoBox>
              개인연금을 1,200만원 이하로 줄이면 분리과세(3.3~5.5%)로 빠지면서, 합산 소득이 2,800만원으로 줄어 세율이 6% 구간으로 내려갑니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "9-2",
        title: "9.2 금융소득 2,000만원 벽 관리법",
        content: (
          <>
            <Paragraph>
              금융소득(이자+배당)이 연 2,000만원을 넘으면 <strong>종합과세</strong>로 전환됩니다.
              이 벽을 넘는 순간 세율이 점프하고, 건보료도 함께 올라갑니다.
            </Paragraph>
            <Heading>실전 관리 전략</Heading>
            <BulletList items={[
              "부부 각각 명의로 금융자산 분산 → 각자 2,000만원까지 분리과세",
              "배당주보다 성장주 ETF 활용 → 배당소득 자체를 줄임",
              "해외주식 양도차익은 금융소득에 불포함 → 매도 차익 활용",
              "ISA 계좌 활용 → 비과세/분리과세로 금융소득 합산 회피",
            ]} />
            <Heading>탈출지도가 반영하는 것</Heading>
            <Paragraph>
              탈출지도는 해외주식 배당에 15.4% 원천징수를 자동 적용하고, 금융소득 규모에 따른 건보료 변동도 반영합니다.
              배당률이 높은 해외주식 비중을 조절하면서 시뮬레이션해보세요.
            </Paragraph>
          </>
        ),
      },
    ],
  },
];

interface EBook2Props {
  onNavigate?: (page: string) => void;
}

export function EBook2({ onNavigate }: EBook2Props) {
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
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <BookOpen size={22} strokeWidth={2} color="var(--accent-blue)" />
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)", margin: 0 }}>
            실전 전략 가이드
          </h1>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          탈출지도 활용법과 상황별 의사결정을 위한 실전 가이드
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {chapters.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => goToChapter(idx)}
            style={{
              padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
              fontWeight: currentChapter === idx ? 700 : 500,
              background: currentChapter === idx ? "var(--accent-blue)" : "var(--bg-secondary)",
              color: currentChapter === idx ? "#fff" : "var(--text-secondary)",
              whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            {idx + 1}장
          </button>
        ))}
      </div>

      <div style={{ ...card, marginBottom: 16, background: "var(--accent-blue)", border: "none", color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>
          CHAPTER {currentChapter + 1} / {chapters.length}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{chapter.title}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {chapter.subsections.map((sub) => {
          const isExpanded = expandedSections.has(sub.id);
          return (
            <div key={sub.id} style={card}>
              <div onClick={() => toggleSection(sub.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{sub.title}</h3>
                {isExpanded ? <ChevronUp size={18} color="var(--text-tertiary)" /> : <ChevronDown size={18} color="var(--text-tertiary)" />}
              </div>
              {isExpanded && <div style={{ marginTop: 16 }}>{sub.content}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button
          onClick={() => currentChapter > 0 && goToChapter(currentChapter - 1)}
          disabled={currentChapter === 0}
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-primary)", background: "var(--bg-primary)", color: currentChapter === 0 ? "var(--text-disabled)" : "var(--text-primary)", cursor: currentChapter === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
        >
          이전 장
        </button>
        <button
          onClick={() => currentChapter < chapters.length - 1 && goToChapter(currentChapter + 1)}
          disabled={currentChapter === chapters.length - 1}
          style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: currentChapter === chapters.length - 1 ? "var(--bg-tertiary)" : "var(--accent-blue)", color: currentChapter === chapters.length - 1 ? "var(--text-disabled)" : "#fff", cursor: currentChapter === chapters.length - 1 ? "default" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
        >
          다음 장
        </button>
      </div>
    </div>
  );
}
