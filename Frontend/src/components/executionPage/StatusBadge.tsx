import { ExecutionStatus, TaskStatus } from "@/store/useExecutionStore";
import { Activity, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
 export  const icons = {
    [ExecutionStatus.SUCCESS]: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
    [ExecutionStatus.FAILED]: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
    [ExecutionStatus.RUNNING]: <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />,
    [ExecutionStatus.PENDING]: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    [ExecutionStatus.TESTING]: <Activity className="w-3.5 h-3.5 mr-1.5" />,
  };
   export const styles = {
    [ExecutionStatus.SUCCESS]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    [ExecutionStatus.FAILED]: 'text-red-400 bg-red-400/10 border-red-400/20',
    [ExecutionStatus.RUNNING]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    [ExecutionStatus.PENDING]: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    [ExecutionStatus.TESTING]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };
const StatusBadge = ({ status, type = 'execution' }: { status: ExecutionStatus|TaskStatus, type?: 'execution' | 'task' }) => {
 

  const currentStyle = styles[status as ExecutionStatus] || styles[ExecutionStatus.PENDING];
  const currentIcon = icons[status as ExecutionStatus] || icons[ExecutionStatus.PENDING];

  return (
    <div className={`flex items-center px-2.5 py-1 rounded-md border text-xs font-medium ${currentStyle} w-fit`}>
      {currentIcon}
      {status}
    </div>
  );
};
export default StatusBadge