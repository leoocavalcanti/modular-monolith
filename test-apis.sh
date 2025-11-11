#!/bin/bash

echo "🚀 Testando E-commerce Monorepo..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
  local url=$1
  local name=$2
  local response=$(curl -s -o /dev/null -w "%{http_code}" $url)
  
  if [ $response -eq 200 ]; then
    echo -e "${GREEN}✅ $name: OK${NC}"
  else
    echo -e "${RED}❌ $name: FAILED (HTTP $response)${NC}"
    return 1
  fi
}

# Testar Health Checks
echo -e "${YELLOW}📊 Testando Health Checks...${NC}"
test_endpoint "http://localhost:3000/health" "Storefront API"
test_endpoint "http://localhost:3001/health" "Admin API" 
test_endpoint "http://localhost:3002/health" "Payment API"

echo ""
echo -e "${YELLOW}🔐 Testando Autenticação...${NC}"

# Registrar usuário teste
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "autotest@test.com", "password": "123456", "firstName": "Auto", "lastName": "Test"}')

# Fazer login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "autotest@test.com", "password": "123456"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo -e "${GREEN}✅ Login: OK (Token obtido)${NC}"
else
  echo -e "${RED}❌ Login: FAILED${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🛒 Testando Endpoints Protegidos...${NC}"

# Testar endpoints que requerem autenticação
test_endpoint_with_auth() {
  local url=$1
  local name=$2
  local response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" $url)
  
  if [ $response -eq 200 ] || [ $response -eq 201 ]; then
    echo -e "${GREEN}✅ $name: OK${NC}"
  else
    echo -e "${RED}❌ $name: FAILED (HTTP $response)${NC}"
  fi
}

test_endpoint_with_auth "http://localhost:3000/products" "Produtos (Storefront)"
test_endpoint_with_auth "http://localhost:3000/cart" "Carrinho" 
test_endpoint_with_auth "http://localhost:3000/orders" "Pedidos (Cliente)"
test_endpoint_with_auth "http://localhost:3001/products" "Produtos (Admin)"

echo ""
echo -e "${GREEN}🎉 Teste completo! Verifique os resultados acima.${NC}"
echo ""
echo -e "${YELLOW}💡 Para testes manuais completos, consulte o README.md${NC}"
echo -e "${YELLOW}   Seções: '🧪 Guia Completo de Testes dos Endpoints'${NC}"