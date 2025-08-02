import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import type { ProcessedData } from '@/@types';
import { identifyColumns, processData } from '@/utils';

interface UploadFileProps {
  onDataProcessed: (data: ProcessedData[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  fileName: string;
  setFileName: (name: string) => void;
}

const UploadFile = ({
  onDataProcessed,
  isProcessing,
  setIsProcessing,
  fileName,
  setFileName,
}: UploadFileProps) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
          const missingColumns = requiredColumns.filter((col) => !columnMapping[col]);

          if (missingColumns.length > 0) {
            toast({
              title: 'Colunas obrigatórias não encontradas',
              description: `Não foi possível identificar: ${missingColumns.join(', ')}. Verifique os nomes das colunas.`,
              variant: 'destructive',
            });
            return;
          }

          console.log('Mapeamento de colunas:', columnMapping);

          const processed = processData(jsonData, columnMapping);
          const invalidCount = processed.filter((item) => !item.isValid).length;

          if (invalidCount > 0) {
            toast({
              title: 'Registros com problemas encontrados',
              description: `${invalidCount} registro(s) com problemas foram identificados.`,
              variant: 'destructive',
            });
          }

          onDataProcessed(processed);

          toast({
            title: 'Planilha processada com sucesso!',
            description: `${processed.filter((item) => item.isValid).length} registros válidos encontrados.`,
          });
        } catch (error) {
          toast({
            title: 'Erro ao processar planilha',
            description: error instanceof Error ? error.message : 'Verifique se o arquivo está no formato correto.',
            variant: 'destructive',
          });
          console.error('Erro ao processar arquivo:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [onDataProcessed, setIsProcessing, setFileName, toast]
  );

  return (
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
  );
};

export default UploadFile; 