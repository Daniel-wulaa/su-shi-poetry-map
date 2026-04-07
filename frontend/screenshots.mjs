// 苏轼人生诗词地图 - 页面截图脚本
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../docs/screenshots');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const BASE_URL = 'http://localhost:5173';

// 页面配置列表
const pages = [
  { name: '01-首页', url: '/', wait: 'networkidle', description: '首页 Hero Section' },
  { name: '02-名句赏析页', url: '/quotes', wait: 'networkidle', description: '名句赏析页面' },
  { name: '03-探索地图页', url: '/explore', wait: 'networkidle', description: '地图探索页面' },
  { name: '04-时间线页', url: '/timeline', wait: 'networkidle', description: '时间线页面' },
  { name: '05-书法页', url: '/calligraphy', wait: 'networkidle', description: '书法文化页面' },
  { name: '06-研究页', url: '/research', wait: 'networkidle', description: '研究页面' },
  { name: '07-诗词详情页 - 念奴娇', url: '/poetry/1', wait: 'networkidle', description: '诗词详情页（念奴娇·赤壁怀古）' },
  { name: '08-诗词详情页 - 江城子', url: '/poetry/9', wait: 'networkidle', description: '诗词详情页（江城子·十年生死）' },
  { name: '09-诗词详情页 - 水调歌头', url: '/poetry/2', wait: 'networkidle', description: '诗词详情页（水调歌头·明月几时有）' },
];

(async () => {
  console.log('🚀 开始截图...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--window-size=1920,1080']
  });

  for (const pageConfig of pages) {
    try {
      console.log(`📸 正在截取：${pageConfig.name} - ${pageConfig.description}`);

      const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
      });

      // 导航到页面
      await page.goto(`${BASE_URL}${pageConfig.url}`, {
        waitUntil: pageConfig.wait,
        timeout: 30000
      });

      // 等待页面完全加载
      await page.waitForTimeout(2000);

      // 截图
      const outputPath = path.join(outputDir, `${pageConfig.name}.png`);
      await page.screenshot({
        path: outputPath,
        fullPage: true,
        type: 'png'
      });

      console.log(`✅ 已保存：${outputPath}\n`);

      await page.close();
    } catch (error) {
      console.error(`❌ 失败：${pageConfig.name} - ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('🎉 所有截图完成！');
  console.log(`📁 输出目录：${outputDir}`);
})();
