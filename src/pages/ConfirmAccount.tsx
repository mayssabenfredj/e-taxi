import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { entrepriseService } from '@/services/entreprise.service';
import { toast } from 'sonner';

export function ConfirmAccount() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyAccount = async () => {
      if (!token) {
        setStatus('error');
        toast.error('Jeton d\'activation manquant');
        return;
      }

      try {
                console.log('Toookeen', token);
        await entrepriseService.verifyAccount(token);
        setStatus('success');
        toast.success('Compte activé avec succès !');
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Erreur lors de l\'activation du compte';
        toast.error(errorMessage);
      }
    };

    verifyAccount();
  }, [token]);

  const handleRedirect = () => {
    if (status === 'success') {
      navigate('/auth');
    } else {
      navigate('/contact');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-etaxi-yellow/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 border-4 border-etaxi-yellow border-t-transparent rounded-full animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500 animate-pulse" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirmation en cours...'}
            {status === 'success' && 'Compte activé avec succès !'}
            {status === 'error' && 'Erreur d\'activation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-muted-foreground">
              Nous vérifions votre compte, veuillez patienter...
            </p>
          )}
          
          {status === 'success' && (
            <>
              <p className="text-muted-foreground">
                Votre compte a été activé avec succès ! Vous recevez un email contenant votre mot de passe pour vous connecter.
              </p>
              <Button 
                className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black"
                onClick={handleRedirect}
              >
                Se connecter
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p className="text-muted-foreground mb-4">
                Une erreur s'est produite lors de l'activation de votre compte.
              </p>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Essayer de s'inscrire à nouveau
                </Button>
                <Button 
                  className="w-full bg-etaxi-yellow hover:bg-yellow-500 text-black"
                  onClick={handleRedirect}
                >
                  Nous contacter
                </Button>
              </div>
              <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                <p className="font-medium mb-2">Besoin d'aide ?</p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>70 028 128</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>contact@etaxi.tn</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}