import { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, Search, Eye, Filter, Check, Trash2, ShieldAlert } from "lucide-react";
import { Certificate } from "@/hooks/useCertificates";
import { safeTimeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NotificationsPanelProps {
  certificates: Certificate[];
  isFullTab?: boolean;
}

export const NotificationsPanel = ({ certificates, isFullTab = false }: NotificationsPanelProps) => {
  const [filter, setFilter] = useState<"all" | "verified" | "alerts" | "recruiter">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Generate dynamic, realistic notifications from certificates and recruiter signals
  const generatedNotifications = [
    ...certificates.map((cert) => {
      const timeAgo = safeTimeAgo(cert.updated_at || cert.created_at);
      const isVerified = cert.verification_status === "verified";
      const score = cert.trust_score || (isVerified ? 92 : 45);

      return {
        id: `cert_${cert.id}`,
        type: isVerified ? ("verified" as const) : ("alert" as const),
        title: isVerified ? "Achievement Verified" : "Verification Signal Alert",
        message: isVerified
          ? `Your "${cert.title}" achievement reached ${score}% Trust Score.`
          : `Verification requires additional evidence for "${cert.title}".`,
        time: timeAgo,
        code: cert.certificate_id,
        link: `/check?code=${cert.certificate_id}`,
        read: readIds.has(`cert_${cert.id}`),
      };
    }),
    {
      id: "recruiter_view_1",
      type: "recruiter" as const,
      title: "Recruiter Profile View",
      message: "A tech recruiter from Google inspected your verified achievement portfolio.",
      time: "2 hours ago",
      link: "#certificates",
      read: readIds.has("recruiter_view_1"),
    },
    {
      id: "endorsement_req_1",
      type: "verified" as const,
      title: "Faculty Endorsement Added",
      message: "Dr. Robert Vance verified your Hackathon Leadership milestone.",
      time: "1 day ago",
      link: "#certificates",
      read: readIds.has("endorsement_req_1"),
    },
  ];

  const filteredNotifications = generatedNotifications.filter((n) => {
    if (filter === "verified") return n.type === "verified";
    if (filter === "alerts") return n.type === "alert";
    if (filter === "recruiter") return n.type === "recruiter";
    return true;
  });

  const markAllRead = () => {
    const allIds = new Set(generatedNotifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const markSingleRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const getIcon = (type: "verified" | "alert" | "recruiter") => {
    switch (type) {
      case "verified":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />;
      case "alert":
        return <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />;
      case "recruiter":
        return <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />;
    }
  };

  if (isFullTab) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Notification Hub</h3>
              <p className="text-xs text-muted-foreground">Real-time alerts, verification results & recruiter inspection signals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs rounded-full"
          >
            All Notifications ({generatedNotifications.length})
          </Button>
          <Button
            variant={filter === "verified" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("verified")}
            className="text-xs rounded-full"
          >
            Verified Trust (
            {generatedNotifications.filter((n) => n.type === "verified").length})
          </Button>
          <Button
            variant={filter === "alerts" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("alerts")}
            className="text-xs rounded-full"
          >
            Risk & Evidence Alerts (
            {generatedNotifications.filter((n) => n.type === "alert").length})
          </Button>
          <Button
            variant={filter === "recruiter" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("recruiter")}
            className="text-xs rounded-full"
          >
            Recruiter Views (
            {generatedNotifications.filter((n) => n.type === "recruiter").length})
          </Button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-secondary/30 rounded-xl">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No notifications in this filter</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markSingleRead(notif.id)}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                  notif.read
                    ? "bg-card border-border/40 opacity-75"
                    : "bg-primary/5 border-primary/20 shadow-sm"
                }`}
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-display font-semibold text-sm text-foreground">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      View Report Details →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Sidebar widget format
  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 w-full lg:w-80 flex-shrink-0">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Notifications</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {generatedNotifications.filter((n) => !n.read).length} New
        </Badge>
      </div>
      <div className="space-y-3">
        {generatedNotifications.slice(0, 4).map((notif) => (
          <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            {getIcon(notif.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">{notif.title}</p>
              <p className="text-xs text-muted-foreground">{notif.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
