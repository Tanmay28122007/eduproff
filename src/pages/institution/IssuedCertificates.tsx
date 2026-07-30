import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { safeFormatDate } from "@/lib/utils";
import { Search, FileText, Calendar, User, Hash, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface IssuedCert {
  certificate_id: string;
  student_name: string;
  course_name: string;
  issue_date: string;
  issued_at: string;
}

const IssuedCertificates = () => {
  const [certs, setCerts] = useState<IssuedCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from("issued_certificates")
          .select("*")
          .order("issued_at", { ascending: false });

        setCerts((data as IssuedCert[]) || []);
      } catch (err) {
        console.error("Error fetching issued certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const filtered = certs.filter(c => {
    const q = search.toLowerCase();
    return (c.student_name || "").toLowerCase().includes(q) || (c.certificate_id || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Issued Certificates
        </h1>
        <p className="text-muted-foreground">
          {certs.length} certificate{certs.length !== 1 ? "s" : ""} issued
        </p>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by student name or code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Student Name</span></TableHead>
                <TableHead><span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Course</span></TableHead>
                <TableHead><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Issue Date</span></TableHead>
                <TableHead><span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Certificate ID</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No certificates found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(cert => (
                  <TableRow key={cert.certificate_id}>
                    <TableCell className="font-medium">{cert.student_name}</TableCell>
                    <TableCell>{cert.course_name}</TableCell>
                    <TableCell>{safeFormatDate(cert.issue_date)}</TableCell>
                    <TableCell>
                      <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                        {cert.certificate_id}
                      </code>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IssuedCertificates;
