export interface FilterState {
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturation: number; // 0-200, default 100
  grayscale: number;  // 0-100, default 0
  sepia: number;      // 0-100, default 0
  blur: number;       // 0-20, default 0
  hueRotate: number;  // 0-360, default 0
}

export const DEFAULT_FILTERS: FilterState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  hueRotate: 0,
};

export interface Preset {
  name: string;
  filter: Partial<FilterState>;
}

export const PRESETS: Preset[] = [
  { name: 'Normal', filter: DEFAULT_FILTERS },
  { name: 'Noir', filter: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 120, brightness: 90 } },
  { name: 'Warmth', filter: { ...DEFAULT_FILTERS, sepia: 50, contrast: 110, saturation: 130 } },
  { name: 'Vintage', filter: { ...DEFAULT_FILTERS, sepia: 30, brightness: 110, saturation: 80, contrast: 90 } },
  { name: 'Cyber', filter: { ...DEFAULT_FILTERS, saturation: 180, contrast: 130, hueRotate: 15 } },
];
