import React, { useState, useRef } from 'react'
import "../style/createpost.scss"
import { usePost } from '../hook/usePost'
import { useNavigate } from 'react-router'
import Spinner from '../../shared/components/Spinner'
import { ImagePlus, PenLine } from 'lucide-react'
import { motion } from 'framer-motion'

const CreatePost = () => {
    const [caption, setCaption] = useState("")
    const [preview, setPreview] = useState(null)
    const postImageInputFieldRef = useRef(null)
    const navigate = useNavigate()
    const { loading, handleCreatePost } = usePost()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const file = postImageInputFieldRef.current.files[0]
        await handleCreatePost(file, caption)
        if (file) {
            navigate('/')
        }
    }

    if (loading) {
        return (
            <div className="loading-page">
                <Spinner />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Uploading your post...
                </p>
            </div>
        )
    }

    return (
        <div className="create-post-page">
            <motion.div
                className="create-post-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="card-header">
                    <PenLine size={20} />
                    <h1>Create Post</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Upload Zone */}
                    <label
                        className={`upload-zone${preview ? ' has-image' : ''}`}
                        htmlFor="postImage"
                    >
                        <ImagePlus size={32} />
                        <span className="upload-text">
                            {preview
                                ? "✓ Image selected — click to change"
                                : "Click to select an image"}
                        </span>
                        <span className="upload-subtext">PNG, JPG, WEBP supported</span>
                    </label>

                    <input
                        ref={postImageInputFieldRef}
                        hidden
                        type="file"
                        name="postImage"
                        id="postImage"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Preview" />
                        </div>
                    )}

                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        name="caption"
                        id="caption"
                        placeholder="Write a caption for your post..."
                        rows={3}
                    />

                    <button className="button primary-button submit-btn" type="submit">
                        Share Post
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

export default CreatePost