import React, { useState } from 'react';
import styles from './InventoryList.module.css';
import * as XLSX from 'xlsx';
import ReturnForm from '../returnForm/ReturnForm'; // ✅ Return module
import DamageCard from '../damageForm/DamageCard'; // ✅ Damage module

export default function InventoryList() {
    const [sheetRows, setSheetRows] = useState([]);
    const [warehouse, setWarehouse] = useState('');
    const [isOpen, setIsOpen] = useState(false); // 🔄 Inventory toggle
    const [showReturnForm, setShowReturnForm] = useState(false); // 🔄 Return toggle
    const [showDamageForm, setShowDamageForm] = useState(false); // 🔄 Damage toggle

    const handleSheetUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(sheet);

            const mappedRows = rawRows.map((row) => {
                const keys = Object.keys(row).reduce((acc, key) => {
                    acc[key.toLowerCase().trim()] = row[key];
                    return acc;
                }, {});

                return {
                    name: keys.product?.trim() || '',
                    variant: keys.variant?.trim() || '',
                    code: keys.code?.trim() || '',
                    stock: keys.stock || 0,
                    warehouse: keys.warehouse?.trim() || warehouse,
                    opening: keys.opening || 0,
                    return: keys.return || 0,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0].slice(0, 5)
                };
            });

            console.log('[Frontend] ✅ Parsed sheet rows:', mappedRows);
            setSheetRows(mappedRows);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async () => {
        if (!warehouse || sheetRows.length === 0) {
            console.warn('[Submit] ⚠️ Missing warehouse or empty sheet');
            return;
        }

        for (const row of sheetRows) {
            console.log('[Dispatch] 🔍 Final Payload:', JSON.stringify(row, null, 2));
            try {
                const res = await fetch('/api/inventory/insert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: warehouse, payload: row })
                });
                const result = await res.json();
                console.log(`[Dispatch] ✅ ${warehouse}:`, result);
            } catch (err) {
                console.error(`[Dispatch] ❌ Failed row:`, row, err);
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* 🔹 Inventory Entry Card */}
            <div className={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
                <h2>Inventory Entry</h2>
                <span className={styles.toggleIcon}>{isOpen ? '−' : '+'}</span>
            </div>

            {isOpen && (
                <div className={styles.cardBody}>
                    <div className={styles.inputRow}>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleSheetUpload}
                            className={styles.uploadButton}
                        />
                        <select
                            value={warehouse}
                            onChange={(e) => setWarehouse(e.target.value)}
                            className={styles.uploadButton}
                        >
                            <option value="">Select Inventory</option>
                            <option value="ahmedabad_inventory">Ahmedabad</option>
                            <option value="bangalore_inventory">Bangalore</option>
                            <option value="gurgaon_inventory">Gurgaon</option>
                            <option value="hyderabad_inventory">Hyderabad</option>
                            <option value="mumbai_inventory">Mumbai</option>
                        </select>
                        <button onClick={handleSubmit} className={styles.submitButton}>
                            Submit
                        </button>
                    </div>
                </div>
            )}

            {/* 🔹 Return Entry Card */}
            <div className={styles.cardHeader} onClick={() => setShowReturnForm(!showReturnForm)}>
                <h2>Return Entry</h2>
                <span className={styles.toggleIcon}>{showReturnForm ? '−' : '+'}</span>
            </div>

            {showReturnForm && (
                <div className={styles.cardBody}>
                    <ReturnForm />
                </div>
            )}

            {/* 🔹 Damage / Recovery Entry Card */}
            <div className={styles.cardHeader} onClick={() => setShowDamageForm(!showDamageForm)}>
                <h2>Damage / Recovery Entry</h2>
                <span className={styles.toggleIcon}>{showDamageForm ? '−' : '+'}</span>
            </div>

            {showDamageForm && (
                <div className={styles.cardBody}>
                    <DamageCard />
                </div>
            )}
        </div>
    );
}