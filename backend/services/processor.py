import pandas as pd
import os
import shutil
import uuid
from typing import List, Dict

class FileProcessor:
    def __init__(self, upload_dir: str, processed_dir: str, chunk_size: int = 5000):
        self.upload_dir = upload_dir
        self.processed_dir = processed_dir
        self.chunk_size = chunk_size
        
        for d in [upload_dir, processed_dir]:
            if not os.path.exists(d):
                os.makedirs(d)

    def split_and_save(self, df: pd.DataFrame, job_id: str) -> List[str]:
        job_dir = os.path.join(self.processed_dir, job_id)
        if not os.path.exists(job_dir):
            os.makedirs(job_dir)
            
        file_paths = []
        num_chunks = (len(df) // self.chunk_size) + (1 if len(df) % self.chunk_size > 0 else 0)
        
        if len(df) == 0:
            return []

        for i in range(num_chunks):
            start_idx = i * self.chunk_size
            end_idx = start_idx + self.chunk_size
            chunk = df.iloc[start_idx:end_idx]
            
            filename = f"validated_part_{i+1}.csv"
            path = os.path.join(job_dir, filename)
            chunk.to_csv(path, index=False)
            file_paths.append(filename)
            
        return file_paths

    def cleanup_old_files(self):
        # Implementation for production to clean up temp files
        pass
