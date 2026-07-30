import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { safeFormatDate } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface LogEntry {
  id: string;
  certificate_id: string;
  status: string;
  trust_score: number;
  created_at: string;
}

const VerificationLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await supabase
        .from("verification_logs")
        .select("*")
        .order("created_at", { ascending: false });

      setLogs((data as LogEntry[]) || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Verification Logs
        </h1>
        <p className="text-muted-foreground">
          Track how certificates are being verified by recruiters.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">No verification logs yet</h3>
          <p className="text-muted-foreground">Logs will appear here when certificates are verified.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                      {log.certificate_id}
                    </code>
                  </TableCell>
                  <TableCell>
                    {log.status === "verified" ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="w-3 h-3 mr-1" />
                        {log.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">{log.trust_score}%</TableCell>
                  <TableCell>{safeFormatDate(log.created_at, undefined, 'N/A')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VerificationLogs;
