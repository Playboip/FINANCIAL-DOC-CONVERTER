import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import stripe
import shutil

# -----------------------------
# Environment variables
# -----------------------------
# Explicitly fetch the remote MONGO_URL set on the Railway dashboard
MONGO_URL = os.getenv("MONGO_URL")
# --- FINAL FIX: Explicitly set the database name based on your choice ---
DB_NAME = "FDC" 
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

# --- CRITICAL CHECK: Ensure the remote variable is loaded ---
if not MONGO_URL or "localhost" in MONGO_URL or "127.0.0.1" in MONGO_URL:
    # If it's missing or still contains a local value, raise a clear error
    raise ValueError(
        "MONGO_URL is either not set or still points to 'localhost'. "
        "You MUST set the environment variable on your Railway service to the correct remote URI (e.g., mongodb://mongo:***@crossover.proxy.rlwy.net:27384)."
    )
if not STRIPE_SECRET_KEY:
    raise ValueError("STRIPE_SECRET_KEY not set in environment")
# -------------------------------------------------------------

# Initialize Stripe
stripe.api_key = STRIPE_SECRET_KEY
print("✅ Stripe secret key loaded successfully.")

# -----------------------------
# MongoDB client
# -----------------------------
try:
    # Attempt to initialize the Motor client using the confirmed remote MONGO_URL
    client = AsyncIOMotorClient(MONGO_URL)
    # --- Using the explicit database name: FDC ---
    db = client[DB_NAME] 
    print(f"✅ MongoDB connected successfully to database: {DB_NAME}.")
except Exception as e:
    # If connection fails (e.g., credentials or network issue), provide details
    raise RuntimeError(
        f"Failed to connect to MongoDB. "
        f"Original error: {str(e)}. "
        f"Double-check the MONGO_URL credentials and network settings on Railway."
    )

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI()

# -----------------------------
# Utility for saving uploaded files
# -----------------------------
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file_locally(upload_file: UploadFile) -> str:
    try:
        file_path = os.path.join(UPLOAD_DIR, upload_file.filename)
        # Ensure the file pointer is at the beginning before copying
        upload_file.file.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        # Close the file stream
        upload_file.file.close()


# -----------------------------
# Endpoints
# -----------------------------
@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = save_file_locally(file)
    return {"filename": file.filename, "path": file_path}

@app.post("/convert")
async def convert_file(file: UploadFile = File(...)):
    """
    Dummy conversion: just saves the file and returns new path.
    Extend this with your actual conversion logic.
    """
    file_path = save_file_locally(file)
    converted_path = file_path + ".converted"  # Example
    shutil.copy(file_path, converted_path)
    return {"original": file.filename, "converted_path": converted_path}

@app.post("/create-payment-intent")
async def create_payment_intent(amount: int):
    """
    Create Stripe PaymentIntent
    """
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd"
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

# -----------------------------
# MongoDB CRUD endpoints
# -----------------------------
@app.post("/add-document")
async def add_document(collection_name: str, document: dict):
    try:
        collection = db[collection_name]
        result = await collection.insert_one(document)
        # Using str() is necessary as MongoDB's ObjectId is not JSON serializable
        return {"inserted_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert document: {str(e)}")

@app.get("/get-documents")
async def get_documents(collection_name: str):
    try:
        collection = db[collection_name]
        cursor = collection.find({})
        documents = []
        async for doc in cursor:
            # Convert ObjectId to string for JSON serialization
            doc["_id"] = str(doc["_id"])
            documents.append(doc)
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

# -----------------------------
# Uvicorn launch for Railway
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    # Use environment variable PORT, or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
