import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, ShieldAlert, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { safeFormatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
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
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Achievement Trust Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time institutional oversight tracking achievement verifications and confidence scores.
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
          <p className="text-sm text-muted-foreground">Logs will appear here when certificates are analyzed by the Trust Engine.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Status Signal</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Date Verified</TableHead>
                <TableHead className="text-right">Inspection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono font-bold">
                      {log.certificate_id}
                    </code>
                  </TableCell>
                  <TableCell>
                    {log.trust_score >= 75 ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        Verified Trust
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                        <ShieldAlert className="w-3 h-3 mr-1 text-amber-500" />
                        Moderate Risk
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-sm">
                    {log.trust_score}%
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {safeFormatDate(log.created_at, undefined, 'N/A')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/check?code=${log.certificate_id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Full Report <ExternalLink className="w-3 h-3" />
                    </Link>
                  </TableCell>
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
