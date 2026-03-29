#!/bin/bash
# Updates the Docker Hub repository description for sddmhossain/testrium
# Usage: bash push-dockerhub-description.sh

DOCKERHUB_USERNAME="sddmhossain"
DOCKERHUB_REPO="testrium"

echo "Docker Hub Password or Access Token:"
read -s DOCKERHUB_PASSWORD

# Get JWT token
echo "Authenticating..."
TOKEN=$(curl -s -X POST "https://hub.docker.com/v2/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${DOCKERHUB_USERNAME}\", \"password\": \"${DOCKERHUB_PASSWORD}\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Check your credentials."
  exit 1
fi

echo "Authenticated."

# Short description (max 100 chars)
SHORT_DESC="Modern Test Case Management System for QA teams — Spring Boot + React, runs in minutes with Docker."

# Full description from file
FULL_DESC=$(cat dockerhub-description.md)

# Update repository
echo "Updating Docker Hub description..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  "https://hub.docker.com/v2/repositories/${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\": $(echo "$SHORT_DESC" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),
    \"full_description\": $(echo "$FULL_DESC" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
  }")

if [ "$HTTP_CODE" = "200" ]; then
  echo "Done! Visit: https://hub.docker.com/r/${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}"
else
  echo "Failed (HTTP $HTTP_CODE)"
fi
