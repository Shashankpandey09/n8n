import type { Credential } from "@/store/CredStore";
export const NormalizeForBackend = (FrontendNodes: any,savedCredentials:Pick<Credential, "createdAt" | "platform" | "id">[]) => {
  //need all the credentials which are stored in the
  const finalPayLoad = [];
  const credentialSet=new Set<string>(savedCredentials.map((s)=>s.platform))
  FrontendNodes.forEach((n) => {
 
    const action = Array.isArray(n?.data?.description)
      ? n?.data?.description[0]
      : n?.data?.description;
    const newNode = {
      id: n.id,
      meta: { ...n.position },
      Credential: credentialSet.has(n.data?.type)?[n.data?.type]:[],
      type: n.data?.type,
      parameters: n.data?.parameters,
      action: action,
    };
    console.log(newNode);

    finalPayLoad.push(newNode);
  });
  return finalPayLoad;
};

export const Normalize_Conn = (conn: any[]) => {
  const formatedConn = [];
  conn.forEach((C) => {
    const newConn = {
      to: C.target,
      from: C.source,
    };
    formatedConn.push(newConn);
  });
  return formatedConn;
};
type Node = any
type Conn = { from: string; to: string };
const isWait = (n?: Node) =>
  ((n?.action ?? "").trim().toLowerCase() === "send&wait");
export const orderNodes = (nodes: Node[], conns: Conn[]): Node[][] => {
  const nodesById = new Map(nodes.map(n => [n.id, n]));
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();


  for (const n of nodes) {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  }
  for (const c of conns) {
    if (!adj.has(c.from)) adj.set(c.from, []);
    adj.get(c.from)!.push(c.to);
    indeg.set(c.to, (indeg.get(c.to) ?? 0) + 1);
  }

  const readySet = new Set<string>();
  for (const [id, d] of indeg.entries()) if (d === 0) readySet.add(id);

  const layers: Node[][] = [];
  const emitted = new Set<string>();

  while (readySet.size > 0) {
    // split ready into non-wait and wait
    const nonWaitIds: string[] = [];
    const waitIds: string[] = [];
    for (const id of readySet) {
      if (emitted.has(id)) continue;
      const n = nodesById.get(id);
      if (isWait(n)) waitIds.push(id); else nonWaitIds.push(id);
    }

    const thisLayer: Node[] = [];
    const nextReadyCandidates: string[] = [];
    const deferredEdges: Array<[string, string]> = [];

    if (nonWaitIds.length > 0) {
      // Process all non-wait ready nodes (prefer them)
      for (const id of nonWaitIds) {
        if (emitted.has(id)) continue;
        emitted.add(id);
        thisLayer.push(nodesById.get(id)!);
        // propagate immediately
        for (const to of adj.get(id) ?? []) {
          const newDeg = (indeg.get(to) ?? 0) - 1;
          indeg.set(to, newDeg);
          if (newDeg === 0 && !emitted.has(to)) {
            // add to readySet immediately (so it can be processed in same or next loop)
            nextReadyCandidates.push(to);
          }
        }
        readySet.delete(id);
      }
      // keep waitIds in readySet (they remain for later)
    } else {
      // No non-wait nodes ready — process wait nodes now
      for (const id of waitIds) {
        if (emitted.has(id)) continue;
        emitted.add(id);
        thisLayer.push(nodesById.get(id)!);
        // for wait nodes, treat outgoing edges as deferred until next epoch
        for (const to of adj.get(id) ?? []) deferredEdges.push([id, to]);
        readySet.delete(id);
      }
      // apply deferred edges to potentially make their targets ready in next iteration
      for (const [, to] of deferredEdges) {
        const newDeg = (indeg.get(to) ?? 0) - 1;
        indeg.set(to, newDeg);
        if (newDeg === 0 && !emitted.has(to)) nextReadyCandidates.push(to);
      }
    }

    if (thisLayer.length > 0) layers.push(thisLayer);

    // refill readySet with unique nextReadyCandidates (excluding emitted)
    for (const id of nextReadyCandidates) {
      if (!emitted.has(id)) readySet.add(id);
    }

    // guard: remove already emitted ids
    for (const id of Array.from(readySet)) {
      if (emitted.has(id)) readySet.delete(id);
    }
  }

  // remaining nodes (cycles/unreachable) — append as final layer
  const remaining = nodes.filter(n => !emitted.has(n.id));
  if (remaining.length > 0) layers.push(remaining);

  return layers.flat();
};



