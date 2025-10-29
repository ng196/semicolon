import React from 'react';
import * as Icons from 'lucide-react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  index,
}) => {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (Icons as any)[icon] || Icons.Box;

  return (
    <div
      className="feature-card group"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="feature-card-content">
        {/* Icon */}
        <div className="feature-icon-wrapper">
          <IconComponent className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/60 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
