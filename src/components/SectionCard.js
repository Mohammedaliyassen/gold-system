import React from "react";

const SectionCard = ({ title, children, headerAction }) => {
    return (
        <article className="section-card">
            <header className="section-card__header">
                <h3>{title}</h3>
                {headerAction && <div className="section-card__header-action">{headerAction}</div>}
            </header>
            <div className="section-card__content">{children}</div>
        </article>
    );
};

export default SectionCard;