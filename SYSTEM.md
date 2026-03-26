# 은퇴로드맵 시스템 명세서

이 문서는 은퇴로드맵 프로젝트의 전체 구조, 기능, 설정을 기술합니다.
다음 작업 시 이 문서를 먼저 읽고 현재 상태를 파악하세요.

---

## 1. 프로젝트 개요

- **이름**: 은퇴로드맵 (Retirement Roadmap)
- **목적**: 은퇴 후 현금흐름을 시뮬레이션하고, 자산 고갈 시점을 예측하며, 맞춤형 재무 전략을 제안하는 전자책 부록 웹앱
- **기술 스택**: React 19 + TypeScript + Vite + Lucide Icons
- **배포**: Cloudflare Pages (`retirement-roadmap.pages.dev`)
- **빌드**: `npm run build` -> `dist/` 폴더 생성
- **난독화**: `vite-plugin-obfuscator` 적용 (프로덕션 빌드 시)

---

## 2. 파일 구조

```
e-book/
├── index.html                    # 엔트리 HTML
├── package.json                  # 의존성 (react, lucide-react, vite)
├── vite.config.ts                # Vite 설정 + 난독화 플러그인
├── tsconfig.json                 # TypeScript 설정 (vite/client 타입 포함)
├── 은퇴계산기.tsx                # 메인 시뮬레이션 컴포넌트 (계산 로직 + 입력 폼 + 결과 테이블)
├── 은퇴계산기Modal.tsx           # 현금흐름표 모달 (CashFlowModal)
├── src/
│   ├── main.tsx                  # 앱 진입점 (PasswordGate 래핑, DevTools 차단)
│   ├── App.tsx                   # 라우팅, 사이드바, 헤더, 테마 토글
│   ├── PasswordGate.tsx          # 비밀번호 잠금 화면 (일반/관리자 구분)
│   ├── ActionPlan.tsx            # 우측 패널 - 시뮬레이션 결과 기반 맞춤 처방전
│   ├── EBook.tsx                 # 은퇴 가이드북 (현재 메뉴에서 제거됨, 파일은 존재)
│   ├── EBook2.tsx                # 실전 전략 가이드 (9장)
│   ├── EBook3.tsx                # 사례로 배우기
│   ├── AuthorNote.tsx            # MAKER: 지독한 J의 기록 (저자의 글)
│   ├── CashFlowTable.tsx         # 현금흐름표 페이지 (메뉴에서 제거됨, 파일은 존재)
│   ├── design-tokens.css         # 디자인 시스템 (라이트/다크 모드 변수, 반응형, 툴팁)
│   ├── index.css                 # Tailwind + 기본 스타일
│   └── layout.css                # 레이아웃 관련 CSS
├── guides/                       # 가이드 마크다운 (전자책 원본 콘텐츠)
│   ├── 00-저자의-글.md
│   ├── 01-국민연금-수령액-추정.md
│   ├── 02-연금저축-세액공제.md
│   ├── 03-퇴직소득세-vs-연금소득세.md
│   ├── 04-ISA-IRP-절세-전환.md
│   ├── 05-은퇴자산-생존확률.md
│   ├── 06-Three-Bucket-전략.md
│   ├── 07-건강보험료-계산.md
│   ├── 08-상속세-증여세.md
│   ├── 09-종합소득세-계산.md
│   └── 10-계산식-구조.md          # 시뮬레이션 계산식 상세 문서
└── dist/                          # 빌드 결과물 (배포 대상)
```

---

## 3. 페이지 구성 (메뉴 순서)

| 순서 | Page ID | 메뉴명 | 컴포넌트 | 아이콘 |
|------|---------|--------|---------|--------|
| 1 | `retirement-calc` | 은퇴 시뮬레이션 | `CashFlow` (은퇴계산기.tsx) | Calculator |
| 2 | `ebook2` | 실전 전략 가이드 | `EBook2` | Compass |
| 3 | `ebook3` | 사례로 배우기 | `EBook3` | Users |
| 4 | `author` | MAKER: 지독한 J의 기록 | `AuthorNote` | Pen |

- 초기 페이지: `retirement-calc` (은퇴 시뮬레이션)
- 제거된 메뉴: 은퇴 가이드북(EBook.tsx), 현금흐름표(CashFlowTable.tsx) - 파일은 존재하나 라우팅에서 제외

---

## 4. 인증 시스템 (PasswordGate.tsx)

### 비밀번호

| 역할 | 비밀번호 | 해시값 | 권한 |
|------|---------|--------|------|
| 일반 사용자 | `fire100` | -849505285 | 시뮬레이션 + 가이드 열람 |
| 관리자 | `admin2025` | 20789456 | 위 + 계산식 모달 열람 |

### 인증 방식
- 해시 비교 (평문 비밀번호 소스에 없음)
- `sessionStorage` 저장 (`ebook_access_granted`, `ebook_user_role`)
- 탭 닫으면 재인증 필요

### 보호 기능 (프로덕션 전용, main.tsx)
- 우클릭 차단 (`contextmenu` preventDefault)
- DevTools 단축키 차단 (F12, Ctrl+Shift+I/J/C, Ctrl+U)
- DevTools 열림 감지 (window 크기 비교, 1초 간격)
- console 메서드 비활성화
- 코드 난독화 (vite-plugin-obfuscator): 제어흐름 평탄화, 문자열 Base64 인코딩, 디버그 보호

---

## 5. 은퇴 시뮬레이션 (은퇴계산기.tsx)

### 입력 항목 (InputValues)

| 카테고리 | 필드 | 설명 |
|---------|------|------|
| 기본설정 | startYear, retirementStartAge, simulationEndAge | 시작년도, 은퇴나이, 종료나이 |
| 생활비 | monthlyLivingCostBefore75, monthlyLivingCostAfter75, inflationRate | 75세 전후 월 생활비, 물가상승률 |
| 국민연금 | nationalPensionStartAge, nationalPensionYearly | 수령 시작 나이, 연 수령액 |
| 퇴직연금 | retirementPensionType, retirementPensionBalance, retirementPensionReturnRate | 유형(IRP/DB/DC), 잔액, 수익률 |
| 개인연금 | totalPension, pensionWithdrawalAmount, pensionReturnRate, pensionStartAge, usePensionDepletion | 잔액, 인출액, 수익률, 개시나이, 소진모드 |
| ISA | husbandISA, wifeISA, isaReturnRate | 부부 ISA 잔액, 수익률 |
| 해외주식 | overseasInvestmentAmount, overseasReturnRate | 잔액, 수익률 |
| 예적금 | savingsAmount, savingsReturnRate | 잔액, 수익률 |
| 생명보험 | lifeInsurancePensionStartAge, lifeInsurancePensionYearly | 개시나이, 연수령액 |
| 주택연금 | homeValue, homePensionStartAge, homePensionMonthly | 주택가치, 개시나이, 월수령액 |
| 추가자산 | additionalAssets[] | 동적 자산 목록 (ISA/해외/예적금/생명보험/부동산/기타) |
| 부채 | totalDebt, monthlyDebtRepayment, debtEndAge | 총액, 월상환, 완료나이 |
| 비정기지출 | irregularExpenses[] | 이벤트명, 나이, 금액 |
| 옵션 | returnRateType (pretax/posttax), pensionExcessTaxRate | 수익률 기준, 초과세율 |

### additionalAssets 동기화
UI에서 additionalAssets 배열로 관리하되, 계산 로직은 기존 호환 필드 사용.
updateAsset 함수에서 자산 타입별로 기존 필드에 자동 동기화:
- ISA -> husbandISA, isaReturnRate
- overseas -> overseasInvestmentAmount, overseasReturnRate
- savings -> savingsAmount, savingsReturnRate
- life_insurance -> lifeInsurancePensionStartAge, lifeInsurancePensionYearly
- real_estate -> homeValue, homePensionStartAge, homePensionMonthly
- custom -> 동기화 없음 (계산 미반영)

### 시뮬레이션 계산 흐름 (매년 반복)
상세 계산식은 `guides/10-계산식-구조.md` 참조.

```
1. 생활비 계산 (75세 기준 분리, 물가상승률 복리)
2. 고정 수입 (국민연금, 주택연금, 생명보험연금)
3. 변동 수입 - 일반모드: 필요한 만큼만 인출 / 소진모드: PMT 균등 인출
   - 해외배당 (잔액 x 6% x 0.846)
   - 개인연금 (나이별 세율 + 분리과세 1,500만 한도)
   - ISA (부족분만 / PMT)
   - 해외주식 매도 (부족분만 / PMT)
4. 건보료 (개인연금 기반 소득점수 + 재산점수) x 218.8원 x 12
5. 부채 상환 + 비정기 지출
6. 총계 = 총소득 - 총지출 - 추가차감(국민연금 수령 시 연 500만 안전마진)
7. 부족분 보전: 예적금 -> ISA -> 해외주식 순
8. 잔액 수익률 적용 (연말): ISA(r), 해외(r-6%), 연금(r), 예적금(r)
```

### 주요 상수
- 해외배당 원천징수: 15.4%
- 연금소득세: 55세 미만 16.5%, 55~69세 5.5%, 70~79세 4.4%, 80세+ 3.3%
- 분리과세 한도: 1,500만원 (2024년 개정)
- 국민연금 조기 감액: 1년당 6% (최대 30%)
- 국민연금 연기 증액: 1년당 7.2% (최대 36%)
- 재산 기본공제: 1억원 (일괄)
- 건보 점수당 단가: 218.8원
- 추가 차감: 국민연금 수령 시작 후 연 500만원 (안전 마진)

### 예시 프리셋 (6개)
| 프리셋 | 자산규모 | 특징 |
|--------|---------|------|
| 30대 싱글 | 1.5억 | 높은 수익률, 부채 있음, 주택 없음 |
| 40대 싱글 | 3억 | DC형, 70세부터 주택연금 |
| 50대 싱글 | 5억 | 원금유지, 생명보험연금 추가 |
| 50대 고자산 | 10억 | 부부 ISA 2억, 85세 종료 |
| 40대 직장인 | 5억 | 대출 1억, 자녀 결혼비 |
| 60대 은퇴자 | 연금중심 | 63세 조기수령, 보수적 수익률 |

### 결과 테이블 동적 컬럼
입력값이 0인 항목은 테이블에서 자동 숨김:
- hasSavings, hasISA, hasOverseas, hasPension, hasNationalPension, hasHomePension, hasLifeInsurance, hasDebt, hasIrregular

### 입력값 변경 감지
- `inputsDirty` state: 결과 생성 후 입력값 변경 시 true
- "다시 계산하기" 배너가 결과 테이블 위에 표시

### 계산식 모달
- 관리자(`isAdmin()`)만 "계산식" 버튼 표시
- formulaSections 배열로 14개 항목 렌더링

---

## 6. Action Plan 패널 (ActionPlan.tsx)

### 위치
은퇴 시뮬레이션 페이지 우측 패널 (clamp 320px~480px)

### 히어로 배너
- 성공: 초록 그라데이션 + 체크 아이콘
- 실패: 빨강 그라데이션 + X 아이콘 + 적자 전환 나이 표시
- 배경 장식: 반투명 원형 3개

### 시나리오 카드 (동적 생성)
1. 투자 수익률 1% 상향
2. 월 생활비 50만원 절감
3. 국민연금 수령 1년 연기
4. 부채 조기 상환 (부채 있을 때만)
5. 비정기 지출 분산 (비정기지출 있을 때만)
6. 연령별 자산 배분 조정

### 데이터 전달
- `onSimulationComplete` 콜백으로 계산 결과를 직접 전달 (localStorage 경유 아님)
- 계산 완료 즉시 패널 열림

---

## 7. 콘텐츠 페이지

### 실전 전략 가이드 (EBook2.tsx) - 9장
1장: 국민연금 조기/연기 손익분기점
2장: 연금 계좌 최적 납입
3장: 퇴직금 수령 전략
4장: ISA 만기 체크리스트
5장: 자산 고갈 위험 신호
6장: Three-Bucket 실전법
7장: 건보료 회피 전략
8장: 증여/상속 판단
9장: 은퇴 후 세금 관리

### 사례로 배우기 (EBook3.tsx)
실전 시나리오 기반 학습 콘텐츠

### MAKER: 지독한 J의 기록 (AuthorNote.tsx)
저자 스토리 4섹션 + 시뮬레이션 바로가기 CTA 버튼

---

## 8. 반응형 (768px 이하)

### CSS (design-tokens.css)
- 사이드바: `display: none` 대신 `position: fixed` 오버레이 드로어
- 사이드바 열릴 때: `.sidebar-overlay` 반투명 배경 표시
- 메뉴 클릭 시 사이드바 자동 닫힘 (`window.innerWidth <= 768`)
- Action Plan 패널: 숨김
- 결과 테이블 섹션: 숨김 (`.result-table-section`)
- 다운로드 버튼: 숨김 (`.download-btn`)
- PC 안내 문구 표시 (`.mobile-pc-notice`)
- 폰트 크기 offset: 모바일 기본 +2px (`--font-size-offset`)

### 폰트 크기 조절 (App.tsx)
- 헤더에 가/가/가 3단계 버튼 (-1px, 0px, +2px)
- localStorage 저장 (`fontSizeOffset`)
- CSS 변수 `--font-size-offset`으로 모든 텍스트 크기에 적용

---

## 9. 테마

### 라이트/다크 모드 (design-tokens.css)
- `:root` (라이트) / `.dark` (다크) CSS 변수
- `localStorage("theme")` 저장
- `document.documentElement.classList.toggle("dark")` 토글

### 다크 모드 주요 색상
- text-primary: #F0F0F2
- text-secondary: #A8A8AD
- text-tertiary: #7A7A80
- border-primary: #363640
- bg-primary: #17171C

---

## 10. 배포

### Cloudflare Pages
- 프로젝트: `retirement-roadmap`
- URL: `https://retirement-roadmap.pages.dev`
- 대역폭: 무제한 (무료)
- 배포 명령: `CLOUDFLARE_API_TOKEN=<token> npx wrangler pages deploy dist --project-name retirement-roadmap`

### 빌드 명령
```bash
npm run build          # Vite 빌드 + 난독화
npx tsc --noEmit       # 타입 체크 (빌드 전 확인용)
```

---

## 11. 토스트 메시지
- 위치: 우측 하단 (`position: fixed, bottom: 32, right: 32`)
- 시뮬레이션 완료 시 "시뮬레이션 결과가 저장되었습니다" 표시
- 2초 후 자동 사라짐

---

## 12. 저작권
- 사이드바 하단 + 가이드북/저자의글 하단에 표시
- 문구: "Copyright 은퇴로드맵. All rights reserved. 무단 복제 및 배포를 금지합니다."

---

## 13. 알려진 제한사항
- 해외주식 양도소득세(22%, 250만 비과세) 미반영 — 실제보다 유리하게 계산됨
- custom 타입 추가자산은 계산에 미반영
- 건보료 계산은 공시가격 기준이나 입력은 시가 기준 (안내 문구로 보완)
- 물가상승률은 생활비에만 적용, 의료비 별도 상승률 미반영
