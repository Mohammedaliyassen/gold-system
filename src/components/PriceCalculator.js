import React, { useState, useMemo } from "react";
import "./PriceCalculator.css";

const PriceCalculator = ({ pricing, onPricingChange, onSalesEntriesChange }) => {
    const today = new Date().toISOString().split('T')[0];
    const [weight, setWeight] = useState('');
    const [karat, setKarat] = useState(21);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [quickSaleData, setQuickSaleData] = useState({
        description: '',
        date: today,
    });

    const handlePricingChange = (event) => {
        const { name, value } = event.target;
        onPricingChange((prevPricing) => ({
            ...prevPricing,
            [name]: value === "" ? "" : parseFloat(value),
        }));
    };

    const handleQuickSaleChange = (event) => {
        const { name, value } = event.target;
        setQuickSaleData(prev => ({ ...prev, [name]: value }));
    };

    const finalPrice = useMemo(() => {
        const price21 = parseFloat(pricing.goldPricePerGram) || 0;
        const manufacturing = parseFloat(pricing.manufacturingCostPerGram) || 0;
        const vat = parseFloat(pricing.vatPercentage) || 0;
        const parsedWeight = parseFloat(weight) || 0;
        const selectedKarat = parseInt(karat) || 21;

        // Adjust price based on selected Karat, assuming the base price is for 21K
        const adjustedGoldPrice = (price21 * selectedKarat) / 21;

        const base = parsedWeight * adjustedGoldPrice;
        const manufacturingCost = parsedWeight * manufacturing;
        const vatAmount = (base * vat) / 100;

        return base + manufacturingCost + vatAmount;
    }, [pricing, weight, karat]);

    const handleQuickSale = () => {
        if (!weight || !finalPrice || !quickSaleData.description) {
            alert("الرجاء إدخال الوزن والوصف للتأكد من صحة البيانات.");
            return;
        }

        const newSaleEntry = {
            id: Date.now().toString(),
            date: quickSaleData.date,
            description: quickSaleData.description,
            weight: weight,
            karat: karat,
            customerName: customerName,
            customerPhone: customerPhone,
            finalPrice: finalPrice.toFixed(2),
            amountPaid: amountPaid || finalPrice.toFixed(2), // إذا كان فارغاً، يعتبر المبلغ كاملاً
        };

        onSalesEntriesChange(prev => [...prev, newSaleEntry]);

        // Reset fields
        setWeight('');
        setKarat(21);
        setCustomerName('');
        setCustomerPhone('');
        setAmountPaid('');
        setQuickSaleData({ description: '', date: today });
        alert("تمت إضافة عملية البيع بنجاح!");
    };

    return (
        <section className="price-calculator">
            <h2>التسعير والآلة الحاسبة</h2>
            <div className="price-calculator__grid">
                <div className="price-calculator__card">
                    <h3>التسعير اليومي</h3>
                    <div className="price-calculator__form">
                        <label>
                            سعر الذهب للجرام (عيار 21)
                            <input
                                name="goldPricePerGram"
                                type="number"
                                min="0"
                                step="0.01"
                                value={pricing.goldPricePerGram}
                                onChange={handlePricingChange}
                                placeholder="2200"
                            />
                        </label>
                        <label>
                            تكلفة المصنعية للجرام
                            <input
                                name="manufacturingCostPerGram"
                                type="number"
                                min="0"
                                step="0.01"
                                value={pricing.manufacturingCostPerGram}
                                onChange={handlePricingChange}
                                placeholder="100"
                            />
                        </label>
                        <label>
                            ضريبة القيمة المضافة (VAT %)
                            <input
                                name="vatPercentage"
                                type="number"
                                min="0"
                                step="0.01"
                                value={pricing.vatPercentage}
                                onChange={handlePricingChange}
                                placeholder="14"
                            />
                        </label>
                    </div>
                </div>

                <div className="price-calculator__card">
                    <h3>حاسبة السعر الفورية</h3>
                    <div className="price-calculator__form instant-calculator-form">
                        <div className="form-row">
                            <label>
                                الوزن (جرام)
                                <input
                                    name="weight"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={weight}
                                    onChange={(event) => setWeight(event.target.value)}
                                    placeholder="5"
                                />
                            </label>
                            <label>
                                العيار
                                <div className="karat-select-container">
                                    <select value={karat} className="karat" onChange={(e) => setKarat(e.target.value)}>
                                        <option value="24">24</option>
                                        <option value="21">21</option>
                                        <option value="18">18</option>
                                    </select>
                                </div>
                            </label>
                        </div>
                        <div className="price-output">
                            <span>السعر النهائي (جنيه)</span>
                            <input type='number' value={finalPrice.toFixed(0)}></input>
                        </div>
                        <hr className="quick-sale-divider" />
                        <label>
                            وصف القطعة
                            <input type="text" name="description" value={quickSaleData.description} onChange={handleQuickSaleChange} placeholder="وصف مختصر للقطعة المباعة" />
                        </label>
                        <label>
                            التاريخ
                            <input type="date" name="date" value={quickSaleData.date} onChange={handleQuickSaleChange} />
                        </label>
                        <label>
                            اسم العميل
                            <input type="text" name="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اسم العميل" />
                        </label>
                        <label>
                            رقم هاتف العميل
                        </label>
                        <label>
                            المبلغ المدفوع (جنيه)
                            <input type="number" name="amountPaid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="اتركه فارغاً للدفع الكامل" />
                        </label>
                        <input type="tel" name="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="رقم الهاتف" />
                        <button type="button" onClick={handleQuickSale} className="button--quick-sale">إضافة عملية البيع</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PriceCalculator;