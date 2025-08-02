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

  const formatName = (name: string): string => {
    // Remove 'copy' (case insensitive) e converte para uppercase
    return name.replace(/copy/gi, '').trim().toUpperCase();
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const processData = (rawData: PersonData[]): ProcessedData[] => {
    const processed = rawData
      .filter(row => row.certificado?.toLowerCase() === 'sim')
      .map(row => {
        const errors: string[] = [];
        
        const processedName = formatName(row.nome || '');
        const processedCPF = formatCPF(row.cpf || '');
        const email = row.email?.trim() || '';
        
        if (!processedName) errors.push('Nome inválido');
        if (processedCPF.length !== 14) errors.push('CPF inválido');
        if (!isValidEmail(email)) errors.push('E-mail inválido');
        
        return {
          nome: processedName,
          cpf: processedCPF,
          telefone: row.telefone || '',
          email: email,
          isValid: errors.length === 0,
          errors
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as PersonData[];

        const processed = processData(jsonData);
        const invalidEmails = processed.filter(item => !item.isValid && item.errors.includes('E-mail inválido'));
        
        if (invalidEmails.length > 0) {
          toast({
            title: "E-mails inválidos encontrados",
            description: `${invalidEmails.length} registro(s) com e-mail inválido foram descartados.`,
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
          description: "Verifique se o arquivo está no formato correto.",
          variant: "destructive",
        });
        console.error('Erro ao processar arquivo:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, [toast]);

  const validData = uploadedData.filter(item => item.isValid);
  const invalidData = uploadedData.filter(item => !item.isValid);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-gradient-primary text-primary-foreground px-6 py-3 rounded-full shadow-glow">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{uploadedData.length}</p>
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
                  <p className="text-2xl font-bold text-foreground">{validData.length}</p>
                  <p className="text-sm text-muted-foreground">Registros válidos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{invalidData.length}</p>
                  <p className="text-sm text-muted-foreground">Registros inválidos</p>
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