const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File, label: string): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${label}: Povolené jsou pouze formáty JPG, PNG a WEBP.`;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${label} je příliš velký (max. 5 MB).`;
  }
  return null;
}

export async function compressImageToBase64(
  file: File,
  maxDim = 1600,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          width = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context není dostupný."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nepodařilo se načíst obrázek."));
    };

    img.src = objectUrl;
  });
}
