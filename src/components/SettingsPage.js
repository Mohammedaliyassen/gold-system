import React from 'react';
import SectionCard from './SectionCard';
import './SettingsPage.css';

const SettingsPage = () => {

    const handleBackup = () => {
        try {
            const backupData = {};
            const keysToBackup = [
                'salesEntries',
                'purchaseEntries',
                'expenseEntries',
                'pricing',
                'merchants',
                'scrapTransactions',
                'openingGoldBalance'
            ];

            keysToBackup.forEach(key => {
                const data = localStorage.getItem(key);
                // We store even if it's null to represent that state
                backupData[key] = data ? JSON.parse(data) : null;
            });

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `gold-system-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert('تم إنشاء ملف النسخ الاحتياطي بنجاح!');
        } catch (error) {
            console.error("Error during backup:", error);
            alert("حدث خطأ أثناء إنشاء النسخة الاحتياطية.");
        }
    };

    const handleRestore = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (!window.confirm("تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في ملف النسخ الاحتياطي. هل أنت متأكد من المتابعة؟")) {
            event.target.value = null; // Reset the file input
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const restoredData = JSON.parse(e.target.result);
                Object.keys(restoredData).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(restoredData[key]));
                });
                alert("تم استعادة البيانات بنجاح! سيتم إعادة تحميل التطبيق الآن.");
                window.location.reload(); // Reload to apply changes
            } catch (error) {
                console.error("Error during restore:", error);
                alert("فشل في استعادة البيانات. الرجاء التأكد من أن الملف صحيح.");
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Reset the file input
    };

    return (
        <div className="settings-page">
            <h2>الإعدادات والنسخ الاحتياطي</h2>
            <SectionCard title="النسخ الاحتياطي والاستعادة">
                <div className="settings-actions">
                    <button onClick={handleBackup} className="button--primary">إنشاء نسخة احتياطية</button>
                    <label htmlFor="restore-input" className="button--secondary">استعادة البيانات</label>
                    <input id="restore-input" type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
                </div>
                <p className="settings-note">احتفظ بملف النسخ الاحتياطي في مكان آمن. عند الاستعادة، سيتم استبدال جميع البيانات الحالية.</p>
            </SectionCard>
        </div>
    );
};

export default SettingsPage;