import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import "./features/shared/global.scss"
import { AuthProvider } from './features/auth/auth.context'
import { PostContextProvider } from './features/post/post.context'
import { Toaster } from 'react-hot-toast'


function App() {
  return (
    <AuthProvider>
      <PostContextProvider>
        <RouterProvider router={router}/>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e1e1e',
              color: '#f5f5f5',
              border: '1px solid #333',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#d20c3d', secondary: '#fff' },
            },
          }}
        />
      </PostContextProvider>
    </AuthProvider>
  )
}

export default App
