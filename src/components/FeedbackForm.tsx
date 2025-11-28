import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../lib/db_supabase';

interface FeedbackFormProps {
  issueId: string;
  onClose: () => void;
}

export function FeedbackForm({ issueId, onClose }: FeedbackFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !user) return;

    try {
      await supabaseDB.addFeedback(issueId, user.id, rating, comment);
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full animate-in zoom-in duration-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
          <p className="text-slate-600">Your feedback helps us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Rate Your Experience</h2>
          <p className="text-slate-600 text-center mb-8">How was your repair consultation?</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-200'
                    }`}
                >
                  <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Comments (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Tell us what you liked or how we can improve..."
              />
            </div>

            <button
              type="submit"
              disabled={rating === 0}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
