import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeFormatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CertRow {
  id: string;
  title: string;
  issuer: string;
  verification_status: string;
  created_at: string;
  user_id: string;
}

const AdminCertificates = () => {
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCerts = async () => {
    setLoading(true);
    const { data } = await supabase.from("certificates").select("id, title, issuer, verification_status, created_at, user_id");
    setCerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCerts(); }, []);

  const markInvalid = async (id: string) => {
    setActing(id);
    await supabase.from("certificates").update({ verification_status: "invalid" }).eq("id", id);
    toast({ title: "Certificate marked as invalid" });
    fetchCerts();
    setActing(null);
  };

  const deleteCert = async (id: string) => {
    if (!confirm("Delete this certificate permanently?")) return;
    setActing(id);
    await supabase.from("certificates").delete().eq("id", id);
    toast({ title: "Certificate deleted" });
    fetchCerts();
    setActing(null);
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "verified": return "default";
      case "invalid": return "destructive";
      default: return "secondary";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Certificates ({certs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certs.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.issuer}</TableCell>
                <TableCell><Badge variant={statusVariant(c.verification_status)}>{c.verification_status}</Badge></TableCell>
                <TableCell>{safeFormatDate(c.created_at)}</TableCell>
                <TableCell className="text-right space-x-1">
                  {c.verification_status !== "invalid" && (
                    <Button variant="ghost" size="sm" onClick={() => markInvalid(c.id)} disabled={acting === c.id}>
                      <XCircle className="h-4 w-4 text-destructive/70" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteCert(c.id)} disabled={acting === c.id}>
                    {acting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminCertificates;
