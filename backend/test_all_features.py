"""
Comprehensive Feature Testing Script
Tests all API endpoints to identify working vs broken features
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8003/api/v1"

# Test credentials
TEST_EMAIL = "owner@myhotel.com"
TEST_PASSWORD = "Owner@123"

class FeatureTester:
    def __init__(self):
        self.token = None
        self.hotel_id = None
        self.results = {
            "working": [],
            "broken": [],
            "not_implemented": []
        }
    
    def test_auth(self):
        """Test authentication"""
        print("\n🔐 Testing Authentication...")
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                print("✅ Login: WORKING")
                self.results["working"].append("Authentication - Login")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                self.results["broken"].append(f"Authentication - Login ({response.status_code})")
                return False
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            self.results["broken"].append(f"Authentication - Login (Error: {str(e)})")
            return False
    
    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"}
    
    def test_hotels(self):
        """Test hotel endpoints"""
        print("\n🏨 Testing Hotels...")
        try:
            response = requests.get(f"{BASE_URL}/hotels/me", headers=self.get_headers())
            if response.status_code == 200:
                data = response.json()
                self.hotel_id = data.get("id")
                print(f"✅ Get Hotel: WORKING (Hotel: {data.get('name')})")
                self.results["working"].append("Hotels - Get My Hotel")
            else:
                print(f"❌ Get Hotel failed: {response.status_code}")
                self.results["broken"].append(f"Hotels - Get My Hotel ({response.status_code})")
        except Exception as e:
            print(f"❌ Hotels error: {str(e)}")
            self.results["broken"].append(f"Hotels ({str(e)})")
    
    def test_rooms(self):
        """Test room management"""
        print("\n🛏️ Testing Rooms...")
        try:
            # Get rooms
            response = requests.get(f"{BASE_URL}/rooms", headers=self.get_headers())
            if response.status_code == 200:
                print(f"✅ Get Rooms: WORKING ({len(response.json())} rooms)")
                self.results["working"].append("Rooms - List")
            else:
                print(f"⚠️ Get Rooms: {response.status_code}")
                self.results["broken"].append(f"Rooms - List ({response.status_code})")
            
            # Create room
            room_data = {
                "name": "Test Deluxe Room",
                "room_type": "deluxe",
                "base_price": 5000,
                "max_occupancy": 2,
                "total_rooms": 10
            }
            response = requests.post(f"{BASE_URL}/rooms", json=room_data, headers=self.get_headers())
            if response.status_code in [200, 201]:
                print("✅ Create Room: WORKING")
                self.results["working"].append("Rooms - Create")
            else:
                print(f"⚠️ Create Room: {response.status_code} - {response.text[:100]}")
                self.results["broken"].append(f"Rooms - Create ({response.status_code})")
        except Exception as e:
            print(f"❌ Rooms error: {str(e)}")
            self.results["broken"].append(f"Rooms ({str(e)})")
    
    def test_rates(self):
        """Test rate management"""
        print("\n💰 Testing Rates...")
        try:
            response = requests.get(f"{BASE_URL}/rates", headers=self.get_headers())
            if response.status_code == 200:
                print(f"✅ Get Rates: WORKING")
                self.results["working"].append("Rates - List")
            elif response.status_code == 404:
                print("⚠️ Rates endpoint not found")
                self.results["not_implemented"].append("Rates")
            else:
                print(f"⚠️ Get Rates: {response.status_code}")
                self.results["broken"].append(f"Rates ({response.status_code})")
        except Exception as e:
            print(f"❌ Rates error: {str(e)}")
            self.results["broken"].append(f"Rates ({str(e)})")
    
    def test_availability(self):
        """Test availability calendar"""
        print("\n📅 Testing Availability...")
        try:
            today = datetime.now().date()
            response = requests.get(
                f"{BASE_URL}/availability",
                params={"start_date": str(today), "end_date": str(today + timedelta(days=30))},
                headers=self.get_headers()
            )
            if response.status_code == 200:
                print("✅ Get Availability: WORKING")
                self.results["working"].append("Availability - Calendar")
            else:
                print(f"⚠️ Get Availability: {response.status_code}")
                self.results["broken"].append(f"Availability ({response.status_code})")
        except Exception as e:
            print(f"❌ Availability error: {str(e)}")
            self.results["broken"].append(f"Availability ({str(e)})")
    
    def test_bookings(self):
        """Test booking management"""
        print("\n📝 Testing Bookings...")
        try:
            response = requests.get(f"{BASE_URL}/bookings", headers=self.get_headers())
            if response.status_code == 200:
                print(f"✅ Get Bookings: WORKING ({len(response.json())} bookings)")
                self.results["working"].append("Bookings - List")
            else:
                print(f"⚠️ Get Bookings: {response.status_code}")
                self.results["broken"].append(f"Bookings ({response.status_code})")
        except Exception as e:
            print(f"❌ Bookings error: {str(e)}")
            self.results["broken"].append(f"Bookings ({str(e)})")
    
    def test_guests(self):
        """Test guest management"""
        print("\n👥 Testing Guests...")
        try:
            response = requests.get(f"{BASE_URL}/bookings/guests", headers=self.get_headers())
            if response.status_code == 200:
                print(f"✅ Get Guests: WORKING")
                self.results["working"].append("Guests - List")
            elif response.status_code == 404:
                print("⚠️ Guests endpoint not found")
                self.results["not_implemented"].append("Guests")
            else:
                print(f"⚠️ Get Guests: {response.status_code}")
                self.results["broken"].append(f"Guests ({response.status_code})")
        except Exception as e:
            print(f"❌ Guests error: {str(e)}")
            self.results["broken"].append(f"Guests ({str(e)})")
    
    def test_payments(self):
        """Test payment tracking"""
        print("\n💳 Testing Payments...")
        try:
            response = requests.get(f"{BASE_URL}/payments", headers=self.get_headers())
            if response.status_code == 200:
                print("✅ Get Payments: WORKING")
                self.results["working"].append("Payments - List")
            else:
                print(f"⚠️ Get Payments: {response.status_code}")
                self.results["broken"].append(f"Payments ({response.status_code})")
        except Exception as e:
            print(f"❌ Payments error: {str(e)}")
            self.results["broken"].append(f"Payments ({str(e)})")
    
    def test_reports(self):
        """Test reporting"""
        print("\n📊 Testing Reports...")
        try:
            response = requests.get(f"{BASE_URL}/reports/occupancy", headers=self.get_headers())
            if response.status_code == 200:
                print("✅ Occupancy Report: WORKING")
                self.results["working"].append("Reports - Occupancy")
            else:
                print(f"⚠️ Occupancy Report: {response.status_code}")
                self.results["broken"].append(f"Reports ({response.status_code})")
        except Exception as e:
            print(f"❌ Reports error: {str(e)}")
            self.results["broken"].append(f"Reports ({str(e)})")
    
    def test_dashboard(self):
        """Test dashboard stats"""
        print("\n📈 Testing Dashboard...")
        try:
            response = requests.get(f"{BASE_URL}/dashboard/stats", headers=self.get_headers())
            if response.status_code == 200:
                print("✅ Dashboard Stats: WORKING")
                self.results["working"].append("Dashboard - Stats")
            else:
                print(f"⚠️ Dashboard Stats: {response.status_code}")
                self.results["broken"].append(f"Dashboard ({response.status_code})")
        except Exception as e:
            print(f"❌ Dashboard error: {str(e)}")
            self.results["broken"].append(f"Dashboard ({str(e)})")
    
    def test_public_booking(self):
        """Test public booking engine"""
        print("\n🌐 Testing Public Booking Engine...")
        try:
            # Assuming hotel slug is available
            response = requests.get(f"{BASE_URL}/public/hotels/slug/grand-plaza-hotel")
            if response.status_code == 200:
                print("✅ Public Hotel Page: WORKING")
                self.results["working"].append("Public Booking - Hotel Page")
            else:
                print(f"⚠️ Public Hotel Page: {response.status_code}")
                self.results["broken"].append(f"Public Booking ({response.status_code})")
        except Exception as e:
            print(f"❌ Public Booking error: {str(e)}")
            self.results["broken"].append(f"Public Booking ({str(e)})")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📋 FEATURE TEST SUMMARY")
        print("="*60)
        
        print(f"\n✅ WORKING FEATURES ({len(self.results['working'])}):")
        for feature in self.results['working']:
            print(f"   • {feature}")
        
        print(f"\n❌ BROKEN FEATURES ({len(self.results['broken'])}):")
        for feature in self.results['broken']:
            print(f"   • {feature}")
        
        print(f"\n⚠️ NOT IMPLEMENTED ({len(self.results['not_implemented'])}):")
        for feature in self.results['not_implemented']:
            print(f"   • {feature}")
        
        total = len(self.results['working']) + len(self.results['broken']) + len(self.results['not_implemented'])
        working_pct = (len(self.results['working']) / total * 100) if total > 0 else 0
        print(f"\n📊 Overall Health: {working_pct:.1f}% Working")
        print("="*60)
    
    def run_all_tests(self):
        """Run all feature tests"""
        print("🚀 Starting Comprehensive Feature Test...")
        
        if not self.test_auth():
            print("\n❌ Authentication failed. Cannot proceed with other tests.")
            return
        
        self.test_hotels()
        self.test_rooms()
        self.test_rates()
        self.test_availability()
        self.test_bookings()
        self.test_guests()
        self.test_payments()
        self.test_reports()
        self.test_dashboard()
        self.test_public_booking()
        
        self.print_summary()

if __name__ == "__main__":
    tester = FeatureTester()
    tester.run_all_tests()
