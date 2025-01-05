import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export default function Loading({ size = 'md', color = 'blue', text }: LoadingProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeMap[size]} border-2 border-gray-200 rounded-full`}
        style={{ 
          borderTopColor: `var(--tw-text-opacity-${color}-600)`,
          borderRightColor: `var(--tw-text-opacity-${color}-400)`
        }}
      />
      {text && (
        <p className={`mt-2 text-gray-600 ${textSizeMap[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
} 