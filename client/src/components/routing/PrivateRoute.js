import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
  if (!localStorage.getItem("authToken")) {
    return <Navigate to='/login' replace />
  }
  return children;
}