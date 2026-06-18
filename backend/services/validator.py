import pandas as pd
import re
import json
import os
from datetime import datetime
from typing import Dict, List, Tuple

class DataValidator:
    def __init__(self, config_path: str):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.phone_rules = self.config['phone_rules']
        self.date_formats = self.config['date_formats']
        self.required_columns = self.config['processing']['required_columns']

    def validate_phone(self, phone: str, country_code: str) -> bool:
        if pd.isna(phone) or pd.isna(country_code):
            return False
        
        rule = self.phone_rules.get(str(country_code).upper())
        if not rule:
            return False
        
        phone_str = str(int(float(phone))) if isinstance(phone, (float, int)) else str(phone)
        phone_str = ''.join(filter(str.isdigit, phone_str))
        
        return bool(re.match(rule['regex'], phone_str))

    def validate_date(self, date_val: str) -> bool:
        if pd.isna(date_val):
            return False
        
        for fmt in self.date_formats:
            try:
                datetime.strptime(str(date_val), fmt)
                return True
            except ValueError:
                continue
        return False

    def validate_dataframe(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        results = df.copy()

        # Phone Validation (only if columns exist)
        if "phone" in df.columns and "country_code" in df.columns:
            results['is_phone_valid'] = results.apply(
                lambda row: self.validate_phone(row['phone'], row['country_code']), axis=1
            )
        else:
            results['is_phone_valid'] = True  # default pass if column missing

        # Date Validation (only if column exists)
        if "transaction_date" in df.columns:
            results['is_date_valid'] = results['transaction_date'].apply(self.validate_date)
        else:
            results['is_date_valid'] = True

        # Integrity Validation (only check columns that exist)
        existing_required = [col for col in self.required_columns if col in df.columns]
        if existing_required:
            results['is_integrity_valid'] = results[existing_required].notnull().all(axis=1)
        else:
            results['is_integrity_valid'] = True

        # Final combined validity
        results['is_valid'] = (
            results['is_phone_valid'] &
            results['is_date_valid'] &
            results['is_integrity_valid']
        )

        valid_df = results[results['is_valid']].drop(columns=['is_phone_valid', 'is_date_valid', 'is_integrity_valid', 'is_valid'])
        invalid_df = results[~results['is_valid']]

        return valid_df, invalid_df
