# 🛒 E-commerce Monorepo

**Sistema de E-commerce usando Arquitetura Modular NestJS**

Este projeto implementa um sistema de e-commerce seguindo a arquitetura modular, com 3 APIs separadas e módulos de domínio independentes.

## Arquitetura

### Apps Backend (Servidores NestJS)

#### 1. Storefront API (`/apps/storefront-api/`) - Porta 3000
API para clientes do e-commerce.

**Módulos:**
- CatalogModule (produtos)
- CartModule (carrinho)
- OrderModule (pedidos)
- IdentityModule (autenticação)

**Endpoints:**
```bash
# Produtos
GET /products                    # Listar produtos
GET /products/search?q=termo     # Buscar produtos
GET /products/:id                # Produto por ID

# Carrinho
GET /cart                        # Carrinho do usuário
POST /cart/items                 # Adicionar ao carrinho
PUT /cart/items/:productId       # Atualizar quantidade
DELETE /cart/items/:productId    # Remover item
DELETE /cart                     # Limpar carrinho

# Pedidos
GET /orders                      # Pedidos do usuário
GET /orders/:id                  # Pedido por ID
POST /orders                     # Criar pedido (checkout)

# Autenticação
POST /auth/login                 # Login cliente
```

#### 2. Admin API (`/apps/admin-api/`) - Porta 3001
API para administração do e-commerce.

**Módulos:**
- CatalogModule (gestão de produtos)
- OrderModule (gestão de pedidos)
- PaymentModule (relatórios financeiros)
- IdentityModule (gestão de usuários)

**Endpoints:**
```bash
# Gestão de Produtos
POST /products                   # Criar produto
PUT /products/:id                # Atualizar produto
DELETE /products/:id             # Deletar produto

# Gestão de Pedidos
PUT /orders/:id/status           # Atualizar status do pedido

# Relatórios Financeiros
GET /payments                    # Todos os pagamentos
GET /payments/order/:orderId     # Pagamentos por pedido

# Gestão de Usuários
GET /users                       # Listar clientes
```

#### 3. Payment API (`/apps/payment-api/`) - Porta 3002
API especializada em processamento de pagamentos.

**Módulos:**
- PaymentModule (APENAS processamento)

**Endpoints:**
```bash
# Processamento de Pagamentos
POST /payments/process           # Processar pagamento
GET /payments/:id                # Status do pagamento

# Webhooks
POST /webhooks/simulator         # Webhook simulado
```

### Packages de Domínio

#### 1. Catalog (`/packages/catalog/`)
Domínio de produtos.

**Entidades:**
- `CatalogProduct` - Produtos do catálogo

**Serviços:**
- `CatalogProductService` - Gestão de produtos
- `CatalogFacade` - API pública

#### 2. Cart (`/packages/cart/`)
Domínio de carrinho de compras.

**Entidades:**
- `CartShoppingCart` - Carrinho de compras
- `CartShoppingCartItem` - Itens do carrinho

**Serviços:**
- `CartService` - Gestão de carrinho
- `CartFacade` - API pública

#### 3. Order (`/packages/order/`)
Domínio de pedidos.

**Entidades:**
- `OrderPurchaseOrder` - Pedidos
- `OrderPurchaseOrderItem` - Itens do pedido

**Serviços:**
- `OrderService` - Gestão de pedidos
- `OrderFacade` - API pública
- `PaymentApiClient` - Cliente HTTP para Payment API

#### 4. Payment (`/packages/payment/`)
Domínio de pagamentos.

**Entidades:**
- `PaymentTransaction` - Transações de pagamento

**Serviços:**
- `PaymentProcessingService` - Processamento de pagamentos
- `PaymentSimulatorService` - Simulador de pagamentos (substitui Stripe)
- `PaymentFacade` - API pública

#### 5. Identity (`/packages/identity/`)
Domínio de usuários (reutiliza módulo existente).

#### 6. Shared (`/packages/shared/`)
Utilitários compartilhados (reutiliza módulo existente).

## Comunicação HTTP Entre APIs

### Storefront API → Payment API
```typescript
// packages/order/http/client/payment-api.client.ts
@Injectable()
export class PaymentApiClient {
  async processPayment(data: PaymentRequest): Promise<PaymentResult> {
    return this.httpClient.post('http://payment-api:3002/payments/process', data);
  }
}
```

### Admin API → Payment API
```typescript
// packages/shared/module/public-api/http/client/payment-api-http.client.ts
@Injectable()
export class PaymentApiHttpClient {
  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    return this.httpClient.get('http://payment-api:3002/payments/{paymentId}');
  }
}
```

## Isolamento de Estado

Cada módulo possui seu próprio banco de dados:

- **Catalog**: `ecommerce_catalog`
- **Cart**: `ecommerce_cart`
- **Order**: `ecommerce_order`
- **Payment**: `ecommerce_payment`
- **Identity**: `fakeflix_test` (reutiliza existente)

**Entidades com nomes únicos:**
- `CatalogProduct` (não `Product`)
- `CartShoppingCart` (não `Cart`)
- `OrderPurchaseOrder` (não `Order`)
- `PaymentTransaction` (não `Transaction`)

## 🚀 Sistema de Queue (BullMQ + Redis)

Sistema completo de processamento assíncrono baseado no padrão do monorepo-fakeflix:

### Queues Disponíveis
- **PAYMENT_PROCESSING**: Processamento de pagamentos
- **PAYMENT_RETRY**: Tentativas de pagamento falhadas
- **ORDER_FULFILLMENT**: Fulfillment de pedidos  
- **EMAIL_NOTIFICATION**: Notificações por email
- **INVENTORY_UPDATE**: Atualizações de estoque
- **PAYMENT_CONFIRMATION**: Confirmações de pagamento

### Producers
- `PaymentProcessingProducer`: Enfileira jobs de pagamento
- `OrderFulfillmentProducer`: Enfileira fulfillment de pedidos

### Consumers
- `PaymentProcessingConsumer`: Processa pagamentos com retry automático
- `PaymentRetryConsumer`: Gerencia tentativas falhadas (máx 3x)
- `OrderFulfillmentConsumer`: Processa fulfillment, shipping e tracking

### Configuração Redis
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - '6379:6379'
  volumes:
    - redis-data:/data
```

## 🚀 Guia Completo de Instalação e Teste

### 1. Preparação do Ambiente

#### Instalar Dependências
```bash
# Instalar dependências
yarn install

# Verificar se está tudo funcionando
yarn nx graph
```

#### Configurar Bancos de Dados
```bash
# Subir PostgreSQL e Redis
docker-compose up -d postgres redis

# Aguardar inicialização
docker-compose logs -f postgres
```

### 2. Iniciar as APIs com NX

```bash
# Terminal 1 - Admin API (porta 3001)
npx nx serve admin-api

# Terminal 2 - Payment API (porta 3002)  
npx nx serve payment-api

# Terminal 3 - Storefront API (porta 3000)
npx nx serve storefront-api
```

### 3. URLs das APIs
- **Storefront API**: http://localhost:3000 (para clientes)
- **Admin API**: http://localhost:3001 (para administradores)
- **Payment API**: http://localhost:3002 (processamento interno)

### 4. Sistema de Autenticação JWT

Todas as APIs possuem endpoints protegidos por JWT. Para testar:

#### 4.1. Criar um Usuário (via Admin API)
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

#### 4.2. Fazer Login e Obter Token
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com", 
    "password": "123456"
  }'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

#### 4.3. Usar Token em Endpoints Protegidos
```bash
# Salvar token em variável
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar token no header Authorization
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/health
```

## 🛠️ Desenvolvimento com NX

### Scripts Disponíveis
```bash
# Lint
yarn lint:all              # Executar lint em todos os projetos
yarn lint:fix:all          # Executar lint e corrigir problemas

# Testes
yarn test:all              # Executar todos os testes
yarn test:unit:all         # Executar todos os testes unitários
yarn test:e2e:all          # Executar todos os testes E2E
yarn test:affected         # Executar testes dos projetos afetados

# Database
yarn db:migrate:all        # Executar migrações de todos os módulos

# Release
yarn release               # Criar release com conventional commits
```

### Graph de Dependências
```bash
# Visualizar dependências entre projetos
nx graph

# Executar comandos em projetos específicos
nx run catalog:test:unit
nx run storefront-api:build
nx run payment:lint:check
```

### Estrutura NX
```
monorepo/
├── apps/                  # Aplicações
│   ├── storefront-api/    
│   ├── admin-api/         
│   └── payment-api/       
├── packages/              # Bibliotecas
│   ├── catalog/           
│   ├── cart/              
│   ├── order/             
│   ├── payment/           
│   ├── identity/          
│   └── shared/            
├── nx.json                # Configuração NX
├── jest.config.ts         # Configuração Jest
├── eslint.config.mjs      # Configuração ESLint
└── tsconfig.base.json     # Configuração TypeScript base
```

## 🧪 Guia Completo de Testes dos Endpoints

### 5. Fluxo Completo de E-commerce (Teste End-to-End)

Primeiro, configure a variável do token:
```bash
# Faça login e copie o token da resposta
TOKEN="seu_token_jwt_aqui"
```

#### 5.1. Admin API - Criação de Produtos
```bash
# 1. Criar produto via Admin API
curl -X POST http://localhost:3001/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Smartphone Apple iPhone 15 Pro 128GB",
    "price": 7999.99,
    "stock": 50,
    "sku": "IPH15PRO128",
    "category": "ELECTRONICS",
    "imageUrls": ["https://example.com/iphone15pro.jpg"],
    "attributes": {
      "color": "Natural Titanium",
      "storage": "128GB",
      "brand": "Apple"
    }
  }'

# 2. Listar produtos criados
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/products

# 3. Verificar health do Admin API
curl http://localhost:3001/health
```

#### 5.2. Storefront API - Experiência do Cliente
```bash
# 1. Listar produtos disponíveis
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/products

# 2. Buscar produtos por categoria
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3000/products?category=ELECTRONICS"

# 3. Ver carrinho vazio
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/cart

# 4. Adicionar produto ao carrinho
curl -X POST http://localhost:3000/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "id_do_produto_criado",
    "productName": "iPhone 15 Pro", 
    "productSku": "IPH15PRO128",
    "price": 7999.99,
    "quantity": 2,
    "productAttributes": {
      "color": "Natural Titanium",
      "storage": "128GB"
    }
  }'

# 5. Ver carrinho com itens
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/cart

# 6. Atualizar quantidade do item
curl -X PUT http://localhost:3000/cart/items/id_do_produto \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 1}'

# 7. Criar pedido (checkout) - COMUNICAÇÃO INTER-MÓDULOS
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "Av. Paulista, 1000",
      "city": "São Paulo", 
      "state": "SP",
      "zipCode": "01310-100",
      "country": "Brazil"
    },
    "billingAddress": {
      "street": "Av. Paulista, 1000",
      "city": "São Paulo",
      "state": "SP", 
      "zipCode": "01310-100",
      "country": "Brazil"
    },
    "paymentMethod": "credit_card",
    "cardDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123",
      "holderName": "João Silva"
    },
    "customerEmail": "joao@exemplo.com"
  }'

# 8. Listar pedidos do usuário
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/orders

# 9. Ver detalhes de um pedido específico
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/orders/id_do_pedido

# 10. Verificar health do Storefront API
curl http://localhost:3000/health
```

#### 5.3. Payment API - Processamento de Pagamentos
```bash
# 1. Processar pagamento diretamente
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 7999.99,
    "currency": "BRL",
    "paymentMethod": "credit_card",
    "cardDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025", 
      "cvv": "123",
      "cardholderName": "João Silva"
    },
    "orderId": "id_do_pedido",
    "customerEmail": "joao@exemplo.com"
  }'

# 2. Consultar status do pagamento
curl http://localhost:3002/payments/id_do_pagamento

# 3. Verificar health do Payment API
curl http://localhost:3002/health

# 4. Simular pagamento PIX
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 999.99,
    "currency": "BRL", 
    "paymentMethod": "pix",
    "orderId": "id_do_pedido_pix",
    "customerEmail": "cliente@exemplo.com"
  }'

# 5. Simular pagamento Boleto
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "currency": "BRL",
    "paymentMethod": "boleto", 
    "orderId": "id_do_pedido_boleto",
    "customerEmail": "cliente@exemplo.com"
  }'
```

### 6. Teste de Comunicação Entre Módulos

#### 6.1. Storefront → Payment (via HTTP Client)
Quando você cria um pedido na Storefront API, ela automaticamente:

1. **Order Module** chama **Payment API** via `PaymentApiClient`
2. **Payment API** processa o pagamento e retorna o resultado
3. **Order Module** atualiza o status do pedido baseado no resultado
4. **Cart Module** é marcado como completado

**Para testar essa comunicação:**
```bash
# Monitore os logs das APIs em terminais separados
# Terminal 1
npx nx serve storefront-api --verbose

# Terminal 2  
npx nx serve payment-api --verbose

# Então execute o checkout e veja os logs de comunicação HTTP
```

#### 6.2. Admin → Payment (via Public API Client)
```bash
# 1. Admin consulta status de pagamentos
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/payments

# 2. Admin consulta pagamentos por pedido
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/payments/order/id_do_pedido
```

### 7. Simulação de Cenários de Pagamento

#### 7.1. Cartão Aprovado
```bash
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "paymentMethod": "credit_card",
    "cardDetails": {
      "cardNumber": "4111111111111111"
    },
    "orderId": "test-approved",
    "customerEmail": "test@exemplo.com"
  }'
```

#### 7.2. Cartão com Saldo Insuficiente
```bash
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00, 
    "paymentMethod": "credit_card",
    "cardDetails": {
      "cardNumber": "4111111111110000"
    },
    "orderId": "test-insufficient",
    "customerEmail": "test@exemplo.com"
  }'
```

#### 7.3. Cartão Recusado
```bash
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "paymentMethod": "credit_card", 
    "cardDetails": {
      "cardNumber": "4111111111111111"
    },
    "orderId": "test-declined",
    "customerEmail": "test@exemplo.com"
  }'
```

### 8. Teste de Gestão de Pedidos (Admin API)

```bash
# 1. Atualizar status de pedido
curl -X PUT http://localhost:3001/orders/id_do_pedido/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "BR123456789BR",
    "notes": "Pedido enviado via Correios"
  }'

# 2. Listar todos os pedidos (Admin)
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/orders

# 3. Filtrar pedidos por status
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3001/orders?status=SHIPPED"
```

## Seguindo ARCHITECTURE-GUIDELINES.md

Este projeto implementa rigorosamente os 10 princípios da arquitetura modular:

1. ✅ **Fronteiras Bem Definidas** - Cada módulo exporta apenas facades públicas
2. ✅ **Composabilidade** - Apps combinam módulos flexivelmente
3. ✅ **Independência** - Módulos operam autonomamente
4. ✅ **Escala Individual** - Cada API pode escalar independentemente
5. ✅ **Comunicação Explícita** - Interfaces bem definidas entre módulos
6. ✅ **Substituibilidade** - Módulos podem ser trocados
7. ✅ **Independência de Deploy** - APIs podem ser deployadas separadamente
8. ✅ **Isolamento de Estado** - Cada módulo tem seu próprio banco
9. ✅ **Observabilidade** - Logs e métricas por módulo
10. ✅ **Falha Independente** - Falhas não cascateiam entre módulos

## 🔧 Troubleshooting e Verificações

### 9. Checklist de Verificação - APIs Funcionando

Execute este checklist para verificar se tudo está funcionando:

```bash
# 1. Verificar se as APIs estão rodando
curl http://localhost:3000/health  # Storefront API
curl http://localhost:3001/health  # Admin API  
curl http://localhost:3002/health  # Payment API

# 2. Verificar se PostgreSQL está conectado
docker-compose ps postgres

# 3. Verificar se Redis está conectado
docker-compose ps redis

# 4. Testar autenticação
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "123456", "firstName": "Test", "lastName": "User"}'

# 5. Fazer login e obter token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "123456"}'
```

### 10. Problemas Comuns e Soluções

#### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
docker-compose up -d postgres
docker-compose logs postgres

# Verificar configurações de conexão
cat packages/*/config.ts
```

#### Erro: "Port already in use"
```bash
# Verificar processos rodando nas portas
lsof -i :3000
lsof -i :3001  
lsof -i :3002

# Matar processos se necessário
kill -9 PID_DO_PROCESSO
```

#### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules
yarn install

# Rebuild do NX cache
npx nx reset
```

#### Erro: "JWT malformed" ou "Unauthorized"
```bash
# Verificar se o token está correto
echo $TOKEN

# Fazer novo login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "suasenha"}'

# Usar o novo token
TOKEN="novo_token_aqui"
```

### 11. Script de Teste Automatizado

Crie um arquivo `test-apis.sh` para testes automatizados:

```bash
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
```

Para usar o script:
```bash
chmod +x test-apis.sh
./test-apis.sh
```

## Pagamentos Simulados

O sistema simula diferentes gateways de pagamento:

### Cartão de Crédito/Débito
- Cartões terminados em `0000`: Saldo insuficiente
- Cartões terminados em `1111`: Recusado pelo emissor
- Outros cartões: Aprovados

### PIX
- Gera QR Code e chave PIX simulados
- Expira em 30 minutos

### Boleto
- Gera código de barras e linha digitável
- Expira em 3 dias

## 📋 Resumo do Fluxo de Teste

1. **Preparar ambiente**: `yarn install` + `docker-compose up -d`
2. **Iniciar APIs**: `npx nx serve admin-api` + `npx nx serve payment-api` + `npx nx serve storefront-api`
3. **Registrar usuário**: POST `/auth/register` 
4. **Fazer login**: POST `/auth/login` → obter TOKEN
5. **Criar produtos**: POST `/products` (Admin API)
6. **Testar carrinho**: GET `/cart`, POST `/cart/items` (Storefront API)
7. **Fazer checkout**: POST `/orders` (triggers Payment API communication)
8. **Verificar pagamento**: GET `/payments/:id` (Payment API)
9. **Gerenciar pedidos**: PUT `/orders/:id/status` (Admin API)

**✅ Sistema completo com autenticação JWT, comunicação entre módulos e arquitetura modular!**