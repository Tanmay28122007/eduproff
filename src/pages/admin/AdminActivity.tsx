import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { safeFormatDateTime } from "@/lib/utils";

interface LogRow {
  id: string;
  certificate_id: string;
  recruiter_id: string;
  status: string;
  trust_score: number;
  created_at: string;
  recruiter_name?: string;
}

const AdminActivity = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: logData } = await supabase
        .from("verification_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!logData?.length) { setLoading(false); return; }

      // Get recruiter names
      const recruiterIds = [...new Set(logData.map((l) => l.recruiter_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", recruiterIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach((p) => { nameMap[p.user_id] = p.full_name || "Unknown"; });

      setLogs(logData.map((l) => ({ ...l, recruiter_name: nameMap[l.recruiter_id] || "Unknown" })));
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Activity Logs ({logs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recruiter</TableHead>
              <TableHead>Certificate ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trust Score</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.recruiter_name}</TableCell>
                <TableCell className="font-mono text-xs">{l.certificate_id}</TableCell>
                <TableCell>
                  <Badge variant={l.status === "verified" ? "default" : "destructive"}>{l.status}</Badge>
                </TableCell>
                <TableCell>{l.trust_score}/100</TableCell>
                <TableCell>{safeFormatDateTime(l.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminActivity;
