from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import stripe
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS - MODIFIED for better handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # React default
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly list methods
    allow_headers=["Content-Type", "Accept", "Authorization"],  # Explicitly list headers
    expose_headers=["Content-Type"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Initialize Stripe - with error handling
try:
    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe_key:
        print("WARNING: STRIPE_SECRET_KEY environment variable not found!")
    stripe.api_key = stripe_key
except Exception as e:
    print(f"Error initializing Stripe: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "Stripe Payment API is running"}

@app.get("/api/payment/v1/health")
def health_check():
    return {
        "status": "healthy",
        "stripe_configured": bool(stripe.api_key)
    }

@app.options("/api/payment/v1/create-payment-intent")
async def options_payment_intent():
    # Explicitly handle OPTIONS requests
    return JSONResponse(
        content={"message": "OK"},
        status_code=200,
    )

@app.post("/api/payment/v1/create-payment-intent")
async def create_payment_intent(request: Request):
    try:
        # Verify API key is available
        if not stripe.api_key:
            raise HTTPException(
                status_code=500, 
                detail="Stripe API key not configured. Please check server configuration."
            )
            
        # Parse request data
        try:
            data = await request.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
            
        registration = data.get("registration")
        amount = data.get("amount")
        email = data.get("email")
        report_url = data.get("report_url", "")
        
        if not registration:
            raise HTTPException(status_code=400, detail="Vehicle registration is required")
            
        if not amount or amount < 100:
            raise HTTPException(status_code=400, detail="Valid amount is required (minimum 100 pence)")
            
        if not email:
            raise HTTPException(status_code=400, detail="Email address is required")
        
        # Create full URL with payment details that will be included in the receipt
        full_report_url = f"{report_url}?paymentId={{PAYMENT_ID}}"
        
        # Create a description that includes the report URL
        # Note: We use a placeholder for the payment ID that we'll update after payment is complete
        description = f"Premium Vehicle Report for {registration}. Access your report at: {full_report_url}"
        
        # Create a payment intent with enhanced description
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="gbp",
            receipt_email=email,  # Stripe will send receipt to this email
            metadata={
                "registration": registration,
                "product": "Premium Vehicle Report",
                "report_url": report_url  # Store the report URL in metadata
            },
            description=description,
        )
        
        # Update the description with the actual payment ID
        # This ensures the URL in the receipt email contains the correct payment ID
        updated_description = description.replace("{PAYMENT_ID}", payment_intent.id)
        payment_intent = stripe.PaymentIntent.modify(
            payment_intent.id,
            description=updated_description,
        )
        
        return {
            "clientSecret": payment_intent.client_secret,
            "paymentIntentId": payment_intent.id
        }
        
    except stripe.error.StripeError as e:
        # Handle Stripe-specific errors
        print(f"Stripe Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing payment: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred processing your payment")

# Run on port 8001 instead of 8000 to avoid conflicts
if __name__ == "__main__":
    try:
        # Use reload=True in development for auto-reloading on code changes
        uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
    except Exception as e:
        print(f"Server startup error: {str(e)}")