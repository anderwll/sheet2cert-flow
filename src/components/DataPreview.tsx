import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, User, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { ProcessedData } from '@/@types';
import { EmissionService } from '@/services';
import { convertToEmissionDataArray } from '@/utils';
import EmissionModal from './EmissionModal';

interface DataPreviewProps {
  validData: ProcessedData[];
}

const DataPreview = ({ validData }: DataPreviewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmitted, setIsEmitted] = useState(false);
  const { toast } = useToast();

  if (validData.length === 0) return null;

  const handleEmitCertificates = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const emissionData = convertToEmissionDataArray(validData);
      const response = await EmissionService.emitCertificates(emissionData);

      if (response.success) {
        setIsLoading(false);
        setIsSuccess(true);
        setIsEmitted(true);
        setSuccessMessage(response.message || 'Certificados emitidos com sucesso!');
        
        // Auto close modal after 3 seconds
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSuccess(false);
        }, 3000);
      } else {
        setIsModalOpen(false);
        toast({
          title: 'Erro ao emitir certificados',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsModalOpen(false);
      toast({
        title: 'Erro ao emitir certificados',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao emitir certificados:', error);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {isEmitted ? 'Certificados emitidos' : `Aprovados para emissão`} ({validData.length})
        </CardTitle>
        <CardDescription>
          {isEmitted 
            ? 'Todos os certificados foram emitidos com sucesso.' 
            : 'Estes registros estão aptos para serem emitidos o certificado.'
          }
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
                {isEmitted && (
                  <th className="text-left p-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Status
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {validData.map((item, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-background/50">
                  <td className="p-3">{item.nome}</td>
                  <td className="p-3 font-mono">{item.cpf}</td>
                  <td className="p-3">{item.telefone}</td>
                  <td className="p-3">{item.email}</td>
                  {isEmitted && (
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-success">
                        <CheckCircle className="w-4 h-4" />
                        Emitido
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {validData.length > 0 && !isEmitted && (
          <div className="mt-6 flex justify-center">
            <Button
              className="bg-gradient-primary shadow-glow hover:shadow-glow/70"
              onClick={handleEmitCertificates}
              disabled={isLoading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Emitir certificados ({validData.length})
            </Button>
          </div>
        )}
        
        <EmissionModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          isLoading={isLoading}
          isSuccess={isSuccess}
          successMessage={successMessage}
        />
      </CardContent>
    </Card>
  );
};

export default DataPreview; 