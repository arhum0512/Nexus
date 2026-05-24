import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Send, History, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const DealsPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchFinancials = async () => {
    try {
      const token = localStorage.getItem('business_nexus_token');
      const res = await fetch('http://localhost:5000/api/payments/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch financials", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount.");

    setProcessing(true);
    const token = localStorage.getItem('business_nexus_token');
    
    // Determine the correct API endpoint based on which modal is open
    const endpoint = `http://localhost:5000/api/payments/${activeModal}`;
    const payload = activeModal === 'transfer' 
      ? { amount: Number(amount), recipientId }
      : { amount: Number(amount) };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok) {
        await fetchFinancials(); // Refresh the UI with new balance/history
        closeModal();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed. Check console.");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setAmount('');
    setRecipientId('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financial Hub</h1>
        <p className="text-gray-500">Manage your Nexus wallet and funding deals.</p>
      </div>

      {/* Top Section: Wallet Balance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-lg md:col-span-1">
          <p className="text-primary-100 mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold mb-6">${balance.toLocaleString()}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveModal('deposit')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
            >
              <ArrowDownRight size={16} /> Deposit
            </button>
            <button 
              onClick={() => setActiveModal('withdraw')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
            >
              <ArrowUpRight size={16} /> Withdraw
            </button>
          </div>
        </div>

        {/* Transfer/Deal Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm md:col-span-2 flex flex-col justify-center items-start">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Send size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fund a Startup</h3>
          <p className="text-gray-500 text-sm mb-4">
            Transfer funds directly to another user's wallet to finalize a deal.
          </p>
          <Button variant="outline" onClick={() => setActiveModal('transfer')}>
            Initiate Transfer
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <History size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No transactions found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'Deposit' ? 'bg-green-100 text-green-600' : 
                    tx.type === 'Withdrawal' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.type === 'Deposit' && <ArrowDownRight size={20} />}
                    {tx.type === 'Withdrawal' && <ArrowUpRight size={20} />}
                    {tx.type === 'Transfer' && <Send size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.type}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'Deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- REUSABLE TRANSACTION MODAL --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">{activeModal} Funds</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleTransaction} className="p-6 flex flex-col gap-4">
              {/* If Transfer, show Recipient ID input */}
              {activeModal === 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient User ID</label>
                  <input 
                    type="text" 
                    required
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                    placeholder="Paste the receiver's ID here"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 outline-none focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button variant="outline" type="button" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={processing}>
                  {processing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};