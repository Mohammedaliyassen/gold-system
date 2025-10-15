import React, { useState, useMemo } from 'react';
import SectionCard from './SectionCard';
import './ReportsPage.css';

const ReportsPage = ({ salesEntries, purchaseEntries }) => {
    const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'all'
    const [customRange, setCustomRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const handleCustomRangeChange = (e) => {
        const { name, value } = e.target;
        setCustomRange(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        window.print();
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
        };
    }, [period, salesEntries, purchaseEntries, customRange]);

    const summary = useMemo(() => {
        const salesTotal = filteredData.sales.reduce((sum, entry) => sum + parseFloat(entry.finalPrice || 0), 0);
        const salesWeight = filteredData.sales.reduce((sum, entry) => sum + parseFloat(entry.weight || 0), 0);
        const purchaseTotal = filteredData.purchases.reduce((sum, entry) => sum + parseFloat(entry.cost || 0), 0);
        const purchaseWeight = filteredData.purchases.reduce((sum, entry) => sum + parseFloat(entry.weight || 0), 0);

        return { salesTotal, salesWeight, purchaseTotal, purchaseWeight };
    }, [filteredData]);

    const periodLabels = {
        today: 'اليوم',
        week: 'هذا الأسبوع',
        month: 'هذا الشهر',
        all: 'كل الوقت',
        custom: 'فترة مخصصة'
    };

    return (
        <div>
            <div className="reports-page">
                <div className="reports-page__header">
                    <h2>التقارير الملخصة</h2>

                </div>

                <div className="period-selector">
                    <button onClick={() => setPeriod('today')} className={period === 'today' ? 'active' : ''}>اليوم</button>
                    <button onClick={() => setPeriod('week')} className={period === 'week' ? 'active' : ''}>هذا الأسبوع</button>
                    <button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>هذا الشهر</button>
                    <button onClick={() => setPeriod('custom')} className={period === 'custom' ? 'active' : ''}>فترة مخصصة</button>
                    <button onClick={() => setPeriod('all')} className={period === 'all' ? 'active' : ''}>كل الوقت</button>
                </div>
                <div className='printContainer'>
                    <button onClick={handlePrint} className="button--print">
                        طباعة / تصدير PDF
                    </button>
                </div>
                {period === 'custom' && (
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
                <div className="summary-card">
                    <h3>إجمالي المبيعات</h3>
                    <p className="summary-value">{summary.salesTotal.toFixed(2)} جنيه</p>
                    <p className="summary-label">الوزن: {summary.salesWeight.toFixed(2)} جرام</p>
                </div>
                <div className="summary-card">
                    <h3>إجمالي المشتريات</h3>
                    <p className="summary-value">{summary.purchaseTotal.toFixed(2)} جنيه</p>
                    <p className="summary-label">الوزن: {summary.purchaseWeight.toFixed(2)} جرام</p>
                </div>
                <div className="summary-card">
                    <h3>صافي الربح (تقديري)</h3>
                    <p className="summary-value">{(summary.salesTotal - summary.purchaseTotal).toFixed(2)} جنيه</p>
                    <p className="summary-label">قيمة المبيعات - قيمة المشتريات</p>
                </div>
                <div className="summary-card">
                    <h3>صافي حركة الذهب</h3>
                    <p className="summary-value">{(summary.purchaseWeight - summary.salesWeight).toFixed(2)} جرام</p>
                    <p className="summary-label">وزن المشتريات - وزن المبيعات</p>
                </div>
            </div>

            <SectionCard title={`تفاصيل المبيعات (${periodLabels[period]})`}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الوصف</th>
                            <th>الوزن (جرام)</th>
                            <th>السعر النهائي (جنيه)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.sales.length > 0 ? (
                            filteredData.sales.map(entry => (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الوصف">{entry.description}</td>
                                    <td data-label="الوزن (جرام)">{entry.weight}</td>
                                    <td data-label="السعر النهائي">{entry.finalPrice}</td>
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
                            <th>الوزن (جرام)</th>
                            <th>التكلفة (جنيه)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.purchases.length > 0 ? (
                            filteredData.purchases.map(entry => (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الوصف">{entry.description}</td>
                                    <td data-label="الوزن (جرام)">{entry.weight}</td>
                                    <td data-label="التكلفة">{entry.cost}</td>
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