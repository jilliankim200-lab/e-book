import React, { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calculator } from "lucide-react";

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
    {/* PC: 테이블 */}
    <div className="md-table-pc" style={{ overflowX: "auto", margin: "12px 0" }}>
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
    {/* 모바일: 카드 */}
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

const InfoBox = ({ children }: { children: React.ReactNode }) => {
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
            {checked[i] ? "✓" : ""}
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
    title: "1장. 탈출지도 완전 정복",
    subsections: [
      {
        id: "1-1",
        title: "1.1 처음 시작하기: 입력 항목 완벽 가이드",
        content: (
          <>
            <Paragraph>
              탈출지도를 처음 열면 입력 항목이 많아 막막하게 느껴질 수 있습니다. 하지만 걱정하지 마세요. 모든 항목에는 확인 경로가 있고, 당장 모르는 값은 건너뛰어도 괜찮습니다. 이 섹션에서는 각 항목을 어디서 찾고, 모를 때 어떻게 대처하는지 단계별로 안내합니다.
            </Paragraph>
            <Heading>기본 정보: 계산의 시간축 설정</Heading>
            <MdTable
              headers={["입력 항목", "어디서 확인하나요?", "모를 때 이렇게 하세요"]}
              rows={[
                ["현재 나이", "주민등록증 생년월일 기준 만 나이", "올해 연도 - 출생 연도로 계산"],
                ["은퇴 예정 나이", "사내 인사규정 또는 근로계약서의 정년 조항", "일반적으로 60세, 공무원은 60~65세"],
                ["목표 수명", "부모님 수명, 가족 병력을 참고", "보수적으로 95세를 권장합니다"],
                ["물가상승률", "한국은행 물가안정목표(2%)를 기준으로", "2.5%가 무난한 기본값입니다"],
              ]}
            />
            <Paragraph>
              기본 정보에서 '은퇴 나이'와 '목표 수명'의 차이가 자산 인출 기간을 결정합니다. 예를 들어 60세 은퇴, 95세 목표 수명이면 35년간 자산을 꺼내 쓰게 됩니다. 이 기간이 길수록 더 많은 준비가 필요합니다.
            </Paragraph>
            <Heading>생활비: 가장 중요한 입력값</Heading>
            <Paragraph>
              생활비는 결과에 가장 큰 영향을 미치는 변수입니다. 정확하게 파악하는 것이 핵심입니다.
            </Paragraph>
            <BulletList items={[
              "카드사 앱에서 최근 6개월 결제 내역을 다운로드하여 월 평균을 구하세요",
              "현금 지출(시장, 경조사비 등)은 별도로 월 20~30만원 정도 가산하세요",
              "주거 관련 고정비(관리비, 통신비, 보험료)를 빠뜨리지 않도록 주의하세요",
              "자녀 교육비처럼 은퇴 후 사라지는 비용은 제외해도 됩니다",
              "여행, 취미 등 은퇴 후 늘어날 비용은 별도로 추가하세요",
            ]} />
            <Heading>국민연금: NPS에서 정확히 확인하기</Heading>
            <Paragraph>
              국민연금공단의 '내연금 알아보기' 서비스(nps.or.kr)에 공동인증서로 로그인하면, 현재까지 납부 이력 기반의 예상 수령액을 확인할 수 있습니다. '예상연금 조회' 메뉴에서 60세(조기), 65세(정상), 최대 70세(연기) 시점별 수령액이 모두 표시됩니다. 이 숫자를 메모한 뒤 탈출지도에 입력하세요.
            </Paragraph>
            <Heading>퇴직연금: DB형과 DC형 확인법이 다릅니다</Heading>
            <MdTable
              headers={["유형", "확인 방법", "모를 때"]}
              rows={[
                ["DB형 (확정급여)", "인사팀에 '예상 퇴직금' 문의", "연봉 x 근속연수 / 12로 추정"],
                ["DC형 (확정기여)", "퇴직연금 운용사 앱에서 적립금 조회", "매월 급여명세서의 '퇴직연금 사용자부담금' 확인"],
                ["IRP (개인형)", "해당 금융사 앱에서 잔액 확인", "통합연금포털(pension.kfpa.or.kr)에서 조회"],
              ]}
            />
            <Heading>개인연금, ISA, 해외주식, 예적금</Heading>
            <MdTable
              headers={["자산 유형", "확인 방법", "입력 팁"]}
              rows={[
                ["개인연금(연금저축)", "금융사 앱 > 연금저축 계좌 잔액", "펀드형이면 '평가금액' 기준으로 입력"],
                ["ISA", "증권사 앱 > ISA 계좌 잔고", "만기 전이라도 현재 평가금액 입력"],
                ["해외주식", "증권사 앱 > 해외주식 잔고 > 원화 환산", "환율 변동이 있으므로 조회 당일 기준으로"],
                ["예적금", "은행 앱에서 모든 계좌 잔액 합산", "적금은 만기 시 수령 예상액이 아닌 현재 적립액"],
              ]}
            />
            <InfoBox>
              <strong>실전 조언:</strong> 모든 항목을 완벽하게 채울 필요가 없습니다. 확실한 값만 먼저 넣고 계산을 돌린 뒤, 나머지를 하나씩 확인하여 수정하세요. 탈출지도는 몇 번이든 다시 실행할 수 있습니다. 처음에 80% 정확도로 시작하고 반복하며 100%에 가까워지는 것이 올바른 접근법입니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-2",
        title: "1.2 결과 화면 200% 활용법",
        content: (
          <>
            <Paragraph>
              결과 화면에는 세 가지 핵심 영역이 있습니다. 결과 요약 패널, 연도별 상세 테이블, 그리고 다운로드 기능입니다. 이 세 가지를 제대로 읽을 줄 알면 탈출지도의 가치를 100% 끌어낼 수 있습니다.
            </Paragraph>
            <Heading>결과 요약 패널: 신호등처럼 읽기</Heading>
            <Paragraph>
              '계산하기' 버튼을 누르면 가장 먼저 눈에 들어오는 것이 결과 요약 패널입니다. 색상이 모든 것을 말해줍니다.
            </Paragraph>
            <MdTable
              headers={["색상", "상태", "의미", "다음 행동"]}
              rows={[
                ["초록", "안정", "목표 수명까지 자산이 유지됩니다", "현재 전략을 유지하되, 연 1회 리뷰하세요"],
                ["빨강", "위험", "목표 수명 전에 자산이 고갈됩니다", "생활비, 수익률, 연금 시기 등을 조정하세요"],
              ]}
            />
            <Paragraph>
              중요한 것은 초록색이 나왔다고 안심하면 안 된다는 점입니다. 물가상승률을 0.5%만 올리거나, 수익률을 1% 낮춰서 다시 돌려보세요. '최악의 시나리오'에서도 초록이 유지되는지 확인해야 진정한 안정입니다.
            </Paragraph>
            <Heading>연도별 테이블: 핵심 열 4가지</Heading>
            <Paragraph>
              연도별 테이블에는 많은 열이 있지만, 처음에는 아래 4가지만 집중하세요.
            </Paragraph>
            <BulletList items={[
              "잔여 자산: 해당 연도 말 기준 총 금융자산입니다. 이 숫자가 0 이하로 떨어지는 시점이 '자산 고갈 연령'입니다",
              "연간 수입 합계: 국민연금 + 퇴직연금 + 개인연금 + 기타 수입을 모두 합친 금액입니다",
              "연간 지출 합계: 생활비에 물가상승률이 반영된 금액과 세금, 건보료 등이 포함됩니다",
              "남는 금액: 수입에서 지출을 뺀 결과입니다. 이 값이 마이너스인 해부터 보유 자산에서 차액을 인출합니다",
            ]} />
            <Paragraph>
              테이블을 스크롤하면서 남는 금액 열이 마이너스로 전환되는 시점과, 잔여 자산이 급격히 줄어드는 구간을 찾으세요. 이 두 지점이 여러분의 재무 취약 구간입니다.
            </Paragraph>
            <Heading>다운로드 기능으로 비교 분석하기</Heading>
            <BulletList items={[
              "결과 화면 하단의 다운로드 버튼으로 연도별 데이터를 CSV/엑셀로 내려받을 수 있습니다",
              "계산을 돌릴 때마다 파일을 저장하세요. 파일명 예시: '시뮬레이션_기본_20260321.csv'",
              "변수를 바꾼 결과도 저장하세요. 예시: '시뮬레이션_생활비350_20260321.csv'",
              "두 파일을 엑셀에서 나란히 열면 어떤 변수가 얼마나 큰 차이를 만드는지 한눈에 비교됩니다",
              "가족과 공유하거나 재무상담 시 가져가면 상담 효율이 크게 높아집니다",
            ]} />
            <InfoBox>
              <strong>활용 팁:</strong> 결과를 최소 3개 버전(현재 그대로, 낙관 시나리오, 비관 시나리오)으로 저장해 두세요. 비관 시나리오에서도 자산이 유지된다면 높은 확신을 가질 수 있습니다. 낙관 시나리오만 보고 계획을 세우면 현실에서 어긋날 위험이 큽니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "1-3",
        title: "1.3 탈출지도 반복 실행 기술",
        content: (
          <>
            <Paragraph>
              탈출지도를 한 번만 돌리면 '현재 상태의 스냅샷'만 얻게 됩니다. 진짜 가치는 여러 번 반복 실행하며 변수의 영향력을 체감할 때 나타납니다. 이 섹션에서는 효과적인 반복 실행 방법을 알려드립니다.
            </Paragraph>
            <Heading>1단계: 연령별 탈출 시나리오로 감 잡기</Heading>
            <Paragraph>
              탈출지도에는 미리 준비된 연령별 탈출 시나리오가 있습니다. 본인 데이터를 입력하기 전에 시나리오를 먼저 실행해 보세요.
            </Paragraph>
            <BulletList items={[
              "연령별 탈출 시나리오의 결과를 보면서 '이런 조건이면 이런 결과가 나오는구나'라는 감을 잡으세요",
              "시나리오의 생활비를 50만원 올리거나 내려서 다시 돌려보세요. 변화량을 체감할 수 있습니다",
              "시나리오에서 은퇴 나이를 바꿔보세요. 3년 차이가 결과에 얼마나 영향을 주는지 확인합니다",
              "최소 3번은 시나리오로 연습한 후에 본인 데이터를 입력하는 것을 권장합니다",
            ]} />
            <Heading>2단계: 변수 하나씩 바꿔 민감도 분석</Heading>
            <Paragraph>
              본인 데이터로 기준선(Baseline)을 만든 후, 변수를 하나씩만 바꿔가며 영향력을 측정하세요. 동시에 여러 변수를 바꾸면 어떤 변수가 영향을 줬는지 분리할 수 없습니다.
            </Paragraph>
            <MdTable
              headers={["변경할 변수", "변경 폭", "확인할 포인트"]}
              rows={[
                ["월 생활비", "+50만원 / -50만원", "자산 고갈 시점이 몇 년 이동하는지"],
                ["기대수익률", "+1%p / -1%p", "30년 복리 효과가 얼마나 달라지는지"],
                ["은퇴 나이", "+2년 / -2년", "추가 근로소득과 인출 기간 단축의 복합 효과"],
                ["국민연금 수령 시기", "60세 / 65세 / 68세", "조기감액 vs 연기증액의 장기 영향"],
                ["물가상승률", "+0.5% / -0.5%", "30년 누적 시 생활비가 얼마나 달라지는지"],
              ]}
            />
            <Paragraph>
              민감도 분석의 결과를 간단히 표로 정리해 보세요. "생활비 50만원 = 자산 고갈 시점 4년 차이", "수익률 1%p = 95세 잔여자산 1.5억 차이"처럼 요약하면, 어떤 변수에 집중해야 할지 명확해집니다.
            </Paragraph>
            <Heading>3단계: 부부 모드로 확장하기</Heading>
            <Paragraph>
              배우자가 있다면 부부 모드를 활성화하세요. 부부 모드에서는 배우자의 국민연금, 퇴직연금, 개인 자산을 별도로 입력할 수 있고, 두 사람의 연금 수령 시기를 다르게 설정할 수 있습니다.
            </Paragraph>
            <BulletList items={[
              "본인의 국민연금 수령 시기와 배우자의 수령 시기를 2~3년 차이로 설정해 보세요",
              "한 사람이 먼저 연금을 받기 시작하고, 이후 다른 사람의 연금이 합산되는 구조가 현금흐름 안정에 유리합니다",
              "부부 중 한 명이 직장을 유지하는 동안 다른 한 명을 건보 피부양자로 등록하면 건보료를 절약할 수 있습니다",
              "부부 모드에서는 두 사람의 자산과 연금이 합산되므로, 단독 계산보다 정확한 결과를 얻을 수 있습니다",
            ]} />
            <InfoBox>
              <strong>반복 실행의 핵심:</strong> 한 번에 완벽한 결과를 기대하지 마세요. 3~5회 반복하면서 변수의 영향력을 파악하고, 가장 효과적인 조합을 찾아가는 과정 자체가 은퇴 설계입니다. 매번 결과를 다운로드하여 기록으로 남기세요.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  {
    id: "ch2",
    title: "2장. 나의 탈출지도 워크북",
    subsections: [
      {
        id: "2-1",
        title: "2.1 계산 전 준비 체크리스트",
        content: (
          <>
            <Paragraph>
              탈출지도에 정확한 값을 넣으려면 사전 준비가 필수입니다. 아래 체크리스트를 하나씩 확인하며, 계산에 필요한 정보를 모아 보세요. 전체 소요 시간은 약 40~50분입니다.
            </Paragraph>
            <Heading>국민연금 예상액 확인</Heading>
            <CheckList items={[
              "국민연금공단 홈페이지(nps.or.kr) 접속 후 '내연금 알아보기' 클릭",
              "공동인증서(구 공인인증서) 또는 간편인증으로 로그인",
              "'예상연금 조회'에서 60세/65세/68세 시점별 예상 수령액 메모",
              "배우자가 있다면 배우자의 예상 수령액도 동일 방법으로 확인",
            ]} />
            <Heading>퇴직연금 잔액 확인</Heading>
            <CheckList items={[
              "DB형: 인사팀에 '현재 기준 예상 퇴직금' 문의 (또는 연봉 x 근속연수 / 12로 추정)",
              "DC형: 퇴직연금 운용사(증권사/은행) 앱에서 적립금 잔액 조회",
              "IRP: 해당 금융사 앱에서 잔액 확인 (또는 통합연금포털 pension.kfpa.or.kr)",
              "퇴직연금 유형(DB/DC)을 모르면 급여명세서 또는 인사팀에서 확인",
            ]} />
            <Heading>각 계좌 잔액 파악</Heading>
            <CheckList items={[
              "예적금: 모든 은행 앱에서 잔액 조회 후 합산 (CMA 포함)",
              "연금저축: 금융사 앱에서 평가금액 확인 (적립금이 아닌 현재 평가액 기준)",
              "ISA: 증권사 앱에서 ISA 계좌 평가금액 확인",
              "해외주식: 증권사 앱에서 해외주식 잔고를 원화 환산 금액으로 확인",
              "국내주식/펀드: 증권사 앱에서 평가금액 확인 (해외주식과 별도로 기록)",
            ]} />
            <Heading>생활비 파악</Heading>
            <CheckList items={[
              "카드사 앱에서 최근 6개월 결제 내역 다운로드",
              "월 평균 카드 사용액 계산",
              "현금 지출(시장, 경조사 등) 월 평균 추가",
              "고정비(관리비, 통신비, 보험료) 누락 여부 확인",
              "은퇴 후 사라질 비용(출퇴근 교통비, 자녀 학비 등)과 늘어날 비용(여가, 의료) 구분",
            ]} />
            <InfoBox>
              <strong>준비 총 소요 시간: 약 40~50분.</strong> 이 시간 투자가 향후 30년 은퇴 생활의 설계도를 만듭니다. 모든 항목을 완벽하게 모을 필요는 없습니다. 확인이 어려운 항목은 빈칸으로 두고, 나중에 확인한 후 탈출지도를 다시 실행하세요.
            </InfoBox>
          </>
        ),
      },
      {
        id: "2-2",
        title: "2.2 4단계 계산 설계법",
        content: (
          <>
            <Paragraph>
              한 번의 계산으로 완벽한 답을 얻을 수 없습니다. 아래 4단계를 순서대로 실행하면, 어떤 변수가 나의 은퇴에 가장 큰 영향을 미치는지 체계적으로 파악할 수 있습니다. 각 단계에서 결과를 다운로드하여 기록으로 남기세요.
            </Paragraph>
            <Heading>1단계: 현재 상태 그대로 (기준선 만들기)</Heading>
            <BulletList items={[
              "준비 체크리스트에서 파악한 값을 모두 입력합니다",
              "실행 후 결과를 '기준선_날짜.csv'로 다운로드하여 저장합니다",
              "결과 요약 색상, 자산 고갈 시점, 95세 잔여 자산을 기록하세요",
              "이 결과가 이후 모든 비교의 출발점이 됩니다",
            ]} />
            <MdTable
              headers={["기록 항목", "나의 결과"]}
              rows={[
                ["결과 요약 색상", "_____ (초록/빨강)"],
                ["자산 고갈 시점", "_____세"],
                ["95세 잔여 자산", "_____원"],
                ["가장 큰 적자 발생 연도", "_____세, _____만원 부족"],
              ]}
            />
            <Heading>2단계: 생활비 +/-50만원 민감도 분석</Heading>
            <BulletList items={[
              "기준선에서 월 생활비만 50만원 줄여서 실행합니다. 결과를 기록합니다",
              "다시 기준선에서 월 생활비만 50만원 늘려서 실행합니다. 결과를 기록합니다",
              "생활비 50만원의 변화가 자산 고갈 시점을 몇 년 바꾸는지 비교하세요",
              "이 결과로 '생활비 1만원당 자산 수명 변화량'의 감을 잡을 수 있습니다",
            ]} />
            <MdTable
              headers={["시나리오", "자산 고갈 시점", "기준선 대비 변화"]}
              rows={[
                ["생활비 -50만원", "_____세", "+_____년"],
                ["기준선 (현재 생활비)", "_____세", "기준"],
                ["생활비 +50만원", "_____세", "-_____년"],
              ]}
            />
            <Heading>3단계: 국민연금 수령 시기 비교</Heading>
            <BulletList items={[
              "국민연금 수령 시기를 60세(조기수령, 약 30% 감액)로 설정하여 실행합니다",
              "65세(정상 수령)로 설정하여 실행합니다 (기준선과 동일할 수 있음)",
              "68세(연기 수령, 약 21.6% 증액)로 설정하여 실행합니다",
              "연기 수령 시 공백기에 자산이 감당 가능한지 반드시 확인하세요",
              "배우자가 있다면 부부 각각의 수령 시기를 다르게 조합해 보세요",
            ]} />
            <MdTable
              headers={["수령 시기", "월 수령액(예시)", "자산 고갈 시점"]}
              rows={[
                ["60세 (조기)", "약 _____만원", "_____세"],
                ["65세 (정상)", "약 _____만원", "_____세"],
                ["68세 (연기)", "약 _____만원", "_____세"],
              ]}
            />
            <Heading>4단계: 수익률 +/-1%p 스트레스 테스트</Heading>
            <BulletList items={[
              "기대수익률을 전체적으로 1%p 올린 시나리오를 실행합니다 (낙관)",
              "기대수익률을 전체적으로 1%p 내린 시나리오를 실행합니다 (비관)",
              "비관 시나리오에서도 안전한지가 핵심입니다. 낙관 시나리오는 참고용입니다",
              "수익률 1%p의 차이가 30년간 복리로 얼마나 큰 영향을 미치는지 직접 확인하세요",
            ]} />
            <MdTable
              headers={["시나리오", "95세 잔여 자산", "기준선 대비 변화"]}
              rows={[
                ["수익률 +1%p (낙관)", "_____원", "+_____원"],
                ["기준선 (현재 수익률)", "_____원", "기준"],
                ["수익률 -1%p (비관)", "_____원", "-_____원"],
              ]}
            />
            <InfoBox>
              <strong>4단계 완료 후:</strong> 이 네 단계를 마치면 총 8~10번의 결과가 모입니다. 이 데이터를 보면 "내 은퇴에 가장 큰 영향을 미치는 변수"가 무엇인지 명확해집니다. 대부분의 경우 생활비와 국민연금 수령 시기가 가장 큰 영향력을 가집니다.
            </InfoBox>
          </>
        ),
      },
      {
        id: "2-3",
        title: "2.3 연 1회 리뷰 체크리스트",
        content: (
          <>
            <Paragraph>
              탈출지도는 한 번 돌리고 끝나는 것이 아닙니다. 매년 1월, 약 30분만 투자하여 지난 1년간의 변화를 반영하세요. 1년간 시장 상황, 생활비 패턴, 연금 제도 등이 바뀌므로, 업데이트하지 않은 결과는 점차 현실과 괴리가 생깁니다.
            </Paragraph>
            <Heading>매년 1월에 점검할 항목</Heading>
            <CheckList items={[
              "모든 금융 계좌의 1월 1일 기준 잔액 조회 및 기록",
              "지난 1년간 실제 월평균 생활비 재계산 (카드 앱 연간 내역 활용)",
              "국민연금 예상 수령액 변동 확인 (NPS 사이트에서 재조회)",
              "퇴직연금(DB/DC/IRP) 적립금 변동 확인",
              "건강보험료 변동 확인 (1월 고지서 기준)",
              "지난 1년간 추가 저축, 대출 상환, 목돈 지출 등 특이사항 반영",
              "연금 제도 변경사항 확인 (수령 나이, 감액률 등 법 개정 여부)",
            ]} />
            <Heading>탈출지도에 업데이트할 값</Heading>
            <MdTable
              headers={["항목", "업데이트 방법", "주의사항"]}
              rows={[
                ["현재 나이", "+1세", "만 나이 기준으로 정확히 입력"],
                ["각 계좌 잔액", "1월 1일 기준 실제 잔액으로 교체", "수익이든 손실이든 있는 그대로 반영"],
                ["월 생활비", "지난해 실제 월평균", "일회성 큰 지출(결혼, 이사 등)은 제외하고 계산"],
                ["기대수익률", "지난해 실적을 참고하되 장기 평균 유지", "한 해 수익률이 높았다고 전체를 올리지 말 것"],
                ["국민연금 예상액", "NPS 최신 조회 결과로 교체", "매년 소폭 변동될 수 있음"],
                ["은퇴 나이", "계획 변경 시 수정", "조기은퇴 또는 근무 연장 반영"],
              ]}
            />
            <Heading>연간 핵심 수치 기록표</Heading>
            <Paragraph>
              매년 계산을 돌린 후, 아래 세 가지 핵심 수치를 기록해 두세요. 5년치를 모으면 은퇴 준비의 방향이 올바른지 한눈에 파악할 수 있습니다.
            </Paragraph>
            <CheckList items={[
              "총 금융자산 현재가: ____________원 (작년 대비 +/- ____% 변동)",
              "탈출지도 기준 자산 고갈 시점: ____세 (작년 대비 +/- ____년 변동)",
              "95세 기준 잔여 자산 예상: ____________원 (작년 대비 +/- ____% 변동)",
            ]} />
            <Paragraph>
              자산 고갈 시점이 매년 1세 이상 늦춰지고 있다면 잘 진행되고 있는 것입니다. 반대로 앞당겨지고 있다면 생활비를 점검하거나 자산 배분을 재검토해야 합니다.
            </Paragraph>
            <InfoBox>
              <strong>연 1회 리뷰의 가치:</strong> 30분의 연간 리뷰로 은퇴 계획을 항상 최신 상태로 유지할 수 있습니다. 매년 기록한 핵심 수치를 5년치 이상 쌓으면, 본인의 재무 건전성이 개선되고 있는지 악화되고 있는지를 추세로 확인할 수 있습니다. 탈출지도는 '한 번 쓰고 버리는 도구'가 아니라 '매년 꺼내 쓰는 재무 건강 검진 도구'입니다.
            </InfoBox>
          </>
        ),
      },
    ],
  },
];

interface SimGuideProps {
  onNavigate?: (page: string) => void;
}

export function SimGuide({ onNavigate }: SimGuideProps) {
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
            탈출지도 사용법
          </h1>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          탈출지도 사용법부터 반복 실행 기술, 워크북까지
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
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-primary)",
            background: "var(--bg-primary)",
            color: currentChapter === 0 ? "var(--text-disabled)" : "var(--text-primary)",
            fontSize: 14, fontWeight: 600,
            cursor: currentChapter === 0 ? "default" : "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
        >
          <ChevronLeft size={16} /> 이전 장
        </button>
        {currentChapter < chapters.length - 1 ? (
          <button
            onClick={() => goToChapter(currentChapter + 1)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "12px 16px", borderRadius: 10, border: "none",
              background: "var(--accent-blue)", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            다음 장 <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="sim-guide-cta"
            onClick={() => onNavigate?.("retirement-calc")}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "12px 16px", borderRadius: 10, border: "none",
              background: "var(--accent-blue)", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
              boxShadow: "0 2px 12px rgba(49, 130, 246, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            <Calculator size={16} /> 탈출지도 바로가기
          </button>
        )}
      </div>

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border-secondary)", textAlign: "center", fontSize: 11, color: "var(--text-disabled)", lineHeight: 1.6 }}>
        &copy; 탈출로드맵. All rights reserved. 무단 복제 및 배포를 금지합니다.
      </div>
    </div>
  );
}
