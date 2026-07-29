import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import { Certificate } from "@/hooks/useCertificates";
import { formatDistanceToNow } from "date-fns";

interface NotificationsPanelProps {
  certificates: Certificate[];
}

export const NotificationsPanel = ({ certificates }: NotificationsPanelProps) => {
  // Generate notifications from recent certificates
  const notifications = certificates.slice(0, 5).map((cert) => {
    const timeAgo = formatDistanceToNow(new Date(cert.updated_at), { addSuffix: true });
    
    if (cert.verification_status === "verified") {
      return {
        id: cert.id,
        type: "success" as const,
        message: `Your ${cert.title} certificate was verified successfully! ✅`,
        time: timeAgo,
      };
    } else if (cert.verification_status === "failed") {
      return {
        id: cert.id,
        type: "error" as const,
        message: `Verification failed for ${cert.title}. Please try again. ❌`,
        time: timeAgo,
      };
    } else {
      return {
        id: cert.id,
        type: "pending" as const,
        message: `${cert.title} is being verified... ⏳`,
        time: timeAgo,
      };
    }
  });

  const getIcon = (type: "success" | "error" | "pending") => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 w-full lg:w-80 flex-shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Notifications</h3>
      </div>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                Welcome to EduProof! Start by uploading your first certificate.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Just now</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              {getIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
