import { createBrowserRouter } from "react-router"
import Register     from "./features/auth/Pages/Register"
import Login        from "./features/auth/Pages/Login"
import Feed         from "./features/post/pages/Feed"
import PopularFeed  from "./features/post/pages/PopularFeed"
import CreatePost   from "./features/post/pages/CreatePost"
import Profile      from "./features/user/pages/Profile"
import ProtectedRoute from "./features/shared/components/ProtectedRoute"
import Layout       from "./features/shared/components/Layout"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Feed /> // Public — auth guard on interaction, not page view
            },
            {
                path: "popular",
                element: <PopularFeed /> // Public — posts sorted by like count
            },
            {
                path: "user/:username",
                element: <Profile />
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
                element: <ProtectedRoute><CreatePost /></ProtectedRoute>
            }
        ]
    }
])