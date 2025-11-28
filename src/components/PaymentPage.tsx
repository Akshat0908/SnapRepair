import React, { useState } from 'react';
import { ArrowLeft, CreditCard as CreditCardIcon, Shield, Lock } from 'lucide-react';
import { CreditCard } from './ui/CreditCard';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../lib/db_supabase';

interface PaymentPageProps {
  issueId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function PaymentPage({ issueId, onBack, onSuccess }: PaymentPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create payment record in Supabase
      await supabaseDB.createPayment(issueId, user.id, 19900); // 199.00 in paise

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onSuccess();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-orange-100">
        <div className="p-6 border-b border-orange-50 flex items-center gap-4 bg-orange-50/30">
          <button onClick={onBack} className="text-slate-400 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-slate-900">Secure Checkout</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center mb-6">
            <CreditCard />
          </div>

          <div className="bg-orange-50 p-5 rounded-2xl flex items-start gap-4 border border-orange-100">
            <div className="p-3 bg-white rounded-xl text-orange-500 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Video Consultation</h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">15-minute live video call with a verified expert technician.</p>
            </div>
          </div>

          <div className="flex justify-between items-end border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Amount</p>
              <p className="text-4xl font-black text-slate-900">₹199</p>
            </div>
            <div className="text-xs text-slate-400 mb-1 font-medium">Including GST</div>
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
              <div className="relative">
                <CreditCardIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-mono text-slate-900 placeholder-slate-400 font-medium bg-slate-50 focus:bg-white"
                  maxLength={19}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-center text-slate-900 placeholder-slate-400 font-medium bg-slate-50 focus:bg-white"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="123"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-center text-slate-900 placeholder-slate-400 font-medium bg-slate-50 focus:bg-white"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Pay Securely'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <Lock className="w-3 h-3" />
            Payments are secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
