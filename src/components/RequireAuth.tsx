import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const phone = localStorage.getItem('sniplink_user_phone');

  if (!phone) {
    return <Navigate to="/barid" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
