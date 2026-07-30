import { getAllResumes, generateResumeReport as generateResumeReportApi, getResumeReport } from "../services/Resume.api"
import { useContext} from "react";
import { ResumeContext } from "../Resume.context"

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error("useResume must be used within a ResumeProvider");
    }

    const { setResume, resume, setLoading, loading, setReports, reports } = context;

    const handleGenerateReport = async ({ resumeFile, selfDescription, targetRole, tone }) => {
        setLoading(true);

        try {
            const response = await generateResumeReportApi({ resumeFile, selfDescription, targetRole, tone });
            setResume(response.resumeReport);
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleGetAllResumes = async () => {
        setLoading(true);
        try {
            const response = await getAllResumes();
            setReports(response.resumes);
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleGetResumeReport = async (resumeId) => {
        setLoading(true);
        try {
            const response = await getResumeReport(resumeId);
            setResume(response.resumeReport);
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };


    return {
        resume,
        setResume,
        reports,
        setReports,
        loading,
        setLoading,
        handleGenerateReport,
        handleGetAllResumes,
        handleGetResumeReport
    };
}