import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/real-estate.css'
import { registerServiceWorker, performanceMonitor } from './utils/serviceWorker'
import { measureWebVitals, reportWebVitals } from './utils/webVitals'

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for caching and performance
registerServiceWorker();

// Initialize performance monitoring
performanceMonitor.measurePageLoad();

// Measure and report Web Vitals
setTimeout(() => {
  const vitals = measureWebVitals();
  if (Object.keys(vitals).length > 0) {
    reportWebVitals();
  }
}, 5000); // Report after 5 seconds
