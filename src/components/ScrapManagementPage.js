import React, { useState, useMemo } from 'react';
import SectionCard from './SectionCard';
// Make sure to create this CSS file or add styles to an existing one
import './ScrapManagementPage.css';
import { exportToExcel } from './exportToExcel';

const ScrapManagementPage = ({
    merchants,
    onMerchantsChange,
    scrapTransactions,
    onScrapTransactionsChange
}) => {
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const [newMerchantName, setNewMerchantName] = useState('');
    const [editingTransactionId, setEditingTransactionId] = useState(null);
    const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
    const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
    const [editedData, setEditedData] = useState({});
    const [transactionForm, setTransactionForm] = useState({
        type: 'تسليم',
        weight: '',
        description: '',
        manufacturingValue: '' // تم التغيير من price
    });

    const handleAddMerchant = (e) => {
        e.preventDefault();
        if (newMerchantName.trim() === '') return;
        const newMerchant = {
            id: Date.now(),
            name: newMerchantName.trim(),
        };
        onMerchantsChange([...merchants, newMerchant]);
        setNewMerchantName('');
    };

    const handleTransactionChange = (e) => {
        const { name, value } = e.target;
        setTransactionForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleStartEdit = (transaction) => {
        setEditingTransactionId(transaction.id);
        setEditedData(transaction);
    };

    const handleCancelEdit = () => {
        setEditingTransactionId(null);
        setEditedData({});
    };

    const handleAddTransaction = (e) => {
        e.preventDefault();
        if (!selectedMerchant || !transactionForm.weight) {
            alert('الرجاء اختيار تاجر وإدخال الوزن.');
            return;
        }
        const newTransaction = {
            id: Date.now(),
            merchantId: parseInt(selectedMerchant),
            date: new Date().toISOString().split('T')[0],
            ...transactionForm,
        };
        onScrapTransactionsChange([...scrapTransactions, newTransaction]);
        setTransactionForm({ type: 'تسليم', weight: '', description: '', manufacturingValue: '' });
    };

    const handleUpdateTransaction = (transactionId) => {
        const updatedTransactions = scrapTransactions.map(t =>
            t.id === transactionId ? editedData : t
        );
        onScrapTransactionsChange(updatedTransactions);
        handleCancelEdit();
    };

    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
            onScrapTransactionsChange(scrapTransactions.filter(t => t.id !== transactionId));
        }
    };

    const handleDeleteMerchant = (merchantId) => {
        if (window.confirm("تحذير: سيتم حذف هذا التاجر وجميع تعاملاته. هل أنت متأكد؟")) {
            const newMerchants = merchants.filter(m => m.id !== merchantId);
            const newTransactions = scrapTransactions.filter(t => t.merchantId !== merchantId);
            onMerchantsChange(newMerchants);
            onScrapTransactionsChange(newTransactions);
            if (selectedMerchant === merchantId.toString()) {
                setSelectedMerchant('');
            }
        }
    };

    const handleExportSummary = () => {
        const dataToExport = merchantsSummary.map(summary => ({
            'التاجر': summary.name,
            'تسليم (جم)': summary.totalDeliveryWeight.toFixed(2),
            'استلام (جم)': summary.totalReceiptWeight.toFixed(2),
            'رصيد الوزن (جم)': summary.weightBalance.toFixed(2),
        }));
        exportToExcel(dataToExport, 'ملخص_أرصدة_التجار');
    };

    const handleExportDetails = () => {
        const merchantName = merchants.find(m => m.id === parseInt(selectedMerchant))?.name || 'تاجر';
        const dataToExport = filteredTransactions.map(t => ({
            'التاريخ': t.date,
            'نوع العملية': t.type,
            'الوصف': t.description,
            'الوزن (جرام)': t.weight,
            'قيمة المصنعية': parseFloat(t.manufacturingValue || 0).toFixed(2),
        }));
        exportToExcel(dataToExport, `سجل_تعاملات_${merchantName.replace(/\s/g, '_')}`);
    };

    const filteredTransactions = useMemo(() => {
        if (!selectedMerchant) return [];
        let transactions = scrapTransactions.filter(t => t.merchantId === parseInt(selectedMerchant));
        if (transactionSearchTerm) {
            transactions = transactions.filter(t =>
                t.description.toLowerCase().includes(transactionSearchTerm.toLowerCase())
            );
        }
        return transactions;
    }, [selectedMerchant, scrapTransactions, transactionSearchTerm]);

    const merchantsSummary = useMemo(() => {
        let filteredMerchants = merchants;
        if (merchantSearchTerm) {
            filteredMerchants = merchants.filter(m => m.name.toLowerCase().includes(merchantSearchTerm.toLowerCase()));
        }
        return filteredMerchants.map(merchant => {
            const merchantTransactions = scrapTransactions.filter(
                t => t.merchantId === merchant.id
            );

            const totalDeliveryWeight = merchantTransactions
                .filter(t => t.type === 'تسليم')
                .reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);

            const totalReceiptWeight = merchantTransactions
                .filter(t => t.type === 'استلام')
                .reduce((sum, t) => sum + parseFloat(t.weight || 0), 0);

            const weightBalance = totalReceiptWeight - totalDeliveryWeight;

            return {
                ...merchant,
                totalDeliveryWeight,
                totalReceiptWeight,
                weightBalance,
            };
        });
    }, [merchants, scrapTransactions, merchantSearchTerm]);

    return (
        <div className="scrap-management-page">
            <h2>إدارة الكسر</h2>

            <div className="search-bar summary-search-bar">
                <input
                    type="text"
                    placeholder="ابحث عن تاجر..."
                    value={merchantSearchTerm}
                    onChange={(e) => setMerchantSearchTerm(e.target.value)}
                />
            </div>

            <SectionCard
                title="ملخص أرصدة التجار"
                containerClassName="summary-card"
                headerAction={<button onClick={handleExportSummary} className="button--secondary-small">تصدير Excel</button>}
            >
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاجر</th>
                            <th>تسليم (جم)</th>
                            <th>استلام (جم)</th>
                            <th>رصيد الوزن (جم)</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {merchantsSummary.length > 0 ? (
                            merchantsSummary.map(summary => (
                                <tr key={summary.id}>
                                    <td>{summary.name}</td>
                                    <td className="delivery">{summary.totalDeliveryWeight.toFixed(2)}</td>
                                    <td className="receipt">{summary.totalReceiptWeight.toFixed(2)}</td>
                                    <td className={summary.weightBalance >= 0 ? 'receipt' : 'delivery'}>
                                        {summary.weightBalance.toFixed(2)}
                                    </td>
                                    <td>
                                        <button onClick={() => handleDeleteMerchant(summary.id)} className="button--danger-small">
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-cell">لا يوجد تجار لعرض ملخص لهم.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </SectionCard>

            <div className="scrap-grid">
                <SectionCard title="اختيار التاجر وإضافة تعامل">
                    <div className="merchant-selection">
                        <label htmlFor="merchant-select">اختر تاجراً:</label>
                        <select
                            id="merchant-select"
                            value={selectedMerchant}
                            onChange={(e) => setSelectedMerchant(e.target.value)}
                        >
                            <option value="">-- اختر تاجراً --</option>
                            {merchants.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <form onSubmit={handleAddTransaction} className="section-form">
                        <h4>تسجيل عملية جديدة</h4>
                        <div className="transaction-type-toggle">
                            <button type="button" className={transactionForm.type === 'تسليم' ? 'active' : ''} onClick={() => setTransactionForm(p => ({ ...p, type: 'تسليم' }))}>تسليم</button>
                            <button type="button" className={transactionForm.type === 'استلام' ? 'active' : ''} onClick={() => setTransactionForm(p => ({ ...p, type: 'استلام' }))}>استلام</button>
                        </div>
                        <label>
                            الوزن (جرام)
                            <input type="number" name="weight" value={transactionForm.weight} onChange={handleTransactionChange} placeholder="100" required />
                        </label>
                        <label>
                            الوصف
                            <input type="text" name="description" value={transactionForm.description} onChange={handleTransactionChange} placeholder="ذهب عيار 21" />
                        </label>
                        <label>
                            قيمة المصنعية
                            <input type="number" name="manufacturingValue" value={transactionForm.manufacturingValue} onChange={handleTransactionChange} placeholder="100" />
                        </label>
                        <button type="submit" disabled={!selectedMerchant}>إضافة العملية</button>
                    </form>
                </SectionCard>

                <SectionCard title="إضافة تاجر جديد">
                    <form onSubmit={handleAddMerchant} className="section-form">
                        <label>
                            اسم التاجر الجديد
                            <input type="text" value={newMerchantName} onChange={(e) => setNewMerchantName(e.target.value)} placeholder="اسم التاجر" />
                        </label>
                        <button type="submit">إضافة تاجر</button>
                    </form>
                </SectionCard>
            </div>

            {selectedMerchant && (
                <>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="ابحث في تعاملات التاجر (بالوصف)..."
                            value={transactionSearchTerm}
                            onChange={(e) => setTransactionSearchTerm(e.target.value)}
                        />
                    </div>
                    <SectionCard
                        title={`سجل التعاملات مع: ${merchants.find(m => m.id === parseInt(selectedMerchant))?.name}`}
                        headerAction={<button onClick={handleExportDetails} className="button--secondary-small">تصدير Excel</button>}
                    >
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>نوع العملية</th>
                                    <th>الوصف</th>
                                    <th>الوزن (جرام)</th>
                                    <th>قيمة المصنعية</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(t =>
                                        editingTransactionId === t.id ? (
                                            // صف التعديل
                                            <tr key={t.id} className="editing-row">
                                                <td><input type="date" name="date" value={editedData.date} onChange={handleEditFormChange} /></td>
                                                <td>
                                                    <select name="type" value={editedData.type} onChange={handleEditFormChange}>
                                                        <option value="تسليم">تسليم</option>
                                                        <option value="استلام">استلام</option>
                                                    </select>
                                                </td>
                                                <td><input type="text" name="description" value={editedData.description} onChange={handleEditFormChange} /></td>
                                                <td><input type="number" name="weight" value={editedData.weight} onChange={handleEditFormChange} /></td>
                                                <td><input type="number" name="manufacturingValue" value={editedData.manufacturingValue} onChange={handleEditFormChange} /></td>
                                                <td className="actions-cell">
                                                    <button onClick={() => handleUpdateTransaction(t.id)} className="button--success-small">حفظ</button>
                                                    <button onClick={handleCancelEdit} className="button--secondary-small">إلغاء</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            // الصف العادي
                                            <tr key={t.id}>
                                                <td>{t.date}</td>
                                                <td className={t.type === 'تسليم' ? 'delivery' : 'receipt'}>{t.type}</td>
                                                <td>{t.description}</td>
                                                <td>{t.weight}</td>
                                                <td>{parseFloat(t.manufacturingValue || 0).toFixed(2)}</td>
                                                <td className="actions-cell">
                                                    <button onClick={() => handleStartEdit(t)} className="button--secondary-small">
                                                        تعديل
                                                    </button>
                                                    <button onClick={() => handleDeleteTransaction(t.id)} className="button--danger-small">
                                                        حذف
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-cell">لا توجد تعاملات مسجلة مع هذا التاجر.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </SectionCard>
                </>
            )}
        </div>
    );
};

export default ScrapManagementPage;