import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { ADMIN_EMAIL, normalizeEmail } from '../constants/admin';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  adminEmail?: string;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children, adminEmail = ADMIN_EMAIL }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('No user logged in');
        setIsAuthorized(false);
      } else {
        console.log('Checking admin access for:', user.email);
        setUserEmail(user.email);
        if (normalizeEmail(user.email) === normalizeEmail(adminEmail)) {
          console.log('Admin access granted ✅');
          setIsAuthorized(true);
        } else {
          console.log('User is not admin. Required:', adminEmail, 'Got:', user.email);
          setIsAuthorized(false);
        }
      }
    });

    return () => unsubscribe();
  }, [adminEmail]);

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-bold">❌ Admin Access Denied</p>
          <p className="text-gray-600">Logged in as: {userEmail || 'Not logged in'}</p>
          <p className="text-gray-500 text-sm">Required: {adminEmail}</p>
          <Navigate to="/" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
