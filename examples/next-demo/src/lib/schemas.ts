import type { EntitySchema } from "qrlayout-ui";
import type { StickerLayout } from "qrlayout-ui";

export const ENTITY_SCHEMAS: Record<string, EntitySchema> = {
  attendee: {
    label: "Attendee",
    fields: [
      { name: "fullName", label: "Full Name" },
      { name: "ticketId", label: "Ticket ID" },
      { name: "company", label: "Company" },
      { name: "tier", label: "Pass Tier" },
    ],
    sampleData: {
      fullName: "Alex Chen",
      ticketId: "CONF-2026-0042",
      company: "Acme Corp",
      tier: "VIP",
    },
  },
  session: {
    label: "Session",
    fields: [
      { name: "title", label: "Session Title" },
      { name: "room", label: "Room" },
      { name: "speaker", label: "Speaker" },
      { name: "startTime", label: "Start Time" },
    ],
    sampleData: {
      title: "Opening Keynote",
      room: "Hall A",
      speaker: "Dr. Maya Patel",
      startTime: "09:00",
    },
  },
  exhibitor: {
    label: "Exhibitor",
    fields: [
      { name: "companyName", label: "Company Name" },
      { name: "boothNumber", label: "Booth Number" },
      { name: "hall", label: "Hall" },
      { name: "category", label: "Category" },
    ],
    sampleData: {
      companyName: "CloudScale Inc",
      boothNumber: "B-14",
      hall: "Hall B",
      category: "Sponsor",
    },
  },
};

export const DEFAULT_NEW_LAYOUT: Omit<StickerLayout, "id"> = {
  name: "New Event Label",
  targetEntity: "attendee",
  width: 100,
  height: 60,
  unit: "mm",
  backgroundColor: "#ffffff",
  elements: [],
};
