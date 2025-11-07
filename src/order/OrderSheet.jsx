import React, { useState, useEffect } from 'react';
import styles from './order.module.css';

export default function OrderSheet() {
    const [filters, setFilters] = useState({
        status: [],
        warehouse: [],
        orderRef: '',
        productName: '',
        variant: '',
        barcodeAwb: '',
        logistics: [],
        parcelType: '',
        paymentMode: [],
        processedBy: []
    });

    const [warehouses] = useState([
        'Mumbai Warehouse',
        'Hyderabad Warehouse',
        'Ahmedabad Warehouse',
        'Bangalore Warehouse',
        'Gurgaon Warehouse'
    ]);
    const [statuses] = useState(['Pending', 'Return', 'Intransit', 'Confirm', 'Delivery']);
    const [logistics, setLogistics] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [processedPersons, setProcessedPersons] = useState([]);
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    useEffect(() => {
        Promise.all([
            fetch('/api/logistics').then(res => res.json()).catch(() => []),
            fetch('/api/payment-mode').then(res => res.json()).catch(() => []),
            fetch('/api/processed-persons').then(res => res.json()).catch(() => [])
        ]).then(([logisticsData, paymentData, processedData]) => {
            setLogistics(logisticsData);
            setPaymentModes(paymentData);
            setProcessedPersons(processedData);
        });

        applyFilters();
    }, []);

    const toggleDropdown = (field) => {
        setDropdownOpen(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const toggleCheckbox = (field, value) => {
        setFilters(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleProductSearch = (value) => {
        handleFilterChange('productName', value);
        if (value.trim().length > 1) {
            fetch(`/api/search-products?query=${encodeURIComponent(value)}`)
                .then(res => res.json())
                .then(setProductSuggestions)
                .catch(() => setProductSuggestions([]));
        } else {
            setProductSuggestions([]);
        }
    };

    const applyFilters = () => {
        const warehouseMap = {
            'Mumbai Warehouse': 'Mumbai_Warehouse',
            'Hyderabad Warehouse': 'Hyderabad_Warehouse',
            'Ahmedabad Warehouse': 'Ahmedabad_Warehouse',
            'Bangalore Warehouse': 'Bangalore_Warehouse',
            'Gurgaon Warehouse': 'Gurgaon_Warehouse'
        };

        const payload = {
            ...filters,
            warehouse: filters.warehouse.map(w => warehouseMap[w] || w),
            paymentMode: filters.paymentMode[0] || '',
            processedBy: filters.processedBy[0] || ''
        };

        fetch('/api/ordersheet-filter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setOrders(data) : setOrders([]))
            .catch(() => setOrders([]));
    };

    const exportCSV = () => {
        const headers = [
            'Order Ref', 'ID', 'Status', 'Warehouse', 'Product Name', 'Variant',
            'AWB Number', 'Barcode', 'Logistics', 'Parcel Type',
            'Payment Mode', 'Invoice Amount', 'Processed By'
        ];
        const rows = orders.map(order => [
            order.order_ref, order.id, order.status, order.warehouse, order.product_name,
            order.variant, order.awb, order.barcode, order.logistics,
            `L:${order.length || '--'} | B:${order.width || '--'} | H:${order.height || '--'}`,
            order.payment_mode, order.invoice_amount, order.processed_by
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const paginatedOrders = orders.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderDropdown = (label, field, options) => {
        const selected = filters[field];
        const preview = selected.length > 0 ? selected.join(', ') : `Select ${label}`;
        return (
            <div className={styles.dropdownWrapper}>
                <button
                    type="button"
                    className={`${styles.dropdownButton} ${dropdownOpen[field] ? styles.activeDropdown : ''}`}
                    onClick={() => toggleDropdown(field)}
                >
                    {preview}
                </button>
                {dropdownOpen[field] && (
                    <div className={styles.dropdownMenu}>
                        {options.map((opt, index) => (
                            <label key={index}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt)}
                                    onChange={() => toggleCheckbox(field, opt)}
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2>Order Sheet</h2>

            <div className={styles.filterContainer}>
                <div className={styles.filterRow}>
                    {renderDropdown('Status', 'status', statuses)}
                    {renderDropdown('Warehouse', 'warehouse', warehouses)}
                    <input
                        placeholder="Order Ref"
                        value={filters.orderRef}
                        onChange={e => handleFilterChange('orderRef', e.target.value)}
                    />
                    <input
                        placeholder="Product Name"
                        value={filters.productName}
                        onChange={e => handleProductSearch(e.target.value)}
                        list="productSuggestions"
                    />
                    <datalist id="productSuggestions">
                        {productSuggestions.map((p, i) => (
                            <option key={i} value={p.product_name} />
                        ))}
                    </datalist>
                    <input
                        placeholder="Variant"
                        value={filters.variant}
                        onChange={e => handleFilterChange('variant', e.target.value)}
                    />
                </div>

                <div className={styles.filterRow}>
                    <input
                        placeholder="AWB Number"
                        value={filters.barcodeAwb}
                        onChange={e => handleFilterChange('barcodeAwb', e.target.value)}
                    />
                    {renderDropdown('Logistics', 'logistics', logistics)}
                    <input
                        placeholder="Parcel Type"
                        value={filters.parcelType}
                        onChange={e => handleFilterChange('parcelType', e.target.value)}
                    />
                    {renderDropdown('Payment Mode', 'paymentMode', paymentModes)}
                    {renderDropdown('Processed By', 'processedBy', processedPersons)}
                    <button onClick={applyFilters} className={styles.submitButton}>Apply Filters</button>
                </div>
            </div>

            <button onClick={exportCSV} className={styles.exportButton}>Export CSV</button>

            <div className={styles.tableScrollWrapper}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Order Ref</th><th>ID</th><th>Status</th><th>Warehouse</th>
                            <th>Product Name</th><th>Variant</th><th>AWB Number</th>
                            <th>Barcode</th><th>Logistics</th><th>Parcel Type</th>
                            <th>Payment Mode</th><th>Invoice Amount</th><th>Processed By</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedOrders.length ? (
                            paginatedOrders.map((o, i) => (
                                <tr key={i}>
                                    <td><strong>{o.order_ref}</strong></td>
                                    <td>{o.id}</td>
                                    <td>{o.status}</td>
                                    <td>{o.warehouse}</td>
                                    <td>{o.product_name}</td>
                                    <td>{o.variant}</td>
                                    <td>{o.awb}</td>
                                    <td>{o.barcode || '--'}</td>
                                    <td>{o.logistics}</td>
                                    <td style={{ whiteSpace: 'pre-line' }}>
                                        {o.length || o.width || o.height
                                            ? `Length: ${o.length || '--'}\nBreadth: ${o.width || '--'}\nHeight: ${o.height || '--'}`
                                            : '--'}
                                    </td>
                                    <td>{o.payment_mode || '--'}</td>
                                    <td>{o.invoice_amount || '--'}</td>
                                    <td>{o.processed_by || '--'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="13">No orders found</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.pagination}>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                >
                    Prev
                </button>
                <span>Page {currentPage}</span>
                <button
                    disabled={currentPage * rowsPerPage >= orders.length}
                    onClick={() => setCurrentPage(p => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
