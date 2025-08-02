import type {
  ColumnMapping,
  ProcessedData,
  SpreadsheetStats,
} from "@/@types/spreadsheet";
import { formatName, formatCPF, formatPhone } from "./formatters";
import { validateRecord, shouldEmitCertificate } from "./validators";

/**
 * Identifies columns in the spreadsheet based on header names
 */
export const identifyColumns = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {};

  headers.forEach((header) => {
    const normalizedHeader = header.toLowerCase().trim();

    // Name mapping
    if (
      ["nome", "name", "aluno", "estudante", "participante"].some((variant) =>
        normalizedHeader.includes(variant)
      )
    ) {
      mapping["nome"] = header;
    }

    // CPF mapping
    if (
      ["cpf", "documento", "doc"].some((variant) =>
        normalizedHeader.includes(variant)
      )
    ) {
      mapping["cpf"] = header;
    }

    // Phone mapping
    if (
      ["telefone", "phone", "celular", "cel", "fone", "whatsapp"].some(
        (variant) => normalizedHeader.includes(variant)
      )
    ) {
      mapping["telefone"] = header;
    }

    // Certificate mapping
    if (
      ["certificado", "certificate", "certificar", "emitir", "gerar"].some(
        (variant) => normalizedHeader.includes(variant)
      )
    ) {
      mapping["certificado"] = header;
    }

    // Email mapping
    if (
      ["email", "e-mail", "mail", "correio"].some((variant) =>
        normalizedHeader.includes(variant)
      )
    ) {
      mapping["email"] = header;
    }
  });

  return mapping;
};

/**
 * Processes raw spreadsheet data into structured format
 */
export const processData = (
  rawData: Record<string, unknown>[],
  columnMapping: ColumnMapping
): ProcessedData[] => {
  return rawData.map((row) => {
    const rawName = row[columnMapping["nome"]] || "";
    const rawCPF = row[columnMapping["cpf"]] || "";
    const rawEmail = row[columnMapping["email"]] || "";
    const rawTelefone = row[columnMapping["telefone"]] || "";
    const rawCertificado = row[columnMapping["certificado"]] || "";

    const processedName = formatName(rawName.toString());
    const processedCPF = formatCPF(rawCPF.toString());
    const processedPhone = formatPhone(rawTelefone.toString());
    const email = rawEmail.toString().trim();

    // Check if certificate should be emitted
    const willEmit = shouldEmitCertificate(rawCertificado.toString());

    // Validate record
    const validation = validateRecord(processedName, processedCPF, email);

    return {
      nome: processedName,
      cpf: processedCPF,
      telefone: processedPhone,
      email: email,
      isValid: validation.isValid,
      errors: validation.errors,
      willEmit,
    };
  });
};

/**
 * Calculates statistics from processed data
 */
export const calculateStats = (
  processedData: ProcessedData[]
): SpreadsheetStats => {
  const totalRecords = processedData.length;
  const approvedForEmission = processedData.filter(
    (item) => item.isValid && item.willEmit
  ).length;
  const rejectedForEmission = processedData.filter(
    (item) => item.isValid && !item.willEmit
  ).length;
  const invalidRecords = processedData.filter((item) => !item.isValid).length;

  return {
    totalRecords,
    approvedForEmission,
    rejectedForEmission,
    invalidRecords,
  };
};
