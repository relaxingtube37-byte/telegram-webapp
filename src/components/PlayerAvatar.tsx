import React, { useState, useEffect, useRef } from 'react';

interface PlayerAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  isWinner?: boolean;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = React.memo(({
  name,
  imageUrl,
  size = 22,
  isWinner = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const handleImgRef = (el: HTMLImageElement | null) => {
    imgRef.current = el;
    if (el && el.complete) {
      if (el.naturalWidth === 0) {
        setImgError(true);
      }
    }
  };

  const initial = (name || 'P')
    .trim()
    .replace(/^[^a-zA-Z0-9]+/, '')
    .charAt(0)
    .toUpperCase() || '•';

  return (
    <div
      className={`player-avatar-wrap ${isWinner ? 'avatar-is-winner' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
      title={name}
      aria-label={`Photo of ${name}`}
    >
      {/* Background fallback letter badge: always present underneath */}
      <div
        className="player-avatar-fallback"
        style={{
          fontSize: size <= 24 ? '0.62rem' : size <= 36 ? '0.75rem' : '0.95rem',
        }}
      >
        {initial}
      </div>

      {/* Player photo: rendered on top of fallback, hidden only on error */}
      {imageUrl && !imgError && (
        <img
          ref={handleImgRef}
          src={imageUrl}
          alt={name}
          decoding="async"
          className="player-avatar-img"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
});
