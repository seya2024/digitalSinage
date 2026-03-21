import React from 'react';
import './Footer.css';

const Footer = ({ 
    showCopyright = true, 
    showDeveloper = true,
    developerName = "Seid Mohammed",
    developerRole = "Senior Software Engineer"
}) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                {showCopyright && (
                    <div className="footer-copyright">
                        <i className="fas fa-copyright"></i>
                        <span>{currentYear} - {currentYear} Dashen Bank SC | All Rights Reserved</span>
                    </div>
                )}
                
                {showDeveloper && (
                    <div className="footer-developer-wrapper">
                        <div className="footer-developer">
                            <i className="fas fa-code"></i>
                            <span>Developed by : {developerName}</span>
                        </div>
                        <div className="developer-photo-tooltip">
                            <img 
                                src="/developer.jpg" 
                                alt={developerName}
                                className="developer-photo"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/250x150/003366/white?text=SM";
                                }}
                            />
                            <div className="tooltip-info">
                                <h4>{developerName}</h4>
                                <p>{developerRole}</p>
                                <div className="developer-bio">
                                    Passionate developer creating innovative business solutions for Dashen Bank
                                </div>
                                <div className="social-links">
                                    <a href="#" target="_blank" rel="noopener noreferrer" title="GitHub">
                                        <i className="fab fa-github"></i>
                                    </a>
                                    <a href="#" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                        <i className="fab fa-linkedin"></i>
                                    </a>
                                    <a href="#" target="_blank" rel="noopener noreferrer" title="Twitter">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                    <a href="mailto:seid@dashenbank.com" title="Email">
                                        <i className="fas fa-envelope"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;