import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5174';
const OUTPUT_DIR = path.resolve('dist/screenshots');
const PASSWORD = 'fire100';

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. 로그인 화면
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await sleep(1000);
  await screenshot(page, '01-로그인화면');

  // 2. 비밀번호 입력 후 진입
  const pwInput = await page.$('input[type="password"]');
  if (pwInput) {
    await pwInput.type(PASSWORD);
    await sleep(300);
    await page.keyboard.press('Enter');
    await sleep(2000);
  }
  await screenshot(page, '02-웰컴화면');

  // 3. "바로 시작하기" 클릭 → 시뮬레이션 화면
  const startBtn = await findButtonByText(page, '바로 시작하기');
  if (startBtn) {
    await startBtn.click();
    await sleep(2000);
  }
  await screenshot(page, '03-시뮬레이션-초기');

  // 4. 시나리오 드롭다운 클릭
  const presetBtn = await page.$('.preset-dropdown > button');
  if (presetBtn) {
    await presetBtn.click();
    await sleep(800);
    await screenshot(page, '04-시나리오-선택');

    // 첫 번째 시나리오 선택
    const items = await page.$$('.preset-dropdown > div > div');
    if (items.length > 0) {
      await items[0].click();
      await sleep(1500);
      await screenshot(page, '05-시나리오-적용됨');
    }
  }

  // 6. 계산하기 클릭
  const calcBtn = await findButtonByText(page, '계산하기');
  if (calcBtn) {
    await page.evaluate(el => el.scrollIntoView({ block: 'center' }), calcBtn);
    await sleep(500);
    await calcBtn.click();
    await sleep(3000);
    await screenshot(page, '06-계산결과-실패');
  }

  // 6. 우측 패널 스크롤해서 계좌별 잔액 보기
  const panel = await page.$('.action-panel');
  if (panel) {
    await page.evaluate(() => {
      const p = document.querySelector('.action-panel');
      if (p) p.scrollTo({ top: 400, behavior: 'instant' });
    });
    await sleep(1000);
    await screenshot(page, '06-계좌별-권장잔액');
  }

  // 7. 채우기 버튼 클릭 (여러 번)
  for (let i = 0; i < 4; i++) {
    const fillBtn = await findButtonByText(page, '채우기');
    if (fillBtn) {
      await fillBtn.click();
      await sleep(600);
    }
  }
  await sleep(500);
  await screenshot(page, '07-채우기-완료');

  // 8. "채운 금액으로" 재계산 버튼 클릭
  const recalcBtn = await findButtonByText(page, '채운 금액으로');
  if (recalcBtn) {
    await recalcBtn.click();
    await sleep(3000);
    // 패널 상단으로
    await page.evaluate(() => {
      const p = document.querySelector('.action-panel');
      if (p) p.scrollTo({ top: 0, behavior: 'instant' });
    });
    await sleep(500);
    await screenshot(page, '08-계산결과-성공');
  }

  // 9. 플랜 요약 스크롤
  await page.evaluate(() => {
    const p = document.querySelector('.action-panel');
    if (p) p.scrollTo({ top: 300, behavior: 'instant' });
  });
  await sleep(800);
  await screenshot(page, '09-플랜요약');

  // 10. 현금흐름표 (결과 테이블 영역)
  await page.evaluate(() => {
    const table = document.querySelector('.result-table-section');
    if (table) table.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await screenshot(page, '10-현금흐름표');

  // 11. 모바일 뷰
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await sleep(1000);
  const pwInput2 = await page.$('input[type="password"]');
  if (pwInput2) {
    await pwInput2.type(PASSWORD);
    await page.keyboard.press('Enter');
    await sleep(2000);
  }
  // 바로 시작하기 클릭
  const mobileStart = await findButtonByText(page, '바로 시작하기');
  if (mobileStart) {
    await mobileStart.click();
    await sleep(2000);
  }
  await screenshot(page, '11-모바일-시뮬레이션');

  await browser.close();
  console.log(`\n스크린샷 생성 완료: ${OUTPUT_DIR}`);
}

async function screenshot(page, name) {
  const filePath = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, type: 'png' });
  console.log(`  ✓ ${name}.png`);
}

async function findButtonByText(page, text) {
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const t = await page.evaluate(el => el.textContent?.trim(), btn);
    if (t && t.includes(text)) {
      const visible = await page.evaluate(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }, btn);
      if (visible) return btn;
    }
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

run().catch(err => {
  console.error('스크린샷 생성 실패:', err);
  process.exit(1);
});
