# CampaignOS — Production-Grade Campaign Management System

A horizontally-scalable Campaign Management System built on the MERN stack with a queue-based async architecture.

## Architecture

```
React Dashboard (Vite + TailwindCSS + Redux Toolkit)
      │
Socket.IO Client
      │
Express API + Socket.IO Gateway (Port 4000)
      │                    │
   MongoDB            BullMQ Queue (Redis)
      │                    │
   Analytics          Worker Service (×N replicas)
                           │
                    Redis Pub/Sub
                           │
              ┌────────────┘
              │  API Subscriber
              │        │
              └── Socket.IO → Frontend Clients
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Redux Toolkit, Socket.IO Client, Recharts |
| Backend API | Node.js, Express.js, Socket.IO |
| Worker | Node.js, BullMQ |
| Database | MongoDB 7 (native driver) |
| Queue | BullMQ + Redis |
| Realtime | Redis Pub/Sub → Socket.IO |
| Infra | Docker Compose |

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+ (for local dev)

### With Docker (Recommended)

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Local Development

**Backend:**
```bash
cd backend
npm install
cp .env .env.local   # edit if needed
npm run dev
```

**Worker:**
```bash
cd worker
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Reference

### Contacts
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/contacts | List contacts (page, limit, search, tags, sortBy) |
| GET | /api/v1/contacts/stats | Total contact count |
| GET | /api/v1/contacts/:id | Single contact |

### Uploads
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/uploads | Upload CSV file (multipart/form-data, field: `file`) |
| GET | /api/v1/uploads | List uploads with status |
| GET | /api/v1/uploads/:id | Upload status + progress |

### Campaigns
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/campaigns | List campaigns (page, limit, status) |
| POST | /api/v1/campaigns | Create campaign |
| GET | /api/v1/campaigns/:id | Get campaign |
| PUT | /api/v1/campaigns/:id | Update campaign |
| DELETE | /api/v1/campaigns/:id | Delete campaign |
| POST | /api/v1/campaigns/:id/launch | Launch campaign (async) |
| GET | /api/v1/campaigns/:id/messages | Campaign messages (paginated) |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/analytics/global | System-wide stats |
| GET | /api/v1/analytics/campaigns/:id | Per-campaign analytics |
| GET | /api/v1/analytics/queue | BullMQ queue metrics |
| GET | /api/v1/analytics/activity | Recent campaign activity |

## CSV Format

```csv
name,email,phone,tags,metadata
John Doe,john@example.com,+1234567890,vip|newsletter,{"source":"web"}
Jane Smith,jane@example.com,,active,{}
```

- `tags`: pipe-separated (`vip|newsletter`)
- Supports 50k+ rows via streaming + chunked bulkWrite

## Realtime Events (Socket.IO)

### Subscribe to campaign updates
```js
socket.emit('subscribe:campaign', campaignId)
```

### Events received
| Event | Payload |
|---|---|
| `campaign.started` | `{ campaignId, jobId }` |
| `campaign.progress` | `{ campaignId, batchIndex, batchSize, status }` |
| `campaign.batch.processed` | `{ campaignId, batchIndex, sent, failed, total }` |
| `campaign.completed` | `{ campaignId, status }` |
| `campaign.failed` | `{ campaignId, status, error }` |
| `message.batch.processed` | `{ campaignId, results: [{id, status}] }` |

## Database Indexes

### contacts
- `email` (unique)
- `phone`
- `createdAt DESC`
- `tags` (multikey)
- `{tags, createdAt}` (compound)
- `{name, email}` (text search)

### campaigns
- `status`
- `{status, createdAt}` (compound — list queries)

### campaignMessages
- `campaignId`
- `{campaignId, status}` (compound — analytics aggregation)
- `{campaignId, status, createdAt}` (retry queries)

## Scaling Guide

| Scale | Strategy |
|---|---|
| 100k contacts | Single node, indexes sufficient (~3ms queries) |
| 1M contacts | Replica set, read from secondaries |
| 10M contacts | Sharded cluster (shard key: `email` hash) |
| Workers | `docker-compose up --scale worker=10` |
| API | Stateless → horizontal load balancer |
| WebSockets | `@socket.io/redis-adapter` for multi-node Socket.IO |
| Redis | Redis Cluster for Pub/Sub at scale |
| Backpressure | BullMQ `limiter.max` + worker concurrency caps |

## Worker Configuration

```env
WORKER_CONCURRENCY=5    # jobs processed simultaneously per worker
BATCH_SIZE=500          # contacts per BullMQ job
```

- Throughput at concurrency=5, batch=500: ~2,500 messages processing simultaneously
- Scale to 10 worker replicas → 25,000 simultaneous message sends
- Retry: 3 attempts, exponential backoff (2s, 4s, 8s)
- Dead Letter Queue: failed jobs retained in BullMQ for inspection

## Project Structure

```
reelocampagins-2/
├── docker-compose.yml
├── .env.example
├── backend/            # Express API + Socket.IO Gateway
│   ├── src/
│   │   ├── config/         # env, db, redis
│   │   ├── db/             # index setup
│   │   ├── modules/        # contacts, campaigns, uploads, analytics, messages
│   │   ├── queues/         # BullMQ queue
│   │   ├── pubsub/         # publisher + subscriber
│   │   ├── socket/         # Socket.IO gateway
│   │   ├── middlewares/    # error, logger, rateLimit, validate
│   │   ├── validators/     # Zod schemas
│   │   ├── utils/          # pagination, chunkArray
│   │   ├── routes/         # central routes
│   │   ├── app.js          # Express factory
│   │   └── server.js       # entry point
├── worker/             # BullMQ Worker Service
│   ├── src/
│   │   ├── config/         # env, db, redis
│   │   ├── jobs/           # campaign.job, batch.processor
│   │   ├── pubsub/         # publisher
│   │   ├── repositories/   # messages repository
│   │   └── worker.js       # entry point
└── frontend/           # React + Vite + TailwindCSS
    ├── src/
    │   ├── store/          # Redux Toolkit (5 slices)
    │   ├── sockets/        # Socket.IO client
    │   ├── services/       # Axios API services
    │   ├── pages/          # Dashboard, Campaigns, Contacts, Analytics
    │   ├── components/     # Layout, UI components
    │   └── layouts/        # MainLayout
```
