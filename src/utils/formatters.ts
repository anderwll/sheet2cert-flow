/**
 * Formats CPF with mask (XXX.XXX.XXX-XX)
 */
export const formatCPF = (cpf: string): string => {
  // Remove tudo que não é número
  const numbers = cpf.replace(/\D/g, "");

  // Adiciona zeros à esquerda se necessário
  const paddedCPF = numbers.padStart(11, "0");

  // Aplica a máscara
  return paddedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

/**
 * Formats phone number with Brazilian mask
 */
export const formatPhone = (phone: string): string => {
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, "");

  // Se não tem números suficientes, retorna o original
  if (numbers.length < 10) return phone;

  // Se tem 10 dígitos (DDD + 8 dígitos) - telefone fixo
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  // Se tem 11 dígitos (DDD + 9 dígitos) - celular
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Se tem mais de 11 dígitos, assume que é celular com 9 dígitos
  if (numbers.length > 11) {
    const ddd = numbers.substring(0, 2);
    const number = numbers.substring(2, 11);
    return `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
  }

  // Se não se encaixa em nenhum padrão, retorna o original
  return phone;
};

/**
 * Formats name by removing 'copy' variations and converting to uppercase
 */
export const formatName = (name: string): string => {
  // Remove 'copy' e variações (case insensitive) e converte para uppercase
  return name
    .replace(/\s*copy\s*\d*$/gi, "")
    .trim()
    .toUpperCase();
};
