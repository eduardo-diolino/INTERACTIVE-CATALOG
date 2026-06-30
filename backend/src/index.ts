// Types
interface Color {
  name: string;
  hex: string;
  image?: string;
}

interface Product {
  id: string;
  model: string;
  image?: string;
  price: number;
  sizes: string[];
  colors: Color[];
}

interface SelectionItem {
  productId: string;
  model: string;
  size: string;
  color: Color;
  price: number;
  quantity: number;
  timestamp?: string | number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Env {
  DB: D1Database;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Error response helper
const errorResponse = (message: string, status: number = 400): Response => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    } as ApiResponse),
    { status, headers: corsHeaders }
  );
};

// Success response helper
const successResponse = <T>(data: T, status: number = 200): Response => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    } as ApiResponse<T>),
    { status, headers: corsHeaders }
  );
};

// GET /products - Return all products
const getProducts = async (env: Env): Promise<Response> => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, model, image, price, sizes, colors FROM products ORDER BY created_at DESC'
    ).all();

    const products: Product[] = (results as any[]).map((row) => {
      const colorsData = JSON.parse(row.colors);
      const colors: Color[] = Array.isArray(colorsData)
        ? colorsData.map((entry: any) => {
            const image =
              typeof entry.image === 'string' && entry.image.trim().length > 0
                ? entry.image.trim()
                : undefined;
            return {
              name: entry.name,
              hex: entry.hex,
              ...(image ? { image } : {}),
            };
          })
        : [];

      const rawImage = typeof row.image === 'string' ? row.image.trim() : '';
      const fallbackImage = colors.find((color) => color.image)?.image ?? '';
      const productImage = rawImage || fallbackImage;

      return {
        id: row.id,
        model: row.model,
        image: productImage,
        price: row.price,
        sizes: JSON.parse(row.sizes),
        colors,
      };
    });

    return successResponse(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse('Failed to fetch products', 500);
  }
};

// PUT /products/bulk - Replace all products
const putProductsBulk = async (request: Request, env: Env): Promise<Response> => {
  try {
    const products: Product[] = await request.json();

    if (!Array.isArray(products)) {
      return errorResponse('Request body must be an array of products');
    }

    // Validate products
    for (const product of products) {
      if (!product.model || product.price === undefined || !Array.isArray(product.sizes) || !Array.isArray(product.colors)) {
        return errorResponse('Each product must have model, price, sizes[], and colors[]');
      }
      for (const color of product.colors) {
        if (!color.name || !color.hex) {
          return errorResponse('Each color must have name and hex');
        }
        if (color.image !== undefined && typeof color.image !== 'string') {
          return errorResponse('Each color image must be a string when provided');
        }
      }
    }

    // Get existing product IDs
    const existingResult = await env.DB.prepare('SELECT id FROM products').all();
    const existingIds = new Set((existingResult.results as any[]).map((r) => r.id));
    const newIds = new Set(products.map((p) => p.id || ''));

    // Find IDs to delete
    const idsToDelete = Array.from(existingIds).filter((id) => !newIds.has(id));

    // Prepare batch operations
    const batch: D1PreparedStatement[] = [];

    // Delete missing products
    for (const id of idsToDelete) {
      batch.push(env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id));
    }

    // Upsert products
    for (const product of products) {
      const id = product.id || crypto.randomUUID();
      const normalizedSizes = JSON.stringify(product.sizes);
      const normalizedColorsArray = product.colors.map((color) => {
        const image =
          typeof color.image === 'string' && color.image.trim().length > 0
            ? color.image.trim()
            : undefined;
        return {
          name: color.name,
          hex: color.hex,
          ...(image ? { image } : {}),
        };
      });
      const normalizedColors = JSON.stringify(normalizedColorsArray);
      const fallbackColorImage = normalizedColorsArray.find((entry) => entry.image)?.image ?? '';
      const productImage =
        (typeof product.image === 'string' && product.image.trim().length > 0
          ? product.image.trim()
          : '') || fallbackColorImage;

      batch.push(
        env.DB.prepare(
          `INSERT INTO products (id, model, image, price, sizes, colors, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT(id) DO UPDATE SET
             model = excluded.model,
             image = excluded.image,
             price = excluded.price,
             sizes = excluded.sizes,
             colors = excluded.colors,
             updated_at = CURRENT_TIMESTAMP`
        ).bind(id, product.model, productImage, product.price, normalizedSizes, normalizedColors)
      );
    }

    // Execute batch
    await env.DB.batch(batch);

    return successResponse({ updated: products.length, deleted: idsToDelete.length }, 200);
  } catch (error) {
    console.error('Error updating products:', error);
    return errorResponse('Failed to update products', 500);
  }
};

// DELETE /products - Remove all products
const deleteProducts = async (env: Env): Promise<Response> => {
  try {
    const result = await env.DB.prepare('DELETE FROM products').run();
    return successResponse({ deleted: result.meta.changes || 0 });
  } catch (error) {
    console.error('Error deleting products:', error);
    return errorResponse('Failed to delete products', 500);
  }
};

// GET /orders - Return all selections
const getOrders = async (env: Env): Promise<Response> => {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, product_id, model, size, color_name, color_hex, price, quantity, timestamp
       FROM selections
       ORDER BY timestamp DESC`
    ).all();

    const orders: SelectionItem[] = (results as any[]).map((row) => ({
      productId: row.product_id,
      model: row.model,
      size: row.size,
      color: {
        name: row.color_name,
        hex: row.color_hex,
      },
      price: row.price,
      quantity: row.quantity,
      timestamp: row.timestamp,
    }));

    return successResponse(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
};

// POST /orders - Insert selections
const postOrders = async (request: Request, env: Env): Promise<Response> => {
  try {
    const items: SelectionItem[] = await request.json();

    if (!Array.isArray(items)) {
      return errorResponse('Request body must be an array of selection items');
    }

    if (items.length === 0) {
      return successResponse({ inserted: 0 }, 201);
    }

    const productAggregates = new Map<
      string,
      {
        model: string;
        price: number;
        sizes: Set<string>;
        colors: Map<string, { hex: string; image?: string }>;
        image?: string;
      }
    >();

    // Validate items
    for (const item of items) {
      if (
        !item.productId ||
        !item.model ||
        !item.size ||
        !item.color?.name ||
        !item.color?.hex ||
        item.price === undefined ||
        item.quantity === undefined
      ) {
        return errorResponse('Each item must have productId, model, size, color{name,hex}, price, and quantity');
      }

      const aggregate =
        productAggregates.get(item.productId) ??
        {
          model: item.model,
          price: item.price,
          sizes: new Set<string>(),
          colors: new Map<string, { hex: string; image?: string }>(),
          image: undefined,
        };

      aggregate.price = item.price;
      aggregate.sizes.add(item.size);
      const colorImage =
        typeof item.color.image === 'string' && item.color.image.trim().length > 0
          ? item.color.image.trim()
          : undefined;
      aggregate.colors.set(item.color.name, {
        hex: item.color.hex,
        ...(colorImage ? { image: colorImage } : {}),
      });

      if (!aggregate.image && colorImage) {
        aggregate.image = colorImage;
      }

      productAggregates.set(item.productId, aggregate);
    }

    const productIds = Array.from(productAggregates.keys());
    let existingIds = new Set<string>();

    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(', ');
      const { results } = await env.DB.prepare(
        `SELECT id FROM products WHERE id IN (${placeholders})`
      )
        .bind(...productIds)
        .all();
      existingIds = new Set((results as any[]).map((row) => row.id as string));
    }

    const missingProductIds = productIds.filter((id) => !existingIds.has(id));
    const batch: D1PreparedStatement[] = [];

    for (const id of missingProductIds) {
      const aggregate = productAggregates.get(id);
      if (!aggregate) continue;

      const sizes = JSON.stringify(Array.from(aggregate.sizes));
      const normalizedColorsArray = Array.from(aggregate.colors.entries()).map(([name, entry]) => ({
        name,
        hex: entry.hex,
        ...(entry.image ? { image: entry.image } : {}),
      }));
      const colors = JSON.stringify(normalizedColorsArray);
      const fallbackImage = normalizedColorsArray.find((entry) => entry.image)?.image ?? '';
      const productImage = (aggregate.image && aggregate.image.length > 0 ? aggregate.image : '') || fallbackImage;

      batch.push(
        env.DB.prepare(
          `INSERT INTO products (id, model, image, price, sizes, colors, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        ).bind(id, aggregate.model, productImage, aggregate.price, sizes, colors)
      );
    }

    const normalizeTimestamp = (value: unknown): number => {
      if (typeof value === 'number') {
        return value;
      } else if (typeof value === 'string') {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
          return numeric;
        }
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.getTime();
        }
      }
      return Date.now();
    };

    for (const item of items) {
      const timestamp = normalizeTimestamp(item.timestamp);

      batch.push(
        env.DB.prepare(
          `INSERT INTO selections (product_id, model, size, color_name, color_hex, price, quantity, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          item.productId,
          item.model,
          item.size,
          item.color.name,
          item.color.hex,
          item.price,
          item.quantity,
          timestamp
        )
      );
    }

    if (batch.length === 0) {
      return successResponse({ inserted: 0 }, 201);
    }

    await env.DB.batch(batch);

    return successResponse({ inserted: items.length }, 201);
  } catch (error) {
    console.error('Error inserting orders:', error);
    return errorResponse('Failed to insert orders', 500);
  }
};

// DELETE /orders - Clear all selections
const deleteOrders = async (env: Env): Promise<Response> => {
  try {
    const result = await env.DB.prepare('DELETE FROM selections').run();
    return successResponse({ deleted: result.meta.changes || 0 });
  } catch (error) {
    console.error('Error deleting orders:', error);
    return errorResponse('Failed to delete orders', 500);
  }
};

// Router function
const route = async (request: Request, env: Env): Promise<Response> => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Route matching
  if (pathname === '/products') {
    if (method === 'GET') {
      return getProducts(env);
    } else if (method === 'DELETE') {
      return deleteProducts(env);
    }
  } else if (pathname === '/products/bulk') {
    if (method === 'PUT') {
      return putProductsBulk(request, env);
    }
  } else if (pathname === '/orders') {
    if (method === 'GET') {
      return getOrders(env);
    } else if (method === 'POST') {
      return postOrders(request, env);
    } else if (method === 'DELETE') {
      return deleteOrders(env);
    }
  }

  // 404 Not found
  return errorResponse('Not found', 404);
};

// Export worker handler
export default {
  fetch: (request: Request, env: Env, context: ExecutionContext) => {
    return route(request, env);
  },
} as ExportedHandler<Env>;
