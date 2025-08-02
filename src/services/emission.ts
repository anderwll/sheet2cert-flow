import axios from "axios";
import { api } from "./api";
import type { EmissionData, EmissionResponse, EmissionRequest } from "@/@types";

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
      const response = await api.post<EmissionResponse>("/emission", data);

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
}
