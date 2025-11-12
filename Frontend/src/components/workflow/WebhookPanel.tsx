import React from "react";
import { Label } from "@/components/ui/label";

const WebhookPanel = ({ path }) => {
  const [testUrl, setTestUrl] = React.useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor="webhook" className="text-sm font-medium">
          Webhook URL
        </Label>
        <div className="flex gap-2">
          <button
            onClick={() => setTestUrl(true)}
            className="px-3 py-1 text-xs rounded-md border border-border bg-background hover:bg-muted transition-all"
          >
            Test
          </button>
          <button
            onClick={() => setTestUrl(false)}
            className="px-3 py-1 text-xs rounded-md border border-border bg-background hover:bg-muted transition-all"
          >
            Prod
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p
          id="webhook"
          className="flex-1 px-4 py-2 bg-muted border border-input rounded-lg text-sm shadow-sm hover:opacity-90 transition-all duration-150 select-all break-words"
        >
          {testUrl
            ? `http://localhost:3000/api/v1/webhook/handle/test/${path}`
            : `http://localhost:3000/api/v1/webhook/handle/${path}`}
        </p>
      </div>
    </div>
  );
};

export default WebhookPanel;

