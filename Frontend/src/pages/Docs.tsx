import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  GitBranch,
  Database,
  Server,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const SectionHeading = ({ children, id }) => (
  <h2
    id={id}
    className="text-2xl md:text-3xl font-bold text-white mt-16 mb-6 flex items-center gap-3 scroll-mt-24 group"
  >
    <span className="w-1 h-8 bg-sky-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
    {children}
  </h2>
);

const Paragraph = ({ children }) => (
  <div className="text-slate-400 leading-relaxed mb-6 text-lg max-w-3xl">
    {children}
  </div>
);

const ArchitectureDiagram = () => {
  return (
    <div className="w-full bg-[#0f172a] border border-white/5 rounded-xl p-4 md:p-8 my-10 overflow-x-auto shadow-2xl">
      <div className="min-w-[800px] mx-auto">
        <svg viewBox="0 0 900 500" className="w-full h-auto font-sans">
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#38bdf8" />
            </marker>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform="translate(50, 50)">
            <rect
              x="0"
              y="0"
              width="180"
              height="200"
              rx="12"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">
              FRONTEND (UI)
            </text>
            <rect
              x="40"
              y="60"
              width="100"
              height="40"
              rx="6"
              fill="#0ea5e9"
              fillOpacity="0.1"
              stroke="#0ea5e9"
              strokeWidth="1"
            />
            <text
              x="90"
              y="85"
              fill="#e0f2fe"
              fontSize="14"
              textAnchor="middle"
            >
              Webhook
            </text>

            <path
              d="M 70 100 L 50 140"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
            <path
              d="M 110 100 L 130 140"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
            <rect
              x="20"
              y="140"
              width="60"
              height="30"
              rx="4"
              fill="#1e293b"
              stroke="#475569"
            />
            <text
              x="50"
              y="160"
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
            >
              SMTP
            </text>
            <rect
              x="100"
              y="140"
              width="60"
              height="30"
              rx="4"
              fill="#1e293b"
              stroke="#475569"
            />
            <text
              x="130"
              y="160"
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
            >
              Discord
            </text>
          </g>

          <g transform="translate(300, 50)">
            <rect
              x="0"
              y="0"
              width="200"
              height="200"
              rx="12"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">
              BACKEND API
            </text>
            <text x="20" y="70" fill="#e2e8f0" fontSize="14" fontWeight="bold">
              Routes
            </text>
            <text x="20" y="100" fill="#94a3b8" fontSize="12">
              • Validate Workflow
            </text>
            <text x="20" y="125" fill="#94a3b8" fontSize="12">
              • Push to Kafka (Test)
            </text>
            <text x="20" y="150" fill="#94a3b8" fontSize="12">
              • Create DB Entry
            </text>
          </g>

          <g transform="translate(600, 50)">
            <rect
              x="0"
              y="0"
              width="250"
              height="200"
              rx="12"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">
              POSTGRESQL
            </text>

            <g transform="translate(20, 50)">
              <rect
                width="100"
                height="60"
                rx="4"
                fill="#0f172a"
                stroke="#334155"
              />
              <text
                x="50"
                y="25"
                fill="#38bdf8"
                fontSize="12"
                textAnchor="middle"
              >
                Workflows
              </text>
              <text
                x="50"
                y="45"
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                nodes, edges
              </text>
            </g>
            <g transform="translate(130, 50)">
              <rect
                width="100"
                height="60"
                rx="4"
                fill="#0f172a"
                stroke="#334155"
              />
              <text
                x="50"
                y="25"
                fill="#38bdf8"
                fontSize="12"
                textAnchor="middle"
              >
                Credentials
              </text>
            </g>
            <g transform="translate(20, 120)">
              <rect
                width="210"
                height="60"
                rx="4"
                fill="#0f172a"
                stroke="#334155"
              />
              <text
                x="105"
                y="25"
                fill="#38bdf8"
                fontSize="12"
                textAnchor="middle"
              >
                Executions (Pending)
              </text>
              <text
                x="105"
                y="45"
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                id, status: 'pending'
              </text>
            </g>
          </g>

          <g transform="translate(600, 350)">
            <rect
              x="0"
              y="0"
              width="250"
              height="120"
              rx="12"
              fill="#1e293b"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            <text x="20" y="30" fill="#f59e0b" fontSize="12" fontWeight="bold">
              SWEEPER SERVICE
            </text>
            <text
              x="125"
              y="65"
              fill="#e2e8f0"
              fontSize="14"
              textAnchor="middle"
            >
              Transactional Outbox
            </text>
            <text
              x="125"
              y="90"
              fill="#94a3b8"
              fontSize="12"
              textAnchor="middle"
            >
              Poller
            </text>
          </g>

          <g transform="translate(300, 380)">
            <rect
              x="0"
              y="0"
              width="200"
              height="60"
              rx="8"
              fill="#1e293b"
              stroke="#a855f7"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <text
              x="100"
              y="-15"
              fill="#a855f7"
              fontSize="12"
              textAnchor="middle"
              fontWeight="bold"
            >
              KAFKA CLUSTER
            </text>

            <rect
              x="15"
              y="15"
              width="30"
              height="30"
              rx="4"
              fill="#0f172a"
              stroke="#a855f7"
            />
            <rect
              x="55"
              y="15"
              width="30"
              height="30"
              rx="4"
              fill="#0f172a"
              stroke="#a855f7"
            />
            <rect
              x="95"
              y="15"
              width="30"
              height="30"
              rx="4"
              fill="#0f172a"
              stroke="#a855f7"
            />
            <rect
              x="135"
              y="15"
              width="30"
              height="30"
              rx="4"
              fill="#0f172a"
              stroke="#a855f7"
            />
          </g>

          <g transform="translate(50, 320)">
            <rect
              x="0"
              y="0"
              width="180"
              height="150"
              rx="12"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">
              EXECUTION ENGINE
            </text>
            <text x="20" y="60" fill="#94a3b8" fontSize="12">
              • Consume Msg
            </text>
            <text x="20" y="85" fill="#94a3b8" fontSize="12">
              • Loop Nodes
            </text>
            <text x="20" y="110" fill="#94a3b8" fontSize="12">
              • Update Status
            </text>
          </g>

          <path
            d="M 180 150 L 300 150"
            stroke="#38bdf8"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text
            x="240"
            y="140"
            fill="#38bdf8"
            fontSize="10"
            textAnchor="middle"
          >
            HTTP POST
          </text>

          <path
            d="M 500 150 L 600 150"
            stroke="#38bdf8"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text
            x="550"
            y="140"
            fill="#38bdf8"
            fontSize="10"
            textAnchor="middle"
          >
            INSERT
          </text>

          <path
            d="M 725 250 L 725 350"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrow)"
          />
          <text x="735" y="300" fill="#f59e0b" fontSize="10">
            Poll Pending
          </text>

          <path
            d="M 600 410 L 500 410"
            stroke="#a855f7"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text
            x="550"
            y="400"
            fill="#a855f7"
            fontSize="10"
            textAnchor="middle"
          >
            Produce
          </text>

          <path
            d="M 300 410 L 230 410"
            stroke="#a855f7"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text
            x="265"
            y="400"
            fill="#a855f7"
            fontSize="10"
            textAnchor="middle"
          >
            Consume
          </text>

          <path
            d="M 90 320 C 90 200, 400 300, 620 220"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="5,5"
            markerEnd="url(#arrow)"
            fill="none"
          />
          <text
            x="350"
            y="280"
            fill="#38bdf8"
            fontSize="10"
            textAnchor="middle"
          >
            Update Status & Logs
          </text>
        </svg>
      </div>
      <p className="text-center text-slate-500 text-xs mt-4">
        Figure 1.0: Event-Driven Architecture utilizing the Transactional Outbox
        Pattern.
      </p>
    </div>
  );
};

const FlowboardDocs = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("architecture");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["architecture", "data-flow", "outbox", "scalability"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-300 font-sans selection:bg-sky-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#0f172a] to-transparent opacity-50"></div>
      </div>

      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B1121]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-sky-900/40 border border-white/10 group-hover:scale-105 transition-transform">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Flowboard{" "}
                <span className="text-slate-500 font-normal">/ Docs</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Product
            </Link>
          </div>

          <button
            className="md:hidden text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row gap-12 pt-12 relative z-10">
        <aside className="hidden md:block w-64 shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto border-r border-white/5 pr-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Table of Contents
          </h4>
          <ul className="space-y-1">
            {[
              { id: "architecture", label: "System Architecture" },
              { id: "data-flow", label: "Data Flow & Lifecycle" },
              { id: "outbox", label: "Transactional Outbox" },
              { id: "scalability", label: "Scalability Design" },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block text-sm py-2 px-3 rounded-md transition-all ${
                    activeSection === item.id
                      ? "bg-sky-500/10 text-sky-400 font-medium border-l-2 border-sky-500"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 p-4 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/5">
            <h5 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> Pro Tip
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              This architecture decouples ingestion from execution, allowing the
              API to handle spikes while workers process at their own pace.
            </p>
          </div>
        </aside>

        <main className="flex-1 pb-24 md:pr-12">
          <div className="mb-16 border-b border-white/5 pb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-6">
              Engineering Deep Dive
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Workflow Engine Architecture
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
              Flowboard is built on an event-driven, distributed architecture
              designed for reliability and high throughput. This document
              outlines how we handle asynchronous execution, data consistency,
              and failure recovery.
            </p>
          </div>

          <SectionHeading id="architecture">High-Level Design</SectionHeading>
          <Paragraph>
            The system is composed of three distinct services to ensure
            separation of concerns:
          </Paragraph>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {[
              {
                title: "API Service",
                desc: "Handles HTTP ingress, webhook receptions, and validation. It is stateless and scalable.",
              },
              {
                title: "Execution Engine",
                desc: "Worker processes that consume jobs from Kafka and execute the workflow logic (the heavy lifting).",
              },
              {
                title: "Sweeper Service",
                desc: "A background process ensuring reliable message delivery from the database to the queue.",
              },
              {
                title: "Kafka Cluster",
                desc: "Acts as the durable buffer between the API and the Execution Engine.",
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex gap-4 p-4 rounded-xl bg-[#1e293b]/50 border border-white/5 hover:border-sky-500/20 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>
                <div>
                  <strong className="text-white block mb-1">
                    {item.title}
                  </strong>
                  <span className="text-slate-400 text-sm">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <ArchitectureDiagram />

          <SectionHeading id="data-flow">Data Flow & Lifecycle</SectionHeading>
          <Paragraph>
            When a user triggers a workflow (via Webhook or manually), the data
            travels through a strict lifecycle to ensure no events are lost,
            even if the worker nodes are down.
          </Paragraph>

          <div className="space-y-8 mt-8 border-l border-white/10 ml-3 pl-8 relative">
            {[
              {
                step: "01",
                title: "Ingestion & Validation",
                text: "The API receives the POST request. It fetches the Workflow Definition from the database to validate that the trigger exists and is active.",
              },
              {
                step: "02",
                title: "Persistence (Pending State)",
                text: "Instead of executing immediately, the API creates a record in the `executions` table with a status of `PENDING`. This acts as our source of truth.",
              },
              {
                step: "03",
                title: "Asynchronous Handoff",
                text: "The system uses the Transactional Outbox pattern to move the job to Kafka. This decouples the HTTP response time from the Kafka latency.",
              },
              {
                step: "04",
                title: "Worker Execution",
                text: "Workers subscribe to the Kafka topic. They pick up the job, traverse the Directed Acyclic Graph (DAG) of the workflow, and execute nodes sequentially.",
              },
              {
                step: "05",
                title: "Result Aggregation",
                text: "As each node finishes, results are written to `executionSteps`. Once the flow is complete, the main execution status is updated to `SUCCESS` or `ERROR`.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-[#0B1121] border border-sky-500/30 flex items-center justify-center text-sky-500 text-xs font-bold z-10">
                  {item.step}
                </div>
                <h4 className="text-white font-bold text-lg mb-2">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-base">{item.text}</p>
              </div>
            ))}
          </div>

          <SectionHeading id="outbox">
            The Transactional Outbox Pattern
          </SectionHeading>
          <Paragraph>
            A common failure mode in distributed systems is "dual writes"—saving
            to the database but failing to publish to the queue (or vice-versa).
            To solve this, we use the{" "}
            <strong>Transactional Outbox Pattern</strong>.
          </Paragraph>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            <div className="p-6 rounded-xl bg-[#1e293b]/30 border border-red-500/20">
              <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <X size={16} /> The Naive Approach
              </h4>
              <p className="text-sm text-slate-400 mb-4">
                Writing to DB and Queue separately implies two distinct
                transactions. If the server crashes in between, you lose data.
              </p>
              <div className="font-mono text-xs text-slate-500 bg-[#0B1121] p-3 rounded overflow-x-auto">
                await db.save(execution); <br />
                <span className="text-red-500">
                  // If this fails, data is inconsistent
                </span>
                <br />
                await kafka.send(message);
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1e293b]/30 border border-green-500/20">
              <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} /> Our Approach
              </h4>
              <p className="text-sm text-slate-400 mb-4">
                We only write to the Database. A separate "Sweeper" process
                reliably polls pending rows and pushes them to Kafka.
              </p>
              <div className="font-mono text-xs text-slate-500 bg-[#0B1121] p-3 rounded overflow-x-auto">
                await db.transaction(async () =&gt; &#123;
                <br />
                &nbsp;&nbsp;await db.save(execution);
                <br />
                &#125;);{" "}
                <span className="text-green-500">// Atomic Commit</span>
              </div>
            </div>
          </div>

          <Paragraph>
            The <strong>Sweeper Service</strong> runs on a tight loop, selecting
            rows where{" "}
            <code className="bg-white/10 px-1 rounded mx-1 text-sky-300">
              status = 'pending'
            </code>{" "}
            and{" "}
            <code className="bg-white/10 px-1 rounded mx-1 text-sky-300">
              created_at &lt; NOW()
            </code>
            . It publishes these to Kafka and then updates the status to{" "}
            <code className="bg-white/10 px-1 rounded mx-1 text-sky-300">
              queued
            </code>
            . This guarantees <em>at-least-once</em> delivery.
          </Paragraph>

          <SectionHeading id="scalability">Growth-ready design</SectionHeading>
          <Paragraph>
            Flowboard is designed to handle spikes in traffic without degrading
            the user experience for the workflow editor.
          </Paragraph>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-[#0f172a] rounded-xl border border-white/5">
              <Layers className="text-sky-500 mb-4" />
              <h4 className="text-white font-semibold mb-2">
                Horizontal Scaling
              </h4>
              <p className="text-sm text-slate-400">
                The API and Execution Workers are stateless. You can spin up 50
                worker containers during peak load and scale down to 2 at night.
              </p>
            </div>
            <div className="p-6 bg-[#0f172a] rounded-xl border border-white/5">
              <Database className="text-sky-500 mb-4" />
              <h4 className="text-white font-semibold mb-2">
                DB Connection Pooling
              </h4>
              <p className="text-sm text-slate-400">
                Since workers are high-volume, we utilize connection pooling
                (via PgBouncer in production) to prevent starving the database.
              </p>
            </div>
            <div className="p-6 bg-[#0f172a] rounded-xl border border-white/5">
              <Cpu className="text-sky-500 mb-4" />
              <h4 className="text-white font-semibold mb-2">Node Isolation</h4>
              <p className="text-sm text-slate-400">
                Code nodes run in a sandboxed VM context to prevent a single
                malicious workflow from crashing the entire worker process.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FlowboardDocs;
