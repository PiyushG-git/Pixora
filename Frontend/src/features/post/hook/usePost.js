import { getFeed, createPost, likePost, unLikePost } from "../services/post.api"
import { useContext } from "react"
import { PostContext } from "../post.context"
import toast from "react-hot-toast"

export const usePost = () => {

    const context = useContext(PostContext)
    const { loading, setLoading, post, setPost, feed, setFeed } = context

    const handleGetFeed = async () => {
        setLoading(true)
        try {
            const data = await getFeed()
            setFeed(data.posts)
        } catch {
            toast.error("Failed to load feed.")
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
            const data = await createPost(imageFile, caption)
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

    return { loading, feed, post, handleGetFeed, handleCreatePost, handleLike, handleUnLike }
}