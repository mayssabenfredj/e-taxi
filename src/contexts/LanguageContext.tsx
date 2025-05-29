
import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Auth
    'signin': 'Se connecter',
    'signup': 'S\'inscrire',
    'email': 'Email',
    'password': 'Mot de passe',
    'forgotPassword': 'Mot de passe oublié?',
    'resetPassword': 'Réinitialiser le mot de passe',
    'confirmPassword': 'Confirmer le mot de passe',
    'companyName': 'Nom de l\'entreprise',
    'createAccount': 'Créer un compte',
    'alreadyHaveAccount': 'Vous avez déjà un compte?',
    'noAccount': 'Pas de compte?',
    
    // Dashboard
    'dashboard': 'Tableau de bord',
    'company': 'Entreprise',
    'employees': 'Employés',
    'transportRequests': 'Demandes de transport',
    'profile': 'Profil',
    'logout': 'Se déconnecter',
    
    // Company
    'companyInfo': 'Informations de l\'entreprise',
    'address': 'Adresse',
    'phone': 'Téléphone',
    'sector': 'Secteur d\'activité',
    'logo': 'Logo',
    'save': 'Enregistrer',
    
    // Employees
    'addEmployee': 'Ajouter un employé',
    'employeeName': 'Nom de l\'employé',
    'importCSV': 'Importer CSV',
    'pendingRequests': 'Demandes en attente',
    'actions': 'Actions',
    'accept': 'Accepter',
    'reject': 'Rejeter',
    
    // Transport
    'newRequest': 'Nouvelle demande',
    'departureDate': 'Date de départ',
    'departureTime': 'Heure de départ',
    'type': 'Type',
    'private': 'Privé',
    'public': 'Public',
    'note': 'Note',
    'passengers': 'Passagers',
    'departureAddress': 'Adresse de départ',
    'arrivalAddress': 'Adresse d\'arrivée',
    'status': 'Statut',
    'pending': 'En attente',
    'confirmed': 'Confirmé',
    'inProgress': 'En cours',
    'completed': 'Terminé',
    'cancelled': 'Annulé',
  },
  en: {
    // Auth
    'signin': 'Sign In',
    'signup': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'forgotPassword': 'Forgot password?',
    'resetPassword': 'Reset password',
    'confirmPassword': 'Confirm password',
    'companyName': 'Company name',
    'createAccount': 'Create account',
    'alreadyHaveAccount': 'Already have an account?',
    'noAccount': 'No account?',
    
    // Dashboard
    'dashboard': 'Dashboard',
    'company': 'Company',
    'employees': 'Employees',
    'transportRequests': 'Transport requests',
    'profile': 'Profile',
    'logout': 'Logout',
    
    // Company
    'companyInfo': 'Company information',
    'address': 'Address',
    'phone': 'Phone',
    'sector': 'Business sector',
    'logo': 'Logo',
    'save': 'Save',
    
    // Employees
    'addEmployee': 'Add employee',
    'employeeName': 'Employee name',
    'importCSV': 'Import CSV',
    'pendingRequests': 'Pending requests',
    'actions': 'Actions',
    'accept': 'Accept',
    'reject': 'Reject',
    
    // Transport
    'newRequest': 'New request',
    'departureDate': 'Departure date',
    'departureTime': 'Departure time',
    'type': 'Type',
    'private': 'Private',
    'public': 'Public',
    'note': 'Note',
    'passengers': 'Passengers',
    'departureAddress': 'Departure address',
    'arrivalAddress': 'Arrival address',
    'status': 'Status',
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'inProgress': 'In progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
