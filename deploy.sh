#!/bin/bash

################################################################################
# Pramana Manager Deployment Script
# Version: 1.7.0
# Description: Automated deployment script for different environments
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="."
VERSION="1.7.0"

# Functions
print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

check_requirements() {
    print_header "Checking Requirements"

    # Check Java
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 17 ]; then
            print_success "Java $JAVA_VERSION found"
        else
            print_error "Java 17+ required, found Java $JAVA_VERSION"
            exit 1
        fi
    else
        print_error "Java not found. Please install Java 17+"
        exit 1
    fi

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node -v) found"
        else
            print_error "Node.js 18+ required, found $(node -v)"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi

    # Check MySQL
    if command -v mysql &> /dev/null; then
        print_success "MySQL found"
    else
        print_warning "MySQL client not found. Make sure MySQL server is running."
    fi

    # Check Maven
    if command -v mvn &> /dev/null; then
        print_success "Maven $(mvn -v | head -1 | cut -d' ' -f3) found"
    else
        print_warning "Maven not found. Using Maven Wrapper if available."
    fi
}

setup_database() {
    print_header "Database Setup"

    read -p "MySQL root password: " -s MYSQL_PASSWORD
    echo

    read -p "Database name (default: pramana_manager): " DB_NAME
    DB_NAME=${DB_NAME:-pramana_manager}

    read -p "Create new database? (y/n): " CREATE_DB
    if [ "$CREATE_DB" == "y" ]; then
        mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null
        if [ $? -eq 0 ]; then
            print_success "Database '$DB_NAME' created/verified"
        else
            print_error "Failed to create database. Check MySQL credentials."
            exit 1
        fi
    fi
}

build_backend() {
    print_header "Building Backend"

    cd "$BACKEND_DIR"

    # Check if mvnw exists
    if [ -f "./mvnw" ]; then
        print_success "Using Maven Wrapper"
        ./mvnw clean package -DskipTests
    elif command -v mvn &> /dev/null; then
        print_success "Using system Maven"
        mvn clean package -DskipTests
    else
        print_error "Neither Maven nor Maven Wrapper found"
        exit 1
    fi

    if [ $? -eq 0 ]; then
        print_success "Backend built successfully: pramana-manager-$VERSION.jar"
    else
        print_error "Backend build failed"
        exit 1
    fi

    cd ..
}

build_frontend() {
    print_header "Building Frontend"

    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_warning "Installing npm dependencies..."
        npm install
    else
        print_success "Dependencies already installed"
    fi

    # Build frontend
    npm run build

    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

deploy_development() {
    print_header "Development Deployment"

    # Start backend
    print_success "Starting backend on port 8080..."
    cd "$BACKEND_DIR"

    if [ -f "target/pramana-manager-$VERSION.jar" ]; then
        nohup java -jar "target/pramana-manager-$VERSION.jar" > ../backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        print_success "Backend started (PID: $BACKEND_PID)"
    else
        print_error "Backend JAR not found. Run build first."
        exit 1
    fi

    cd ..

    # Wait for backend to start
    print_warning "Waiting for backend to start..."
    sleep 10

    # Start frontend
    print_success "Starting frontend on port 5173..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    print_success "Frontend started (PID: $FRONTEND_PID)"

    echo
    print_success "Deployment complete!"
    echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
    echo -e "${GREEN}Backend:  http://localhost:8080${NC}"
}

deploy_production() {
    print_header "Production Deployment"

    # Build backend
    build_backend

    # Build frontend
    build_frontend

    # Create deployment directory
    DEPLOY_DIR="/opt/pramana-manager"
    print_warning "Creating deployment directory: $DEPLOY_DIR"

    sudo mkdir -p "$DEPLOY_DIR/backend"
    sudo mkdir -p "$DEPLOY_DIR/frontend"

    # Copy backend
    sudo cp "$BACKEND_DIR/target/pramana-manager-$VERSION.jar" "$DEPLOY_DIR/backend/"
    print_success "Backend copied to $DEPLOY_DIR/backend"

    # Copy frontend
    sudo cp -r dist/* "$DEPLOY_DIR/frontend/"
    print_success "Frontend copied to $DEPLOY_DIR/frontend"

    # Create systemd service
    print_warning "Creating systemd service..."

    cat << EOF | sudo tee /etc/systemd/system/pramana-backend.service > /dev/null
[Unit]
Description=Pramana Manager Backend
After=mysql.service

[Service]
User=$USER
WorkingDirectory=$DEPLOY_DIR/backend
ExecStart=/usr/bin/java -jar $DEPLOY_DIR/backend/pramana-manager-$VERSION.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable pramana-backend
    sudo systemctl start pramana-backend

    print_success "Backend service installed and started"

    # Nginx configuration
    print_warning "Installing Nginx..."

    if ! command -v nginx &> /dev/null; then
        sudo apt update
        sudo apt install nginx -y
    fi

    cat << EOF | sudo tee /etc/nginx/sites-available/pramana-manager > /dev/null
server {
    listen 80;
    server_name _;

    root $DEPLOY_DIR/frontend;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/pramana-manager /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx

    print_success "Nginx configured and started"

    echo
    print_success "Production deployment complete!"
    echo -e "${GREEN}Application: http://$(hostname -I | awk '{print $1}')${NC}"
}

stop_services() {
    print_header "Stopping Services"

    # Stop development servers
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        kill $BACKEND_PID 2>/dev/null && print_success "Backend stopped (PID: $BACKEND_PID)" || print_warning "Backend not running"
        rm backend.pid
    fi

    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        kill $FRONTEND_PID 2>/dev/null && print_success "Frontend stopped (PID: $FRONTEND_PID)" || print_warning "Frontend not running"
        rm frontend.pid
    fi

    # Stop production service
    if systemctl is-active --quiet pramana-backend; then
        sudo systemctl stop pramana-backend
        print_success "Production backend service stopped"
    fi
}

show_status() {
    print_header "Service Status"

    # Check backend
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            print_success "Backend running (PID: $BACKEND_PID)"
        else
            print_warning "Backend not running (stale PID)"
        fi
    fi

    # Check frontend
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null; then
            print_success "Frontend running (PID: $FRONTEND_PID)"
        else
            print_warning "Frontend not running (stale PID)"
        fi
    fi

    # Check production service
    if systemctl is-active --quiet pramana-backend; then
        print_success "Production backend service active"
        sudo systemctl status pramana-backend --no-pager | head -5
    fi
}

show_menu() {
    echo
    echo "╔════════════════════════════════════════════╗"
    echo "║   Pramana Manager Deployment Script       ║"
    echo "║   Version: $VERSION                         ║"
    echo "╚════════════════════════════════════════════╝"
    echo
    echo "1) Check Requirements"
    echo "2) Setup Database"
    echo "3) Build Backend"
    echo "4) Build Frontend"
    echo "5) Deploy Development"
    echo "6) Deploy Production"
    echo "7) Stop Services"
    echo "8) Show Status"
    echo "9) Exit"
    echo
    read -p "Select option [1-9]: " choice

    case $choice in
        1) check_requirements ;;
        2) setup_database ;;
        3) build_backend ;;
        4) build_frontend ;;
        5) deploy_development ;;
        6) deploy_production ;;
        7) stop_services ;;
        8) show_status ;;
        9) exit 0 ;;
        *) print_error "Invalid option"; show_menu ;;
    esac

    echo
    read -p "Press Enter to continue..."
    show_menu
}

# Main
if [ "$1" == "--dev" ]; then
    check_requirements
    build_backend
    build_frontend
    deploy_development
elif [ "$1" == "--prod" ]; then
    check_requirements
    setup_database
    deploy_production
elif [ "$1" == "--stop" ]; then
    stop_services
elif [ "$1" == "--status" ]; then
    show_status
else
    show_menu
fi
