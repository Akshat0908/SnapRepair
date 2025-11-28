import React, { useState, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../lib/db_supabase';
import { analyzeIssue, detectDeviceFromImage } from '../lib/ai';
import { PhotoButton } from './ui/PhotoButton';
import { Loader } from './ui/Loader';

type SubmitIssueProps = {
  onBack: () => void;
  onSuccess: (issueId: string) => void;
};

const DEVICE_TYPES = [
  'Fan',
  'Laptop',
  'AC',
  'Washing Machine',
  'Kitchen Appliance',
  'Refrigerator',
  'Television',
  'Water Heater',
  'Other',
];

export function SubmitIssue({ onBack, onSuccess }: SubmitIssueProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [deviceType, setDeviceType] = useState(DEVICE_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isVideo = selectedFile.type.startsWith('video/');
      const isImage = selectedFile.type.startsWith('image/');

      if (!isVideo && !isImage) {
        setError('Please upload an image or video file');
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
      setError('');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreview(base64);

        // Auto-detect if it's an image
        if (isImage) {
          setAnalyzing(true);
          try {
            const result = await detectDeviceFromImage(base64);
            if (result.device_type && DEVICE_TYPES.includes(result.device_type)) {
              setDeviceType(result.device_type);
            }
            if (result.description) {
              setDescription(result.description);
            }
          } catch (err) {
            console.error("Auto-detection failed", err);
          } finally {
            setAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !preview) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create Issue in DB
      // Note: In a real app, we'd upload the file to Supabase Storage first and get a URL.
      // For this demo, we are using the base64 preview string as the media_url (not recommended for production but works for small files/demo).
      // If the file is too large, this might fail.
      // TODO: Implement Supabase Storage upload.
      const issue = await supabaseDB.createIssue(user.id, description, deviceType, preview, file.type.startsWith('video/') ? 'video' : 'photo');

      // 2. AI Analysis
      const aiDiagnosis = await analyzeIssue(preview, description);

      // 3. Update Issue with Diagnosis
      await supabaseDB.updateAiDiagnosis(issue.id, aiDiagnosis);

      // 4. Add System Message
      await supabaseDB.addMessage(issue.id, 'system', `AI Diagnosis Complete. Recommended Action: ${aiDiagnosis.recommended_action}`);

      onSuccess(issue.id);
    } catch (err: any) {
      console.error('Error submitting issue:', err);
      setError(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-orange-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-orange-600 mb-6 transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl border border-orange-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-orange-50 bg-orange-50/50">
            <h1 className="text-2xl font-black text-slate-900">Submit New Issue</h1>
            <p className="text-slate-600 mt-1 font-medium">Upload a photo and let our AI diagnose the problem.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4 flex justify-between items-center">
                <span className="text-lg">Photo or Video of the Issue</span>
                {analyzing && (
                  <span className="text-orange-500 flex items-center text-sm font-bold animate-pulse">
                    AI Analyzing...
                  </span>
                )}
              </label>

              {!preview ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-full max-w-xs">
                    <PhotoButton onClick={() => fileInputRef.current?.click()} />
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">JPG, PNG or MP4 (max 10MB)</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-red-600 shadow-sm transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Device Type
              </label>
              <div className="relative">
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white font-medium appearance-none"
                >
                  {DEVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none font-medium"
                placeholder="Describe the issue in one sentence (e.g., 'The washing machine is leaking from the bottom')"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file || !description}
              className="w-full py-5 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="scale-50 h-12 flex items-center">
                  <Loader />
                </div>
              ) : (
                'Submit Issue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
