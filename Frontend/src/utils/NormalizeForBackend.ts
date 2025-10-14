export const NormalizeForBackend = (FrontendNodes: any) => {
  const finalPayLoad = [];

  FrontendNodes.forEach((n) => {
    const action = Array.isArray(n?.data?.description)
      ? n?.data?.description[0]
      : n?.data?.description;
    const newNode = {
      id: n.id,
      meta: { ...n.position },
      Credential: [n.data?.type],
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

export const orderNodes = (nodes: Node[], conns: Conn[]): Node[] => {
  // index nodes by id for O(1) lookups
  const nodesById = new Map<string, Node>(nodes.map(n => [n.id, n]));

  // map from source id -> array of target ids (preserves insertion order)
  const connMap = new Map<string, string[]>();
  for (const c of conns) {
    if (!connMap.has(c.from)) connMap.set(c.from, []);
    connMap.get(c.from)!.push(c.to);
  }

  // Set to preserve insertion order and dedupe by object identity
  const ordered = new Set<Node>();

  // helper predicate for "wait" nodes (case-insensitive)
const isWait = (n?: Node): boolean =>
  ((n?.action ?? "").trim().toLowerCase() === "send&wait");

  // iterate connections in insertion order
  for (const [fromId, toArr] of connMap.entries()) {
    const fromNode = nodesById.get(fromId);
    if (fromNode) ordered.add(fromNode);

    const waitNodes: Node[] = [];
    for (const targetId of toArr) {
      const targetNode = nodesById.get(targetId);
      if (!targetNode) continue; // skip missing node ids
      if (isWait(targetNode)) waitNodes.push(targetNode);
      else ordered.add(targetNode);
    }

    // add wait nodes after non-wait targets
    for (const w of waitNodes) ordered.add(w);
  }

  // finally include any nodes that never appeared in connections
  for (const n of nodes) {
    if (!ordered.has(n)) ordered.add(n);
  }

  return Array.from(ordered);
};

