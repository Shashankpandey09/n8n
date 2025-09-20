import {nodeCatalog} from '@shashankpandey/prisma'
import {z} from 'zod'

type NodeAny = any;
type ConnAny = any;
type Cred={
  nodeId?:string,
  type?:string
}
const NodeShapeSchema=z.object({
  id:z.string(),
  type:z.string(),
   parameters: z.record(z.any(),z.any()),
   Credential:z.array(z.string()).optional(),
   meta:z.record(z.any(),z.any()).optional()
})
const connectionSchema=z.object({
  from:z.string().min(1),
  to:z.string().min(1)
})
export function validate(nodes: NodeAny[] = [], connections: ConnAny[] = []) {
  // defensive copies
  nodes = Array.isArray(nodes) ? nodes.slice() : [];
  connections = Array.isArray(connections) ? connections.slice() : [];

  const err: Array<Record<string, any>> = [];
  const missingParams: Record<string, string[]> = {};
  const seen = new Set<string>();
  const missingCredId = new Map<string,Cred>();

  // Normalize & validate nodes
  for (let i = 0; i < nodes.length; i++) {
    // const orig = nodes[i];
    // const n = (orig && typeof orig === 'object') ? { ...orig } : { id: undefined };
    // nodes[i] = n;
    const parsedNode=NodeShapeSchema.safeParse(nodes[i])
    if(!parsedNode.success){
      err.push({
         type: "invalid_node_shape",
        index: i,
        ZodErrors:parsedNode.error.issues.map((e:any) => ({ path: e.path, msg: e.message })),
      })
    }
    const n={...parsedNode.data}

    if (!n.id) {
      err.push({ type: 'missing_node_id', message: 'Each node must have an id', index: i });
      continue;
    }

    if (seen.has(n.id)) {
      err.push({ type: 'dup_node_id', message: `Duplicate node id: ${n.id}`, nodeId: n.id });
      continue;
    }

    seen.add(n.id);
    // nodeById.set(n.id, n);

    const def = nodeCatalog.find(d => d.type === n.type);
    if (!def) {
      err.push({ type: 'unknown_node_type', message: `Unknown action/trigger type: ${n.type}`, nodeId: n.id });
      // still ensure params/meta exist so UI code won't blow up
      n.parameters = n.parameters ?? {};
      n.meta = n.meta ?? {};
      continue;
    }

    // ensure params/meta objects exist and apply defaults
    n.parameters = n.parameters ?? {};
    n.meta = n.meta ?? {};

    for (const p of def.parameters ?? []) {
      // if (n.parameters[p.name] === undefined && p.default !== undefined) {
      //   n.parameters[p.name] = p.default;
      // }
      const required = p.required ?? true;
      const value = n.parameters[p.name];
      const isMissing = required && (value === undefined || value === null || value === '');
      if (isMissing) {
        missingParams[n.id] = missingParams[n.id] || [];
        missingParams[n.id].push(p.name);
      }
   
  }
   if (def.credentials?.[0]?.required) {
  const expected = def.credentials[0].name;
  const actual = n.Credential?.[0];

  if (!actual || actual !== expected) {
    missingCredId.set(n.id, { nodeId: n.id, type: n.type });
  }
}
  }

  // Validate connections WITHOUT throwing — collect errors
  for (let i = 0; i < connections.length; i++) {
    const c = connections[i];
      
    const parsedConn=connectionSchema.safeParse(c)
    if(!parsedConn.success){
       err.push({ type: 'bad_connection', message: 'Connection must have from and to', index: i });
       continue
    }
    // if (!c || !c.from || !c.to) {
     
    //   continue;
    // }
    if (!seen.has(c.from)) {
      err.push({ type: 'unknown_from', message: `Connection.from references unknown node: ${c.from}`, connectionIndex: i, from: c.from });
    }
    if (!seen.has(c.to)) {
      err.push({ type: 'unknown_to', message: `Connection.to references unknown node: ${c.to}`, connectionIndex: i, to: c.to });
    }
  }

  const valid = err.length === 0 && Object.keys(missingParams).length === 0;

  return {
    nodes,
    connections,
    err,           // array of error objects (for UI listing)
    missingParams,  // { nodeId: [paramName, ...] } for field highlighting
   missingCredId,
    valid
  };
}
