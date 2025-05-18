
// Food item type definition
export interface FoodItem {
  name: string;
  gi: number;
  description: string;
  image: string;
}

// Blood glucose record type definition
export interface BloodGlucoseRecord {
  value: number;
  ts: number; // timestamp
}

// Recognition result type definition
export interface RecognitionResult {
  food: string;
  gi: number;
  suggestion: string;
  confidence?: number;
  nutrition?: {
    carbs?: string;
    protein?: string;
    fiber?: string;
    fat?: string;
    [key: string]: string | undefined;
  };
}

// GI Category definitions
export type GICategory = "全部" | "低GI" | "中GI" | "高GI";

export const categorizeGI = (gi: number): GICategory => {
  if (gi < 55) return "低GI";
  if (gi < 70) return "中GI";
  return "高GI";
};
