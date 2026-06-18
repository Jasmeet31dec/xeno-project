# TransactValidate Pro

TransactValidate Pro is a high-performance web platform designed to validate and process complex transaction datasets. It focuses on international data integrity, including country-specific phone validation, date standardization, and automatic file chunking.

## Features

- **Intelligent Phone Validation**: Uses regex patterns for specific countries (IN, SG, US, UK) configurable via JSON.
- **Date Standardization**: Validates against multiple international date/time formats.
- **Schema Integrity**: Ensures required fields (Order ID, Product, Amount, etc.) are present and valid.
- **Automated Chunking**: Large CSV files are automatically split into manageable chunks (default 5,000 rows).
- **Interactive Dashboard**: Real-time summary of valid/invalid records and chunk management.

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
    `cd backend`
2. Create a virtual environment:
    `python -m venv venv`
    `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
3. Install dependencies:
    `pip install -r requirements.txt`
4. Start the server:
    `python main.py`

The backend will run at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
    `cd frontend`
2. Install dependencies:
    `npm install`
3. Start the development server:
    `npm run dev`

The frontend will run at `http://localhost:3000`.

## How to Use

1. **Prepare Data**: Ensure your CSV has columns: `order_id`, `product_name`, `amount`, `payment_mode`, `phone`, `country_code`, `transaction_date`.
2. **Upload**: Drag and drop your CSV into the dashboard.
3. **Validate**: The system will process the file in the background.
4. **Download**: Once finished, download the validated chunks from the dashboard.

## Configuration

You can modify `backend/config.json` to add new country codes or date formats without changing code.

Example structure for `config.json`:
    {
      "phone_rules": {
        "MY": {
          "country_name": "Malaysia",
          "length": 9,
          "regex": "^[1]\\d{8}$"
        }
      }
    }

## Project Structure

- `backend/`: FastAPI application, validation logic, and file processing.
- `frontend/`: React + Vite application with Tailwind CSS.
- `config.json`: Centralized business rules for validation.
- `docker-compose.yml`: For containerized deployment.

## Troubleshooting

- **CORS Errors**: Ensure the backend allows `http://localhost:3000` (it is currently set to `*` for development).
- **Missing Columns**: If your CSV is missing required columns, the UI will display a processing error.
- **Large Files**: For extremely large files (1GB+), consider increasing the backend timeout settings.
