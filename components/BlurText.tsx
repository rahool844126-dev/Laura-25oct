import React from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  variant?: 'fast' | 'normal' | 'slow';
}

const BlurText: React.FC<BlurTextProps> = ({ text, className = '', variant = 'normal' }) => {
  const variants = {
    fast: {
      duration: 0.5,
      stagger: 0.02,
    },
    normal: {
      duration: 0.8,
      stagger: 0.025,
    },
    slow: {
      duration: 1.2,
      stagger: 0.04,
    },
  };

  const selectedVariant = variants[variant];
  
  // Use Intl.Segmenter to correctly split the string into grapheme clusters.
  // This is crucial for complex scripts like Devanagari, where multiple 
  // characters combine to form a single visual unit.
  let segments: string[] = [];
  try {
    // FIX: Cast Intl to any to bypass TypeScript error for Intl.Segmenter, which may not be in older TS lib files,
    // and add a type for the segment object. The try-catch block provides a runtime fallback for browsers that do not support it.
    const segmenter = new (Intl as any).Segmenter('hi', { granularity: 'grapheme' });
    segments = Array.from(segmenter.segment(text)).map((s: { segment: string }) => s.segment);
  } catch (e) {
    // Fallback for older browsers that may not support Intl.Segmenter
    console.warn('Intl.Segmenter not supported, falling back to Array.from.');
    segments = Array.from(text);
  }


  return (
    <span className={`inline ${className}`}>
      {segments.map((char, index) => (
        <span
          key={index}
          className="animate-blur-in"
          style={{
            animationDelay: `${index * selectedVariant.stagger}s`,
            animationDuration: `${selectedVariant.duration}s`,
            animationFillMode: 'forwards',
            opacity: 0,
            display: 'inline-block',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default BlurText;
