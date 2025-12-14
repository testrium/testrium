#!/bin/bash

echo "Setting up Pramana Manager Test Environment (Linux/Mac)"

# Create test database
echo "Creating test database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pramana_test;"

# Copy test properties
echo "Copying test configuration..."
cp application-test.properties ../backend/src/main/resources/application-test.properties

echo "Setup complete! Use 'mvn spring-boot:run -Dspring-boot.run.profiles=test' to start"
