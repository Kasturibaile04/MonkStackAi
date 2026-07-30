import { createContext, useContext, useState } from "react";

export const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);


    return (
        <ResumeContext.Provider value={{ setResume, resume, setLoading, loading, setReports, reports }}>
            {children}
        </ResumeContext.Provider>
    )


}



