import React, { useMemo } from "react";
import SectionCard from "./SectionCard";
import './InventoryPage.css';
import { exportToExcel } from "./exportToExcel";

const InventoryPage = ({ totals, salesEntries, purchaseEntries, expenseEntries, openingGoldBalance, onOpeningGoldBalanceChange }) => {
    const summary = useMemo(() => {
        const totalSalesWeight = salesEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.weight || 0),
            0
        );
        const totalPurchaseWeight = purchaseEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.weight || 0),
            0
        );

        const netProfit = totals.salesTotal - (totals.purchaseTotal + totals.expenseTotal);

        return {
            monthlySales: totals.salesTotal,
            monthlySalesWeight: totalSalesWeight,
            monthlyPurchases: totals.purchaseTotal,
            monthlyPurchasesWeight: totalPurchaseWeight,
            monthlyExpenses: totals.expenseTotal,
            endingInventoryEstimate: parseFloat(openingGoldBalance || 0) + totalPurchaseWeight - totalSalesWeight,
            netProfit: netProfit,
        };
    }, [totals, salesEntries, purchaseEntries, expenseEntries, openingGoldBalance]);

    const handleExport = () => {
        const dataToExport = [
            { 'البيان': 'إجمالي المبيعات (جنيه)', 'القيمة': summary.monthlySales.toFixed(2) },
            { 'البيان': 'إجمالي وزن المبيعات (جرام)', 'القيمة': summary.monthlySalesWeight.toFixed(2) },
            { 'البيان': 'إجمالي المشتريات (جنيه)', 'القيمة': summary.monthlyPurchases.toFixed(2) },
            { 'البيان': 'إجمالي وزن المشتريات (جرام)', 'القيمة': summary.monthlyPurchasesWeight.toFixed(2) },
            { 'البيان': 'إجمالي المصروفات (جنيه)', 'القيمة': summary.monthlyExpenses.toFixed(2) },
            { 'البيان': 'صافي الربح (جنيه)', 'القيمة': summary.netProfit.toFixed(2) },
            { 'البيان': 'رصيد الذهب الافتتاحي (جرام)', 'القيمة': parseFloat(openingGoldBalance || 0).toFixed(2) },
            { 'البيان': 'رصيد الذهب الحالي (تقديري) (جرام)', 'القيمة': summary.endingInventoryEstimate.toFixed(2) },
        ];
        exportToExcel(dataToExport, 'تقرير_الجرد_والأرباح');
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
                    <h3>إجمالي المبيعات</h3>
                    <p className="summary-value">{summary.monthlySales.toFixed(2)} جنيه</p>
                    <p className="summary-label">الوزن: {summary.monthlySalesWeight.toFixed(2)} جرام</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي المشتريات</h3>
                    <p className="summary-value">{summary.monthlyPurchases.toFixed(2)} جنيه</p>
                    <p className="summary-label">الوزن: {summary.monthlyPurchasesWeight.toFixed(2)} جرام</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي المصروفات</h3>
                    <p className="summary-value">{summary.monthlyExpenses.toFixed(2)} جنيه</p>
                </div>
                <div className="summary-card profit-card">
                    <h3>صافي الربح</h3>
                    <p className="summary-value">{summary.netProfit.toFixed(2)} جنيه</p>
                    <p className="summary-label">المبيعات - (المشتريات + المصروفات)</p>
                </div>
                <div className="summary-card inventory-card">
                    <h3>رصيد الذهب (تقديري)</h3>
                    <p className="summary-value">{summary.endingInventoryEstimate.toFixed(2)} جرام</p>
                    <p className="summary-label">الرصيد الافتتاحي + المشتريات - المبيعات</p>
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
            </div>

            {/* يمكن إضافة جداول تفصيلية هنا لاحقًا إذا لزم الأمر */}
        </div>
    );
};

export default InventoryPage;