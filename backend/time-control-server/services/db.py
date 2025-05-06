# services/db.py
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError("❌ Missing SUPABASE_URL or SUPABASE_KEY. Please check your .env file.")


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY[:6], "...")  # 只显示前6位做调试
