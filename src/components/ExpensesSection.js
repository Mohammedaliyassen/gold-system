import React, { useState, useMemo } from 'react';
import SectionCard from "./SectionCard";
import { exportToExcel } from './exportToExcel';

const ExpensesSection = ({ entries, onEntriesChange }) => {
    const today = new Date().toISOString().split('T')[0];
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        date: today,
        category: "",
        amount: "",
        note: "",
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (event) => {
        const { name, value } = event.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!formData.category || !formData.amount) {
            return;
        }
        onEntriesChange((prevEntries) => [
            ...prevEntries,
            { ...formData, id: Date.now().toString() },
        ]);
        setFormData({ date: today, category: "", amount: "", note: "" });
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
        const updatedEntries = entries.map(entry =>
            entry.id === id ? editedData : entry
        );
        onEntriesChange(updatedEntries);
        handleCancelEdit();
    };

    const handleDeleteEntry = (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الإدخال؟")) {
            const filteredEntries = entries.filter(entry => entry.id !== id);
            onEntriesChange(filteredEntries);
        }
    };

    const handleClearAll = () => {
        if (window.confirm("هل أنت متأكد من رغبتك في حذف جميع المصروفات؟")) {
            onEntriesChange([]);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredEntries.map(entry => ({
            'التاريخ': entry.date,
            'الفئة': entry.category,
            'المبلغ (جنيه)': entry.amount,
            'ملاحظات': entry.note
        }));
        // The function will export the currently filtered data
        exportToExcel(dataToExport, 'تقرير_المصروفات');
    };

    const filteredEntries = useMemo(() => {
        if (!searchTerm) {
            return entries;
        }
        return entries.filter(entry =>
            (entry.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (entry.note?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm]);

    return (
        <SectionCard title="المصروفات اليومية">
            <form className="section-form" onSubmit={handleSubmit}>
                <label>
                    التاريخ
                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                </label>
                <label>
                    الفئة
                    <input name="category" type="text" value={formData.category} onChange={handleInputChange} placeholder="إيجار" required />
                </label>
                <label>
                    المبلغ (جنيه)
                    <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="500" required />
                </label>
                <label>
                    ملاحظات
                    <input name="note" type="text" value={formData.note} onChange={handleInputChange} placeholder="مصروفات إدارية" />
                </label>
                <div className="section-form__actions">
                    <button type="submit">إضافة مصروف</button>
                    <button type="button" onClick={handleClearAll} className="button--danger">حذف كل المصروفات</button>
                    <button type="button" onClick={handleExport} className="button--secondary">تصدير إلى Excel</button>
                </div>
            </form>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="ابحث في المصروفات (بالفئة أو الملاحظات)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الفئة</th>
                        <th>المبلغ (جنيه)</th>
                        <th>ملاحظات</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEntries.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="empty-cell">لم يتم تسجيل مصروفات بعد.</td>
                        </tr>
                    ) : (
                        filteredEntries.map((entry) =>
                            editingId === entry.id ? (
                                <tr key={entry.id} className="editing-row">
                                    <td><input type="date" name="date" value={editedData.date} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="category" value={editedData.category} onChange={handleEditInputChange} /></td>
                                    <td><input type="number" name="amount" value={editedData.amount} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="note" value={editedData.note} onChange={handleEditInputChange} /></td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleUpdateEntry(entry.id)} className="button--success-small">حفظ</button>
                                        <button onClick={handleCancelEdit} className="button--secondary-small">إلغاء</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الفئة">{entry.category}</td>
                                    <td data-label="المبلغ">{entry.amount}</td>
                                    <td data-label="ملاحظات">{entry.note || '-'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleStartEdit(entry)} className="button--secondary-small">
                                            تعديل
                                        </button>
                                        <button onClick={() => handleDeleteEntry(entry.id)} className="button--danger-small">
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            )
                        )
                    )}
                </tbody>
            </table>
        </SectionCard>
    );
};

export default ExpensesSection;