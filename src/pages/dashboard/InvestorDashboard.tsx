import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Calendar as CalendarIcon, Check, X as CloseIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { entrepreneurs } from '../../data/users';
import { getRequestsFromInvestor } from '../../data/collaborationRequests';
import toast from 'react-hot-toast';

// --- Import Real API Service ---
import { meetingService } from '../../api/meetingService';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  // --- State for Real Meetings ---
  const [meetings, setMeetings] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      // Fetch Real Meetings on Load
      const fetchMeetings = async () => {
        try {
          const fetchedMeetings = await meetingService.getUserMeetings();
          setMeetings(fetchedMeetings);
        } catch (error) {
          console.error("Failed to fetch meetings:", error);
        }
      };
      fetchMeetings();
    }
  }, [user]);

  // --- Handle Accept/Reject Meeting ---
  const handleMeetingAction = async (meetingId: string, status: 'accepted' | 'rejected') => {
    try {
      await meetingService.updateStatus(meetingId, status);
      toast.success(`Meeting ${status} successfully!`);
      
      // Refresh the meeting list to remove the pending request
      const updatedMeetings = await meetingService.getUserMeetings();
      setMeetings(updatedMeetings);
    } catch (error) {
      toast.error((error as Error).message || "Failed to update meeting status.");
    }
  };
  
  if (!user) return null;
  
  const sentRequests = getRequestsFromInvestor(user.id);
  
  // Filter entrepreneurs based on search and industry filters (Currently using mock data)
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      selectedIndustries.includes(entrepreneur.industry);
    
    return matchesSearch && matchesIndustry;
  });
  
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry)));
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevSelected => 
      prevSelected.includes(industry)
        ? prevSelected.filter(i => i !== industry)
        : [...prevSelected, industry]
    );
  };

  // Find incoming meeting requests where the Investor is the recipient
  const pendingMeetings = meetings.filter(m => 
    m.status === 'pending' && (m.recipient?._id === user.id || m.recipient?.id === user.id || m.recipient === user.id)
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
          <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
        </div>
        
        <Link to="/entrepreneurs">
          <Button leftIcon={<PlusCircle size={18} />}>
            View All Startups
          </Button>
        </Link>
      </div>

      {/* --- NEW: Pending Meeting Requests Section --- */}
      {pendingMeetings.length > 0 && (
        <Card className="border-accent-200 shadow-md">
          <CardHeader className="bg-accent-50 border-b border-accent-100 flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon size={20} className="text-accent-700 mr-2" />
              <h2 className="text-lg font-medium text-accent-900">Incoming Meeting Requests</h2>
            </div>
            <Badge variant="primary">{pendingMeetings.length} Pending</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {pendingMeetings.map(meeting => (
              <div key={meeting._id} className="flex flex-col md:flex-row md:justify-between md:items-center p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="mb-4 md:mb-0">
                  <h4 className="font-semibold text-gray-900 text-lg">{meeting.title}</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Requested by:</span> {meeting.requester?.name || 'Entrepreneur'}
                  </p>
                  <p className="text-sm text-accent-600 font-medium mt-1">
                    {new Date(meeting.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleMeetingAction(meeting._id, 'rejected')}
                  >
                    <CloseIcon size={16} className="mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                    onClick={() => handleMeetingAction(meeting._id, 'accepted')}
                  >
                    <Check size={16} className="mr-1" /> Accept
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            
            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <Badge
                  key={industry}
                  variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                  className="cursor-pointer"
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Total Startups</p>
                <h3 className="text-xl font-semibold text-primary-900">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <PieChart size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Industries</p>
                <h3 className="text-xl font-semibold text-secondary-900">{industries.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Scheduled Meetings</p>
                {/* Dynamically count accepted meetings */}
                <h3 className="text-xl font-semibold text-accent-900">
                  {meetings.filter(m => m.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Entrepreneurs grid */}
      <div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Featured Startups</h2>
          </CardHeader>
          
          <CardBody>
            {filteredEntrepreneurs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntrepreneurs.map(entrepreneur => (
                  <EntrepreneurCard
                    key={entrepreneur.id}
                    entrepreneur={entrepreneur}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No startups match your filters</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustries([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};