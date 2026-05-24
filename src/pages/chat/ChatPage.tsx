import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../api/messageService';
import { Button } from '../../components/ui/Button';

// Connect outside the component to prevent multiple connections on re-renders
const socket: Socket = io('https://nexus-backend-jlqe.onrender.com', {
  autoConnect: false // We will connect it manually when the component loads
});

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Socket & Fetch History
  useEffect(() => {
    if (!user || !otherUserId) return;

    // Connect to WebSocket server
    socket.connect();
    socket.emit('join_room', user.id);
    console.log(`🔌 Connected to chat room: ${user.id}`);

    // Fetch historical messages from MongoDB
    const loadHistory = async () => {
      try {
        const history = await messageService.getChatHistory(otherUserId);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();

    // Listen for incoming live messages
    socket.on('receive_message', (message) => {
      console.log("📥 Live message received from server:", message);
      
      // Convert all IDs to strings to prevent MongoDB formatting mismatches
      const msgSender = String(message.sender);
      const msgReceiver = String(message.receiver);
      const currentUserId = String(user.id);
      const otherId = String(otherUserId);

      // Only add to screen if the message belongs to this specific conversation
      if (
        (msgSender === otherId && msgReceiver === currentUserId) || 
        (msgSender === currentUserId && msgReceiver === otherId)
      ) {
        setMessages((prev) => [...prev, message]);
      } else {
        console.log("⚠️ Message ignored: IDs didn't match.");
      }
    });

    // Cleanup when leaving the page
    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [user, otherUserId]);

  // 2. Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Handle Sending a Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !otherUserId) return;

    const messageData = {
      senderId: user.id,
      receiverId: otherUserId,
      content: newMessage
    };

    // Fire it to the backend via WebSocket
    socket.emit('send_message', messageData);
    setNewMessage(''); // Clear input
  };

  if (!user) return null;

  if (!otherUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
        <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
        <p>Go to the Dashboard or Investors page and click "Message" on a profile to start chatting.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Live Conversation</h2>
          <p className="text-xs text-green-600 font-medium flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Secure Connection
          </p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <Loader className="animate-spin mr-2" size={20} /> Loading history...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === user.id;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {/* Invisible div to force scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};