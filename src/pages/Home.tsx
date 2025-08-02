import { ProcessedData } from '@/@types';
import DataPreview from '@/components/DataPreview';
import Statistics from '@/components/Statistics';
import UploadFile from '@/components/UploadFile';
import { calculateStats } from '@/utils';
import { FileSpreadsheet } from 'lucide-react';
import { useMemo, useState } from 'react';

const Home = () => {
  const [uploadedData, setUploadedData] = useState<ProcessedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleDataProcessed = (data: ProcessedData[]) => {
    setUploadedData(data);
  };

  const stats = useMemo(() => calculateStats(uploadedData), [uploadedData]);
  const validData = useMemo(
    () => uploadedData.filter(item => item.isValid && item.willEmit),
    [uploadedData]
  );

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
        <UploadFile
          onDataProcessed={handleDataProcessed}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          fileName={fileName}
          setFileName={setFileName}
        />

        {/* Statistics */}
        {uploadedData.length > 0 && <Statistics stats={stats} />}

        {/* Valid Data Preview */}
        <DataPreview validData={validData} />
      </div>
    </div>
  );
};

export default Home;
