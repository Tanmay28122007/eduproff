import React, { useState } from "react";
import { VerifierEndorsement } from "@/services/trustEngine";
import { UserCheck, Mail, Send, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface HumanEndorsementCardProps {
  endorsements: VerifierEndorsement[];
  onAddEndorsement?: (endorsement: VerifierEndorsement) => void;
}

export const HumanEndorsementCard: React.FC<HumanEndorsementCardProps> = ({
  endorsements,
  onAddEndorsement,
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Faculty Mentor / Professor");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please provide verifier name and email.");
      return;
    }

    setIsSending(true);

    const newEndorsement: VerifierEndorsement = {
      id: `end_${Date.now()}`,
      name: name.trim(),
      role,
      organization: organization.trim() || "Academic Institution",
      email: email.trim(),
      status: "verified",
      trustWeight: 9,
      verifiedAt: new Date().toISOString().split("T")[0],
      comments: "Verified direct mentorship and event completion.",
    };

    setTimeout(() => {
      if (onAddEndorsement) onAddEndorsement(newEndorsement);
      toast.success(`Verification endorsement request sent to ${email}`);
      setName("");
      setEmail("");
      setOrganization("");
      setIsSending(false);
    }, 600);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-500" />
            Human Verifier Endorsements
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Endorsements from trusted faculty, mentors, and competition organizers with weighted verifier trust scores.
          </p>
        </div>
      </div>

      {/* Endorsements List */}
      {endorsements.length > 0 ? (
        <div className="space-y-3">
          {endorsements.map((end) => (
            <div key={end.id} className="p-4 rounded-xl bg-secondary/30 border border-border/40 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{end.name}</span>
                  <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-teal-500" />
                    Verified Verifier
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {end.role} · <span className="text-foreground font-medium">{end.organization}</span>
                </p>
                {end.comments && (
                  <p className="text-xs italic text-muted-foreground mt-1">"{end.comments}"</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  Trust Weight: {end.trustWeight}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-secondary/20 rounded-xl border border-dashed border-border">
          <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No human verifier endorsements attached yet.</p>
        </div>
      )}

      {/* Request Form */}
      <form onSubmit={handleSendRequest} className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-primary" /> Request Endorsement from Faculty / Mentor / Organizer
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Verifier Full Name (e.g. Dr. Sarah Jenkins)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs h-9"
          />
          <Input
            placeholder="Official Email (e.g. s.jenkins@stanford.edu)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-xs h-9"
          />
          <Input
            placeholder="Organization / University"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="text-xs h-9"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-xs h-9 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value="Faculty Mentor / Professor">Faculty Mentor / Professor</option>
            <option value="Event Organizer">Event Organizer / Hackathon Lead</option>
            <option value="Employer / Team Lead">Employer / Team Lead</option>
            <option value="Peer Contributor">Peer Contributor</option>
          </select>
        </div>

        <Button type="submit" size="sm" className="w-full sm:w-auto gap-1.5 mt-2" disabled={isSending}>
          <Send className="w-3.5 h-3.5" /> Request Verifier Endorsement
        </Button>
      </form>
    </div>
  );
};
