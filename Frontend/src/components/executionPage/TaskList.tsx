import { ExecutionTask } from "@/store/useExecutionStore"
import StatusBadge from "./StatusBadge";
import { AlertCircle } from "lucide-react";

const TaskList:React.FC<{tasks:ExecutionTask[]}> = ({tasks}) => {
    if (!tasks || tasks.length === 0) {
    return <div className="p-4 text-slate-500 text-sm italic">No subtasks recorded.</div>;
  }
  return (
    <div className="bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800/50 mt-4 mx-2 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
          <tr>
            <th className="p-3 font-medium">Node ID</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Started At</th>
            <th className="p-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {tasks.map((task) => {
           
             const start = new Date(task.startedAt).getTime();
             const end = new Date(task.finishedAt).getTime();
             const duration = task.finishedAt ? `${((end - start) / 1000).toFixed(2)}s` : '-';

             return (
              <tr key={task.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="p-3 text-slate-200 font-mono text-xs">{task.nodeId}</td>
                <td className="p-3">
                  <StatusBadge status={task.status} type="task" />
                  {task.error && (
                    <div className="text-red-400 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {task.error}
                    </div>
                  )}
                </td>
                <td className="p-3 text-slate-400 text-xs">
                  {new Date(task.startedAt).toLocaleString()}
                </td>
                <td className="p-3 text-slate-400 text-xs font-mono">{duration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export default TaskList