import React, { useEffect, useState } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import { usePost } from '../hook/usePost'
import Spinner from '../../shared/components/Spinner'
import { getPopularPosts } from '../services/post.api'
import { Flame, Clock, TrendingUp, ImageOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const TABS = [
    { id: 'hot',  label: 'Hot',  Icon: Flame },
    { id: 'new',  label: 'New',  Icon: Clock },
    { id: 'top',  label: 'Top',  Icon: TrendingUp },
]

const Feed = () => {
    const { feed, handleGetFeed, loading, handleLike, handleUnLike } = usePost()
    const [activeTab, setActiveTab]       = useState('hot')
    const [popularPosts, setPopularPosts]  = useState(null)
    const [popularLoading, setPopularLoading] = useState(false)

    useEffect(() => {
        handleGetFeed()
    }, [])

    const handleTabChange = async (tabId) => {
        setActiveTab(tabId)
        if (tabId === 'top' && !popularPosts) {
            setPopularLoading(true)
            try {
                const data = await getPopularPosts()
                setPopularPosts(data.posts)
            } catch {
                toast.error("Failed to load popular posts.")
            } finally {
                setPopularLoading(false)
            }
        }
    }

    const displayFeed = activeTab === 'top' ? popularPosts : feed
    const isLoading   = activeTab === 'top' ? popularLoading : loading

    if (isLoading && !displayFeed) {
        return (
            <div className="loading-page">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="feed-container">

            {/* ── Sort Tabs ── */}
            <div className="sort-tabs">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        className={`sort-tab${activeTab === id ? ' active' : ''}`}
                        onClick={() => handleTabChange(id)}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Posts ── */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}
                    >
                        <Spinner />
                    </motion.div>
                ) : displayFeed && displayFeed.length === 0 ? (
                    <motion.div
                        key="empty"
                        className="empty-state"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ImageOff size={48} />
                        <h3>No posts yet</h3>
                        <p>Be the first to share something amazing!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        className="posts-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {displayFeed && displayFeed.map((post, index) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.3 }}
                            >
                                <Post
                                    user={post.user}
                                    post={post}
                                    handleLike={handleLike}
                                    handleUnLike={handleUnLike}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Feed