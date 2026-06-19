import React from 'react';

interface SaigonEyeLogoProps {
  variant?: 'full' | 'icon' | 'vertical';
  className?: string;
  iconSize?: number | string;
}

export default function SaigonEyeLogo({
  variant = 'full',
  className = '',
}: SaigonEyeLogoProps) {
  // Center logo if requested to be single vertical center block (e.g. login)
  const isCentered = variant === 'vertical';
  const alignClass = isCentered ? 'object-center mx-auto' : 'object-left';

  return (
    <img
      src="/images/logo-msg.png"
      alt="Bệnh Viện Mắt Sài Gòn"
      className={`h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[260px] object-contain ${alignClass} brand-logo ${className}`.trim()}
    />
  );
}
