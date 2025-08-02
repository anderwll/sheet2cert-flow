import type { ValidationResult } from "@/@types/spreadsheet";

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates CPF format
 */
export const isValidCPF = (cpf: string): boolean => {
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return cpfRegex.test(cpf) && cpf.length === 14;
};

/**
 * Validates name (minimum 2 characters)
 */
export const isValidName = (name: string): boolean => {
  return name.length >= 2;
};

/**
 * Validates if certificate should be emitted
 */
export const shouldEmitCertificate = (certificadoValue: string): boolean => {
  const normalizedValue = certificadoValue.toLowerCase().trim();
  return ["sim", "s", "yes", "y", "1", "true"].includes(normalizedValue);
};

/**
 * Validates a complete record and returns validation result
 */
export const validateRecord = (
  name: string,
  cpf: string,
  email: string
): ValidationResult => {
  const errors: string[] = [];

  if (!isValidName(name)) {
    errors.push("Nome inválido");
  }

  if (!isValidCPF(cpf)) {
    errors.push("CPF inválido");
  }

  if (!isValidEmail(email)) {
    errors.push("E-mail inválido");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
