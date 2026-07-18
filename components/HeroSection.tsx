'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Award, Users, TrendingUp, Home as HomeIcon, ArrowRight, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchFilter } from '@/components/SearchFilter';

const stats = [
  { value: 500, label: 'Properties Sold', icon: HomeIcon, color: 'emerald' },
  { value: 120, label: 'Happy Families', icon: Users, color: 'accent' },
  { value: 20, label: 'Years Experience', icon: Award, color: 'primary' },
  { value: 99, label: 'Satisfaction', icon: TrendingUp, suffix: '%', color: 'blue' },
];

const clientLogos = ['Forbes', 'BBC', 'CNN', 'Reuters', 'WSJ', 'Bloomberg', 'Times'];

const recentSales = [
  { location: 'Downtown', price: '$2.5M', type: 'Luxury Family Villa' },
  { location: 'Waterfront', price: '$1.8M', type: 'Beachfront Villa' },
  { location: 'City Center', price: '$3.2M', type: 'Premium Penthouse' },
  { location: 'Suburban Area', price: '$2.1M', type: 'Garden Townhouse' },
];

function AnimatedCounter({ value, suffix = '+' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-3xl font-bold text-white tabular-nums"
    >
      {count}{suffix}
    </motion.span>
  );
}

function PropertyShowcase() {
  const showcaseProperties = [
    { id: 1, title: 'Luxury Family Villa', location: 'Downtown', price: '$2.8M', image: '/images/property-1.jpg' },
    { id: 2, title: 'Beachfront Villa', location: 'Waterfront', price: '$3.5M', image: '/images/property-2.jpg' },
    { id: 3, title: 'City Center Condo', location: 'Business District', price: '$1.9M', image: '/images/property-3.jpg' },
  ];

  return (
    <div className="relative mt-16 hidden lg:block">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative h-[400px] w-full"
      >
        {showcaseProperties.map((property, index) => (
          <motion.div
            key={property.id}
            className="absolute w-[280px] rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20"
            style={{
              left: `${index * 200}px`,
              top: `${index * 40}px`,
              zIndex: showcaseProperties.length - index,
            }}
            initial={{ 
              opacity: 0, 
              rotateY: -45, 
              x: -100,
              scale: 0.8 
            }}
            animate={{ 
              opacity: 1, 
              rotateY: 0, 
              x: 0,
              scale: 1,
              transition: { delay: index * 0.2, duration: 0.8 }
            }}
            whileHover={{
              scale: 1.05,
              rotateY: 5,
              z: 50,
              transition: { duration: 0.3 }
            }}
          >
            <div className="relative h-48 bg-gradient-to-br from-primary-dark to-primary overflow-hidden">
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs text-white/70">{property.location}</p>
                <p className="mt-1 text-lg font-bold text-white">{property.title}</p>
                <p className="mt-1 text-sm text-accent">{property.price}</p>
              </div>
            </div>
            <div className="p-4 bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Premium Listing</span>
                <ChevronRight size={16} className="text-accent" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function RecentSalesTicker() {
  return (
    <div className="mt-12 overflow-hidden">
      <motion.div
        className="flex gap-6"
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...recentSales, ...recentSales].map((sale, i) => (
          <motion.div
            key={i}
            className="flex-shrink-0 glass rounded-full px-4 py-2 flex items-center gap-3"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <span className="text-xs font-medium text-white/80">{sale.location}</span>
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span className="text-xs font-semibold text-accent">{sale.price}</span>
            <span className="text-xs text-white/60">{sale.type}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function TrustedBySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-20"
    >
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-white/60 mb-6">
        Trusted by Industry Leaders
      </p>
      <div className="flex items-center justify-center gap-12">
        {clientLogos.map((logo, index) => (
          <motion.div
            key={logo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="text-xl font-bold text-white/40 hover:text-white/70 transition-colors"
          >
            {logo}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center pt-24 sm:pt-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />
        <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/50 via-transparent to-transparent" />
        
        <motion.div
          className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary-light/30 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur"
          >
            <Shield size={16} />
            Trusted by 120+ Families
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-8 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="block">Modern Real Estate Platform</span>
            <span className="text-gradient">Find Your Next Property</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-xl text-lg text-white/80"
          >
            Discover handpicked properties in prime locations worldwide. From luxury villas to modern apartments with premium amenities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <Link href="/onboarding">
              <Button variant="premium" size="lg">
                Start Free Trial
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="#listings">
              <Button variant="outline" size="lg">
                Browse Properties
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <SearchFilter />
          </motion.div>
        </div>

        <PropertyShowcase />
        <RecentSalesTicker />
        <TrustedBySection />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-500 shadow-md`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="mt-1 text-sm font-medium text-white/70">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}