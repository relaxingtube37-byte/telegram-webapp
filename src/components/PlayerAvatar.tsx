import React, { useState, useEffect } from 'react';

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
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [imageUrl]);

  const initial = (name || 'P')
    .trim()
    .replace(/^[^a-zA-Z0-9]+/, '')
    .charAt(0)
    .toUpperCase() || '•';

  const shouldShowImg = Boolean(imageUrl && !imgError);

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
      {shouldShowImg ? (
        <img
          src={imageUrl!}
          alt={name}
          loading="lazy"
          className={`player-avatar-img ${imgLoaded ? 'loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : null}

      {(!shouldShowImg || !imgLoaded) && (
        <div
          className="player-avatar-fallback"
          style={{
            fontSize: size <= 24 ? '0.6rem' : size <= 36 ? '0.75rem' : '0.95rem',
          }}
        >
          {initial}
        </div>
      )}
    </div>
  );
});
