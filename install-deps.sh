#!/bin/bash

echo "🚀 Instalando dependências do E-commerce Monorepo..."

# Instalar dependências root
echo "📦 Instalando dependências root..."
yarn install

echo "✅ Instalação concluída!"
echo ""
echo "🧪 Scripts de desenvolvimento disponíveis:"
echo "yarn lint:all              # Executar lint em todos os projetos"
echo "yarn test:all              # Executar todos os testes"
echo "yarn test:affected         # Executar testes dos projetos afetados"
echo ""
echo "🐳 Para subir os serviços:"
echo "docker-compose up -d"
echo ""
echo "🔗 URLs das APIs:"
echo "- Client API: http://localhost:3000"
echo "- Admin API: http://localhost:3001" 
echo "- Payment API: http://localhost:3002"
echo ""
echo "📊 Para visualizar graph dos projetos:"
echo "nx graph"