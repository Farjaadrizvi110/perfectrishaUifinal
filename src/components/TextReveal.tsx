import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  style?: React.CSSProperties;
  animation?: 'fade-up' | 'fade-in' | 'words' | 'lines' | 'chars';
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
  y?: number;
}

export default function TextReveal({
  children,
  as: Tag = 'div',
  className = '',
  style,
  animation = 'fade-up',
  delay = 0,
  duration = 0.8,
  stagger = 0.03,
  start = 'top 80%',
  once = true,
  y = 30,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already animated and once=true, don't re-animate
    if (hasAnimated.current && once) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      onEnter: () => {
        if (hasAnimated.current && once) return;
        hasAnimated.current = true;

        if (animation === 'fade-up') {
          gsap.fromTo(el,
            { opacity: 0, y },
            { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
          );
        } else if (animation === 'fade-in') {
          gsap.fromTo(el,
            { opacity: 0 },
            { opacity: 1, duration, delay, ease: 'power2.out' }
          );
        } else if (animation === 'words') {
          const text = el.textContent || '';
          const words = text.split(' ');
          el.innerHTML = words.map(w => `<span class="inline-block overflow-hidden"><span class="word-inner inline-block">${w}</span></span>`).join(' ');
          const inners = el.querySelectorAll('.word-inner');
          gsap.fromTo(inners,
            { opacity: 0, y: y * 0.8, rotateX: -40 },
            { opacity: 1, y: 0, rotateX: 0, duration: duration * 0.7, stagger, delay, ease: 'power3.out' }
          );
        } else if (animation === 'lines') {
          const children = el.children;
          gsap.fromTo(children,
            { opacity: 0, y: y * 0.6, clipPath: 'inset(0 0 100% 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration, stagger: stagger * 8, delay, ease: 'power3.out' }
          );
        } else if (animation === 'chars') {
          const text = el.textContent || '';
          el.innerHTML = text.split('').map(c =>
            c === ' ' ? ' ' : `<span class="inline-block overflow-hidden"><span class="char-inner inline-block">${c}</span></span>`
          ).join('');
          const inners = el.querySelectorAll('.char-inner');
          gsap.fromTo(inners,
            { opacity: 0, y: 20, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.02, delay, ease: 'back.out(1.5)' }
          );
        }
      },
      onLeaveBack: () => {
        if (!once) {
          gsap.to(el, { opacity: 0, y: y * 0.5, duration: 0.4, ease: 'power2.in' });
          hasAnimated.current = false;
        }
      },
    });

    return () => { trigger.kill(); };
  }, [animation, delay, duration, stagger, start, once, y]);

  return (
    <Tag
      ref={ref as any}
      className={`${className} ${animation !== 'fade-in' ? 'opacity-0' : ''}`}
      style={{ perspective: '800px', ...style }}
    >
      {children}
    </Tag>
  );
}
