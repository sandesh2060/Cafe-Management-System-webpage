// File: frontend/src/shared/components/ThemeToggle.jsx

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <div className={`w-14 h-8 bg-border rounded-full ${className}`}></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`group relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${className}`}
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, oklch(27.4% 0.006 286.033), oklch(32.5% 0.010 286.033))'
          : 'linear-gradient(135deg, oklch(62.8% 0.172 162.48), oklch(60.5% 0.123 194.77))'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Track Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-md opacity-40 transition-opacity duration-300"
        style={{
          background: theme === 'dark'
            ? 'oklch(68.8% 0.182 162.48)'
            : 'oklch(62.8% 0.172 162.48)'
        }}
      ></div>

      {/* Toggle Circle */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-300 ease-smooth flex items-center justify-center ${
          theme === 'dark' ? 'left-7' : 'left-1'
        }`}
        style={{
          background: 'var(--color-bg-elevated)',
        }}
      >
        {/* Icon with fade transition */}
        <div className="relative w-4 h-4">
          <Sun 
            className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
              theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-90 scale-50'
            }`}
            style={{ color: 'oklch(75.8% 0.151 81.34)' }}
          />
          <Moon 
            className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-50'
            }`}
            style={{ color: 'oklch(68.8% 0.182 162.48)' }}
          />
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
    </button>
  );
};

export default ThemeToggle;