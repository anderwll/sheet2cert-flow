import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Mail, Phone, User, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

interface PersonData {
  nome: string;
  cpf: string;
  telefone: string;
  certificado: string;
  email: string;
}

interface ProcessedData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  isValid: boolean;
  errors: string[];
  willEmit: boolean; // Indica se o certificado será emitido
}

const SpreadsheetUpload = () => {
  const [uploadedData, setUploadedData] = useState<ProcessedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const formatCPF = (cpf: string): string => {
    // Remove tudo que não é número
    const numbers = cpf.replace(/\D/g, '');

    // Adiciona zeros à esquerda se necessário
    const paddedCPF = numbers.padStart(11, '0');

    // Aplica a máscara
    return paddedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string): string => {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');

    // Se não tem números suficientes, retorna o original
    if (numbers.length < 10) return phone;

    // Se tem 10 dígitos (DDD + 8 dígitos) - telefone fixo
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Se tem 11 dígitos (DDD + 9 dígitos) - celular
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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

  const formatName = (name: string): string => {
    // Remove 'copy' e variações (case insensitive) e converte para uppercase
    return name.replace(/\s*copy\s*\d*$/gi, '').trim().toUpperCase();
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const identifyColumns = (headers: string[]): { [key: string]: string } => {
    const mapping: { [key: string]: string } = {};

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();

      // Mapeamento de nomes
      if (['nome', 'name', 'aluno', 'estudante', 'participante'].some(variant =>
        normalizedHeader.includes(variant))) {
        mapping['nome'] = header;
      }

      // Mapeamento de CPF
      if (['cpf', 'documento', 'doc'].some(variant =>
        normalizedHeader.includes(variant))) {
        mapping['cpf'] = header;
      }

      // Mapeamento de telefone
      if (['telefone', 'phone', 'celular', 'cel', 'fone', 'whatsapp'].some(variant =>
        normalizedHeader.includes(variant))) {
        mapping['telefone'] = header;
      }

      // Mapeamento de certificado
      if (['certificado', 'certificate', 'certificar', 'emitir', 'gerar'].some(variant =>
        normalizedHeader.includes(variant))) {
        mapping['certificado'] = header;
      }

      // Mapeamento de email
      if (['email', 'e-mail', 'mail', 'correio'].some(variant =>
        normalizedHeader.includes(variant))) {
        mapping['email'] = header;
      }
    });

    return mapping;
  };

  const processData = (rawData: Record<string, unknown>[], columnMapping: { [key: string]: string }): ProcessedData[] => {
    const processed = rawData.map(row => {
      const errors: string[] = [];

      const rawName = row[columnMapping['nome']] || '';
      const rawCPF = row[columnMapping['cpf']] || '';
      const rawEmail = row[columnMapping['email']] || '';
      const rawTelefone = row[columnMapping['telefone']] || '';
      const rawCertificado = row[columnMapping['certificado']] || '';

      const processedName = formatName(rawName.toString());
      const processedCPF = formatCPF(rawCPF.toString());
      const processedPhone = formatPhone(rawTelefone.toString());
      const email = rawEmail.toString().trim();

      // Verifica se o certificado será emitido
      const certificadoValue = rawCertificado.toString().toLowerCase().trim();
      const willEmit = ['sim', 's', 'yes', 'y', '1', 'true'].includes(certificadoValue);

      if (!processedName || processedName.length < 2) errors.push('Nome inválido');
      if (processedCPF.length !== 14 || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(processedCPF)) errors.push('CPF inválido');
      if (!isValidEmail(email)) errors.push('E-mail inválido');

      return {
        nome: processedName,
        cpf: processedCPF,
        telefone: processedPhone,
        email: email,
        isValid: errors.length === 0,
        errors,
        willEmit
      };
    });

    return processed;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Obter os dados com headers originais
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as Record<string, unknown>[];

        if (jsonData.length === 0) {
          throw new Error('Planilha vazia');
        }

        // Identificar automaticamente as colunas
        const headers = Object.keys(jsonData[0]);
        const columnMapping = identifyColumns(headers);

        // Verificar se todas as colunas obrigatórias foram identificadas
        const requiredColumns = ['nome', 'cpf', 'email', 'certificado'];
        const missingColumns = requiredColumns.filter(col => !columnMapping[col]);

        if (missingColumns.length > 0) {
          toast({
            title: "Colunas obrigatórias não encontradas",
            description: `Não foi possível identificar: ${missingColumns.join(', ')}. Verifique os nomes das colunas.`,
            variant: "destructive",
          });
          return;
        }

        console.log('Mapeamento de colunas:', columnMapping);

        const processed = processData(jsonData, columnMapping);
        const invalidCount = processed.filter(item => !item.isValid).length;

        if (invalidCount > 0) {
          toast({
            title: "Registros com problemas encontrados",
            description: `${invalidCount} registro(s) com problemas foram identificados.`,
            variant: "destructive",
          });
        }

        setUploadedData(processed);

        toast({
          title: "Planilha processada com sucesso!",
          description: `${processed.filter(item => item.isValid).length} registros válidos encontrados.`,
        });

      } catch (error) {
        toast({
          title: "Erro ao processar planilha",
          description: error instanceof Error ? error.message : "Verifique se o arquivo está no formato correto.",
          variant: "destructive",
        });
        console.error('Erro ao processar arquivo:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, [toast]);

  // Statistics
  const totalRecords = uploadedData.length;
  const approvedForEmission = uploadedData.filter(item => item.isValid && item.willEmit);
  const rejectedForEmission = uploadedData.filter(item => item.isValid && !item.willEmit);
  const invalidRecords = uploadedData.filter(item => !item.isValid);

  // Keep compatibility with existing code
  const validData = uploadedData.filter(item => item.isValid && item.willEmit);
  const invalidData = uploadedData.filter(item => !item.isValid);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-card text-foreground px-6 py-3 rounded-full shadow-card border">
            <FileSpreadsheet className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Sistema de Certificados</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Faça o upload da planilha Excel para processar os certificados
          </p>
        </div>

        {/* Upload Section */}
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Planilha
            </CardTitle>
            <CardDescription>
              Selecione um arquivo Excel (.xlsx, .xls) com as colunas: Nome, CPF, Telefone, Certificado, E-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileSpreadsheet className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground">Excel (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>

            {fileName && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Arquivo: {fileName}</span>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Processando planilha...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {uploadedData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
                  <p className="text-sm text-muted-foreground">Total de registros</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{approvedForEmission.length}</p>
                  <p className="text-sm text-muted-foreground">Aprovados para emissão</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-warning/10 rounded-full">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{rejectedForEmission.length}</p>
                  <p className="text-sm text-muted-foreground">Rejeitados para emissão</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{invalidRecords.length}</p>
                  <p className="text-sm text-muted-foreground">Registros Inválidos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Valid Data Preview */}
        {validData.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                Registros Válidos ({validData.length})
              </CardTitle>
              <CardDescription>
                Estes registros serão processados para gerar os certificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">CPF</th>
                      <th className="text-left p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-mail
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {validData.map((item, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-background/50">
                        <td className="p-3">{item.nome}</td>
                        <td className="p-3 font-mono">{item.cpf}</td>
                        <td className="p-3">{item.telefone}</td>
                        <td className="p-3">{item.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validData.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button className="bg-gradient-primary shadow-glow hover:shadow-glow/70">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Certificados ({validData.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rejected Records */}
        {rejectedForEmission.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-5 h-5" />
                Registros Rejeitados ({rejectedForEmission.length})
              </CardTitle>
              <CardDescription>
                Estes registros são válidos mas não terão certificados emitidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">CPF</th>
                      <th className="text-left p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-mail
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedForEmission.map((item, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-background/50">
                        <td className="p-3">{item.nome}</td>
                        <td className="p-3 font-mono">{item.cpf}</td>
                        <td className="p-3">{item.telefone}</td>
                        <td className="p-3">{item.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invalid Data Preview */}
        {invalidData.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Registros Inválidos ({invalidData.length})
              </CardTitle>
              <CardDescription>
                Estes registros foram descartados devido a erros de validação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">Nome</th>
                      <th className="text-left p-3 font-semibold">CPF</th>
                      <th className="text-left p-3 font-semibold">E-mail</th>
                      <th className="text-left p-3 font-semibold">Erros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invalidData.map((item, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="p-3">{item.nome || '-'}</td>
                        <td className="p-3 font-mono">{item.cpf || '-'}</td>
                        <td className="p-3">{item.email || '-'}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {item.errors.map((error, errorIndex) => (
                              <span
                                key={errorIndex}
                                className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded"
                              >
                                {error}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpreadsheetUpload;