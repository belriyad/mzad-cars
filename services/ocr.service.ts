import type { OCRExtractionResult } from "@/types/api";

/**
 * Backend assumption: OCR/VIN enrichment endpoints are not present in current swagger,
 * so these functions are mocked and structured for future API wiring.
 */
export const ocrService = {
  async extractFromRegistrationCard(): Promise<OCRExtractionResult> {
    return {
      vin: "WDDGF8AB4EA123456",
      make: "Mercedes-Benz",
      model: "C200",
      manufacture_year: 2020,
      color: "Black",
      owner_name: "Sample Owner",
      plate_number: "123456",
      confidence: {
        vin: 0.9,
        make: 0.88,
        model: 0.84,
        manufacture_year: 0.82,
      },
    };
  },
};
