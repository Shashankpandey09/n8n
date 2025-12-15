import { useState, useEffect, useCallback } from "react";



const useNodeParameters = ({ node, nodeDefinition, onUpdate }) => {

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

  const [paramModes, setParamModes] = useState(() => {
    const modes = {};
    (nodeDefinition?.parameters || []).forEach((p) => {
      modes[p.name] = node.data?.parametersMode?.[p.name] ?? "fixed";
    });
    return modes;
  });


  useEffect(() => {
    const defaults = initParameters();
    setParameters(defaults);


    const nodeParams = node.data?.parameters;
    const hasNodeParams = nodeParams && Object.keys(nodeParams).length > 0;

    if (!hasNodeParams && Object.keys(defaults).length > 0) {
      onUpdate({ ...node, data: { ...node.data, parameters: defaults } });
    }

  }, [node.id]);


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
