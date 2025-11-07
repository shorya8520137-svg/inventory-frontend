import React, { useState } from 'react';
import styles from './OrderProcessStatusPanel.module.css';

export default function OrderProcessStatusPanel() {
    const [date, setDate] = useState('');
    const [awb, setAwb] = useState('');
    const [status, setStatus] = useState('');
    const [warehouse, setWarehouse] = useState('');
    const [entries, setEntries] = useState([]);

    const handleUpdate = async () => {
        if (!awb.trim() || !warehouse || !status) {
            console.warn('[Frontend] ❌ Missing required fields');
            return;
        }

        try {
            const res = await fetch('/api/status/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ awb, warehouse, newStatus: status })
            });

            const result = await res.json();

            if (result.success) {
                console.log('[Frontend] ✅ Status updated');

                // Re-fetch updated entry from backend
                const fetchRes = await fetch(`/api/status/fetch-awb?awb=${awb}&warehouse=${warehouse}`);
                const data = await fetchRes.json();

                setEntries(data);
            } else {
                console.error('[Frontend] ❌ Update failed:', result.error);
            }
        } catch (err) {
            console.error('[Frontend] ❌ Network error:', err.message);
        }

        setDate('');
        setAwb('');
        setStatus('');
        setWarehouse('');
    };

    return (
        <div className={styles.container}>
            <h2>Order Process Status</h2>

            <div className={styles.inputRow}>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="AWB Number"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Select Status</option>
                    <option value="return">Return</option>
                    <option value="intransit">In Transit</option>
                    <option value="dispatched">Dispatched</option>
                </select>
                <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                >
                    <option value="">Select Warehouse</option>
                    <option value="Mumbai Warehouse">Mumbai Warehouse</option>
                    <option value="Hyderabad Warehouse">Hyderabad Warehouse</option>
                    <option value="Ahmedabad Warehouse">Ahmedabad Warehouse</option>
                    <option value="Bangalore Warehouse">Bangalore Warehouse</option>
                    <option value="Gurgaon Warehouse">Gurgaon Warehouse</option>
                </select>
                <button onClick={handleUpdate}>Update</button>
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>AWB Number</th>
                    <th>Status</th>
                    <th>Warehouse</th>
                </tr>
                </thead>
                <tbody>
                {entries.map((entry, index) => (
                    <tr key={index}>
                        <td>{entry.date || date}</td>
                        <td>{entry.awb}</td>
                        <td>{entry.status}</td>
                        <td>{entry.warehouse}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}