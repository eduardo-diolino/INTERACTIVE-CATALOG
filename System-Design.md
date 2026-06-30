# Interactive Catalog — Agna Costa
This project is a modern web catalog where customers choose the style, color, and size of dresses and confirm their selection. The confirmation generates records for the salesperson to view.

## Stack and Entry Point
- Framework: React 18 + TypeScript
- Build: Vite 7
- Styling: Tailwind CSS 3
- Entry point: `src/main.tsx` (do not change the script line in `index.html`)

## Commands
- Install: `npm install`
- Production build: `npm run build` (required after any changes)
- Preview the build: `npm run preview`

## High-Level Architecture
- Pages
  - `src/pages/Catalog.tsx`: product grid with cards; loads the catalog from the backend after entering a password. Links to Admin and Seller.
  - `src/pages/Admin.tsx`: catalog editing with its own authentication. The Admin can:
    - add/remove models
    - change image (absolute URL `/assets/...` or DataURL upload)
    - edit model name and price
    - toggle available sizes (XXS/XS/S/M/L/XL)
    - add/remove multiple colors (name + HEX shade)
    - save the catalog to the backend (displaying “Saving...” status and handling errors).
  - `src/pages/SellerView.tsx`: password-protected view; loads confirmed selections from the backend and allows clearing them.
- Components
  - `src/components/ProductCard.tsx`: supports multiple selections of colors and sizes. Upon confirmation, generates an order for each selected color×size combination.
  - `src/components/ColorSwatch.tsx`: color swatch + label, with selection state.
  - `src/components/SizeSelector.tsx`: simple mode (single selection) or multiple mode (`multiple`) with `values` and `onChangeMulti`.
  - `src/components/ConfirmationModal.tsx`: confirmation modal.
- Data and Types
  - `src/types/catalog.ts`: `Product`, `ColorOption`, `SizeOption`, and `SelectionItem` types (includes `colors[]` and `sizes[]` in `Product`).
  - `src/data/products.ts`: initial catalog seed.
- Persistence
  - Products: `src/utils/products.ts` — retrieves and saves via the backend (`loadProducts`, `saveAllProducts`), with local seed data used only as a fallback.
  - Selections: `src/utils/orders.ts` — all operations use the backend (`loadOrders`, `addOrders`, `clearOrders`).
- Routing
  - `src/App.tsx`: routes `/` (Catalog), `/admin` (Admin), and `/vendor` (Vendor) with a `RequireCatalogAuth` guard that redirects unauthenticated users to the catalog login screen.
- Assets
  - Static images in `public/assets/` and `public/assets/products/`.
  - Logo: `/assets/agna-logo.png`.
  - Use absolute paths `/assets/...` to ensure they work after the build. Uploads in Admin generate DataURLs (compatible in production).

## Access and Passwords
- Catalog password: `KDM` (stored in the `catalog_auth` key).
- Seller password: `QWEASD` (session persistence in the `seller_auth` key).
- Admin Password: same password `QWEASD` (session persistence in the `admin_auth` key).
- Flows:
  - Login sets `*_auth = “true”`, and the “Log Out” button removes the respective key and reloads the route.
  - These flows are simple and not secure—use the production backend.

## Multiple Selection (Client)
- Colors: the client can select multiple colors per product (controlled in `ProductCard` via `selectedColors[]`).
- Sizes: multiple selection via `SizeSelector` with `multiple` and `onChangeMulti`.
- Confirmation: Each color×size combination generates a `SelectionItem` sent to the backend with the specified quantity. The `SellerView` lists each confirmation with quantity and a timestamp.

## Suggested Next Steps
1. Improve the UX of the password screens and loading/error states.
2. Bulk import (CSV) and advanced management (filters, search, sorting).
3. Premium animations (Framer Motion/Reactbits) and visual refinements.