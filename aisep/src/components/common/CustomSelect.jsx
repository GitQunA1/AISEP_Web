import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import styles from './CustomSelect.module.css';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  name, 
  placeholder = "Chọn giá trị...",
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // coords now stores top, bottom, left, width, maxHeight, and isUpward
  const [coords, setCoords] = useState({ 
    top: 'auto', 
    bottom: 'auto', 
    left: 0, 
    width: 0, 
    maxHeight: 250, 
    isUpward: false 
  });

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - rect.bottom - 16; // 16px bottom safety margin
      const spaceAbove = rect.top - 16; // 16px top safety margin
      
      const idealHeight = 250;
      let isUpward = false;
      let computedMaxHeight = idealHeight;

      // If there's not enough space below, and more space above, open upwards
      if (spaceBelow < idealHeight && spaceAbove > spaceBelow) {
        isUpward = true;
        computedMaxHeight = Math.min(spaceAbove, idealHeight);
      } else {
        computedMaxHeight = Math.min(spaceBelow, idealHeight);
      }

      setCoords({
        top: isUpward ? 'auto' : rect.bottom + 6,
        bottom: isUpward ? viewportHeight - rect.top + 6 : 'auto',
        left: rect.left,
        width: rect.width,
        maxHeight: computedMaxHeight,
        isUpward: isUpward
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside the selector AND outside the portal dropdown, close it
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({
      target: {
        name: name,
        value: option.value
      }
    });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const dropdownElement = (
    <div 
      ref={dropdownRef}
      className={`${styles.dropdown} ${isOpen ? styles.open : ''} ${coords.isUpward ? styles.upward : ''}`}
      style={{
        position: 'fixed',
        top: coords.top !== 'auto' ? `${coords.top}px` : 'auto',
        bottom: coords.bottom !== 'auto' ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        maxHeight: isOpen ? `${coords.maxHeight}px` : '0px',
        transformOrigin: coords.isUpward ? 'bottom center' : 'top center'
      }}
    >
      {options.map((opt) => (
        <div 
          key={opt.value}
          className={`${styles.option} ${String(opt.value) === String(value) ? styles.selected : ''}`}
          onClick={() => handleSelect(opt)}
        >
          <span>{opt.label}</span>
          {String(opt.value) === String(value) && (
            <Check size={16} strokeWidth={2.5} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <div 
        className={`${styles.selector} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <span className={styles.selectedLabel}>{selectedOption.label}</span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <ChevronDown 
          size={18} 
          className={`${styles.icon} ${isOpen ? styles.open : ''}`} 
        />
      </div>
      
      {typeof window !== 'undefined' && createPortal(dropdownElement, document.body)}
    </div>
  );
}
