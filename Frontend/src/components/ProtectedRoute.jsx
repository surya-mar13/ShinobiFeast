import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-xl font-semibold">Access Denied</p>
        <p className="text-gray-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
