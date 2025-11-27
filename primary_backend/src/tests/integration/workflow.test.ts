
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../index";
import { resetDb } from "../helpers/reset-db";
import { createTestUser } from "../helpers/createTestUser "; 
import prisma from "@shashankpandey/prisma";
import dotenv from 'dotenv'

dotenv.config()
describe("All Endpoints Integration Tests (workflow / webhook / node / cred)", () => {
  let token: string;
  let userId: number;

  beforeEach(async () => {
    await resetDb();
    const seeded = await createTestUser();
    token = seeded.token;
    userId = seeded.user.id;
  });


  it("workflow - should create a workflow", async () => {
    const payload = { title: "Flow 1", nodes: [], connections: [] };

    const res = await request(app)
      .post("/api/v1/workflow/")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.workflow || res.body.WORKFLOW).toBeDefined();

    const id = res.body.workflow?.id ?? res.body.WORKFLOW?.id;
    const db = await prisma.workflow.findUnique({ where: { id } });
    expect(db).not.toBeNull();
  });

  it("workflow - should update a workflow (valid payload)", async () => {
    const w = await prisma.workflow.create({
      data: { title: "Old Flow", userId, nodes: [], connections: [] },
    });

    const updatePayload = {
      workflow: {
        nodes: [
          {
            id: "1763958723786",
            meta: { x: 281.5184368690819, y: 1.245878093617435 },
            type: "webhook",
            action: "Trigger from HTTP request",
            Credential: [],
            parameters: { method: "POST" },
          },
          {
            id: "1763958730019",
            meta: { x: 295.7787405945199, y: 130.0186607888324 },
            type: "discord",
            action: "Send message",
            Credential: [],
            parameters: {
              message: "done",
              WebhookUrl: "https://discord.com/api/webhooks/example",
            },
          },
        ],
        connections: [{ to: "1763958730019", from: "1763958723786" }],
      },
    };

    const res = await request(app)
      .put(`/api/v1/workflow/update/${w.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const updated = await prisma.workflow.findUnique({ where: { id: w.id } });
    expect(updated?.title).toBe("Old Flow");
  });

  it("workflow - should return 400 for malformed update (structural errors)", async () => {
    const w = await prisma.workflow.create({
      data: { title: "Old Flow", userId, nodes: [], connections: [] },
    });

    const updatePayload = {
      workflow: {
        nodes: [
          {
            id: "A",
            type: "webhook",
            meta: {},
            action: "",
            Credential: [],
            parameters: {},
          },
        ],
        connections: [{ from: "A", to: "NON_EXISTENT_NODE" }],
      },
    };

    const res = await request(app)
      .put(`/api/v1/workflow/update/${w.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toBe("Structural errors in workflow");
  });

  it("workflow - should delete a workflow", async () => {
    const w = await prisma.workflow.create({
      data: { title: "Temp Flow", userId, nodes: [], connections: [] },
    });

    const res = await request(app)
      .delete(`/api/v1/workflow/delete/${w.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const deleted = await prisma.workflow.findUnique({ where: { id: w.id } });
    expect(deleted).toBeNull();
  });


  it(" should create, list, decrypt and delete credentials", async () => {

    const createRes = await request(app)
      .post("/api/v1/credential/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "discord",
        credential: { webhook: "https://discord.test/webhook", token: "t" },
      });

  
    if (createRes.status !== 200) {
      console.error(
        "POST /api/v1/cred/ failed:",
        createRes.status,
        createRes.body
      );
    }

    expect(createRes.status).toBe(200);
    expect(createRes.body.ok).toBe(true);
    const created = createRes.body.message;
    expect(created).toBeDefined();
    expect(created.platform).toBe("discord");
    expect(created.ownerId).toBe(userId);


    const listRes = await request(app)
      .get("/api/v1/credential/")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.value)).toBeTruthy();
    const found = listRes.body.value.find((c: any) => c.id === created.id);
    expect(found).toBeDefined();
    expect(found.platform).toBe("discord");

    const decRes = await request(app)
      .get(`/api/v1/credential/decrypted/${created.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(decRes.status).toBe(200);
    expect(decRes.body.value).toBeDefined();
    expect(decRes.body.value).toEqual({
      webhook: "https://discord.test/webhook",
      token: "t",
    });

    const delRes = await request(app)
      .delete("/api/v1/credential/delete")
      .set("Authorization", `Bearer ${token}`)
      .query({ platform: "discord" });

    expect(delRes.status).toBe(200);
    expect(delRes.body.message).toBe("Credential deleted successfully");

    const dbAfter = await prisma.credential.findUnique({
      where: { id: created.id },
    });
    expect(dbAfter).toBeNull();
  });

  it("cred - decrypted route returns 404 for missing id", async () => {
    const res = await request(app)
      .get("/api/v1/credential/decrypted/9999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });


  it("webhook - should create webhook for a workflow and then handle it", async () => {
    const wf = await prisma.workflow.create({
      data: {
        title: "Webhook Flow",
        userId,
        nodes: [{ id: "node-1", type: "webhook", parameters: [] } as any],
        connections: [],
        enabled: true,
      },
    });

    const createRes = await request(app)
      .get(`/api/v1/webhook/create/${wf.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(createRes.status).toBe(200);
    expect(createRes.body.webhook).toBeDefined();
    const path = createRes.body.webhook.path;

    const payload = { hello: "world" };
    const handleRes = await request(app)
      .post(`/api/v1/webhook/handle/${path}`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect([200, 201]).toContain(handleRes.status);
    expect(handleRes.body.message).toBeDefined();

    const exec = await prisma.execution.findFirst({
      where: { workflowId: wf.id },
      orderBy: { createdAt: "desc" },
    });
    expect(exec).toBeDefined();
    expect(exec?.status).toBeDefined();

    const testRes = await request(app)
      .post(`/api/v1/webhook/handle/test/${path}`)
      .send({ test: true });
    expect(testRes.status).toBe(200);
    expect(testRes.body.message).toBe("Webhook test recorded");
  });


  it("node - should fetch node data and run testNode endpoint", async () => {
    const wf = await prisma.workflow.create({
      data: {
        title: "Node Flow",
        userId,
        nodes: [{ id: 111, type: "webhook" } as any],
        connections: [],
        enabled: true,
      },
    });

    const exec = await prisma.execution.create({
      data: { workflowId: wf.id, status: "SUCCESS", input: { a: 1 } },
    });

    await prisma.executionTask.create({
      data: {
        nodeId: "111",
        executionId: exec.id,
        status: "SUCCESS",
        attempts: 0,
        input: { a: 1 } as any,
        output: { b: 2 } as any,
        startedAt: new Date(),
        finishedAt: new Date(),
      },
    });

    const fetchRes = await request(app)
      .get("/api/v1/Nodes/get")
      .set("Authorization", `Bearer ${token}`)
      .query({ nodeData: "111" });

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.data).toBeDefined();
    expect(fetchRes.body.data.status).toBe("SUCCESS");
  });

  it("node - delete TestData should delete latest executionTask for node", async () => {
    const wf = await prisma.workflow.create({
      data: {
        title: "Node Flow",
        userId,
        nodes: [{ id: 111, type: "webhook" } as any],
        connections: [],
        enabled: true,
      },
    });

    const exec = await prisma.execution.create({
      data: { workflowId: wf.id, status: "SUCCESS" },
    });

    const task = await prisma.executionTask.create({
      data: {
        nodeId: "node-to-delete",
        executionId: exec.id,
        status: "FAILED",
        attempts: 1,
        startedAt: new Date(),
        finishedAt: new Date(),
      },
    });

    const res = await request(app)
      .delete("/api/v1/Nodes/TestData")
      .set("Authorization", `Bearer ${token}`)
      .query({ nodeID: "node-to-delete" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Deleted successfully/i);
  });

  it("should return 401 for protected routes when no auth provided", async () => {
    const res = await request(app).post("/api/v1/workflow/").send({
      title: "noauth",
      nodes: [],
      connections: [],
    });
    expect(res.status).toBe(401);
  });

  afterAll(async()=>{
 await prisma.$disconnect();
 await new Promise((r)=>setTimeout(r,1000))

  })
});
