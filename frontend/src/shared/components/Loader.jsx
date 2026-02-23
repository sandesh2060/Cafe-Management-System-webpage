const Loader = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-6'
  };

  const loaderClass = sizeClasses[size] || sizeClasses.md;

  const LoaderContent = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${loaderClass} border-orange-500 border-t-transparent rounded-full animate-spin`}></div>
      {text && (
        <p className="text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mb-6 inline-block p-6 bg-white rounded-full shadow-lg">
            <div className={`${loaderClass} border-orange-500 border-t-transparent rounded-full animate-spin`}></div>
          </div>
          {text && (
            <p className="text-lg text-gray-700 font-semibold animate-pulse">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return <LoaderContent />;
};

export default Loader;