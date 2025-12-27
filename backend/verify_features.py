
import asyncio
import httpx
import sys
from datetime import date, timedelta

# Configuration
BASE_URL = "http://localhost:8003/api/v1"
EMAIL = "test_feature_user@example.com"
PASSWORD = "password123"
HOTEL_NAME = "Feature Test Hotel"

async def run_tests():
    async with httpx.AsyncClient() as client:
        print(f"[INFO] Testing against {BASE_URL}...")

        # 1. Signup / Login
        print("\n[1] Authentication")
        token = ""
        headers = {}
        try:
            # Try signup
            signup_res = await client.post(f"{BASE_URL}/auth/signup", json={
                "email": EMAIL,
                "password": PASSWORD,
                "name": "Test User",
                "hotel_name": HOTEL_NAME
            })
            if signup_res.status_code == 201:
                print("   [OK] Signup Successful")
            elif signup_res.status_code == 400 and "already registered" in signup_res.text:
                print("   [INFO] User already exists, proceeding to login")
            else:
                print(f"   [FAIL] Signup Failed: {signup_res.text}")
                return

            # Login
            login_res = await client.post(f"{BASE_URL}/auth/login", json={
                "email": EMAIL,
                "password": PASSWORD
            })
            
            if login_res.status_code != 200:
                print(f"   [FAIL] Login Failed: {login_res.text}")
                return
                
            token = login_res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("   [OK] Login Successful")
            
        except Exception as e:
            print(f"   [FAIL] Auth Error: {str(e)}")
            return

        # 2. Rooms Management
        print("\n[2] Room Management")
        room_id = None
        try:
            # Create Room
            room_payload = {
                "name": "Test Suite",
                "description": "A lux suite",
                "base_price": 5000,
                "total_inventory": 5,
                "base_occupancy": 2,
                "max_occupancy": 3
            }
            create_room = await client.post(f"{BASE_URL}/rooms", json=room_payload, headers=headers)
            if create_room.status_code == 201:
                room_data = create_room.json()
                room_id = room_data["id"]
                print(f"   [OK] Created Room: {room_data['name']} (ID: {room_id})")
            else:
                print(f"   [FAIL] Create Room Failed: {create_room.text}")

            # Edit Room (Test Patch)
            if room_id:
                update_payload = {"base_price": 6000, "extra_bed_allowed": True}
                update_room = await client.patch(f"{BASE_URL}/rooms/{room_id}", json=update_payload, headers=headers)
                if update_room.status_code == 200:
                    print("   [OK] Updated Room details")
                else:
                    print(f"   [FAIL] Update Room Failed: {update_room.text}")

        except Exception as e:
            print(f"   [FAIL] Room Error: {str(e)}")

        # 3. Booking & Availability
        print("\n[3] Bookings & Availability")
        booking_id = None
        try:
            if room_id:
                # Dates: Book for tomorrow
                today = date.today()
                check_in = (today + timedelta(days=1)).isoformat()
                check_out = (today + timedelta(days=3)).isoformat()
                
                # Create Booking
                booking_payload = {
                    "check_in": check_in,
                    "check_out": check_out,
                    "guest": {"first_name": "John", "last_name": "Doe", "email": "john@example.com"},
                    "rooms": [
                        {
                            "room_type_id": room_id,
                            "room_type_name": "Test Suite",
                            "guests": 2,
                            "price_per_night": 6000,
                            "total_price": 12000
                        }
                    ],
                    "source": "manual"
                }
                
                create_booking = await client.post(f"{BASE_URL}/bookings", json=booking_payload, headers=headers)
                
                if create_booking.status_code == 200 or create_booking.status_code == 201:
                    booking_data = create_booking.json()
                    booking_id = booking_data["id"]
                    print(f"   [OK] Created Manual Booking (ID: {booking_id})")
                else:
                    print(f"   [FAIL] Create Booking Failed: {create_booking.text}")

                # Check Availability
                avail_res = await client.get(f"{BASE_URL}/availability?start_date={check_in}&end_date={check_in}", headers=headers)
                if avail_res.status_code == 200:
                    print("   [OK] Fetched Availability Data")
                else:
                    print(f"   [FAIL] Availability Check Failed: {avail_res.text}")

        except Exception as e:
            print(f"   [FAIL] Booking Error: {str(e)}")

        # 4. Reports
        print("\n[4] Reports")
        try:
            reports_res = await client.get(f"{BASE_URL}/reports/dashboard?days=30", headers=headers)
            if reports_res.status_code == 200:
                stats = reports_res.json()
                print(f"   [OK] Fetched Dashboard Stats")
                print(f"      - Revenue: {stats['summary']['totalRevenue']}")
                print(f"      - Bookings: {stats['summary']['totalBookings']}")
            else:
                print(f"   [FAIL] Reports Failed: {reports_res.text}")
        except Exception as e:
            print(f"   [FAIL] Reports Error: {str(e)}")

        # 5. Settings
        print("\n[5] Settings (Hotel Update)")
        try:
            settings_payload = {
                "description": "Updated Description via Test",
                "settings": {"currency": "USD"}
            }
            settings_res = await client.patch(f"{BASE_URL}/hotels/me", json=settings_payload, headers=headers)
            if settings_res.status_code == 200:
                print("   [OK] Updated Hotel Settings")
            else:
                print(f"   [FAIL] Settings Update Failed: {settings_res.text}")
        except Exception as e:
            print(f"   [FAIL] Settings Error: {str(e)}")

        # 6. Public Endpoints
        print("\n[6] Public Endpoints (Booking Engine)")
        try:
            me_res = await client.get(f"{BASE_URL}/hotels/me", headers=headers)
            if me_res.status_code == 200:
                hotel_id = me_res.json()["id"]
                
                # Test Public Hotel Details
                pub_hotel = await client.get(f"{BASE_URL}/public/hotels/{hotel_id}")
                if pub_hotel.status_code == 200:
                    print(f"   [OK] Public Hotel Info: {pub_hotel.json()['name']}")
                else:
                    print(f"   [FAIL] Public Hotel Info Failed: {pub_hotel.text}")

                # Test Public Room Search (using dynamic dates)
                today = date.today()
                check_in = (today + timedelta(days=5)).isoformat()
                check_out = (today + timedelta(days=7)).isoformat()
                
                search_url = f"{BASE_URL}/public/hotels/{hotel_id}/rooms?check_in={check_in}&check_out={check_out}&guests=2"
                search_res = await client.get(search_url)
                if search_res.status_code == 200:
                    rooms = search_res.json()
                    print(f"   [OK] Public Room Search: Found {len(rooms)} room types available")
                else:
                    print(f"   [FAIL] Public Room Search Failed: {search_res.text}")
            else:
                 print("   [FAIL] Can't get hotel ID for public test")

        except Exception as e:
            print(f"   [FAIL] Public API Error: {str(e)}")

        print("\n[DONE] Test Run Complete")

if __name__ == "__main__":
    asyncio.run(run_tests())
