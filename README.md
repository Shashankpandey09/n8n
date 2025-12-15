# Flowboard

![Flowboard UI](./screenshots/landing-page.pn<img width="1901" height="898" alt="Screenshot 2025-12-15 223810" src="https://github.com/user-attachments/assets/afab31e7-8b48-4087-935e-a12d929c0131" />
)
*(Replace this path with your actual landing page screenshot)*

**Flowboard** is an open-source, event-driven workflow automation platform (similar to n8n) designed for high-throughput and reliability. It allows developers to build complex automation flows visually while maintaining the power of code-native execution.

Built with **React**, **Node.js**, **Apache Kafka**, and **PostgreSQL**.

---

## 🚀 Key Features

- **Visual Workflow Builder:** Drag-and-drop interface (ReactFlow) to chain nodes and define logic.
- **Event-Driven Architecture:** Decoupled ingestion and execution using Kafka to handle load spikes.
- **Reliable Delivery (Transactional Outbox):** A dedicated **Sweeper Service** guarantees *at-least-once* message delivery. No trigger is ever lost, even if the message broker is down.
- **Sandboxed Execution:** User-defined code nodes run in isolated Node.js VM contexts to ensure security and stability.
- **Real-time Feedback:** WebSocket integration for live execution logs and status updates.

---

## 🏗️ System Architecture

*Flowboard is engineered to decouple the API service from the heavy-lifting of workflow execution.*

![Architecture Diagram](./screenshots/architecture-diagram.png)
*(Take a screenshot of the diagram we created in your docs and place it here)*

### How it works
1.  **Ingestion:** The **Primary Backend** validates triggers (Webhooks) and persists the execution state to **PostgreSQL** with a `PENDING` status.
2.  **Transactional Outbox (Sweeper):** A standalone **Sweeper Service** runs on a tight loop. It polls the database for `PENDING` executions and pushes them to **Kafka**. This ensures atomic reliability—we don't rely on "dual writes" to both DB and Queue.
3.  **Execution Engine:** **Worker Nodes** consume messages from Kafka, fetch the workflow graph, and execute nodes sequentially.
4.  **Isolation:** JavaScript code blocks are executed inside a secure VM sandbox to prevent a single malicious workflow from crashing the worker process.

---

## 🛠️ Technology Stack

| Component | Tech | Reason |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind, ReactFlow | For a high-performance, interactive node editor. |
| **Backend API** | Node.js, Express | Non-blocking I/O ideal for handling concurrent webhooks. |
| **Sweeper Service** | Node.js Poller | Ensures data consistency between Postgres and Kafka. |
| **Message Queue** | Apache Kafka | Durable buffering between the API and Workers. |
| **Database** | PostgreSQL + Prisma | Relational data integrity for complex workflow structures. |
| **Infra/Testing** | Docker, Bash | Containerized development and ephemeral test environments. |

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Shashankpandey09/n8n.git](https://github.com/Shashankpandey09/n8n.git)
   cd n8n
2.Start Infrastructure Spin up Postgres and Kafka using Docker:

docker compose -f docker-compose.yml up -d

3.Install Dependencies
npm install

4.Run Database Migrations

cd common && npx prisma migrate deploy

5.Start Services You can run the services individually:

# Terminal 1: Primary Backend (API + Sweeper)
cd primary_backend && npm run dev

# Terminal 2: Worker Engine
cd Executor && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev
