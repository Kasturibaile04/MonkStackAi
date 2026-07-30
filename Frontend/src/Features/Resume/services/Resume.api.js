import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api/resume",
    withCredentials: true,

});

/**
 * @description This function is used to generate a resume roast report.
 */
export const generateResumeReport = async ({resumeFile,selfDescription,targetRole,tone}) => {
    const formData = new FormData();
    formData.append("resume",resumeFile);
    formData.append("selfDescription",selfDescription);
    formData.append("targetRole",targetRole);
    formData.append("tone",tone);

    const response = await api.post("/",formData,{
        headers:{
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
    
}
/**
 * @description This function is used to get a resume roast report.
 */
export const getResumeReport = async(resumeId) => {
    const response = await api.get(`/report/${resumeId}`);
    return response.data;
}

/**
 * @description This function is used to get all resumes of a user.
 */
export const getAllResumes = async() => {
    const response = await api.get("/");
    return response.data;
}

export async function downloadResumePdf(resumeId) {
    const response = await api.get(`/pdf/${resumeId}`, {
        responseType: "blob" // important — tells axios to expect binary file data, not JSON
    });
    return response.data;
}
