import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './FilterRow.module.css';

export default function FilterRow({ label, items, selected, onSelect }) {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Check scroll position to toggle arrows
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            // Allow a small buffer (1px) for float calculation differences
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [items]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={styles.filterRowContainer}>
            <span className={styles.label}>{label}</span>

            <div className={styles.scrollWrapper}>
                {/* Left Arrow & Blur */}
                <div className={`${styles.arrowContainer} ${styles.leftArrow} ${showLeftArrow ? styles.visible : ''}`}>
                    <div className={styles.blurLeft}></div>
                    <button onClick={() => scroll('left')} className={styles.arrowButton}>
                        <ChevronLeft size={16} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div
                    className={styles.pillsContainer}
                    ref={scrollRef}
                    onScroll={checkScroll}
                >
                    {items.map(item => (
                        <button
                            key={item}
                            className={`${styles.pill} ${selected === item ? styles.active : ''}`}
                            onClick={() => onSelect(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Right Arrow & Blur */}
                <div className={`${styles.arrowContainer} ${styles.rightArrow} ${showRightArrow ? styles.visible : ''}`}>
                    <div className={styles.blurRight}></div>
                    <button onClick={() => scroll('right')} className={styles.arrowButton}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
