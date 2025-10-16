import React, { useState, useMemo } from 'react';
import SectionCard from "./SectionCard";
import { exportToExcel } from './exportToExcel';

const SalesSection = ({ entries, onEntriesChange }) => {
    const today = new Date().toISOString().split('T')[0];
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        description: "",
        weight: "",
        karat: "21",
        customerPhone: "",
        customerName: "",
        finalPrice: "",
        amountPaid: "",
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
        if (!formData.description || !formData.weight || !formData.finalPrice) {
            return;
        }

        onEntriesChange((prevEntries) => [
            ...prevEntries,
            // إذا كان المبلغ المدفوع فارغاً، نعتبر أن السعر النهائي هو المبلغ المدفوع
            { ...formData, id: Date.now().toString(), amountPaid: formData.amountPaid || formData.finalPrice },
        ]);
        setFormData({ description: "", weight: "", karat: "21", finalPrice: "", amountPaid: "", date: today, customerName: "", customerPhone: "" }); // Reset all fields

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
        if (window.confirm("هل أنت متأكد من رغبتك في حذف جميع المبيعات؟")) {
            onEntriesChange([]);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredEntries.map(entry => ({
            'التاريخ': entry.date,
            'الوصف': entry.description,
            'الوزن (جرام)': entry.weight,
            'العيار': entry.karat,
            'اسم العميل': entry.customerName,
            'رقم هاتف العميل': entry.customerPhone,
            'السعر النهائي (جنie)': entry.finalPrice,
            'المبلغ المدفوع (جنيه)': entry.amountPaid,
            'المبلغ المتبقي (جنيه)': (parseFloat(entry.finalPrice || 0) - parseFloat(entry.amountPaid || 0)).toFixed(2)
        }));
        // The function will export the currently filtered data
        exportToExcel(dataToExport, 'تقرير_المبيعات');
    };

    const filteredEntries = useMemo(() => {
        if (!searchTerm) {
            return entries;
        }
        return entries.filter(entry =>
            (entry.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (entry.date?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (entry.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm]);

    return (
        <SectionCard title="المبيعات اليومية">
            <form className="section-form" onSubmit={handleSubmit}>
                <label>

                    التاريخ
                    <input
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>

                    اسم العميل
                    <input
                        name="customerName"
                        type="text"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="اسم العميل"
                    />
                </label>
                <label>
                    رقم هاتف العميل
                    <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} placeholder="رقم الهاتف" />
                </label>
                <label>

                    وصف القطعة
                    <input
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="قلادة مع فصوص"
                    />
                </label>
                <label>
                    الوزن (جرام)
                    <input
                        name="weight"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="10"
                    />
                </label>
                <label>
                    العيار
                    <select className="karat" name="karat" value={formData.karat} onChange={handleInputChange}>
                        <option value="24">24</option>
                        <option value="22">22</option>
                        <option value="21">21</option>
                        <option value="18">18</option>
                    </select>
                </label>
                <label>
                    السعر النهائي (جنيه)
                    <input
                        name="finalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.finalPrice}
                        onChange={handleInputChange}
                        placeholder="2500"
                    />
                </label>
                <label>
                    المبلغ المدفوع (جنيه)
                    <input
                        name="amountPaid"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amountPaid}
                        onChange={handleInputChange}
                        placeholder="اتركه فارغاً للدفع الكامل"
                    />
                </label>
                <div className="section-form__actions">
                    <button type="submit">إضافة عملية بيع</button>
                    <button type="button" onClick={handleClearAll} className="button--danger">حذف كل المبيعات</button>
                    <button type="button" onClick={handleExport} className="button--secondary">تصدير إلى Excel</button>


                </div>
            </form>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="ابحث في المبيعات (بالوصف, التاريخ, أو اسم العميل)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                        <th>اسم العميل </th>
                        <th>رقم هاتف العميل</th>
                        <th>الوزن (جرام)</th>
                        <th>العيار</th>

                        <th>السعر النهائي</th>
                        <th>المدفوع</th>
                        <th>المتبقي</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEntries.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="empty-cell">لم يتم تسجيل مبيعات بعد.</td>
                        </tr>
                    ) : (
                        filteredEntries.map((entry) =>
                            editingId === entry.id ? (
                                <tr key={entry.id} className="editing-row"> {/* Keep as is for simplicity during edit */}
                                    <td><input type="date" name="date" value={editedData.date} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="description" value={editedData.description} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="customerName" value={editedData.customerName} onChange={handleEditInputChange} /></td>
                                    <td><input type="text" name="customerPhone" value={editedData.customerPhone} onChange={handleEditInputChange} /></td>
                                    <td><input type="number" name="weight" value={editedData.weight} onChange={handleEditInputChange} /></td>
                                    <td>
                                        <select name="karat" value={editedData.karat || '21'} onChange={handleEditInputChange}>
                                            <option value="24">24</option>
                                            <option value="22">22</option>
                                            <option value="21">21</option>
                                            <option value="18">18</option>
                                        </select>
                                    </td>
                                    <td><input type="number" name="finalPrice" value={editedData.finalPrice} onChange={handleEditInputChange} /></td>
                                    <td><input type="number" name="amountPaid" value={editedData.amountPaid} onChange={handleEditInputChange} /></td>
                                    <td>{(parseFloat(editedData.finalPrice || 0) - parseFloat(editedData.amountPaid || 0)).toFixed(2)}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleUpdateEntry(entry.id)} className="button--success-small">حفظ</button>
                                        <button onClick={handleCancelEdit} className="button--secondary-small">إلغاء</button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={entry.id}>
                                    <td data-label="التاريخ">{entry.date}</td>
                                    <td data-label="الوصف">{entry.description}</td>
                                    <td data-label="اسم العميل">{entry.customerName}</td>
                                    <td data-label="رقم الهاتف">{entry.customerPhone}</td>
                                    <td data-label="الوزن (جرام)">{entry.weight}</td>
                                    <td data-label="العيار">{entry.karat || 'N/A'}</td>
                                    <td data-label="السعر النهائي">{parseFloat(entry.finalPrice || 0).toFixed(2)}</td>
                                    <td data-label="المدفوع">{parseFloat(entry.amountPaid || 0).toFixed(2)}</td>
                                    <td data-label="المتبقي" className={(parseFloat(entry.finalPrice || 0) - parseFloat(entry.amountPaid || 0)) > 0 ? 'debt-amount' : ''}>{(parseFloat(entry.finalPrice || 0) - parseFloat(entry.amountPaid || 0)).toFixed(2)}</td>
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


export default SalesSection;