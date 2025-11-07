import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './productTracker.module.css';

export default function ProductTracker({ barcodeOverride, warehouseFilter, onClose }) {
    const { barcode: routeBarcode } = useParams();
    const barcode = barcodeOverride || routeBarcode;

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [breakdown, setBreakdown] = useState({
        dispatch: 0,
        damage: 0,
        return: 0,
        recover: 0,
        stock: null,
        product: '',
        finalStock: null,
    });

    useEffect(() => {
        if (!barcode) return;

        document.body.style.overflow = 'hidden';

        fetch(`/api/track/${barcode}?warehouse=${warehouseFilter}`)
            .then(res => res.json())
            .then(data => {
                data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                const warehouseKey = warehouseFilter?.split('_')[0];
                const warehouseName = warehouseKey?.charAt(0).toUpperCase() + warehouseKey?.slice(1);

                const filteredLogs = data.filter(log => log.warehouse === warehouseName);

                // ✅ Inject synthetic return row from inventory snapshot
                const inventoryLog = filteredLogs.find(log => log.type === 'inventory');
                if (inventoryLog?.return) {
                    filteredLogs.push({
                        type: 'return',
                        quantity: inventoryLog.return,
                        timestamp: inventoryLog.timestamp,
                        warehouse: inventoryLog.warehouse,
                        processed_by: '—',
                        awb: '—'
                    });
                }

                setLogs(filteredLogs);
                setLoading(false);

                let dispatch = 0, damage = 0, returnQty = 0, recover = 0;
                let stock = null;
                let product = '';

                filteredLogs.forEach(log => {
                    const type = log.type?.trim().toLowerCase();

                    if (type === 'dispatch') dispatch += log.quantity;
                    if (type === 'damage') damage += log.quantity;
                    if (type === 'return') returnQty += log.quantity;
                    if (type === 'recover') recover += log.quantity;
                    if (type === 'inventory') {
                        stock = log.quantity;
                        product = log.product || product;
                    }
                });

                const finalStock = stock !== null
                    ? stock - dispatch + returnQty - damage + recover
                    : null;

                setBreakdown({
                    dispatch,
                    damage,
                    return: returnQty,
                    recover,
                    stock,
                    product,
                    finalStock,
                });
            })
            .catch(err => {
                console.error('[Tracker] ❌', err);
                setError('Failed to load tracking data');
                setLoading(false);
            });

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [barcode, warehouseFilter]);

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.header}>
                    Tracking for Product Code: <span>{barcode}</span>
                </h2>

                <div className={styles.breakdownBox}>
                    <p><strong>Product:</strong> {breakdown.product || '—'}</p>
                    <p><strong>Opening Stock:</strong> {breakdown.stock ?? '—'}</p>
                    <ul className={styles.breakdownList}>
                        <li>Dispatch: {breakdown.dispatch}</li>
                        <li>Damage: {breakdown.damage}</li>
                        <li>Return: {breakdown.return}</li>
                        <li>Recover: {breakdown.recover}</li>
                    </ul>
                    <p className={styles.finalStock}>
                        <strong>📦 Final Stock:</strong>{' '}
                        {breakdown.finalStock !== null ? breakdown.finalStock : '—'}
                    </p>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.logTable}>
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Warehouse</th>
                            <th>Processed By</th>
                            <th>AWB</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className={styles.status}>Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="7" className={styles.status}>{error}</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="7" className={styles.status}>
                                No tracking data found for <strong>{barcode}</strong>
                            </td></tr>
                        ) : (
                            logs.map((log, index) => {
                                const [date, time] = log.timestamp?.includes('T')
                                    ? log.timestamp.split('T')
                                    : log.timestamp.split(' ') || ['', ''];
                                const typeClass = log.type?.trim().toLowerCase();
                                return (
                                    <tr key={index}>
                                        <td>
                                                <span className={`${styles.statusTag} ${styles[typeClass]}`}>
                                                    {log.type}
                                                </span>
                                        </td>
                                        <td>{log.quantity}</td>
                                        <td>{date}</td>
                                        <td>{time?.slice(0, 8)}</td>
                                        <td>{log.warehouse}</td>
                                        <td>{log.processed_by}</td>
                                        <td>{log.awb || '—'}</td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                <button
                    className={styles.closeBtn}
                    onClick={onClose || (() => window.history.back())}
                >
                    Close
                </button>
            </div>
        </div>
    );
}