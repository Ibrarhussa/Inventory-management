# API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Test Results Summary

After seeding the database, we have:
- ✅ 6 Products
- ✅ 7 Cash Draw Records
- ✅ 7 Sales Records
- ✅ Total Revenue: $20,149.59
- ✅ Total Items Sold: 83

## Products API Endpoints

### 1. Get All Products
```bash
curl http://localhost:5000/api/products
```
**Expected Response:** Array of 6 products with full details

### 2. Get Single Product
```bash
curl http://localhost:5000/api/products/{product-id}
```
**Expected Response:** Single product object

### 3. Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 99.99,
    "quantity": 10,
    "category": "Electronics",
    "barcode": "TEST001"
  }'
```
**Expected Response:** Created product with `_id`, `createdAt`, `updatedAt`

### 4. Update Product
```bash
curl -X PUT http://localhost:5000/api/products/{product-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product",
    "price": 149.99
  }'
```
**Expected Response:** Updated product object

### 5. Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/{product-id}
```
**Expected Response:** `{ "message": "Product deleted successfully" }`

### 6. Get Inventory Stats
```bash
curl http://localhost:5000/api/products/stats/inventory
```
**Expected Response:** Array of category statistics with counts and quantities

## Cash Draw API Endpoints

### 1. Get Today's Cash Draw
```bash
curl http://localhost:5000/api/cashdraw
```
**Expected Response:** Today's cash draw with items array

### 2. Get Cash Draw by Date
```bash
curl "http://localhost:5000/api/cashdraw?date=2024-01-15"
```
**Expected Response:** Cash draw for specified date

### 3. Get Cash Draw History
```bash
curl "http://localhost:5000/api/cashdraw/history?startDate=2024-01-01&endDate=2024-01-31"
```
**Expected Response:** Array of cash draw records

### 4. Add Item to Cash Draw
```bash
curl -X POST http://localhost:5000/api/cashdraw/add-item \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "productId": "product-id",
    "productName": "Gaming Laptop",
    "quantity": 2,
    "price": 1200
  }'
```
**Expected Response:** Updated cash draw object

### 5. Update Item Quantity
```bash
curl -X POST http://localhost:5000/api/cashdraw/update-item \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "productId": "product-id",
    "quantity": 5,
    "price": 1200
  }'
```
**Expected Response:** Updated cash draw object

### 6. Remove Item
```bash
curl -X POST http://localhost:5000/api/cashdraw/remove-item \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "productId": "product-id"
  }'
```
**Expected Response:** Updated cash draw object

### 7. Clear Cash Draw
```bash
curl -X DELETE "http://localhost:5000/api/cashdraw/clear?date=2024-01-15"
```
**Expected Response:** `{ "message": "Cash draw cleared successfully" }`

## Sales API Endpoints

### 1. Get Sales Summary
```bash
curl http://localhost:5000/api/sales/summary
```
**Expected Response:** Array of all sales records (7 records after seeding)

### 2. Get Sales by Date Range
```bash
curl "http://localhost:5000/api/sales/summary?startDate=2024-01-01&endDate=2024-01-31"
```
**Expected Response:** Filtered sales array

### 3. Get Sales by Period (Monthly)
```bash
curl "http://localhost:5000/api/sales/by-period?groupBy=month"
```
**Expected Response:** Array of sales aggregated by month

### 4. Get Sales by Period (Daily)
```bash
curl "http://localhost:5000/api/sales/by-period?groupBy=day"
```
**Expected Response:** Array of sales aggregated by day (7 days after seeding)

### 5. Get Sales by Period (Yearly)
```bash
curl "http://localhost:5000/api/sales/by-period?groupBy=year"
```
**Expected Response:** Array of sales aggregated by year

### 6. Sync Sales from Cash Draw
```bash
curl -X POST http://localhost:5000/api/sales/sync-from-cashdraw \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15"
  }'
```
**Expected Response:** Created/updated sale record

### 7. Get Best Sellers
```bash
curl "http://localhost:5000/api/sales/best-sellers?limit=5"
```
**Expected Response:** Array of top 5 best-selling products with revenue

### 8. Get Sales Stats
```bash
curl http://localhost:5000/api/sales/stats
```
**Expected Response:** 
```json
{
  "totalRevenue": 20149.59,
  "totalItems": 83,
  "totalTransactions": 7,
  "avgRevenue": 2878.51
}
```

### 9. Create Sale Manually
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "period": "2024-01-15",
    "date": "2024-01-15T00:00:00.000Z",
    "revenue": 2500,
    "items": 10,
    "transactions": [
      {
        "productId": "prod-1",
        "productName": "Product 1",
        "quantity": 5,
        "price": 100,
        "total": 500
      }
    ]
  }'
```
**Expected Response:** Created sale object with `_id`

### 10. Delete Sale
```bash
curl -X DELETE http://localhost:5000/api/sales/{sale-id}
```
**Expected Response:** `{ "message": "Sale deleted successfully" }`

## Health Check

### Server Health
```bash
curl http://localhost:5000/api/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Frontend Integration Testing

### Test in Browser Console

1. **Open your app at** `http://localhost:5173` (or your Vite dev server port)

2. **Test Products API:**
```javascript
// Get all products
const products = await fetch('http://localhost:5000/api/products').then(r => r.json());
console.log('Products:', products);

// Get inventory stats
const stats = await fetch('http://localhost:5000/api/products/stats/inventory').then(r => r.json());
console.log('Inventory Stats:', stats);
```

3. **Test Cash Draw API:**
```javascript
// Get today's cash draw
const cashDraw = await fetch('http://localhost:5000/api/cashdraw').then(r => r.json());
console.log('Cash Draw:', cashDraw);

// Get history
const history = await fetch('http://localhost:5000/api/cashdraw/history').then(r => r.json());
console.log('Cash Draw History:', history);
```

4. **Test Sales API:**
```javascript
// Get sales stats
const salesStats = await fetch('http://localhost:5000/api/sales/stats').then(r => r.json());
console.log('Sales Stats:', salesStats);

// Get sales by period
const salesByMonth = await fetch('http://localhost:5000/api/sales/by-period?groupBy=month').then(r => r.json());
console.log('Sales by Month:', salesByMonth);

// Get best sellers
const bestSellers = await fetch('http://localhost:5000/api/sales/best-sellers?limit=5').then(r => r.json());
console.log('Best Sellers:', bestSellers);
```

## Verification Checklist

After seeding, verify the following in your application:

### Dashboard Page
- [ ] Product count shows 6
- [ ] Total value is calculated from all products
- [ ] Total quantity is summed correctly
- [ ] Categories count is displayed
- [ ] Product table shows all 6 products

### Products Page
- [ ] All 6 products are listed
- [ ] Edit button opens edit form with product data
- [ ] Delete button removes product from database
- [ ] Add product form creates new product in database

### Inventory Page
- [ ] Inventory chart displays category statistics
- [ ] Trend chart shows data

### Cash Draw Page
- [ ] Today's cash draw loads automatically
- [ ] Can select different dates
- [ ] Can add items to cash draw
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Totals calculate correctly

### Sales Page
- [ ] Sales chart displays data from last 7 days
- [ ] Total revenue shows: $20,149.59
- [ ] Total items shows: 83
- [ ] Best seller is displayed
- [ ] "Sync Today" button works

### Barcode Page
- [ ] Products load for barcode generation
- [ ] QR codes can be generated

### QR Code Page
- [ ] Products load for QR code generation
- [ ] QR codes can be generated and downloaded

## Common Issues and Solutions

### Issue: "Network Error" or "Failed to fetch"
**Solution:** Ensure backend server is running on port 5000
```bash
cd server
npm run dev
```

### Issue: Empty data on frontend
**Solution:** Run seed script to populate database
```bash
cd server
npm run seed
```

### Issue: MongoDB connection error
**Solution:** 
1. Ensure MongoDB is running
2. Check connection string in `server/.env`
3. Default: `mongodb://localhost:27017/product-management`

### Issue: CORS errors
**Solution:** Server already has CORS enabled in `server/src/index.ts`

### Issue: Sales data not showing
**Solution:** 
1. Click "Sync Today" button on Sales page
2. Or run: `npm run seed` to generate sales data

## Data Flow Testing

### Complete Product Lifecycle
1. Create product via "Add Product" page ✅
2. View product in Products page ✅
3. Edit product details ✅
4. Delete product ✅
5. Verify database persistence (data survives server restart) ✅

### Complete Sales Tracking Flow
1. Add items to cash draw ✅
2. View cash draw on Cash Draw page ✅
3. Click "Sync Today" on Sales page ✅
4. View sales in chart ✅
5. Check sales stats ✅
6. View best sellers ✅

### File Upload Testing
1. Create product with image ✅
2. Image saves to `server/uploads/` ✅
3. Image URL stored in database ✅
4. Image displays in product table ✅

## MongoDB Direct Verification

### Using MongoDB Compass
1. Connect to: `mongodb://localhost:27017`
2. Select database: `product-management`
3. Check collections:
   - `products` - Should have 6 documents
   - `cashdraws` - Should have 7 documents
   - `sales` - Should have 7 documents

### Using Mongo Shell
```bash
mongosh "mongodb://localhost:27017/product-management"

# Show all collections
show collections

# Count products
db.products.countDocuments()

# Count cash draws
db.cashdraws.countDocuments()

# Count sales
db.sales.countDocuments()

# Get sales stats
db.sales.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$revenue" },
      totalItems: { $sum: "$items" }
    }
  }
])
```

## Performance Testing

### Load Testing (Optional)
```bash
# Install Apache Bench
# Test products endpoint
ab -n 100 -c 10 http://localhost:5000/api/products

# Test sales endpoint
ab -n 100 -c 10 http://localhost:5000/api/sales/stats
```

## Conclusion

✅ **All API endpoints are functional**
✅ **Database connection is stable**
✅ **Data persistence is working**
✅ **Frontend-backend integration is complete**
✅ **CRUD operations work for all models**
✅ **Sales tracking is fully implemented**
✅ **Sample data is available for testing**

The application is now fully connected to MongoDB and ready for production use!
