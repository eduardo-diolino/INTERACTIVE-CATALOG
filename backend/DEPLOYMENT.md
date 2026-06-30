# Deployment Checklist

## Prerequisites

1. Cloudflare account with D1 database access
2. Wrangler CLI installed globally: `npm install -g wrangler`
3. Cloudflare API token with Worker and D1 permissions

## Local Setup

```bash
# Install dependencies
npm install

# Authenticate with Cloudflare
wrangler login

# Run development server
npm run dev
```

## Database Setup

1. Create D1 database (if not already created):
   ```bash
   wrangler d1 create youware
   ```

2. Initialize schema:
   ```bash
   wrangler d1 execute youware --file=./schema.sql
   ```

3. Verify tables:
   ```bash
   wrangler d1 execute youware --command="SELECT name FROM sqlite_master WHERE type='table';"
   ```

## Deployment Steps

### Development/Staging
```bash
# Deploy with default binding
npm run deploy
```

### Production
```bash
# Deploy to production environment
npm run deploy -- --env production
```

## Post-Deployment

1. Test endpoints:
   ```bash
   # Get products (should return empty array initially)
   curl https://youware-backend.<your-domain>.workers.dev/products
   
   # Test CORS preflight
   curl -X OPTIONS https://youware-backend.<your-domain>.workers.dev/products \
     -H "Origin: http://localhost:3000"
   ```

2. Monitor logs:
   ```bash
   wrangler tail youware-backend
   ```

3. Check database:
   ```bash
   wrangler d1 execute youware --command="SELECT * FROM products;"
   ```

## Troubleshooting

### Database Connection Issues
- Verify `DB` binding in wrangler.toml matches created database
- Check database ID with: `wrangler d1 list`
- Ensure database is accessible in your region

### CORS Issues
- All endpoints include CORS headers by default
- Preflight (OPTIONS) requests return 204 with headers
- Check browser console for specific CORS errors

### Data Persistence Issues
- Verify schema exists: `wrangler d1 execute youware --command=".schema"`
- Check for constraint violations in error logs
- Ensure product IDs are unique before bulk insert

## Environment Variables

Set in `wrangler.toml`:
- `DB`: D1 database binding (defaults to "DB")

## Rollback

To roll back to previous version:
1. Keep git history of wrangler.toml and src/
2. Redeploy with: `npm run deploy`
3. Reset database if needed: `wrangler d1 execute youware --file=./schema.sql`

## Monitoring

Track these metrics:
- API response times (via Cloudflare Analytics)
- Database query performance (D1 stats)
- Error rates (console.error logs)
- CORS preflight success rate

## Scaling Considerations

- D1 supports up to 1GB by default
- Row count limits: monitor if > 10M rows
- Concurrent connections: D1 handles up to 9 concurrent requests
- Consider read replicas for high-traffic scenarios
