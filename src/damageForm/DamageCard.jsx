import React, { useState } from 'react';
import styles from './DamageCard.module.css';

export default function DamageCard() {
    const [formData, setFormData] = useState({
        productType: '',
        barcode: '', // This maps to `code` in backend
        inventory: '',
        actionType: ''
    });

    const [suggestions, setSuggestions] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSearch = async (e) => {
        const value = e.target.value;
        const normalized = value.trim().replace(/\u200B/g, '').toLowerCase();

        setFormData(prev => ({ ...prev, productType: value }));

        if (normalized.length < 2) {
            console.log('[DamageCard] 🟨 Input too short or blank, clearing suggestions');
            setSuggestions([]);
            return;
        }

        try {
            console.log('[DamageCard] 🔍 Fetching suggestions for:', normalized);
            const res = await fetch(`/api/products/search?query=${normalized}`);
            const data = await res.json();

            console.log('[DamageCard] 🟩 Raw response:', data);

            const rawList = Array.isArray(data)
                ? data
                : data.suggestions || data.products || data.results || [];

            const mapped = rawList.map(item =>
                `${item.product_name.trim()} ${item.product_variant.trim()} – ${item.barcode.trim()}`
            );

            console.log('[DamageCard] 🟦 Mapped suggestions:', mapped);
            setSuggestions(mapped);
        } catch (err) {
            console.error('[DamageCard] ❌ Failed to fetch suggestions:', err);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (selected) => {
        const [productPart, barcodePart] = selected.split('–');
        const productType = productPart?.trim();
        const barcode = barcodePart?.trim(); // This becomes `code` in backend

        setFormData(prev => ({
            ...prev,
            productType,
            barcode
        }));

        setSuggestions([]);
        console.log('[DamageCard] 🧠 Selected:', { productType, barcode });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[DamageCard] ✅ Payload:', formData);

        try {
            const res = await fetch('http://localhost:5000/api/damage/damage-entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const contentType = res.headers.get('content-type');
            if (!res.ok || !contentType?.includes('application/json')) {
                const fallback = await res.text();
                console.error('[DamageCard] ❌ Server returned non-JSON:', fallback);
                alert('Server error. Check console for details.');
                return;
            }

            const result = await res.json();
            console.log('[DamageCard] 🟩 Server response:', result);

            alert('Damage entry submitted successfully');
            setFormData({
                productType: '',
                barcode: '',
                inventory: '',
                actionType: ''
            });
            setSuggestions([]);
        } catch (err) {
            console.error('[DamageCard] ❌ Submit failed:', err);
            alert('Submission failed. Check console for details.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.cardHeader}>
                <h2>Damage / Recovery Entry</h2>
            </div>

            <form className={styles.cardBody} onSubmit={handleSubmit}>
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
                    required
                >
                    <option value="">Select Inventory</option>
                    <option value="gurgaon">Gurgaon</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="ahmedabad">Ahmedabad</option>
                    <option value="bangalore">Bangalore</option>
                </select>

                <select
                    name="actionType"
                    value={formData.actionType}
                    onChange={handleChange}
                    className={styles.inputBox}
                    required
                >
                    <option value="">Select Action</option>
                    <option value="damage">Damage</option>
                    <option value="recover">Recover</option>
                </select>

                <button type="submit" className={styles.submitButton}>
                    Submit
                </button>
            </form>
        </div>
    );
}