
import asyncio
import httpx
import sys
from datetime import date, timedelta
import random

# Configuration
BASE_URL = "http://localhost:8003/api/v1"
EMAIL = f"test_full_{random.randint(1000,9999)}@example.com" # Random email to allow repeated runs
PASSWORD = "password123"
HOTEL_NAME = "Grand Test Hotel"

async def run_tests():
    async with httpx.AsyncClient() as client:
        print(f"\n[START] COMPREHENSIVE SYSTEM TEST against {BASE_URL}")
        print("="*60)

        # ---------------------------------------------------------
        # 1. Authentication
        # ---------------------------------------------------------
        print("\n[1] Authentication Module")
        token = ""
        headers = {}
        try:
            # Signup
            print(f"   Drafting new user: {EMAIL}...")
            signup_res = await client.post(f"{BASE_URL}/auth/signup", json={
                "email": EMAIL,
                "password": PASSWORD,
                "name": "System Tester",
                "hotel_name": HOTEL_NAME
            })
            if signup_res.status_code == 201:
                print("   [OK] Signup Successful")
            else:
                print(f"   [FAIL] Signup Failed: {signup_res.text}")
                return

            # Login
            login_res = await client.post(f"{BASE_URL}/auth/login", json={
                "email": EMAIL,
                "password": PASSWORD
            })
            
            if login_res.status_code == 200:
                token = login_res.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}
                print("   [OK] Login Successful")
            else:
                print(f"   [FAIL] Login Failed: {login_res.text}")
                return
        except Exception as e:
            print(f"   [FAIL] Auth Critical Failure: {str(e)}")
            return

        # ---------------------------------------------------------
        # 2. Room & Rate Management
        # ---------------------------------------------------------
        print("\n[2] Inventory & Rates Module")
        room_id = None
        rate_plan_id = None
        try:
            # Create Room
            room_payload = {
                "name": "Executive Suite",
                "description": "Top floor view",
                "base_price": 5000,
                "total_inventory": 10,
                "base_occupancy": 2,
                "max_occupancy": 4
            }
            create_room = await client.post(f"{BASE_URL}/rooms", json=room_payload, headers=headers)
            if create_room.status_code == 201:
                room_data = create_room.json()
                room_id = room_data["id"]
                print(f"   [OK] Created Room: {room_data['name']}")
            else:
                print(f"   [FAIL] Create Room Failed: {create_room.text}")

            # Create Rate Plan
            plan_payload = {
                "name": "Non-Refundable Deal",
                "description": "Pay now, save big",
                "meal_plan": "RO",
                "is_refundable": False,
                "cancellation_hours": 0
            }
            create_plan = await client.post(f"{BASE_URL}/rates/plans", json=plan_payload, headers=headers)
            if create_plan.status_code == 200: # or 201 depending on impl
                plan_data = create_plan.json()
                rate_plan_id = plan_data["id"]
                print(f"   [OK] Created Rate Plan: {plan_data['name']}")
            else:
                print(f"   [FAIL] Create Rate Plan Failed: {create_plan.text}")

        except Exception as e:
            print(f"   [FAIL] Inventory Error: {str(e)}")

        # ---------------------------------------------------------
        # 3. Booking Workflow
        # ---------------------------------------------------------
        print("\n[3] Booking & Reservation Module")
        booking_id = None
        try:
            if room_id:
                # Dates
                today = date.today()
                check_in = (today + timedelta(days=2)).isoformat()
                check_out = (today + timedelta(days=5)).isoformat()
                
                # Create Booking
                guest_email = f"guest_{random.randint(100,999)}@gmail.com"
                booking_payload = {
                    "check_in": check_in,
                    "check_out": check_out,
                    "guest": {
                        "first_name": "Alice", 
                        "last_name": "Wonderland", 
                        "email": guest_email,
                        "phone": "9876543210"
                    },
                    "rooms": [
                        {
                            "room_type_id": room_id,
                            "room_type_name": "Executive Suite",
                            "guests": 2,
                            "price_per_night": 5000,
                            "total_price": 15000 
                        }
                    ],
                    "source": "manual",
                    "special_requests": "Late check-in please"
                }
                
                create_booking = await client.post(f"{BASE_URL}/bookings", json=booking_payload, headers=headers)
                
                if create_booking.status_code == 201:
                    booking_data = create_booking.json()
                    booking_id = booking_data["id"]
                    total_amt = booking_data["total_amount"]
                    print(f"   [OK] Created Booking #{booking_data['booking_number']} for {guest_email}")
                    print(f"      Status: {booking_data['status']}, Amount: {total_amt}")
                else:
                    print(f"   [FAIL] Create Booking Failed: {create_booking.text}")

                # Update Booking (Cancel it later, but first simulate payment)
            
        except Exception as e:
            print(f"   [FAIL] Booking Error: {str(e)}")

        # ---------------------------------------------------------
        # 4. Financials (Payments)
        # ---------------------------------------------------------
        print("\n[4] Financials & Payments Module")
        try:
            if booking_id:
                payment_payload = {
                    "booking_id": booking_id,
                    "amount": 5000, # Partial payment
                    "payment_method": "credit_card",
                    "transaction_id": f"TXN_{random.randint(10000,99999)}"
                }
                
                pay_res = await client.post(f"{BASE_URL}/payments", json=payment_payload, headers=headers)
                if pay_res.status_code == 200:
                    pay_data = pay_res.json()
                    print(f"   [OK] Payment Recorded: {pay_data['amount']} via {pay_data['payment_method']}")
                    
                    # Verify booking update reflection
                    b_check = await client.get(f"{BASE_URL}/bookings/{booking_id}", headers=headers)
                    if b_check.status_code == 200:
                        b_data = b_check.json()
                        if b_data.get("paid_amount") == 5000:
                            print(f"   [OK] Booking Paid Amount updated correctly to {b_data['paid_amount']}")
                        else:
                            print(f"   [WARN] Booking Paid Amount mismatch: {b_data.get('paid_amount')}")
                else:
                    print(f"   [FAIL] Payment Failed: {pay_res.text}")

        except Exception as e:
            print(f"   [FAIL] Payment Error: {str(e)}")

        # ---------------------------------------------------------
        # 5. Guest Management
        # ---------------------------------------------------------
        print("\n[5] Guest CRM Module")
        try:
            # Check if our guest appears in the guest list
            
            guest_res = await client.get(f"{BASE_URL}/bookings/guests", headers=headers)
            if guest_res.status_code == 200:
                guests = guest_res.json()
                found = any(g['email'] == guest_email for g in guests)
                if found:
                    print(f"   [OK] Guest 'Alice Wonderland' found in CRM database")
                else:
                    print(f"   [WARN] Guest not found in list (Count: {len(guests)})")
            else:
                 print(f"   [FAIL] Fetch Guests Failed: {guest_res.text}")

        except Exception as e:
            print(f"   [FAIL] Guest Error: {str(e)}")

        # ---------------------------------------------------------
        # 6. Public Booking Engine
        # ---------------------------------------------------------
        print("\n[6] Public Booking Engine")
        try:
            me_res = await client.get(f"{BASE_URL}/hotels/me", headers=headers)
            hotel_id = me_res.json()["id"]
            
            # Simple check
            search_url = f"{BASE_URL}/public/hotels/{hotel_id}/rooms?check_in=2025-05-01&check_out=2025-05-05&guests=2"
            search_res = await client.get(search_url)
            if search_res.status_code == 200:
                print("   [OK] Public Room Search Operational")
            else:
                print(f"   [FAIL] Public Search Failed: {search_res.text}")

        except Exception as e:
             print(f"   [FAIL] Public API Error: {str(e)}")

        print("\n" + "="*60)
        print("[FINISH] SYSTEM TEST COMPLETE")
        print("="*60)

if __name__ == "__main__":
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(run_tests())
