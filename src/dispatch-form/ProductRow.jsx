import React from 'react';
import styles from './dispatchForm.module.css';

export default function ProductRow() {
    return (
        <div className={styles.row}>
            <input type="text" placeholder="Product Name" />
            <input type="number" placeholder="Quantity" />
        </div>
    );
}