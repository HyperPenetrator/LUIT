import { useState } from 'react';

export default function ImageGallery({ images, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') onClose();
    };

    return (
        <div
            className="wq-modal active"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="image-gallery-content" onClick={(e) => e.stopPropagation()}>
                <button className="wq-close-btn" onClick={onClose} title="Close (Esc)">
                    ×
                </button>

                <div className="gallery-image-container">
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1} of ${images.length}`}
                        className="gallery-image"
                    />
                </div>

                {images.length > 1 && (
                    <div className="gallery-controls">
                        <button
                            onClick={goToPrevious}
                            className="wq-btn wq-btn-outline"
                            title="Previous (←)"
                        >
                            ← Previous
                        </button>
                        <span className="gallery-counter">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <button
                            onClick={goToNext}
                            className="wq-btn wq-btn-outline"
                            title="Next (→)"
                        >
                            Next →
                        </button>
                    </div>
                )}

                <div className="gallery-thumbnails">
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className={`gallery-thumbnail ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
