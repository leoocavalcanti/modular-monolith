# Arquitetura do Monorepo: Análise e Implementação

## 1. Estrutura Modular

O projeto segue uma arquitetura modular com 6 pacotes de domínio + 1 pacote compartilhado:

```
packages/
├── catalog/        # Domínio de produtos
├── cart/           # Domínio de carrinho de compras  
├── order/          # Domínio de pedidos
├── payment/        # Domínio de pagamentos
├── identity/       # Domínio de autenticação
├── shared/         # Utilitários compartilhados
└── ...
```

### Estrutura Interna de Cada Pacote

Cada pacote segue a mesma estrutura de camadas:

```
packages/catalog/
├── src/
│   ├── core/               # Lógica de domínio
│   │   ├── service/        # Serviços de domínio
│   │   ├── use-case/       # Casos de uso
│   │   └── enum/           # Enumerações
│   ├── persistence/        # Camada de persistência
│   │   ├── entity/         # Entidades TypeORM
│   │   └── repository/     # Repositórios
│   ├── http/               # Camada HTTP
│   │   └── client/         # Clientes HTTP para outros módulos
│   └── public-api/         # API pública para outros módulos
│       └── facade/         # Fachadas públicas
├── index.ts               # Exportações públicas
└── catalog.module.ts      # Módulo NestJS
```

## 2. Arquitetura Limpa: Separação de Camadas

### Camada Core (Lógica de Domínio)
```typescript
// packages/catalog/src/core/service/catalog-product.service.ts
@Injectable()
export class CatalogProductService {
  // Lógica de domínio pura
  async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getProductById(productId);
    return product.status === ProductStatus.ACTIVE && product.stock >= quantity;
  }
}
```

### Camada de Persistência
```typescript
// packages/catalog/src/persistence/repository/catalog-product.repository.ts
@Injectable()
export class CatalogProductRepository extends DefaultTypeOrmRepository<CatalogProduct> {
  // Camada de acesso a dados
  async findBySku(sku: string): Promise<CatalogProduct | null> {
    return this.findOne({
      where: { sku },
    });
  }
}
```

### Camada HTTP
```typescript
// packages/order/src/http/client/payment-api.client.ts
@Injectable()
export class PaymentApiClient {
  // Comunicação com outros serviços
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    const paymentApiUrl = this.configService.get('order.paymentApi.url');
    const response = await this.httpClient.post<PaymentResult>(
      `${paymentApiUrl}/payments/process`,
      paymentRequest
    );
    return response;
  }
}
```

## 3. Isolamento de Banco de Dados

Cada domínio tem seu banco de dados separado com conexões nomeadas:

### Configuração de Persistência
```typescript
// packages/catalog/src/persistence/catalog-persistence.module.ts
@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'catalog',  // Conexão nomeada específica
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('catalog.database.host'),
        port: configService.get('catalog.database.port'), 
        username: configService.get('catalog.database.username'),
        password: configService.get('catalog.database.password'),
        database: configService.get('catalog.database.database'), // ecommerce_catalog_db
        entities: [CatalogProduct],
        // ...
      }),
    }),
  ],
  providers: [CatalogProductRepository],
  exports: [CatalogProductRepository],
})
export class CatalogPersistenceModule {}
```

### Transações Isoladas
```typescript
// packages/catalog/src/core/service/catalog-product.service.ts
@Transaction({ connectionName: 'catalog' })  // Conexão específica
async createProduct(data: CreateProductData): Promise<CatalogProduct> {
  // Operações executadas na conexão 'catalog' apenas
  const existingProduct = await this.catalogProductRepository.findBySku(data.sku);
  // ...
}
```

### Bancos de Dados Isolados
- **Catalog**: `ecommerce_catalog_db`
- **Cart**: `ecommerce_cart_db`  
- **Order**: `ecommerce_order_db`
- **Payment**: `ecommerce_payment_db`
- **Identity**: `ecommerce_identity_db`

## 4. Comunicação entre Módulos

### Padrão de Cliente HTTP
```typescript
// packages/order/src/http/client/payment-api.client.ts
@Injectable()
export class PaymentApiClient {
  constructor(
    private readonly httpClient: HttpClient,    // Cliente HTTP genérico
    private readonly configService: ConfigService
  ) {}

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    const paymentApiUrl = this.configService.get('order.paymentApi.url');
    const response = await this.httpClient.post<PaymentResult>(
      `${paymentApiUrl}/payments/process`,  // Chamada HTTP para outro serviço
      paymentRequest
    );
    return response;
  }
}
```

### Uso no Caso de Uso
```typescript
// packages/order/src/core/use-case/create-order-from-cart.use-case.ts
@Injectable()
export class CreateOrderFromCartUseCase {
  constructor(
    private readonly paymentClient: PaymentApiClient,  // Cliente de outro domínio
    // ...
  ) {}

  async execute(request: CreateOrderRequest) {
    // Comunicação entre domínios via HTTP
    const paymentResult = await this.paymentClient.processPayment({
      orderId: savedOrder.id,
      amount: totalAmount,
      // ...
    });
  }
}
```

## 5. Fachadas de API Pública

Cada domínio expõe apenas fachadas para consumo externo:

### Fachada Pública
```typescript
// packages/catalog/src/public-api/facade/catalog.facade.ts
@Injectable()
export class CatalogFacade implements CatalogProductAvailabilityApi {
  constructor(private readonly catalogProductService: CatalogProductService) {}

  async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    return this.catalogProductService.checkProductAvailability(productId, quantity);
  }

  async getProductById(productId: string): Promise<CatalogProduct> {
    return this.catalogProductService.getProductById(productId);
  }

  async updateStock(productId: string, newStock: number): Promise<CatalogProduct> {
    return this.catalogProductService.updateStock(productId, newStock);
  }
}
```

### Exportação Pública
```typescript
// packages/catalog/index.ts
export { CatalogModule } from './catalog.module';

// Export public facades - Apenas o necessário
export { CatalogFacade } from './src/public-api/facade/catalog.facade';

// Export public enums
export { ProductStatus } from './src/core/enum/product-status.enum';
export { ProductCategory } from './src/core/enum/product-category.enum';

// Export public interfaces
export type { ICatalogPublicApi, ProductAvailability, ProductInfo } from './src/public-api/interface/catalog-public.interface';
```

## 6. Padrões de Teste

### Factory de Testes
```typescript
// packages/catalog/__test__/factory/catalog-product.test-factory.ts
export const catalogProductFactory = Factory.Sync.makeFactory<CatalogProduct>({
  id: Factory.each(() => faker.string.uuid()),
  name: Factory.each(() => faker.commerce.productName()),
  description: Factory.each(() => faker.commerce.productDescription()),
  price: Factory.each(() => parseFloat(faker.commerce.price())),
  stock: Factory.each(() => faker.number.int({ min: 0, max: 100 })),
  sku: Factory.each(() => faker.string.alphanumeric(8).toUpperCase()),
  category: ProductCategory.ELECTRONICS,
  status: ProductStatus.ACTIVE,
  // ...
});
```

### Uso nos Testes
```typescript
// packages/catalog/src/core/service/__test__/unit/catalog-product.service.spec.ts
describe('CatalogProductService', () => {
  it('should return product when found', async () => {
    // Arrange - Usando factory para criar dados de teste
    const product = catalogProductFactory.build();
    mockRepository.findOne.mockResolvedValue(product);

    // Act
    const result = await service.getProductById(product.id!);

    // Assert
    expect(result).toEqual(product);
  });

  it('should return false when product is out of stock', async () => {
    // Arrange - Usando factory específica para cenário
    const product = catalogProductOutOfStockFactory();
    const quantity = 1;
    mockRepository.findOne.mockResolvedValue(product);

    // Act
    const result = await service.checkProductAvailability(product.id!, quantity);

    // Assert
    expect(result).toBe(false);
  });
});
```

## 7. Integração TypeORM com Suporte Multi-Banco

### Módulo TypeORM Compartilhado
```typescript
// packages/shared/module/typeorm/typeorm-persistence.module.ts
@Module({})
export class TypeOrmPersistenceModule {
  static forRoot(options: TypeOrmModuleAsyncOptions): DynamicModule {
    return {
      module: TypeOrmPersistenceModule,
      imports: [TypeOrmModule.forRootAsync(options)],  // Configuração assíncrona por domínio
    };
  }
}
```

### Repositório Base Comum
```typescript
// packages/shared/module/typeorm/repository/typeorm.repository.ts
export abstract class DefaultTypeOrmRepository<T extends DefaultEntity<T>> 
  implements Repository<T> {
  
  constructor(
    private readonly entityClass: ObjectType<T>,
    private readonly entityManager: EntityManager
  ) {}

  // Métodos base para todos repositórios
  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.entityManager.find(this.entityClass, options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.entityManager.findOne(this.entityClass, options);
  }
}
```

### Transações Transacionais
```typescript
// packages/catalog/src/core/use-case/create-product.use-case.ts
async execute(request: CreateProductRequest): Promise<CreateProductResult> {
  return await runInTransaction(  // Transações gerenciadas
    async () => {
      // Lógica de negócios
      const product = new CatalogProduct({ /* ... */ });
      const savedProduct = await this.productRepository.save(product);
      return { /* ... */ };
    },
    {
      connectionName: 'catalog',  // Transação específica por domínio
    }
  );
}
```

## 8. Sistema de Filas (BullMQ)

### Configuração de Filas
```typescript
// Uso de BullMQ para processamento assíncrono
// Filas disponíveis mencionadas na documentação:
// - PAYMENT_PROCESSING: Processamento de pagamentos
// - PAYMENT_RETRY: Tentativas de pagamento falhadas  
// - ORDER_FULFILLMENT: Fulfillment de pedidos
// - EMAIL_NOTIFICATION: Notificações por email
// - INVENTORY_UPDATE: Atualizações de estoque
// - PAYMENT_CONFIRMATION: Confirmações de pagamento
```

### Producers e Consumers
```typescript
// Estrutura típica de producers e consumers
@Injectable()
export class PaymentProcessingProducer {
  constructor(private readonly queue: Queue) {}

  async addProcessPaymentJob(data: PaymentJobData) {
    return this.queue.add('process-payment', data);
  }
}

@Processor('payment-processing')  // Fila específica
export class PaymentProcessingConsumer {
  @Process('process-payment')
  async handleProcessPayment(job: Job<PaymentJobData>) {
    // Processamento assíncrono de pagamento
  }
}
```

## Benefícios da Arquitetura

1. **Escalabilidade**: Cada domínio pode escalar independentemente
2. **Manutenibilidade**: Código organizado por responsabilidades claras
3. **Testabilidade**: Camadas bem definidas facilitam os testes
4. **Flexibilidade**: Facilita a substituição ou atualização de componentes
5. **Isolamento**: Falhas em um domínio não afetam outros
6. **Composição**: Aplicações podem combinar módulos de forma flexível