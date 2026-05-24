import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const TwoFactorPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the logged-in user to know where to send them

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form Validation (Part of Milestone 7!)
    if (code.length !== 6 || isNaN(Number(code))) {
      return setError('Please enter a valid 6-digit numeric code.');
    }

    setIsVerifying(true);

    // Mock an API verification delay
    setTimeout(() => {
      setIsVerifying(false);
      
      // Route based on role
      if (user?.role === 'entrepreneur') {
        navigate('/dashboard/entrepreneur');
      } else if (user?.role === 'investor') {
        navigate('/dashboard/investor');
      } else {
        navigate('/'); // Fallback
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600">
          <ShieldCheck size={64} className="bg-primary-50 rounded-full p-3" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Two-Step Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit verification code to your registered device. <br/>
          <span className="text-xs text-gray-400">(Hint: For this mockup, enter any 6 digits!)</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleVerify}>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-center mb-2">
                Security Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="code"
                  id="code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-3 text-center tracking-widest font-mono font-bold"
                  placeholder="000000"
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
            </div>

            <div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full flex justify-center items-center gap-2 py-3"
                disabled={isVerifying || code.length !== 6}
              >
                {isVerifying ? 'Verifying Identity...' : 'Verify & Login'} 
                {!isVerifying && <ArrowRight size={18} />}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Didn't receive a code?</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button className="text-primary-600 hover:text-primary-500 font-medium text-sm transition-colors">
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};