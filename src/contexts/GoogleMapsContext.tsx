import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface GoogleMapsContextType {
  isGoogleMapsLoaded: boolean;
  loadGoogleMaps: () => Promise<void>;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const loadGoogleMaps = async () => {
    if (isGoogleMapsLoaded || window.google?.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBlMBSsjVaMcxb7yT78o8AOh8IbqvRm340&libraries=places,marker&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const checkGoogleMapsLoaded = setInterval(() => {
          if (window.google?.maps?.Map) {
            clearInterval(checkGoogleMapsLoaded);
            setIsGoogleMapsLoaded(true);
            //toast.success('API Google Maps chargée avec succès');
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkGoogleMapsLoaded);
          if (!window.google?.maps?.Map) {
            toast.error('Timeout lors du chargement de Google Maps');
          }
        }, 10000);
      };

      script.onerror = () => {
        toast.error('Échec du chargement de l’API Google Maps. Vérifiez votre clé API.');
      };

      document.head.appendChild(script);
    } catch (error) {
      toast.error('Erreur lors du chargement de l’API Google Maps');
    }
  };

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isGoogleMapsLoaded, loadGoogleMaps }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps doit être utilisé dans un GoogleMapsProvider');
  }
  return context;
};