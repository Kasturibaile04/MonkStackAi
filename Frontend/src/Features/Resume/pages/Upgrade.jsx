import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useResume } from '../hooks/useResume'
import '../styles/Upgrade.scss'

// Reverted NoDataSlot - we use default data until AI populates it

const Upgrade = () => {
    const navigate = useNavigate()
    const { resumeId } = useParams()
    const { resume, loading, handleGetResumeReport, handleGenerateIntel } = useResume()

    // Self-fetch the report if context doesn't have it (e.g. direct URL or page refresh)
    useEffect(() => {
        if (resumeId) {
            if (!resume || resume._id !== resumeId) {
                // We don't have the report yet, fetch it
                handleGetResumeReport(resumeId).catch(console.error)
            } else if (resume && (!resume.upgrade_action_verbs || resume.upgrade_action_verbs.length === 0)) {
                // We have the report, but it's an OLD report missing modern upgrade intel!
                // Trigger AI silently to generate intel and patch the document
                handleGenerateIntel(resumeId).catch(console.error)
            }
        }
    }, [resumeId, resume])

    // Pull AI upgrade fields — strictly real data, no sample fallbacks
    const actionVerbs = resume?.upgrade_action_verbs || []
    const quantifiableData = resume?.upgrade_quantifiable_data || []
    const fluffCutBad = resume?.upgrade_fluff_cut?.bad_chips || []
    const fluffCutGood = resume?.upgrade_fluff_cut?.good_chips || []
    const layoutCrimes = resume?.upgrade_layout_crimes || ""
    const keywordInjection = resume?.upgrade_keyword_injection || []
    const contactClarity = resume?.upgrade_contact_clarity || ""

    const goGenerate = () => navigate('/home')

    if (loading) {
        return (
            <main className='loading-screen1'>
                <h1>Loading your Resume Upgrade..</h1>
            </main>
        )
    }

    // If no report is loaded at all, push the user to generate one
    if (!resume) {
        return (
            <div className='upgrade-page'>
                <header className='upgrade-nav'>
                    <div className='nav-inner'>
                        <div className='brand'>
                            <span className='brand-icon'>🔥</span>
                            <span className='brand-name'>MONKSTACK AI</span>
                        </div>
                        <nav className='nav-links'>
                            <button className='new-roast-btn' onClick={goGenerate}>New Roast</button>
                        </nav>
                    </div>
                </header>
                <main className='upgrade-main' style={{ textAlign: 'center', paddingTop: '120px' }}>
                    <div className='directive-tag'>DIRECTIVE 08-B</div>
                    <h1 className='mission-title' style={{ marginTop: '16px' }}>
                        MISSION: <span className='highlight'>UPGRADE</span>
                    </h1>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#555', marginTop: '16px' }}>
                        No resume report found. Upload your resume first to unlock personalised upgrade intel.
                    </p>
                    <button className='cta-btn' style={{ marginTop: '32px' }} onClick={goGenerate}>
                        UPLOAD RESUME NOW
                    </button>
                </main>
            </div>
        )
    }

    return (
        <div className='upgrade-page'>
            {/* Top Nav */}
            <header className='upgrade-nav'>
                <div className='nav-inner'>
                    <div className='brand'>
                        <span className='brand-icon'>🔥</span>
                        <span className='brand-name'>MONKSTACK AI</span>
                    </div>
                    <nav className='nav-links'>
                        <button className='new-roast-btn' onClick={goGenerate}>New Roast</button>
                    </nav>
                </div>
            </header>

            <main className='upgrade-main'>
                {/* Hero */}
                <section className='upgrade-hero'>
                    <div className='directive-tag'>DIRECTIVE 08-B</div>
                    <h1 className='mission-title'>
                        MISSION: <span className='highlight'>UPGRADE</span>
                    </h1>
                    <p className='mission-subtitle'>
                        PERSONALISED INTEL FOR {(resume.candidate_name || 'YOU').toUpperCase()}
                    </p>
                </section>

                {/* Improvement Grid */}
                <div className='upgrade-grid'>

                    {/* 1. Action Verbs */}
                    <div className='upgrade-card'>
                        <div className='card-top'><h3>ACTION VERBS</h3></div>
                        <div className='card-divider' />
                        <p className='card-desc'>Stop sounding like a passive bystander. Use words that command authority.</p>
                        <div className='example-box'>
                            {actionVerbs.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <div className='example-bad'>
                                        <span className='icon-x'>✕</span>
                                        <span>"{item.bad}"</span>
                                    </div>
                                    <div className='example-good'>
                                        <span className='icon-check'>✓</span>
                                        <span>"<strong className='hl'>{item.good.split(' ')[0]}</strong> {item.good.split(' ').slice(1).join(' ')}"</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* 2. Quantifiable Data */}
                    <div className='upgrade-card'>
                        <div className='card-top'><h3>QUANTIFIABLE DATA</h3></div>
                        <div className='card-divider' />
                        <p className='card-desc'>Vague results are invisible. Use numbers to prove your worth.</p>
                        <div className='example-box'>
                            {quantifiableData.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <div className='example-bad'>
                                        <span className='icon-x'>✕</span>
                                        <span>"{item.bad}"</span>
                                    </div>
                                    <div className='example-good'>
                                        <span className='icon-check'>✓</span>
                                        <span>"<strong className='hl'>{item.good}</strong>"</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* 3. The Fluff Cut */}
                    <div className='upgrade-card'>
                        <div className='card-top'><h3>THE FLUFF CUT</h3></div>
                        <div className='card-divider' />
                        <p className='card-desc'>Everyone is a "hard worker." Tell them exactly what you can actually do.</p>
                        <div className='chip-row'>
                            {fluffCutBad.map((chip, idx) => (
                                <span key={`bad-${idx}`} className='chip chip-bad'>{chip}</span>
                            ))}
                            <span className='arrow'>→</span>
                            {fluffCutGood?.map((chip, idx) => (
                                <span key={`good-${idx}`} className='chip chip-good'>{chip}</span>
                            ))}
                        </div>
                    </div>

                    {/* 4. Layout Crimes */}
                    <div className='upgrade-card'>
                        <div className='card-top'><h3>LAYOUT CRIMES</h3></div>
                        <div className='card-divider' />
                        <p className='card-desc'>If it's hard to read, it goes in the trash. Respect the white space.</p>
                        <div className='layout-preview'>
                            <div className='layout-grid-bg'>
                                {Array.from({ length: 6 }).map((_, i) => <div key={i} />)}
                            </div>
                            <div className='layout-margin-box'>{layoutCrimes}</div>
                        </div>
                    </div>

                    {/* 5. Keyword Injection */}
                    <div className='upgrade-card'>
                        <div className='card-top'><h3>KEYWORD INJECTION</h3></div>
                        <div className='card-divider' />
                        <p className='card-desc'>The bots are scanning you. Give them the metadata they crave.</p>
                        <div className='keyword-chips'>
                            {keywordInjection.map((chip, idx) => (
                                <div key={idx} className='keyword-chip'>{chip.toUpperCase()}</div>
                            ))}
                        </div>
                    </div>

                    {/* 6. Contact Clarity */}
                    <div className='upgrade-card'>
                        <div className='card-top'><h3>CONTACT CLARITY</h3></div>
                        <div className='card-divider' />
                        <p className='card-desc'>{contactClarity}</p>
                        <div className='contact-list'>
                            <div className='contact-item contact-item-dark'>
                                <span>@</span>
                                <span>
                                    {resume.candidate_name
                                        ? `${resume.candidate_name.toLowerCase().replace(/\s+/g, '.')}@email.com`
                                        : 'name@email.com'}
                                </span>
                            </div>
                            <div className='contact-item'>
                                <span>🔗</span>
                                <span>
                                    linkedin.com/in/{resume.candidate_name
                                        ? resume.candidate_name.toLowerCase().replace(/\s+/g, '-')
                                        : 'your-name'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <section className='upgrade-cta'>
                    <h2>READY FOR WAR?</h2>
                    <button className='cta-btn' onClick={goGenerate}>
                        NEW ROAST
                    </button>
                </section>
            </main>

            <footer className='upgrade-footer'>
                <span>© 2026 MONKSTACK AI. STAY HUMBLE.</span>
                <div className='footer-links'>
                    <a href="#">Terms of Roast</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Legal</a>
                </div>
            </footer>
        </div>
    )
}

export default Upgrade