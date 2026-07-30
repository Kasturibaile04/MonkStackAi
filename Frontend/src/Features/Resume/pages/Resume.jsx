import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import '../styles/Resume.scss';
import { useResume } from '../hooks/useResume';


const Resume = () => {
    const navigate = useNavigate();
    const { resumeId } = useParams();
    const { resume: roastData, loading, handleGetResumeReport } = useResume();

    useEffect(() => {
        // Fetch the report if we don't have it in context, or if the ID doesn't match
        if (!roastData || roastData._id !== resumeId) {
            handleGetResumeReport(resumeId);
        }
    }, [resumeId]);

    // Replicate the micro-interaction for the stamp
    useEffect(() => {
        const handleMouseMove = (e) => {
            const stamp = document.querySelector('.stamp-roasted');
            if (!stamp) return;
            const x = (window.innerWidth / 2 - e.pageX) / 80;
            const y = (window.innerHeight / 2 - e.pageY) / 80;
            stamp.style.transform = `rotate(-8deg) translate(${x}px, ${y}px)`;
        };

        if (!loading && roastData) {
            document.addEventListener('mousemove', handleMouseMove);
            return () => document.removeEventListener('mousemove', handleMouseMove);
        }
    }, [loading, roastData]);

    const getIconForSection = (sectionName) => {
        switch ((sectionName || "").toLowerCase()) {
            case 'experience': return 'work';
            case 'skills': return 'psychology';
            case 'education': return 'school';
            case 'summary': return 'person';
            default: return 'article';
        }
    };

    if (loading || !roastData) {
        return (
            <div className='resume-audit-page'>
                <nav className='resume-nav'>
                    <div className='brand'>
                        <span className='material-symbols-outlined brand-icon'>bolt</span>
                        <span className='brand-name'>MONKSTACK</span>
                    </div>
                </nav>
                <main className="resume-main-content flex items-center justify-center p-20" style={{ textAlign: 'center', paddingTop: '160px' }}>
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif" }}>{loading ? "ANALYZING RESUME & PREPARING ROAST..." : "LOADING REPORT..."}</h2>
                </main>
            </div>
        );
    }

    return (
        <div className='resume-audit-page'>
            {/* Top Nav */}
            <nav className='resume-nav'>
                <div className='brand'>
                    <span className='material-symbols-outlined brand-icon'>bolt</span>
                    <span className='brand-name'>MONKSTACK</span>
                </div>
                <button className='nav-btn-new' onClick={() => navigate('/home')}>BUILD RESUME</button>
            </nav>

            <main className="resume-main-content">
                {/* Executive Summary Header */}
                <section className="executive-summary">
                    <div className="bg-shape"></div>
                    <div className="summary-content">
                        <div className="summary-info">
                            <div className="summary-label">
                                <span className="label-bar"></span>
                                Executive Summary
                            </div>
                            <h1 className="audit-title">
                                RESUME AUDIT:<br />
                                <span className="candidate-name">{roastData.candidate_name || "UNKNOWN"}</span>
                            </h1>
                            <p className="candidate-role">{roastData.position_applied || "TARGET ROLE MISSING"}</p>
                        </div>

                        <div className="score-widget">
                            <div className="score-details">
                                <p className="score-label">CANDIDATE SCORE</p>
                                <div className="score-numbers">
                                    <span className="score-value">{roastData.overall_score || "0"}</span>
                                    <span className="score-max">/10</span>
                                </div>
                            </div>
                            <div className="stamp-roasted">ROASTED</div>
                        </div>
                    </div>
                </section>

                {/* High-Impact Opening */}
                <section className="opening-jab-section">
                    <blockquote>
                        <span className="material-symbols-outlined quote-icon">format_quote</span>
                        <h2 className="jab-text">
                            "{roastData.opening_jab}"
                        </h2>
                        <cite className="jab-citation">
                            <span className="citation-bar"></span> THE OPENING JAB
                        </cite>
                    </blockquote>
                    <p style={{ marginTop: '24px', fontWeight: 500, lineHeight: 1.6, fontSize: '15px' }}>
                        <strong>Reality Check:</strong> {roastData.self_description_reality_check} <br />
                        <em>"{roastData.backhanded_compliment}"</em>
                    </p>
                </section>

                {/* Roast Feed - Structured Grid */}
                {roastData.section_roasts && roastData.section_roasts.length > 0 && (
                    <section className="roast-grid">
                        {roastData.section_roasts.map((item, index) => (
                            <div className="roast-card" key={index}>
                                <div className="card-header">
                                    <h3>
                                        <span className="card-num">{(index + 1).toString().padStart(2, '0')}</span>
                                        {item.section}
                                    </h3>
                                    <span className="material-symbols-outlined card-icon">
                                        {getIconForSection(item.section)}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="content-block">
                                        <p className="block-label">Original Content</p>
                                        <div className="original-quote">"{item.quote}"</div>
                                    </div>
                                    <div className="content-block">
                                        <p className="block-label error">The Critique</p>
                                        <p className="critique-text">{item.roast}</p>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <p className="block-label primary">The Optimization</p>
                                    <p className="optimization-text">{item.fix}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Roadmap to Success */}
                {roastData.real_fixes && roastData.real_fixes.length > 0 && (
                    <section className="roadmap-section">
                        <div className="roadmap-outer">
                            <div className="roadmap-inner">
                                <div className="roadmap-header">
                                    <div className="roadmap-title-group">
                                        <h2>ROADMAP TO SUCCESS</h2>
                                        <p>CRITICAL REMEDIATION STEPS</p>
                                    </div>
                                    <div className="status-badge">STATUS: ACTION REQUIRED</div>
                                </div>
                                <div className="roadmap-steps">
                                    {roastData.real_fixes.map((fix, index) => (
                                        <div className="roadmap-step" key={index}>
                                            <div className="step-num">{index + 1}</div>
                                            <div className="step-content">
                                                <h4>Fix #{index + 1}</h4>
                                                <p>{fix}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Final CTA */}
                <section className="final-cta">
                    <h2 style={{ fontSize: '24px', letterSpacing: '0', maxWidth: '80%', margin: '0 auto 32px' }}>
                        "{roastData.closing_line}"
                    </h2>
                    <button className="reupload-btn" onClick={() => navigate('/home')}>
                        <span className="material-symbols-outlined">upload_file</span>
                        RE-UPLOAD RESUME
                    </button>
                </section>
            </main>

            <footer className="resume-footer">
                <div className="footer-content">
                    <div className="footer-brandbox">
                        <div className="footer-brand">MONKSTACK AI</div>
                        <div className="footer-tagline">BEYOND THE BUZZWORDS.</div>
                    </div>
                    <div className="footer-links-box">
                        <div className="footer-links">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Twitter</a>
                        </div>
                        <div className="footer-copyright">© 2026 MONKSTACK AI. STAY DIRECT.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Resume;
