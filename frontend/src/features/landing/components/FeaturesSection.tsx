import React from 'react';
import { FeatureCard } from './FeatureCard';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { features } from '@/data/landing/features';

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('features.heading')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
