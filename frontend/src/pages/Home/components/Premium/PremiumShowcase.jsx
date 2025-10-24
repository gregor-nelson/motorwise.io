import React from 'react';
import FeatureSections from './Featuresections';
import TransitionBridge from './TransitionBridge';
import ReportPreviewShowcase from './ReportPreviewShowcase';

/**
 * Main Premium Showcase Component
 * Combines Feature Sections, Transition Bridge, and Report Preview in proper sequence
 * Following the Hero design system: cyan-blue gradients, shadow-2xl, AnimeJS animations
 */
const PremiumShowcase = () => {
  return (
    <div className="w-full">
      {/* Feature Sections - storytelling about data & capabilities */}
      <FeatureSections />

      {/* Transition Bridge - connecting narrative */}
      <TransitionBridge />

      {/* Report Preview Showcase - interactive demo of actual report UI */}
      <ReportPreviewShowcase />
    </div>
  );
};

export default PremiumShowcase;
