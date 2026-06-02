import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { getTopCreators, followUser, unfollowUser } from '../services/user.api'
import { getPopularPosts } from '../../post/services/post.api'
import { Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import '../style/rightpanel.scss'

// Format follower counts: 1200 → 1.2K, 1500000 → 1.5M
function formatFollowers(n) {
    if (!n) return '0'
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
}

const RightPanel = () => {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const [creators, setCreators]         = useState([])
    const [trending, setTrending]         = useState([])
    const [followLoading, setFollowLoading] = useState({})

    useEffect(() => {
        loadPanelData()
    }, [])

    const loadPanelData = async () => {
        try {
            const [creatorsRes, trendingRes] = await Promise.allSettled([
                getTopCreators(),
                getPopularPosts()
            ])
            if (creatorsRes.status === 'fulfilled') {
                setCreators(creatorsRes.value.users || [])
            }
            if (trendingRes.status === 'fulfilled') {
                setTrending((trendingRes.value.posts || []).slice(0, 5))
            }
        } catch {
            // Right panel is non-critical — fail silently
        }
    }

    const handleFollowToggle = async (creator) => {
        if (!authUser) {
            toast.error("Please login to follow users.")
            navigate('/login')
            return
        }

        setFollowLoading(prev => ({ ...prev, [creator._id]: true }))

        // Optimistic UI update
        setCreators(prev =>
            prev.map(c =>
                c._id === creator._id ? { ...c, isFollowing: !c.isFollowing } : c
            )
        )

        try {
            if (creator.isFollowing) {
                await unfollowUser(creator.username)
                toast.success(`Unfollowed @${creator.username}`)
            } else {
                await followUser(creator.username)
                toast.success(`Now following @${creator.username}!`)
            }
        } catch {
            // Revert on failure
            setCreators(prev =>
                prev.map(c =>
                    c._id === creator._id ? { ...c, isFollowing: !c.isFollowing } : c
                )
            )
            toast.error("Action failed. Please try again.")
        } finally {
            setFollowLoading(prev => ({ ...prev, [creator._id]: false }))
        }
    }

    return (
        <div className="right-panel">

            {/* ── Top Creators ── */}
            <div className="panel-section">
                <h3 className="section-title">
                    <Users size={11} />
                    Top Creators
                </h3>

                {creators.length > 0 ? creators.map(creator => (
                    <motion.div
                        key={creator._id}
                        className="creator-card"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.15 }}
                    >
                        <img
                            src={creator.profileImage}
                            alt={creator.username}
                            className="creator-avatar"
                        />
                        <div className="creator-info">
                            <p className="creator-username">@{creator.username}</p>
                            <p className="creator-followers">
                                {formatFollowers(creator.followerCount)} followers
                            </p>
                        </div>
                        <motion.button
                            className={`follow-btn ${creator.isFollowing ? 'following' : 'not-following'}`}
                            onClick={() => handleFollowToggle(creator)}
                            disabled={!!followLoading[creator._id]}
                            whileTap={{ scale: 0.95 }}
                        >
                            {followLoading[creator._id]
                                ? '···'
                                : creator.isFollowing ? 'Following' : 'Follow'
                            }
                        </motion.button>
                    </motion.div>
                )) : (
                    <p className="panel-empty">No creators yet</p>
                )}
            </div>

            {/* ── Trending Posts ── */}
            <div className="panel-section">
                <h3 className="section-title">
                    <TrendingUp size={11} />
                    Trending
                </h3>

                {trending.length > 0 ? trending.map((post, index) => (
                    <motion.div
                        key={post._id}
                        className="trending-item"
                        onClick={() => navigate('/popular')}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.15 }}
                    >
                        <span className="trending-rank">#{index + 1}</span>
                        <div className="trending-info">
                            <p className="trending-caption">
                                {post.caption || '(No caption)'}
                            </p>
                            <p className="trending-count">
                                {post.likeCount || 0} upvotes · u/{post.user?.username}
                            </p>
                        </div>
                    </motion.div>
                )) : (
                    <p className="panel-empty">No trending posts yet</p>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="panel-footer">
                <div className="footer-links">
                    <a href="#">Privacy</a><span className="dot">·</span>
                    <a href="#">Terms</a><span className="dot">·</span>
                    <a href="#">Cookies</a><span className="dot">·</span>
                    <a href="#">Help</a><span className="dot">·</span>
                    <a href="#">Guidelines</a>
                </div>
                <p className="copyright">Pixora © {new Date().getFullYear()}</p>
            </div>
        </div>
    )
}

export default RightPanel
