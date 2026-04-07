// 卡片生成工具
import { toPng } from 'html-to-image';

export interface CardGeneratorOptions {
  quality?: number;
  pixelRatio?: number;
}

export async function generateCardImage(
  element: HTMLElement,
  options: CardGeneratorOptions = {}
): Promise<string> {
  const {
    quality = 1,
    pixelRatio = 2, // 2x 分辨率
  } = options;

  try {
    const dataUrl = await toPng(element, {
      quality,
      pixelRatio,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    return dataUrl;
  } catch (error) {
    console.error('[CardGenerator] 生成卡片失败:', error);
    throw new Error('卡片生成失败');
  }
}

export async function downloadCardImage(
  element: HTMLElement,
  filename: string = 'poetry-card.png',
  options?: CardGeneratorOptions
): Promise<void> {
  try {
    const dataUrl = await generateCardImage(element, options);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('[CardGenerator] 下载卡片失败:', error);
    throw error;
  }
}

export async function copyCardToClipboard(
  element: HTMLElement,
  options?: CardGeneratorOptions
): Promise<boolean> {
  try {
    const dataUrl = await generateCardImage(element, options);
    const blob = await (await fetch(dataUrl)).blob();

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    return true;
  } catch (error) {
    console.error('[CardGenerator] 复制到剪贴板失败:', error);
    return false;
  }
}
