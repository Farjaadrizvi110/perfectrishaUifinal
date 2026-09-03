import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function PromoPopup() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    const dismissed = sessionStorage.getItem('perfectrishta_popup_dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      hasShown.current = true;
      setVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = 'hidden';
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(cardRef.current,
      { scale: 0.6, opacity: 0, y: 80 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.55)', delay: 0.1 }
    );
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem('perfectrishta_popup_dismissed', 'true');
    document.body.style.overflow = '';
    setVisible(false);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    gsap.to(cardRef.current, { scale: 0.8, opacity: 0, y: 40, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: dismiss
    });
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem('perfectrishta_selected_plan', 'Silver');
    sessionStorage.setItem('perfectrishta_popup_dismissed', 'true');
    gsap.to(cardRef.current, { scale: 0.85, opacity: 0, y: 30, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        document.body.style.overflow = '';
        setVisible(false);
        navigate('/join');
      }
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 2, 2, 0.72)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        ref={cardRef}
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: 'min(430px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, #800020 0%, #4A0404 55%, #2d0202 100%)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.25), 0 0 60px rgba(212,175,55,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top border */}
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, #F3E5AB, #D4AF37, transparent)' }} />

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-gold/12" />
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border border-gold/8" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full border border-gold/8" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full" style={{ border: '1px solid rgba(212,175,55,0.06)', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 hover:scale-110"
          style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)' }}
          aria-label="Close"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="relative z-10 px-7 py-9 sm:px-9 sm:py-11 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6" style={{ background: 'rgba(212,175,55,0.14)', border: '1px solid rgba(212,175,55,0.35)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.9l-6.2 4.4 2.4-7.4L2 9.4h7.6z"/></svg>
            <span className="font-body text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#F3E5AB' }}>Limited Time Offer</span>
          </div>

          {/* Heading */}
          <h2 className="font-display font-light text-white leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)' }}>
            100% Free<br />
            <span className="font-medium" style={{ color: '#F3E5AB' }}>Profile Registration</span>
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
            <div className="w-2 h-2 rotate-45" style={{ background: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.4)' }} />
            <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
          </div>

          {/* Description */}
          <p className="font-body text-xs sm:text-sm text-white/55 leading-relaxed mb-7 max-w-[310px] mx-auto">
            Join the UK's most trusted Islamic Marriage Bureau. Create your profile absolutely free and let us help you find your perfect match, In Sha Allah.
          </p>

          {/* CTA */}
          <button
            onClick={handleRegister}
            className="w-full py-4 rounded-full font-body text-xs sm:text-sm font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #c49b27)', color: '#4A0404', boxShadow: '0 4px 20px rgba(212,175,55,0.25)' }}
          >
            Register Now — Silver Plan
          </button>

          {/* Sub-text */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p className="font-body text-[10px] sm:text-[11px] text-white/30">Silver package &middot; 3 months &middot; Free registration</p>
          </div>
        </div>

        {/* Gold bottom border */}
        <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
      </div>
    </div>
  );
}
