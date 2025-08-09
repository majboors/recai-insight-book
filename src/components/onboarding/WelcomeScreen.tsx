import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex flex-col">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="ghost"
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === 'en' ? t('urdu') : t('english')}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <h1 className={`text-5xl md:text-6xl font-light mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ${language === 'ur' ? 'font-urdu' : ''}`}>
            {t('welcome_headline')}
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
            {t('welcome_subtext')}
          </p>

          <Button
            onClick={onContinue}
            size="lg"
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 hover:bg-white/30 px-12 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}