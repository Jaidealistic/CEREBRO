import requests
import json
import os

url = 'http://localhost:5000/api/notify-cert'
data = {
    'type': 'Malicious URL',
    'content': 'http://test-phishing-site.com'
}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
    
    # Check if file exists
    if response.status_code == 200 and 'file_saved' in response.json():
        filename = response.json()['file_saved']
        # Assuming script is run from project root
        filepath = os.path.join('backend', 'submitted_reports', filename)
        if os.path.exists(filepath):
            print(f"SUCCESS: File created at {filepath}")
        else:
            print(f"FAILURE: File {filename} reported saved but not found at {filepath}")
            # Try absolute path based on user structure
            abs_path = os.path.join(r'c:\Users\jaisu\Projects\BNY\backend\submitted_reports', filename)
            if os.path.exists(abs_path):
                 print(f"SUCCESS: File found at absolute path {abs_path}")
            else:
                 print("File definitely not found.")
    else:
        print("Response did not indicate success or file_saved.")

except Exception as e:
    print(f"Error: {e}")
