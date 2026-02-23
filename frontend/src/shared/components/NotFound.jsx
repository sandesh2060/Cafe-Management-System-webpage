import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="mb-8 animate-float">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Oops! The page you're looking for seems to have wandered off the menu.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>

        {/* Fun fact */}
        <p className="text-sm text-gray-500">
          💡 Did you check the URL? Maybe there's a typo!
        </p>
      </div>
    </div>
  );
};

export default NotFound;