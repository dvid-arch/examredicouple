import React, { useEffect } from 'react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoId }) => {
    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            // Prevent scrolling on the body while modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Overlay click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-label="Close modal background" />
            
            {/* Modal Content - Mobile Width (9:16 ratio) */}
            <div className="relative z-10 w-full max-w-[360px] flex flex-col bg-transparent shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-end p-2 bg-slate-900">
                    <button 
                        onClick={onClose}
                        className="text-white hover:text-red-400 focus:outline-none transition-colors rounded-full p-1.5 bg-slate-800 hover:bg-slate-700 shadow-sm"
                        aria-label="Close video"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* 9:16 Aspect Ratio Container */}
                <div className="relative w-full pb-[177.77%] bg-black">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`}
                        title="ExamRedi How It Works"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
