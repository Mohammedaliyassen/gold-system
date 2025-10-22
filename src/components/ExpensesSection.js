import React, { useState, useMemo } from 'react';
import SectionCard from './SectionCard';
import { exportToExcel } from '../utils/exportToExcel';

const ExpensesSection = ({ entries, onEntriesChange }) => {
    const today = new Date().toISOString().split('T')[0];
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: today,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;
        onEntriesChange(prev => [...prev, { ...formData, id: Date.now().toString() }]);
        setFormData({ description: '', amount: '', date: today });
    };

    const handleStartEdit = (entry) => {
        setEditingId(entry.id);
        setEditedData(entry);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedData({});
    };

    const handleUpdateEntry = (id) => {
        onEntriesChange(prev => prev.map(entry => entry.id === id ? editedData : entry));
        handleCancelEdit();
    };

    const handleDeleteEntry = (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
            onEntriesChange(prev => prev.filter(entry => entry.id !== id));
        }
    };

    const handleExport = () => {
        const dataToExport = filteredEntries.map(entry => ({
            'التاريخ': entry.date,
            'بيان المصروف': entry.description,
            'المبلغ (جنيه)': entry.amount,
        }));
        exportToExcel(dataToExport, 'تقرير_المصروفات');
    };

    const filteredEntries = useMemo(() => {
        if (!searchTerm) return entries;
        return entries.filter(entry =>
            (entry.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (entry.date?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm]);

    const totalAmount = useMemo(() => {
        return filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
    }, [filteredEntries]);

    return (
        <SectionCard title="المصروفات اليومية">
            <form className="section-form" onSubmit={handleSubmit}>
                <label>
                    التاريخ
                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                </label>
                <label>
                    بيان المصروف
                    <input name="description" type="text" value={formData.description} onChange={handleInputChange} placeholder="إيجار المحل" required />
                </label>
                <label>
                    المبلغ (جنيه)
                    <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="500" required />
                </label>
                <div className="section-form__actions">
                    <button type="submit">إضافة مصروف</button>
                    <button type="button" onClick={handleExport} className="button--secondary">تصدير إلى Excel</button>
                </div>
            </form>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="ابحث في المصروفات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>البيان</th>
                        <th>المبلغ (جنيه)</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEntries.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="empty-cell">لم يتم تسجيل مصروفات بعد.</td>
                        </tr>
                    ) : (
                        filteredEntries.map(entry => (
                            editingId === entry.id ? (
                                <tr key={entry.id} className="editing-row">
                                    <td><input type="date" name="date" value={editedData.date} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="description" value={editedData.description} onChange={handleEditInputChange} /></td>
                                    <td><input type="number" name="amount" value={editedData.amount} onChange={handleEditInputChange} /></td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleUpdateEntry(entry.id)} className="button--success-small">حفظ</button>
                                        <button onClick={handleCancelEdit} className="button--secondary-small">إلغاء</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="البيان">{entry.description}</td>
                                    <td data-label="المبلغ">{entry.amount}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleStartEdit(entry)} className="button--secondary-small">تعديل</button>
                                        <button onClick={() => handleDeleteEntry(entry.id)} className="button--danger-small">حذف</button>
                                    </td>
                                </tr>
                            )
                        ))
                    )}
                </tbody>
                <tfoot>
                    <tr className="totals-row">
                        <td colSpan="2">الإجمالي</td>
                        <td data-label="إجمالي المبلغ">{totalAmount.toFixed(2)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </SectionCard>
    );
};

export default ExpensesSection;