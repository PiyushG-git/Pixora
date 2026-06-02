import React, { useEffect, useState } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import Spinner from '../../shared/components/Spinner'
import { getPopularPosts, likePost, unLikePost } from '../services/post.api'
import { useAuth } from '../../auth/hooks/useAuth'
import { ImageOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'

const PopularFeed = () => {
    const [posts, setPosts]    = useState(null)
    const [loading, setLoading] = useState(true)
    const { user: authUser }    = useAuth()
    const navigate              = useNavigate()

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPopularPosts()
                setPosts(data.posts)
            } catch {
                toast.error("Failed to load popular posts.")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Local optimistic like — updates local posts state (not the context feed)
    const handleLocalLike = async (postId) => {
        if (!authUser) {
            toast.error("Please login to interact.")
            navigate('/login')
            return
        }
        setPosts(prev => prev?.map(p =>
            p._id === postId ? { ...p, isLiked: true, likeCount: (p.likeCount || 0) + 1 } : p
        ))
        try {
            await likePost(postId)
        } catch {
            setPosts(prev => prev?.map(p =>
                p._id === postId ? { ...p, isLiked: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p
            ))
            toast.error("Failed to like post.")
        }
    }

    const handleLocalUnLike = async (postId) => {
        if (!authUser) {
            toast.error("Please login to interact.")
            navigate('/login')
            return
        }
        setPosts(prev => prev?.map(p =>
            p._id === postId ? { ...p, isLiked: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p
        ))
        try {
            await unLikePost(postId)
        } catch {
            setPosts(prev => prev?.map(p =>
                p._id === postId ? { ...p, isLiked: true, likeCount: (p.likeCount || 0) + 1 } : p
            ))
            toast.error("Failed to unlike post.")
        }
    }

    if (loading) {
        return (
            <div className="loading-page">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="feed-container">
            {/* Header label */}
            <div className="sort-tabs" style={{ marginBottom: '1.25rem' }}>
                <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    padding: '0.5rem 1rem',
                    flex: 1
                }}>
                    🔥 Popular — sorted by most likes
                </div>
            </div>

            <AnimatePresence>
                {posts && posts.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ImageOff size={48} />
                        <h3>No posts yet</h3>
                        <p>Be the first to share something amazing!</p>
                    </motion.div>
                ) : (
                    <motion.div className="posts-list">
                        {posts && posts.map((post, index) => (
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
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default PopularFeed
