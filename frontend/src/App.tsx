import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { uploadFile, getJobStatus, JobStatus } from './services/api';
import { ShieldCheck, RefreshCw } from 'lucide-react';

function App() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: any) => {
    setIsUploading(true);
    try {
      const id = await uploadFile(file);
      setJobId(id);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. Make sure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (jobId && (!status || status.status === 'processing')) {
      interval = setInterval(async () => {
        try {
          const newStatus = await getJobStatus(jobId);
          setStatus(newStatus);
          if (newStatus.status !== 'processing') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error fetching status", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, status]);

  const reset = () => {
    setJobId(null);
    setStatus(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">TransactValidate <span className="text-primary">Pro</span></span>
            </div>
            {jobId && (
              <button 
                onClick={reset}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                <RefreshCw size={16} /> New Job
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {!jobId ? (
          <div className="space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Process Your Transaction Data with Confidence
              </h1>
              <p className="text-lg text-slate-600">
                AI-powered validation for international phone formats, multi-country dates, and schema integrity. 
                Automatically splits large files into manageable chunks.
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUpload} isLoading={isUploading} />
          </div>
        ) : (
          status && <Dashboard jobId={jobId} status={status} />
        )}
      </main>

      <footer className="mt-auto py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} TransactValidate Pro. Secure Data Processing Engine.
        </div>
      </footer>
    </div>
  );
}

export default App;
