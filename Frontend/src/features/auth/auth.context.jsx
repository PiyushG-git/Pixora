import { createContext, useState } from "react";

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    // `initialized` = whether the initial getMe() check is done
    // Prevents the ProtectedRoute from flashing /login before the session check completes
    const [ initialized, setInitialized ] = useState(false)

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, initialized, setInitialized }}>
            {children}
        </AuthContext.Provider>
    )
}