import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './dispatchForm.module.css';

// ✅ Use environment variable for backend API base
const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
console.log('[Dispatch] Using API Base URL:', API_BASE_URL);

export default function DispatchForm() {
    const [products, setProducts] = useState([{ name: '', qty: 1, valid: true, suggestions: [] }]);
    const [warehouses, setWarehouses] = useState([]);
    const [logistics, setLogistics] = useState([]);
    const [executives, setExecutives] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedLogistics, setSelectedLogistics] = useState('');
    const [selectedExecutive, setSelectedExecutive] = useState('');
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');

    const [orderRef, setOrderRef] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [awbNumber, setAwbNumber] = useState('');
    const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
    const [weight, setWeight] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [remarks, setRemarks] = useState('');

    // ✅ Fetch dropdown data on mount
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [wareRes, logiRes, execRes, payRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/dispatch/warehouses`),
                    axios.get(`${API_BASE_URL}/api/dispatch/logistics`),
                    axios.get(`${API_BASE_URL}/api/dispatch/processed-persons`),
                    axios.get(`${API_BASE_URL}/api/dispatch/payment-modes`)
                ]);

                setWarehouses(wareRes.data || []);
                setLogistics(logiRes.data || []);
                setExecutives(execRes.data || []);
                setPaymentModes(payRes.data || []);
            } catch (err) {
                console.error('[Dispatch] ❌ Failed to load dropdowns:', err.message);
            }
        };

        fetchDropdowns();
    }, []);

    // ✅ Add & remove products
    const addProduct = () => {
        setProducts([...products, { name: '', qty: 1, valid: true, suggestions: [] }]);
    };

    const removeProduct = (index) => {
        const updated = [...products];
        updated.splice(index, 1);
        setProducts(updated);
    };

    // ✅ Handle product input + suggestions
    const handleProductInput = (index, value) => {
        const updated = [...products];
        updated[index].name = value;
        updated[index].valid = true;
        setProducts(updated);

        if (value.trim() === '') return;

        axios
            .get(`${API_BASE_URL}/api/dispatch/search-products?query=${encodeURIComponent(value)}`)
            .then(res => {
                updated[index].suggestions = res.data || [];
                setProducts([...updated]);
            })
            .catch(err => console.error('[Dispatch] Product search failed:', err.message));
    };

    // ✅ Validate product name
    const validateProductOnBlur = (index) => {
        const input = products[index].name.trim().toLowerCase();
        const suggestions = products[index].suggestions || [];

        const match = suggestions.find(p => {
            const fullLabel = `${p.product_name} | ${p.product_variant} | ${p.barcode}`.trim().toLowerCase();
            return fullLabel === input;
        });

        const updated = [...products];
        updated[index].valid = !!match || input.length > 5;
        setProducts(updated);
    };

    // ✅ Form submission
    const handleSubmit = async () => {
        console.log('[Dispatch] handleSubmit triggered');

        const invalidProduct = products.find(p => !p.valid || !p.name.trim() || !p.qty);
        if (invalidProduct) {
            console.warn('[Dispatch] Invalid product detected');
            const updated = products.map(p => ({
                ...p,
                valid: p.name.trim().length > 5
            }));
            setProducts(updated);
            return;
        }

        const payload = {
            selectedWarehouse,
            selectedLogistics,
            selectedExecutive,
            selectedPaymentMode,
            orderRef,
            customerName,
            awbNumber,
            dimensions,
            weight,
            invoiceAmount,
            remarks,
            products
        };

        console.log('[Dispatch] Final payload:', payload);
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/dispatch/push-to-db`, payload);
            console.log('[Dispatch] ✅ Backend response:', res.data);
            alert('✅ Dispatch entry submitted successfully');

            // 🔁 Sync status
            await axios.post(`${API_BASE_URL}/api/dispatch/update-status`, {
                awb: awbNumber,
                orderRef: orderRef,
                warehouse: selectedWarehouse
            });

            console.log('[Dispatch] ✅ Status sync successful');
        } catch (err) {
            console.error('[Dispatch] ❌ Error:', err.message);
            alert('❌ Failed to submit dispatch or sync status');
        } finally {
            setLoading(false);
        }
    };

    // 🎨 UI
    return (
        <div className={styles.formContainer}>
            <h2>Dispatch Entry Form</h2>

            <div className={styles.row}>
                <label>Warehouse</label>
                <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w, i) => (
                        <option key={i} value={w}>{w}</option>
                    ))}
                </select>
            </div>

            <div className={styles.row}>
                <label>Order Reference Number</label>
                <input type="text" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} />
            </div>

            <div className={styles.row}>
                <label>Customer Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>

            {products.map((product, index) => (
                <div key={index} className={styles.productBlock}>
                    <div className={styles.row}>
                        <label>Product Name</label>
                        <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleProductInput(index, e.target.value)}
                            onBlur={() => validateProductOnBlur(index)}
                            className={!product.valid ? styles.invalidInput : ''}
                            list={`product-suggestions-${index}`}
                        />
                        <datalist id={`product-suggestions-${index}`}>
                            {(product.suggestions || []).map(p => (
                                <option
                                    key={p.p_id}
                                    value={`${p.product_name} | ${p.product_variant} | ${p.barcode}`}
                                />
                            ))}
                        </datalist>
                    </div>

                    <div className={styles.row}>
                        <label>Qty #</label>
                        <input
                            type="number"
                            value={product.qty}
                            onChange={(e) => {
                                const updated = [...products];
                                updated[index].qty = e.target.value;
                                setProducts(updated);
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeProduct(index)}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <button type="button" className={styles.addBtn} onClick={addProduct}>
                + Add Product
            </button>

            <div className={styles.row}>
                <label>AWB Number</label>
                <input type="text" value={awbNumber} onChange={(e) => setAwbNumber(e.target.value)} />
            </div>

            <div className={styles.row}>
                <label>Logistics Provider</label>
                <select value={selectedLogistics} onChange={(e) => setSelectedLogistics(e.target.value)}>
                    <option value="">Select Logistics</option>
                    {logistics.map((l, i) => (
                        <option key={i} value={l}>{l}</option>
                    ))}
                </select>
            </div>

            <div className={styles.rowGroup}>
                <label>Dimensions (cm)</label>
                <div className={styles.dimensions}>
                    <input
                        type="number"
                        placeholder="Length"
                        value={dimensions.length}
                        onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Width"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Height"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.row}>
                <label>Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>

            <div className={styles.row}>
                <label>Payment Mode</label>
                <select value={selectedPaymentMode} onChange={(e) => setSelectedPaymentMode(e.target.value)}>
                    <option value="">Select Payment Mode</option>
                    {paymentModes.map((pm, i) => (
                        <option key={i} value={pm}>{pm}</option>
                    ))}
                </select>
            </div>

            <div className={styles.row}>
                <label>Invoice Amount</label>
                <input type="number" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
            </div>

            <div className={styles.row}>
                <label>Processed By</label>
                <select
                    value={selectedExecutive}
                    onChange={(e) => setSelectedExecutive(e.target.value)}
                    className={!selectedExecutive ? styles.invalidInput : ''}
                >
                    <option value="">Select Executive</option>
                    {executives.map((e, i) => (
                        <option key={i} value={e}>{e}</option>
                    ))}
                </select>
            </div>

            <div className={styles.row}>
                <label>Remarks</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>

            <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Dispatch'}
            </button>
        </div>
    );
}
