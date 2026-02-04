// frontend/src/components/common/Button/Button.jsx
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ children, variant = 'primary', size = 'md', isLoading = false, disabled = false, leftIcon, rightIcon, className = '', ...props }, ref) => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105',
    secondary: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50',
  };
  const sizes = { sm: 'text-sm px-3 py-1.5', md: 'px-4 py-2.5', lg: 'text-lg px-6 py-3' };
  
  return (
    <button ref={ref} disabled={disabled || isLoading} className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</> : <>{leftIcon && <span className="mr-2">{leftIcon}</span>}{children}{rightIcon && <span className="ml-2">{rightIcon}</span>}</>}
    </button>
  );
});
Button.displayName = 'Button';
export default Button;