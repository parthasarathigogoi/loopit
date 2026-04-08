import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  adminEmail: string;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children, adminEmail }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsAuthorized(false);
      } else if (user.email === adminEmail) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, [adminEmail]);

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
