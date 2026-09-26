import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '@/components/Navigation';
import Preloader from '@/components/Preloader';
import PromoPopup from '@/components/PromoPopup';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import JoinPage from '@/pages/JoinPage';
import ProfilesPage from '@/pages/ProfilesPage';
import ProposalsPage from '@/pages/ProposalsPage';
import LoginPage from '@/pages/LoginPage';
import AdminPage from '@/pages/AdminPage';
import DashboardPage from '@/pages/DashboardPage';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const userInteractingRef = useRef(false);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        userInteractingRef.current = true;
      }
    };
    const onBlur = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        userInteractingRef.current = false;
      }
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  useEffect(() => {
    if (userInteractingRef.current) return;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <>
      {/* Preloader */}
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Promo Popup */}
      {showContent && <PromoPopup />}

      {/* Main Content */}
      <div
        className={`relative bg-white transition-opacity duration-700 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/proposals" element={<ProposalsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>

      {/* Global floating WhatsApp FAB */}
      {showContent && <WhatsAppFAB />}
    </>
  );
}

export default App;
