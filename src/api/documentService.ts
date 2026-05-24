const API_URL = 'https://nexus-backend-jlqe.onrender.com/api/documents';
const TOKEN_KEY = 'business_nexus_token';

const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Authorization': `Bearer ${token}`
    };
};

export const documentService = {
    // Upload a file with metadata
    uploadDocument: async (file: File, title: string, description: string, documentType: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('documentType', documentType);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: getHeaders(), // Note: Do NOT set Content-Type to JSON for FormData!
            body: formData
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get all documents available to the logged-in user
    getDocuments: async () => {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                ...getHeaders(),
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};