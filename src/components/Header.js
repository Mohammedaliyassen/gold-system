import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiArchive, FiRepeat, FiBarChart2, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="app-header">
            <div className="app-header__logo">
                <h1>نظام إدارة الذهب</h1>
            </div>
            <nav className="main-nav">
                <NavLink to="/" end><FiGrid /> <span>اللوحة اليومية</span></NavLink>
                <NavLink to="/inventory"><FiArchive /> <span>الجرد</span></NavLink>
                <NavLink to="/scrap"><FiRepeat /> <span>إدارة الكسر</span></NavLink>
                <NavLink to="/reports"><FiBarChart2 /> <span>التقارير</span></NavLink>
                <NavLink to="/settings"><FiSettings /> <span>الإعدادات</span></NavLink>
            </nav>
            <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </div>
            <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                <NavLink onClick={toggleMobileMenu} to="/" end><FiGrid /> اللوحة اليومية</NavLink>
                <NavLink onClick={toggleMobileMenu} to="/inventory"><FiArchive /> الجرد</NavLink>
                <NavLink onClick={toggleMobileMenu} to="/scrap"><FiRepeat /> إدارة الكسر</NavLink>
                <NavLink onClick={toggleMobileMenu} to="/reports"><FiBarChart2 /> التقارير</NavLink>
                <NavLink onClick={toggleMobileMenu} to="/settings"><FiSettings /> الإعدادات</NavLink>
            </nav>
        </header>
    );
};

export default Header;