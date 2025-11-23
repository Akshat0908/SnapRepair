import { useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PaymentPageProps = {
  issueId: string;
  onBack: () => void;
  onSuccess: () => void;
};

export function PaymentPage({ issueId, onBack, onSuccess }: PaymentPageProps) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          issue_id: issueId,
          user_id: user.id,
          amount: 19900,
          status: 'completed',
          payment_provider: 'demo',
        });

      if (paymentError) throw paymentError;

      await supabase
        .from('issues')
        .update({ status: 'consultation_paid' })
        .eq('id', issueId);

      await supabase
        .from('messages')
        .insert({
          issue_id: issueId,
          sender: 'system',
          text: 'Payment successful! An expert will schedule your video consultation shortly. You will receive a calendar invite via email.',
        });

      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Payment Successful!</h2>
          <p className="text-slate-600">
            Your consultation has been booked. We'll send you a calendar invite shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Book Remote Consultation</h1>
        <p className="text-slate-600 mb-8">
          Get personalized guidance from our expert technicians
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900">What's Included</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">30-minute video consultation with certified technician</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Step-by-step repair guidance</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Parts recommendation if needed</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Follow-up support via chat</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-900">Payment Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-700">Remote Consultation</span>
                <span className="font-semibold text-slate-900">₹199.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">Platform Fee</span>
                <span className="font-semibold text-slate-900">₹0.00</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-lg font-bold text-blue-600">₹199.00</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Demo Payment Mode</span>
              </div>
              <p className="text-sm text-blue-700">
                This is a demo environment. No actual payment will be processed.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Complete Payment ₹199'}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By clicking "Complete Payment", you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-yellow-900 mb-2">Payment Integration Note</h3>
          <p className="text-sm text-yellow-800">
            To implement payments in your application, you'll need to integrate with Stripe or Razorpay. This demo uses simulated payments.
            For production, visit{' '}
            <a href="https://bolt.new/setup/stripe" className="underline hover:text-yellow-900" target="_blank" rel="noopener noreferrer">
              https://bolt.new/setup/stripe
            </a>
            {' '}to set up real payment processing.
          </p>
        </div>
      </div>
    </div>
  );
}
