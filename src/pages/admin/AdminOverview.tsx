import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, Shield, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminOverview = () => {
  const [stats, setStats] = useState({ users: 0, certificates: 0, verifications: 0, institutions: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string; users: number; certificates: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, certsRes, logsRes, instRes] = await Promise.all([
          supabase.from("profiles").select("created_at"),
          supabase.from("certificates").select("created_at"),
          supabase.from("verification_logs").select("*", { count: "exact", head: true }),
          supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "institution"),
        ]);

        const profiles = profilesRes.data || [];
        const certs = certsRes.data || [];

        setStats({
          users: profiles.length,
          certificates: certs.length,
          verifications: logsRes.count || 0,
          institutions: instRes.count || 0,
        });

        const months: Record<string, { users: number; certificates: number }> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
          months[key] = { users: 0, certificates: 0 };
        }

        profiles.forEach((p) => {
          if (p.created_at) {
            const d = new Date(p.created_at);
            const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
            if (months[key]) months[key].users++;
          }
        });

        certs.forEach((c) => {
          if (c.created_at) {
            const d = new Date(c.created_at);
            const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
            if (months[key]) months[key].certificates++;
          }
        });

        setMonthlyData(Object.entries(months).map(([month, data]) => ({ month, ...data })));
      } catch (err) {
        console.error("Error fetching admin overview stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.users, icon: Users, color: "text-blue-600" },
    { title: "Certificates", value: stats.certificates, icon: Award, color: "text-emerald-600" },
    { title: "Verifications", value: stats.verifications, icon: Shield, color: "text-purple-600" },
    { title: "Institutions", value: stats.institutions, icon: Activity, color: "text-orange-600" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="hsl(var(--primary))" name="Users" />
              <Bar dataKey="certificates" fill="hsl(var(--primary) / 0.5)" name="Certificates" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
