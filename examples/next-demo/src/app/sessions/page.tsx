"use client";

import { EntityMaster } from "@/components/EntityMaster";
import { storage } from "@/lib/storage";
import type { Session } from "@/lib/types";

export default function SessionsPage() {
  return (
    <EntityMaster<Session>
      entityType="session"
      title="Session Master"
      description="Manage talks and workshops, then print room door signs"
      exportBaseFilename="session-sign"
      columns={[
        { header: "Title", accessorKey: "title" },
        { header: "Room", accessorKey: "room" },
        { header: "Speaker", accessorKey: "speaker" },
        { header: "Start", accessorKey: "startTime" },
      ]}
      formFields={[
        {
          name: "title",
          label: "Session Title",
          required: true,
          placeholder: "e.g. Opening Keynote",
        },
        {
          name: "room",
          label: "Room",
          required: true,
          placeholder: "e.g. Hall A",
        },
        {
          name: "speaker",
          label: "Speaker",
          placeholder: "e.g. Dr. Maya Patel",
        },
        {
          name: "startTime",
          label: "Start Time",
          placeholder: "e.g. 09:00",
        },
      ]}
      getRecords={storage.getSessions}
      addRecord={storage.addSession}
      deleteRecord={storage.deleteSession}
      validate={(formData) => !!(formData.title && formData.room)}
      buildRecord={(formData, editing) => ({
        id: editing?.id ?? crypto.randomUUID(),
        title: formData.title,
        room: formData.room,
        speaker: formData.speaker ?? "",
        startTime: formData.startTime ?? "",
      })}
    />
  );
}
