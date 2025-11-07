import React, { useState } from 'react';
import styles from './returnForm.module.css';

export default function ReturnForm() {
    const [formData, setFormData] = useState({
        orderRef: '',
        awb: '',
        productType: '',
        inventory: '',
        quantity: ''
    });

    const [suggestions, setSuggestions] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSearch = async (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, productType: value }));

        if (value.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const query = value.trim().toLowerCase();
            const res = await fetch(`/api/products/search?query=${query}`);
            const data = await res.json();

            console.log('[ReturnForm] 🟩 Raw response:', data);

            const rawList = Array.isArray(data)
                ? data
                : data.suggestions || data.products || data.results || [];

            const mapped = rawList.map(item =>
                `${item.product_name} ${item.product_variant} – ${item.barcode}`
            );

            console.log('[ReturnForm] 🟦 Mapped suggestions:', mapped);
            setSuggestions(mapped);
        } catch (err) {
            console.error('[ProductSearch] ❌ Failed to fetch suggestions:', err);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (selected) => {
        setFormData(prev => ({ ...prev, productType: selected }));
        setSuggestions([]);
    };

    const handleSubmit = async () => {
        console.log('[ReturnForm] ✅ Payload:', formData);

        try {
            const res = await fetch('/api/returns/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            console.log('[ReturnForm] 🟩 Server response:', result);

            if (res.ok) {
                alert('Return entry submitted successfully');
                setFormData({
                    orderRef: '',
                    awb: '',
                    productType: '',
                    inventory: '',
                    quantity: ''
                });
                setSuggestions([]);
            } else {
                alert(`Error: ${result.error || 'Submission failed'}`);
            }
        } catch (err) {
            console.error('[ReturnForm] ❌ Submit failed:', err);
            alert('Submission failed. Check console for details.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.cardHeader}>
                <h2>Return Form</h2>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.inputRow}>
                    <input
                        type="text"
                        name="orderRef"
                        placeholder="Order Reference Number"
                        value={formData.orderRef}
                        onChange={handleChange}
                        className={styles.inputBox}
                    />
                    <input
                        type="text"
                        name="awb"
                        placeholder="AWB"
                        value={formData.awb}
                        onChange={handleChange}
                        className={styles.inputBox}
                    />
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            name="productType"
                            placeholder="Product Type"
                            value={formData.productType}
                            onChange={handleProductSearch}
                            className={styles.inputBox}
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className={styles.suggestionBox}>
                                {suggestions.map((item, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(item)}
                                        className={styles.suggestionItem}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <select
                        name="inventory"
                        value={formData.inventory}
                        onChange={handleChange}
                        className={styles.inputBox}
                    >
                        <option value="">Select Inventory</option>
                        <option value="gurgaon">Gurgaon</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="ahmedabad">Ahmedabad</option>
                        <option value="bangalore">Bangalore</option>
                    </select>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className={styles.inputBox}
                    />
                </div>
                <button className={styles.submitButton} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    );
}