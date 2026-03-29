"use client";

import { useState } from "react";
import { Mail, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "owner" | "manager" | "agent";
  status: "active" | "invited";
}

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-100 text-amber-700",
  manager: "bg-purple-100 text-purple-700",
  agent: "bg-blue-100 text-blue-700",
};

export default function DealerTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: "You", email: "owner@showroom.qa", role: "owner", status: "active" },
    { id: 2, name: "Ahmed Al-Ansari", email: "ahmed@showroom.qa", role: "manager", status: "active" },
    { id: 3, name: "Pending invite", email: "agent@showroom.qa", role: "agent", status: "invited" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "agent">("agent");

  const sendInvite = () => {
    if (!inviteEmail) return;
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "Pending invite",
        email: inviteEmail,
        role: inviteRole,
        status: "invited",
      },
    ]);
    setInviteEmail("");
  };

  const removeMember = (id: number) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Team management</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Invite staff members and control what each person can do in your dealer account.
        </p>
      </div>

      {/* invite form */}
      <Card className="space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-neutral-800">
          <UserPlus className="h-4 w-4" /> Invite a team member
        </h2>
        <div className="flex flex-wrap gap-3">
          <Input
            className="flex-1 min-w-48"
            type="email"
            placeholder="colleague@company.qa"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "manager" | "agent")}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
          </select>
          <Button onClick={sendInvite} disabled={!inviteEmail} className="gap-2">
            <Mail className="h-4 w-4" /> Send invite
          </Button>
        </div>
        <div className="space-y-1 text-xs text-neutral-400">
          <p>• <strong>Agent</strong> — can create and edit listings, upload CSV.</p>
          <p>• <strong>Manager</strong> — all agent permissions plus team and analytics access.</p>
          <p>• <strong>Owner</strong> — full control including billing and dealer profile.</p>
        </div>
      </Card>

      {/* member list */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
          <Users className="inline h-4 w-4 mr-1" /> Current team ({members.length})
        </h2>
        <div className="space-y-2">
          {members.map((m) => (
            <Card key={m.id} className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-semibold text-neutral-600">
                {m.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 truncate">{m.name}</p>
                <p className="text-xs text-neutral-500 truncate">{m.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge className={`${ROLE_COLORS[m.role]} text-xs`}>
                  <Shield className="mr-1 h-3 w-3" /> {m.role}
                </Badge>
                {m.status === "invited" && (
                  <Badge className="bg-neutral-100 text-neutral-400 text-xs">Invited</Badge>
                )}
                {m.role !== "owner" && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
