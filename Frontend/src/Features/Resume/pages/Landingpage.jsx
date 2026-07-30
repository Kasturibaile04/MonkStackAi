import React from 'react'
import '../styles/Landingpage.scss'
import { Link } from 'react-router'

const Landing = () => {
  return (
    <div className='landing'>
        {/* Top Nav */}
        <nav className='landing-nav'>
            <div className='brand'>
                <span className='material-symbols-outlined brand-icon'>bolt</span>
                <span className='brand-name'>MONKSTACK</span>
            </div>
            <div className='nav-actions'>
                <Link to="/login" className='nav-cta-ghost'>LOG IN</Link>
                <Link to="/register" className='nav-cta'>SIGN UP</Link>
            </div>
        </nav>

        <main>
            {/* Hero */}
            <section className='hero dot-grid'>
                <div className='hero-content'>
                    <h1 className='hero-title'>
                        YOUR RESUME IS WEAK. <br />
                        <span className='highlight'>LET AI FIX IT.</span>
                    </h1>
                    <p className='hero-sub'>
                        Upload your PDF for a direct, no-nonsense roast of your career choices. No sugar-coating, just cold hard truths.
                    </p>
                    <div className='hero-actions'>
                        <Link to="/register" className='hero-btn'>
                            <span className='material-symbols-outlined hero-btn-icon'>upload_file</span>
                            UPLOAD &amp; ROAST
                        </Link>
                        <p className='hero-note'>Supports PDF, DOCX (Max 5MB)</p>
                        <p className='hero-login-note'>
                            Already have an account? <Link to="/login">Log in</Link>
                        </p>
                    </div>
                </div>
                <div className='hero-shape hero-shape-1'></div>
                <div className='hero-shape hero-shape-2'></div>
            </section>

            {/* Marquee */}
            <div className='marquee-wrap'>
                <div className='marquee-track'>
                    <span className='marquee-item'>10,000+ CAREERS SAVED FROM MEDIOCRITY.</span>
                    <span className='marquee-item dim'>STAY DIRECT.</span>
                    <span className='marquee-item'>10,000+ CAREERS SAVED FROM MEDIOCRITY.</span>
                    <span className='marquee-item dim'>STAY DIRECT.</span>
                </div>
            </div>

            {/* Roast Levels */}
            <section className='levels'>
                <div className='levels-header'>
                    <h2>THREE LEVELS OF CRITIQUE</h2>
                    <div className='underline'></div>
                </div>
                <div className='levels-grid'>
                    <div className='level-card'>
                        <div className='level-top'>
                            <span className='level-num'>01</span>
                            <span className='material-symbols-outlined level-icon'>search</span>
                        </div>
                        <h3>THE BASICS</h3>
                        <p>We hunt down typos, broken layouts, and font crimes that scream "unprofessional." If your margins are messy, we're coming for you.</p>
                        <ul>
                            <li>TYPO DETECTION</li>
                            <li>LAYOUT AUDIT</li>
                        </ul>
                    </div>

                    <div className='level-card level-card-accent'>
                        <div className='level-top'>
                            <span className='level-num'>02</span>
                            <span className='material-symbols-outlined level-icon'>target</span>
                        </div>
                        <h3>THE IMPACT</h3>
                        <p>Your bullet points are boring. We rewrite them for maximum damage and recruiter attention. We turn "Managed a team" into "Led high-stakes operations."</p>
                        <ul>
                            <li>VERB OPTIMIZATION</li>
                            <li>METRIC INJECTION</li>
                        </ul>
                    </div>

                    <div className='level-card'>
                        <div className='level-top'>
                            <span className='level-num'>03</span>
                            <span className='material-symbols-outlined level-icon'>strategy</span>
                        </div>
                        <h3>THE STRATEGY</h3>
                        <p>Are your skills even relevant? We cut the fluff and align your profile with high-paying roles. We tell you what to delete and what to double-down on.</p>
                        <ul>
                            <li>MARKET ALIGNMENT</li>
                            <li>FLUFF ELIMINATION</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className='final-cta-wrap'>
                <div className='final-cta'>
                    <span className='final-cta-tag'>Ready?</span>
                    <h2>DON'T BE JUST ANOTHER PDF.</h2>
                    <div className='final-cta-actions'>
                        <Link to="/register" className='final-cta-btn'>GET ROASTED NOW</Link>
                        <Link to="/login" className='final-cta-login'>Log in instead</Link>
                    </div>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className='landing-footer'>
            <div>
                <span className='footer-brand'>MONKSTACK AI</span>
                <p>© 2026 MONKSTACK AI. STAY DIRECT.</p>
            </div>
            <div className='footer-links'>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Twitter</a>
            </div>
        </footer>
    </div>
  )
}

export default Landing