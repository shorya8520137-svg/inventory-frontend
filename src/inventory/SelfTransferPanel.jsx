import React, { useState } from 'react';
import styles from './SelfTransferPanel.module.css';

export default function SelfTransferPanel() {
    const [hostWarehouse, setHostWarehouse] = useState('');
    const [receiverWarehouse, setReceiverWarehouse] = useState('');
    const [product, setProduct] = useState('');
    const [stock, setStock] = useState('');
    const [productList, setProductList] = useState([]);
    const [entries, setEntries] = useState([]);

    const handleAddProduct = () => {
        if (product.trim() && stock) {
            setProductList((prev) => [...prev, { product, stock: parseInt(stock) }]);
            setProduct('');
            setStock('');
        }
    };

    const handleTransfer = () => {
        if (hostWarehouse.trim() && receiverWarehouse.trim() && productList.length > 0) {
            const newEntry = {
                hostWarehouse,
                receiverWarehouse,
                products: productList
            };
            setEntries((prev) => [...prev, newEntry]);
            setHostWarehouse('');
            setReceiverWarehouse('');
            setProductList([]);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Self Transfer Warehouse</h2>

            <div className={styles.inputRow}>
                <input
                    type="text"
                    placeholder="Host Warehouse"
                    value={hostWarehouse}
                    onChange={(e) => setHostWarehouse(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Receiver Warehouse"
                    value={receiverWarehouse}
                    onChange={(e) => setReceiverWarehouse(e.target.value)}
                />
            </div>

            <div className={styles.inputRow}>
                <input
                    type="text"
                    placeholder="Product"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Stock"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                />
                <button onClick={handleAddProduct}>Add Product</button>
            </div>

            {productList.length > 0 && (
                <div className={styles.productList}>
                    <h4>Products to Transfer:</h4>
                    <ul>
                        {productList.map((item, index) => (
                            <li key={index}>
                                {item.product} — {item.stock}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={handleTransfer} className={styles.transferButton}>
                Transfer
            </button>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Host Warehouse</th>
                    <th>Receiver Warehouse</th>
                    <th>Products</th>
                </tr>
                </thead>
                <tbody>
                {entries.map((entry, index) => (
                    <tr key={index}>
                        <td>{entry.hostWarehouse}</td>
                        <td>{entry.receiverWarehouse}</td>
                        <td>
                            <ul>
                                {entry.products.map((p, i) => (
                                    <li key={i}>
                                        {p.product} — {p.stock}
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}