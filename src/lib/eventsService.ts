import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";

export interface Event {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImageURL: string;
  imageURLs: string[];
  type: "workshop" | "webinar" | "competition" | "talk" | "social" | "other";
  mode: "online" | "offline" | "hybrid";
  venue: string;
  startDateTime: string; // ISO format string e.g. "2026-08-12T18:00"
  endDateTime: string; // ISO format string
  registrationLink: string;
  registrationDeadline: string; // ISO format string
  speakerNames: string[];
  organizerIds: string[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isFeatured: boolean;
  tags: string[];
  createdBy: string;
  createdAt: string; // ISO format string
  updatedAt: string; // ISO format string
  // Computed fields (not stored, calculated dynamically)
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

// Helper to get events from local storage
const getLocalEvents = (): Event[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    // Start with NO pre-filled mock events as requested
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored);
};

// Helper to save events to local storage
const saveLocalEvents = (events: Event[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  }
};

// 1. Get all events
export const getEvents = async (): Promise<Event[]> => {
  if (isFirebaseConfigured()) {
    try {
      const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
      const events: Event[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Convert timestamp fields back to ISO string if they are Firestore Timestamps
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
      // Sort events by startDateTime descending
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
      // Use setDoc/addDoc
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

  // Fallback to LocalStorage
  const events = getLocalEvents();
  const localEventWithId = {
    ...newEvent,
    id: `local_${Date.now()}`,
  };
  events.push(localEventWithId);
  saveLocalEvents(events);
  return {
    ...localEventWithId,
    timeStatus: computeTimeStatus(localEventWithId.endDateTime)
  };
};

// 4. Update event
export const updateEvent = async (id: string, eventData: Partial<Omit<Event, "id" | "createdAt"> >): Promise<Event> => {
  const nowStr = new Date().toISOString();
  
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
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

  // LocalStorage Update
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
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      console.warn("Firestore delete failed, falling back to LocalStorage:", error);
    }
  }

  // LocalStorage Delete
  const events = getLocalEvents();
  const filteredEvents = events.filter((e) => e.id !== id);
  saveLocalEvents(filteredEvents);
};
