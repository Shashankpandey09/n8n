import { useState, useEffect, useCallback } from "react";

/**
 * Hook that encapsulates parameter state + modes + sync to node
 * - initializes defaults
 * - persists defaults once when inspector opens
 * - handles mode switching and expression population
 */
const useNodeParameters = ({ node, nodeDefinition, onUpdate }) => {
  // initialize parameters with defaults from nodeDefinition and node.data
  const initParameters = useCallback(() => {
    const initial = { ...(node.data?.parameters || {}) };
    (nodeDefinition?.parameters || []).forEach((p) => {
      if (initial[p.name] === undefined && p.default !== undefined) {
        initial[p.name] = p.default;
      }
    });
    return initial;
  }, [node.data?.parameters, nodeDefinition?.parameters]);

  const [parameters, setParameters] = useState(() => initParameters());

  // keep a map of modes (fixed | Expression)
  const [paramModes, setParamModes] = useState(() => {
    const modes = {};
    (nodeDefinition?.parameters || []).forEach((p) => {
      modes[p.name] = node.data?.parametersMode?.[p.name] ?? "fixed";
    });
    return modes;
  });

  // persist defaults once when inspector opens for a node
  useEffect(() => {
    const defaults = initParameters();
    setParameters(defaults);

    // only persist defaults if node has no meaningful parameters yet
    const nodeParams = node.data?.parameters;
    const hasNodeParams = nodeParams && Object.keys(nodeParams).length > 0;

    if (!hasNodeParams && Object.keys(defaults).length > 0) {
      onUpdate({ ...node, data: { ...node.data, parameters: defaults } });
    }

    // keep this effect tied to the inspector opening for a new node
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  // when node or definition changes, reinit local states
  useEffect(() => {
    setParameters(initParameters());
    const modes = {};
    (nodeDefinition?.parameters || []).forEach((p) => {
      modes[p.name] = node.data?.parametersMode?.[p.name] ?? "fixed";
    });
    setParamModes(modes);
  }, [node.id, node.data, nodeDefinition, initParameters]);

  const handleParamChange = (key, value) => {
    setParameters((prev) => {
      const updated = { ...prev, [key]: value };
      onUpdate({ ...node, data: { ...node.data, parameters: updated } });
      return updated;
    });
  };

  // When switching to Expression, populate with a json expression if value is empty or not already an expression
  const handleModeChange = (paramName, mode) => {
    setParamModes((prev) => ({ ...prev, [paramName]: mode }));

    if (mode === "Expression") {
      setParameters((prev) => {
        const cur = prev[paramName];
        if (!cur || !String(cur).trim().startsWith("{{")) {
          const expr = `{{$json.${paramName}}}`;
          const updated = { ...prev, [paramName]: expr };
          onUpdate({ ...node, data: { ...node.data, parameters: updated } });
          return updated;
        }
        return prev;
      });
    }
  };

  return {
    parameters,
    setParameters,
    paramModes,
    setParamModes,
    handleParamChange,
    handleModeChange,
  };
};

export default useNodeParameters;
