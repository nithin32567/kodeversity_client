export const MAX_IMAGE_SIZE_KB = 400;
export const MAX_IMAGE_WIDTH = 800;
export const MAX_IMAGE_HEIGHT = 600;
export const DEFAULT_QUALITY = 0.8;

export const getBase64SizeKB = (base64: string): number => {
  const base64String = base64.split(",")[1] || base64;

  const sizeInBytes = (base64String.length * 3) / 4;
  return sizeInBytes / 1024;
};

export const validateImageSize = (
  base64: string,
  maxSizeKB: number = MAX_IMAGE_SIZE_KB,
): boolean => {
  return getBase64SizeKB(base64) <= maxSizeKB;
};

export const resizeImage = (
  file: File,
  maxWidth: number = MAX_IMAGE_WIDTH,
  maxHeight: number = MAX_IMAGE_HEIGHT,
  quality: number = DEFAULT_QUALITY,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(resizedBase64);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const compressImage = (base64: string, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = base64;
  });
};

export const processImage = async (
  file: File,
): Promise<{ base64: string; sizeKB: number; error?: string }> => {
  try {
    let base64 = await resizeImage(file);
    let sizeKB = getBase64SizeKB(base64);

    if (sizeKB > MAX_IMAGE_SIZE_KB) {
      let quality = 0.7;
      while (sizeKB > MAX_IMAGE_SIZE_KB && quality > 0.3) {
        base64 = await compressImage(base64, quality);
        sizeKB = getBase64SizeKB(base64);
        quality -= 0.1;
      }

      if (sizeKB > MAX_IMAGE_SIZE_KB) {
        return {
          base64,
          sizeKB,
          error: `Image is too large (${sizeKB.toFixed(1)}kB). Please use a smaller image.`,
        };
      }
    }

    return { base64, sizeKB };
  } catch (error) {
    return {
      base64: "",
      sizeKB: 0,
      error: error instanceof Error ? error.message : "Failed to process image",
    };
  }
};
