import type { StickerLayout } from "qrlayout-ui";
import type { Attendee, Exhibitor, Session } from "./types";

const STORAGE_KEY = "event_labels_data";
const ATTENDEE_STORAGE_KEY = "attendee_data";
const SESSION_STORAGE_KEY = "session_data";
const EXHIBITOR_STORAGE_KEY = "exhibitor_data";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : fallback;
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getLabels: (): StickerLayout[] => readJson(STORAGE_KEY, []),

  saveLabels: (labels: StickerLayout[]): void => writeJson(STORAGE_KEY, labels),

  addLabel: (label: StickerLayout): void => {
    const labels = storage.getLabels();
    const index = labels.findIndex((l) => l.id === label.id);
    if (index >= 0) {
      labels[index] = label;
    } else {
      labels.push(label);
    }
    storage.saveLabels(labels);
  },

  deleteLabel: (id: string): void => {
    storage.saveLabels(storage.getLabels().filter((l) => l.id !== id));
  },

  getAttendees: (): Attendee[] => readJson(ATTENDEE_STORAGE_KEY, []),

  saveAttendees: (attendees: Attendee[]): void =>
    writeJson(ATTENDEE_STORAGE_KEY, attendees),

  addAttendee: (attendee: Attendee): void => {
    const attendees = storage.getAttendees();
    const index = attendees.findIndex((a) => a.id === attendee.id);
    if (index >= 0) attendees[index] = attendee;
    else attendees.push(attendee);
    storage.saveAttendees(attendees);
  },

  deleteAttendee: (id: string): void => {
    storage.saveAttendees(storage.getAttendees().filter((a) => a.id !== id));
  },

  getSessions: (): Session[] => readJson(SESSION_STORAGE_KEY, []),

  saveSessions: (sessions: Session[]): void =>
    writeJson(SESSION_STORAGE_KEY, sessions),

  addSession: (session: Session): void => {
    const sessions = storage.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) sessions[index] = session;
    else sessions.push(session);
    storage.saveSessions(sessions);
  },

  deleteSession: (id: string): void => {
    storage.saveSessions(storage.getSessions().filter((s) => s.id !== id));
  },

  getExhibitors: (): Exhibitor[] => readJson(EXHIBITOR_STORAGE_KEY, []),

  saveExhibitors: (exhibitors: Exhibitor[]): void =>
    writeJson(EXHIBITOR_STORAGE_KEY, exhibitors),

  addExhibitor: (exhibitor: Exhibitor): void => {
    const exhibitors = storage.getExhibitors();
    const index = exhibitors.findIndex((e) => e.id === exhibitor.id);
    if (index >= 0) exhibitors[index] = exhibitor;
    else exhibitors.push(exhibitor);
    storage.saveExhibitors(exhibitors);
  },

  deleteExhibitor: (id: string): void => {
    storage.saveExhibitors(
      storage.getExhibitors().filter((e) => e.id !== id),
    );
  },

  initializeDefaults: (): void => {
    if (!canUseStorage()) return;

    if (storage.getAttendees().length === 0) {
      storage.saveAttendees([
        {
          id: "1",
          fullName: "Alex Chen",
          ticketId: "CONF-2026-0042",
          company: "Acme Corp",
          tier: "VIP",
        },
        {
          id: "2",
          fullName: "Jordan Lee",
          ticketId: "CONF-2026-0043",
          company: "Nova Labs",
          tier: "Speaker",
        },
        {
          id: "3",
          fullName: "Sam Rivera",
          ticketId: "CONF-2026-0044",
          company: "OpenStack Co",
          tier: "Standard",
        },
      ]);
    }

    if (storage.getSessions().length === 0) {
      storage.saveSessions([
        {
          id: "s1",
          title: "Opening Keynote",
          room: "Hall A",
          speaker: "Dr. Maya Patel",
          startTime: "09:00",
        },
        {
          id: "s2",
          title: "Serverless at Scale",
          room: "Room 201",
          speaker: "Chris Wong",
          startTime: "11:30",
        },
        {
          id: "s3",
          title: "Workshop: QR in Production",
          room: "Lab 3",
          speaker: "Priya Sharma",
          startTime: "14:00",
        },
      ]);
    }

    if (storage.getExhibitors().length === 0) {
      storage.saveExhibitors([
        {
          id: "e1",
          companyName: "CloudScale Inc",
          boothNumber: "B-14",
          hall: "Hall B",
          category: "Platinum Sponsor",
        },
        {
          id: "e2",
          companyName: "DataForge",
          boothNumber: "A-07",
          hall: "Hall A",
          category: "Gold Sponsor",
        },
        {
          id: "e3",
          companyName: "PrintFlow",
          boothNumber: "C-22",
          hall: "Hall C",
          category: "Exhibitor",
        },
      ]);
    }

    if (storage.getLabels().length === 0) {
      storage.saveLabels([
        {
          id: "default-attendee-layout",
          name: "Conference Attendee Badge",
          targetEntity: "attendee",
          width: 85.6,
          height: 53.98,
          unit: "mm",
          backgroundColor: "#ffffff",
          elements: [
            {
              id: "a1",
              type: "text",
              x: 30,
              y: 8,
              w: 52,
              h: 10,
              content: "{{fullName}}",
              style: { fontSize: 16, fontWeight: "bold" },
            },
            {
              id: "a2",
              type: "text",
              x: 30,
              y: 20,
              w: 52,
              h: 8,
              content: "{{company}}",
              style: { fontSize: 11, color: "#4b5563" },
            },
            {
              id: "a3",
              type: "text",
              x: 30,
              y: 30,
              w: 52,
              h: 6,
              content: "{{tier}} Pass",
              style: { fontSize: 10, fontWeight: "bold", color: "#4f46e5" },
            },
            {
              id: "a4",
              type: "qr",
              x: 5,
              y: 10,
              w: 22,
              h: 22,
              content: "ticket:{{ticketId}}",
            },
          ],
        },
        {
          id: "default-session-layout",
          name: "Session Room Sign",
          targetEntity: "session",
          width: 100,
          height: 70,
          unit: "mm",
          backgroundColor: "#f5f3ff",
          elements: [
            {
              id: "s1",
              type: "text",
              x: 8,
              y: 8,
              w: 84,
              h: 14,
              content: "{{title}}",
              style: { fontSize: 20, fontWeight: "bold" },
            },
            {
              id: "s2",
              type: "text",
              x: 8,
              y: 26,
              w: 50,
              h: 8,
              content: "Room {{room}}",
              style: { fontSize: 14 },
            },
            {
              id: "s3",
              type: "text",
              x: 8,
              y: 38,
              w: 50,
              h: 8,
              content: "{{speaker}} · {{startTime}}",
              style: { fontSize: 11, color: "#6b7280" },
            },
            {
              id: "s4",
              type: "qr",
              x: 68,
              y: 22,
              w: 24,
              h: 24,
              content: "session:{{title}}",
            },
          ],
        },
        {
          id: "default-exhibitor-layout",
          name: "Exhibitor Booth Label",
          targetEntity: "exhibitor",
          width: 80,
          height: 50,
          unit: "mm",
          backgroundColor: "#ffffff",
          elements: [
            {
              id: "e1",
              type: "text",
              x: 8,
              y: 6,
              w: 64,
              h: 8,
              content: "{{category}}",
              style: { fontSize: 9, color: "#7c3aed" },
            },
            {
              id: "e2",
              type: "text",
              x: 8,
              y: 16,
              w: 64,
              h: 12,
              content: "{{companyName}}",
              style: { fontSize: 14, fontWeight: "bold" },
            },
            {
              id: "e3",
              type: "text",
              x: 8,
              y: 32,
              w: 40,
              h: 14,
              content: "Booth {{boothNumber}}",
              style: { fontSize: 22, fontWeight: "bold" },
            },
            {
              id: "e4",
              type: "qr",
              x: 52,
              y: 12,
              w: 22,
              h: 22,
              content: "booth:{{hall}}-{{boothNumber}}",
            },
          ],
        },
      ]);
    }
  },

  clearAll: (): void => {
    if (!canUseStorage()) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ATTENDEE_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(EXHIBITOR_STORAGE_KEY);
  },
};
