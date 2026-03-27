# 탈출로드맵 - 사이트 관리 가이드

## Git 저장소

- **Repository**: https://github.com/jilliankim200-lab/e-book
- **Branch**: `main`
- **로컬 경로**: `c:\workspace\e-book`

### Git 명령어

```bash
# 상태 확인
git status

# 커밋
git add -A
git commit -m "커밋 메시지"

# 푸시
git push origin main
```

---

## 배포 (Cloudflare Pages)

- **프로덕션 URL**: https://retirement-roadmap.pages.dev
- **프로젝트명**: `retirement-roadmap`
- **플랫폼**: Cloudflare Pages
- **API 토큰**: `cfut_NzCJUOMYhlvN1dLMj56B41TAf8guVcmoIYJmxv6X9d8c0b70`

### 배포 명령어

```bash
# 빌드 + 배포 (한 번에)
cd c:/workspace/e-book
npm run build && CLOUDFLARE_API_TOKEN="cfut_NzCJUOMYhlvN1dLMj56B41TAf8guVcmoIYJmxv6X9d8c0b70" npx wrangler pages deploy dist --project-name=retirement-roadmap

# 빌드만
npm run build

# 배포만 (이미 빌드된 경우)
CLOUDFLARE_API_TOKEN="cfut_NzCJUOMYhlvN1dLMj56B41TAf8guVcmoIYJmxv6X9d8c0b70" npx wrangler pages deploy dist --project-name=retirement-roadmap
```

---

## 로컬 개발 서버

```bash
# PC에서만 접속
npx vite

# 같은 WiFi의 모바일에서도 접속 (LAN)
npx vite --host 0.0.0.0 --port 5173
```

- **PC**: http://localhost:5173
- **모바일**: http://{PC의 IP}:5173 (예: http://192.168.123.102:5173)

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite 6 |
| 스타일 | CSS Variables + 인라인 스타일 |
| 폰트 | Pretendard |
| 아이콘 | Lucide React |
| 배포 | Cloudflare Pages |
| 코드 보호 | vite-plugin-obfuscator |

---

## 주요 파일 구조

```
e-book/
├── index.html              # 진입점
├── 은퇴계산기.tsx           # 핵심 시뮬레이션 로직 + UI
├── src/
│   ├── main.tsx            # 앱 초기화, DevTools 차단, 모바일 감지
│   ├── App.tsx             # 레이아웃, 라우팅, 사이드바
│   ├── ActionPlan.tsx      # 우측 패널 (전략 카드, 계좌별 권장잔액)
│   ├── PasswordGate2.tsx   # 로그인 페이지
│   ├── Welcome.tsx         # 웰컴 페이지
│   ├── SimGuide.tsx        # 탈출지도 사용법
│   ├── EBook2.tsx          # 실전 전략 가이드
│   ├── EBook3.tsx          # 사례로 배우기
│   ├── AuthorNote.tsx      # 저자의 글
│   ├── design-tokens.css   # 디자인 토큰 (색상, 폰트 등)
│   ├── index.css           # 모바일 반응형 + 유틸리티 CSS
│   └── layout.css          # 레이아웃 CSS
├── public/
│   ├── images/             # 캐릭터, 결과 이미지
│   ├── manifest.json       # PWA 매니페스트
│   └── favicon.svg         # 파비콘
├── guides/                 # 가이드 문서 + 캐릭터 원본
└── DEPLOY.md               # 이 문서
```

---

## 인증

- **일반 사용자**: 비밀번호 해시 `-849505285`
- **관리자**: 비밀번호 해시 `20789456`
- **저장 방식**: `sessionStorage` (탭 닫으면 초기화)
- **관리자 기능**: 우측 패널 하단 보라색 `ⓘ` 버튼 → 업데이트 노트 팝업

---

## 모바일 대응

- **기본**: `@media (max-width: 768px)` 미디어쿼리
- **폴더블 (갤럭시 폴드 등)**: `main.tsx`에서 User-Agent 감지 → `.mobile-device` 클래스 추가 → JS로 모바일 CSS 동적 삽입
- **감지 키워드**: `Android`, `iPhone`, `iPad`, `iPod`, `Mobile`, `Fold`, `Flip`
