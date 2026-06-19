import React, { useState } from 'react';
// @ts-ignore
import logoImg from '../assets/Logo-Benh-Vien-Mat-Sai-Gon-MSG.png';

interface SaigonEyeLogoProps {
  variant?: 'full' | 'icon' | 'vertical';
  className?: string;
  iconSize?: number | string;
}

export default function SaigonEyeLogo({
  variant = 'full',
  className = '',
  iconSize = 80
}: SaigonEyeLogoProps) {
  // Flag to toggle between high-fidelity vector representation and physical image file.
  // Set to true if you want to force loading the local PNG loaded from '../../src/assets/'
  const [useLocalImage, setUseLocalImage] = useState(false);

  // Vibrant brand green
  const brandGreen = '#009B4D';

  const renderIcon = (size: number | string) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
    >
      {/* Symmetric green cross */}
      <path
        d="M 100,0 H 200 V 100 H 300 V 200 H 200 V 300 H 100 V 200 H 0 V 100 H 100 Z"
        fill={brandGreen}
      />
      
      {/* Clean outer arch of the eye */}
      <path
        d="M 42 165 C 42 75 142 55 245 75 C 275 80 286 115 282 175"
        stroke="white"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />

      {/* Iris/pupil circle exactly in the center */}
      <circle
        cx="150"
        cy="150"
        r="44"
        stroke="white"
        strokeWidth="13"
        fill="none"
      />

      {/* Curved lower line for bottom teardrop */}
      <path
        d="M 42 165 L 140 165 C 160 165 178 152 195 135"
        stroke="white"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderIcon(iconSize)}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <div className="mb-4">
          {renderIcon(iconSize)}
        </div>
        
        {/* Horizontal Divider lines and text */}
        <div className="w-full max-w-[280px] space-y-1">
          <div className="h-[2px] bg-[#414042] w-full" />
          <h2 className="text-[#414042] font-semibold tracking-[0.25em] text-[13px] md:text-sm uppercase leading-relaxed font-sans py-1">
            BỆNH VIỆN MẮT
          </h2>
          <div className="h-[2px] bg-[#414042] w-full" />
          <h1 className="text-[#009B4D] font-black tracking-wider text-2xl md:text-3xl uppercase pt-1 leading-none font-sans">
            SÀI GÒN
          </h1>
        </div>
      </div>
    );
  }

  // Full horizontal layout matching the brand logo
  const heightVal = typeof iconSize === 'number' ? `${iconSize}px` : iconSize;

  if (useLocalImage) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={logoImg}
          alt="BỆNH VIỆN MẮT SÀI GÒN"
          className="w-auto object-contain max-w-full h-auto"
          style={{ height: heightVal }}
          onError={() => setUseLocalImage(false)} // Safely fallback to vector SVG if image fails to load
        />
      </div>
    );
  }

  // Beautiful Vector Brand representation for perfect responsiveness and high-resolution rendering
  return (
    <div className={`inline-flex items-center gap-3 md:gap-3.5 select-none ${className}`}>
      {renderIcon(typeof iconSize === 'number' ? iconSize * 0.75 : '60px')}
      <div className="flex flex-col justify-center text-left py-1">
        {/* Top precise charcoal gray bar */}
        <div className="h-[2px] bg-[#414042] w-full" />
        
        {/* Precise "BỆNH VIỆN MẮT" uppercase letters with exact spacious tracking */}
        <span className="text-[#414042] font-semibold tracking-[0.22em] text-[12px] md:text-[15px] lg:text-[16px] uppercase leading-relaxed font-sans py-0.5">
          BỆNH VIỆN MẮT
        </span>
        
        {/* Bottom precise charcoal gray bar */}
        <div className="h-[2px] bg-[#414042] w-full" />
        
        {/* Large green brand text "SÀI GÒN" */}
        <span className="text-[#009B4D] font-black tracking-[0.06em] text-[18px] md:text-[23px] lg:text-[24px] uppercase pt-1 leading-none font-sans">
          SÀI GÒN
        </span>
      </div>
    </div>
  );
}
