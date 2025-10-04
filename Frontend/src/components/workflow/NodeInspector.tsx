import { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import nodeDefinitions from './NodeDefinitions'; // Import the shared configuration

const NodeInspector = ({ node, onClose, onUpdate }) => {
  // Find the definition for the current node from our single source of truth
  const nodeDefinition = nodeDefinitions.find(def => def.type === node.data.type);

  // Initialize state from node data, applying defaults from the definition
  const [parameters, setParameters] = useState(() => {
    const initialParams = { ...node.data.parameters };
    nodeDefinition?.parameters?.forEach(param => {
      if (initialParams[param.name] === undefined && param.default !== undefined) {
        initialParams[param.name] = param.default;
      }
    });
    return initialParams;
  });

  // Effect to sync state if the selected node changes
  useEffect(() => {
    setParameters(node.data.parameters || {});
  }, [node.id, node.data.parameters]);

  const handleParameterChange = (key, value) => {
    const updated = { ...parameters, [key]: value };
    setParameters(updated);
    onUpdate({
      ...node,
      data: { ...node.data, parameters: updated },
    });
  };

  return (
    <aside className="w-80 border-l bg-card p-4 overflow-y-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-0">
          <CardTitle className="text-lg">Node Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label>Node Type</Label>
            <p className="text-sm font-medium capitalize">{node.data.label || 'Unknown'}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nodeLabel">Label</Label>
            <Input
              id="nodeLabel"
              value={node.data.label || ''}
              onChange={(e) =>
                onUpdate({
                  ...node,
                  data: { ...node.data, label: e.target.value },
                })
              }
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Parameters</h3>
            <div className="space-y-4">
              {/* Dynamically generate fields from the node definition */}
              {nodeDefinition?.parameters?.length > 0 ? (
                nodeDefinition.parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>
                      {param.label || param.name}
                      {param.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={param.name}
                      type={param.type || 'text'}
                      value={parameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      placeholder={param.placeholder || ''}
                      disabled={param.disabled || false}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No parameters available for this node type.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default NodeInspector;