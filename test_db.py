import os
import sys
from sqlalchemy import create_engine, text

db_url = "postgresql://postgres:fsdfasrfadsgasgl@db.zoivmxuynubdvfzfoepx.supabase.co:5432/postgres"
engine = create_engine(db_url)
with engine.connect() as conn:
    # Set all accounts to verified and unlock them
    conn.execute(text("UPDATE companies SET is_verified = true, locked_until = null, failed_login_attempts = 0"))
    conn.commit()
    print("All accounts unlocked and verified.")
