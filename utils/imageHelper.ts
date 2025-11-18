import { FilterState } from "../types";

// Generate CSS filter string
export const getFilterString = (filters: FilterState): string => {
  return `
    brightness(${filters.brightness}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%) 
    grayscale(${filters.grayscale}%) 
    sepia(${filters.sepia}%) 
    blur(${filters.blur}px) 
    hue-rotate(${filters.hueRotate}deg)
  `;
};

// Reads a file and returns a data URL
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Renders the final image with filters burned in to a base64 string for download
export const exportProcessedImage = async (
  imageSrc: string,
  filters: FilterState
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Apply filters
      ctx.filter = getFilterString(filters);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Export
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = (err) => reject(err);
  });
};
