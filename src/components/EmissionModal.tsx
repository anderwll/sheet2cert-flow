import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle, Loader2 } from 'lucide-react';

interface EmissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isSuccess: boolean;
  successMessage?: string;
}

const EmissionModal = ({ 
  isOpen, 
  onOpenChange, 
  isLoading, 
  isSuccess, 
  successMessage 
}: EmissionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {isLoading && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-lg font-semibold">Emitindo certificados...</h3>
              <p className="text-muted-foreground text-center">
                Aguarde enquanto os certificados estão sendo processados.
              </p>
            </>
          )}
          
          {isSuccess && (
            <>
              <CheckCircle className="w-12 h-12 text-success" />
              <h3 className="text-lg font-semibold text-success">Sucesso!</h3>
              <p className="text-muted-foreground text-center">
                {successMessage || 'Certificados emitidos com sucesso!'}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmissionModal;