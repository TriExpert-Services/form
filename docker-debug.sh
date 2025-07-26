#!/bin/bash

# Script para debug del contenedor Docker
# Usar: chmod +x docker-debug.sh && ./docker-debug.sh

echo "🐛 DOCKER DEBUG SCRIPT"
echo "======================"

CONTAINER_NAME="solicitudes-traduccion-debug"
IMAGE_NAME="solicitudes-traduccion-test"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Building Docker image...${NC}"
docker build -t $IMAGE_NAME \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  --build-arg NODE_ENV=production \
  .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Starting container...${NC}"
docker run -d --name $CONTAINER_NAME -p 8080:80 \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started${NC}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    exit 1
fi

echo -e "${YELLOW}3. Waiting for container to be ready...${NC}"
sleep 5

echo -e "${YELLOW}4. Checking files inside container...${NC}"
echo "📁 Files in /usr/share/nginx/html/:"
docker exec $CONTAINER_NAME ls -la /usr/share/nginx/html/

echo -e "${YELLOW}5. Checking index.html content...${NC}"
echo "📄 First 30 lines of index.html:"
docker exec $CONTAINER_NAME head -30 /usr/share/nginx/html/index.html

echo -e "${YELLOW}6. Testing HTTP response...${NC}"
echo "🌐 HTTP Status:"
curl -I http://localhost:8080/

echo -e "${YELLOW}7. Testing health endpoint...${NC}"
echo "❤️ Health check:"
curl http://localhost:8080/health

echo -e "${YELLOW}8. Checking nginx logs...${NC}"
echo "📋 Recent nginx logs:"
docker logs $CONTAINER_NAME --tail 10

echo -e "${YELLOW}9. Opening browser test...${NC}"
echo "🔍 Testing in browser:"
echo "   → http://localhost:8080"
echo "   → Check browser console for JavaScript errors"

echo -e "${GREEN}🎉 Debug completed!${NC}"
echo ""
echo "Commands to continue debugging:"
echo "  docker exec -it $CONTAINER_NAME sh     # Enter container"
echo "  docker logs $CONTAINER_NAME            # View logs"
echo "  docker stop $CONTAINER_NAME            # Stop container" 
echo "  docker rm $CONTAINER_NAME              # Remove container"