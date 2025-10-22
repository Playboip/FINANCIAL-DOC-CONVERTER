from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uvicorn
import stripe

# -------------------------------
# Environment Variables
# -------------------------------
MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb://mongo:ZVabyQUyjtzAwZVYvRkOhwNSZFXuODYS@mongodb.railway.internal:27017"
)
DB_NAME = os.getenv("DB_NAME", "test_database")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
STRIPE_SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "https://example.com/success")
STRIPE_CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "https://example.com/cancel")

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="FastAPI + MongoDB + Stripe on Railway")

# -------------------------------
# MongoDB Setup
# -------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# -------------------------------
# Stripe Setup
# -------------------------------
stripe.api_key = STRIPE_SECRET_KEY

# -------------------------------
# Routes
# -------------------------------
@app.get("/")
async def root():
    return {"message": "Backend running successfully"}

@app.get("/test-mongo")
async def test_mongo():
    try:
        collections = await db.list_collection_names()
        return {"status": "MongoDB connected", "collections": collections}
    except Exception as e:
        return {"status": "Error connecting to MongoDB", "detail": str(e)}

@app.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    data = await request.json()
    try:
        # Example: expects {"amount": 1000, "currency": "usd"} from frontend
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": data.get("currency", "usd"),
                    "product_data": {"name": "Example Product"},
                    "unit_amount": data.get("amount", 1000),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=STRIPE_SUCCESS_URL,
            cancel_url=STRIPE_CANCEL_URL,
        )
        return JSONResponse({"id": session.id, "url": session.url})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

# -------------------------------
# Dynamic Port for Railway
# -------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
