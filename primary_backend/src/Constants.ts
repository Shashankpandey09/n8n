 
    // Decide which error types are structural (block saving as runnable)
 export const structuralTypes = new Set([
      "missing_node_id",
      "dup_node_id",
      "dup", 
      "unknown_node_type",
      "unknown",
      "bad_connection",
      "unknown_from",
      "unknown_to",
      "invalid_node_shape"
    ]);