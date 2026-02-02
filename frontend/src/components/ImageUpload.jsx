import { useState } from 'react';
import axios from 'axios';
import { compressImage, fileToBase64, validateImageFile } from '../utils/imageCompression';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ImageUpload({ onImagesChange, maxImages = 3 }) {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = maxImages - images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            setError(`You can only upload ${maxImages} images. ${files.length - remainingSlots} file(s) ignored.`);
            setTimeout(() => setError(null), 3000);
        }

        setUploading(true);
        setError(null);

        try {
            const uploadedImages = [];

            for (const file of filesToProcess) {
                // Validate file
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    setError(validation.error);
                    continue;
                }

                // Compress image
                const compressed = await compressImage(file);

                // Convert to base64
                const base64 = await fileToBase64(compressed);

                // Upload to Cloudinary via backend
                const result = await uploadImage(base64);
                uploadedImages.push(result);
            }

            const newImages = [...images, ...uploadedImages];
            setImages(newImages);
            onImagesChange(newImages);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const uploadImage = async (base64) => {
        try {
            const response = await axios.post(`${API_URL}/reporting/upload-image`, {
                image_base_64: base64
            });

            if (response.data.success) {
                return {
                    url: response.data.url,
                    public_id: response.data.public_id
                };
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Upload failed');
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <div className="image-upload">
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={images.length >= maxImages || uploading}
                className="wq-form-input"
                style={{ marginBottom: '10px' }}
            />

            {error && (
                <div className="wq-alert wq-alert-danger" style={{ marginBottom: '10px', padding: '8px' }}>
                    {error}
                </div>
            )}

            {uploading && (
                <div className="upload-progress" style={{ textAlign: 'center', padding: '10px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--wq-text-secondary)', fontSize: '14px' }}>Uploading images...</p>
                </div>
            )}

            {images.length > 0 && (
                <div className="image-previews">
                    {images.map((img, idx) => (
                        <div key={idx} className="image-preview">
                            <img src={img.url} alt={`Upload ${idx + 1}`} />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="remove-image-btn"
                                title="Remove image"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {images.length < maxImages && (
                <p style={{ fontSize: '12px', color: 'var(--wq-text-secondary)', marginTop: '8px' }}>
                    {images.length} / {maxImages} images uploaded
                </p>
            )}
        </div>
    );
}
