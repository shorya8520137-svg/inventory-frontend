import React from 'react';
import styles from './analytics.module.css';

export default function GraphCard({ title, imageSrc, filters, onFilterChange }) {
    return (
        <div className={styles.graphCard}>
            <h3>{title}</h3>

            <div className={styles.filterRow}>
                <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => onFilterChange('date', e.target.value)}
                />
                <input
                    type="time"
                    value={filters.time}
                    onChange={(e) => onFilterChange('time', e.target.value)}
                />
            </div>

            <img src={imageSrc} alt={title} className={styles.graphImage} />
        </div>
    );
}