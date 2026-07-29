import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Award, FileText, ShieldCheck, TrendingUp } from "lucide-react";
import { MessageInbox } from "@/components/messaging/MessageInbox";

const InstitutionOverview = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "Admin";
  const [certCount, setCertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count } = await supabase
          .from("issued_certificates")
          .select("*", { count: "exact", head: true });

        setCertCount(count || 0);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const verificationLogs = 5;
  const verified = 3;
  const invalid = 2;

  const stats = [
    { label: "Certificates Issued", value: loading ? "..." : certCount, icon: FileText, color: "bg-primary/10 text-primary" },
    { label: "Verifications", value: verificationLogs, icon: ShieldCheck, color: "bg-success/10 text-success" },
    { label: "Verified", value: verified, icon: Award, color: "bg-accent/10 text-accent-foreground" },
    { label: "Invalid Attempts", value: invalid, icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Award className="w-4 h-4" />
          Institution Dashboard
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome, {userName}! 🏛️
        </h1>
        <p className="text-muted-foreground">
          Manage your institution's certificates and track verifications.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="mt-8">
        <MessageInbox canMessageRoles={["candidate"]} />
      </div>
    </div>
  );
};

export default InstitutionOverview;
