# 🚀 Como Iniciar a Aplicação E-commerce

Esta documentação explica como configurar e executar o sistema e-commerce completo.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Yarn** 1.22+ ([Instalação](https://classic.yarnpkg.com/lang/en/docs/install/))
- **Docker & Docker Compose** ([Instalação](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/))

## ⚡ Início Rápido (5 minutos)

### 1. Clone e Configure o Projeto

```bash
# Clone o repositório
cd /caminho/para/monorrepo

# Instalar dependências
./install-deps.sh
# ou manualmente: yarn install
```

### 2. Inicie os Serviços de Infrastructure

```bash
# Subir PostgreSQL + Redis + Todas as APIs
docker-compose up -d

# Verificar se os serviços estão rodando
docker-compose ps
```

### 3. Verificar se está Funcionando

```bash
# Testar APIs
curl http://localhost:3000/health    # Client API
curl http://localhost:3001/health    # Admin API  
curl http://localhost:3002/health    # Payment API
```

**🎉 Pronto! As APIs estão rodando:**
- **Client API**: http://localhost:3000
- **Admin API**: http://localhost:3001
- **Payment API**: http://localhost:3002

---

## 📊 Configuração Detalhada

### 🗄️ Banco de Dados

O sistema usa **PostgreSQL** com múltiplos bancos isolados:

```yaml
# Bancos criados automaticamente:
- ecommerce_catalog   # Produtos
- ecommerce_cart      # Carrinho
- ecommerce_order     # Pedidos  
- ecommerce_payment   # Pagamentos
```

### 🔄 Redis (Queue System)

**Redis** é usado para processamento assíncrono:
- Processamento de pagamentos
- Fulfillment de pedidos
- Notificações por email
- Retry de operações falhadas

### 🐳 Docker Services

```yaml
# docker-compose.yml inclui:
services:
  postgres:         # Banco de dados principal
  redis:           # Sistema de filas
  client-api:  # API do cliente (porta 3000)
  admin-api:       # API administrativa (porta 3001)
  payment-api:     # API de pagamentos (porta 3002)
```

---

## 🛠️ Scripts de Desenvolvimento

### Gerenciamento de Dependências

```bash
# Instalar todas as dependências
yarn install

# Adicionar nova dependência a um package específico
yarn workspace @tlc/catalog add express
yarn workspace @tlc/payment add stripe
```

### Desenvolvimento com NX

```bash
# Executar lint em todos os projetos
yarn lint:all

# Executar testes unitários
yarn test:unit:all

# Executar apenas testes afetados (mais rápido)
yarn test:affected

# Visualizar graph de dependências
nx graph
```

### Banco de Dados

```bash
# Executar migrações de todos os módulos
yarn db:migrate:all

# Gerar novas migrações
yarn db:generate:all

# Resetar bancos de dados
yarn db:drop:all
```

### Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs de um serviço específico
docker-compose logs -f client-api

# Reconstruir imagens
docker-compose up -d --build

# Parar todos os serviços
docker-compose down

# Limpar volumes (cuidado - apaga dados)
docker-compose down -v
```

---

## 🧪 Testando as APIs

### 1. Client API (Clientes)

```bash
# Listar produtos
curl "http://localhost:3000/products"

# Buscar produtos
curl "http://localhost:3000/products/search?q=notebook"

# Adicionar ao carrinho
curl -X POST "http://localhost:3000/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-123",
    "quantity": 2
  }'

# Criar pedido (checkout)
curl -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "country": "BR"
    },
    "paymentMethod": "credit_card",
    "cardDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123",
      "holderName": "João Silva"
    },
    "customerEmail": "joao@example.com"
  }'
```

### 2. Admin API (Administrativo)

```bash
# Criar produto
curl -X POST "http://localhost:3001/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Gamer",
    "description": "Notebook para jogos",
    "price": 2499.99,
    "stock": 50,
    "sku": "NB-001",
    "category": "electronics"
  }'

# Listar pedidos
curl "http://localhost:3001/orders"

# Atualizar status do pedido
curl -X PUT "http://localhost:3001/orders/order-123/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

### 3. Payment API (Pagamentos)

```bash
# Processar pagamento
curl -X POST "http://localhost:3002/payments/process" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 199.90,
    "paymentMethod": "credit_card",
    "orderId": "order-456",
    "customerEmail": "cliente@example.com",
    "cardDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12", 
      "expiryYear": "2025",
      "cvv": "123",
      "holderName": "Maria Silva"
    }
  }'

# Verificar status do pagamento
curl "http://localhost:3002/payments/payment-789"
```

---

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# .env
NODE_ENV=development

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# APIs
STOREFRONT_PORT=3000
ADMIN_PORT=3001
PAYMENT_PORT=3002

# Payment
PAYMENT_WEBHOOK_SECRET=webhook-secret-key
```

### Configuração Personalizada

Para ambientes específicos, você pode sobrescrever configurações:

```bash
# Desenvolvimento local sem Docker
export POSTGRES_HOST=localhost
export REDIS_HOST=localhost

# Produção
export NODE_ENV=production
export POSTGRES_HOST=db.production.com
export REDIS_HOST=redis.production.com
```

---

## 📊 Monitoramento e Logs

### Visualizar Logs

```bash
# Logs de todas as APIs
docker-compose logs -f

# Logs de uma API específica
docker-compose logs -f client-api
docker-compose logs -f payment-api

# Logs do PostgreSQL
docker-compose logs -f postgres

# Logs do Redis
docker-compose logs -f redis
```

### Queue Dashboard

Para monitorar as filas BullMQ, você pode usar:

```bash
# Opcional: Instalar Bull Dashboard
yarn add @bull-board/api @bull-board/express

# Acessar via: http://localhost:3000/admin/queues
```

### Health Checks

```bash
# Verificar saúde dos serviços
curl http://localhost:3000/health
curl http://localhost:3001/health  
curl http://localhost:3002/health
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. **Erro: "Port already in use"**
```bash
# Verificar o que está usando a porta
lsof -i :3000
lsof -i :5432

# Matar processo se necessário
kill -9 <PID>
```

#### 2. **Erro: "Cannot connect to database"**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Verificar logs do banco
docker-compose logs postgres
```

#### 3. **Erro: "Redis connection failed"**
```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Testar conexão Redis
docker-compose exec redis redis-cli ping
```

#### 4. **Erro: "Module not found"**
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
yarn install

# Limpar cache do NX
nx reset
```

#### 5. **Erro: "Docker build failed"**
```bash
# Limpar imagens Docker
docker system prune -a

# Reconstruir imagens
docker-compose up -d --build --force-recreate
```

### Reset Completo

Se tudo der errado:

```bash
# Parar tudo
docker-compose down -v

# Limpar Docker
docker system prune -a

# Limpar node_modules  
rm -rf node_modules

# Reinstalar
yarn install

# Subir novamente
docker-compose up -d --build
```

---

## 📚 Próximos Passos

### Desenvolvimento

1. **Adicionar Novos Endpoints**: Siga o padrão Clean Architecture
2. **Testes**: Adicione testes unitários e de integração
3. **Observabilidade**: Configure métricas e alertas
4. **CI/CD**: Configure pipeline de deploy

### Produção

1. **Environment**: Configure variáveis de produção
2. **Secrets**: Use gerenciador de secrets (AWS Secrets, Vault)
3. **Load Balancer**: Configure balanceamento de carga
4. **Monitoring**: Configure APM (DataDog, New Relic)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Consulte este guia de troubleshooting
3. Verifique o README.md principal
4. Consulte a documentação de arquitetura

**🎉 Agora você está pronto para desenvolver no sistema e-commerce!** 🚀