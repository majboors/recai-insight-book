import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Receipt, BarChart3 } from 'lucide-react';

interface SkillLevelChoiceProps {
  onBeginnerSelect: () => void;
  onAdvancedSelect: () => void;
}

export function SkillLevelChoice({ onBeginnerSelect, onAdvancedSelect }: SkillLevelChoiceProps) {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <h2 className={`text-3xl md:text-4xl font-light mb-12 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
          {t('skill_level_title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Beginner Card */}
          <div 
            onClick={onBeginnerSelect}
            className="group cursor-pointer"
          >
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Receipt className="w-10 h-10 text-blue-600" />
              </div>
              
              <h3 className={`text-2xl font-semibold mb-3 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
                {t('beginner_title')}
              </h3>
              
              <p className={`text-gray-600 mb-2 ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
                {t('beginner_subtitle')}
              </p>
              
              <p className={`text-sm text-gray-500 italic ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
                {t('beginner_urdu')}
              </p>
            </div>
          </div>

          {/* Advanced Card */}
          <div 
            onClick={onAdvancedSelect}
            className="group cursor-pointer"
          >
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className={`text-2xl font-semibold mb-3 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
                {t('advanced_title')}
              </h3>
              
              <p className={`text-gray-600 mb-2 ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
                {t('advanced_subtitle')}
              </p>
              
              <p className={`text-sm text-gray-500 italic ${language === 'ur' ? 'font-urdu text-right' : ''}`}>
                {t('advanced_urdu')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}