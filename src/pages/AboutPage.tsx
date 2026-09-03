import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WelcomeInfo from '@/sections/WelcomeInfo';
import About from '@/sections/About';
import LoveStory from '@/sections/LoveStory';
import WhyChooseUs from '@/sections/WhyChooseUs';
import Process from '@/sections/Process';
import ServicesTimeline from '@/sections/ServicesTimeline';
import FAQ from '@/sections/FAQ';
import Locations from '@/sections/Locations';
import Footer from '@/sections/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <WelcomeInfo />
      <About />
      <LoveStory />
      <WhyChooseUs />
      <Process />
      <ServicesTimeline />
      <FAQ />
      <Locations />
      <Footer />
    </>
  );
}
