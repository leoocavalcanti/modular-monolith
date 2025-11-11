# 🛒 E-commerce Monorepo

**Sistema de E-commerce usando Arquitetura Modular NestJS**

Este projeto implementa um sistema de e-commerce seguindo a arquitetura modular, com 3 APIs separadas e módulos de domínio independentes.

## Arquitetura

### Apps Backend (Servidores NestJS)

#### 1. Client API (`/apps/client-api/`) - Porta 3000
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

### Client API → Payment API
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

- **Catalog**: `ecommerce_catalog_db`
- **Cart**: `ecommerce_cart_db`
- **Order**: `ecommerce_order_db`
- **Payment**: `ecommerce_payment_db`
- **Identity**: `ecommerce_identity_db`

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

# Terminal 3 - Client API (porta 3000)
npx nx serve client-api
```

### 3. URLs das APIs
- **Client API**: http://localhost:3000 (para clientes)
- **Admin API**: http://localhost:3001 (para administradores)
- **Payment API**: http://localhost:3002 (processamento interno)

### 4. ✅ Sistema Completamente Funcional

**🎉 Autenticação JWT, CRUD completo e comunicação entre módulos funcionando!**

## 📱 Guia Completo de Testes com Postman

### 4.1. Configuração do Environment Postman

Crie um Environment no Postman com essas variáveis:

```json
{
  "base_url_admin": "http://localhost:3001",
  "base_url_client": "http://localhost:3000", 
  "base_url_payment": "http://localhost:3002",
  "access_token": "",
  "user_id": "",
  "user_email": "test@example.com",
  "user_password": "123456"
}
```

### 4.2. Script de Auto-Save do Token

Adicione este script no **Tests** tab dos endpoints de login para salvar o token automaticamente:

```javascript
if (responseCode.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.access_token);
    pm.environment.set("user_id", response.user.id);
    console.log("Token salvo automaticamente:", response.access_token);
}
```

### 4.3. Fluxo de Teste Completo

#### 🔐 PASSO 1: Autenticação

##### 1.1. Registro de Usuário
**Método:** `POST`  
**URL:** `{{base_url_client}}/auth/register`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "email": "{{user_email}}",
  "password": "{{user_password}}",
  "firstName": "Test",
  "lastName": "User"
}
```

##### 1.2. Login
**Método:** `POST`  
**URL:** `{{base_url_client}}/auth/login`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "email": "{{user_email}}",
  "password": "{{user_password}}"
}
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "aa5898b8-8dc7-48d6-8e1d-6bd90e974fc7",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

#### 🏪 PASSO 2: Gestão de Produtos (Admin API)

##### 2.1. Health Check Admin
**Método:** `GET`  
**URL:** `{{base_url_admin}}/health`  
**Headers:** Nenhum necessário

##### 2.2. Criar Produto
**Método:** `POST`  
**URL:** `{{base_url_admin}}/products`  
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{access_token}}"
}
```
**Body (JSON):**
```json
{
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
}
```

##### 2.3. Listar Produtos
**Método:** `GET`  
**URL:** `{{base_url_admin}}/products`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

#### 🛒 PASSO 3: Experiência do Cliente (Client API)

##### 3.1. Ver Produtos Disponíveis
**Método:** `GET`  
**URL:** `{{base_url_client}}/products`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 3.2. Ver Carrinho (Vazio)
**Método:** `GET`  
**URL:** `{{base_url_client}}/cart`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

**Resposta esperada:**
```json
{
  "items": [],
  "total": 0
}
```

##### 3.3. Adicionar Item ao Carrinho
**Método:** `POST`  
**URL:** `{{base_url_client}}/cart/items`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}",
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "productId": "{{product_id}}",
  "productName": "iPhone 15 Pro", 
  "productSku": "IPH15PRO128",
  "price": 7999.99,
  "quantity": 2,
  "productAttributes": {
    "color": "Natural Titanium",
    "storage": "128GB"
  }
}
```

##### 3.4. Fazer Checkout (Criar Pedido)
**Método:** `POST`  
**URL:** `{{base_url_client}}/orders`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}",
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
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
    "holderName": "Test User"
  },
  "customerEmail": "{{user_email}}"
}
```

#### 💳 PASSO 4: Processamento de Pagamento (Payment API)

##### 4.1. Processar Pagamento
**Método:** `POST`  
**URL:** `{{base_url_payment}}/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "amount": 15999.98,
  "currency": "BRL",
  "paymentMethod": "credit_card",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025", 
    "cvv": "123",
    "cardholderName": "Test User"
  },
  "orderId": "{{order_id}}",
  "customerEmail": "{{user_email}}"
}
```

##### 4.2. Verificar Status do Pagamento
**Método:** `GET`  
**URL:** `{{base_url_payment}}/payments/{{payment_id}}`  
**Headers:** Nenhum necessário

### 4.4. Endpoints Disponíveis por API

#### Client API (http://localhost:3000)
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login 
- `GET /products` - Listar produtos
- `GET /products/:id` - Produto por ID
- `GET /cart` - Ver carrinho
- `POST /cart/items` - Adicionar ao carrinho
- `GET /orders` - Pedidos do usuário
- `POST /orders` - Criar pedido (checkout)
- `GET /health` - Health check

#### Admin API (http://localhost:3001)  
- `POST /auth/register` - Registro de admin
- `POST /auth/login` - Login admin
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto
- `GET /orders` - Todos os pedidos
- `PUT /orders/:id/status` - Atualizar status
- `GET /health` - Health check

#### Payment API (http://localhost:3002)
- `POST /payments/process` - Processar pagamento
- `GET /payments/:id` - Status do pagamento
- `GET /payments/health` - Health check

### 4.5. Cenários de Teste de Pagamento

#### ✅ Cartão Aprovado
Use: `4111111111111111` - Será aprovado

#### ❌ Saldo Insuficiente  
Use: `4111111111110000` - Será rejeitado por saldo

#### ❌ Cartão Recusado
Use: `4111111111111111` (mas com nome "Declined Test") - Será rejeitado

#### 💰 PIX
```json
{
  "paymentMethod": "pix",
  "amount": 999.99
}
```

#### 🧾 Boleto
```json
{
  "paymentMethod": "boleto",
  "amount": 1500.00
}
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
nx run client-api:build
nx run payment:lint:check
```

### Estrutura NX
```
monorepo/
├── apps/                  # Aplicações
│   ├── client-api/    
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

#### 5.1. Admin API - Gestão de Produtos

##### 1. Health Check Admin API
**Método:** `GET`  
**URL:** `http://localhost:3001/health`  
**Headers:** Nenhum necessário

##### 2. Listar Produtos  
**Método:** `GET`  
**URL:** `http://localhost:3001/products`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

##### 3. Criar Produto (Requer Auth)
**Método:** `POST`  
**URL:** `http://localhost:3001/products`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
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
}
```

##### 4. Atualizar Produto (Requer Auth)
**Método:** `PUT`  
**URL:** `http://localhost:3001/products/{{product_id}}`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "name": "iPhone 15 Pro Updated",
  "price": 7499.99,
  "stock": 75
}
```

##### 5. Deletar Produto (Requer Auth)
**Método:** `DELETE`  
**URL:** `http://localhost:3001/products/{{product_id}}`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

#### 5.2. Client API - Experiência do Cliente

##### 1. Listar Produtos Disponíveis
**Método:** `GET`  
**URL:** `http://localhost:3000/products`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 2. Buscar Produtos por Categoria
**Método:** `GET`  
**URL:** `http://localhost:3000/products?category=ELECTRONICS`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 3. Ver Carrinho (Vazio)
**Método:** `GET`  
**URL:** `http://localhost:3000/cart`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 4. Adicionar Produto ao Carrinho
**Método:** `POST`  
**URL:** `http://localhost:3000/cart/items`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}",
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "productId": "id_do_produto_criado",
  "productName": "iPhone 15 Pro", 
  "productSku": "IPH15PRO128",
  "price": 7999.99,
  "quantity": 2,
  "productAttributes": {
    "color": "Natural Titanium",
    "storage": "128GB"
  }
}
```

##### 5. Ver Carrinho com Itens
**Método:** `GET`  
**URL:** `http://localhost:3000/cart`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 6. Atualizar Quantidade do Item
**Método:** `PUT`  
**URL:** `http://localhost:3000/cart/items/{{product_id}}`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}",
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "quantity": 1
}
```

##### 7. Criar Pedido (Checkout) - 🔗 COMUNICAÇÃO INTER-MÓDULOS
**Método:** `POST`  
**URL:** `http://localhost:3000/orders`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}",
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
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
}
```

##### 8. Listar Pedidos do Usuário
**Método:** `GET`  
**URL:** `http://localhost:3000/orders`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 9. Ver Detalhes de um Pedido
**Método:** `GET`  
**URL:** `http://localhost:3000/orders/{{order_id}}`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 10. Health Check Client API
**Método:** `GET`  
**URL:** `http://localhost:3000/health`  
**Headers:** Nenhum necessário

#### 5.3. Payment API - Processamento de Pagamentos

##### 1. Processar Pagamento com Cartão
**Método:** `POST`  
**URL:** `http://localhost:3002/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
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
}
```

##### 2. Consultar Status do Pagamento
**Método:** `GET`  
**URL:** `http://localhost:3002/payments/{{payment_id}}`  
**Headers:** Nenhum necessário

##### 3. Health Check Payment API
**Método:** `GET`  
**URL:** `http://localhost:3002/health`  
**Headers:** Nenhum necessário

##### 4. Simular Pagamento PIX
**Método:** `POST`  
**URL:** `http://localhost:3002/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "amount": 999.99,
  "currency": "BRL", 
  "paymentMethod": "pix",
  "orderId": "id_do_pedido_pix",
  "customerEmail": "cliente@exemplo.com"
}
```

##### 5. Simular Pagamento Boleto
**Método:** `POST`  
**URL:** `http://localhost:3002/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "amount": 1500.00,
  "currency": "BRL",
  "paymentMethod": "boleto", 
  "orderId": "id_do_pedido_boleto",
  "customerEmail": "cliente@exemplo.com"
}
```

### 6. Teste de Comunicação Entre Módulos

#### 6.1. Client → Payment (via HTTP Client)
Quando você cria um pedido na Client API, ela automaticamente:

1. **Order Module** chama **Payment API** via `PaymentApiClient`
2. **Payment API** processa o pagamento e retorna o resultado
3. **Order Module** atualiza o status do pedido baseado no resultado
4. **Cart Module** é marcado como completado

**Para testar essa comunicação:**
```bash
# Monitore os logs das APIs em terminais separados
# Terminal 1
npx nx serve client-api --verbose

# Terminal 2  
npx nx serve payment-api --verbose

# Então execute o checkout e veja os logs de comunicação HTTP
```

#### 6.2. Admin → Payment (via Public API Client)

##### 1. Admin Consulta Status de Pagamentos
**Método:** `GET`  
**URL:** `http://localhost:3001/payments`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

##### 2. Admin Consulta Pagamentos por Pedido
**Método:** `GET`  
**URL:** `http://localhost:3001/payments/order/{{order_id}}`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

### 7. Simulação de Cenários de Pagamento

#### 7.1. Cartão Aprovado (Sucesso)
**Método:** `POST`  
**URL:** `http://localhost:3002/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "amount": 100.00,
  "paymentMethod": "credit_card",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "Teste Sucesso"
  },
  "orderId": "test-approved",
  "customerEmail": "test@exemplo.com"
}
```

#### 7.2. Cartão com Saldo Insuficiente (Falha)
**Método:** `POST`  
**URL:** `http://localhost:3002/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "amount": 100.00, 
  "paymentMethod": "credit_card",
  "cardDetails": {
    "cardNumber": "4111111111110000",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "Teste Saldo"
  },
  "orderId": "test-insufficient",
  "customerEmail": "test@exemplo.com"
}
```

#### 7.3. Cartão Recusado (Falha)
**Método:** `POST`  
**URL:** `http://localhost:3002/payments/process`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "amount": 100.00,
  "paymentMethod": "credit_card", 
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "Teste Recusa"
  },
  "orderId": "test-declined",
  "customerEmail": "test@exemplo.com"
}
```

### 8. Teste de Gestão de Pedidos (Admin API)

#### 8.1. Atualizar Status de Pedido
**Método:** `PUT`  
**URL:** `http://localhost:3001/orders/{{order_id}}/status`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}",
  "Content-Type": "application/json"
}
```
**Body (JSON):**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "BR123456789BR",
  "notes": "Pedido enviado via Correios"
}
```

#### 8.2. Listar Todos os Pedidos (Admin)
**Método:** `GET`  
**URL:** `http://localhost:3001/orders`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

#### 8.3. Filtrar Pedidos por Status
**Método:** `GET`  
**URL:** `http://localhost:3001/orders?status=SHIPPED`  
**Headers:**
```json
{
  "Authorization": "Bearer {{access_token}}"
}
```

## 📱 Collection do Postman

Para facilitar os testes, você pode criar uma Collection no Postman com os seguintes environments:

### Environment Variables
Crie um Environment no Postman com essas variáveis:

```json
{
  "base_url_admin": "http://localhost:3001",
  "base_url_client": "http://localhost:3000", 
  "base_url_payment": "http://localhost:3002",
  "access_token": "",
  "user_email": "admin@example.com",
  "user_password": "123456"
}
```

### Ordem de Testes Recomendada

1. **Registro**: POST `{{base_url_admin}}/auth/register`
2. **Login**: POST `{{base_url_admin}}/auth/login` (salva o token automaticamente)
3. **Health Checks**: GET em todas as APIs `/health`
4. **Criar Produto**: POST `{{base_url_admin}}/products`
5. **Ver Produtos**: GET `{{base_url_client}}/products`
6. **Carrinho**: GET/POST/PUT `{{base_url_client}}/cart`
7. **Checkout**: POST `{{base_url_client}}/orders`
8. **Pagamento**: POST `{{base_url_payment}}/payments/process`
9. **Gestão Admin**: PUT `{{base_url_admin}}/orders/{{order_id}}/status`

### Auto-Tests (Postman Scripts)

Adicione este script no **Tests** tab do endpoint de login para salvar o token automaticamente:

```javascript
if (responseCode.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.access_token);
    console.log("Token salvo automaticamente:", response.access_token);
}
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
curl http://localhost:3000/health  # Client API
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
test_endpoint "http://localhost:3000/health" "Client API"
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

test_endpoint_with_auth "http://localhost:3000/products" "Produtos (Client)"
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

### 🚀 Preparação (Terminal)
1. **Preparar ambiente**: `yarn install` + `docker-compose up -d`
2. **Iniciar APIs**: `npx nx serve admin-api` + `npx nx serve payment-api` + `npx nx serve client-api`

### 📱 Testes no Postman
1. **Environment**: Configure as variáveis base_url_* e access_token
2. **Registrar usuário**: POST `{{base_url_admin}}/auth/register` 
3. **Fazer login**: POST `{{base_url_admin}}/auth/login` → Token salvo automaticamente
4. **Health checks**: GET `/health` em todas as APIs
5. **Criar produtos**: POST `{{base_url_admin}}/products`
6. **Testar carrinho**: GET/POST `{{base_url_client}}/cart`
7. **Fazer checkout**: POST `{{base_url_client}}/orders` (🔗 triggers Payment API communication)
8. **Verificar pagamento**: GET `{{base_url_payment}}/payments/{{payment_id}}`
9. **Gerenciar pedidos**: PUT `{{base_url_admin}}/orders/{{order_id}}/status`

### 🎯 Cenários de Teste
- **✅ Cartão Aprovado**: `4111111111111111`
- **❌ Saldo Insuficiente**: `4111111111110000`  
- **❌ Cartão Recusado**: `4111111111111111` (terminado em 1)
- **💰 PIX**: Gera QR Code automático
- **🧾 Boleto**: Gera código de barras automático

**✅ Sistema completo com autenticação JWT, comunicação entre módulos e arquitetura modular!**  
**🔧 Pronto para usar no Postman com Environment Variables e Auto-Tests!**