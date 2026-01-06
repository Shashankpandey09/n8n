import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import nodeDefinitions from "./NodeDefinitions";

const NodePalette = ({ onAddNode, nodes, isMobile = false }) => {
  const hasTrigger = nodes.some((n) => {
    const definition = nodeDefinitions?.find((def) => def.type === n.data.type);
    return definition?.category === "Trigger";
  });

  const webhookExists = nodes?.some((n) => n.data.type === "webhook");

  // For mobile overlay, render without the aside wrapper
  if (isMobile) {
    return (
      <div className="space-y-2">
        {nodeDefinitions.map(({ type, icon: Icon, label, description, category }, i) => {
          const isTrigger = category === "Trigger";
          const isWebhookButton = type.toLowerCase() === "webhook";

          const actionDisabled = !hasTrigger && !isTrigger;
          const webhookDisabled = isWebhookButton && webhookExists;
          const isDisabled = actionDisabled || webhookDisabled;

          return (
            <Button
              key={i}
              variant="ghost"
              className={`w-full justify-start h-auto p-3 rounded-lg border border-[#1f2933] bg-[#111827] hover:bg-[#1b2430] text-left ${isDisabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
              onClick={() => {
                if (webhookDisabled) {
                  toast.error(
                    "A Webhook trigger is already active. Delete it to add another."
                  );
                  return;
                }
                if (actionDisabled) {
                  toast.error("Add a Trigger (e.g. Webhook) first to enable actions.");
                  return;
                }
                onAddNode(type, category, description);
              }}
              aria-disabled={isDisabled}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 shrink-0 text-[#9ca3ff]" />
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-[#9aa3ad]">
                    {Array.isArray(description) ? description[0] : description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="hidden sm:block w-48 md:w-56 lg:w-64 border-r border-[#1f2933] bg-[#0b1017] text-[#e6eef6] p-3 md:p-4 overflow-y-auto">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xs md:text-sm font-semibold tracking-wide text-[#cbd5f5]">
          Node Palette
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1.5 md:space-y-2 px-0 pt-2 md:pt-3">
        {nodeDefinitions.map(({ type, icon: Icon, label, description, category }, i) => {
          const isTrigger = category === "Trigger";
          const isWebhookButton = type.toLowerCase() === "webhook";

          const actionDisabled = !hasTrigger && !isTrigger;
          const webhookDisabled = isWebhookButton && webhookExists;
          const isDisabled = actionDisabled || webhookDisabled;

          return (
            <Button
              key={i}
              variant="ghost"
              className={`w-full justify-start h-auto p-2 md:p-3 rounded-lg border border-[#1f2933] bg-[#111827] hover:bg-[#1b2430] text-left ${isDisabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
              onClick={() => {
                if (webhookDisabled) {
                  toast.error(
                    "A Webhook trigger is already active. Delete it to add another."
                  );
                  return;
                }
                if (actionDisabled) {
                  toast.error("Add a Trigger (e.g. Webhook) first to enable actions.");
                  return;
                }
                onAddNode(type, category, description);
              }}
              aria-disabled={isDisabled}
            >
              <div className="flex items-start gap-2 md:gap-3">
                <Icon className="h-4 w-4 md:h-5 md:w-5 mt-0.5 shrink-0 text-[#9ca3ff]" />
                <div>
                  <div className="text-xs md:text-sm font-medium">{label}</div>
                  <div className="text-[10px] md:text-xs text-[#9aa3ad] hidden md:block">
                    {Array.isArray(description) ? description[0] : description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </aside>
  );
};

export default NodePalette;
