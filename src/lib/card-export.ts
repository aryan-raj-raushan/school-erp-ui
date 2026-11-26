import { toBlob } from "html-to-image";
import JSZip from "jszip";
import { saveBlob } from "@/lib/save-blob";

const PRINT_PIXEL_RATIO = 3;

export function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "-") || "card";
}

export function waitForPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export async function exportCardAsPng(node: HTMLElement, fileName: string): Promise<boolean> {
  const blob = await toBlob(node, { pixelRatio: PRINT_PIXEL_RATIO, cacheBust: false, backgroundColor: "#ffffff" });
  if (!blob) return false;
  saveBlob(blob, `${safeFileName(fileName)}.png`);
  return true;
}

export async function exportCardsAsZip(
  cards: Array<{ node: HTMLElement; fileName: string }>,
  zipName: string,
  onProgress: (done: number, total: number) => void,
): Promise<number> {
  const zip = new JSZip();
  const used = new Set<string>();
  let done = 0;
  for (const { node, fileName } of cards) {
    const blob = await toBlob(node, { pixelRatio: PRINT_PIXEL_RATIO, cacheBust: false, backgroundColor: "#ffffff" });
    if (blob) {
      let name = safeFileName(fileName);
      for (let n = 2; used.has(name); n++) name = `${safeFileName(fileName)}-${n}`;
      used.add(name);
      zip.file(`${name}.png`, blob);
    }
    onProgress(++done, cards.length);
  }
  const archive = await zip.generateAsync({ type: "blob" });
  saveBlob(archive, `${safeFileName(zipName)}.zip`);
  return used.size;
}
