export interface Material {
  name: string;
  amount: number;
  factor: number;
  oxidation: number;
  emission: number;
  isPrevious: boolean;
  evidence?: {
    name: string;
    path: string;
  };
}

export interface Fuel {
 name: string;
  englishName?: string; // ✅ 이 줄 추가
  amount: number;
  factor: number;
  netCalorific: number;
  oxidation: number;
  emission: number;
  evidence?: {
    name: string;
    path: string;
  };
  indirectEmission?: number;
}
export interface Electricity {
  amount: number;
  factor: number;
  indirectEmission?: number;
}

export interface Precursor {
  name: string;
  amount: number;
  directFactor: number;
  indirectFactor: number;
  directEmission: number;
  indirectEmission: number;
  isIndirectEmissionManual?: boolean;
}

export interface ProcessData {
  order: number;
  name: string;
  startDate: string;
  endDate: string;
  materials: Material[];
  fuels: Fuel[];
  electricity: Electricity;
  precursors: Precursor[];
  totalProcessDirectEmission?: number;
  totalProcessIndirectEmission?: number;
  totalProcessPrecursorEmission?: number;
  totalProcessOverallEmission?: number;
}

