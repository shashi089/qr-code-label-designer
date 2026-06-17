"use client";

import { EntityMaster } from "@/components/EntityMaster";
import { storage } from "@/lib/storage";
import type { Attendee } from "@/lib/types";

export default function AttendeesPage() {
  return (
    <EntityMaster<Attendee>
      entityType="attendee"
      title="Attendee Master"
      description="Manage conference attendees and print check-in badges"
      exportBaseFilename="attendee-badge"
      columns={[
        { header: "Ticket ID", accessorKey: "ticketId" },
        { header: "Full Name", accessorKey: "fullName" },
        { header: "Company", accessorKey: "company" },
        { header: "Pass Tier", accessorKey: "tier" },
      ]}
      formFields={[
        {
          name: "fullName",
          label: "Full Name",
          required: true,
          placeholder: "e.g. Alex Chen",
        },
        {
          name: "ticketId",
          label: "Ticket ID",
          required: true,
          placeholder: "e.g. CONF-2026-0042",
        },
        {
          name: "company",
          label: "Company",
          placeholder: "e.g. Acme Corp",
        },
        {
          name: "tier",
          label: "Pass Tier",
          placeholder: "VIP, Speaker, Standard",
        },
      ]}
      getRecords={storage.getAttendees}
      addRecord={storage.addAttendee}
      deleteRecord={storage.deleteAttendee}
      validate={(formData) => !!(formData.fullName && formData.ticketId)}
      buildRecord={(formData, editing) => ({
        id: editing?.id ?? crypto.randomUUID(),
        fullName: formData.fullName,
        ticketId: formData.ticketId,
        company: formData.company ?? "",
        tier: formData.tier ?? "Standard",
      })}
    />
  );
}
