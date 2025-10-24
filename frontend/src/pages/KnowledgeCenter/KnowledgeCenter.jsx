import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Home/components/Header/Header.jsx';
import Footer from '../Home/components/Footer/Footer';
import FAQ from '../Home/components/FAQ/FAQ';

const KnowledgeCenter = () => {
  const [searchParams] = useSearchParams();
  const [initialTab, setInitialTab] = useState('faqs');
  const [targetQuestion, setTargetQuestion] = useState(null);

  useEffect(() => {
    // Handle tab parameter
    const tab = searchParams.get('tab');
    if (tab && ['faqs', 'guide', 'support', 'glossary'].includes(tab)) {
      setInitialTab(tab);
    }

    // Handle deep linking to specific question
    const questionId = searchParams.get('question');
    if (questionId) {
      setTargetQuestion(questionId);
      // Scroll to question after a brief delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(`heading-${questionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Trigger click to expand the question
          element.click();
        }
      }, 500);
    }

    // Handle category parameter (for FAQ filtering)
    const category = searchParams.get('category');
    if (category) {
      setTimeout(() => {
        const categoryElement = document.querySelector(`h3:contains("${category}")`);
        if (categoryElement) {
          categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [searchParams]);

  return (
    <>
      <Header />
      <main id="main-content" className="pt-16 md:pt-0 md:ml-[60px] bg-white min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-neutral-600">
            <a href="/" className="hover:text-blue-600 transition-colors duration-200">Home</a>
            <i className="ph ph-caret-right text-xs"></i>
            <span className="text-neutral-900 font-medium">Knowledge Center</span>
          </nav>
        </div>

        {/* FAQ Component with initial state */}
        <FAQ initialTab={initialTab} initialExpandedId={targetQuestion} />

        <Footer />
      </main>
    </>
  );
};

export default KnowledgeCenter;
