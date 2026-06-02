import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { ArrowBigUp, MessageSquare, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { followUser, unfollowUser } from '../../shared/services/user.api'

// ── Helpers ───────────────────────────────────────────────────────────────────

// Extract creation time from MongoDB ObjectId (first 4 bytes = Unix timestamp)
function getRelativeTime(postId) {
    try {
        const timestamp = parseInt(postId.substring(0, 8), 16) * 1000
        const diffMs    = Date.now() - timestamp
        const diffSecs  = Math.floor(diffMs / 1000)
        const diffMins  = Math.floor(diffSecs / 60)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays  = Math.floor(diffHours / 24)

        if (diffSecs < 60)   return 'just now'
        if (diffMins < 60)   return `${diffMins}m ago`
        if (diffHours < 24)  return `${diffHours}h ago`
        if (diffDays < 30)   return `${diffDays}d ago`
        return new Date(timestamp).toLocaleDateString()
    } catch {
        return ''
    }
}

// Format numbers: 1200 → 1.2K
function fmt(n) {
    if (!n) return '0'
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
}

// ── Component ─────────────────────────────────────────────────────────────────
const Post = ({ user, post, handleLike, handleUnLike }) => {
    const navigate          = useNavigate()
    const { user: authUser } = useAuth()
    const [saved, setSaved]  = useState(false)
    const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false)
    const [followLoading, setFollowLoading] = useState(false)

    // Guard: redirect to login if user tries to interact without being logged in
    const requireAuth = (fn) => {
        if (!authUser) {
            toast.error("Please login to interact.")
            navigate('/login')
            return
        }
        fn?.()
    }

    // Share: Web Share API with clipboard fallback
    const handleShare = async () => {
        const shareData = {
            title: `Pixora — ${user.username}`,
            text:  post.caption || 'Check this out on Pixora!',
            url:   window.location.origin
        }
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch {
                // User cancelled — do nothing
            }
        } else {
            await navigator.clipboard.writeText(shareData.url)
            toast.success("Link copied to clipboard!")
        }
    }

    const handleSave = () => {
        requireAuth(() => {
            setSaved(v => !v)
            toast.success(saved ? "Removed from saved" : "Saved!")
        })
    }

    const handleFollowToggle = async () => {
        requireAuth(async () => {
            setFollowLoading(true)
            setIsFollowing(prev => !prev) // optimistic update
            try {
                if (isFollowing) {
                    await unfollowUser(user.username)
                    toast.success(`Unfollowed @${user.username}`)
                } else {
                    await followUser(user.username)
                    toast.success(`Following @${user.username}`)
                }
            } catch {
                setIsFollowing(prev => !prev) // revert
                toast.error("Action failed.")
            } finally {
                setFollowLoading(false)
            }
        })
    }

    return (
        <motion.div
            className="post-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
        >
            {/* ── Header ── */}
            <div className="post-header">
                <div className="post-user">
                    <Link to={`/user/${user.username}`} className="user-avatar-wrapper">
                        <img src={user.profileImage} alt={user.username} />
                    </Link>
                    <div className="user-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Link to={`/user/${user.username}`} style={{ textDecoration: 'none' }}>
                                <p className="username">u/{user.username}</p>
                            </Link>
                            {(!authUser || authUser.username !== user.username) && (
                                <>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
                                    <button 
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: isFollowing ? 'var(--text-secondary)' : 'var(--accent)',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="post-time">{getRelativeTime(post._id)}</p>
                    </div>
                </div>
                <button className="post-menu-btn" aria-label="Post options">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* ── Caption ── */}
            {post.caption && (
                <p className="post-caption">{post.caption}</p>
            )}

            {/* ── Image ── */}
            {post.imgurl && (
                <div className="post-image-wrapper">
                    <img src={post.imgurl} alt="Post content" loading="lazy" />
                </div>
            )}

            {/* ── Actions ── */}
            <div className="post-actions">
                {/* Like */}
                <motion.button
                    className={`action-btn${post.isLiked ? ' liked' : ''}`}
                    onClick={() => requireAuth(() =>
                        post.isLiked ? handleUnLike(post._id) : handleLike(post._id)
                    )}
                    whileTap={{ scale: 0.9 }}
                    aria-label={post.isLiked ? 'Unlike' : 'Like'}
                >
                    <ArrowBigUp
                        size={18}
                        fill={post.isLiked ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                    />
                    {fmt(post.likeCount)}
                </motion.button>

                {/* Comments (placeholder — no backend yet) */}
                <motion.button
                    className="action-btn"
                    onClick={() => requireAuth(null)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Comments"
                >
                    <MessageSquare size={16} strokeWidth={1.5} />
                    0
                </motion.button>

                {/* Share */}
                <motion.button
                    className="action-btn"
                    onClick={handleShare}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Share"
                >
                    <Share2 size={16} strokeWidth={1.5} />
                    Share
                </motion.button>

                <div className="action-spacer" />

                {/* Save */}
                <motion.button
                    className={`action-btn${saved ? ' saved' : ''}`}
                    onClick={handleSave}
                    whileTap={{ scale: 0.9 }}
                    aria-label={saved ? 'Unsave' : 'Save'}
                >
                    <Bookmark
                        size={16}
                        strokeWidth={1.5}
                        fill={saved ? 'currentColor' : 'none'}
                    />
                    {saved ? 'Saved' : 'Save'}
                </motion.button>
            </div>
        </motion.div>
    )
}

export default Post