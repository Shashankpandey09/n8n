import { Execution } from "@/store/useExecutionStore";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";
import TaskList from "./TaskList";
const ExecutionItem = ({ execution }: { execution: Execution}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#141625] border border-slate-800 rounded-lg transition-all hover:border-slate-700">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-6">
         
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-mono mb-1">#{execution.id}</span>
                <span className="text-slate-200 font-semibold text-base group-hover:text-blue-400 transition-colors">
                    {execution.workflow.title}
                </span>
            </div>

            
            <div className="hidden md:flex flex-col text-sm">
                 <span className="text-slate-500 text-xs">Started</span>
                 <span className="text-slate-300">
                    {new Date(execution.createdAt).toLocaleDateString()} 
                    <span className="text-slate-600 mx-1">•</span> 
                    {new Date(execution.createdAt).toLocaleTimeString()}
                 </span>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <StatusBadge status={execution.status} />
            <div className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
            </div>
        </div>
      </div>

     
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-800/50">
            <div className="mt-4">
                <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold ml-2">Subtasks Execution</h4>
                <TaskList tasks={execution.tasks} />
            </div>
        </div>
      )}
    </div>
  );
};
export default ExecutionItem