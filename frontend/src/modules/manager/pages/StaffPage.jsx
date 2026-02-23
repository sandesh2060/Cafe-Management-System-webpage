// File: frontend/src/modules/manager/pages/StaffPage.jsx
// Fully responsive Staff Management Page wrapper

import StaffManagement from '../components/StaffManagement';

const StaffPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <StaffManagement />
      </div>
    </div>
  );
};

export default StaffPage;