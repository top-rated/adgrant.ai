#!/bin/bash

# ==============================================
# Ad Grant AI - Deployment Script
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your configuration before running again"
            print_warning "Required: AI_PROVIDER, API keys, and other settings"
            exit 1
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
    print_success ".env file found"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p exports logs
    print_success "Directories created"
}

# Build and start the application
deploy_app() {
    print_status "Building and starting Ad Grant AI..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Build the application
    print_status "Building Docker image..."
    docker-compose build --no-cache
    
    # Start the application
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Ad Grant AI is now running!"
}

# Deploy with production profile (includes nginx)
deploy_production() {
    print_status "Deploying in production mode with nginx..."
    
    # Stop existing containers
    docker-compose --profile production down --remove-orphans
    
    # Build the application
    print_status "Building Docker image..."
    docker-compose --profile production build --no-cache
    
    # Start the application with production profile
    print_status "Starting production services..."
    docker-compose --profile production up -d
    
    print_success "Ad Grant AI is now running in production mode!"
    print_status "Application available at: http://localhost"
    print_status "API available at: http://localhost/api/v1"
}

# Health check
health_check() {
    print_status "Checking application health..."
    
    # Wait for application to start
    sleep 10
    
    # Check if container is running
    if docker-compose ps | grep -q "ad-grant-ai.*Up"; then
        print_success "Application container is running"
        
        # Check health endpoint
        if curl -f http://localhost:3000/health &> /dev/null; then
            print_success "Application is healthy and responding"
            print_status "Application URL: http://localhost:3000"
            print_status "API URL: http://localhost:3000/api/v1"
        else
            print_warning "Application container is running but not responding to health checks"
            print_status "Check logs with: docker-compose logs ad-grant-ai"
        fi
    else
        print_error "Application container is not running"
        print_status "Check logs with: docker-compose logs ad-grant-ai"
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start                Start the application in development mode"
    echo "  production          Start the application in production mode (with nginx)"
    echo "  stop                Stop all services"
    echo "  restart             Restart all services"
    echo "  logs                Show application logs"
    echo "  health              Check application health"
    echo "  clean               Stop and remove all containers, images, and volumes"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start            # Start in development mode"
    echo "  $0 production       # Start in production mode"
    echo "  $0 logs             # View logs"
    echo "  $0 clean            # Clean up everything"
}

# Main script logic
case "${1:-start}" in
    start)
        print_status "Starting Ad Grant AI in development mode..."
        check_docker
        check_env_file
        create_directories
        deploy_app
        health_check
        ;;
    production)
        print_status "Starting Ad Grant AI in production mode..."
        check_docker
        check_env_file
        create_directories
        deploy_production
        health_check
        ;;
    stop)
        print_status "Stopping Ad Grant AI..."
        docker-compose --profile production down
        print_success "Ad Grant AI stopped"
        ;;
    restart)
        print_status "Restarting Ad Grant AI..."
        docker-compose restart
        print_success "Ad Grant AI restarted"
        ;;
    logs)
        print_status "Showing Ad Grant AI logs..."
        docker-compose logs -f ad-grant-ai
        ;;
    health)
        health_check
        ;;
    clean)
        print_warning "This will remove all containers, images, and volumes. Are you sure? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_status "Cleaning up..."
            docker-compose --profile production down --volumes --remove-orphans
            docker system prune -af --volumes
            print_success "Cleanup completed"
        else
            print_status "Cleanup cancelled"
        fi
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
