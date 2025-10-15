import React, { useState, useMemo } from 'react';
import SectionCard from "./SectionCard";
import { exportToExcel } from './exportToExcel';

const PurchaseSection = ({ entries, onEntriesChange }) => {
    const today = new Date().toISOString().split('T')[0];
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        description: "",
        weight: "",
        cost: "",
        date: today,
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
        if (!formData.description || !formData.weight || !formData.cost) {
            return;
        }
        onEntriesChange((prevEntries) => [
            ...prevEntries,
            { ...formData, id: Date.now().toString() },
        ]);
        setFormData({ description: "", weight: "", cost: "", date: today });
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
        if (window.confirm("هل أنت متأكد من رغبتك في حذف جميع المشتريات؟")) {
            onEntriesChange([]);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredEntries.map(entry => ({
            'التاريخ': entry.date,
            'الوصف': entry.description,
            'الوزن (جرام)': entry.weight,
            'التكلفة (جنيه)': entry.cost
        }));
        // The function will export the currently filtered data
        exportToExcel(dataToExport, 'تقرير_المشتريات');
    };

    const filteredEntries = useMemo(() => {
        if (!searchTerm) {
            return entries;
        }
        return entries.filter(entry =>
            entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.date.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm]);

    return (
        <SectionCard title="المشتريات اليومية">
            <form className="section-form" onSubmit={handleSubmit}>
                <label>
                    التاريخ
                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                </label>
                <label>
                    وصف القطعة
                    <input name="description" type="text" value={formData.description} onChange={handleInputChange} placeholder="ذهب كسر" />
                </label>
                <label>
                    الوزن (جرام)
                    <input name="weight" type="number" min="0" step="0.01" value={formData.weight} onChange={handleInputChange} placeholder="50" />
                </label>
                <label>
                    التكلفة (جنيه)
                    <input name="cost" type="number" min="0" step="0.01" value={formData.cost} onChange={handleInputChange} placeholder="10000" />
                </label>
                <div className="section-form__actions">
                    <button type="submit">إضافة عملية شراء</button>
                    <button type="button" onClick={handleClearAll} className="button--danger">حذف كل المشتريات</button>
                    <button type="button" onClick={handleExport} className="button--secondary">تصدير إلى Excel</button>
                </div>
            </form>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="ابحث في المشتريات (بالوصف أو التاريخ)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                        <th>الوزن (جرام)</th>
                        <th>التكلفة (جنيه)</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEntries.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="empty-cell">لم يتم تسجيل مشتريات بعد.</td>
                        </tr>
                    ) : (
                        filteredEntries.map((entry) =>
                            editingId === entry.id ? (
                                <tr key={entry.id} className="editing-row">
                                    <td><input type="date" name="date" value={editedData.date} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="description" value={editedData.description} onChange={handleEditInputChange} /></td>
                                    <td><input type="number" name="weight" value={editedData.weight} onChange={handleEditInputChange} /></td>
                                    <td><input type="number" name="cost" value={editedData.cost} onChange={handleEditInputChange} /></td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleUpdateEntry(entry.id)} className="button--success-small">حفظ</button>
                                        <button onClick={handleCancelEdit} className="button--secondary-small">إلغاء</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الوصف">{entry.description}</td>
                                    <td data-label="الوزن (جرام)">{entry.weight}</td>
                                    <td data-label="التكلفة">{entry.cost}</td>
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

export default PurchaseSection;