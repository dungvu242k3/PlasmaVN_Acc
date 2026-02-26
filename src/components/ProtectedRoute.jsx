function ProtectedRoute({ children }) {
    // Authentication bypassed for UI Template conversion
    // Always granting access to children
    return children;
}

export default ProtectedRoute;
