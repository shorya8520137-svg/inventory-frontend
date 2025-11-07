import React, { useState } from 'react';
import DispatchForm from './dispatch-form/DispatchForm';
import InventoryList from './inventory/InventoryList';
import InventorySheet from './inventory/InventorySheet';
import SelfTransferPanel from './inventory/SelfTransferPanel';
import OrderSheet from './order/OrderSheet';
import AnalyticsPanel from './analytics/AnalyticsPanel';
import OrderProcessStatusPanel from './order-process-status/OrderProcessStatusPanel';
import TrackingForm from './order-tracking/OrderTrackingPanel'; // ✅ Use modular form
import styles from './App.module.css';

export default function App() {
    const [activeTab, setActiveTab] = useState('dispatch');
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);

    return (
        <div className={styles.appContainer}>
            <aside className={styles.sidebar}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'dispatch' ? styles.active : ''}`}
                    onClick={() => setActiveTab('dispatch')}
                >
                    🚚 Dispatch Form
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'order' ? styles.active : ''}`}
                    onClick={() => setActiveTab('order')}
                >
                    📦 Order
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'inventory' ? styles.active : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    📦 Inventory
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'selfTransfer' ? styles.active : ''}`}
                    onClick={() => setActiveTab('selfTransfer')}
                >
                    🔄 Self Transfer
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'analytics' ? styles.active : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📊 Analytics
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'orderProcessStatus' ? styles.active : ''}`}
                    onClick={() => setActiveTab('orderProcessStatus')}
                >
                    📍Order Process
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'orderTracking' ? styles.active : ''}`}
                    onClick={() => setActiveTab('orderTracking')}
                >
                    📦 Order Tracking
                </button>
            </aside>

            <main className={styles.mainContent}>
                {activeTab === 'dispatch' && <DispatchForm />}

                {activeTab === 'order' && (
                    <OrderSheet orders={orders} />
                )}

                {activeTab === 'inventory' && (
                    <>
                        <InventoryList
                            onAdd={(newItem) => setItems((prev) => [...prev, newItem])}
                        />
                        <InventorySheet items={items} />
                    </>
                )}

                {activeTab === 'selfTransfer' && (
                    <SelfTransferPanel />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsPanel items={items} orders={orders} />
                )}

                {activeTab === 'orderProcessStatus' && (
                    <OrderProcessStatusPanel />
                )}

                {activeTab === 'orderTracking' && (
                    <TrackingForm /> // ✅ Modular form injected here
                )}
            </main>
        </div>
    );
}