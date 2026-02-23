import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8 inline-block p-8 bg-white rounded-full shadow-xl animate-bounce-slow">
          <ShieldAlert className="w-24 h-24 text-red-500" />
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h1 className="text-6xl font-bold text-red-600 mb-3">
            403
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Sorry, you don't have permission to access this page. 
            Please contact your administrator if you believe this is a mistake.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-sm text-gray-500">
          🔒 This area is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;