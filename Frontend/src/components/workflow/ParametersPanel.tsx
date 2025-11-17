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
            <div key={param.name} className="space-y-2 text-slate-200">
              {/* LABEL + MODE BUTTONS */}
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={param.name}
                  className="flex items-center gap-2 text-xs text-slate-300"
                >
                  <span>{param.label || param.name}</span>
                  {param.required && (
                    <span className="text-red-400">*</span>
                  )}
                </Label>

                <div className="flex gap-2">
                  {/* FIXED BUTTON */}
                  <button
                    onClick={() => handleModeChange(param.name, "fixed")}
                    type="button"
                    className={`
                      px-2 py-1 text-[11px] font-semibold rounded-md border transition-all
                      focus:outline-none
                      ${
                        mode === "fixed"
                          ? "bg-sky-600 border-sky-500 text-white shadow-sm"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }
                    `}
                  >
                    Fixed
                  </button>

                  {/* EXPRESSION BUTTON */}
                  <button
                    onClick={() => handleModeChange(param.name, "Expression")}
                    type="button"
                    className={`
                      px-2 py-1 text-[11px] font-semibold rounded-md border transition-all
                      focus:outline-none
                      ${
                        mode === "Expression"
                          ? "bg-sky-600 border-sky-500 text-white shadow-sm"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }
                    `}
                  >
                    Expression
                  </button>
                </div>
              </div>

              {/* INPUT FIELD */}
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
                className="
                  bg-slate-900
                  border border-slate-700
                  text-slate-100
                  placeholder:text-slate-500
                  focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                  rounded-md
                  h-9
                "
              />
            </div>
          );
        })
      ) : (
        <p className="text-sm text-slate-400">
          No parameters available for this node type.
        </p>
      )}
    </div>
  );
};

export default ParametersPanel;
