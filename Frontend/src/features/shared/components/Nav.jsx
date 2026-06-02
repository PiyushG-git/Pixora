import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { searchPosts } from '../../post/services/post.api'
import { Search, Flame, Plus, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import '../nav.scss'

const Nav = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchOpen, setSearchOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const searchRef = useRef(null)
    const userMenuRef = useRef(null)
    const debounceRef = useRef(null)

    const onLogout = async () => {
        setShowUserMenu(false)
        await handleLogout()
        navigate('/login')
    }

    // Debounced search — fires 400ms after user stops typing
    const handleSearch = (e) => {
        const q = e.target.value
        setSearchQuery(q)
        clearTimeout(debounceRef.current)

        if (q.trim().length < 2) {
            setSearchResults([])
            setSearchOpen(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const data = await searchPosts(q)
                setSearchResults(data.posts || [])
                setSearchOpen(true)
            } catch {
                setSearchResults([])
            }
        }, 400)
    }

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false)
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <motion.nav
            className="top-nav"
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
        >
            {/* ── Logo ── */}
            <Link to="/" className="nav-logo">
                <Flame size={20} />
                <span>Pixora</span>
            </Link>

            {/* ── Search ── */}
            <div className="nav-search" ref={searchRef}>
                <div className="search-input-wrapper">
                    <Search size={15} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search posts, users..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                    />
                </div>

                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            className="search-dropdown"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                        >
                            {searchResults.length > 0 ? (
                                searchResults.map(post => (
                                    <div
                                        key={post._id}
                                        className="search-result-item"
                                        onClick={() => {
                                            setSearchOpen(false)
                                            setSearchQuery('')
                                            navigate('/')
                                        }}
                                    >
                                        <img
                                            src={post.user?.profileImage}
                                            alt=""
                                            className="result-avatar"
                                        />
                                        <div>
                                            <p className="result-caption">
                                                {post.caption || '(No caption)'}
                                            </p>
                                            <p className="result-user">u/{post.user?.username}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="search-no-results">No results found</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Right Actions ── */}
            <div className="nav-actions">
                {user ? (
                    <>
                        <motion.button
                            className="btn-create"
                            onClick={() => navigate('/create-post')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Plus size={15} />
                            Create Post
                        </motion.button>

                        {/* User avatar + dropdown */}
                        <div className="user-menu-wrapper" ref={userMenuRef}>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setShowUserMenu(v => !v)}
                                aria-label="User menu"
                            >
                                <img
                                    src={user.profileImage}
                                    alt={user.username}
                                />
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        className="user-dropdown"
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div 
                                            className="user-info" 
                                            onClick={() => {
                                                setShowUserMenu(false)
                                                navigate(`/user/${user.username}`)
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img src={user.profileImage} alt="" />
                                            <div>
                                                <p className="user-name">{user.username}</p>
                                                <p className="user-email">{user.email}</p>
                                            </div>
                                        </div>
                                        <button className="logout-btn" onClick={onLogout}>
                                            <LogOut size={14} />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <>
                        <button className="btn-ghost" onClick={() => navigate('/login')}>
                            Log In
                        </button>
                        <button className="btn-primary" onClick={() => navigate('/register')}>
                            Register
                        </button>
                    </>
                )}
            </div>
        </motion.nav>
    )
}

export default Nav