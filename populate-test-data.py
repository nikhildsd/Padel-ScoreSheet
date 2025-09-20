#!/usr/bin/env python3

import requests
import json
import sys

def populate_test_data(base_url="http://localhost:3000"):
    """Populate Padel courts with random test data"""

    print("🎾 Populating Padel courts with random test data...")

    try:
        response = requests.post(
            f"{base_url}/api/populate-test-data",
            headers={"Content-Type": "application/json"}
        )

        result = response.json()

        if result.get("success"):
            print(f"✅ Success! {result.get('message')}")
            print(f"🕒 Timestamp: {result.get('timestamp')}")
            print("\n🏆 All courts now have random team names and scores!")
            print(f"📱 Check your app at {base_url}")
        else:
            print(f"❌ Error: {result.get('error')}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to {base_url}")
        print("💡 Make sure your Next.js app is running")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    # Allow custom URL as command line argument
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    populate_test_data(url)