
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useNodeParameters from "./useNodeParameters";

const ParametersPanel = ({ node, nodeDefinition, onUpdate }) => {
  const {
    parameters,
    paramModes,
    handleParamChange,
    handleModeChange,
  } = useNodeParameters({ node, nodeDefinition, onUpdate });

  return (
    <div className="space-y-4">
      {nodeDefinition?.parameters?.length > 0 ? (
        nodeDefinition.parameters.map((param) => {
          const mode = paramModes[param.name] ?? "fixed";

          return (
            <div key={param.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={param.name} className="flex items-center gap-2">
                  <span>{param.label || param.name}</span>
                  {param.required && <span className="text-destructive">*</span>}
                </Label>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleModeChange(param.name, "fixed")}
                    type="button"
                    className={`px-2 py-1 text-xs font-semibold rounded-md border transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                      mode === "fixed"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    Fixed
                  </button>
                  <button
                    onClick={() => handleModeChange(param.name, "Expression")}
                    type="button"
                    className={`px-2 py-1 text-xs font-semibold rounded-md border transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                      mode === "Expression"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    Expression
                  </button>
                </div>
              </div>

              <Input
                id={param.name}
                type={param.type || "text"}
                value={parameters[param.name] ?? ""}
                onChange={(e) => handleParamChange(param.name, e.target.value)}
                placeholder={
                  mode === "fixed"
                    ? param.placeholder ?? param.default ?? ""
                    : `{{$json.${param.name}}}`
                }
                disabled={!!param.disabled}
                className="bg-transparent"
              />
            </div>
          );
        })
      ) : (
        <p className="text-sm">No parameters available for this node type.</p>
      )}
    </div>
  );
};

export default ParametersPanel;