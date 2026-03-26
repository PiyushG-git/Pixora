import React, { useEffect } from 'react'
import "../style/feed.scss"
import Post from '../components/Post'
import { usePost } from '../hook/usePost'
import Spinner from '../../shared/components/Spinner'

const Feed = () => {
    const { feed, handleGetFeed, loading, handleLike, handleUnLike } = usePost()

    useEffect(() => {
        handleGetFeed()
    }, [])

    if (loading && !feed) {
        return (
            <main className='loading-page'>
                <Spinner />
            </main>
        )
    }

    if (!loading && feed && feed.length === 0) {
        return (
            <main className='feed-page'>
                <div className='empty-state'>
                    <p>No posts yet. Be the first to share something!</p>
                    <span>📷</span>
                </div>
            </main>
        )
    }

    return (
        <main className='feed-page'>
            <div className="feed">
                <div className="posts">
                    {feed && feed.map(post => (
                        <Post
                            key={post._id}
                            user={post.user}
                            post={post}
                            handleLike={handleLike}
                            handleUnLike={handleUnLike}
                        />
                    ))}
                </div>
            </div>
        </main>
    )
}

export default Feed