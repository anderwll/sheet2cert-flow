import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, User, Phone, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { ProcessedData } from '@/@types';
import { EmissionService } from '@/services';
import { convertToEmissionDataArray } from '@/utils';

interface DataPreviewProps {
  validData: ProcessedData[];
}

const DataPreview = ({ validData }: DataPreviewProps) => {
  const [isEmitting, setIsEmitting] = useState(false);
  const { toast } = useToast();

  if (validData.length === 0) return null;

  const handleEmitCertificates = async () => {
    setIsEmitting(true);

    try {
      const emissionData = convertToEmissionDataArray(validData);
      const response = await EmissionService.emitCertificates(emissionData);

      if (response.success) {
        toast({
          title: 'Certificados emitidos com sucesso!',
          description: `${validData.length} certificado(s) foram enviados para emissão.`,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Erro ao emitir certificados',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao emitir certificados',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao emitir certificados:', error);
    } finally {
      setIsEmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          Aprovados para emissão ({validData.length})
        </CardTitle>
        <CardDescription>
          Estes registros estão aptos para serem emitidos o certificado.
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
            <Button
              className="bg-gradient-primary shadow-glow hover:shadow-glow/70"
              onClick={handleEmitCertificates}
              disabled={isEmitting}
            >
              {isEmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {isEmitting ? 'Emitindo...' : `Gerar Certificados (${validData.length})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview; 