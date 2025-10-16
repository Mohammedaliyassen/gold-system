import React, { useMemo } from "react";
import './InventoryPage.css';
import { exportToExcel } from "./exportToExcel";

const InventoryPage = ({ totals, salesEntries, purchaseEntries, expenseEntries, openingGoldBalance, onOpeningGoldBalanceChange, purchasedUsedGold, onPurchasedUsedGoldChange, scrapTransactions, merchants, financialDebts }) => {
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

        // Calculate gold movement from scrap transactions
        const totalGoldDeliveredToMerchant = scrapTransactions
            .filter(t => t.type === 'تسليم')
            .reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);

        const totalGoldReceivedFromMerchant = scrapTransactions
            .filter(t => t.type === 'استلام')
            .reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);


        return {
            totalBilledSales: totals.salesTotal,
            monthlySalesWeight: totalSalesWeight,
            totalBilledPurchases: totals.purchaseTotal,
            monthlyPurchasesWeight: totalPurchaseWeight,
            monthlyExpenses: totals.expenseTotal,
            endingInventoryEstimate: (parseFloat(openingGoldBalance || 0) + totalPurchaseWeight + parseFloat(purchasedUsedGold || 0) + totalGoldReceivedFromMerchant) - (totalSalesWeight + totalGoldDeliveredToMerchant),
            netCashFlow: netCashFlow,
            totalCashIn: finalTotalCashIn,
            totalCashOut: finalTotalCashOut,
            totalGoldDeliveredToMerchant,
            totalGoldReceivedFromMerchant,
            totalCashInFromNewDebts,
            totalCashOutForDebtPayments,
        };
    }, [totals, salesEntries, purchaseEntries, expenseEntries, openingGoldBalance, purchasedUsedGold, scrapTransactions, financialDebts]);

    const handleExport = () => {
        const dataToExport = [
            { 'البيان': 'إجمالي المبيعات (جنيه)', 'القيمة': summary.monthlySales.toFixed(2) },
            { 'البيان': 'إجمالي وزن المبيعات (جرام)', 'القيمة': summary.monthlySalesWeight.toFixed(2) },
            { 'البيان': 'إجمالي المشتريات (جنيه)', 'القيمة': summary.monthlyPurchases.toFixed(2) },
            { 'البيان': 'إجمالي وزن المشتريات (جرام)', 'القيمة': summary.monthlyPurchasesWeight.toFixed(2) },
            { 'البيان': 'إجمالي المصروفات (جنيه)', 'القيمة': summary.monthlyExpenses.toFixed(2) },
            { 'البيان': 'صافي السيولة النقدية (جنيه)', 'القيمة': summary.netCashFlow.toFixed(2) },
            { 'البيان': 'رصيد الذهب الافتتاحي (جرام)', 'القيمة': parseFloat(openingGoldBalance || 0).toFixed(2) },
            { 'البيان': 'ذهب مستعمل مشترى (كسر) (جرام)', 'القيمة': parseFloat(purchasedUsedGold || 0).toFixed(2) },
            { 'البيان': 'إجمالي الذهب المسلم للتاجر (جرام)', 'القيمة': summary.totalGoldDeliveredToMerchant.toFixed(2) },
            { 'البيان': 'إجمالي الذهب المستلم من التاجر (جرام)', 'القيمة': summary.totalGoldReceivedFromMerchant.toFixed(2) },
            { 'البيان': 'رصيد الذهب الفعلي (تقديري) (جرام)', 'القيمة': summary.endingInventoryEstimate.toFixed(2) },
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
                    <p className="summary-label">المقبوضات - (المدفوعات + المصروفات)</p>
                </div>
                <div className="summary-card inventory-card">
                    <h3>رصيد الذهب الفعلي (تقديري)</h3>
                    <p className="summary-value">{summary.endingInventoryEstimate.toFixed(2)} جرام</p>
                    <p className="summary-label">الرصيد الحالي للذهب في المحل</p>
                </div>
                <div className="summary-card">
                    <h3>رصيد الذهب الافتتاحي</h3>
                    <input
                        type="number"
                        className="inventory-input"
                        value={openingGoldBalance}
                        onChange={(e) => onOpeningGoldBalanceChange(e.target.value)}
                        placeholder="0.00"
                    />
                    <p className="summary-label">جرام</p>
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