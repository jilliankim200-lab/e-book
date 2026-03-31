import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, typographer: true });

const TITLE = '탈출로드맵 — 은퇴 재무 전략 가이드';
const AUTHOR = 'J';

// 전자책 본문 파일 순서
const chapters = [
  { file: '00-저자의-글.md', title: '저자의 글' },
  { file: '01-국민연금-수령액-추정.md', title: '1장. 국민연금, 언제 받는 게 유리할까?' },
  { file: '02-연금저축-세액공제.md', title: '2장. 연금저축, 얼마나 넣어야 할까?' },
  { file: '03-퇴직소득세-vs-연금소득세.md', title: '3장. 퇴직금, 한번에 받을까 나눠 받을까?' },
  { file: '04-ISA-IRP-절세-전환.md', title: '4장. ISA 만기가 다가올 때 해야 할 3가지' },
  { file: '05-은퇴자산-생존확률.md', title: '5장. 내 자산, 몇 살까지 버틸 수 있을까?' },
  { file: '06-Three-Bucket-전략.md', title: '6장. 은퇴 자산을 3개 통장으로 나누는 실전법' },
  { file: '07-건강보험료-계산.md', title: '7장. 은퇴 후 건보료 폭탄을 피하는 법' },
  { file: '08-상속세-증여세.md', title: '8장. 자산이 남을 때 생각해야 할 것들' },
  { file: '09-종합소득세-계산.md', title: '9장. 은퇴 후 세금, 이것만 알면 됩니다' },
];

const guidesDir = path.resolve('guides');

// 각 챕터 MD -> HTML 변환 (이미지 제거)
function renderChapters() {
  return chapters.map((ch, idx) => {
    const filePath = path.join(guidesDir, ch.file);
    let content = fs.readFileSync(filePath, 'utf-8');
    // 마크다운 이미지 제거
    content = content.replace(/!\[.*?\]\(.*?\)\n?/g, '');
    const html = md.render(content);
    const pageBreak = idx < chapters.length - 1 ? '<div class="page-break"></div>' : '';
    return `<section class="chapter">${html}</section>${pageBreak}`;
  }).join('\n');
}

// 탈출로드맵 소개 생성
function renderIntro() {
  return `
    <section class="chapter intro-section">
      <h1>탈출로드맵이란</h1>

      <p><strong>탈출로드맵</strong>은 은퇴 후 현금흐름을 시뮬레이션하는 개인 재무 설계 도구입니다.</p>
      <p>국민연금, 퇴직연금, 개인연금, ISA, 해외투자, 예적금까지 — 흩어져 있는 자산을 한 곳에 모아 넣으면, 은퇴 시점부터 90세 이상까지 매년 돈이 얼마나 들어오고, 얼마나 나가고, 언제 바닥나는지를 보여줍니다.</p>
      <p>단순히 "부족하다"는 경고가 아니라, <strong>어떤 숫자를 얼마나 바꾸면 결과가 어떻게 달라지는지</strong>를 직접 확인할 수 있습니다. 은퇴 시기를 2년 늦추면? 생활비를 50만원 줄이면? 국민연금을 연기 수령하면? 각각의 선택이 30년 뒤 내 통장에 어떤 차이를 만드는지, 숫자로 보여주는 것이 이 시스템의 핵심입니다.</p>

      <h2>왜 필요한가</h2>

      <h3>사회초년생 — "아직 먼 얘기"가 아닙니다</h3>
      <p>25세에 연금저축에 월 50만원을 넣기 시작한 사람과, 40세에 시작한 사람의 차이는 단순히 15년이 아닙니다. 복리의 마법 때문에 최종 금액은 2배 이상 벌어집니다. 탈출로드맵의 적립식 모드에 지금의 잔액과 납입 계획을 넣어보세요. 30년 후 내 연금 통장에 얼마가 쌓여 있을지 눈으로 확인하면, "언젠가 해야지"가 "지금 시작해야겠다"로 바뀝니다.</p>
      <p>사회초년생에게 가장 중요한 건 <strong>방향을 정하는 것</strong>입니다. IRP에 넣을지 연금저축에 넣을지, ISA를 활용할지 말지 — 이 선택들이 수십 년 뒤 수천만원의 차이를 만듭니다. 탈출로드맵은 "정답"을 알려주지 않습니다. 대신 각 선택의 결과를 숫자로 보여주기 때문에, 본인이 직접 판단할 수 있게 됩니다.</p>

      <h3>FIRE를 꿈꾸는 사람 — "가능한 건지" 확인하세요</h3>
      <p>조기 은퇴의 핵심은 단순합니다. <strong>"지금 가진 돈이 일하지 않는 기간 동안 버틸 수 있는가."</strong> 문제는 그 기간이 30~40년이라는 점입니다.</p>
      <p>35세에 은퇴하면 국민연금을 받기까지 30년의 공백이 생깁니다. 그 사이에 물가는 2배 이상 오르고, 건강보험료는 직장인일 때와 완전히 다른 기준으로 부과됩니다. 유튜브에서 "4% 룰"이나 "월 배당 300만원"을 듣고 계산기를 두드려봐도, 세금과 건보료와 물가상승이 빠진 계산은 현실과 동떨어져 있습니다.</p>
      <p>탈출로드맵에 본인의 자산, 예상 수익률, 희망 생활비를 넣어보세요. 40세 은퇴가 가능한지, 45세까지는 더 일해야 하는지, 생활비를 얼마까지 낮춰야 현실적인지 — 막연한 꿈이 구체적인 계획이 됩니다.</p>

      <h3>은퇴를 몇 년 앞둔 직장인 — "이대로 괜찮은 건지" 답을 얻으세요</h3>
      <p>50대 직장인이 가장 두려워하는 건 "모르는 것"입니다. 퇴직금을 한번에 받을지 연금으로 받을지, 국민연금을 조기 수령할지 연기할지, 지금 자산으로 은퇴 후 몇 년을 버틸 수 있는지 — 이 질문들에 확신 있게 답할 수 있는 사람은 거의 없습니다.</p>
      <p>탈출로드맵은 이 모든 변수를 한 번에 시뮬레이션합니다. 55세에 은퇴하면 국민연금 수령(65세)까지 10년 공백이 생기는데, 그 10년 동안 퇴직연금과 개인연금에서 얼마씩 꺼내야 하는지, 건보료는 얼마나 나오는지, 75세 이후에도 자산이 유지되는지 — 연도별로 확인할 수 있습니다.</p>
      <p><strong>"이대로면 67세에 자산이 바닥난다"</strong>는 결과를 본 사람은 행동이 달라집니다. 은퇴 시기를 2년 늦추거나, 생활비를 조정하거나, 연금 수령 전략을 바꾸는 것만으로도 결과가 극적으로 달라진다는 걸 직접 확인하기 때문입니다.</p>

      <hr>
      <p>이 전자책은 탈출로드맵을 200% 활용하기 위한 실전 가이드입니다. 국민연금 수령 시기 판단법부터, 연금 계좌 운용 전략, 건보료 절감법, 세금 최적화까지 — 시뮬레이션 결과를 행동으로 바꾸는 데 필요한 모든 지식을 담았습니다.</p>

      <h2>탈출지도 이용 방법</h2>
      <p>탈출지도는 <strong>웹 브라우저에서 바로 접속</strong>하거나, <strong>PC에 설치</strong>해서 사용할 수 있습니다.</p>
      <ul>
        <li><strong>웹 접속:</strong> 브라우저 주소창에 접속 URL을 입력하면 별도 설치 없이 바로 사용할 수 있습니다. PC, 태블릿, 모바일 모두 지원됩니다.</li>
        <li><strong>PC 설치:</strong> 제공된 설치 파일(RoadmapSetup.exe)을 실행하면 자동으로 설치되며, 바탕화면 바로가기로 실행할 수 있습니다.</li>
      </ul>
      <p>접속에 필요한 <strong>URL과 비밀번호</strong>는 이 전자책의 <strong>마지막 페이지</strong>에 안내되어 있습니다.</p>
    </section>
    <div class="page-break"></div>
  `;
}

// 목차 생성
function renderTOC() {
  const allItems = [
    { title: '탈출로드맵이란', indent: false },
    ...chapters.map(ch => ({ title: ch.title, indent: false })),
  ];
  const items = allItems.map(item => {
    return `<div class="toc-item"><span class="toc-title">${item.title}</span></div>`;
  }).join('\n');
  return `
    <section class="toc-page">
      <h1 class="toc-heading">목차</h1>
      ${items}
    </section>
    <div class="page-break"></div>
  `;
}

// 접속 안내 (마지막 페이지)
function renderAccess() {
  return `
    <div class="page-break"></div>
    <section class="access-page">
      <h1 class="access-title">탈출지도 접속 안내</h1>
      <div class="access-box">
        <div class="access-row">
          <span class="access-label">접속 주소</span>
          <span class="access-value">retirement-roadmap.pages.dev</span>
        </div>
        <div class="access-divider"></div>
        <div class="access-row">
          <span class="access-label">비밀번호</span>
          <span class="access-value access-pw">fire100</span>
        </div>
      </div>
      <div class="access-steps">
        <p class="access-step"><strong>1.</strong> 위 주소를 브라우저에 입력하세요.</p>
        <p class="access-step"><strong>2.</strong> 비밀번호 입력 화면이 나타나면 <strong>fire100</strong>을 입력하세요.</p>
        <p class="access-step"><strong>3.</strong> 본인의 정보를 입력하고 시뮬레이션을 실행하세요.</p>
      </div>
      <div class="access-notice">
        <p>※ PC, 태블릿, 모바일 모두 접속 가능합니다.</p>
        <p>※ 비밀번호는 구매자 전용입니다. 타인에게 공유하지 말아주세요.</p>
      </div>
    </section>
  `;
}

// 표지 생성
function renderCover() {
  return `
    <section class="cover">
      <div class="cover-badge">RETIREMENT ROADMAP</div>
      <h1 class="cover-title">탈출로드맵</h1>
      <p class="cover-subtitle">은퇴 재무 전략 가이드</p>
      <div class="cover-divider"></div>
      <p class="cover-desc">
        국민연금부터 절세 전략, 자산 배분까지<br>
        은퇴 후 현금흐름을 설계하는 실전 가이드
      </p>
      <p class="cover-author">${AUTHOR}</p>
      <p class="cover-url">retirement-roadmap.pages.dev</p>
    </section>
    <div class="page-break"></div>
  `;
}

// 전체 HTML
const fullHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a1a;
  }

  .page-break {
    page-break-after: always;
  }

  /* ── 표지 ── */
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 40%);
  }
  .cover-badge {
    font-size: 11pt;
    font-weight: 600;
    letter-spacing: 3px;
    color: #3182F6;
    margin-bottom: 24px;
  }
  .cover-title {
    font-size: 36pt;
    font-weight: 800;
    color: #111;
    margin-bottom: 8px;
  }
  .cover-subtitle {
    font-size: 16pt;
    font-weight: 500;
    color: #555;
    margin-bottom: 32px;
  }
  .cover-divider {
    width: 60px;
    height: 3px;
    background: #3182F6;
    margin-bottom: 32px;
  }
  .cover-desc {
    font-size: 11pt;
    color: #666;
    line-height: 1.8;
    margin-bottom: 48px;
  }
  .cover-author {
    font-size: 13pt;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }
  .cover-url {
    font-size: 10pt;
    color: #999;
  }

  /* ── 목차 ── */
  .toc-page {
    padding: 80px 0 40px;
  }
  .toc-heading {
    font-size: 22pt;
    font-weight: 800;
    color: #111;
    margin-bottom: 36px;
    padding-bottom: 12px;
    border-bottom: 2px solid #3182F6;
  }
  .toc-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    font-size: 12pt;
    color: #333;
  }
  .toc-title {
    font-weight: 500;
  }

  /* ── 본문 ── */
  .chapter {
    padding-top: 20px;
  }
  .chapter h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #111;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #3182F6;
    page-break-after: avoid;
  }
  .chapter h2 {
    font-size: 15pt;
    font-weight: 700;
    color: #222;
    margin: 28px 0 12px 0;
    page-break-after: avoid;
  }
  .chapter h3 {
    font-size: 12.5pt;
    font-weight: 700;
    color: #333;
    margin: 20px 0 8px 0;
    page-break-after: avoid;
  }
  .chapter p {
    margin: 8px 0;
    text-align: justify;
    word-break: keep-all;
  }
  .chapter ul, .chapter ol {
    margin: 8px 0 8px 24px;
  }
  .chapter li {
    margin: 4px 0;
  }
  .chapter strong {
    font-weight: 700;
    color: #111;
  }
  .chapter em {
    font-style: italic;
    color: #555;
  }
  .chapter blockquote {
    margin: 12px 0;
    padding: 12px 16px;
    border-left: 3px solid #3182F6;
    background: #f8f9fa;
    color: #444;
    font-size: 11pt;
  }
  .chapter table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10.5pt;
  }
  .chapter th {
    background: #f0f4ff;
    border: 1px solid #ddd;
    padding: 8px 10px;
    font-weight: 700;
    text-align: center;
    color: #222;
  }
  .chapter td {
    border: 1px solid #ddd;
    padding: 8px 10px;
    color: #333;
  }
  .chapter code {
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 10pt;
    background: #f4f4f4;
    padding: 1px 4px;
    border-radius: 3px;
  }
  .chapter pre {
    background: #f8f8f8;
    padding: 12px 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 10pt;
    margin: 12px 0;
  }
  .chapter hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 24px 0;
  }

  /* 접속 안내 */
  .access-page {
    padding-top: 120px;
  }
  .access-title {
    font-size: 22pt; font-weight: 800; color: #111;
    text-align: center; margin-bottom: 48px;
  }
  .access-box {
    max-width: 420px; margin: 0 auto 40px;
    border: 2px solid #3182F6; border-radius: 16px;
    padding: 32px 36px;
  }
  .access-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
  }
  .access-label {
    font-size: 12pt; color: #666; font-weight: 500;
  }
  .access-value {
    font-size: 13pt; font-weight: 700; color: #111;
  }
  .access-pw {
    font-size: 18pt; color: #3182F6; letter-spacing: 2px;
  }
  .access-divider {
    height: 1px; background: #eee; margin: 4px 0;
  }
  .access-steps {
    max-width: 420px; margin: 0 auto 32px;
  }
  .access-step {
    font-size: 11.5pt; color: #333; line-height: 2; margin: 0;
  }
  .access-notice {
    max-width: 420px; margin: 0 auto;
    padding: 16px 20px; border-radius: 10px;
    background: #f8f9fa;
  }
  .access-notice p {
    font-size: 10pt; color: #888; margin: 4px 0; text-align: left;
  }
</style>
</head>
<body>
${renderCover()}
${renderTOC()}
${renderIntro()}
${renderChapters()}
${renderAccess()}
</body>
</html>`;

// PDF 생성
async function generatePDF() {
  const outputDir = path.resolve('dist');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const htmlPath = path.join(outputDir, 'ebook.html');
  const pdfPath = path.join(outputDir, '탈출로드맵_은퇴재무전략가이드.pdf');

  fs.writeFileSync(htmlPath, fullHTML, 'utf-8');
  console.log('HTML 생성 완료:', htmlPath);

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // 폰트 로딩 대기
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '25mm', right: '20mm', bottom: '25mm', left: '20mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 9px; color: #999; font-family: Pretendard, sans-serif;">
        <span class="pageNumber"></span>
      </div>
    `,
  });

  console.log('PDF 생성 완료:', pdfPath);

  // HTML 정리
  fs.unlinkSync(htmlPath);

  await browser.close();

  // 파일 크기 확인
  const stats = fs.statSync(pdfPath);
  console.log(`파일 크기: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

generatePDF().catch(err => {
  console.error('PDF 생성 실패:', err);
  process.exit(1);
});
