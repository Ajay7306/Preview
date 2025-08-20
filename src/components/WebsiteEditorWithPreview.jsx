
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Move, Maximize2, Minimize2, Globe, Plus, ExternalLink } from 'lucide-react';
import WebsiteEditor from './WebsiteEditor';

// IframeRenderer component for external websites
const IframeRenderer = ({ url, isInteractive = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    // Show fallback after a short delay
    setTimeout(() => setShowFallback(true), 1000);
  };

  // Create a fallback preview when iframe fails
  const renderFallbackPreview = () => {
    const domain = (() => {
      try {
        return new URL(url).hostname.replace('www.', '');
      } catch {
        return 'website';
      }
    })();

    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="text-center text-white p-8 max-w-md relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Globe className="w-10 h-10 text-blue-400" />
          </div>
          
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {domain.charAt(0).toUpperCase() + domain.slice(1)}
          </h3>
          
          <p className="text-gray-300 text-sm mb-2">Preview not available</p>
          <p className="text-gray-500 text-xs mb-6">
            This website blocks iframe embedding for security
          </p>
          
          <div className="flex flex-col gap-3">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>
            
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <span>{url}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400/50 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-12 w-1 h-1 bg-purple-400/50 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-green-400/50 rounded-full animate-pulse delay-500"></div>
      </div>
    );
  };

  if (hasError || showFallback) {
    return renderFallbackPreview();
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="w-12 h-12 relative mb-4 mx-auto">
              <div className="w-full h-full border-4 border-blue-400/20 rounded-full"></div>
              <div className="absolute inset-0 w-full h-full border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-300 font-medium">Loading {new URL(url).hostname}...</p>
          </div>
        </div>
      )}
      <iframe
        src={url}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

const SmoothDraggable = ({
    children,
    position,
    onPositionChange,
    onDragStart,
    onDragEnd,
    isDragging,
    setIsDragging,
    snapToCorners = false,
    onSnapToCorner,
    isMinimized = false,
    onMouseDown,
    onMouseUp,
    disabled
}) => {
    const elementRef = useRef(null);
    const dragDataRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        currentX: position.x,
        currentY: position.y,
        hasMoved: false
    });

    useEffect(() => {
        if (disabled) {
            const wasCurrentlyDragging = dragDataRef.current.isDragging;

            // Reset all drag data
            dragDataRef.current = {
                isDragging: false,
                startX: 0,
                startY: 0,
                startLeft: 0,
                startTop: 0,
                currentX: position.x,
                currentY: position.y,
                hasMoved: false
            };

            // Reset drag state if it was dragging
            if (wasCurrentlyDragging) {
                setIsDragging(false);
            }

            // Clean up any lingering styles
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, [disabled, setIsDragging, position.x, position.y]);

    const updatePosition = useCallback((x, y, smooth = false) => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        // Get current window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const elementWidth = 320;
        const elementHeight = isMinimized ? 60 : 180;

        // Apply bounds to ensure element stays fully within viewport
        const boundedX = Math.max(0, Math.min(x, windowWidth - elementWidth));
        const boundedY = Math.max(0, Math.min(y, windowHeight - elementHeight));

        dragDataRef.current.currentX = boundedX;
        dragDataRef.current.currentY = boundedY;

        // Apply transform with smooth transition if needed
        element.style.transition = smooth ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
        element.style.transform = `translate3d(${boundedX}px, ${boundedY}px, 0)`;

        onPositionChange({ x: boundedX, y: boundedY });
    }, [onPositionChange, isMinimized]);

    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0 || disabled) return; // Only left click and not disabled

        // Check if the click is on a button or control element
        if (e.target.closest('button, .control-button, .no-drag')) {
            return; // Don't start dragging if clicking on buttons
        }

        e.preventDefault();
        e.stopPropagation();

        const rect = elementRef.current.getBoundingClientRect();
        dragDataRef.current = {
            isDragging: false, // Don't set to true immediately
            startX: e.clientX,
            startY: e.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            currentX: rect.left,
            currentY: rect.top,
            hasMoved: false
        };

        // Call the external onMouseDown handler
        onMouseDown?.(e);

        // Start with grab cursor, will change to grabbing when actually dragging
        document.body.style.cursor = 'grab';
        document.body.style.userSelect = 'none';
    }, [onMouseDown, disabled]);

    const handleMouseMove = useCallback((e) => {
        if (!dragDataRef.current.startX || disabled) return;

        e.preventDefault();

        const deltaX = e.clientX - dragDataRef.current.startX;
        const deltaY = e.clientY - dragDataRef.current.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only start dragging if moved more than 5 pixels
        if (distance > 5 && !dragDataRef.current.isDragging) {
            dragDataRef.current.isDragging = true;
            dragDataRef.current.hasMoved = true;
            setIsDragging(true);
            // Change to grabbing cursor only when actually dragging
            document.body.style.cursor = 'grabbing';
            onDragStart?.();
        }

        if (dragDataRef.current.isDragging) {
            const newX = dragDataRef.current.startLeft + deltaX;
            const newY = dragDataRef.current.startTop + deltaY;
            updatePosition(newX, newY);
        }
    }, [updatePosition, setIsDragging, onDragStart, disabled]);

    const handleMouseUp = useCallback((e) => {
        const wasActuallyDragging = dragDataRef.current.isDragging;
        const hasMoved = dragDataRef.current.hasMoved;

        // Always reset drag state
        dragDataRef.current.isDragging = false;
        dragDataRef.current.hasMoved = false;
        dragDataRef.current.startX = 0;
        dragDataRef.current.startY = 0;
        setIsDragging(false);

        // Reset cursor
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Handle snapping to corners only if we were actually dragging
        if (wasActuallyDragging && snapToCorners && onSnapToCorner && !disabled) {
            const snapDistance = 100;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const thumbnailWidth = 320;
            const thumbnailHeight = isMinimized ? 60 : 180;
            const margin = 10;

            // Define all possible corner positions
            const corners = [
                { x: margin, y: margin, name: 'top-left' },
                { x: windowWidth - thumbnailWidth - margin, y: margin, name: 'top-right' },
                { x: margin, y: windowHeight - thumbnailHeight - margin, name: 'bottom-left' },
                { x: windowWidth - thumbnailWidth - margin, y: windowHeight - thumbnailHeight - margin, name: 'bottom-right' }
            ];

            let snapTarget = null;
            let minDistance = Infinity;

            // Find the closest corner within snap distance
            for (const corner of corners) {
                const distance = Math.sqrt(
                    Math.pow(dragDataRef.current.currentX - corner.x, 2) +
                    Math.pow(dragDataRef.current.currentY - corner.y, 2)
                );

                if (distance < snapDistance && distance < minDistance) {
                    minDistance = distance;
                    snapTarget = corner;
                }
            }

            if (snapTarget) {
                updatePosition(snapTarget.x, snapTarget.y, true);
                onSnapToCorner(snapTarget);
            }
        }

        // Call external mouse up handler, passing whether it was a drag or click
        if (!disabled) {
            onMouseUp?.(e, wasActuallyDragging, hasMoved);
        }

        onDragEnd?.();
    }, [setIsDragging, snapToCorners, onSnapToCorner, updatePosition, onDragEnd, isMinimized, onMouseUp, disabled]);

    // Touch events for mobile
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length !== 1 || disabled) return;

        // Check if the touch is on a button or control element
        if (e.target.closest('button, .control-button, .no-drag')) {
            return; // Don't start dragging if touching buttons
        }

        e.preventDefault();
        const touch = e.touches[0];

        const rect = elementRef.current.getBoundingClientRect();
        dragDataRef.current = {
            isDragging: false,
            startX: touch.clientX,
            startY: touch.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            currentX: rect.left,
            currentY: rect.top,
            hasMoved: false
        };

        onMouseDown?.({ clientX: touch.clientX, clientY: touch.clientY });
    }, [onMouseDown, disabled]);

    const handleTouchMove = useCallback((e) => {
        if (!dragDataRef.current.startX || e.touches.length !== 1 || disabled) return;

        e.preventDefault();
        const touch = e.touches[0];

        const deltaX = touch.clientX - dragDataRef.current.startX;
        const deltaY = touch.clientY - dragDataRef.current.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only start dragging if moved more than 5 pixels
        if (distance > 5 && !dragDataRef.current.isDragging) {
            dragDataRef.current.isDragging = true;
            dragDataRef.current.hasMoved = true;
            setIsDragging(true);
            onDragStart?.();
        }

        if (dragDataRef.current.isDragging) {
            const newX = dragDataRef.current.startLeft + deltaX;
            const newY = dragDataRef.current.startTop + deltaY;
            updatePosition(newX, newY);
        }
    }, [updatePosition, setIsDragging, onDragStart, disabled]);

    const handleTouchEnd = useCallback((e) => {
        handleMouseUp(e);
    }, [handleMouseUp]);

    // Set up event listeners
    useEffect(() => {
        if (disabled) {
            return;
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);

            // Clean up cursor styles
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, disabled]);

    // Initialize position only once or when position prop changes significantly
    useEffect(() => {
        const currentPos = dragDataRef.current;
        const positionChanged = Math.abs(currentPos.currentX - position.x) > 1 || Math.abs(currentPos.currentY - position.y) > 1;

        if (positionChanged && !dragDataRef.current.isDragging) {
            updatePosition(position.x, position.y, false);
        }
    }, [position.x, position.y, updatePosition]);

    return (
        <div
            ref={elementRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                zIndex: isDragging ? 9999 : 50,
                willChange: isDragging ? 'transform' : 'auto',
                touchAction: 'none',
                pointerEvents: disabled ? 'none' : 'auto',
            }}
        >
            {children}
        </div>
    );
};

// Snap Zone Indicator Component
const SnapZoneIndicator = ({ zones, currentPosition, isMinimized, isDragging }) => {
    if (!isDragging) return null;

    const snapDistance = 100;
    let activeZones = [];

    // Find all zones within snap distance
    for (const zone of zones) {
        const distance = Math.sqrt(
            Math.pow(currentPosition.x - zone.x, 2) +
            Math.pow(currentPosition.y - zone.y, 2)
        );

        if (distance < snapDistance) {
            activeZones.push({ ...zone, distance });
        }
    }

    // Sort by distance and take the closest one
    activeZones.sort((a, b) => a.distance - b.distance);
    const activeZone = activeZones[0];

    if (!activeZone) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-40">
            <div
                className="absolute border-3 border-blue-400 bg-blue-100/20 rounded-xl backdrop-blur-sm shadow-lg"
                style={{
                    left: `${activeZone.x}px`,
                    top: `${activeZone.y}px`,
                    width: '320px',
                    height: isMinimized ? '60px' : '180px',
                    animation: 'pulse 0.6s ease-in-out infinite alternate',
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)'
                }}
            >
                <div className="absolute inset-2 border border-blue-300/60 rounded-lg" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-blue-500/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium shadow-lg">
                        {activeZone.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Corner
                    </div>
                </div>

                {/* Corner indicator arrows */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {activeZone.name === 'top-left' && (
                        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-400" />
                    )}
                    {activeZone.name === 'top-right' && (
                        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-blue-400" />
                    )}
                    {activeZone.name === 'bottom-left' && (
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-blue-400" />
                    )}
                    {activeZone.name === 'bottom-right' && (
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-blue-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Draggable Thumbnail Component
const DraggableThumbnail = ({
    isHovered,
    setIsHovered,
    isMinimized,
    setIsMinimized,
    setShowLargePreview,
    position,
    onPositionChange,
    isDragging,
    setIsDragging,
    onSnapToCorner,
    disabled,
    websiteUrl = null
}) => {
    const clickDataRef = useRef({
        startTime: 0,
        startX: 0,
        startY: 0
    });

    // Reset hover state when disabled (modal is open)
    useEffect(() => {
        if (disabled) {
            setIsHovered(false);
        }
    }, [disabled, setIsHovered]);

    const handleMouseDown = useCallback((e) => {
        if (disabled) return;

        clickDataRef.current = {
            startTime: Date.now(),
            startX: e.clientX,
            startY: e.clientY
        };
    }, [disabled]);

    const handleMouseUp = useCallback((e, wasActuallyDragging, hasMoved) => {
        if (disabled) return;

        // Check if the click was on a button element or its children
        const clickedElement = e.target;
        const isButtonClick = clickedElement.closest('button, .control-button, .no-drag') !== null;

        // Only trigger click if it wasn't a drag, didn't move much, and wasn't a button click
        if (!wasActuallyDragging && !hasMoved && !isButtonClick) {
            const clickEndTime = Date.now();
            const clickDuration = clickEndTime - clickDataRef.current.startTime;
            const clickDistance = Math.sqrt(
                Math.pow(e.clientX - clickDataRef.current.startX, 2) +
                Math.pow(e.clientY - clickDataRef.current.startY, 2)
            );

            // Only trigger click if it was a short click and didn't move much
            if (clickDuration < 500 && clickDistance < 10) {
                setTimeout(() => {
                    setShowLargePreview(true);
                }, 50); // Small delay to ensure drag state is fully reset
            }
        }

        // Reset click data
        clickDataRef.current = {
            startTime: 0,
            startX: 0,
            startY: 0
        };
    }, [setShowLargePreview, disabled]);

    const getDisplayTitle = () => {
        if (websiteUrl) {
            try {
                const domain = new URL(websiteUrl).hostname.replace('www.', '');
                return domain.charAt(0).toUpperCase() + domain.slice(1);
            } catch {
                return 'External Website';
            }
        }
        return 'Website Editor';
    };

    const getDisplaySubtitle = () => {
        if (websiteUrl) {
            try {
                return new URL(websiteUrl).hostname;
            } catch {
                return 'Invalid URL';
            }
        }
        return 'Live Preview • Interactive';
    };

    return (
        <SmoothDraggable
            position={position}
            onPositionChange={onPositionChange}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            snapToCorners={true}
            onSnapToCorner={onSnapToCorner}
            isMinimized={isMinimized}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            disabled={disabled}
        >
            <div
                className={`bg-black rounded-xl overflow-hidden transition-all duration-200 select-none relative ${isDragging
                    ? 'shadow-2xl scale-105 rotate-1 opacity-95'
                    : 'shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    } ${isMinimized ? 'opacity-90' : ''} ${disabled ? 'opacity-50' : ''}`}
                style={{
                    width: '320px',
                    height: isMinimized ? '60px' : '180px',
                    cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'pointer'),
                }}
                onMouseEnter={() => !isDragging && !disabled && setIsHovered(true)}
                onMouseLeave={() => !isDragging && !disabled && setIsHovered(false)}
            >
                {!isMinimized ? (
                    <>
                        {/* Website Content */}
                        <div className="relative w-full h-full bg-gray-900 overflow-hidden">
                            <div
                                className="origin-top-left select-none [pointer-events:none] [&_*]:pointer-events-none [&_*]:select-none"
                                style={{
                                    transform: 'scale(0.25)',
                                    width: '1280px',
                                    height: '720px',
                                    transformOrigin: '0 0',
                                }}
                                onClick={(e) => e.preventDefault()}
                                onMouseDown={(e) => e.preventDefault()}
                                onKeyDown={(e) => e.preventDefault()}
                            >
                                {websiteUrl ? (
                                    <IframeRenderer url={websiteUrl} isInteractive={false} />
                                ) : (
                                    <WebsiteEditor />
                                )}
                            </div>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent !pointer-events-none" />

                            {/* Fullscreen button overlay */}
                            {!isDragging && !disabled && (
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                                    }`}>
                                    <button
                                        className="control-button w-14 h-14 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-black/80 hover:scale-110 transition-all duration-200 shadow-lg relative z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (!disabled) {
                                                setShowLargePreview(true);
                                            }
                                        }}
                                        title="Open in fullscreen"
                                        disabled={disabled}
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        <Maximize2 className="w-7 h-7 text-white" />
                                    </button>
                                </div>
                            )}

                            {/* Pulse border effect when hovering */}
                            <div className={`absolute inset-0 rounded-xl border-2 border-white/40 transition-all duration-300 pointer-events-none ${isHovered && !isDragging && !disabled ? 'opacity-100' : 'opacity-0'
                                }`} style={{
                                    animation: isHovered && !isDragging && !disabled ? 'pulse 2s ease-in-out infinite' : 'none'
                                }} />
                        </div>

                        {/* Controls Overlay */}
                        <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ease-out z-20 ${(isHovered || isDragging) && !disabled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`} style={{ pointerEvents: 'auto' }}>
                            {websiteUrl && (
                                <button
                                    className="control-button p-1.5 bg-black/70 hover:bg-blue-600 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110 active:scale-95 border border-white/10 disabled:opacity-50 disabled:hover:scale-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (!disabled) {
                                            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                    title="Open in new tab"
                                    disabled={disabled}
                                >
                                    <ExternalLink className="w-4 h-4 text-white" />
                                </button>
                            )}
                            <button
                                className="control-button p-1.5 bg-black/70 hover:bg-black/90 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110 active:scale-95 border border-white/10 disabled:opacity-50 disabled:hover:scale-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (!disabled) {
                                        setIsMinimized(true);
                                    }
                                }}
                                title="Minimize"
                                disabled={disabled}
                            >
                                <Minimize2 className="w-4 h-4 text-white" />
                            </button>
                            <button
                                className="control-button p-1.5 bg-black/70 hover:bg-blue-600 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110 active:scale-95 border border-white/10 disabled:opacity-50 disabled:hover:scale-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (!disabled) {
                                        setShowLargePreview(true);
                                    }
                                }}
                                title="Open fullscreen"
                                disabled={disabled}
                            >
                                <Maximize2 className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Bottom info bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pointer-events-none">
                            <div className={`text-white text-sm font-medium truncate transition-all duration-200 ${isDragging ? 'opacity-70 blur-sm' : 'opacity-90'
                                }`}>
                                {getDisplayTitle()}
                            </div>
                            <div className="text-gray-300 text-xs flex items-center gap-2">
                                <span>{getDisplaySubtitle()}</span>
                                {isDragging && (
                                    <>
                                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-green-400">Moving...</span>
                                    </>
                                )}
                                {disabled && (
                                    <>
                                        <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                                        <span className="text-orange-400">Preview Open</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // Minimized state
                    <div className="h-full flex items-center justify-between px-4 bg-black/95 backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 bg-gradient-to-br ${websiteUrl ? 'from-green-500 to-blue-600' : 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center transition-all duration-500 ${isHovered && !disabled ? 'rotate-180 scale-110' : ''
                                }`}>
                                {websiteUrl ? <Globe className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium truncate max-w-[200px]">{getDisplayTitle()}</span>
                                {isDragging && (
                                    <span className="text-green-400 text-xs flex items-center gap-1">
                                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                                        Moving...
                                    </span>
                                )}
                                {disabled && (
                                    <span className="text-orange-400 text-xs flex items-center gap-1">
                                        <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                                        Preview Open
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            className="control-button p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 border border-white/20 disabled:opacity-50 disabled:hover:scale-100 relative z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (!disabled) {
                                    setIsMinimized(false);
                                }
                            }}
                            title="Expand"
                            disabled={disabled}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <Maximize2 className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}

                {/* Drag indicator */}
                <div className={`absolute top-2 left-2 transition-all duration-200 pointer-events-none z-10 ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}>
                    <div className="p-1 bg-blue-500/90 rounded-lg backdrop-blur-sm border border-blue-400/50 shadow-lg">
                        <Move className="w-3 h-3 text-white" />
                    </div>
                </div>

                {/* Magnetic field effect when dragging */}
                <div className={`absolute inset-0 rounded-xl border-2 border-blue-400/60 transition-all duration-200 pointer-events-none ${isDragging ? 'opacity-40 scale-105' : 'opacity-0'
                    }`} />
            </div>
        </SmoothDraggable>
    );
};

// Main Component
const WebsiteEditorWithPreview = () => {
    const [showLargePreview, setShowLargePreview] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [largePreviewScale, setLargePreviewScale] = useState(0.5);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [thumbnailPosition, setThumbnailPosition] = useState({ x: 20, y: 20 });
    
    // New state for URL management
    const [urlInput, setUrlInput] = useState('');
    const [currentWebsiteUrl, setCurrentWebsiteUrl] = useState(null);
    const [showUrlInput, setShowUrlInput] = useState(false);

    // Get snap zones with dynamic window sizing - memoized properly
    const snapZones = React.useMemo(() => {
        const margin = 10;
        const thumbnailWidth = 320;
        const thumbnailHeight = isMinimized ? 60 : 180;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        return [
            { x: margin, y: margin, zone: 'top-left', name: 'top-left' },
            { x: windowWidth - thumbnailWidth - margin, y: margin, zone: 'top-right', name: 'top-right' },
            { x: margin, y: windowHeight - thumbnailHeight - margin, zone: 'bottom-left', name: 'bottom-left' },
            { x: windowWidth - thumbnailWidth - margin, y: windowHeight - thumbnailHeight - margin, zone: 'bottom-right', name: 'bottom-right' }
        ];
    }, [isMinimized]);

    const handleSnapToCorner = useCallback((corner) => {
        setThumbnailPosition({ x: corner.x, y: corner.y });
    }, []);

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    };

    const handleUrlSubmit = () => {
        if (!urlInput.trim()) {
            setCurrentWebsiteUrl(null); // Reset to WebsiteEditor
            return;
        }
        
        let processedUrl = urlInput.trim();
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
        }

        if (!isValidUrl(processedUrl)) {
            alert('Please enter a valid URL');
            return;
        }

        setCurrentWebsiteUrl(processedUrl);
        setUrlInput('');
    };

    const loadQuickSite = (url) => {
        setCurrentWebsiteUrl(url);
        setUrlInput('');
    };

    // Handle window resize to update bounds and snap zones
    useEffect(() => {
        const handleResize = () => {
            // Update position if thumbnail is now out of bounds
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const thumbnailWidth = 320;
            const thumbnailHeight = isMinimized ? 60 : 180;

            const maxX = windowWidth - thumbnailWidth;
            const maxY = windowHeight - thumbnailHeight;

            if (thumbnailPosition.x > maxX || thumbnailPosition.y > maxY) {
                const newX = Math.min(thumbnailPosition.x, maxX);
                const newY = Math.min(thumbnailPosition.y, maxY);
                setThumbnailPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [thumbnailPosition, isMinimized]);

    // Enhanced effect to handle modal close and cleanup
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showLargePreview) {
                if (e.key === 'Escape') {
                    setShowLargePreview(false);
                } else if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    setLargePreviewScale(prev => Math.min(prev + 0.1, 1.5));
                } else if (e.key === '-') {
                    e.preventDefault();
                    setLargePreviewScale(prev => Math.max(prev - 0.1, 0.3));
                } else if (e.key === '0') {
                    e.preventDefault();
                    setLargePreviewScale(0.8);
                }
            }

            if (showUrlInput && e.key === 'Escape') {
                setShowUrlInput(false);
                setUrlInput('');
            }

            if (e.key === 'u' && e.ctrlKey) {
                e.preventDefault();
                setShowUrlInput(prev => !prev);
            }

            if (e.key === 'm' && e.ctrlKey) {
                e.preventDefault();
                setIsMinimized(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showLargePreview, showUrlInput]);

    // Clean up drag state when modal closes
    useEffect(() => {
        if (!showLargePreview) {
            // Force reset any lingering drag state
            setIsDragging(false);
            setIsHovered(false);

            // Clean up any lingering cursor styles
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, [showLargePreview]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Main Background Content */}
            <div className="w-full h-full">
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                                                radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
                                backgroundSize: '100px 100px'
                            }}></div>
                        </div>
                        
                        {/* Floating Elements */}
                        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-40 right-32 w-2 h-2 bg-purple-400/40 rounded-full animate-pulse delay-500"></div>
                        <div className="absolute bottom-32 left-40 w-3 h-3 bg-green-400/30 rounded-full animate-pulse delay-2000"></div>
                        <div className="absolute bottom-20 right-20 w-6 h-6 bg-pink-400/20 rounded-full animate-pulse delay-1500"></div>

                        {/* Main Content */}
                        <div className="text-center text-white max-w-4xl px-8 relative z-10">
                            <div className="mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 backdrop-blur-sm">
                                    <Globe className="w-12 h-12 text-blue-400" />
                                </div>
                                
                                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Website Preview Studio
                                </h1>
                                
                                <p className="text-xl text-gray-300 mb-2">
                                    Enter any website URL to preview it in a draggable thumbnail
                                </p>
                                
                                <p className="text-gray-400 text-sm">
                                    Perfect for multitasking and keeping websites within easy reach
                                </p>
                            </div>

                            {/* URL Input Section */}
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
                                        <p className="text-gray-300 text-sm">
                                            Type a website URL below or choose from popular options
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUrlSubmit();
                                                    }
                                                }}
                                                placeholder="Enter website URL (e.g., google.com, github.com)"
                                                className="w-full bg-black/20 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-lg"
                                                autoFocus
                                            />
                                            {urlInput && (
                                                <button
                                                    onClick={() => setUrlInput('')}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUrlSubmit}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                                        >
                                            <Globe className="w-6 h-6" />
                                            {urlInput.trim() ? 'Load Website' : 'Use Website Editor'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Move className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Draggable</h3>
                                        <p className="text-gray-400 text-sm">Move the preview anywhere on screen</p>
                                    </div>
                                    
                                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Maximize2 className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Resizable</h3>
                                        <p className="text-gray-400 text-sm">Minimize or view in fullscreen</p>
                                    </div>
                                    
                                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <ExternalLink className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Interactive</h3>
                                        <p className="text-gray-400 text-sm">Click to open in fullscreen mode</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

            {!showLargePreview && !showUrlInput && currentWebsiteUrl && (
                <div className="fixed top-6 left-6 z-50 bg-black/60 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>
                            {(() => {
                                try {
                                    return new URL(currentWebsiteUrl).hostname.replace('www.', '');
                                } catch {
                                    return 'External Website';
                                }
                            })()}
                        </span>
                    </div>
                </div>
            )}

            {/* Snap Zone Indicators */}
            <SnapZoneIndicator
                zones={snapZones}
                currentPosition={thumbnailPosition}
                isMinimized={isMinimized}
                isDragging={isDragging}
            />

            {/* Draggable Thumbnail */}
            <DraggableThumbnail
                isHovered={isHovered}
                setIsHovered={setIsHovered}
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
                setShowLargePreview={setShowLargePreview}
                position={thumbnailPosition}
                onPositionChange={setThumbnailPosition}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                onSnapToCorner={handleSnapToCorner}
                disabled={showLargePreview || showUrlInput}
                websiteUrl={currentWebsiteUrl}
            />

            {/* Large Preview Modal */}
            {showLargePreview && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center">
                    {/* Header Controls */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4 bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex items-center gap-2">
                                {currentWebsiteUrl ? (
                                    <Globe className="w-4 h-4 text-green-400" />
                                ) : (
                                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                                )}
                                <span className="text-sm font-medium">
                                    {currentWebsiteUrl ? (
                                        (() => {
                                            try {
                                                return new URL(currentWebsiteUrl).hostname.replace('www.', '');
                                            } catch {
                                                return 'External Website';
                                            }
                                        })()
                                    ) : (
                                        'Website Editor'
                                    )}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-white/20"></div>
                            <span className="text-sm font-medium">Zoom:</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setLargePreviewScale(prev => Math.max(prev - 0.1, 0.3))}
                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 flex items-center justify-center text-lg font-medium hover:scale-110 active:scale-95"
                                >
                                    −
                                </button>
                                <span className="min-w-[60px] text-center text-sm font-mono bg-white/10 px-2 py-1 rounded-lg">
                                    {Math.round(largePreviewScale * 100)}%
                                </span>
                                <button
                                    onClick={() => setLargePreviewScale(prev => Math.min(prev + 0.1, 1.5))}
                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 flex items-center justify-center text-lg font-medium hover:scale-110 active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 z-20 p-3 bg-black/60 backdrop-blur-xl rounded-xl hover:bg-red-500/80 transition-all duration-300 text-white hover:scale-110 hover:rotate-90 active:scale-95"
                        onClick={() => setShowLargePreview(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* External Link Button (for external websites) */}
                    {currentWebsiteUrl && (
                        <button
                            className="absolute top-6 right-20 z-20 p-3 bg-black/60 backdrop-blur-xl rounded-xl hover:bg-blue-500/80 transition-all duration-300 text-white hover:scale-110 active:scale-95"
                            onClick={() => window.open(currentWebsiteUrl, '_blank', 'noopener,noreferrer')}
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    )}

                    {/* Large Preview Content */}
                    <div
                        className="bg-white rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            width: '1200px',
                            height: '800px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            transform: `scale(${largePreviewScale})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                    >
                        {currentWebsiteUrl ? (
                            <IframeRenderer url={currentWebsiteUrl} isInteractive={true} />
                        ) : (
                            <WebsiteEditor />
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl px-6 py-3">
                            <div className="flex items-center gap-4">
                                <kbd className="bg-white/20 px-3 py-1.5 rounded-lg">Esc</kbd>
                                <span>Close</span>
                                <span>•</span>
                                <kbd className="bg-white/20 px-3 py-1.5 rounded-lg">+/-</kbd>
                                <span>Zoom</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebsiteEditorWithPreview;