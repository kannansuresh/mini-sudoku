import Tesseract from 'tesseract.js';
import type { Area } from 'react-easy-crop';

export const scanGrid = async (imageFile: File, cropArea: Area): Promise<(number | null)[][]> => {
  const image = await createImage(imageFile);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Set canvas to normalized size
  const GRID_SIZE = 600;
  canvas.width = GRID_SIZE;
  canvas.height = GRID_SIZE;

  // Draw cropped image to canvas
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    GRID_SIZE,
    GRID_SIZE
  );

  const CELL_SIZE = GRID_SIZE / 6;
  const PADDING_PERCENT = 0.12; // 12% padding to remove borders
  const PADDING = CELL_SIZE * PADDING_PERCENT;

  const grid: (number | null)[][] = Array(6).fill(null).map(() => Array(6).fill(null));

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = CELL_SIZE - (PADDING * 2);
      cellCanvas.height = CELL_SIZE - (PADDING * 2);
      const cellCtx = cellCanvas.getContext('2d');

      if (!cellCtx) continue;

      // Extract cell with padding
      cellCtx.drawImage(
        canvas,
        (col * CELL_SIZE) + PADDING,
        (row * CELL_SIZE) + PADDING,
        CELL_SIZE - (PADDING * 2),
        CELL_SIZE - (PADDING * 2),
        0,
        0,
        cellCanvas.width,
        cellCanvas.height
      );

      // Convert to blob for Tesseract
      const blob = await new Promise<Blob | null>(resolve => cellCanvas.toBlob(resolve));
      if (!blob) continue;

      try {
        const { data: { text } } = await Tesseract.recognize(blob, 'eng', {
          tessedit_char_whitelist: '123456',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_CHAR,
        } as any);

        const num = parseInt(text.trim());
        if (!isNaN(num) && num >= 1 && num <= 6) {
          grid[row][col] = num;
        }
      } catch (error) {
        console.error(`Error scanning cell ${row},${col}:`, error);
      }
    }
  }

  return grid;
};

const createImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
};
