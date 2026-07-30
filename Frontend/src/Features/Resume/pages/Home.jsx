import React from 'react'
import '../styles/Home.scss'
import { useNavigate } from 'react-router';
import { useResume } from '../hooks/useResume';
import { useState, useRef, useEffect } from 'react';

const Home = () => {
    const navigate = useNavigate();
    const { loading, handleGenerateReport: generateReportFromApi, reports, handleGetAllResumes } = useResume();
    const [jobDescription, setJobDescription] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [tone, setTone] = useState("savage");
    const fileInputRef = useRef(null);

    useEffect(() => {
        handleGetAllResumes();
    }, []);

    const handleGenerateReport = async () => {
        const resumeFile = fileInputRef.current.files[0];
        const data = await generateReportFromApi({ resumeFile, selfDescription: jobDescription, targetRole, tone });
        if (data) {
            navigate(`/resume/${data.resumeReport._id}`);
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your Resume Roast..</h1>
            </main>
        )
    }

    return (
        <main className='home'>
            <div className='page-header'>
                <span className='eyebrow'>PROTOCOL: RECRUITER_DECEPTION</span>
                <h1 className='page-title'>ROAST ENGINE</h1>
            </div>

            <div className='home-grid'>
                <section className='left'>
                    <h4 className='section-heading'>01 // JOB DESCRIPTION</h4>
                    <textarea
                        onChange={(e) => setJobDescription(e.target.value)}
                        name="job-description"
                        id="job-description"
                        placeholder="Paste the job description here..."
                    ></textarea>
                </section>

                <section className='right'>
                    <div className='input-group'>
                        <div className='group-header'>
                            <h4 className='section-heading'>02 // RESUME</h4>
                            <span className='hint'>PDF / MAX 5MB</span>
                        </div>
                        <label htmlFor="resume" className='upload-box'>
                            <span className='upload-icon'>&#8593;</span>
                            <span className='upload-text'>SELECT RESUME</span>
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="resume"
                            id="resume"
                            accept=".pdf"
                            className='hidden-input'
                        />
                    </div>

                    <div className='input-group'>
                        <h4 className='section-heading'>03 // TARGET ROLE</h4>
                        <textarea
                            onChange={(e) => setTargetRole(e.target.value)}
                            name="target-role"
                            id="target-role"
                            placeholder="e.g. Senior Frontend Engineer"
                        ></textarea>
                    </div>

                    <div className='input-group'>
                        <h4 className='section-heading'>04 // TONE</h4>
                        <select onChange={(e) => setTone(e.target.value)} name="tone" id="tone">
                            <option value="savage">Savage</option>
                            <option value="mild">Mild</option>
                            <option value="motivational">Motivational</option>
                        </select>
                        <button onClick={handleGenerateReport}>Generate</button>
                    </div>
                     </section>
            </div>
                {reports && reports.length > 0 && (
        <section className='recent-reports'>
            <h4 className='section-heading'>05 // RECENT REPORTS</h4>
            <ul className='report-list'>
                {reports.map(report => (
                    <li
                        key={report._id}
                        className='report-item'
                        onClick={() => navigate(`/resume/${report._id}`)}
                    >
                        <h3>{report.targetRole || 'Untitled Report'}</h3>
                        <span className='report-date'>
                            {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    )}
        </main>
    )
}

export default Home