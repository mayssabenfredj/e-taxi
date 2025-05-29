
import React from 'react';
import { cn } from '@/lib/utils';

interface Step {
  name: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Steps = ({ steps, currentStep, className }: StepsProps) => {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex space-x-2 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.name} className="flex-1">
            <div className="flex flex-col md:flex-row items-center">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                index < currentStep
                  ? "bg-etaxi-yellow text-black"
                  : index === currentStep
                  ? "bg-etaxi-yellow/20 text-etaxi-yellow border-2 border-etaxi-yellow"
                  : "bg-gray-100 text-gray-500"
              )}>
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="ml-0 md:ml-2 mt-2 md:mt-0 text-center md:text-left">
                <span className={cn(
                  "text-xs md:text-sm font-medium",
                  index <= currentStep ? "text-etaxi-yellow" : "text-gray-500"
                )}>
                  Étape {index + 1}
                </span>
                
                <span className={cn(
                  "block text-sm md:text-base font-medium",
                  index <= currentStep ? "text-foreground" : "text-gray-400"
                )}>
                  {step.name}
                </span>
              </div>
              
              {/* Connecteur entre étapes */}
              {index < steps.length - 1 && (
                <div className="hidden md:block h-0.5 flex-1 mx-4 bg-gray-200">
                  <div className={cn(
                    "h-0.5 bg-etaxi-yellow transition-all",
                    index < currentStep ? "w-full" : "w-0"
                  )} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export const Step = ({ name, description }: Step) => {
  return null; // Cette composante est juste pour la structure, elle n'est pas rendue
};
