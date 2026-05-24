import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from './Button';

export const CheckoutButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Pointing directly to your live Render backend
      const response = await fetch('https://nexus-backend-jlqe.onrender.com/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming you have a token stored in localStorage
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ plan: 'premium', price: 99 })
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirects to the secure Stripe Sandbox checkout page
        window.location.href = data.url;
      } else {
        alert("Payment session failed to initialize.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Network error connecting to payment gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <CreditCard className="mr-2" size={20} />}
      {isLoading ? 'Connecting Gateway...' : 'Upgrade to Premium'}
    </Button>
  );
};