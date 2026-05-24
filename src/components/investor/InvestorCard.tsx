import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, Calendar as CalendarIcon, X } from 'lucide-react';
import { Investor } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { meetingService } from '../../api/meetingService';

interface InvestorCardProps {
  investor: Investor;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  showActions = true
}) => {
  const navigate = useNavigate();
  
  // --- New State for Scheduling ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  
  const handleViewProfile = () => {
    navigate(`/profile/investor/${investor.id}`);
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${investor.id}`);
  };

  // --- Modal Handlers ---
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMeetingTitle('');
    setMeetingDate('');
  };

  // --- API Submission ---
  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle || !meetingDate) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsScheduling(true);
    try {
      // Calls your Express backend!
      await meetingService.scheduleMeeting(investor.id, meetingTitle, meetingDate);
      toast.success("Meeting scheduled successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error((error as Error).message || "Failed to schedule meeting.");
    } finally {
      setIsScheduling(false);
    }
  };
  
  return (
    <>
      <Card 
        hoverable 
        className="transition-all duration-300 h-full"
        onClick={handleViewProfile}
      >
        <CardBody className="flex flex-col">
          <div className="flex items-start">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="lg"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mr-4"
            />
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{investor.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Investor • {investor.totalInvestments} investments</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {investor.investmentStage.map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Investment Interests</h4>
            <div className="flex flex-wrap gap-2">
              {investor.investmentInterests.map((interest, index) => (
                <Badge key={index} variant="primary" size="sm">{interest}</Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">{investor.bio}</p>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500">Investment Range</span>
              <p className="text-sm font-medium text-gray-900">{investor.minimumInvestment} - {investor.maximumInvestment}</p>
            </div>
          </div>
        </CardBody>
        
        {showActions && (
          <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between gap-2 flex-wrap">
            {/* --- Updated Buttons to include Schedule --- */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CalendarIcon size={16} />}
              onClick={handleOpenModal}
            >
              Schedule
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ExternalLink size={16} />}
              onClick={handleViewProfile}
            >
              Profile
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* --- Scheduling Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Schedule Meeting with {investor.name}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitMeeting} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Seed Round Pitch Discussion"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isScheduling}>
                  {isScheduling ? 'Scheduling...' : 'Confirm Meeting'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};