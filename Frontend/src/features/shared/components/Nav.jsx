import React from 'react'
import "../nav.scss"
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'

const Nav = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()

    const onLogout = async () => {
        await handleLogout()
        navigate("/login")
    }

    return (
        <nav className='nav-bar'>
            <p className='nav-logo'>Pixora</p>
            <div className='nav-actions'>
                {user ? (
                    <>
                        <button
                            onClick={() => { navigate("/create-post") }}
                            className='button primary-button'>
                            + New Post
                        </button>
                        <button
                            onClick={onLogout}
                            className='button ghost-button'>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => { navigate("/login") }}
                            className='button ghost-button'>
                            Login
                        </button>
                        <button
                            onClick={() => { navigate("/register") }}
                            className='button primary-button'>
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Nav