import React, { useState, useEffect } from 'react';
import styles from './OrderTrackingPanel.module.css'; // optional scoped styles

export default function TrackingForm() {
    const [awb, setAwb] = useState('');
    const [refId, setRefId] = useState('');
    const [trigger, setTrigger] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleTrack = () => {
        if (!awb.trim() || !refId.trim()) {
            alert('Please enter both AWB and Order ID');
            return;
        }

        setTrigger({ awb, ref_id: refId });
    };

    useEffect(() => {
        if (!trigger) return;

        async function fetchTracking() {
            try {
                const res = await fetch(`/api/track?awb=${trigger.awb}&ref_id=${trigger.ref_id}`);
                if (!res.ok) throw new Error('Fetch failed');
                const result = await res.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Tracking fetch failed:', err);
                setError('Unable to fetch tracking info');
                setData(null);
            }
        }

        fetchTracking();
    }, [trigger]);

    return (
        <div style={{ padding: '1rem', maxWidth: '500px' }}>
            <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="AWB Number"
                style={{ marginBottom: '0.5rem', width: '100%' }}
            />
            <input
                type="text"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="Order ID"
                style={{ marginBottom: '0.75rem', width: '100%' }}
            />
            <button onClick={handleTrack}>🔍 Track Shipment</button>

            {error && <div className={styles.error}>{error}</div>}
            {!error && !data && trigger && <div className={styles.loading}>Loading...</div>}
            {data && (
                <div className={styles.panel} style={{ marginTop: '1rem' }}>
                    <h3>Tracking Result</h3>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}