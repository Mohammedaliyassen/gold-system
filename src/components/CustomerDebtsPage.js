import React, { useState, useMemo } from 'react';
import SectionCard from './SectionCard';
import { FaWhatsapp } from 'react-icons/fa';
import './CustomerDebtsPage.css';

const CustomerDebtsPage = ({ salesEntries, onSalesEntriesChange, purchaseEntries, financialDebts, onFinancialDebtsChange }) => {
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');

    // State for new financial debt
    const [newDebtSupplier, setNewDebtSupplier] = useState('');
    const [newDebtAmount, setNewDebtAmount] = useState('');
    const [newDebtSupplierPhone, setNewDebtSupplierPhone] = useState('');
    const [newDebtNotes, setNewDebtNotes] = useState('');
    const [updatedDebtNotes, setUpdatedDebtNotes] = useState('');

    // State for paying off a financial debt
    const [selectedDebtId, setSelectedDebtId] = useState('');
    const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
    const [viewingDebtId, setViewingDebtId] = useState(''); // New state for viewing details

    const customerDebts = useMemo(() => {
        const debts = {};
        salesEntries.forEach(sale => {
            if (!sale.customerName) return;

            if (!debts[sale.customerName]) {
                debts[sale.customerName] = {
                    totalBilled: 0,
                    totalPaid: 0,
                    phone: sale.customerPhone,
                    entries: []
                };
            }
            const finalPrice = parseFloat(sale.finalPrice || 0);
            const amountPaid = parseFloat(sale.amountPaid || 0);

            debts[sale.customerName].totalBilled += finalPrice;
            debts[sale.customerName].totalPaid += amountPaid;
            debts[sale.customerName].entries.push(sale);
        });

        return Object.entries(debts).map(([name, data]) => ({
            name,
            ...data,
            balance: data.totalBilled - data.totalPaid
        })).filter(c => c.balance > 0.01); // Only show customers with debt
    }, [salesEntries])

    const financialDebtsSummary = useMemo(() => {
        return financialDebts.map(debt => {
            const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
            return {
                ...debt,
                totalPaid,
                balance: debt.initialAmount - totalPaid
            };
        }).filter(d => d.balance > 0.01);
    }, [financialDebts]);

    const totalFinancialDebtBalance = useMemo(() => {
        return financialDebtsSummary.reduce((sum, d) => sum + d.balance, 0);
    }, [financialDebtsSummary]);

    const viewedDebtDetails = useMemo(() => {
        if (!viewingDebtId) return null;
        return financialDebts.find(d => d.id === viewingDebtId);
    }, [financialDebts, viewingDebtId]);

    const handleAddPayment = () => {
        if (!selectedCustomer || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('الرجاء اختيار عميل وإدخال مبلغ صحيح.');
            return;
        }

        const paymentValue = parseFloat(paymentAmount);

        // Add a new "payment" entry to sales
        const newPaymentEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(), // Store full ISO string for date and time
            description: `دفعة من حساب العميل`,
            customerName: selectedCustomer,
            customerPhone: customerDebts.find(c => c.name === selectedCustomer)?.phone || '',
            finalPrice: 0, // No new debt
            amountPaid: paymentValue, // This is a payment
            weight: 0,
            karat: '',
        };

        onSalesEntriesChange(prev => [...prev, newPaymentEntry]);
        alert(`تم تسجيل دفعة بقيمة ${paymentValue.toFixed(2)} للعميل ${selectedCustomer}`);
        setPaymentAmount('');
        setSelectedCustomer('');
    };

    const selectedCustomerTransactions = useMemo(() => {
        if (!selectedCustomer) return [];
        return salesEntries.filter(sale => sale.customerName === selectedCustomer);
    }, [salesEntries, selectedCustomer]);

    const handleAddNewFinancialDebt = () => {
        if (!newDebtSupplier || !newDebtAmount || parseFloat(newDebtAmount) <= 0) {
            alert('الرجاء إدخال اسم المورد ومبلغ صحيح للدين.');
            return;
        }
        const newDebt = {
            id: Date.now().toString(),
            supplierName: newDebtSupplier,
            initialAmount: parseFloat(newDebtAmount),
            supplierPhone: newDebtSupplierPhone,
            notes: newDebtNotes,
            date: new Date().toISOString().split('T')[0],
            payments: []
        };
        onFinancialDebtsChange(prev => [...prev, newDebt]);
        alert('تمت إضافة الدين بنجاح.');
        setNewDebtSupplier('');
        setNewDebtSupplierPhone('');
        setNewDebtAmount('');
        setNewDebtNotes('');
    };

    const handleAddFinancialDebtPayment = () => {
        if (!selectedDebtId || !debtPaymentAmount || parseFloat(debtPaymentAmount) <= 0) {
            alert('الرجاء اختيار دين وإدخال مبلغ صحيح للدفعة.');
            return;
        }

        const paymentValue = parseFloat(debtPaymentAmount);

        let updatedDebt = null;

        const updatedDebts = financialDebts.map(debt => {
            if (debt.id === selectedDebtId) {
                const newPayment = {
                    id: `p-${Date.now()}`,
                    amount: paymentValue,
                    date: new Date().toISOString(), // Store full ISO string
                    notes: updatedDebtNotes
                };
                updatedDebt = {
                    ...debt,
                    payments: [...debt.payments, newPayment]
                };
                return updatedDebt;
            }
            return debt;
        });

        onFinancialDebtsChange(updatedDebts);

        alert('تم تسجيل الدفعة بنجاح.');
        setSelectedDebtId('');
        setDebtPaymentAmount('');
        setUpdatedDebtNotes('')

        // Automatically send WhatsApp message
        if (updatedDebt && updatedDebt.supplierPhone) {
            const totalPaid = updatedDebt.payments.reduce((sum, p) => sum + p.amount, 0);
            const newBalance = updatedDebt.initialAmount - totalPaid;

            const message = `مرحباً ${updatedDebt.supplierName}،\nتم استلام دفعة بقيمة ${paymentValue.toFixed(2)} جنيه.\nالرصيد المتبقي هو ${newBalance.toFixed(2)} جنيه.\n ملحوظة : ${updatedDebtNotes}.     \nشكراًشكراً لتعاملكم معنا.`;
            const whatsappUrl = `https://wa.me/2${updatedDebt.supplierPhone.replace(/^0+/, '')}?text=${encodeURIComponent(message)}`;

            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            // Check if it's a valid date
            if (isNaN(date.getTime())) {
                // If not, it might be a date-only string
                return isoString;
            }
            return date.toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return isoString; // Fallback to original string if formatting fails
        }
    };


    return (
        <div className="customer-debts-page">
            <h2>إدارة المديونيات</h2>

            <div className="debts-summary-grid">
                <SectionCard title="ديون العملاء (لصالح المحل)">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>إجمالي الفواتير</th>
                                <th>إجمالي المدفوع</th>
                                <th>الرصيد المستحق</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerDebts.length > 0 ? customerDebts.map(customer => (
                                <tr key={customer.name} onClick={() => setSelectedCustomer(customer.name)} className={selectedCustomer === customer.name ? 'selected-row' : ''}>
                                    <td>{customer.name}</td>
                                    <td>{customer.phone || '-'}</td>
                                    <td>{customer.totalBilled.toFixed(2)}</td>
                                    <td>{customer.totalPaid.toFixed(2)}</td>
                                    <td className="profit-amount">{customer.balance.toFixed(2)}</td>
                                    <td className="actions-cell">
                                        {customer.phone && (
                                            <a href={`https://wa.me/2${customer.phone.replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً ${customer.name}، نود تذكيركم بأن الرصيد المستحق عليكم هو ${customer.balance.toFixed(2)} جنيه. شكراً لتعاملكم معنا.`)}`} target="_blank" rel="noopener noreferrer" className="whatsapp-icon" onClick={(e) => e.stopPropagation()} title={`إرسال رسالة إلى ${customer.name}`}>
                                                <FaWhatsapp />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="empty-cell">لا توجد ديون حالية على العملاء.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard title="ملخص ديون المحل">
                    <div className="shop-debt-summary">
                        <div className="summary-item total-debt-item">
                            <span>إجمالي الديون المالية المستحقة على المحل</span>
                            <p className="debt-amount">
                                {totalFinancialDebtBalance.toFixed(2)} جنيه
                            </p>
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="debts-grid">
                <SectionCard title="تسجيل دفعة جديدة">
                    <div className="section-form">
                        <label>
                            اختر العميل
                            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                                <option value="">-- اختر عميل --</option>
                                {customerDebts.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </label>
                        <label>
                            المبلغ المدفوع (جنيه)
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="500"
                                disabled={!selectedCustomer}
                            />
                        </label>
                        <button onClick={handleAddPayment} disabled={!selectedCustomer || !paymentAmount}>إضافة دفعة</button>
                    </div>
                </SectionCard>

                {selectedCustomer && (
                    <SectionCard title={`سجل تعاملات: ${selectedCustomer}`}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>الوصف</th>
                                    <th>المبلغ المطلوب</th>
                                    <th>المبلغ المدفوع</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCustomerTransactions.map(sale => (
                                    <tr key={sale.id}>
                                        <td>{formatDateTime(sale.date)}</td>
                                        <td>{sale.description}</td>
                                        <td>{parseFloat(sale.finalPrice || 0).toFixed(2)}</td>
                                        <td className={parseFloat(sale.finalPrice || 0) > 0 ? '' : 'payment-amount'}>{parseFloat(sale.amountPaid || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </SectionCard>
                )}
            </div>

            <hr className="page-divider" />

            <SectionCard title="ديون مالية أخرى (ليست متعلقة بالذهب)">
                <div className="financial-debts-grid">
                    <div className="section-form">
                        <h4>إضافة دين جديد</h4>
                        <label>
                            اسم المورد/الدائن
                            <input type="text" value={newDebtSupplier} onChange={e => setNewDebtSupplier(e.target.value)} placeholder="اسم المورد" />
                        </label>
                        <label>
                            مبلغ الدين (جنيه)
                            <input type="number" value={newDebtAmount} onChange={e => setNewDebtAmount(e.target.value)} placeholder="10000" />
                        </label>
                        <label>
                            رقم هاتف المورد/الدائن
                            <input type="tel" value={newDebtSupplierPhone} onChange={e => setNewDebtSupplierPhone(e.target.value)} placeholder="01xxxxxxxxx" />
                        </label>
                        <label>
                            ملاحظات
                            <input type="text" value={newDebtNotes} onChange={e => setNewDebtNotes(e.target.value)} placeholder="سبب الدين" />
                        </label>
                        <button onClick={handleAddNewFinancialDebt}>إضافة دين</button>
                    </div>

                    <div className="section-form">
                        <h4>تسديد دفعة</h4>
                        <label>
                            اختر الدين
                            <select value={selectedDebtId} onChange={e => setSelectedDebtId(e.target.value)}>
                                <option value="">-- اختر دين لتسديده --</option>
                                {financialDebtsSummary.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.supplierName} (المتبقي: {d.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            مبلغ الدفعة (جنيه)
                            <input type="number" value={debtPaymentAmount} onChange={e => setDebtPaymentAmount(e.target.value)} placeholder="1000" disabled={!selectedDebtId} />
                        </label>
                        <label>
                            مبلغ الدفعة (جنيه)
                            <input type="text" value={updatedDebtNotes} onChange={e => setUpdatedDebtNotes(e.target.value)} placeholder="احمد استلم الدفعة" disabled={!selectedDebtId} />
                        </label>
                        <button onClick={handleAddFinancialDebtPayment} disabled={!selectedDebtId || !debtPaymentAmount}>تسجيل دفعة</button>
                    </div>
                </div>

                <h4>قائمة الديون المالية الحالية</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>المورد/الدائن</th>
                            <th>ملاحظات</th>
                            <th>المبلغ الأساسي</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financialDebtsSummary.length > 0 ? financialDebtsSummary.map(debt => (
                            <tr key={debt.id} onClick={() => setViewingDebtId(debt.id)} className={viewingDebtId === debt.id ? 'selected-row' : ''}>
                                <td>{debt.date}</td>
                                <td>{debt.supplierName}</td>
                                <td>{debt.notes || '-'}</td>
                                <td>{debt.initialAmount.toFixed(2)}</td>
                                <td>{debt.totalPaid.toFixed(2)}</td>
                                <td className="debt-amount">{debt.balance.toFixed(2)}</td>
                                <td className="actions-cell">
                                    {debt.supplierPhone && (
                                        <a href={`https://wa.me/2${debt.supplierPhone.replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً ${debt.supplierName}، نود تذكيركم بأن الرصيد المستحق لكم هو ${debt.balance.toFixed(2)} جنيه.`)}`} target="_blank" rel="noopener noreferrer" className="whatsapp-icon" title={`إرسال رسالة إلى ${debt.supplierName}`}>
                                            <FaWhatsapp />
                                        </a>
                                    )}
                                </td>
                            </tr>
                        )) : <tr><td colSpan="7" className="empty-cell">لا توجد ديون مالية أخرى.</td></tr>}
                    </tbody>
                </table>

                {viewedDebtDetails && (
                    <SectionCard title={`سجل دين: ${viewedDebtDetails.supplierName}`}>
                        <div className="debt-details-summary">
                            <p><strong>تاريخ بدء الدين:</strong> {viewedDebtDetails.date}</p>
                            <p><strong>المبلغ الأساسي:</strong> {viewedDebtDetails.initialAmount.toFixed(2)} جنيه</p>
                        </div>
                        <h4>سجل الدفعات</h4>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>تاريخ الدفعة</th>
                                    <th>المبلغ المدفوع</th>
                                    <th>ملاحظات الدفعة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewedDebtDetails.payments.length > 0 ? viewedDebtDetails.payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>{formatDateTime(payment.date)}</td>
                                        <td className="payment-amount">{payment.amount.toFixed(2)}</td>
                                        <td className="payment-notes">{payment.updatedDebtNotes || payment.notes || 'لا يوجد ملاحظات'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="2" className="empty-cell">لا توجد دفعات مسجلة لهذا الدين.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </SectionCard>
                )}
            </SectionCard>
        </div>
    );
};

export default CustomerDebtsPage;