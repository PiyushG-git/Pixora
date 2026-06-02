import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { getUserProfile, updateProfile } from '../services/profile.api'
import { likePost, unLikePost, deletePost } from '../../post/services/post.api'
import Spinner from '../../shared/components/Spinner'
import Post from '../../post/components/Post'
import SkeletonPost from '../../post/components/SkeletonPost'
import { ImageOff, X, ImagePlus, PenLine } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import '../style/profile.scss'

const Profile = () => {
    const { username } = useParams()
    const { user: authUser, handleLogin } = useAuth() // using context for auth
    const navigate = useNavigate()
    const [profileData, setProfileData] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    // Edit state
    const [editUsername, setEditUsername] = useState('')
    const [editBio, setEditBio] = useState('')
    const [preview, setPreview] = useState(null)
    const profileImageRef = useRef(null)

    // Pagination
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        loadProfile(1)
    }, [username])

    const loadProfile = async (pageNum) => {
        setLoading(true)
        try {
            const data = await getUserProfile(username, pageNum, 10)
            if (pageNum === 1) {
                setProfileData(data.user)
                setPosts(data.posts)
                setEditUsername(data.user.username)
                setEditBio(data.user.bio || '')
            } else {
                setPosts(prev => [...prev, ...data.posts])
            }
            if (data.posts.length < 10) setHasMore(false)
            else setHasMore(true)
            setPage(pageNum)
        } catch (error) {
            toast.error("Profile not found")
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('username', editUsername)
        formData.append('bio', editBio)
        
        if (profileImageRef.current?.files?.[0]) {
            const file = profileImageRef.current.files[0];
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 800,
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options);
            formData.append('profileImage', compressedFile)
        }

        try {
            const data = await updateProfile(formData)
            toast.success("Profile updated!")
            setIsEditing(false)
            if (editUsername !== username) {
                // if username changed, redirect to new URL
                navigate(`/user/${editUsername}`)
            } else {
                setProfileData(data.user)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update profile")
        }
    }

    // Local optimistic like
    const handleLocalLike = async (postId) => {
        if (!authUser) {
            toast.error("Please login to interact.")
            navigate('/login')
            return
        }
        setPosts(prev => prev?.map(p => p._id === postId ? { ...p, isLiked: true, likeCount: (p.likeCount || 0) + 1 } : p))
        try {
            await likePost(postId)
        } catch {
            setPosts(prev => prev?.map(p => p._id === postId ? { ...p, isLiked: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p))
        }
    }

    const handleLocalUnLike = async (postId) => {
        if (!authUser) {
            toast.error("Please login to interact.")
            navigate('/login')
            return
        }
        setPosts(prev => prev?.map(p => p._id === postId ? { ...p, isLiked: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p))
        try {
            await unLikePost(postId)
        } catch {
            setPosts(prev => prev?.map(p => p._id === postId ? { ...p, isLiked: true, likeCount: (p.likeCount || 0) + 1 } : p))
        }
    }

    const handleDeleteLocalPost = async (postId) => {
        setPosts(prev => prev?.filter(p => p._id !== postId))
        try {
            await deletePost(postId)
            toast.success("Post deleted!")
        } catch {
            toast.error("Failed to delete post.")
        }
    }

    if (loading && page === 1) {
        return (
            <div className="profile-container">
                <div className="profile-header skeleton" style={{ minHeight: '150px' }}>
                    {/* Placeholder for header */}
                </div>
                <div className="posts-list" style={{ marginTop: '2rem' }}>
                    {[1, 2, 3].map(n => <SkeletonPost key={n} />)}
                </div>
            </div>
        )
    }

    if (!profileData) return null

    const isOwnProfile = authUser && authUser.username === profileData.username

    return (
        <div className="profile-container">
            {/* Header */}
            <motion.div 
                className="profile-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="profile-info">
                    <h1>u/{profileData.username}</h1>
                    {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
                    
                    <div className="profile-stats">
                        <div className="stat">
                            <span className="count">{profileData.followerCount}</span>
                            <span className="label">Followers</span>
                        </div>
                        <div className="stat">
                            <span className="count">{profileData.followingCount}</span>
                            <span className="label">Following</span>
                        </div>
                    </div>
                </div>

                {isOwnProfile && (
                    <div className="edit-btn-container">
                        <button 
                            className="button ghost-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Posts */}
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Posts</h3>
            <div className="posts-list">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <ImageOff size={48} />
                        <h3>No posts yet</h3>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.3 }}
                        >
                            <Post
                                user={post.user}
                                post={post}
                                handleLike={handleLocalLike}
                                handleUnLike={handleLocalUnLike}
                                handleDelete={handleDeleteLocalPost}
                            />
                        </motion.div>
                    ))
                )}
            </div>

            {hasMore && posts.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button className="button secondary-button" onClick={() => loadProfile(page + 1)} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        className="edit-profile-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                        >
                            <div className="modal-header">
                                <h2>Edit Profile</h2>
                                <button onClick={() => setIsEditing(false)}><X size={20} /></button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit}>
                                <input 
                                    type="text" 
                                    value={editUsername} 
                                    onChange={e => setEditUsername(e.target.value)} 
                                    placeholder="Username" 
                                    required 
                                />
                                <textarea 
                                    value={editBio} 
                                    onChange={e => setEditBio(e.target.value)} 
                                    placeholder="Bio" 
                                    rows={3} 
                                />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label htmlFor="editProfileImage" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                        <ImagePlus size={20} />
                                        <span style={{ fontSize: '0.875rem' }}>Update Profile Pic</span>
                                    </label>
                                    <input
                                        ref={profileImageRef}
                                        hidden
                                        type="file"
                                        id="editProfileImage"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {preview && (
                                        <img src={preview} alt="preview" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                                    )}
                                </div>

                                <button type="submit" className="button primary-button submit-btn">
                                    Save Changes
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Profile
