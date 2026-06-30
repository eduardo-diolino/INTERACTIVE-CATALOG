# YouWare Backend Worker

A Cloudflare Workers backend for managing product catalog and customer selections using D1 (SQLite) database.

## Setup

### Prerequisites
- Node.js 16+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The worker will start on `http://localhost:8787`

### Deployment

```bash
npm run deploy
```

## API Endpoints

### Products

#### GET /products
Retrieve all products.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "model": "Model Name",
      "image": "https://...",
      "price": 99.99,
      "sizes": ["S", "M", "L"],
      "colors": [
        { "name": "Red", "hex": "#FF0000" }
      ]
    }
  ]
}
```

#### PUT /products/bulk
Replace all products with provided list. Performs upsert for existing IDs and deletes missing ones.

**Request:**
```json
[
  {
    "id": "uuid",
    "model": "Model Name",
    "image": "https://...",
    "price": 99.99,
    "sizes": ["S", "M", "L"],
    "colors": [
      { "name": "Red", "hex": "#FF0000" }
    ]
  }
]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": 5,
    "deleted": 2
  }
}
```

#### DELETE /products
Remove all products.

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": 10
  }
}
```

### Selections (Orders)

#### GET /orders
Retrieve all selections, ordered by timestamp (newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "uuid",
      "model": "Model Name",
      "size": "M",
      "color": { "name": "Red", "hex": "#FF0000" },
      "price": 99.99,
      "quantity": 2,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /orders
Insert new selections.

**Request:**
```json
[
  {
    "productId": "uuid",
    "model": "Model Name",
    "size": "M",
    "color": { "name": "Red", "hex": "#FF0000" },
    "price": 99.99,
    "quantity": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inserted": 3
  }
}
```

#### DELETE /orders
Clear all selections.

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": 15
  }
}
```

## Database Schema

### products table
- `id` (TEXT, PRIMARY KEY): Unique product identifier
- `model` (TEXT, NOT NULL): Product model name
- `image` (TEXT): Product image URL
- `price` (REAL, NOT NULL): Product price
- `sizes` (TEXT): JSON array of size strings
- `colors` (TEXT): JSON array of color objects {name, hex}
- `created_at` (DATETIME): Creation timestamp
- `updated_at` (DATETIME): Last update timestamp

### selections table
- `id` (TEXT, PRIMARY KEY): Unique selection identifier
- `product_id` (TEXT, NOT NULL): Foreign key to products
- `model` (TEXT, NOT NULL): Product model (denormalized)
- `size` (TEXT, NOT NULL): Selected size
- `color_name` (TEXT, NOT NULL): Selected color name
- `color_hex` (TEXT, NOT NULL): Selected color hex code
- `price` (REAL, NOT NULL): Price at time of selection
- `quantity` (INTEGER, NOT NULL): Quantity selected
- `timestamp` (DATETIME): Selection timestamp

## CORS

All endpoints support CORS with `Access-Control-Allow-Origin: *` and handle preflight OPTIONS requests.

## Error Handling

All error responses follow the format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common status codes:
- 200: Success
- 201: Resource created
- 400: Bad request
- 404: Not found
- 500: Server error
