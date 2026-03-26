import { createBrowserRouter } from "react-router"
import Register from "./features/auth/Pages/Register"
import Login from "./features/auth/Pages/Login"
import Feed from "./features/post/pages/Feed"
import CreatePost from "./features/post/pages/CreatePost"
import ProtectedRoute from "./features/shared/components/ProtectedRoute"
import Layout from "./features/shared/components/Layout"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Feed /> // Public, wrapper logic checks auth on button clicks
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "create-post",
                element: <ProtectedRoute><CreatePost/></ProtectedRoute> // Still protected
            }
        ]
    }
])