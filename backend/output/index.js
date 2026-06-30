var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
var errorResponse = /* @__PURE__ */ __name((message, status = 400) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    { status, headers: corsHeaders }
  );
}, "errorResponse");
var successResponse = /* @__PURE__ */ __name((data, status = 200) => {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    { status, headers: corsHeaders }
  );
}, "successResponse");
var getProducts = /* @__PURE__ */ __name(async (env) => {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, model, image, price, sizes, colors FROM products ORDER BY created_at DESC"
    ).all();
    const products = results.map((row) => {
      const colorsData = JSON.parse(row.colors);
      const colors = Array.isArray(colorsData) ? colorsData.map((entry) => {
        const image = typeof entry.image === "string" && entry.image.trim().length > 0 ? entry.image.trim() : void 0;
        return {
          name: entry.name,
          hex: entry.hex,
          ...image ? { image } : {}
        };
      }) : [];
      const rawImage = typeof row.image === "string" ? row.image.trim() : "";
      const fallbackImage = colors.find((color) => color.image)?.image ?? "";
      const productImage = rawImage || fallbackImage;
      return {
        id: row.id,
        model: row.model,
        image: productImage,
        price: row.price,
        sizes: JSON.parse(row.sizes),
        colors
      };
    });
    return successResponse(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}, "getProducts");
var putProductsBulk = /* @__PURE__ */ __name(async (request, env) => {
  try {
    const products = await request.json();
    if (!Array.isArray(products)) {
      return errorResponse("Request body must be an array of products");
    }
    for (const product of products) {
      if (!product.model || product.price === void 0 || !Array.isArray(product.sizes) || !Array.isArray(product.colors)) {
        return errorResponse("Each product must have model, price, sizes[], and colors[]");
      }
      for (const color of product.colors) {
        if (!color.name || !color.hex) {
          return errorResponse("Each color must have name and hex");
        }
        if (color.image !== void 0 && typeof color.image !== "string") {
          return errorResponse("Each color image must be a string when provided");
        }
      }
    }
    const existingResult = await env.DB.prepare("SELECT id FROM products").all();
    const existingIds = new Set(existingResult.results.map((r) => r.id));
    const newIds = new Set(products.map((p) => p.id || ""));
    const idsToDelete = Array.from(existingIds).filter((id) => !newIds.has(id));
    const batch = [];
    for (const id of idsToDelete) {
      batch.push(env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id));
    }
    for (const product of products) {
      const id = product.id || crypto.randomUUID();
      const normalizedSizes = JSON.stringify(product.sizes);
      const normalizedColorsArray = product.colors.map((color) => {
        const image = typeof color.image === "string" && color.image.trim().length > 0 ? color.image.trim() : void 0;
        return {
          name: color.name,
          hex: color.hex,
          ...image ? { image } : {}
        };
      });
      const normalizedColors = JSON.stringify(normalizedColorsArray);
      const fallbackColorImage = normalizedColorsArray.find((entry) => entry.image)?.image ?? "";
      const productImage = (typeof product.image === "string" && product.image.trim().length > 0 ? product.image.trim() : "") || fallbackColorImage;
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
    await env.DB.batch(batch);
    return successResponse({ updated: products.length, deleted: idsToDelete.length }, 200);
  } catch (error) {
    console.error("Error updating products:", error);
    return errorResponse("Failed to update products", 500);
  }
}, "putProductsBulk");
var deleteProducts = /* @__PURE__ */ __name(async (env) => {
  try {
    const result = await env.DB.prepare("DELETE FROM products").run();
    return successResponse({ deleted: result.meta.changes || 0 });
  } catch (error) {
    console.error("Error deleting products:", error);
    return errorResponse("Failed to delete products", 500);
  }
}, "deleteProducts");
var getOrders = /* @__PURE__ */ __name(async (env) => {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, product_id, model, size, color_name, color_hex, price, quantity, timestamp
       FROM selections
       ORDER BY timestamp DESC`
    ).all();
    const orders = results.map((row) => ({
      productId: row.product_id,
      model: row.model,
      size: row.size,
      color: {
        name: row.color_name,
        hex: row.color_hex
      },
      price: row.price,
      quantity: row.quantity,
      timestamp: row.timestamp
    }));
    return successResponse(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}, "getOrders");
var postOrders = /* @__PURE__ */ __name(async (request, env) => {
  try {
    const items = await request.json();
    if (!Array.isArray(items)) {
      return errorResponse("Request body must be an array of selection items");
    }
    if (items.length === 0) {
      return successResponse({ inserted: 0 }, 201);
    }
    const productAggregates = /* @__PURE__ */ new Map();
    for (const item of items) {
      if (!item.productId || !item.model || !item.size || !item.color?.name || !item.color?.hex || item.price === void 0 || item.quantity === void 0) {
        return errorResponse("Each item must have productId, model, size, color{name,hex}, price, and quantity");
      }
      const aggregate = productAggregates.get(item.productId) ?? {
        model: item.model,
        price: item.price,
        sizes: /* @__PURE__ */ new Set(),
        colors: /* @__PURE__ */ new Map(),
        image: void 0
      };
      aggregate.price = item.price;
      aggregate.sizes.add(item.size);
      const colorImage = typeof item.color.image === "string" && item.color.image.trim().length > 0 ? item.color.image.trim() : void 0;
      aggregate.colors.set(item.color.name, {
        hex: item.color.hex,
        ...colorImage ? { image: colorImage } : {}
      });
      if (!aggregate.image && colorImage) {
        aggregate.image = colorImage;
      }
      productAggregates.set(item.productId, aggregate);
    }
    const productIds = Array.from(productAggregates.keys());
    let existingIds = /* @__PURE__ */ new Set();
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => "?").join(", ");
      const { results } = await env.DB.prepare(
        `SELECT id FROM products WHERE id IN (${placeholders})`
      ).bind(...productIds).all();
      existingIds = new Set(results.map((row) => row.id));
    }
    const missingProductIds = productIds.filter((id) => !existingIds.has(id));
    const batch = [];
    for (const id of missingProductIds) {
      const aggregate = productAggregates.get(id);
      if (!aggregate)
        continue;
      const sizes = JSON.stringify(Array.from(aggregate.sizes));
      const normalizedColorsArray = Array.from(aggregate.colors.entries()).map(([name, entry]) => ({
        name,
        hex: entry.hex,
        ...entry.image ? { image: entry.image } : {}
      }));
      const colors = JSON.stringify(normalizedColorsArray);
      const fallbackImage = normalizedColorsArray.find((entry) => entry.image)?.image ?? "";
      const productImage = (aggregate.image && aggregate.image.length > 0 ? aggregate.image : "") || fallbackImage;
      batch.push(
        env.DB.prepare(
          `INSERT INTO products (id, model, image, price, sizes, colors, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        ).bind(id, aggregate.model, productImage, aggregate.price, sizes, colors)
      );
    }
    const normalizeTimestamp = /* @__PURE__ */ __name((value) => {
      if (typeof value === "number") {
        return value;
      } else if (typeof value === "string") {
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
    }, "normalizeTimestamp");
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
    console.error("Error inserting orders:", error);
    return errorResponse("Failed to insert orders", 500);
  }
}, "postOrders");
var deleteOrders = /* @__PURE__ */ __name(async (env) => {
  try {
    const result = await env.DB.prepare("DELETE FROM selections").run();
    return successResponse({ deleted: result.meta.changes || 0 });
  } catch (error) {
    console.error("Error deleting orders:", error);
    return errorResponse("Failed to delete orders", 500);
  }
}, "deleteOrders");
var route = /* @__PURE__ */ __name(async (request, env) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  if (pathname === "/products") {
    if (method === "GET") {
      return getProducts(env);
    } else if (method === "DELETE") {
      return deleteProducts(env);
    }
  } else if (pathname === "/products/bulk") {
    if (method === "PUT") {
      return putProductsBulk(request, env);
    }
  } else if (pathname === "/orders") {
    if (method === "GET") {
      return getOrders(env);
    } else if (method === "POST") {
      return postOrders(request, env);
    } else if (method === "DELETE") {
      return deleteOrders(env);
    }
  }
  return errorResponse("Not found", 404);
}, "route");
var src_default = {
  fetch: (request, env, context) => {
    return route(request, env);
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
