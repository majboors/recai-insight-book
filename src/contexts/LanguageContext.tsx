import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Welcome Screen
    welcome_headline: "Your Money, Made Simple",
    welcome_subtext: "Scan receipts, track spending, and see where your money goes — all in one place.",
    continue: "Continue",
    
    // Skill Level
    skill_level_title: "Choose Your Experience Level",
    beginner_title: "Beginner",
    beginner_subtitle: "First time with finance apps",
    beginner_urdu: "Pehli dafa hisaab rakh rahe hain?",
    advanced_title: "Advanced", 
    advanced_subtitle: "I've used finance apps before",
    advanced_urdu: "Aap pehle se budgeting ke expert hain?",
    
    // Beginner Flow
    beginner_headline: "We'll walk you through step-by-step",
    beginner_subtext: "Start with the basics, and you'll be budgeting in minutes.",
    quick_start: "Quick Start – Scan a Receipt",
    quick_start_urdu: "Receipt ki tasveer lein – baaqi hum karenge",
    categorize: "Categorize Your Finances", 
    categorize_urdu: "Apne kharchon ko categories mein rakhein",
    success_message: "You're on your way to tracking smarter spending!",
    
    // Advanced Flow
    command_center: "Here's your command center",
    start_tracking: "Start Tracking",
    
    // Common
    language: "Language",
    english: "English",
    urdu: "اردو"
  },
  ur: {
    welcome_headline: "آپ کا پیسہ، آسان بنایا گیا",
    welcome_subtext: "رسیدیں اسکین کریں، اخراجات کا شمار کریں، اور دیکھیں کہ آپ کا پیسہ کہاں جاتا ہے — سب کچھ ایک جگہ۔",
    continue: "جاری رکھیں",
    
    skill_level_title: "اپنا تجربہ کی سطح منتخب کریں",
    beginner_title: "ابتدائی",
    beginner_subtitle: "مالی ایپس کے ساتھ پہلی بار",
    beginner_urdu: "Pehli dafa hisaab rakh rahe hain?",
    advanced_title: "ایڈوانس",
    advanced_subtitle: "میں نے پہلے مالی ایپس استعمال کیے ہیں",
    advanced_urdu: "Aap pehle se budgeting ke expert hain?",
    
    beginner_headline: "ہم آپ کو قدم بہ قدم لے کر چلیں گے",
    beginner_subtext: "بنیادی باتوں سے شروع کریں، اور آپ منٹوں میں بجٹ بنا رہے ہوں گے۔",
    quick_start: "فوری شروعات – رسید اسکین کریں",
    quick_start_urdu: "Receipt ki tasveer lein – baaqi hum karenge",
    categorize: "اپنے مالی معاملات کو تقسیم کریں",
    categorize_urdu: "Apne kharchon ko categories mein rakhein",
    success_message: "آپ ہوشیار اخراجات کی نگرانی کی راہ پر ہیں!",
    
    command_center: "یہ آپ کا کمانڈ سینٹر ہے",
    start_tracking: "ٹریکنگ شروع کریں",
    
    language: "زبان",
    english: "English",
    urdu: "اردو"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}