# Catálogo Interativo — Agna Costa

Este projeto é um catálogo web moderno onde clientes escolhem modelo, cor e tamanho de vestidos e confirmam a seleção. A confirmação gera registros para a visão do vendedor.

## Stack e Entrada
- Framework: React 18 + TypeScript
- Build: Vite 7
- Estilos: Tailwind CSS 3
- Entrada: `src/main.tsx` (não altere a linha de script em `index.html`)

## Comandos
- Instalar: `npm install`
- Build produção: `npm run build` (obrigatório após qualquer alteração)
- Preview do build: `npm run preview`

## Arquitetura de Alto Nível
- Páginas
  - `src/pages/Catalog.tsx`: grade de produtos com cartões; carrega o catálogo do backend após a senha. Links para Admin e Vendedor.
  - `src/pages/Admin.tsx`: edição do catálogo com autenticação própria. Admin consegue:
    - adicionar/remover modelos
    - alterar imagem (URL absoluta `/assets/...` ou upload DataURL)
    - editar nome do modelo e preço
    - alternar tamanhos disponíveis (PP/P/M/G/GG)
    - adicionar/remover múltiplas cores (nome + tonalidade HEX)
    - salvar catálogo no backend (estado "Salvando..." e tratamento de erro).
  - `src/pages/SellerView.tsx`: visão protegida por senha; carrega seleções confirmadas do backend e permite limpar.
- Componentes
  - `src/components/ProductCard.tsx`: suporta seleção múltipla de cores e tamanhos. Ao confirmar, gera um pedido para cada combinação cor×tamanho selecionada.
  - `src/components/ColorSwatch.tsx`: bolinha de cor + rótulo, com estado de seleção.
  - `src/components/SizeSelector.tsx`: modo simples (uma seleção) ou múltiplo (`multiple`) com `values` e `onChangeMulti`.
  - `src/components/ConfirmationModal.tsx`: modal de confirmação.
- Dados e Tipos
  - `src/types/catalog.ts`: tipos `Product`, `ColorOption`, `SizeOption`, `SelectionItem` (inclui `colors[]` e `sizes[]` no `Product`).
  - `src/data/products.ts`: seed inicial do catálogo.
- Persistência
  - Produtos: `src/utils/products.ts` — consulta e grava via backend (`loadProducts`, `saveAllProducts`), com seed local apenas como fallback.
  - Seleções: `src/utils/orders.ts` — todas as operações usam o backend (`loadOrders`, `addOrders`, `clearOrders`).
- Roteamento
  - `src/App.tsx`: rotas `/` (Catálogo), `/admin` (Admin) e `/vendedor` (Vendedor) com guard `RequireCatalogAuth` que redireciona usuários não autenticados para a tela de senha do catálogo.
- Assets
  - Imagens estáticas em `public/assets/` e `public/assets/products/`.
  - Logo: `/assets/agna-logo.png`.
  - Use caminhos absolutos `/assets/...` para funcionar após o build. Upload no Admin gera DataURL (compatível em produção).

## Acesso e Senhas
- Senha do Catálogo: `KDM` (persistência na chave `catalog_auth`).
- Senha do Vendedor: `QWEASD` (persistência de sessão na chave `seller_auth`).
- Senha do Admin: mesma senha `QWEASD` (persistência de sessão na chave `admin_auth`).
- Fluxos:
  - Login define `*_auth = "true"` e o botão “Sair” remove a chave respectiva e recarrega a rota.
  - Estes fluxos são simples e não seguros — use backend para produção.

## Seleção Múltipla (Cliente)
- Cores: cliente pode selecionar várias cores por produto (controle no `ProductCard` via `selectedColors[]`).
- Tamanhos: seleção múltipla via `SizeSelector` com `multiple` e `onChangeMulti`.
- Confirmação: cada combinação cor×tamanho gera um `SelectionItem` enviado para o backend com a quantidade indicada. O `SellerView` lista cada confirmação com quantidade e carimbo de data/hora.

## Próximos Passos Sugeridos
1. Melhorar UX das telas de senha e estados de carregamento/erro.
2. Importação em massa (CSV) e gestão avançada (filtros, busca, ordenação).
3. Animações premium (Framer Motion/Reactbits) e refinamento visual.

## Observações
- Rotas SPA: use `vite preview` para testar o build com fallback.
- Segurança: senhas em `localStorage` são paliativas; implemente autenticação no backend para ambientes reais.
- Backend: worker em `backend/` com endpoints `/products` e `/orders`; todas as chamadas usam `https://backend.youware.com`.
