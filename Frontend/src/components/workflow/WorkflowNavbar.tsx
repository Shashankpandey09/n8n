import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Play, Trash } from "lucide-react";

type WorkflowNavbarProps = {
  workflowTitle: string;
  onTitleChange: (value: string) => void;
  onBack: () => void;
  onTest: () => void | Promise<void>;
  onSave: () => void;
  onDeleteSelection: () => void;
};

const WorkflowNavbar: React.FC<WorkflowNavbarProps> = ({
  workflowTitle,
  onTitleChange,
  onBack,
  onTest,
  onSave,
  onDeleteSelection,
}) => {
  return (
    <header className="border-b border-[#111827] bg-[#020617] shadow-[0_1px_0_#0f172a]">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="
              text-slate-300 
              hover:bg-slate-800/60 
              hover:text-white 
              rounded-md 
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Input
            value={workflowTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="
              w-64 h-9 rounded-md
              bg-slate-900/70
              border border-slate-700
              text-slate-100
              placeholder:text-slate-500
              focus-visible:ring-0
              focus-visible:border-sky-500
            "
          />
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={onTest}
            className="
              h-9 px-3 rounded-md 
              border border-slate-700
              bg-slate-900/40 
              text-slate-200 
              hover:bg-slate-800/70 
              hover:border-slate-600
              transition-all
            "
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Test
          </Button>

          <Button
            onClick={onSave}
            className="
              h-9 px-4 rounded-md
              bg-[#3b82f6] 
              text-white
              shadow-sm 
              hover:bg-[#2563eb]
              active:scale-[0.98]
              transition-all
            "
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>

          {/* <Button
            variant="destructive"
            onClick={onDeleteSelection}
            className="
              h-9 px-4 rounded-md
              bg-[#dc3545]
              hover:bg-[#c62f3f]
              text-white
              shadow-sm
              active:scale-[0.98]
              transition-all
            "
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button> */}
        </div>
      </div>
    </header>
  );
};

export default WorkflowNavbar;
