#!/usr/bin/env bash
set -e
BASE="http://174.165.78.29:8090/api"

ADMIN_TOKEN="$1"
DEALER_EMAIL="dealer@mzadcars.qa"
NEW_PASS="Dealer#12345"

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Usage: $0 <admin_token>"
  exit 1
fi

# 1. Find the dealer user_id
echo "--- Listing users ---"
USERS=$(curl -sf "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$USERS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
rows = data.get('rows', data) if isinstance(data, dict) else data
for u in rows:
    print(u.get('user_id','?'), '|', u.get('email','?'), '|', u.get('role','?'))
"

# 2. Get user_id for dealer
USER_ID=$(echo "$USERS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
rows = data.get('rows', data) if isinstance(data, dict) else data
for u in rows:
    if u.get('email') == 'dealer@mzadcars.qa':
        print(u.get('user_id',''))
        break
")
echo "Dealer user_id: $USER_ID"

# 3. Elevate role to dealer
echo "--- Setting role=dealer ---"
curl -sf -X PATCH "$BASE/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"dealer"}'
echo ""

# 4. Change password via change-password (uses dealer's own token)
echo "--- Changing password ---"
DEALER_TOKEN=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"login":"dealer@mzadcars.qa","password":"Dealer1234!"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -sf -X POST "$BASE/auth/change-password" \
  -H "Authorization: Bearer $DEALER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"old_password\":\"Dealer1234!\",\"new_password\":\"Dealer#12345\"}"
echo ""

echo "--- Verifying new login ---"
curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"login":"dealer@mzadcars.qa","password":"Dealer#12345"}'
echo ""
echo "Done."
