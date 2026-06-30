export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_MAX_WIDTH = 1280;
const DEFAULT_MAX_HEIGHT = 1280;
const FALLBACK_JPEG_QUALITY = 0.82;

function fileToDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
    image.src = src;
  });
}

function shouldPreserveAlpha(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return mimeType.includes("png") || mimeType.includes("webp") || mimeType.includes("gif");
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const originalDataUrl = await fileToDataURL(file);
  const image = await loadImage(originalDataUrl);

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;

  const widthRatio = maxWidth / image.naturalWidth;
  const heightRatio = maxHeight / image.naturalHeight;
  const scale = Math.min(widthRatio, heightRatio, 1);

  const targetWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const targetHeight = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d", {
    alpha: shouldPreserveAlpha(options.mimeType ?? file.type),
  });

  if (!ctx) {
    return originalDataUrl;
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const preserveAlpha = shouldPreserveAlpha(options.mimeType ?? file.type);
  const mimeType = options.mimeType ?? (preserveAlpha ? "image/png" : "image/jpeg");
  const quality = preserveAlpha ? undefined : options.quality ?? FALLBACK_JPEG_QUALITY;

  const compressedDataUrl = canvas.toDataURL(mimeType, quality);

  // Return the shortest payload to avoid inflating the data URL accidentally.
  return compressedDataUrl.length < originalDataUrl.length || scale < 1
    ? compressedDataUrl
    : originalDataUrl;
}
