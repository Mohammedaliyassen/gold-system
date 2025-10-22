import React, { useState } from 'react';
import SalesSection from './SalesSection';
import PurchasesSection from './PurchasesSection';
import ExpensesSection from './ExpensesSection';
import './Dashboard.css';

const Dashboard = ({
  totals,
  salesEntries,
  onSalesEntriesChange,
  purchaseEntries,
  onPurchaseEntriesChange,
  expenseEntries,
  onExpenseEntriesChange,
}) => {
  const [activeSection, setActiveSection] = useState('sales'); // 'sales', 'purchases', 'expenses'

  const renderSection = () => {
    switch (activeSection) {
      case 'sales':
        return <SalesSection entries={salesEntries} onEntriesChange={onSalesEntriesChange} />;
      case 'purchases':
        return <PurchasesSection entries={purchaseEntries} onEntriesChange={onPurchaseEntriesChange} />;
      case 'expenses':
        return <ExpensesSection entries={expenseEntries} onEntriesChange={onExpenseEntriesChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="summary-grid dashboard-summary">
        <div className="summary-card">
          <h3>إجمالي المبيعات اليومية</h3>
          <p className="summary-value">{totals.salesTotal.toFixed(2)} جنيه</p>
        </div>
        <div className="summary-card">
          <h3>إجمالي المشتريات اليومية</h3>
          <p className="summary-value">{totals.purchaseTotal.toFixed(2)} جنيه</p>
        </div>
        <div className="summary-card">
          <h3>إجمالي المصروفات اليومية</h3>
          <p className="summary-value">{totals.expenseTotal.toFixed(2)} جنيه</p>
        </div>
      </div>

      <div className="dashboard-nav">
        <button
          onClick={() => setActiveSection('sales')}
          className={`dashboard-nav-button ${activeSection === 'sales' ? 'active' : ''}`}
        >
          المبيعات
        </button>
        <button
          onClick={() => setActiveSection('purchases')}
          className={`dashboard-nav-button ${activeSection === 'purchases' ? 'active' : ''}`}
        >
          المشتريات
        </button>
        <button
          onClick={() => setActiveSection('expenses')}
          className={`dashboard-nav-button ${activeSection === 'expenses' ? 'active' : ''}`}
        >
          المصروفات
        </button>
      </div>
      <div className="dashboard-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default Dashboard;