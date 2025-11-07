import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './analytics.module.css';

export default function AnalyticsPanel() {
    const [filters, setFilters] = useState({
        date: '',
        time: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const exportToExcel = (data, sheetName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `${sheetName}.xlsx`);
    };

    const salesData = [
        { label: 'Mon', value: 120 },
        { label: 'Tue', value: 200 },
        { label: 'Wed', value: 150 },
        { label: 'Thu', value: 180 },
        { label: 'Fri', value: 90 }
    ];

    const paymentData = [
        { label: 'COD', value: 100 },
        { label: 'UPI', value: 80 },
        { label: 'Debit Card', value: 60 },
        { label: 'Credit Card', value: 40 }
    ];

    const processedData = [
        { label: 'Ravi', value: 50 },
        { label: 'Neha', value: 70 },
        { label: 'Amit', value: 30 },
        { label: 'Priya', value: 90 }
    ];

    return (
        <div className={styles.panel}>
            <h2>📊 Analytics Dashboard</h2>

            <div className={styles.graphGrid}>
                {/* Sales Trends */}
                <div className={styles.graphCard}>
                    <h3>📈 Sales Trends</h3>
                    <div className={styles.filterRow}>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                        <input
                            type="time"
                            value={filters.time}
                            onChange={(e) => handleFilterChange('time', e.target.value)}
                        />
                        <button onClick={() => exportToExcel(salesData, 'Sales_Trends')}>
                            ⬇️ Export Excel
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4caf50" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Mode Breakdown */}
                <div className={styles.graphCard}>
                    <h3>💳 Payment Mode Breakdown</h3>
                    <div className={styles.filterRow}>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                        <input
                            type="time"
                            value={filters.time}
                            onChange={(e) => handleFilterChange('time', e.target.value)}
                        />
                        <button onClick={() => exportToExcel(paymentData, 'Payment_Modes')}>
                            ⬇️ Export Excel
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={paymentData}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#2196f3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders Processed by Person */}
                <div className={styles.graphCard}>
                    <h3>🧑‍💼 Orders Processed by Person</h3>
                    <div className={styles.filterRow}>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                        <input
                            type="time"
                            value={filters.time}
                            onChange={(e) => handleFilterChange('time', e.target.value)}
                        />
                        <button onClick={() => exportToExcel(processedData, 'Processed_By')}>
                            ⬇️ Export Excel
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processedData}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#ff9800" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}