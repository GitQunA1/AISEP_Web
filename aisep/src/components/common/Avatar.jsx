import React, { useState } from 'react';
import styles from './Avatar.module.css';

/**
 * Avatar Component - Displays user/startup logo with fallback
 * If image fails to load, displays a colored circle with first letter
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for image
 * @param {string} name - Full name (for fallback first letter)
 * @param {string} size - 'sm', 'md', 'lg'
 */
function Avatar({ src, alt = 'Avatar', name = 'User', size = 'md' }) {
  const [imageError, setImageError] = useState(false);

  // Get first letter of name for fallback
  const firstLetter = name.charAt(0).toUpperCase();
  
  // Generate a consistent color based on name
  const getColorForName = (nameStr) => {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Sky Blue
    ];
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const backgroundColor = getColorForName(name);

  // Show fallback if image fails to load or is a placeholder
  if (imageError || !src || src.includes('placeholder')) {
    return (
      <div
        className={`${styles.avatarFallback} ${styles[`avatarFallback--${size}`]}`}
        style={{ backgroundColor }}
        title={name}
      >
        <span className={styles.fallbackText}>{firstLetter}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.avatar} ${styles[`avatar--${size}`]}`}
      onError={() => setImageError(true)}
    />
  );
}

export default Avatar;
