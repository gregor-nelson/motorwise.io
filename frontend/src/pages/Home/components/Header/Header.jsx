/* ============================================
   MINIMAL REACT WRAPPER
   The actual Header logic is 100% vanilla JS
   This file only exists to integrate with React
   ============================================ */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VanillaHeader } from './Header.js';

export default function Header() {
  const containerRef = useRef(null);
  const headerInstance = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize vanilla JS header
    if (containerRef.current) {
      headerInstance.current = new VanillaHeader(containerRef.current);
    }

    // Listen for navigation events from vanilla JS
    const handleNavigate = (e) => {
      navigate(e.detail.path);
    };

    window.addEventListener('navigate', handleNavigate);

    // Cleanup
    return () => {
      headerInstance.current?.destroy();
      window.removeEventListener('navigate', handleNavigate);
    };
  }, [navigate]);

  return <div ref={containerRef}></div>;
}
