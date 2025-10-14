import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import nodeDefinitions from "./NodeDefinitions"; // 1. Import the single source of truth

const NodePalette = ({ onAddNode, nodes }) => {
  
  const hasTrigger = nodes.some(
    (n) => {
        const definition = nodeDefinitions.find(def => def.type === n.data.type);
        return definition?.category === 'Trigger';
    }
  );

  const webhookExists = nodes.some(n => n.data.type === "webhook");

  return (
    <aside className="w-64 border-r bg-card p-4 overflow-y-auto">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">Node Palette</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 px-0">
        {/* 2. Map directly over the imported definitions */}
        {nodeDefinitions.map(
          ({ type, icon: Icon, label, description, category },i) => {
            const isTrigger = category === "Trigger";
            const isWebhookButton = type.toLowerCase() === "webhook";
            
            const actionDisabled = !hasTrigger && !isTrigger;
            const webhookDisabled = isWebhookButton && webhookExists;
            const isDisabled = actionDisabled || webhookDisabled;

            return (
              <Button
                key={i} // Use type as the key
                variant="outline"
                className={`w-full justify-start h-auto p-3 ${
                  isDisabled ? "opacity-60 pointer-events-auto" : ""
                }`}
                onClick={() => {
                  if (webhookDisabled) {
                    toast.error("A Webhook trigger is already active. Delete it to add another.");
                    return;
                  }
                  if (actionDisabled) {
                    toast.error("Add a Trigger (e.g. Webhook) first to enable actions.");
                    return;
                  }
                  onAddNode(type, category,description); // Pass type and category
                }}
                aria-disabled={isDisabled}
              >
                <div className="flex items-start gap-3 text-left">
                  <Icon className="h-s5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {Array.isArray(description)?description[0]:description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          }
        )}
      </CardContent>
    </aside>
  );
};

export default NodePalette;
