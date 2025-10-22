import os
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import stripe

app = FastAPI()

# -------------------
# Stripe Setup
# -------------------
STRIPE_KEY = os.environ.get("STRIPE_API_KEY") or os.environ.get("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")

if not STRIPE_KEY:
    print("⚠️ Warning: Stripe secret key not set! Backend payments will fail.")
else:
    stripe.api_key = STRIPE_KEY
    print("✅ Stripe secret key loaded successfully.")

if not STRIPE_PUBLISHABLE_KEY:
    print("⚠️ Warning: Stripe publishable key not set! Frontend payments may fail.")
else:
    print("✅ Stripe publishable key loaded successfully.")

# -------------------
# MongoDB Setup
# -------------------
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "test_database")

if not MONGO_URL:
    raise ValueError("MongoDB URL not set in environment variables!")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
print(f"✅ Connected to MongoDB database: {DB_NAME}")

# -------------------
# Sample Route
# -------------------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "mongo_db": DB_NAME,
        "stripe_key_loaded": bool(STRIPE_KEY),
        "stripe_publishable_loaded": bool(STRIPE_PUBLISHABLE_KEY)
    }

# -------------------
# Run Uvicorn (for Railway)
# -------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
