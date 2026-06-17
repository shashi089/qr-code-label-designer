export interface Attendee {
  id: string;
  fullName: string;
  ticketId: string;
  company: string;
  tier: string;
}

export interface Session {
  id: string;
  title: string;
  room: string;
  speaker: string;
  startTime: string;
}

export interface Exhibitor {
  id: string;
  companyName: string;
  boothNumber: string;
  hall: string;
  category: string;
}

export type EntityType = "attendee" | "session" | "exhibitor";
