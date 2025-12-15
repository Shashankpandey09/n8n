import { useEffect } from "react";
import { 
  
  Activity,
  AlertCircle,
  Loader2, 
 
} from 'lucide-react';
import ExecutionItem from "@/components/executionPage/ExecutionItem";
import { useExecutionStore } from "@/store/useExecutionStore";
import Navbar from "@/components/ui/Navbar";
const ExecutionsPage = () => {
  const { executions, isLoading, error, fetchExecutions } = useExecutionStore();

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 8000); 
    return () => clearInterval(interval);
  }, [fetchExecutions]);

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-300 font-sans selection:bg-sky-500/30 relative">
    
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,#1e3a8a30,transparent_70%)]"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-7xl px-6 py-12">
        
          <div className="mb-10 border-b border-white/5 pb-8">
             <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Executions</h2>
             <p className="text-slate-400">
                View real-time status and detailed history of your automation runs.
             </p>
          </div>

       
          <div className="space-y-4">
            
            
            {isLoading && executions.length === 0 && (
              <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Error: {error}</span>
              </div>
            )}

        
            {!isLoading && executions.length === 0 && !error && (
              <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 bg-[#1e293b]/10">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                     <Activity className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white">No executions found</h3>
                  <p className="text-slate-500 mt-1">Run a workflow to see data here.</p>
              </div>
            )}

           
            <div className="grid gap-3">
               {executions.map((execution) => (
                  <ExecutionItem key={execution.id} execution={execution} />
               ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ExecutionsPage;