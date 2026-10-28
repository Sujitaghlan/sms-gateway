# sms-gateway
# Mini SMS Gateway API

A RESTful SMS Gateway API built with Node.js, Express, and PostgreSQL. The system supports JWT authentication, user wallets, SMS credit calculation, provider failover, provider health monitoring, and SMS logs.

## Features

- **Authentication:** User registration and login using JWT.
- **Wallet Management:** Credit-based wallets with transaction-safe deductions.
- **SMS Sending:** Send simulated SMS messages to multiple Nepali phone numbers.
- **Phone Number Validation:** Normalize and validate Nepali mobile numbers.
- **SMS Segmentation:** Calculate SMS parts for GSM-7 and Unicode messages.
- **Provider Failover:** Attempt active SMS providers in priority order.
- **Provider Balance Management:** Deduct provider credits after successful simulated delivery.
- **Refund Handling:** Refund reserved user credits when all providers fail.
- **SMS Logs:** Paginated logs with status, phone number, and date filters.
- **Provider Health:** Report provider balances and success rates over the last 24 hours.
- **Concurrency Protection:** Use database transactions and row locks to prevent wallet overspending.
- **Automated Tests:** Test SMS utilities, authentication, provider failover, and wallet behavior.

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT)
- bcryptjs
- Jest
- Supertest

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- Git (optional, for version control)

## Installation

Clone the repository:

```bash
git clone https://github.com/Sujitaghlan/sms-gateway.git
cd sms-gateway
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_long_random_secret
```

Replace the database values with your local PostgreSQL configuration. Use the exact variable names expected by your database connection file.

Create the database in PostgreSQL before starting the application.

## Running the Application

Start the development server using the script configured in `package.json`. For example:

```bash
npm run dev
```

The default server address is:

`http://localhost:3000`

The root endpoint can be checked at:

`GET http://localhost:3000/`

Expected response:

```json
{
  "message": "Mini SMS Gateway API is running"
}
```

## API Endpoints

All API routes use the `/api` prefix.

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/wallet` | View wallet balance | Yes |
| POST | `/api/sms/send` | Send simulated SMS messages | Yes |
| GET | `/api/sms/logs` | View paginated SMS logs | Yes |
| GET | `/api/routes/health` | View provider health statistics | Yes |

The original log and health routes are also retained:

- `GET /api/sms-logs`
- `GET /api/providers/health`

### Authentication

For protected endpoints, include the JWT returned by login in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Send SMS

**Request:**

`POST /api/sms/send`

```json
{
  "phoneNumbers": ["9812345678"],
  "message": "Hello from Mini SMS Gateway"
}
```

The phone number is an example. The API validates and normalizes Nepali mobile numbers.

A successful simulated send returns HTTP `200`. Insufficient wallet credits return HTTP `400`. If all providers fail, the API returns an error response and refunds reserved user credits.

### SMS Logs

Example request:

`GET /api/sms/logs?page=1&limit=10&status=sent`

Available query parameters:

- `page`: Page number.
- `limit`: Results per page, up to 100.
- `status`: `sent`, `failed`, or `pending`.
- `phoneNumber`: Filter by phone number.
- `startDate`: Start of the date range.
- `endDate`: End of the date range.

Users can access only their own SMS logs.

### Provider Health

`GET /api/routes/health`

Returns provider balances, active status, attempt statistics, success rates, and health status for the last 24 hours.

Health statuses are determined by the application's configured thresholds.

## SMS Credit Calculation

The application calculates SMS parts according to message encoding:

- GSM-7: 160 characters for a single-part message; 153 characters per part for multipart messages.
- Unicode: 70 characters for a single-part message; 67 characters per part for multipart messages.

Required user credits are calculated using:

`SMS parts × number of recipients`

The application reserves the required wallet credits before provider processing. If all providers fail, reserved user credits are refunded.

## SMS Provider Simulation

The application uses mock providers configured in the database. Providers are attempted in priority order. Simulated provider failures trigger failover to the next eligible provider.

A successful provider send deducts provider credits according to the application's configured credit rule. No real SMS messages are sent.

## Running Tests

Run the automated test suite:

```bash
npm test
```

The project has also been tested with concurrent SMS requests. In a test with 20 simultaneous requests and a wallet balance of 10 credits, exactly 10 requests succeeded and 10 were rejected for insufficient credits.


## Limitations

- SMS delivery is simulated; no real SMS provider is integrated.
- Provider balances and failure rates are mock values.
- Production deployment would require additional monitoring, configuration, and operational safeguards.

