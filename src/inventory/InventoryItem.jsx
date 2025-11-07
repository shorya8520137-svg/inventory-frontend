import React from 'react';
import styles from './inventory.module.css';

export default function InventoryItem({ name, quantity, date, time, warehouse, onSheetUpload }) {
    return (
        <div className={styles.itemBlock}>
            <p><strong>Product:</strong> {name}</p>
            <p><strong>Stock:</strong> {quantity}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Warehouse:</strong> {warehouse}</p>

            {onSheetUpload && (
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={onSheetUpload}
                    className={styles.uploadButton}
                />
            )}
        </div>
    );
}