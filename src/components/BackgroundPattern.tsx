import { motion } from 'motion/react';

export default function BackgroundPattern() {
  // Generate coordinates and parameters for decorative floating items
  const shapes = [
    { type: 'cross', size: 28, x: '8%', y: '15%', delay: 0, duration: 18 },
    { type: 'eye', size: 36, x: '85%', y: '12%', delay: 1, duration: 22 },
    { type: 'circle', size: 24, x: '75%', y: '40%', delay: 2, duration: 15 },
    { type: 'cross', size: 20, x: '20%', y: '75%', delay: 1.5, duration: 20 },
    { type: 'eye', size: 40, x: '12%', y: '48%', delay: 3, duration: 24 },
    { type: 'circle', size: 18, x: '90%', y: '80%', delay: 0.5, duration: 17 },
    { type: 'cross', size: 32, x: '45%', y: '85%', delay: 4, duration: 26 },
    { type: 'eye', size: 30, x: '55%', y: '18%', delay: 2.5, duration: 21 },
    { type: 'sparkle', size: 16, x: '35%', y: '35%', delay: 0.8, duration: 14 },
    { type: 'sparkle', size: 22, x: '65%', y: '70%', delay: 3.5, duration: 19 },
  ];

  return (
    <div id="kahoot-bg-pattern" className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-gradient-to-tr from-[#F4FFF8] via-[#FFFFFF] to-[#E9FAF0]">
      {/* Visual glowing lighting effects in corners */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A859] opacity-[0.06] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#006B3F] opacity-[0.08] blur-[150px]" />
      
      {/* Floating Elements Loop */}
      {shapes.map((shape, index) => {
        let content = null;

        if (shape.type === 'cross') {
          content = (
            <svg
              width={shape.size}
              height={shape.size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#00A859]"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          );
        } else if (shape.type === 'eye') {
          content = (
            <svg
              width={shape.size}
              height={shape.size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#009B4D]"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
            </svg>
          );
        } else if (shape.type === 'circle') {
          content = (
            <div
              className="rounded-full border-[3px] border-[#006B3F] bg-transparent opacity-40"
              style={{ width: shape.size, height: shape.size }}
            />
          );
        } else {
          // Sparkle star-like shape (four corners)
          content = (
            <svg
              width={shape.size}
              height={shape.size}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[#00A859] opacity-50"
            >
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
            </svg>
          );
        }

        return (
          <motion.div
            key={index}
            className="absolute opacity-35"
            style={{
              left: shape.x,
              top: shape.y,
            }}
            animate={{
              y: [0, -35, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.45, 0.25]
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: "easeInOut"
            }}
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}
