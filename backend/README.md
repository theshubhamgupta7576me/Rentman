# Rentman Backend API

A robust REST API backend for the Rentman Property Management System built with Node.js, Express, TypeScript, and SQLite.

## 🚀 Features

- **SQLite Database**: Lightweight, file-based database for easy deployment
- **TypeScript**: Full type safety and better development experience
- **RESTful API**: Clean, consistent API design
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Real-time Sync**: Data synchronization between mobile and web clients
- **Comprehensive CRUD**: Full Create, Read, Update, Delete operations
- **Search & Filter**: Advanced search and filtering capabilities
- **Analytics**: Dashboard statistics and reporting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📊 Database Schema

### Tables

#### `tenants`
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `property_name` (TEXT, NOT NULL)
- `monthly_rent` (REAL, NOT NULL)
- `security_deposit` (REAL, NOT NULL)
- `start_date` (TEXT, NOT NULL)
- `start_meter_reading` (TEXT, NOT NULL)
- `property_type` (TEXT, CHECK: 'residential' | 'commercial')
- `phone_number` (TEXT)
- `notes` (TEXT)
- `is_archived` (BOOLEAN, DEFAULT 0)
- `closing_date` (TEXT)
- `closing_notes` (TEXT)
- `created_at` (TEXT, NOT NULL)
- `updated_at` (TEXT, NOT NULL)

#### `rent_logs`
- `id` (TEXT, PRIMARY KEY)
- `tenant_id` (TEXT, FOREIGN KEY)
- `tenant_name` (TEXT, NOT NULL)
- `date` (TEXT, NOT NULL)
- `rent_paid` (REAL, NOT NULL)
- `previous_meter_reading` (REAL, NOT NULL)
- `current_meter_reading` (REAL, NOT NULL)
- `units` (REAL, NOT NULL)
- `unit_price` (REAL, NOT NULL)
- `meter_bill` (REAL, NOT NULL)
- `total` (REAL, NOT NULL)
- `collector` (TEXT, NOT NULL)
- `payment_mode` (TEXT, CHECK: 'online' | 'cash')
- `notes` (TEXT)
- `created_at` (TEXT, NOT NULL)
- `updated_at` (TEXT, NOT NULL)

#### `rent_collectors`
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `created_at` (TEXT, NOT NULL)
- `updated_at` (TEXT, NOT NULL)

#### `app_settings`
- `id` (TEXT, PRIMARY KEY)
- `default_unit_price` (REAL, NOT NULL, DEFAULT 8)
- `created_at` (TEXT, NOT NULL)
- `updated_at` (TEXT, NOT NULL)

#### `uploaded_files`
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL)
- `size` (REAL, NOT NULL)
- `data` (TEXT, NOT NULL) - Base64 encoded
- `uploaded_at` (TEXT, NOT NULL)
- `tenant_id` (TEXT, FOREIGN KEY)
- `rent_log_id` (TEXT, FOREIGN KEY)

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Tenants

#### Get All Tenants
```
GET /api/tenants
```

#### Get Active Tenants
```
GET /api/tenants/active
```

#### Get Archived Tenants
```
GET /api/tenants/archived
```

#### Get Tenants with Pending Payments
```
GET /api/tenants/pending-payments
```

#### Search Tenants
```
GET /api/tenants/search?q={search_term}
```

#### Get Tenant by ID
```
GET /api/tenants/{id}
```

#### Create Tenant
```
POST /api/tenants
Content-Type: application/json

{
  "name": "John Doe",
  "propertyName": "Sunrise Apartment 2A",
  "monthlyRent": 15000,
  "securityDeposit": 30000,
  "startDate": "2024-01-01",
  "startMeterReading": "1250",
  "propertyType": "residential",
  "phoneNumber": "+919876543210",
  "notes": "Long-term tenant"
}
```

#### Update Tenant
```
PUT /api/tenants/{id}
Content-Type: application/json

{
  "monthlyRent": 16000,
  "notes": "Updated notes"
}
```

#### Delete Tenant
```
DELETE /api/tenants/{id}
```

#### Archive Tenant
```
POST /api/tenants/{id}/archive
Content-Type: application/json

{
  "closingDate": "2024-12-31",
  "closingNotes": "Tenant moved to another city"
}
```

#### Unarchive Tenant
```
POST /api/tenants/{id}/unarchive
```

## 📱 Mobile & Web Sync

The API is designed to work seamlessly with both mobile and web applications:

### CORS Configuration
- Configured to allow requests from the frontend URL
- Supports credentials for authentication
- Handles preflight requests

### Data Synchronization
- Real-time data updates
- Consistent data structure across platforms
- Optimized for mobile network conditions

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request body validation
- **SQL Injection Protection**: Parameterized queries
- **Error Handling**: Comprehensive error management

## 📈 Performance

- **SQLite**: Fast, lightweight database
- **Connection Pooling**: Efficient database connections
- **Caching**: Response caching for static data
- **Compression**: Response compression
- **Optimized Queries**: Indexed database queries

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `NODE_ENV` | Environment mode | development |

### Database Configuration

The SQLite database is automatically created at `data/rentman.db` when the server starts.

## 📚 API Documentation

### Authentication
Currently, the API doesn't require authentication. For production, consider adding JWT authentication.

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Customizable in the configuration

### Error Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

---

**Built with ❤️ for Rentman Property Management System**
