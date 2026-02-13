# Database Setup and Connection Guide

## Overview
This application is fully connected to MongoDB for storing and managing all data including Products, Cash Draw transactions, and Sales records.

## Database Models

### 1. Product Model
Located at: `server/src/models/Product.ts`

**Schema:**
- `name`: String (required)
- `description`: String
- `price`: Number (required, min: 0)
- `quantity`: Number (required, min: 0)
- `category`: String (enum: 'Electronics', 'Apparel', 'Home Goods', 'Other')
- `image`: String (URL)
- `barcode`: String (unique)
- `createdAt`: Date
- `updatedAt`: Date

### 2. CashDraw Model
Located at: `server/src/models/CashDraw.ts`

**Schema:**
- `date`: Date (required)
- `items`: Array of:
  - `productId`: String
  - `productName`: String
  - `quantity`: Number
  - `price`: Number
  - `total`: Number
- `totalAmount`: Number
- `totalItems`: Number
- `createdAt`: Date
- `updatedAt`: Date

### 3. Sale Model
Located at: `server/src/models/Sale.ts`

**Schema:**
- `period`: String (date format: YYYY-MM-DD)
- `date`: Date (required)
- `revenue`: Number
- `items`: Number
- `transactions`: Array of:
  - `productId`: String
  - `productName`: String
  - `quantity`: Number
  - `price`: Number
  - `total`: Number
- `createdAt`: Date
- `updatedAt`: Date

## API Endpoints

### Products API (`/api/products`)
- `GET /` - Get all products
- `GET /:id` - Get single product
- `POST /` - Create new product (supports image upload)
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product
- `GET /stats/inventory` - Get inventory statistics

### Cash Draw API (`/api/cashdraw`)
- `GET /` - Get cash draw for today or specific date
- `GET /history` - Get cash draw history
- `POST /add-item` - Add item to cash draw
- `POST /remove-item` - Remove item from cash draw
- `POST /update-item` - Update item quantity
- `DELETE /clear` - Clear cash draw for a date

### Sales API (`/api/sales`)
- `GET /summary` - Get sales summary
- `GET /by-period` - Get sales aggregated by period (day/month/year)
- `POST /sync-from-cashdraw` - Sync sales from cash draw data
- `GET /best-sellers` - Get best selling products
- `GET /stats` - Get overall sales statistics
- `POST /` - Create sale manually
- `DELETE /:id` - Delete sale

## MongoDB Connection

### Configuration
The MongoDB connection is configured in `server/src/index.ts` and reads from environment variables.

**Environment Variables (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/product-management
JWT_SECRET=super_secret_jwt_key_12345
NODE_ENV=development
```

### Connection Setup
1. The server automatically connects to MongoDB on startup
2. If connection fails, the server will exit with an error message
3. Uploads directory is created automatically if it doesn't exist

## Database Seeding

To populate the database with sample data:

```bash
cd server
npm run seed
```

This will:
1. Clear all existing data (Products, CashDraws, Sales)
2. Insert 6 sample products
3. Create 7 days of sample cash draw data
4. Generate corresponding sales records
5. Display a summary of seeded data

## Data Flow

### Product Management
1. Products are created via the frontend form
2. Data is sent to `/api/products` endpoint
3. Product is saved to MongoDB with timestamps
4. Frontend receives the created product and updates the UI

### Cash Draw Flow
1. Items are added to daily cash draw via the Cash Draw page
2. Each day has its own cash draw document
3. Items, totals, and quantities are automatically calculated
4. Data persists in MongoDB

### Sales Tracking
1. Sales can be manually synced from cash draw data
2. Use the "Sync Today" button on the Sales page
3. Or call `/api/sales/sync-from-cashdraw` endpoint
4. Sales data is aggregated by period for charts
5. Best sellers and statistics are calculated from sales data

## Frontend-Backend Integration

### API Client
Location: `src/services/api.ts`

All API calls use Axios with base URL from environment variable:
```
VITE_API_URL=http://localhost:5000/api
```

### Type Safety
TypeScript interfaces in `src/types/index.ts` ensure type safety across:
- Product
- CashDraw
- Sale
- SalesStats
- BestSeller

## Data Persistence Features

✅ **All product operations persist to database**
- Create, Read, Update, Delete operations
- Image uploads stored in `server/uploads/`
- Barcode uniqueness enforced

✅ **Cash draw data persists daily**
- Each day has separate cash draw record
- Items can be added, updated, or removed
- Automatic total calculations

✅ **Sales tracking fully integrated**
- Sales sync from cash draw
- Period-based aggregation (day/month/year)
- Best seller analytics
- Revenue tracking

✅ **Real-time data synchronization**
- Frontend fetches fresh data from database
- Charts and statistics reflect actual stored data
- No hardcoded mock data

## Monitoring Database Connection

When the server starts, you'll see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

If connection fails:
```
❌ MongoDB connection error: [error details]
```

## Testing Database Connection

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Seed sample data:**
   ```bash
   cd server
   npm run seed
   ```

4. **Verify in MongoDB:**
   - Use MongoDB Compass or mongo shell
   - Connect to: `mongodb://localhost:27017/product-management`
   - Check collections: `products`, `cashdraws`, `sales`

## Common Operations

### Adding a Product
```javascript
const formData = new FormData();
formData.append('name', 'New Product');
formData.append('price', '99.99');
formData.append('quantity', '10');
formData.append('category', 'Electronics');

await productAPI.create(formData);
```

### Recording a Sale
```javascript
// Add items to cash draw
await cashDrawAPI.addItem({
  date: '2024-01-15',
  productId: 'product-id',
  productName: 'Product Name',
  quantity: 2,
  price: 99.99
});

// Sync to sales
await salesAPI.syncFromCashDraw('2024-01-15');
```

### Viewing Sales Analytics
```javascript
// Get sales by month
const sales = await salesAPI.getByPeriod('month');

// Get best sellers
const bestSellers = await salesAPI.getBestSellers(10);

// Get overall stats
const stats = await salesAPI.getStats();
```

## Troubleshooting

### MongoDB Not Running
If you see connection errors, ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Port Already in Use
If port 5000 is in use, update the PORT in `server/.env`

### Data Not Showing
1. Check server logs for errors
2. Verify MongoDB connection
3. Run seed script to populate data
4. Check browser console for API errors

## Architecture Benefits

1. **Persistence**: All data survives server restarts
2. **Scalability**: MongoDB handles growing data efficiently
3. **Type Safety**: TypeScript ensures data consistency
4. **Real-time**: Frontend always shows current database state
5. **Analytics**: Sales tracking enables business insights
6. **Backup**: MongoDB data can be easily backed up
7. **Testing**: Seed script provides consistent test data
