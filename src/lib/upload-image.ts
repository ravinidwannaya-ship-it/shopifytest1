/**
 * Client-side image upload: reads a picked file, resizes it down and returns a
 * compact data URL that can be stored directly in settings or the catalog.
 */
export async function fileToImageUrl(
  file: File,
  { maxWidth = 1600, quality = 0.85 }: { maxWidth?: number; quality?: number } = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image is larger than 8 MB");

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });

  // SVGs and small files pass through untouched.
  if (file.type === "image/svg+xml") return dataUrl;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("That image couldn't be loaded"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxWidth / (img.naturalWidth || maxWidth));
  if (scale === 1 && dataUrl.length < 400_000) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round((img.naturalWidth || maxWidth) * scale);
  canvas.height = Math.round((img.naturalHeight || maxWidth) * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const transparent = file.type === "image/png" || file.type === "image/webp";
  return canvas.toDataURL(transparent ? "image/png" : "image/jpeg", quality);
}
