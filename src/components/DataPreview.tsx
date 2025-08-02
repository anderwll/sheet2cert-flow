import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, User, Phone, Mail } from 'lucide-react';
import type { ProcessedData } from '@/@types';

interface DataPreviewProps {
  validData: ProcessedData[];
}

const DataPreview = ({ validData }: DataPreviewProps) => {
  if (validData.length === 0) return null;

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          Aprovados para emissão ({validData.length})
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
  );
};

export default DataPreview; 