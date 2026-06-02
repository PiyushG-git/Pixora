import React, { useEffect, useState } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import { usePost } from '../hook/usePost'
import { getPopularPosts } from '../services/post.api'
import SkeletonPost from '../components/SkeletonPost'
import Spinner from '../../shared/components/Spinner'
import { Flame, Clock, TrendingUp, ImageOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const TABS = [
    { id: 'hot',  label: 'Hot',  Icon: Flame },
    { id: 'new',  label: 'New',  Icon: Clock },
    { id: 'top',  label: 'Top',  Icon: TrendingUp },
]

const Feed = () => {
    const { feed, handleGetFeed, loading, handleLike, handleUnLike, handleDeletePost } = usePost()
    const [activeTab, setActiveTab]       = useState('hot')
    const [popularPosts, setPopularPosts]  = useState(null)
    const [popularLoading, setPopularLoading] = useState(false)
    
    // Pagination states
    const [feedPage, setFeedPage] = useState(1)
    const [feedHasMore, setFeedHasMore] = useState(true)
    const [popPage, setPopPage] = useState(1)
    const [popHasMore, setPopHasMore] = useState(true)

    useEffect(() => {
        loadFeed(1)
    }, [])

    const loadFeed = async (page) => {
        const posts = await handleGetFeed(page, 10)
        if (posts.length < 10) setFeedHasMore(false)
        else setFeedHasMore(true)
        setFeedPage(page)
    }

    const handleTabChange = async (tabId) => {
        setActiveTab(tabId)
        if (tabId === 'top' && !popularPosts) {
            loadPopular(1)
        }
    }

    const loadPopular = async (page) => {
        setPopularLoading(true)
        try {
            const data = await getPopularPosts(page, 10)
            if (data.posts.length < 10) setPopHasMore(false)
            else setPopHasMore(true)
            
            if (page === 1) setPopularPosts(data.posts)
            else setPopularPosts(prev => [...prev, ...data.posts])
            
            setPopPage(page)
        } catch {
            toast.error("Failed to load popular posts.")
        } finally {
            setPopularLoading(false)
        }
    }

    const displayFeed = activeTab === 'top' ? popularPosts : feed
    const isLoading   = activeTab === 'top' ? popularLoading : loading

    if (isLoading && !displayFeed) {
        return (
            <div className="feed-container">
                <div className="sort-tabs">
                    {TABS.map(({ id, label, Icon }) => (
                        <button key={id} className={`sort-tab${activeTab === id ? ' active' : ''}`} disabled>
                            <Icon size={14} />{label}
                        </button>
                    ))}
                </div>
                <div className="posts-list" style={{ marginTop: '1rem' }}>
                    {[1, 2, 3].map(n => <SkeletonPost key={n} />)}
                </div>
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
                    >
                        <div className="posts-list" style={{ marginTop: '1rem' }}>
                            {[1, 2, 3].map(n => <SkeletonPost key={n} />)}
                        </div>
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
                                    handleDelete={handleDeletePost}
                                />
                            </motion.div>
                        ))}
                        
                        {/* Load More Button */}
                        {activeTab === 'hot' && feedHasMore && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button className="button secondary-button" onClick={() => loadFeed(feedPage + 1)} disabled={loading}>
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                        {activeTab === 'top' && popHasMore && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button className="button secondary-button" onClick={() => loadPopular(popPage + 1)} disabled={popularLoading}>
                                    {popularLoading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Feed