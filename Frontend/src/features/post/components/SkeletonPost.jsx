import React from 'react'
import { motion } from 'framer-motion'
import './SkeletonPost.scss' // We will add styles here or in a generic place

const SkeletonPost = () => {
    return (
        <motion.div 
            className="post-card skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="post-header">
                <div className="post-user">
                    <div className="skeleton-avatar" />
                    <div className="user-meta">
                        <div className="skeleton-text short" />
                        <div className="skeleton-text x-short" />
                    </div>
                </div>
            </div>
            
            <div className="post-caption">
                <div className="skeleton-text" />
                <div className="skeleton-text medium" />
            </div>

            <div className="post-image-wrapper">
                <div className="skeleton-image" />
            </div>

            <div className="post-actions" style={{ gap: '1rem' }}>
                <div className="skeleton-text x-short" />
                <div className="skeleton-text x-short" />
                <div className="skeleton-text x-short" />
            </div>
        </motion.div>
    )
}

export default SkeletonPost
