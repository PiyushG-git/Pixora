import { getFeed, createPost, likePost, unLikePost, deletePost } from "../services/post.api"
import { useContext } from "react"
import { PostContext } from "../post.context"
import toast from "react-hot-toast"
import imageCompression from 'browser-image-compression'

export const usePost = () => {

    const context = useContext(PostContext)
    const { loading, setLoading, post, setPost, feed, setFeed } = context

    const handleGetFeed = async (page = 1, limit = 10) => {
        setLoading(true)
        try {
            const data = await getFeed(page, limit)
            if (page === 1) {
                setFeed(data.posts)
            } else {
                setFeed(prev => [...(prev || []), ...data.posts])
            }
            return data.posts
        } catch {
            toast.error("Failed to load feed.")
            return []
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePost = async (imageFile, caption) => {
        if (!imageFile) {
            toast.error("Please select an image.")
            return
        }
        setLoading(true)
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            }
            const compressedFile = await imageCompression(imageFile, options)
            
            const data = await createPost(compressedFile, caption)
            setFeed(prev => [data.post, ...(prev || [])])
            toast.success("Post created!")
        } catch {
            toast.error("Failed to create post. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Optimistic like: update UI instantly, then sync with server
    const handleLike = async (postId) => {
        // Instantly update the UI
        setFeed(prev => prev?.map(p =>
            p._id === postId ? { ...p, isLiked: true, likeCount: (p.likeCount || 0) + 1 } : p
        ))
        try {
            await likePost(postId)
        } catch {
            // Revert on failure
            setFeed(prev => prev?.map(p =>
                p._id === postId ? { ...p, isLiked: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p
            ))
            toast.error("Failed to like post.")
        }
    }

    // Optimistic unlike: update UI instantly, then sync with server
    const handleUnLike = async (postId) => {
        // Instantly update the UI
        setFeed(prev => prev?.map(p =>
            p._id === postId ? { ...p, isLiked: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p
        ))
        try {
            await unLikePost(postId)
        } catch {
            // Revert on failure
            setFeed(prev => prev?.map(p =>
                p._id === postId ? { ...p, isLiked: true, likeCount: (p.likeCount || 0) + 1 } : p
            ))
            toast.error("Failed to unlike post.")
        }
    }

    const handleDeletePost = async (postId) => {
        setFeed(prev => prev?.filter(p => p._id !== postId))
        try {
            await deletePost(postId)
            toast.success("Post deleted!")
        } catch {
            // If failed, reload feed or just show error
            toast.error("Failed to delete post.")
        }
    }

    return { loading, feed, post, handleGetFeed, handleCreatePost, handleLike, handleUnLike, handleDeletePost }
}