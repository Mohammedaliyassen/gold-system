import React, { useState } from "react";
import SectionCard from "./SectionCard";

const PurchasesSection = ({ entries, onEntriesChange }) => {
    const [formData, setFormData] = useState({
        description: "",
        weight: "",
        cost: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

        setFormData({ description: "", weight: "", cost: "" });
    };

    return (
        <SectionCard title="المشتريات اليومية">
            <form className="section-form" onSubmit={handleSubmit}>
                <label>
                    وصف القطعة
                    <input
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="غوايش قديمة"
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
                        onChange={handleChange}
                        placeholder="8"
                    />
                </label>
                <label>
                    التكلفة (جنيه)
                    <input
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="1500"
                    />
                </label>
                <button type="submit">إضافة عملية شراء</button>
            </form>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>الوصف</th>
                        <th>الوزن (جرام)</th>
                        <th>التكلفة (جنيه)</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="empty-cell">لم يتم تسجيل مشتريات بعد.</td>
                        </tr>
                    ) : (
                        entries.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.description}</td>
                                <td>{entry.weight}</td>
                                <td>{entry.cost}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </SectionCard>
    );
};

export default PurchasesSection;