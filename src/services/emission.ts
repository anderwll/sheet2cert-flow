import axios from "axios";
import type { EmissionData, EmissionResponse, EmissionRequest } from "@/@types";
import { api } from "./api";

/**
 * Service for certificate emission
 */
export class EmissionService {
  /**
   * Send emission data to API
   */
  static async emitCertificates(
    data: EmissionData[]
  ): Promise<EmissionResponse> {
    try {
      const requestData: EmissionRequest = { data };

      const response = await api.post<EmissionResponse>(
        "/emission",
        requestData
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle axios errors
        const message =
          error.response?.data?.message ||
          error.message ||
          "Erro na comunicação com a API";
        return {
          success: false,
          message,
          data: error.response?.data,
        };
      }

      // Handle other errors
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Send single certificate emission
   */
  static async emitSingleCertificate(
    data: EmissionData
  ): Promise<EmissionResponse> {
    return this.emitCertificates([data]);
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await api.get("/health");
      return true;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }
}
