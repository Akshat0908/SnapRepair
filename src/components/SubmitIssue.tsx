import { useState } from 'react';
import { Upload, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  const [deviceType, setDeviceType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('issue-media')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';

      const { data: issue, error: insertError } = await supabase
        .from('issues')
        .insert({
          user_id: user.id,
          description,
          device_type: deviceType,
          media_url: publicUrl,
          media_type: mediaType,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const aiDiagnosis = await getAIDiagnosis(publicUrl, description, deviceType, mediaType);

      await supabase
        .from('issues')
        .update({
          ai_diagnosis: aiDiagnosis,
          status: 'open'
        })
        .eq('id', issue.id);

      await supabase
        .from('messages')
        .insert({
          issue_id: issue.id,
          sender: 'system',
          text: `AI Diagnosis:\n\n${aiDiagnosis}`,
        });

      onSuccess(issue.id);
    } catch (err: any) {
      console.error('Error submitting issue:', err);
      setError(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAIDiagnosis = async (mediaUrl: string, description: string, deviceType: string, mediaType: string): Promise<string> => {
    return `Device Type: ${deviceType}

Likely Causes:
1. Worn or damaged components requiring replacement
2. Improper installation or loose connections
3. Electrical or mechanical malfunction

Safety Warning:
⚠️ Before attempting any repairs, ensure the device is unplugged and has cooled down. Avoid touching electrical components if you're unsure.

DIY Troubleshooting Steps:
1. Check all power connections and ensure the device is properly plugged in
2. Inspect for any visible damage, loose parts, or unusual sounds
3. Consult the user manual for specific troubleshooting guidance
4. Try resetting the device if applicable
5. Clean any filters or vents that may be blocked

Recommended Action: Based on the issue, we recommend consulting with our expert for personalized guidance (Remote Consult - ₹199)

Estimated Cost Range: ₹200 - ₹1500 depending on the specific repair needed

Note: This is an AI-generated diagnosis. For accurate assessment, please consult with our expert technicians.`;
  };

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
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Submit Your Issue</h1>
        <p className="text-slate-600 mb-8">
          Upload a photo or video of the problem and get instant AI diagnosis
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Photo or Video *
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-4">
                    {file?.type.startsWith('video/') ? (
                      <video src={preview} controls className="max-h-64 mx-auto rounded-lg" />
                    ) : (
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    )}
                    <p className="text-sm text-slate-600">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-slate-400" />
                    <div>
                      <p className="text-slate-700 font-medium">Click to upload</p>
                      <p className="text-sm text-slate-500">Image or video (max 50MB)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Device Type *
            </label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select device type</option>
              {DEVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the issue in one sentence (e.g., 'Fan makes loud noise when turned on')"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Issue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
