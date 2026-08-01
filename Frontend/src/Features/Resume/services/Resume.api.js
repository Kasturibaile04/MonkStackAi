import axios from "axios";

const api = axios.create({
    baseURL: "https://monkstackai-1.onrender.com/api/resume",
    withCredentials: true,
});

export const generateResumeReport = async ({ resumeFile, selfDescription, targetRole, tone }) => {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("selfDescription", selfDescription);
    formData.append("targetRole", targetRole);
    formData.append("tone", tone);

    const response = await api.post("/", formData);
    return response.data;
}

export const getResumeReport = async (resumeId) => {
    const response = await api.get(`/report/${resumeId}`);
    return response.data;
}

export const getAllResumes = async () => {
    const response = await api.get("/");
    return response.data;
}

export async function upgradeResumePdf({ resumeFile, jobDescription, targetRole }) {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);
    formData.append("targetRole", targetRole);

    const response = await api.post(`/upgrade`, formData, {
        responseType: "blob"
    });
    return response.data;
}

export const generateUpgradeIntel = async (resumeId) => {
    const response = await api.post(`/intel/${resumeId}`);
    return response.data;
}