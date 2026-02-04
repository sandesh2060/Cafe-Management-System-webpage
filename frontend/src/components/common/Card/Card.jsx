// frontend/src/components/common/Card/Card.jsx
const Card = ({ children, hover = false, className = '', padding = 'default', ...props }) => {
  const paddings = { none: '', sm: 'p-4', default: 'p-6', lg: 'p-8' };
  return (
    <div className={`rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg transition-all duration-300 ${hover ? 'hover:shadow-2xl hover:-translate-y-1 hover:border-orange-300/50 cursor-pointer' : ''} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};
export default Card;