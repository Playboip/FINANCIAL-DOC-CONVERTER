import os
from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
import stripe

# --------------------------
# CONFIGURATION
# --------------------------
# Railway dynamic port
PORT = int(os.getenv("PORT", 8000))

# Stripe API key from Railway env
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
if not STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY not set in environment")
stripe.api_key = STRIPE_API_KEY

# MongoDB connection
raw_mongo_url = os.getenv("MONGO_URL")
if not raw_mongo_url:
    raise ValueError("MONGO_URL environment variable not set in Railway.")

# Self-healing URI
if not raw_mongo_url.startswith("mongodb://") and not raw_mongo_url.startswith("mongodb+srv://"):
    raw_mongo_url = f"mongodb://{raw_mongo_url}"

# Default database name
DB_NAME = os.getenv("DB_NAME", "mydatabase")
if "/" not in raw_mongo_url.split("@")[-1]:
    raw_mongo_url += f"/{DB_NAME}"

print(f"Connecting to MongoDB at: {raw_mongo_url}")

client = AsyncIOMotorClient(raw_mongo_url)
db = client.get_default_database()

# --------------------------
# FASTAPI APP
# --------------------------
app = FastAPI(title="Railway FastAPI Backend")

# --------------------------
# TEST ROUTE
# --------------------------
@app.get("/health")
async def health_check():
    return {"status": "ok", "db": DB_NAME}

# --------------------------
# SAMPLE STRIPE ROUTE
# --------------------------
@app.post("/create-checkout-session")
async def create_checkout_session():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": "Test Product"},
                    "unit_amount": 500,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel",
        )
        return {"id": session.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --------------------------
# RUN UVICORN IF MAIN
# --------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
