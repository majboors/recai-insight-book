import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Tags } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeginnerFlowProps {
  onComplete: () => void;
}

export function BeginnerFlow({ onComplete }: BeginnerFlowProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const tourSteps = [
    { title: 'Welcome to quick scanning', description: 'Upload a receipt image and let AI extract items.' },
    { title: 'Pick your book', description: 'Choose the book (instance) where this receipt will be stored.' },
    { title: 'Review items', description: 'Check extracted items and totals before saving.' },
    { title: 'Fix mistakes', description: 'Edit any line item name or price to correct it.' },
    { title: 'Save and track', description: 'Save results and see them in Analytics instantly.' }
  ];

  const handleChoice = (choice: 'scan' | 'categorize') => {
    if (choice === 'scan') {
      navigate('/scanner?tour=beginner');
    } else {
      navigate('/analytics?tab=categories');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <h2 className={`text-3xl md:text-4xl font-light mb-4 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
          {t('beginner_headline')}
        </h2>
        
        <p className={`text-xl text-gray-600 mb-12 ${language === 'ur' ? 'font-urdu' : ''}`}>
          {t('beginner_subtext')}
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Quick Start Card */}
          <div 
            onClick={() => handleChoice('scan')}
            className="group cursor-pointer"
          >
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-purple-600" />
              </div>
              
              <h3 className={`text-2xl font-semibold mb-3 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
                {t('quick_start')}
              </h3>
              
              <p className={`text-sm text-gray-500 italic ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
                {t('quick_start_urdu')}
              </p>
            </div>
          </div>

          {/* Categorize Card */}
          <div 
            onClick={() => handleChoice('categorize')}
            className="group cursor-pointer"
          >
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Tags className="w-10 h-10 text-orange-600" />
              </div>
              
              <h3 className={`text-2xl font-semibold mb-3 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
                {t('categorize')}
              </h3>
              
              <p className={`text-sm text-gray-500 italic ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
                {t('categorize_urdu')}
              </p>
            </div>
          </div>
        </div>
      </div>
      {showTour && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background/95 border rounded-3xl p-8 max-w-md mx-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-primary/10">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h3 className={`heading-zen text-xl mb-3 ${language === 'ur' ? 'font-urdu' : ''}`}>{tourSteps[tourStep].title}</h3>
            <p className={`text-zen mb-6 ${language === 'ur' ? 'font-urdu' : ''}`}>{tourSteps[tourStep].description}</p>
            <Button
              onClick={() => {
                if (tourStep < tourSteps.length - 1) setTourStep(tourStep + 1);
                else setShowTour(false);
              }}
            >
              {tourStep < tourSteps.length - 1 ? 'Next' : t('start_tracking')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}