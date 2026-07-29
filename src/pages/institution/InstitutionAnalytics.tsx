import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Award, XCircle, Loader2 } from "lucide-react";

interface IssuedCert {
  certificate_id: string;
  issue_date: string;
}

const InstitutionAnalytics = () => {
  const [certs, setCerts] = useState<IssuedCert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from("issued_certificates")
          .select("certificate_id, issue_date");

        setCerts((data as IssuedCert[]) || []);
      } catch (err) {
        console.error("Error fetching analytics certs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const verified = 3;
  const invalid = 2;
  const total = 5;
  const verifyRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  const byMonth: Record<string, number> = {};
  certs.forEach(c => {
    if (c.issue_date) {
      const m = c.issue_date.substring(0, 7);
      byMonth[m] = (byMonth[m] || 0) + 1;
    }
  });
  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground">Overview of your institution's certificate activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{certs.length}</p>
          <p className="text-sm text-muted-foreground">Total Issued</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 text-center">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{verifyRate}%</p>
          <p className="text-sm text-muted-foreground">Verification Rate</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-foreground">{invalid}</p>
          <p className="text-sm text-muted-foreground">Invalid Attempts</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Certificates by Month</h2>
        {months.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {months.map(([month, count]) => {
              const maxCount = Math.max(...months.map(([, c]) => c));
              const pct = (count / maxCount) * 100;
              return (
                <div key={month} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-20 shrink-0">{month}</span>
                  <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden">
                    <div className="h-full gradient-hero rounded-lg flex items-center px-3" style={{ width: `${pct}%` }}>
                      <span className="text-xs font-semibold text-primary-foreground">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionAnalytics;
