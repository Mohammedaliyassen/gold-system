import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PriceCalculator from './components/PriceCalculator';
import InventoryPage from './components/InventoryPage';
import ScrapManagementPage from './components/ScrapManagementPage';
import CustomerDebtsPage from './components/CustomerDebtsPage'; // استيراد المكون الجديد
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage'; // جديد
import Header from './components/Header';
import './App.css';

// دالة مساعدة لقراءة البيانات من LocalStorage
const getInitialState = (key, defaultValue) => {
    try {
        const savedItem = localStorage.getItem(key);
        return savedItem ? JSON.parse(savedItem) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

const App = () => {
    const [salesEntries, setSalesEntries] = useState(() => getInitialState('salesEntries', []).map(entry => ({
        ...entry,
        customerName: entry.customerName || '', // التأكد من وجود اسم العميل
        customerPhone: entry.customerPhone || '', // التأكد من وجود هاتف العميل
        amountPaid: entry.amountPaid === undefined ? entry.finalPrice : entry.amountPaid // التوافق مع البيانات القديمة
    })));





    const [purchaseEntries, setPurchaseEntries] = useState(() => getInitialState('purchaseEntries', []).map(entry => ({
        ...entry,
        amountPaid: entry.amountPaid === undefined ? entry.cost : entry.amountPaid, // التوافق مع البيانات القديمة
        supplierName: entry.supplierName || '' // التأكد من وجود اسم المورد
    })));
    const [expenseEntries, setExpenseEntries] = useState(() => getInitialState('expenseEntries', []));
    const [pricing, setPricing] = useState(() => getInitialState('pricing', {
        goldPricePerGram: 0,
        manufacturingCostPerGram: 0,
        vatPercentage: 0,
    }));

    // استخدام الدالة المساعدة لجلب البيانات عند بدء التشغيل
    const [merchants, setMerchants] = useState(() => getInitialState('merchants', []));
    const [scrapTransactions, setScrapTransactions] = useState(() => getInitialState('scrapTransactions', []));
    // تعديل: فصل رصيد الذهب الافتتاحي
    const [openingNewGoldBalance, setOpeningNewGoldBalance] = useState(() => getInitialState('openingNewGoldBalance', ''));
    const [openingOldGoldBalance, setOpeningOldGoldBalance] = useState(() => getInitialState('openingOldGoldBalance', ''));

    const [purchasedUsedGold, setPurchasedUsedGold] = useState(() => getInitialState('purchasedUsedGold', ''));
    const [financialDebts, setFinancialDebts] = useState(() => getInitialState('financialDebts', []));

    // State for opening cash balance in inventory
    const [openingCashBalance, setOpeningCashBalance] = useState(() => getInitialState('openingCashBalance', ''));


    // useEffect لحفظ بيانات التجار عند تغيرها
    useEffect(() => {
        localStorage.setItem('merchants', JSON.stringify(merchants));
    }, [merchants]);

    // useEffect لحفظ تعاملات الكسر عند تغيرها
    useEffect(() => {
        localStorage.setItem('scrapTransactions', JSON.stringify(scrapTransactions));
    }, [scrapTransactions]);

    // useEffects لحفظ الإدخالات اليومية
    useEffect(() => {
        localStorage.setItem('salesEntries', JSON.stringify(salesEntries));
    }, [salesEntries]);

    useEffect(() => {
        localStorage.setItem('purchaseEntries', JSON.stringify(purchaseEntries));
    }, [purchaseEntries]);

    useEffect(() => {
        localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
    }, [expenseEntries]);

    // useEffect لحفظ رصيد الذهب الافتتاحي
    // تعديل: حفظ الأرصدة الجديدة
    useEffect(() => {
        localStorage.setItem('openingNewGoldBalance', JSON.stringify(openingNewGoldBalance));
    }, [openingNewGoldBalance]);
    useEffect(() => {
        localStorage.setItem('openingOldGoldBalance', JSON.stringify(openingOldGoldBalance));
    }, [openingOldGoldBalance]);

    // useEffect لحفظ الذهب المستعمل المشترى
    useEffect(() => {
        localStorage.setItem('purchasedUsedGold', JSON.stringify(purchasedUsedGold));
    }, [purchasedUsedGold]);

    // useEffect لحفظ الديون المالية
    useEffect(() => {
        localStorage.setItem('financialDebts', JSON.stringify(financialDebts));
    }, [financialDebts]);

    // useEffect لحفظ أسعار الذهب اليومية
    useEffect(() => {
        localStorage.setItem('pricing', JSON.stringify(pricing));
    }, [pricing]);

    useEffect(() => {
        localStorage.setItem('openingCashBalance', JSON.stringify(openingCashBalance));
    }, [openingCashBalance]);


    const totals = useMemo(() => {
        const sumByKey = (records, key) =>
            records.reduce((total, record) => total + parseFloat(record[key] || 0), 0);

        return {
            salesTotal: sumByKey(salesEntries, "finalPrice"),
            purchaseTotal: sumByKey(purchaseEntries, "cost"),
            expenseTotal: sumByKey(expenseEntries, "amount"),
        };
    }, [salesEntries, purchaseEntries, expenseEntries]);

    return (
        <Router>
            <div className="app">
                <Header />
                <main className="app-main">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <>
                                    <PriceCalculator
                                        pricing={pricing}
                                        onPricingChange={setPricing}
                                        onSalesEntriesChange={setSalesEntries}
                                    />
                                    <Dashboard
                                        totals={totals}
                                        salesEntries={salesEntries}
                                        purchaseEntries={purchaseEntries}
                                        expenseEntries={expenseEntries}
                                        onSalesEntriesChange={setSalesEntries}
                                        onPurchaseEntriesChange={
                                            setPurchaseEntries
                                        }
                                        onExpenseEntriesChange={
                                            setExpenseEntries
                                        }
                                    />
                                </>
                            }
                        />
                        <Route
                            path="/inventory"
                            element={
                                <InventoryPage
                                    totals={totals}
                                    salesEntries={salesEntries}
                                    purchaseEntries={purchaseEntries}
                                    expenseEntries={expenseEntries}
                                    openingNewGoldBalance={openingNewGoldBalance}
                                    onOpeningNewGoldBalanceChange={setOpeningNewGoldBalance}
                                    openingOldGoldBalance={openingOldGoldBalance}
                                    onOpeningOldGoldBalanceChange={setOpeningOldGoldBalance}
                                    purchasedUsedGold={purchasedUsedGold}
                                    onPurchasedUsedGoldChange={setPurchasedUsedGold}
                                    scrapTransactions={scrapTransactions}
                                    merchants={merchants}
                                    financialDebts={financialDebts}
                                    openingCashBalance={openingCashBalance}
                                    onOpeningCashBalanceChange={setOpeningCashBalance}
                                />
                            }
                        />
                        <Route
                            path="/debts"
                            element={
                                <CustomerDebtsPage
                                    salesEntries={salesEntries}
                                    onSalesEntriesChange={setSalesEntries}
                                    purchaseEntries={purchaseEntries}
                                    financialDebts={financialDebts}
                                    onFinancialDebtsChange={setFinancialDebts}
                                />
                            }
                        />
                        <Route
                            path="/scrap"
                            element={<ScrapManagementPage merchants={merchants} onMerchantsChange={setMerchants} scrapTransactions={scrapTransactions} onScrapTransactionsChange={setScrapTransactions} />}
                        />
                        <Route
                            path="/reports"
                            element={
                                <ReportsPage
                                    salesEntries={salesEntries}
                                    purchaseEntries={purchaseEntries}
                                    expenseEntries={expenseEntries} // التأكد من تمرير المصروفات
                                    scrapTransactions={scrapTransactions} // التأكد من تمرير تعاملات الكسر
                                    financialDebts={financialDebts} // التأكد من تمرير الديون المالية
                                    merchants={merchants} // التأكد من تمرير التجار
                                />
                            }
                        />
                        <Route
                            path="/settings"
                            element={<SettingsPage />}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
