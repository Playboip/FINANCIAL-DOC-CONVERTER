import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import stripe
import shutil

# -----------------------------
# Environment variables
# -----------------------------
MONGO_URL = os.getenv("MONGO_URL")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

if not MONGO_URL:
    # This will typically be caught by the deployment environment if not set
    raise ValueError("MONGO_URL not set in environment")
if not STRIPE_SECRET_KEY:
    raise ValueError("STRIPE_SECRET_KEY not set in environment")

# Initialize Stripe
stripe.api_key = STRIPE_SECRET_KEY
print("✅ Stripe secret key loaded successfully.")

# -----------------------------
# MongoDB client
# -----------------------------
try:
    # IMPORTANT: Check for common deployment mistake (using localhost on a remote server)
    if "localhost" in MONGO_URL or "127.0.0.1" in MONGO_URL:
        print("⚠️ WARNING: MONGO_URL contains 'localhost' or '127.0.0.1'. This WILL fail on Railway/cloud deployment. Ensure you use a remote connection string!")

    # Attempt to initialize the Motor client
    client = AsyncIOMotorClient(MONGO_URL)
    # Use get_default_database(), which relies on the database name being in the URI
    db = client.get_default_database()
    print("✅ MongoDB connected successfully using remote URI.")
except Exception as e:
    # Provide a helpful error message for deployment failures
    raise RuntimeError(
        f"Failed to connect to MongoDB. "
        f"This usually means the MONGO_URL environment variable is incorrect or points to a non-existent database. "
        f"Original error: {str(e)}. "
        f"Ensure your MONGO_URL starts with 'mongodb://' or 'mongodb+srv://' and uses credentials for a REMOTE database."
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
