import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Users } from 'lucide-react';
import type { SpreadsheetStats } from '@/@types';

interface StatisticsProps {
  stats: SpreadsheetStats;
}

const Statistics = ({ stats }: StatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.totalRecords}</p>
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
            <p className="text-2xl font-bold text-foreground">{stats.approvedForEmission}</p>
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
            <p className="text-2xl font-bold text-foreground">{stats.rejectedForEmission}</p>
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
            <p className="text-2xl font-bold text-foreground">{stats.invalidRecords}</p>
            <p className="text-sm text-muted-foreground">Registros Inválidos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics; 