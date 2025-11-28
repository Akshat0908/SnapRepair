import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage, className = '' }: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;

        const position = ((clientX - containerRect.left) / containerRect.width) * 100;
        setSliderPosition(Math.min(Math.max(position, 0), 100));
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden select-none cursor-ew-resize group ${className}`}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* After Image (Background) */}
            <img
                src={afterImage}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Before Image (Foreground - Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%' }}
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-600">
                    <ChevronsLeftRight size={16} />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm pointer-events-none">
                BEFORE
            </div>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm pointer-events-none">
                AFTER
            </div>
        </div>
    );
}
