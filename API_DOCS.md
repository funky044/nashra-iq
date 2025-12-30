# NashraIQ API Documentation

## Overview

The NashraIQ API provides programmatic access to GCC market data, company information, news, and analytics. All data is sourced from licensed providers with proper attribution.

**Base URL:** `https://api.nashra-iq.com/v1`  
**Demo URL:** `http://localhost:3000/api`

## Authentication

Most endpoints require authentication using JWT tokens.

### Register

```http
POST /api/auth
Content-Type: application/json

{
  "action": "register",
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "registered",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```http
POST /api/auth
Content-Type: application/json

{
  "action": "login",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Market Data

### Get Market Overview

Returns current market indices and statistics.

```http
GET /api/market?market=saudi
```

**Parameters:**
- `market` (optional): Market identifier (saudi, uae, qatar)

**Response:**
```json
{
  "market": "saudi",
  "timestamp": "2024-12-28T10:30:00Z",
  "companies": [
    {
      "ticker": "2222",
      "name": "Saudi Aramco",
      "sector": "Energy",
      "price": 28.50,
      "volume": 5234567,
      "change": 0.35,
      "changePercent": 1.24
    }
  ]
}
```

**Rate Limit:** 100 requests per 15 minutes  
**Cache:** 1 minute

## Companies

### Search Companies

Search for companies by ticker, name, or filters.

```http
GET /api/companies/search?q=aramco&market=saudi&limit=20
```

**Parameters:**
- `q` (optional): Search query (ticker or name)
- `market` (optional): Filter by market
- `sector` (optional): Filter by sector
- `limit` (optional): Results limit (default: 20, max: 100)

**Response:**
```json
{
  "results": [
    {
      "ticker": "2222",
      "nameEn": "Saudi Aramco",
      "nameAr": "أرامكو السعودية",
      "market": "saudi",
      "sector": "Energy",
      "industry": "Oil & Gas",
      "marketCap": 2000000000000
    }
  ]
}
```

**Rate Limit:** 100 requests per 15 minutes

### Get Company Details

```http
GET /api/companies/{ticker}
```

**Response:**
```json
{
  "ticker": "2222",
  "nameEn": "Saudi Aramco",
  "nameAr": "أرامكو السعودية",
  "market": "saudi",
  "sector": "Energy",
  "industry": "Oil & Gas",
  "description": "...",
  "website": "https://aramco.com",
  "foundedYear": 1933,
  "employees": 70000,
  "marketCap": 2000000000000,
  "currentPrice": 28.50,
  "change": 0.35,
  "changePercent": 1.24
}
```

### Get Company Prices

```http
GET /api/companies/{ticker}/prices?from=2024-01-01&to=2024-12-31
```

**Parameters:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `interval` (optional): daily, weekly, monthly

**Response:**
```json
{
  "ticker": "2222",
  "prices": [
    {
      "date": "2024-12-28",
      "open": 28.20,
      "high": 28.80,
      "low": 28.10,
      "close": 28.50,
      "volume": 5234567
    }
  ]
}
```

### Get Company Fundamentals

```http
GET /api/companies/{ticker}/fundamentals
```

**Response:**
```json
{
  "ticker": "2222",
  "fundamentals": [
    {
      "period": "Q3 2024",
      "periodType": "quarterly",
      "fiscalYear": 2024,
      "fiscalQuarter": 3,
      "revenue": 103000000000,
      "netIncome": 27500000000,
      "eps": 2.45,
      "publishedAt": "2024-10-15T00:00:00Z"
    }
  ]
}
```

## News

### Get Latest News

```http
GET /api/news?market=saudi&limit=20
```

**Parameters:**
- `market` (optional): Filter by market
- `sector` (optional): Filter by sector
- `company` (optional): Filter by company ticker
- `limit` (optional): Results limit (default: 20, max: 100)

**Response:**
```json
{
  "news": [
    {
      "id": 123,
      "titleEn": "Saudi Aramco Announces Q3 Results",
      "titleAr": "أرامكو السعودية تعلن نتائج الربع الثالث",
      "summaryEn": "Strong earnings reported...",
      "summaryAr": "أرباح قوية...",
      "sourceName": "Reuters Arabia",
      "sourceUrl": "https://reuters.com/article/...",
      "publishedAt": "2024-12-28T08:00:00Z",
      "companies": [
        {
          "ticker": "2222",
          "name": "Saudi Aramco"
        }
      ],
      "aiSummary": {
        "text": "Key takeaways from earnings...",
        "confidence": 0.92,
        "sources": ["Reuters Arabia"]
      }
    }
  ]
}
```

**Source Attribution:** Every news item includes source information and proper attribution.

## Calendar

### Get Events

```http
GET /api/calendar?from=2024-12-01&to=2024-12-31&type=earnings
```

**Parameters:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `type` (optional): earnings, dividend, agm
- `company` (optional): Filter by ticker

**Response:**
```json
{
  "events": [
    {
      "id": 456,
      "ticker": "2222",
      "companyName": "Saudi Aramco",
      "eventType": "earnings",
      "eventDate": "2024-11-05",
      "titleEn": "Q3 2024 Earnings Call",
      "titleAr": "مكالمة أرباح الربع الثالث 2024"
    }
  ]
}
```

## User Features (Authenticated)

### Get Watchlists

```http
GET /api/watchlists
Authorization: Bearer {token}
```

**Response:**
```json
{
  "watchlists": [
    {
      "id": 1,
      "name": "Tech Stocks",
      "companies": [
        {
          "ticker": "4061",
          "name": "Mobily",
          "price": 45.30,
          "change": 1.2
        }
      ]
    }
  ]
}
```

### Create Alert

```http
POST /api/alerts
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": 1,
  "alertType": "price",
  "conditionField": "close_price",
  "conditionOperator": "gt",
  "conditionValue": 150.00
}
```

**Alert Types:**
- `price`: Price threshold alerts
- `volume`: Volume spike alerts
- `news`: News mention alerts

**Operators:**
- `gt`: Greater than
- `lt`: Less than
- `eq`: Equal to

## Rate Limiting

All API endpoints are rate limited:

- **Free Tier:** 100 requests per 15 minutes
- **Pro Tier:** 1000 requests per 15 minutes
- **Enterprise:** Custom limits

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640707200
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `RESOURCE_NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid parameters

## Data Compliance

All data returned by the API:
- Comes from licensed sources
- Includes source attribution
- Follows financial data regulations
- AI summaries cite original sources

**Important:** This API provides data for informational purposes only and does not constitute investment advice.

## Support

For API support:
- Email: api@nashra-iq.com
- Documentation: https://docs.nashra-iq.com
- Status: https://status.nashra-iq.com
