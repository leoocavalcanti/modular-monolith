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

## 🚀 Instalação e Execução

### 1. Instalar Dependências
```bash
# Executar script de instalação
./install-deps.sh

# Ou manualmente:
yarn install
```

### 2. Docker Compose
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar serviços
docker-compose down
```

### 3. URLs das APIs
- **Storefront API**: http://localhost:3000
- **Admin API**: http://localhost:3001  
- **Payment API**: http://localhost:3002

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

## Cenários de Uso

### Cliente Mobile/Web → Storefront API
```bash
# 1. Listar produtos
curl http://localhost:3000/products

# 2. Adicionar ao carrinho
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "123", "quantity": 2}'

# 3. Criar pedido
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {...},
    "billingAddress": {...},
    "paymentMethod": "credit_card",
    "cardDetails": {...},
    "customerEmail": "user@example.com"
  }'
```

### Dashboard Admin → Admin API
```bash
# 1. Criar produto
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "price": 99.90,
    "stock": 100,
    "sku": "PROD-001",
    "category": "electronics"
  }'

# 2. Listar pedidos
curl http://localhost:3001/orders

# 3. Relatórios de vendas
curl http://localhost:3001/payments
```

### Simulador → Payment API
```bash
# Webhook simulado
curl -X POST http://localhost:3002/webhooks/simulator \
  -H "Content-Type: application/json" \
  -d '{"event": "payment.succeeded", "paymentId": "pay_123"}'
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