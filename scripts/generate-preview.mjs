import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function generatePreviews() {
  const pdfPath = path.resolve('dist/탈출로드맵_은퇴재무전략가이드.pdf');
  const outputDir = path.resolve('dist/preview');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // PDF를 Chrome에서 열어서 페이지별 캡처
  // 대신 HTML을 다시 생성해서 특정 페이지를 캡처
  // 목차(2페이지) + 본문 4페이지 = 5장

  // PDF에서 직접 캡처하는 대신, 각 페이지를 개별 HTML로 렌더링
  const previewPages = [
    { name: '01-표지', title: '표지', type: 'cover' },
    { name: '02-목차', title: '목차', type: 'toc' },
    { name: '03-탈출로드맵소개', title: '탈출로드맵 소개', type: 'intro' },
    { name: '04-1장-국민연금', title: '1장 본문', type: 'chapter', file: '01-국민연금-수령액-추정.md' },
    { name: '05-6장-Three-Bucket', title: '6장 본문', type: 'chapter', file: '06-Three-Bucket-전략.md' },
    { name: '06-9장-세금', title: '9장 본문', type: 'chapter', file: '09-종합소득세-계산.md' },
  ];

  const MarkdownIt = (await import('markdown-it')).default;
  const md = new MarkdownIt({ html: true, typographer: true });

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

  const baseStyle = `
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
      font-size: 12pt; line-height: 1.5; color: #1a1a1a;
      width: 794px; height: 1123px; overflow: hidden;
      padding: 25mm 20mm;
    }
    h1 { font-size: 20pt; font-weight: 800; color: #111; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #3182F6; }
    h2 { font-size: 15pt; font-weight: 700; color: #222; margin: 28px 0 12px 0; }
    h3 { font-size: 12.5pt; font-weight: 700; color: #333; margin: 20px 0 8px 0; }
    p { margin: 8px 0; text-align: justify; word-break: keep-all; }
    ul, ol { margin: 8px 0 8px 24px; }
    li { margin: 4px 0; }
    strong { font-weight: 700; color: #111; }
    blockquote { margin: 12px 0; padding: 12px 16px; border-left: 3px solid #3182F6; background: #f8f9fa; color: #444; font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10.5pt; }
    th { background: #f0f4ff; border: 1px solid #ddd; padding: 8px 10px; font-weight: 700; text-align: center; }
    td { border: 1px solid #ddd; padding: 8px 10px; }
    hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
  `;

  for (const pp of previewPages) {
    let html = '';

    if (pp.type === 'cover') {
      html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>
        ${baseStyle}
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 40%); }
        .badge { font-size: 11pt; font-weight: 600; letter-spacing: 3px; color: #3182F6; margin-bottom: 24px; }
        .title { font-size: 36pt; font-weight: 800; color: #111; margin-bottom: 8px; border: none; padding: 0; }
        .subtitle { font-size: 16pt; font-weight: 500; color: #555; margin-bottom: 32px; }
        .divider { width: 60px; height: 3px; background: #3182F6; margin-bottom: 32px; }
        .desc { font-size: 11pt; color: #666; line-height: 1.8; margin-bottom: 48px; text-align: center; }
        .author { font-size: 13pt; font-weight: 700; color: #333; margin-bottom: 8px; }
        .url { font-size: 10pt; color: #999; }
      </style></head><body>
        <div class="badge">RETIREMENT ROADMAP</div>
        <h1 class="title">탈출로드맵</h1>
        <p class="subtitle">은퇴 재무 전략 가이드</p>
        <div class="divider"></div>
        <p class="desc">국민연금부터 절세 전략, 자산 배분까지<br>은퇴 후 현금흐름을 설계하는 실전 가이드</p>
        <p class="author">J</p>
        <p class="url">retirement-roadmap.pages.dev</p>
      </body></html>`;
    } else if (pp.type === 'toc') {
      const allItems = [
        { title: '탈출로드맵이란' },
        ...chapters.map(ch => ({ title: ch.title })),
      ];
      const tocItems = allItems.map(ch => `<div style="padding:10px 0; border-bottom:1px solid #eee; font-size:12pt; color:#333;">${ch.title}</div>`).join('');
      html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>
        <h1 style="font-size:22pt; margin-bottom:36px;">목차</h1>
        ${tocItems}
      </body></html>`;
    } else if (pp.type === 'intro') {
      html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>
        <h1>탈출로드맵이란</h1>
        <p><strong>탈출로드맵</strong>은 은퇴 후 현금흐름을 시뮬레이션하는 개인 재무 설계 도구입니다.</p>
        <p>국민연금, 퇴직연금, 개인연금, ISA, 해외투자, 예적금까지 — 흩어져 있는 자산을 한 곳에 모아 넣으면, 은퇴 시점부터 90세 이상까지 매년 돈이 얼마나 들어오고, 얼마나 나가고, 언제 바닥나는지를 보여줍니다.</p>
        <p>단순히 "부족하다"는 경고가 아니라, <strong>어떤 숫자를 얼마나 바꾸면 결과가 어떻게 달라지는지</strong>를 직접 확인할 수 있습니다.</p>
        <h2>왜 필요한가</h2>
        <h3>사회초년생 — "아직 먼 얘기"가 아닙니다</h3>
        <p>25세에 연금저축에 월 50만원을 넣기 시작한 사람과, 40세에 시작한 사람의 차이는 단순히 15년이 아닙니다. 복리의 마법 때문에 최종 금액은 2배 이상 벌어집니다. 탈출로드맵의 적립식 모드에 지금의 잔액과 납입 계획을 넣어보세요.</p>
        <h3>FIRE를 꿈꾸는 사람 — "가능한 건지" 확인하세요</h3>
        <p>35세에 은퇴하면 국민연금을 받기까지 30년의 공백이 생깁니다. 그 사이에 물가는 2배 이상 오르고, 건강보험료는 직장인일 때와 완전히 다른 기준으로 부과됩니다.</p>
        <h3>은퇴를 몇 년 앞둔 직장인 — "이대로 괜찮은 건지" 답을 얻으세요</h3>
        <p>50대 직장인이 가장 두려워하는 건 "모르는 것"입니다. 탈출로드맵은 이 모든 변수를 한 번에 시뮬레이션합니다.</p>
      </body></html>`;
    } else if (pp.type === 'chapter') {
      let content = fs.readFileSync(path.join('guides', pp.file), 'utf-8');
      content = content.replace(/!\\[.*?\\]\\(.*?\\)\\n?/g, '');
      const rendered = md.render(content);
      html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>${rendered}</body></html>`;
    }

    const tmpPath = path.join(outputDir, `${pp.name}.html`);
    fs.writeFileSync(tmpPath, html, 'utf-8');

    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.goto(`file:///${tmpPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));

    const imgPath = path.join(outputDir, `${pp.name}.png`);
    await page.screenshot({ path: imgPath, type: 'png', clip: { x: 0, y: 0, width: 794, height: 1123 } });

    fs.unlinkSync(tmpPath);
    console.log(`  ✓ ${pp.title}: ${pp.name}.png`);
  }

  await browser.close();
  console.log(`\n미리보기 ${previewPages.length}장 생성 완료: ${outputDir}`);
}

generatePreviews().catch(err => {
  console.error('미리보기 생성 실패:', err);
  process.exit(1);
});
