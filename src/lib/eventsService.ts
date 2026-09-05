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
  type: "workshop" | "webinar" | "competition" | "talk" | "social" | "other" | string;
  genre?: "tech" | "leadership" | "workshop" | "policy" | "cultural" | "research" | "general" | string;
  mode: "online" | "offline" | "hybrid" | string;
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
  isHeroSpotlight?: boolean;
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

// Empty array for mock data - directory starts clean
export const SAMPLE_EVENTS: Event[] = [];

// Helper to get events from local storage without any mock data
const getLocalEvents = (): Event[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
  saveLocalEvents([]);
  return [];
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
  
  // If new event is marked as hero spotlight, unmark other local events
  if (eventData.isHeroSpotlight && typeof window !== "undefined") {
    const existing = getLocalEvents();
    const updatedExisting = existing.map(e => ({ ...e, isHeroSpotlight: false }));
    saveLocalEvents(updatedExisting);
  }

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

  // If setting this event as hero spotlight, unmark others locally
  if (eventData.isHeroSpotlight && typeof window !== "undefined") {
    const existing = getLocalEvents();
    const updatedExisting = existing.map(e => ({
      ...e,
      isHeroSpotlight: e.id === id
    }));
    saveLocalEvents(updatedExisting);
  }
  
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
      if (typeof window !== "undefined") {
        const events = getLocalEvents();
        const filteredEvents = events.filter((e) => e.id !== id);
        saveLocalEvents(filteredEvents);
      }
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

