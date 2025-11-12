
import { Button } from "@/components/ui/button";

const ExecuteButton = ({ onExecute }) => {
  return (
    <Button
      onClick={onExecute}
      size="sm"
      className="px-3 py-1.5 rounded-md border border-input transition-all"
      title="Execute node"
    >
      Execute Node
    </Button>
  );
};

export default ExecuteButton;