const API_URL = 'http://localhost:5000/api/meetings';
const TOKEN_KEY = 'business_nexus_token';

// Helper to get the auth headers
const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // This is what authMiddleware looks for!
    };
};

export const meetingService = {
    // 1. Schedule a new meeting
    scheduleMeeting: async (recipientId: string, title: string, scheduledDate: string) => {
        const response = await fetch(`${API_URL}/schedule`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ recipientId, title, scheduledDate })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // 2. Get all meetings for logged-in user
    getUserMeetings: async () => {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // 3. Accept or Reject a meeting
    updateStatus: async (meetingId: string, status: 'accepted' | 'rejected') => {
        const response = await fetch(`${API_URL}/${meetingId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};