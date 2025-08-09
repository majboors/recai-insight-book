import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Tags, CheckCircle } from 'lucide-react';

interface BeginnerFlowProps {
  onComplete: () => void;
}

export function BeginnerFlow({ onComplete }: BeginnerFlowProps) {
  const { language, t } = useLanguage();
  const [step, setStep] = useState<'choice' | 'success'>('choice');

  const handleChoice = (choice: 'scan' | 'categorize') => {
    // Simulate the chosen action
    setTimeout(() => {
      setStep('success');
    }, 1000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className={`text-3xl font-light mb-6 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
            {t('success_message')}
          </h2>

          <Button
            onClick={onComplete}
            size="lg"
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 hover:bg-white/30 px-12 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('start_tracking')}
          </Button>
        </div>
      </div>
    );
  }

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
    </div>
  );
}