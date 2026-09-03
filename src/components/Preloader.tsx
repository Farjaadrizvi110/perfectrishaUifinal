import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const imageLeftRef = useRef<HTMLDivElement>(null);
  const imageRightRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const goldLineTopRef = useRef<HTMLDivElement>(null);
  const goldLineBottomRef = useRef<HTMLDivElement>(null);
  const decorativeCircleRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    };

    const safetyTimer = window.setTimeout(finish, 5000);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(safetyTimer);
          window.setTimeout(finish, 200);
        },
      });

      tl.fromTo(
        imageWrapRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'power2.out' }
      );

      tl.addLabel('slideOpen');
      tl.to(
        imageLeftRef.current,
        { xPercent: -100, duration: 0.6, ease: 'expo.inOut' },
        'slideOpen'
      );
      tl.to(
        imageRightRef.current,
        { xPercent: 100, duration: 0.6, ease: 'expo.inOut' },
        'slideOpen'
      );

      tl.call(
        () => {
          const video = videoRef.current;
          if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
          }
        },
        [],
        'slideOpen'
      );

      tl.fromTo(
        videoWrapRef.current,
        { scale: 1.06 },
        { scale: 1, duration: 0.7, ease: 'power2.out' },
        'slideOpen'
      );

      tl.fromTo(
        goldLineTopRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.45, ease: 'expo.out' },
        'slideOpen+=0.2'
      );
      tl.fromTo(
        goldLineBottomRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.45, ease: 'expo.out' },
        'slideOpen+=0.25'
      );

      tl.fromTo(
        decorativeCircleRef.current,
        { scale: 0, rotation: -120, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' },
        'slideOpen+=0.3'
      );

      tl.fromTo(
        brandRef.current,
        { y: 25, opacity: 0, letterSpacing: '0.55em' },
        { y: 0, opacity: 1, letterSpacing: '0.28em', duration: 0.6, ease: 'power3.out' },
        'slideOpen+=0.35'
      );

      tl.fromTo(
        taglineRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
        'slideOpen+=0.5'
      );

      tl.fromTo(
        progressTrackRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.35, ease: 'power2.out' },
        'slideOpen+=0.6'
      );

      tl.to(
        progressBarRef.current,
        {
          scaleX: 1,
          duration: 1.0,
          ease: 'power2.inOut',
          onUpdate: function () {
            setProgress(Math.round(this.progress() * 100));
          },
        },
        'slideOpen+=0.7'
      );

      tl.fromTo(
        percentageRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        'slideOpen+=0.75'
      );

      tl.to(
        [brandRef.current, taglineRef.current, percentageRef.current, progressTrackRef.current, decorativeCircleRef.current],
        { y: -22, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'power2.in' }
      );
      tl.to(
        [goldLineTopRef.current, goldLineBottomRef.current],
        { scaleX: 0, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.03 },
        '-=0.25'
      );
      tl.to(
        videoWrapRef.current,
        { opacity: 0, scale: 1.03, duration: 0.5, ease: 'power2.inOut' },
        '-=0.15'
      );
      tl.to(
        containerRef.current,
        { opacity: 0, duration: 0.3, ease: 'power2.out' },
        '-=0.2'
      );
    }, containerRef);

    return () => {
      window.clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ backgroundColor: '#0f0202' }}
    >
      {/* ═══ LAYER 1: Video (revealed when the image slides open) ═══ */}
      <div ref={videoWrapRef} className="absolute inset-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/preloader-couple-split.png"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.55)' }}
        >
          <source src="/images/preloader-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ═══ LAYER 2: Couple image — two halves that slide apart ═══ */}
      <div ref={imageWrapRef} className="absolute inset-0 z-20">
        {/* Left half — Groom */}
        <div
          ref={imageLeftRef}
          className="absolute top-0 left-0 w-1/2 h-full overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: '200%',
              backgroundImage: 'url(/images/preloader-couple-split.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
              filter: 'brightness(0.75)',
            }}
          />
          {/* Gold edge on the seam */}
          <div className="absolute top-0 right-0 w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, #D4AF37, transparent)' }} />
        </div>
        {/* Right half — Bride */}
        <div
          ref={imageRightRef}
          className="absolute top-0 right-0 w-1/2 h-full overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          <div
            className="absolute top-0 h-full"
            style={{
              width: '200%',
              right: 0,
              backgroundImage: 'url(/images/preloader-couple-split.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
              filter: 'brightness(0.75)',
            }}
          />
          <div className="absolute top-0 left-0 w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, #D4AF37, transparent)' }} />
        </div>
      </div>

      {/* ═══ LAYER 3: Center content ═══ */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6">
        {/* Top gold line */}
        <div
          ref={goldLineTopRef}
          className="w-full max-w-md h-px mb-10 origin-left"
          style={{
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            opacity: 0,
          }}
        />

        {/* Decorative halo */}
        <div
          ref={decorativeCircleRef}
          className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full"
          style={{
            border: '1px solid rgba(212, 175, 55, 0.2)',
            boxShadow: '0 0 80px rgba(212, 175, 55, 0.1), inset 0 0 80px rgba(212, 175, 55, 0.05)',
            opacity: 0,
          }}
        />

        {/* Brand text */}
        <div ref={brandRef} className="relative z-10 text-center" style={{ opacity: 0 }}>
          <h1
            className="font-display font-light"
            style={{
              fontSize: 'clamp(2.6rem, 7vw, 5rem)',
              letterSpacing: '0.28em',
              color: '#FFFFFF',
              textShadow: '0 4px 40px rgba(0,0,0,0.55)',
              marginRight: '-0.28em',
            }}
          >
            Perfect&nbsp;<span style={{ color: '#F3E5AB' }}>Rishta</span>
          </h1>
        </div>

        {/* Tagline */}
        <div ref={taglineRef} className="mt-5" style={{ opacity: 0 }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
            <span
              className="font-body text-xs md:text-sm tracking-[0.32em] uppercase"
              style={{ color: '#F3E5AB', textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
            >
              The beginning of your love story
            </span>
            <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
          </div>
        </div>

        {/* Progress */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div
            ref={progressTrackRef}
            className="w-48 md:w-64 h-0.5 rounded-full origin-left overflow-hidden"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', opacity: 0 }}
          >
            <div
              ref={progressBarRef}
              className="h-full rounded-full origin-left"
              style={{
                background: 'linear-gradient(90deg, #D4AF37, #F3E5AB, #D4AF37)',
                backgroundSize: '200% 100%',
                transform: 'scaleX(0)',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <span
            ref={percentageRef}
            className="font-body text-xs tracking-[0.2em]"
            style={{ color: 'rgba(243, 229, 171, 0.65)', opacity: 0 }}
          >
            {progress}%
          </span>
        </div>

        {/* Bottom gold line */}
        <div
          ref={goldLineBottomRef}
          className="w-full max-w-md h-px mt-12 origin-right"
          style={{
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            opacity: 0,
          }}
        />
      </div>

      {/* Corner frames */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-gold/30 z-30 opacity-40" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-gold/30 z-30 opacity-40" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-gold/30 z-30 opacity-40" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-gold/30 z-30 opacity-40" />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
