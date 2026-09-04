import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  orderBy,
  increment,
} from "firebase/firestore";

export interface SpeakerDetail {
  name: string;
  role?: string;
  organization?: string;
  imageURL?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface OrganizerDetail {
  name: string;
  role?: string;
  contact?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  rollNo: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  notes?: string;
  registeredAt: string;
}

export interface Event {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImageURL: string;
  imageURLs: string[];
  type: "workshop" | "webinar" | "competition" | "talk" | "social" | "other";
  genre?: "tech" | "leadership" | "workshop" | "policy" | "cultural" | "research" | "general";
  mode: "online" | "offline" | "hybrid";
  venue: string;
  locationMapURL?: string;
  fee?: string;
  eligibility?: string;
  startDateTime: string; // ISO format string e.g. "2026-08-12T18:00"
  endDateTime: string; // ISO format string
  registrationLink: string;
  registrationDeadline: string; // ISO format string
  registrationType?: "external" | "internal" | "both";
  registrationsCount?: number;
  speakerNames: string[];
  speakerDetails?: SpeakerDetail[];
  schedule?: ScheduleItem[];
  organizerIds: string[];
  organizersDetails?: OrganizerDetail[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isFeatured: boolean;
  isAnnouncement?: boolean;
  announcementText?: string;
  tags: string[];
  createdBy: string;
  createdAt: string; // ISO format string
  updatedAt: string; // ISO format string
  // Computed fields
  timeStatus?: "active" | "past";
}

const EVENTS_COLLECTION = "events";
const LOCAL_STORAGE_KEY = "think_india_events";

// Helper to check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "undefined"
  );
};

// Helper to compute timeStatus (active/past)
export const computeTimeStatus = (endDateTimeStr: string): "active" | "past" => {
  if (!endDateTimeStr) return "active";
  const endDate = new Date(endDateTimeStr);
  const now = new Date();
  return endDate < now ? "past" : "active";
};

// Initial Seed Sample Events for vibrant showcase
export const SAMPLE_EVENTS: Event[] = [
  {
    id: "sample-1",
    title: "Vichardhara 2026: National Youth Leadership Conclave",
    slug: "vichardhara-2026-youth-conclave",
    shortDescription: "A flagship national summit featuring policy experts, youth icons, and interactive debates on nation building.",
    description: "Think India SVNIT presents 'Vichardhara 2026', a premier national conclave aimed at fostering youth participation in nation-building, social innovation, and public policy.\n\nJoin us for inspiring keynote addresses, panel discussions with distinguished bureaucrats and academicians, and interactive workshop sessions on leadership and social transformation.",
    coverImageURL: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    imageURLs: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&auto=format&fit=crop"
    ],
    type: "talk",
    mode: "hybrid",
    venue: "Main Auditorium & MS Teams, SVNIT Surat",
    locationMapURL: "https://maps.google.com/?q=SVNIT+Surat",
    fee: "Free Entry",
    eligibility: "Open to all College Students & Youth Researchers",
    startDateTime: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    registrationLink: "https://forms.gle/thinkindia-vichardhara",
    registrationDeadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    speakerNames: ["Dr. Rajesh Verma", "Ananya Sharma", "Col. Vikram Rathore"],
    speakerDetails: [
      { name: "Dr. Rajesh Verma", role: "Policy Advisor & Senior Fellow", organization: "Centre for National Policy", imageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" },
      { name: "Ananya Sharma", role: "Founder & Social Entrepreneur", organization: "Yuva Vikas Trust", imageURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" },
      { name: "Col. Vikram Rathore", role: "Strategic Analyst & Veteran", organization: "Defense Studies Forum", imageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" }
    ],
    schedule: [
      { time: "09:30 AM", title: "Inauguration & Lamp Lighting", description: "Opening ceremony led by Director SVNIT & Guest of Honor." },
      { time: "10:30 AM", title: "Keynote: Vision for India@2047", description: "Dr. Rajesh Verma delivers the opening vision address." },
      { time: "01:30 PM", title: "Panel Discussion: Tech for Social Impact", description: "Interactive q&a with student delegates." },
      { time: "04:30 PM", title: "Valedictory & Certificate Distribution", description: "Closing awards for outstanding student contributors." }
    ],
    organizerIds: ["Smit Patel", "Aesha Shah"],
    organizersDetails: [
      { name: "Smit Patel", role: "Event Lead", contact: "+91 98765 43210" },
      { name: "Aesha Shah", role: "Convenor", contact: "events@thinkindiasvnit.org" }
    ],
    status: "upcoming",
    isFeatured: true,
    tags: ["Leadership", "Policy", "SVNIT", "Youth", "National"],
    createdBy: "admin@thinkindiasvnit.org",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "sample-2",
    title: "AI & Vernacular Language Hackathon 2026",
    slug: "ai-vernacular-language-hackathon-2026",
    shortDescription: "36-hour hackathon focused on building AI models and applications for Indian regional languages.",
    description: "Build cutting-edge solutions leveraging Large Language Models (LLMs), speech recognition, and translation APIs for Indian languages.\n\nGreat prizes, mentorship from leading AI engineers, and direct opportunity to showcase solutions to startup incubators.",
    coverImageURL: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
    imageURLs: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop"
    ],
    type: "competition",
    mode: "offline",
    venue: "Computer Engineering Dept Hall, SVNIT",
    locationMapURL: "https://maps.google.com/?q=SVNIT+Surat",
    fee: "Free for SVNIT Students",
    eligibility: "Teams of 2-4 Engineering Students",
    startDateTime: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    registrationLink: "https://forms.gle/ai-vernacular-hackathon",
    registrationDeadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    speakerNames: ["Priya Nair", "Devanshu Mehta"],
    speakerDetails: [
      { name: "Priya Nair", role: "AI Research Scientist", organization: "Bhashini Project", imageURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop" },
      { name: "Devanshu Mehta", role: "Lead Architect", organization: "OpenNyAI Initiative", imageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" }
    ],
    schedule: [
      { time: "09:00 AM (Day 1)", title: "Hackathon Track Announcement", description: "Problem statements released." },
      { time: "02:00 PM (Day 1)", title: "Mentorship Checkpoint 1", description: "Architecture review by industry mentors." },
      { time: "05:00 PM (Day 2)", title: "Final Pitch & Demos", description: "Top 10 teams present to jury." }
    ],
    organizerIds: ["Divyansh Kumar", "Tech Team"],
    organizersDetails: [
      { name: "Divyansh Kumar", role: "Technical Head", contact: "tech@thinkindiasvnit.org" }
    ],
    status: "upcoming",
    isFeatured: true,
    tags: ["Hackathon", "AI", "NLP", "SVNIT", "Coding"],
    createdBy: "admin@thinkindiasvnit.org",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "sample-3",
    title: "IPR & Innovation Workshop: Patenting Tech Ideas",
    slug: "ipr-innovation-workshop-patenting",
    shortDescription: "Interactive webinar on Intellectual Property Rights, filing patents for student innovations, and copyright laws.",
    description: "Learn how to safeguard your technical innovations and research projects through patent filings and copyright protection. Expert IP attorneys will walk through step-by-step patent drafting for Indian and international jurisdictions.",
    coverImageURL: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
    imageURLs: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop"
    ],
    type: "workshop",
    mode: "online",
    venue: "Google Meet / YouTube Live",
    fee: "Free",
    eligibility: "Researchers, Innovators, Faculty & Students",
    startDateTime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    endDateTime: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
    registrationLink: "https://forms.gle/ipr-workshop-archive",
    registrationDeadline: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    speakerNames: ["Adv. Suresh K. Iyer"],
    speakerDetails: [
      { name: "Adv. Suresh K. Iyer", role: "Senior Patent Attorney", organization: "Indian IP Association", imageURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" }
    ],
    schedule: [
      { time: "03:00 PM", title: "Basics of IPR & Patents", description: "Introduction to patentable subject matter." },
      { time: "04:30 PM", title: "Prior Art Search & Drafting Demo", description: "Live demonstration of patent database lookup." }
    ],
    organizerIds: ["Research Cell"],
    organizersDetails: [
      { name: "Research Cell", role: "Coordinator", contact: "research@thinkindiasvnit.org" }
    ],
    status: "completed",
    isFeatured: false,
    tags: ["IPR", "Patent", "Workshop", "Research", "Legal"],
    createdBy: "admin@thinkindiasvnit.org",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to get events from local storage
const getLocalEvents = (): Event[] => {
  if (typeof window === "undefined") return SAMPLE_EVENTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
    return SAMPLE_EVENTS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
      return SAMPLE_EVENTS;
    }
    return parsed;
  } catch {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
    return SAMPLE_EVENTS;
  }
};

// Helper to save events to local storage
const saveLocalEvents = (events: Event[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  }
};

// Explicitly seed sample data
export const seedSampleEvents = (): Event[] => {
  saveLocalEvents(SAMPLE_EVENTS);
  return SAMPLE_EVENTS;
};

// 1. Get all events
export const getEvents = async (): Promise<Event[]> => {
  if (isFirebaseConfigured()) {
    try {
      const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
      const events: Event[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const startDateTime = data.startDateTime instanceof Timestamp ? data.startDateTime.toDate().toISOString() : data.startDateTime;
        const endDateTime = data.endDateTime instanceof Timestamp ? data.endDateTime.toDate().toISOString() : data.endDateTime;
        const registrationDeadline = data.registrationDeadline instanceof Timestamp ? data.registrationDeadline.toDate().toISOString() : data.registrationDeadline;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

        events.push({
          ...data,
          id: docSnap.id,
          startDateTime,
          endDateTime,
          registrationDeadline,
          createdAt,
          updatedAt,
          timeStatus: computeTimeStatus(endDateTime)
        } as Event);
      });
      if (events.length === 0) {
        return getLocalEvents().map(e => ({
          ...e,
          timeStatus: computeTimeStatus(e.endDateTime)
        }));
      }
      return events.sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to LocalStorage:", error);
      return getLocalEvents().map(e => ({
        ...e,
        timeStatus: computeTimeStatus(e.endDateTime)
      }));
    }
  } else {
    return getLocalEvents().map(e => ({
      ...e,
      timeStatus: computeTimeStatus(e.endDateTime)
    }));
  }
};

// 2. Get single event by slug
export const getEventBySlug = async (slug: string): Promise<Event | null> => {
  const events = await getEvents();
  const event = events.find((e) => e.slug === slug);
  return event || null;
};

// 3. Create event
export const createEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> => {
  const nowStr = new Date().toISOString();
  const newEvent: Event = {
    ...eventData,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEvent);
      return {
        ...newEvent,
        id: docRef.id,
        timeStatus: computeTimeStatus(newEvent.endDateTime)
      };
    } catch (error) {
      console.warn("Firestore write failed, falling back to LocalStorage:", error);
    }
  }

  const events = getLocalEvents();
  const localEventWithId = {
    ...newEvent,
    id: `local_${Date.now()}`,
  };
  events.unshift(localEventWithId);
  saveLocalEvents(events);
  return {
    ...localEventWithId,
    timeStatus: computeTimeStatus(localEventWithId.endDateTime)
  };
};

// 4. Update event
export const updateEvent = async (id: string, eventData: Partial<Omit<Event, "id" | "createdAt">>): Promise<Event> => {
  const nowStr = new Date().toISOString();
  
  if (isFirebaseConfigured() && !id.startsWith("local_") && !id.startsWith("sample-")) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const updateData = {
        ...eventData,
        updatedAt: nowStr
      };
      await updateDoc(docRef, updateData);
      
      const updatedSnap = await getDoc(docRef);
      const data = updatedSnap.data()!;
      
      const startDateTime = data.startDateTime instanceof Timestamp ? data.startDateTime.toDate().toISOString() : data.startDateTime;
      const endDateTime = data.endDateTime instanceof Timestamp ? data.endDateTime.toDate().toISOString() : data.endDateTime;
      const registrationDeadline = data.registrationDeadline instanceof Timestamp ? data.registrationDeadline.toDate().toISOString() : data.registrationDeadline;
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

      return {
        ...data,
        id,
        startDateTime,
        endDateTime,
        registrationDeadline,
        createdAt,
        updatedAt,
        timeStatus: computeTimeStatus(endDateTime)
      } as Event;
    } catch (error) {
      console.warn("Firestore update failed, falling back to LocalStorage:", error);
    }
  }

  const events = getLocalEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error(`Event with id ${id} not found.`);
  }

  const updatedLocalEvent = {
    ...events[index],
    ...eventData,
    updatedAt: nowStr
  };
  events[index] = updatedLocalEvent;
  saveLocalEvents(events);
  return {
    ...updatedLocalEvent,
    timeStatus: computeTimeStatus(updatedLocalEvent.endDateTime)
  };
};

// 5. Delete event
export const deleteEvent = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && !id.startsWith("local_") && !id.startsWith("sample-")) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      console.warn("Firestore delete failed, falling back to LocalStorage:", error);
    }
  }

  const events = getLocalEvents();
  const filteredEvents = events.filter((e) => e.id !== id);
  saveLocalEvents(filteredEvents);
};

// ─── Internal Registrations ───────────────────────────────────────────────────

const REGISTRATIONS_COLLECTION = "event_registrations";
const REGISTRATIONS_STORAGE_KEY = "think_india_event_registrations";

/**
 * Get registrations for a specific event (or all registrations if no eventId).
 * Primary: Firestore `event_registrations` collection.
 * Fallback: localStorage.
 */
export const getEventRegistrations = async (eventId?: string): Promise<EventRegistration[]> => {
  if (isFirebaseConfigured()) {
    try {
      let q;
      if (eventId) {
        // Try to match both eventId field and the slug-based eventId
        q = query(
          collection(db, REGISTRATIONS_COLLECTION),
          where("eventId", "==", eventId),
          orderBy("registeredAt", "desc")
        );
      } else {
        q = query(
          collection(db, REGISTRATIONS_COLLECTION),
          orderBy("registeredAt", "desc")
        );
      }

      const snap = await getDocs(q);
      const registrations: EventRegistration[] = snap.docs.map((d) => {
        const data = d.data();
        const registeredAt =
          data.registeredAt instanceof Timestamp
            ? data.registeredAt.toDate().toISOString()
            : data.registeredAt;
        return { ...data, id: d.id, registeredAt } as EventRegistration;
      });

      // Mirror to localStorage so fallback reads stay fresh
      if (typeof window !== "undefined") {
        const all: EventRegistration[] = JSON.parse(
          localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || "[]"
        );
        // Merge: keep anything not in this Firestore result
        const firestoreIds = new Set(registrations.map((r) => r.id));
        const localOnly = all.filter((r) => !firestoreIds.has(r.id));
        localStorage.setItem(
          REGISTRATIONS_STORAGE_KEY,
          JSON.stringify([...registrations, ...localOnly])
        );
      }

      return registrations;
    } catch (error) {
      console.warn("Firestore registrations fetch failed, falling back to localStorage:", error);
    }
  }

  // LocalStorage fallback
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
  const all: EventRegistration[] = stored ? JSON.parse(stored) : [];
  if (eventId) return all.filter((r) => r.eventId === eventId);
  return all;
};

/**
 * Submit an event registration.
 * Primary: Firestore `event_registrations` collection.
 * Fallback: localStorage.
 * Also increments the event's `registrationsCount` in Firestore.
 */
export const submitEventRegistration = async (
  regData: Omit<EventRegistration, "id" | "registeredAt">
): Promise<EventRegistration> => {
  const registeredAt = new Date().toISOString();

  if (isFirebaseConfigured()) {
    try {
      const payload = { ...regData, registeredAt };
      const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), payload);
      const newReg: EventRegistration = { ...payload, id: docRef.id };

      // Increment registrationsCount on the parent event in Firestore
      try {
        if (
          regData.eventId &&
          !regData.eventId.startsWith("local_") &&
          !regData.eventId.startsWith("sample-")
        ) {
          const eventRef = doc(db, "events", regData.eventId);
          await updateDoc(eventRef, { registrationsCount: increment(1) });
        }
      } catch (e) {
        console.warn("Failed to increment registrationsCount in Firestore:", e);
      }

      // Mirror to localStorage
      if (typeof window !== "undefined") {
        const all: EventRegistration[] = JSON.parse(
          localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || "[]"
        );
        all.unshift(newReg);
        localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(all));
      }

      return newReg;
    } catch (error) {
      console.warn("Firestore registration write failed, falling back to localStorage:", error);
    }
  }

  // LocalStorage fallback
  const newReg: EventRegistration = {
    ...regData,
    id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    registeredAt,
  };

  if (typeof window !== "undefined") {
    const all: EventRegistration[] = JSON.parse(
      localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || "[]"
    );
    all.unshift(newReg);
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(all));

    // Increment local event count
    try {
      const events = getLocalEvents();
      const idx = events.findIndex(
        (e) => e.id === regData.eventId || e.slug === regData.eventId
      );
      if (idx !== -1) {
        events[idx].registrationsCount = (events[idx].registrationsCount || 0) + 1;
        saveLocalEvents(events);
      }
    } catch (e) {
      console.warn("Failed to update event registration count in localStorage:", e);
    }
  }

  return newReg;
};



