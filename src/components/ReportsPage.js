import React, { useState, useMemo } from 'react';
import SectionCard from './SectionCard';
import './ReportsPage.css';

const ReportsPage = ({ salesEntries, purchaseEntries, expenseEntries, scrapTransactions, financialDebts }) => {
    const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'all'
    const [customRange, setCustomRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [openingCashBalance, setOpeningCashBalance] = useState('');
    const [openingCashSource, setOpeningCashSource] = useState('internal'); // 'internal' or 'external'

    const handleCustomRangeChange = (e) => {
        const { name, value } = e.target;
        setCustomRange(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        // This can be expanded later to a more robust PDF generation
        const printContent = document.querySelector('.reports-page-printable-area').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>تقرير</title>
                    <link rel="stylesheet" href="index.css"> 
                    <style>
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none !important; }
                            .summary-grid {
                                grid-template-columns: repeat(2, 1fr) !important;
                            }
                        }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    const filteredData = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filterByDate = (entry) => {
            if (!entry.date) return false;
            const entryDate = new Date(entry.date);
            if (isNaN(entryDate)) return false;

            // Adjust entryDate to be at the start of its day for consistent comparison
            const entryDayStart = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

            switch (period) {
                case 'today':
                    return entryDayStart.getTime() === today.getTime();
                case 'week':
                    const firstDayOfWeek = new Date(today);
                    firstDayOfWeek.setDate(today.getDate() - today.getDay());
                    return entryDayStart >= firstDayOfWeek;
                case 'month':
                    return entryDayStart.getFullYear() === today.getFullYear() && entryDayStart.getMonth() === today.getMonth();
                case 'custom':
                    if (!customRange.start || !customRange.end) return false;
                    const startDate = new Date(customRange.start);
                    const endDate = new Date(customRange.end);
                    // Adjust for timezone issues and to include the end date
                    endDate.setHours(23, 59, 59, 999);
                    return entryDate >= startDate && entryDate <= endDate;
                case 'all':
                default:
                    return true;
            }
        };

        return {
            sales: salesEntries.filter(filterByDate),
            purchases: purchaseEntries.filter(filterByDate),
            expenses: expenseEntries.filter(filterByDate),
            scrap: scrapTransactions.filter(filterByDate),
            debts: financialDebts.filter(filterByDate),
            debtPayments: financialDebts.flatMap(debt =>
                debt.payments.filter(payment => filterByDate({ date: payment.date }))
            ),
        };
    }, [salesEntries, purchaseEntries, expenseEntries, scrapTransactions, financialDebts, period, customRange]);

    const summary = useMemo(() => {
        const totalCashInFromSales = filteredData.sales.reduce((sum, entry) => sum + parseFloat(entry.amountPaid || 0), 0);
        const totalCashOutForPurchases = filteredData.purchases.reduce((sum, entry) => sum + parseFloat(entry.amountPaid || 0), 0);
        const totalCashOutForExpenses = filteredData.expenses.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const totalCashInFromNewDebts = filteredData.debts.reduce((sum, debt) => sum + parseFloat(debt.initialAmount || 0), 0);
        const totalCashOutForDebtPayments = filteredData.debtPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        let finalTotalCashIn = totalCashInFromSales + totalCashInFromNewDebts;
        const finalTotalCashOut = totalCashOutForPurchases + totalCashOutForExpenses + totalCashOutForDebtPayments;

        const isDailyReport = period === 'today';
        const openingBalance = isDailyReport ? parseFloat(openingCashBalance || 0) : 0;

        if (isDailyReport && openingCashSource === 'external') {
            finalTotalCashIn += openingBalance;
        }

        const netCashFlow = finalTotalCashIn - finalTotalCashOut;
        const closingCashBalance = isDailyReport ? (openingCashSource === 'internal' ? openingBalance + netCashFlow : netCashFlow) : netCashFlow;

        const totalGoldDeliveredToMerchant = filteredData.scrap.filter(t => t.type === 'تسليم').reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);
        const totalGoldReceivedFromMerchant = filteredData.scrap.filter(t => t.type === 'استلام').reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);

        return {
            netCashFlow,
            closingCashBalance,
            finalTotalCashIn,
            finalTotalCashOut,
            totalGoldDeliveredToMerchant,
            totalGoldReceivedFromMerchant,
        };
    }, [filteredData, period, openingCashBalance, openingCashSource]);

    const periodLabels = {
        today: 'اليوم',
        week: 'هذا الأسبوع',
        month: 'هذا الشهر',
        all: 'كل الوقت',
        custom: 'فترة مخصصة'
    };

    return (
        <div className="reports-page-printable-area">
            <div className="reports-page">
                <div className="reports-page__header">
                    <h2>التقارير الملخصة</h2>
                    <button onClick={handlePrint} className="button--print no-print">
                        طباعة / تصدير PDF
                    </button>
                </div>

                <div className="period-selector no-print">
                    <button onClick={() => setPeriod('today')} className={period === 'today' ? 'active' : ''}>اليوم</button>
                    <button onClick={() => setPeriod('week')} className={period === 'week' ? 'active' : ''}>هذا الأسبوع</button>
                    <button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>هذا الشهر</button>
                    <button onClick={() => setPeriod('custom')} className={period === 'custom' ? 'active' : ''}>فترة مخصصة</button>
                    <button onClick={() => setPeriod('all')} className={period === 'all' ? 'active' : ''}>كل الوقت</button>
                </div>

                {period === 'today' && (
                    <div className="opening-balance-section no-print">
                        <label>
                            الرصيد النقدي الافتتاحي:
                            <input
                                type="number"
                                value={openingCashBalance}
                                onChange={(e) => setOpeningCashBalance(e.target.value)}
                                placeholder="أدخل الرصيد..."
                            />
                        </label>
                        <label>
                            مصدر الرصيد:
                            <select value={openingCashSource} onChange={(e) => setOpeningCashSource(e.target.value)}>
                                <option value="internal">رصيد داخلي من الخزنة</option>
                                <option value="external">سيولة من مصدر خارجي</option>
                            </select>
                        </label>
                    </div>
                )}
                {period === 'custom' && ( // Kept the custom range selector as it was
                    <div className="custom-range-selector">
                        <label>
                            من:
                            <input type="date" name="start" value={customRange.start} onChange={handleCustomRangeChange} />
                        </label>
                        <label>
                            إلى:
                            <input type="date" name="end" value={customRange.end} onChange={handleCustomRangeChange} />
                        </label>
                    </div>
                )}

            </div>

            <div className="summary-grid">
                {period === 'today' && (
                    <div className="summary-card inventory-card">
                        <h3>الرصيد النقدي النهائي</h3>
                        <p className={`summary-value ${summary.closingCashBalance >= 0 ? 'profit' : 'loss'}`}>{summary.closingCashBalance.toFixed(2)} جنيه</p>
                        <p className="summary-label">الرصيد بعد عمليات اليوم</p>
                    </div>
                )}
                <div className="summary-card profit-card">
                    <h3>صافي السيولة النقدية</h3>
                    <p className={`summary-value ${summary.netCashFlow >= 0 ? 'profit' : 'loss'}`}>{summary.netCashFlow.toFixed(2)} جنيه</p>
                    <p className="summary-label">إجمالي الداخل - إجمالي الخارج</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي السيولة الداخلة</h3>
                    <p className="summary-value">{summary.finalTotalCashIn.toFixed(2)} جنيه</p>
                    <p className="summary-label">مبيعات + ديون جديدة</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي السيولة الخارجة</h3>
                    <p className="summary-value">{summary.finalTotalCashOut.toFixed(2)} جنيه</p>
                    <p className="summary-label">مشتريات + مصروفات + سداد ديون</p>
                </div>
                <div className="summary-card">
                    <h3>ذهب مُسلَّم للتاجر</h3>
                    <p className="summary-value">{summary.totalGoldDeliveredToMerchant.toFixed(2)} جرام</p>
                    <p className="summary-label">من صفحة الكسر</p>
                </div>
                <div className="summary-card">
                    <h3>ذهب مُستلَم من التاجر</h3>
                    <p className="summary-value">{summary.totalGoldReceivedFromMerchant.toFixed(2)} جرام</p>
                    <p className="summary-label">من صفحة الكسر</p>
                </div>
            </div>

            <SectionCard title={`تفاصيل المبيعات (${periodLabels[period]})`}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الوصف</th>
                            <th>المبلغ المدفوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.sales.length > 0 ? (
                            filteredData.sales.map(entry => (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الوصف">{entry.description}</td>
                                    <td data-label="المبلغ المدفوع">{parseFloat(entry.amountPaid || 0).toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="empty-cell">لا توجد مبيعات في هذه الفترة.</td></tr>
                        )}
                    </tbody>
                </table>
            </SectionCard>

            <SectionCard title={`تفاصيل المشتريات (${periodLabels[period]})`}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الوصف</th>
                            <th>المبلغ المدفوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.purchases.length > 0 ? (
                            filteredData.purchases.map(entry => (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الوصف">{entry.description}</td>
                                    <td data-label="المبلغ المدفوع">{parseFloat(entry.amountPaid || 0).toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="empty-cell">لا توجد مشتريات في هذه الفترة.</td></tr>
                        )}
                    </tbody>
                </table>
            </SectionCard>
        </div >
    );
};

export default ReportsPage;