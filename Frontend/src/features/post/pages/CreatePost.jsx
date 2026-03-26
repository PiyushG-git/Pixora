import React, { useState, useRef } from 'react'
import "../style/createpost.scss"
import { usePost } from '../hook/usePost'
import { useNavigate } from 'react-router'
import Spinner from '../../shared/components/Spinner'

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
            <main className='loading-page'>
                <Spinner />
                <p style={{ marginTop: "1rem", color: "#aaa", fontSize: "0.875rem" }}>Uploading your post...</p>
            </main>
        )
    }

    return (
        <main className='create-post-page'>
            <div className="form-container">
                <h1>Create Post</h1>
                <form onSubmit={handleSubmit}>
                    <label className='post-image-label' htmlFor="postImage">
                        {preview ? "✓ Image Selected" : "📷 Select Image"}
                    </label>
                    <input
                        ref={postImageInputFieldRef}
                        hidden
                        type="file"
                        name='postImage'
                        id='postImage'
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <div className='image-preview'>
                            <img src={preview} alt="Preview" />
                        </div>
                    )}
                    <input
                        value={caption}
                        onChange={(e) => { setCaption(e.target.value) }}
                        type="text"
                        name='caption'
                        id='caption'
                        placeholder='Write a caption...'
                    />
                    <button className='button primary-button' type="submit">
                        Share Post
                    </button>
                </form>
            </div>
        </main>
    )
}

export default CreatePost