import React from 'react';
import { Download, CheckCircle2, XCircle, FileText, Loader2, Database } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export const Dashboard = ({ jobId, status }) => {
  if (status.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Processing your data...</h3>
        <p className="text-slate-500">Validating phone numbers, dates, and schema integrity.</p>
      </div>
    );
  }

  if (status.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-800">Processing Failed</h3>
        <p className="text-red-600 mt-2">{status.error}</p>
      </div>
    );
  }

  const validPercent = status.total_records
    ? Math.round((status.valid_records / status.total_records) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 flex items-center gap-2">
            <Database size={16} /> Total Records
          </div>
          <div className="text-2xl font-bold">{status.total_records?.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-emerald-600 text-sm mb-1 flex items-center gap-2">
            <CheckCircle2 size={16} /> Valid Records
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {status.valid_records?.toLocaleString()}
            <span className="text-sm font-normal text-slate-400 ml-2">({validPercent}%)</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-rose-600 text-sm mb-1 flex items-center gap-2">
            <XCircle size={16} /> Invalid Records
          </div>
          <div className="text-2xl font-bold text-rose-600">{status.invalid_records?.toLocaleString()}</div>
        </div>
      </div>

      {/* Download Chunks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Processed Data Chunks
          </h3>
          <span className="text-xs bg-indigo-100 text-primary px-2 py-1 rounded-full font-medium">
            {status.chunks?.length} Parts
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {status.chunks?.map((filename, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                  <FileText size={16} className="text-slate-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">{filename}</div>
                  <div className="text-xs text-slate-400">Validated Dataset - Part {idx + 1}</div>
                </div>
              </div>
              <a
                href={getDownloadUrl(jobId, filename)}
                download
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Download size={16} /> Download
              </a>
            </div>
          ))}
          {(!status.chunks || status.chunks.length === 0) && (
            <div className="p-12 text-center text-slate-500">
              No valid records found to generate output files.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};