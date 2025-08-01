# Ad Grant AI - Docker Deployment

Simple Docker deployment for the Ad Grant AI Campaign Generator.

## Prerequisites

- Docker and Docker Compose installed
- Azure OpenAI API key

## Quick Start

1. **Setup Environment**

```bash
cp .env.example .env
# Edit .env with your API keys
```

2. **Deploy**

```bash
# Development mode
./deploy.sh start

# Production mode (with Nginx)
./deploy.sh production
```

## Environment Variables

Edit `.env` with your actual values:

```env
# Server
BASE_URL=http://localhost:3000/api/v1
PORT=3000
API_V1_PREFIX=/api/v1

# Azure OpenAI (Required)
MODEL_NAME=gpt-4o
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_API_INSTANCE_NAME=your_instance
AZURE_OPENAI_API_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# LinkedIn Integration (Optional)
ACCOUNT_ID=your_account_id
UNIPILE_BASE_URL=
UNIPILE_ACCESS_TOKEN=your_token
COMPANY_MAILBOX_ID=

# Other (Optional)
JWT_SECRET=your_jwt_secret
JINJA_API_KEY=your_jinja_key
```

## Commands

```bash
./deploy.sh start      # Start development
./deploy.sh production # Start with Nginx
./deploy.sh stop       # Stop services
./deploy.sh logs       # View logs
./deploy.sh health     # Check health
./deploy.sh clean      # Clean up
```

## Access

- **Development**: http://localhost:3000
- **Production**: http://localhost (port 80)
- **Health Check**: http://localhost:3000/health

## Troubleshooting

```bash
# Check logs
docker-compose logs ad-grant-ai

# Test API
curl http://localhost:3000/health
```
