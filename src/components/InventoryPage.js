import React, { useMemo } from "react";
import './InventoryPage.css';
import { exportToExcel } from "./exportToExcel";

const InventoryPage = ({
    totals,
    salesEntries,
    purchaseEntries,
    expenseEntries,
    openingNewGoldBalance,
    onOpeningNewGoldBalanceChange,
    openingOldGoldBalance,
    onOpeningOldGoldBalanceChange,
    purchasedUsedGold,
    onPurchasedUsedGoldChange,
    scrapTransactions,
    merchants,
    financialDebts,
    openingCashBalance,
    onOpeningCashBalanceChange
}) => {
    const summary = useMemo(() => {
        const totalSalesWeight = salesEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.weight || 0),
            0
        );
        const totalPurchaseWeight = purchaseEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.weight || 0),
            0
        );

        // --- Cash Flow Calculation ---
        const totalCashIn = salesEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.amountPaid || 0),
            0
        );
        const totalCashOutPurchases = purchaseEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.amountPaid || 0),
            0
        );
        const totalCashOutExpenses = expenseEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.amount || 0),
            0
        );

        // Include financial debts in cash flow
        const totalCashInFromNewDebts = financialDebts.reduce(
            (sum, debt) => sum + parseFloat(debt.initialAmount || 0),
            0
        );
        const totalCashOutForDebtPayments = financialDebts
            .flatMap(debt => debt.payments)
            .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        const finalTotalCashIn = totalCashIn + totalCashInFromNewDebts;
        const finalTotalCashOut = totalCashOutPurchases + totalCashOutExpenses + totalCashOutForDebtPayments;
        const netCashFlow = finalTotalCashIn - finalTotalCashOut;
        const closingCashBalance = parseFloat(openingCashBalance || 0) + netCashFlow;

        // Calculate gold movement from scrap transactions
        const totalGoldDeliveredToMerchant = scrapTransactions
            .filter(t => t.type === 'تسليم')
            .reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);

        const totalGoldReceivedFromMerchant = scrapTransactions
            .filter(t => t.type === 'استلام')
            .reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);

        // --- Gold Balance Calculation ---
        const openingNewGold = parseFloat(openingNewGoldBalance || 0);
        const openingOldGold = parseFloat(openingOldGoldBalance || 0);
        const purchasedScrap = parseFloat(purchasedUsedGold || 0);

        const endingNewGoldBalance = openingNewGold + totalPurchaseWeight - totalSalesWeight;
        const endingOldGoldBalance = (openingOldGold + purchasedScrap + totalGoldReceivedFromMerchant) - totalGoldDeliveredToMerchant;
        const endingTotalGoldBalance = endingNewGoldBalance + endingOldGoldBalance;

        return {
            totalBilledSales: totals.salesTotal,
            monthlySalesWeight: totalSalesWeight,
            totalBilledPurchases: totals.purchaseTotal,
            monthlyPurchasesWeight: totalPurchaseWeight,
            monthlyExpenses: totals.expenseTotal,
            endingTotalGoldBalance,
            endingNewGoldBalance,
            endingOldGoldBalance,
            netCashFlow,
            closingCashBalance,
            totalCashIn: finalTotalCashIn,
            totalCashOut: finalTotalCashOut,
            totalGoldDeliveredToMerchant,
            totalGoldReceivedFromMerchant,
            totalCashInFromNewDebts,
            totalCashOutForDebtPayments,
        };
    }, [totals, salesEntries, purchaseEntries, expenseEntries, openingNewGoldBalance, openingOldGoldBalance, purchasedUsedGold, scrapTransactions, financialDebts, openingCashBalance]);

    const handleExport = () => {
        const dataToExport = [
            { 'البيان': 'إجمالي فواتير المبيعات (جنيه)', 'القيمة': summary.totalBilledSales.toFixed(2) },
            { 'البيان': 'إجمالي وزن المبيعات (جرام)', 'القيمة': summary.monthlySalesWeight.toFixed(2) },
            { 'البيان': 'إجمالي فواتير المشتريات (جنيه)', 'القيمة': summary.totalBilledPurchases.toFixed(2) },
            { 'البيان': 'إجمالي وزن المشتريات (جرام)', 'القيمة': summary.monthlyPurchasesWeight.toFixed(2) },
            { 'البيان': 'إجمالي المصروفات (جنيه)', 'القيمة': summary.monthlyExpenses.toFixed(2) },
            { 'البيان': 'الرصيد النقدي الافتتاحي (جنيه)', 'القيمة': parseFloat(openingCashBalance || 0).toFixed(2) },
            { 'البيان': 'صافي السيولة النقدية (جنيه)', 'القيمة': summary.netCashFlow.toFixed(2) },
            { 'البيان': 'الرصيد النقدي النهائي (جنيه)', 'القيمة': summary.closingCashBalance.toFixed(2) },
            { 'البيان': '---', 'القيمة': '---' }, // فاصل
            { 'البيان': 'رصيد المشغولات الافتتاحي (جرام)', 'القيمة': parseFloat(openingNewGoldBalance || 0).toFixed(2) },
            { 'البيان': 'رصيد الكسر الافتتاحي (جرام)', 'القيمة': parseFloat(openingOldGoldBalance || 0).toFixed(2) },
            { 'البيان': 'ذهب مستعمل مشترى (كسر) (جرام)', 'القيمة': parseFloat(purchasedUsedGold || 0).toFixed(2) },
            { 'البيان': 'إجمالي الذهب المسلم للتاجر (جرام)', 'القيمة': summary.totalGoldDeliveredToMerchant.toFixed(2) },
            { 'البيان': 'إجمالي الذهب المستلم من التاجر (جرام)', 'القيمة': summary.totalGoldReceivedFromMerchant.toFixed(2) },
            { 'البيان': 'الرصيد النهائي للمشغولات (جرام)', 'القيمة': summary.endingNewGoldBalance.toFixed(2) },
            { 'البيان': 'الرصيد النهائي للكسر (جرام)', 'القيمة': summary.endingOldGoldBalance.toFixed(2) },
            { 'البيان': 'إجمالي رصيد الذهب الفعلي (جرام)', 'القيمة': summary.endingTotalGoldBalance.toFixed(2) },
        ];
        exportToExcel(dataToExport, 'تقرير_الجرد_والأرباح');
    };

    const getMerchantName = (merchantId) => {
        const merchant = merchants.find(m => m.id === merchantId);
        return merchant ? merchant.name : 'تاجر غير محدد';
    };


    return (
        <div className="inventory-page">
            <div className="inventory-page__header">
                <h2>إدارة المخزون (الجرد)</h2>
                <button onClick={handleExport} className="button--secondary">
                    تصدير إلى Excel
                </button>
            </div>
            <p className="inventory-note">
                هذه الصفحة مخصصة للجرد اليومي. يتم تصفير قيم "رصيد الذهب الافتتاحي" و "الذهب الكسر المشترى" و "الرصيد النقدي الافتتاحي" تلقائياً كل يوم.
                <br />
                القيم المحسوبة هنا تستند إلى جميع المعاملات المسجلة اليوم.
            </p>
            <div className="summary-grid">
                <div className="summary-card">
                    <h3>إجمالي فواتير المبيعات</h3>
                    <p className="summary-value">{summary.totalBilledSales.toFixed(2)} جنيه</p>
                    <p className="summary-label">الوزن: {summary.monthlySalesWeight.toFixed(2)} جرام</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي فواتير المشتريات</h3>
                    <p className="summary-value">{summary.totalBilledPurchases.toFixed(2)} جنيه</p>
                    <p className="summary-label">الوزن: {summary.monthlyPurchasesWeight.toFixed(2)} جرام</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي المصروفات</h3>
                    <p className="summary-value">{summary.monthlyExpenses.toFixed(2)} جنيه</p>
                </div>
                <div className="summary-card profit-card">
                    <h3>صافي السيولة النقدية</h3>
                    <p className="summary-value">{summary.netCashFlow.toFixed(2)} جنيه</p>
                    <p className="summary-label">إجمالي الداخل - إجمالي الخارج (لليوم)</p>
                </div>
                <div className="summary-card inventory-card">
                    <h3>الرصيد النقدي النهائي</h3>
                    <p className="summary-value">{summary.closingCashBalance.toFixed(2)} جنيه</p>
                    <p className="summary-label">الرصيد الافتتاحي + صافي سيولة اليوم</p>
                </div>
                <div className="summary-card inventory-card">
                    <h3>إجمالي رصيد الذهب الفعلي</h3>
                    <p className="summary-value">{summary.endingTotalGoldBalance.toFixed(2)} جرام</p>
                    <div className="gold-balance-details">
                        <span>مشغولات: {summary.endingNewGoldBalance.toFixed(2)}</span>
                        <span>كسر: {summary.endingOldGoldBalance.toFixed(2)}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <h3>رصيد المشغولات الافتتاحي</h3>
                    <input
                        type="number"
                        className="inventory-input"
                        value={openingNewGoldBalance}
                        onChange={(e) => onOpeningNewGoldBalanceChange(e.target.value)}
                        placeholder="0.00"
                    />
                    <p className="summary-label">جرام</p>
                </div>
                <div className="summary-card">
                    <h3>رصيد الكسر الافتتاحي</h3>
                    <input
                        type="number"
                        className="inventory-input"
                        value={openingOldGoldBalance}
                        onChange={(e) => onOpeningOldGoldBalanceChange(e.target.value)}
                        placeholder="0.00"
                    />
                    <p className="summary-label">جرام</p>
                </div>
                <div className="summary-card">
                    <h3>الرصيد النقدي الافتتاحي</h3>
                    <input
                        type="number"
                        className="inventory-input"
                        value={openingCashBalance}
                        onChange={(e) => onOpeningCashBalanceChange(e.target.value)}
                        placeholder="0.00"
                    />
                    <p className="summary-label">جنيه</p>
                </div>
                <div className="summary-card">
                    <h3>ذهب مستعمل مُشترى (كسر)</h3>
                    <input
                        type="number"
                        className="inventory-input"
                        value={purchasedUsedGold}
                        onChange={(e) => onPurchasedUsedGoldChange(e.target.value)}
                        placeholder="0.00"
                    />
                    <p className="summary-label">جرام</p>
                </div>
                <div className="summary-card readonly-card">
                    <h3>إجمالي المسلَّم للتاجر</h3>
                    <p className="summary-value">{summary.totalGoldDeliveredToMerchant.toFixed(2)}</p>
                    <p className="summary-label">جرام (محسوب من صفحة الكسر)</p>
                </div>
                <div className="summary-card readonly-card">
                    <h3>إجمالي المستلَم من التاجر</h3>
                    <p className="summary-value">{summary.totalGoldReceivedFromMerchant.toFixed(2)}</p>
                    <p className="summary-label">جرام (محسوب من صفحة الكسر)</p>
                </div>
                <div className="summary-card readonly-card">
                    <h3>سيولة داخلة (ديون)</h3>
                    <p className="summary-value">{summary.totalCashInFromNewDebts.toFixed(2)}</p>
                    <p className="summary-label">جنيه (محسوب من المديونيات)</p>
                </div>
                <div className="summary-card readonly-card">
                    <h3>سيولة خارجة (سداد ديون)</h3>
                    <p className="summary-value">{summary.totalCashOutForDebtPayments.toFixed(2)}</p>
                    <p className="summary-label">جنيه (محسوب من المديونيات)</p>
                </div>
            </div>

            <div className="inventory-details-table">
                <h3>سجل تعاملات الذهب مع التجار (الكسر)</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>التاجر</th>
                            <th>نوع العملية</th>
                            <th>الوصف</th>
                            <th>الوزن (جرام)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scrapTransactions.length > 0 ? (
                            scrapTransactions.map(t => (
                                <tr key={t.id}>
                                    <td>{t.date}</td>
                                    <td>{getMerchantName(t.merchantId)}</td>
                                    <td className={t.type === 'تسليم' ? 'delivery' : 'receipt'}>{t.type}</td>
                                    <td>{t.description}</td>
                                    <td>{t.weight}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="empty-cell">لا توجد تعاملات مسجلة في صفحة إدارة الكسر.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryPage;