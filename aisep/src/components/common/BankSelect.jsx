import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import styles from './BankSelect.module.css';

export default function BankSelect({ 
  value, 
  onChange, 
  options, 
  name, 
  placeholder = "Chọn ngân hàng...",
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  const [coords, setCoords] = useState({ 
    top: 'auto', 
    bottom: 'auto', 
    left: 0, 
    width: 0, 
    maxHeight: 350, 
    isUpward: false 
  });

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      
      const idealHeight = 350;
      let isUpward = false;
      let computedMaxHeight = idealHeight;

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
        width: Math.max(rect.width, 320), // Minimum width for bank selection
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
      
      // Auto-focus search input when opening
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);

      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    } else {
      setSearchTerm(''); // Clear search on close
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const handleSelect = (bank) => {
    onChange({
      target: {
        name: name,
        value: bank.shortName // Using shortName or code as ID
      }
    });
    setIsOpen(false);
  };

  const selectedBank = options.find(opt => opt.shortName === value || opt.code === value);

  // Filter banks based on search
  const filteredOptions = (options || []).filter(opt => {
    const s = (searchTerm || '').toLowerCase();
    const sn = (opt.shortName || opt.short_name || '').toLowerCase();
    const n = (opt.name || opt.fullName || '').toLowerCase();
    const c = (opt.code || '').toLowerCase();
    return sn.includes(s) || n.includes(s) || c.includes(s);
  });

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
      <div className={styles.searchWrapper}>
        <div className={styles.searchIcon}>
          <Search size={16} />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          className={styles.searchInput}
          placeholder="Tìm tên ngân hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        {searchTerm && (
          <button 
            className={styles.clearSearch} 
            onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className={styles.optionsList}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((bank) => (
            <div 
              key={bank.id}
              className={`${styles.option} ${value === bank.shortName || value === bank.code ? styles.selected : ''}`}
              onClick={(e) => { e.stopPropagation(); handleSelect(bank); }}
            >
              <div className={styles.bankLogoWrapper}>
                <img src={bank.logo} alt={bank.shortName} className={styles.bankLogo} />
              </div>
              <div className={styles.bankInfo}>
                <span className={styles.bankShortName}>{bank.shortName || bank.short_name}</span>
                <span className={styles.bankFullName}>{bank.name || bank.fullName}</span>
              </div>
              {(value === bank.shortName || value === bank.code) && (
                <Check size={18} className={styles.checkIcon} strokeWidth={3} />
              )}
            </div>
          ))
        ) : (
          <div className={styles.noResults}>Không tìm thấy ngân hàng nào</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <div 
        className={`${styles.selector} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedBank ? (
          <div className={styles.selectedValue}>
            <div className={styles.selectedLogoWrapper}>
              <img src={selectedBank.logo} alt={selectedBank.shortName} className={styles.bankLogo} />
            </div>
            <span className={styles.selectedLabel}>{selectedBank.shortName}</span>
          </div>
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
