import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface JobStatus {
  status: 'processing' | 'completed' | 'failed';
  filename: string;
  total_records?: number;
  valid_records?: number;
  invalid_records?: number;
  chunks?: string[];
  error?: string;
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/upload`, formData);
  return response.data.job_id;
};

export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
  const response = await axios.get(`${API_BASE_URL}/status/${jobId}`);
  return response.data;
};

export const getDownloadUrl = (jobId: string, filename: string): string => {
  return `${API_BASE_URL}/download/${jobId}/${filename}`;
};
