import { useContext } from "react"
import { Navigate } from "react-router"
import { AuthContext } from "../../auth/auth.context"
import Spinner from "./Spinner"

// Wraps protected pages. Shows a spinner while the initial session
// check runs, then redirects to /login if the user is not authenticated.
const ProtectedRoute = ({ children }) => {
    const { user, initialized } = useContext(AuthContext)

    if (!initialized) {
        return (
            <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Spinner />
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute
