const API_URL = 'https://nexus-backend-jlqe.onrender.com/api/users';
const TOKEN_KEY = 'business_nexus_token';

const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const userService = {
    getInvestors: async () => {
        // Fetch only users with the 'investor' role
        const response = await fetch(`${API_URL}?role=investor`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        // Map backend User model to frontend Investor interface
        return data.map((user: any) => ({
            id: user._id, // This is the real MongoDB ID we need for scheduling!
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
            isOnline: true,
            bio: user.profile?.bio || 'No bio provided.',
            // Fallback values for UI until we build out the full profile editing feature
            totalInvestments: 0,
            investmentStage: ['Seed', 'Series A'], 
            investmentInterests: ['Tech', 'SaaS'],
            minimumInvestment: '$50K',
            maximumInvestment: '$500K'
        }));
    }
};