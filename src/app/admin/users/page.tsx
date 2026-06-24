"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users as UsersIcon } from "lucide-react";
import {
  COLORS,
  PageHeader,
  Table,
  TableRow,
  Td,
  Select,
  EmptyState,
} from "../_components/AdminUI";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "#d4ff3f",
  user: "rgba(255,255,255,0.55)",
};

const ROLE_OPTIONS = ["user", "admin"];

export default function AdminUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  async function updateRole(id: string, newRole: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
  }

  if (loading) {
    return <div style={{ color: COLORS.textMid, padding: 24 }}>Loading…</div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Users"
        subtitle={`${users.length} ${users.length === 1 ? "user" : "users"} registered`}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={<UsersIcon style={{ width: 32, height: 32 }} />}
          title="No users yet"
          message="Registered accounts will show up here."
        />
      ) : (
        <Table columns={["Name", "Email", "Joined", "Role"]}>
          {users.map((user) => (
            <TableRow key={user._id}>
              <Td style={{ fontWeight: 500 }}>{user.name}</Td>
              <Td style={{ color: COLORS.textMid }}>{user.email}</Td>
              <Td style={{ color: COLORS.textLow }}>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Td>
              <Td>
                <Select
                  value={user.role}
                  onChange={(v) => updateRole(user._id, v)}
                  options={ROLE_OPTIONS}
                  colorMap={ROLE_COLORS}
                />
              </Td>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
