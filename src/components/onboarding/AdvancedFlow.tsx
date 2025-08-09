import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Scan, BarChart, FolderOpen } from 'lucide-react';

interface AdvancedFlowProps {
  onComplete: () => void;
}

export function AdvancedFlow({ onComplete }: AdvancedFlowProps) {
  const { language, t } = useLanguage();
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    // Start tour after component mounts
    const timer = setTimeout(() => setShowTour(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const tourSteps = [
    { 
      icon: Scan, 
      title: "Quick scan button",
      description: "Instantly capture and categorize receipts",
      position: "top-left"
    },
    { 
      icon: BarChart, 
      title: "Reports view",
      description: "Detailed analytics and spending insights",
      position: "top-right"
    },
    { 
      icon: FolderOpen, 
      title: "Category manager",
      description: "Organize your expenses your way",
      position: "bottom"
    }
  ];

  const nextStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-6 relative">
      {/* Mock Dashboard Preview */}
      <div className="max-w-6xl mx-auto w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center relative">
              <Scan className="w-6 h-6 text-blue-600" />
              {showTour && tourStep === 0 && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center relative">
              <BarChart className="w-6 h-6 text-green-600" />
              {showTour && tourStep === 1 && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/40 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Monthly Spending</h3>
            <p className="text-3xl font-bold text-gray-800">Rs 45,000</p>
          </div>
          <div className="bg-white/40 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">This Week</h3>
            <p className="text-3xl font-bold text-gray-800">Rs 8,500</p>
          </div>
          <div className="bg-white/40 rounded-2xl p-6 relative">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Categories</h3>
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">12 active</span>
            </div>
            {showTour && tourStep === 2 && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white/40 rounded-2xl p-6 h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Your spending trends will appear here</p>
          </div>
        </div>
      </div>

      {/* Tour Overlay */}
      {showTour && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-6 text-center shadow-2xl border border-white/30">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
              {(() => {
                const IconComponent = tourSteps[tourStep].icon;
                return <IconComponent className="w-8 h-8 text-primary" />;
              })()}
            </div>
            
            <h3 className={`text-xl font-semibold mb-3 text-gray-800 ${language === 'ur' ? 'font-urdu' : ''}`}>
              {tourStep === 0 && t('command_center')}
              {tourStep > 0 && tourSteps[tourStep].title}
            </h3>
            
            <p className={`text-gray-600 mb-6 ${language === 'ur' ? 'font-urdu' : ''}`}>
              {tourSteps[tourStep].description}
            </p>

            <Button
              onClick={nextStep}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full font-medium"
            >
              {tourStep < tourSteps.length - 1 ? (
                <span className="flex items-center">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              ) : (
                t('start_tracking')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}