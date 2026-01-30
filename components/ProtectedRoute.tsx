import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) => {
    const { isAuthenticated, loading, userData } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role based authorization if allowedRoles is provided
    if (allowedRoles && userData && !allowedRoles.includes(userData.role || 'USER')) {
        // If user role is not in allowedRoles, redirect to home or unauthorized page
        console.warn("Unauthorized access attempt. User role:", userData.role);
        return <Navigate to="/" replace />;
    }


    return children;
};
