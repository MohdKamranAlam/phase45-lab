# Phase45R4 FastAPI (Full)

## Setup (Windows PowerShell/CMD)

```powershell
cd phase45-fastapi
py -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8001
