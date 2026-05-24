const API_URL = 'https://nexus-backend-jlqe.onrender.com/api/messages';
const TOKEN_KEY = 'business_nexus_token';

const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const messageService = {
    // Fetch chat history with a specific user
    getChatHistory: async (otherUserId: string) => {
        const response = await fetch(`${API_URL}/${otherUserId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};