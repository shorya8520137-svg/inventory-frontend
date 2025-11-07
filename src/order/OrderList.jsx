import React, { useState } from 'react';
import styles from './order.module.css';

export default function OrderList({ onAdd }) {
    const [form, setForm] = useState({
        status: '',
        warehouse: '',
        orderRef: '',
        productName: '',
        variant: '',
        barcodeAwb: '',
        logistics: '',
        parcelType: '',
        paymentMode: '',
        invoiceAmount: '',
        processedBy: ''
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        const allFilled = Object.values(form).every(val => val.trim() !== '');
        if (allFilled) {
            onAdd(form);
            setForm({
                status: '',
                warehouse: '',
                orderRef: '',
                productName: '',
                variant: '',
                barcodeAwb: '',
                logistics: '',
                parcelType: '',
                paymentMode: '',
                invoiceAmount: '',
                processedBy: ''
            });
        }
    };

    return (
        <div className={styles.inputRow}>
            <input placeholder="Status" value={form.status} onChange={e => handleChange('status', e.target.value)} />
            <input placeholder="Warehouse" value={form.warehouse} onChange={e => handleChange('warehouse', e.target.value)} />
            <input placeholder="Order Ref" value={form.orderRef} onChange={e => handleChange('orderRef', e.target.value)} />
            <input placeholder="Product Name" value={form.productName} onChange={e => handleChange('productName', e.target.value)} />
            <input placeholder="Variant" value={form.variant} onChange={e => handleChange('variant', e.target.value)} />
            <input placeholder="Barcode AWB" value={form.barcodeAwb} onChange={e => handleChange('barcodeAwb', e.target.value)} />
            <input placeholder="Logistics" value={form.logistics} onChange={e => handleChange('logistics', e.target.value)} />
            <input placeholder="Parcel Type" value={form.parcelType} onChange={e => handleChange('parcelType', e.target.value)} />
            <input placeholder="Payment Mode" value={form.paymentMode} onChange={e => handleChange('paymentMode', e.target.value)} />
            <input placeholder="Invoice Amount" value={form.invoiceAmount} onChange={e => handleChange('invoiceAmount', e.target.value)} />
            <input placeholder="Processed By" value={form.processedBy} onChange={e => handleChange('processedBy', e.target.value)} />
            <button onClick={handleAdd}>Add</button>
        </div>
    );
}