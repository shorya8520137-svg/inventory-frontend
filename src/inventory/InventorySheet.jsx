import React, { useState, useEffect, useRef } from 'react';
import styles from './inventory.module.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ProductTracker from './ProductTracker'; // ✅ Tracking drilldown

export default function InventorySheet() {
    const today = new Date().toISOString().split('T')[0];

    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [warehouseFilter, setWarehouseFilter] = useState('gurgaon_inventory');
    const [startDateFilter, setStartDateFilter] = useState(today);
    const [activeBarcode, setActiveBarcode] = useState(null);
    const [viewerBarcode, setViewerBarcode] = useState(null);

    const lastHoveredRef = useRef(null);

    const tableMap = [
        { label: 'Gurgaon', value: 'gurgaon_inventory' },
        { label: 'Hyderabad', value: 'hyderabad_inventory' },
        { label: 'Mumbai', value: 'mumbai_inventory' },
        { label: 'Ahmedabad', value: 'ahmedabad_inventory' },
        { label: 'Bangalore', value: 'bangalore_inventory' }
    ];

    // ✅ Default load: full inventory for selected warehouse
    useEffect(() => {
        if (!warehouseFilter) return;

        fetch(`/api/products/all?table=${warehouseFilter}`)
            .then(res => res.json())
            .then(data => {
                console.log('[Inventory] ✅ Full inventory loaded:', data.length);
                setItems(data);
            })
            .catch(err => console.error('[Inventory] ❌ Full load failed:', err));
    }, [warehouseFilter]);

    // ✅ Autocomplete for product search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const trimmedQuery = query.trim();
            if (!trimmedQuery) {
                setSuggestions([]);
                return;
            }

            fetch(`/api/products/search?query=${encodeURIComponent(trimmedQuery)}`)
                .then(res => res.json())
                .then(data => setSuggestions(data))
                .catch(err => console.error('[Search] ❌', err));
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    // ✅ Filtered fetch on Submit
    const handleSubmit = () => {
        if (!warehouseFilter) {
            console.warn('[Inventory] ⚠️ Missing warehouse');
            return;
        }

        const params = new URLSearchParams({ table: warehouseFilter });
        if (startDateFilter) params.append('date', startDateFilter);
        if (query.trim()) params.append('product', query.trim());

        fetch(`/api/products/filter?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                console.log('[Inventory] ✅ Filtered data fetched:', data.length);
                setItems(data);
            })
            .catch(err => console.error('[Inventory] ❌ Filtered fetch failed:', err));
    };

    const handleSelect = (item) => {
        setQuery(item.product_name || '');
        setSuggestions([]);
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Sheet');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'Inventory_Sheet.xlsx');
    };

    const handleHover = (barcode) => {
        if (lastHoveredRef.current !== barcode) {
            console.log('[Hover] Triggered for:', barcode);
            lastHoveredRef.current = barcode;
            setActiveBarcode(barcode);
        }
    };

    const handleViewerOpen = (barcode) => {
        console.log('[Viewer] Triggered for:', barcode);
        setViewerBarcode(barcode);
    };

    return (
        <div className={styles.container}>
            <h2>Inventory</h2>

            <div className={styles.controlBar}>
                <input
                    type="text"
                    placeholder="Search by Product or Barcode"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.searchInput}
                />
                {suggestions.length > 0 && (
                    <ul className={styles.suggestionList}>
                        {suggestions.map((item) => (
                            <li key={item.p_id} onClick={() => handleSelect(item)}>
                                {(item.product_name || 'Unnamed Product')}
                                {item.product_variant && ` (${item.product_variant})`}
                                {item.barcode && ` — ${item.barcode}`}
                            </li>
                        ))}
                    </ul>
                )}

                <select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    className={styles.dropdown}
                >
                    <option value="">Inventory</option>
                    {tableMap.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className={styles.dateInput}
                />
                <button className={styles.submitButton} onClick={handleSubmit}>Submit</button>
                <button className={styles.submitButton} onClick={handleExport}>⬇️ Export Sheet</button>
            </div>

            <div className={styles.tableWrapper}>
                <div className={styles.scrollBox}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Stock</th>
                            <th>Warehouse</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Return</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="6">No data found</td></tr>
                        ) : (
                            items.map((item, index) => {
                                const [datePart, timePart] = item.created_at?.split(' ') || ['', ''];
                                return (
                                    <tr key={index}>
                                        <td>{item.product}</td>
                                        <td
                                            onMouseEnter={() => handleHover(item.code)}
                                            onMouseLeave={() => setActiveBarcode(null)}
                                            onClick={() => handleViewerOpen(item.code)}
                                            style={{ cursor: 'pointer', color: '#0078d4', fontWeight: '600' }}
                                        >
                                            {item.stock}
                                        </td>
                                        <td>{item.warehouse}</td>
                                        <td>{datePart}</td>
                                        <td>{timePart}</td>
                                        <td>{item.return}</td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewerBarcode && (
                <ProductTracker
                    barcodeOverride={viewerBarcode}
                    warehouseFilter={warehouseFilter}
                    onClose={() => setViewerBarcode(null)}
                />
            )}
        </div>
    );
}