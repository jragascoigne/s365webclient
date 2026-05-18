import { useState } from 'react';

export function RemoteImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`image-placeholder ${className}`} aria-hidden="true">
        No image
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
