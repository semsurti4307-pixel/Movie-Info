import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLoader } from 'react-icons/fi';

// Protected Route - requires authentication
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-500 flex items-center justify-center">
                <FiLoader className="w-12 h-12 text-red-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Admin Route - requires admin role
export const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-500 flex items-center justify-center">
                <FiLoader className="w-12 h-12 text-red-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};
