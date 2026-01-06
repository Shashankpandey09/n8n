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

}) => {
  return (
    <header className="border-b border-[#111827] bg-[#020617] shadow-[0_1px_0_#0f172a]">
      <div className="flex h-14 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="
              text-slate-300 
              hover:bg-slate-800/60 
              hover:text-white 
              rounded-md 
              h-8 w-8 sm:h-9 sm:w-9
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Input
            value={workflowTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="
              w-32 sm:w-48 md:w-64 h-8 sm:h-9 rounded-md
              bg-slate-900/70
              border border-slate-700
              text-slate-100
              text-xs sm:text-sm
              placeholder:text-slate-500
              focus-visible:ring-0
              focus-visible:border-sky-500
            "
          />
        </div>

        <div className="flex gap-1.5 sm:gap-2 items-center">
          <Button
            variant="outline"
            onClick={onTest}
            className="
              h-8 sm:h-9 px-2 sm:px-3 rounded-md 
              border border-slate-700
              bg-slate-900/40 
              text-slate-200 
              hover:bg-slate-800/70 
              hover:border-slate-600
              transition-all
              text-xs sm:text-sm
            "
          >
            <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Test</span>
          </Button>

          <Button
            onClick={onSave}
            className="
              h-8 sm:h-9 px-2 sm:px-4 rounded-md
              bg-[#3b82f6] 
              text-white
              shadow-sm 
              hover:bg-[#2563eb]
              active:scale-[0.98]
              transition-all
              text-xs sm:text-sm
            "
          >
            <Save className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>

        </div>
      </div>
    </header>
  );
};

export default WorkflowNavbar;
