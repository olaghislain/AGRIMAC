export interface NormalizedMachine {
  externalId?: string;
  sourceUrl: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  machineType?: string;
  description?: string;
  technicalSpecs?: Record<string, string>;
  price?: number;
  currency: string;
  availability?: string;
  location?: string;
  imageUrl?: string;
}
