"use client";

import { useRouter } from "next/navigation";

export default function InviteMembersButton({ orgId }: { orgId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/${orgId}/members`)}
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition border border-white/10"
    >
      Invite Members
    </button>
  );
}
