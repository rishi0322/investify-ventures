import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, Loader2 } from 'lucide-react';

interface WalletPinSetupProps {
  walletId: string;
  type: 'pin' | 'tpin';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WalletPinSetup({ walletId, type, open, onOpenChange, onSuccess }: WalletPinSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const title = type === 'pin' ? 'Set Wallet PIN' : 'Set Transaction PIN (TPIN)';
  const description = type === 'pin' 
    ? 'Create a 4-digit PIN to secure your wallet access'
    : 'Create a 4-digit TPIN for transaction verification';

  const handleSubmit = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({ variant: 'destructive', title: 'PIN must be 4 digits' });
      return;
    }

    if (pin !== confirmPin) {
      toast({ variant: 'destructive', title: 'PINs do not match' });
      return;
    }

    setLoading(true);

    try {
      // Call the edge function to hash and store the PIN securely
      const { data, error } = await supabase.functions.invoke('wallet-pin', {
        body: { action: 'set', pin, type }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: `${type === 'pin' ? 'Wallet PIN' : 'TPIN'} set successfully!` });
      setPin('');
      setConfirmPin('');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to set PIN', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            {type === 'pin' ? <Lock className="h-6 w-6 text-primary-foreground" /> : <Shield className="h-6 w-6 text-primary-foreground" />}
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Enter {type === 'pin' ? 'PIN' : 'TPIN'}</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm {type === 'pin' ? 'PIN' : 'TPIN'}</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Set {type === 'pin' ? 'PIN' : 'TPIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PinVerifyDialogProps {
  walletId: string;
  type: 'pin' | 'tpin';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
}

export function PinVerifyDialog({ 
  walletId,
  type, 
  open, 
  onOpenChange, 
  onSuccess,
  title = 'Verify PIN'
}: PinVerifyDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the edge function to verify the PIN securely
      const { data, error: invokeError } = await supabase.functions.invoke('wallet-pin', {
        body: { action: 'verify', pin, type }
      });

      if (invokeError) throw invokeError;

      if (data?.verified) {
        setPin('');
        setError('');
        onSuccess();
        onOpenChange(false);
      } else {
        setError('Incorrect PIN');
        toast({ variant: 'destructive', title: 'Incorrect PIN' });
      }
    } catch (error: any) {
      setError('Verification failed');
      toast({ variant: 'destructive', title: 'Verification failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setPin(''); setError(''); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            Enter your {type === 'pin' ? 'Wallet PIN' : 'Transaction PIN (TPIN)'} to continue
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            className={`text-center text-2xl tracking-widest ${error ? 'border-destructive' : ''}`}
          />
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleVerify} disabled={pin.length !== 4 || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Utility function to verify TPIN inline (for investment flow)
export async function verifyTpin(pin: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('wallet-pin', {
      body: { action: 'verify', pin, type: 'tpin' }
    });
    
    if (error) return false;
    return data?.verified === true;
  } catch {
    return false;
  }
}
