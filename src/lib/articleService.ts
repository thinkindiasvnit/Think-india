import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

const ARTICLES_COLLECTION = "articles";
const PREVIEW_KEY = "ti_article_preview";

export type ArticleStatus = "review" | "published" | "rejected";

export const ARTICLE_CATEGORIES = ["technology", "culture", "education", "opinion", "news", "other"];
export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology", culture: "Culture", education: "Education", opinion: "Opinion", news: "News", other: "Other",
};

export interface Article {
  id?: string;
  title: string;
  summary: string;
  content: string;
  coverImageURL: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  status: ArticleStatus;
  createdAt: string;
  reviewedAt: string | null;
  editionId?: string;
}

export interface NewspaperPage {
  id: number;
  label: string;
  headline: string;
  deck: string;
  dropCapLetter: string;
  dropCapRest: string;
  paragraphs: string[];
  pullQuote: { text: string; attribution: string };
  photo: string;
  photoAlt: string;
  imageCaption: string;
  columns: { title: string; body: string }[];
  authorName?: string;
}

export interface NewspaperEdition {
  id: string;
  title: string;
  editionName: string;
  volume: string;
  date: string;
  price: string;
  tagline: string;
  description: string;
  coverStoryHeadline: string;
  coverStoryDeck: string;
  coverPhoto: string;
  status: "published" | "draft";
  createdAt: string;
  pages: NewspaperPage[];
}

export const DEFAULT_EDITIONS: NewspaperEdition[] = [
  {
    id: "edition-1",
    title: "Small Steps, Big Impact",
    editionName: "CAMPUS INAUGURAL EDITION",
    volume: "VOL. 1 · ISSUE 1",
    date: "18 AUG 2026",
    price: "FREE",
    tagline: "IDEAS THAT INSPIRE. ACTION THAT TRANSFORMS.",
    description: "The inaugural launch issue of IKIGAI by Think India SVNIT. Featuring the philosophy of purposeful student action, policy dialogue, and semester highlights.",
    coverStoryHeadline: "Small Steps, Big Impact:\nBuilding a Better Tomorrow",
    coverStoryDeck: "Think India SVNIT drives change through ideas, initiatives, and collective action.",
    coverPhoto: "https://images.unsplash.com/photo-1708578200684-3aa944b73237?w=800&h=600&fit=crop&auto=format",
    status: "published",
    createdAt: "2026-08-18T00:00:00.000Z",
    pages: [
      {
        id: 1,
        label: "COVER STORY",
        headline: "Small Steps, Big Impact:\nBuilding a Better Tomorrow",
        deck: "Think India SVNIT drives change through ideas, initiatives, and collective action.",
        dropCapLetter: "I",
        dropCapRest:
          "n a world brimming with challenges, change begins with a single thought and grows through collective purpose. Think India SVNIT continues to empower young minds to turn that thought into action.",
        paragraphs: [
          "From campus clean-ups to education initiatives, from awareness drives to policy discussions, our mission remains clear — to build a society that is informed, inclusive, and inspired.",
          "Our recent events and campaigns have seen overwhelming participation from students, faculty, and community members. Each step, no matter how small, brings us closer to a future where empathy drives progress and every individual feels responsible for the world we share.",
          "This is not just a journey of service, but a journey of self-discovery — finding our Ikigai in creating impact that lasts.",
        ],
        pullQuote: { text: "Be the change you wish to see in the world.", attribution: "– Mahatma Gandhi" },
        photo: "https://images.unsplash.com/photo-1708578200684-3aa944b73237?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Students gathered for an outdoor campus discussion",
        imageCaption: "Members of Think India SVNIT during a discussion session at the campus amphitheatre.",
        columns: [
          { title: "INITIATIVES THAT MATTER", body: "Our ongoing projects focus on quality education, environmental sustainability, rural development, and youth engagement. Each initiative is designed to create measurable impact." },
          { title: "THE POWER OF TOGETHER", body: "We believe that meaningful change happens when individuals come together with a shared vision. Our volunteers are the backbone of every program we run." },
          { title: "LOOKING AHEAD", body: "With more ideas in the pipeline and a growing community of changemakers, we are excited for the journey ahead." },
        ],
      },
      {
        id: 2,
        label: "PHILOSOPHY",
        headline: "Ikigai: Discovering the\nReason to Rise Each Morning",
        deck: "The ancient Japanese concept guides our mission — find where passion, skill, purpose, and need converge.",
        dropCapLetter: "T",
        dropCapRest:
          "he word Ikigai (生き甲斐) comes from the Japanese tradition — iki meaning 'life' and kai meaning 'effect, worth, benefit.' Together they describe the feeling that your existence has enduring value.",
        paragraphs: [
          "At Think India SVNIT, we have adopted this philosophy as the cornerstone of our identity. We believe that every student has within them a spark — a unique intersection of passion, skill, purpose, and need — that when ignited, can illuminate an entire community.",
          "Ikigai is not found in isolation. It emerges at the crossroads of four questions: What do you love? What are you good at? What does the world need? And what can you be supported for? When these four circles converge, you find your reason for being.",
          "For our members, this manifests in different ways: teaching underprivileged children, drafting policy briefs, or simply showing up consistently for others.",
        ],
        pullQuote: { text: "The purpose of life is a life of purpose.", attribution: "– Robert Byrne" },
        photo: "https://images.unsplash.com/photo-1509029032154-54ba8b3216d4?w=800&h=600&fit=crop&auto=format",
        photoAlt: "A young person reflecting by a window",
        imageCaption: "Reflection and purpose — the two pillars of finding your Ikigai.",
        columns: [
          { title: "WHAT IS YOUR IKIGAI?", body: "Take a moment to reflect: What makes you leap out of bed in the morning? What is the one thing you would do even if you were never paid?" },
          { title: "THE FOUR CIRCLES", body: "Passion, Mission, Vocation, and Profession. Your Ikigai lives right at the convergence of all four." },
          { title: "JOIN THE JOURNEY", body: "Whether you are a first-year or a final-year, Think India SVNIT welcomes you to our open discussion sessions." },
        ],
      },
      {
        id: 3,
        label: "OPINION",
        headline: "Youth, Policy & the Responsibility\nWe Cannot Escape",
        deck: "In a democracy, silence is never neutral. The youth of India must engage — loudly, thoughtfully, with conviction.",
        dropCapLetter: "T",
        dropCapRest:
          "here is a particular brand of cynicism that afflicts educated youth in India — a belief that policy is someone else's business, that politics is dirty, and that idealism is naïve. Think India SVNIT was founded precisely to challenge this belief.",
        paragraphs: [
          "The founding story of Think India is not one of grand politics, but of students who realised that their silence was itself a political act. By choosing not to engage, they were choosing the status quo.",
          "At SVNIT, we are surrounded by some of the brightest minds in the country — engineers, scientists, technologists who will shape industry, policy, and society. What we choose to care about matters enormously.",
          "The challenges India faces — from climate change to digital inequality — require technical rigour and civic empathy.",
        ],
        pullQuote: { text: "The youth of a nation are the trustees of posterity.", attribution: "– Benjamin Disraeli" },
        photo: "https://images.unsplash.com/photo-1775338736191-36a6817890cc?w=800&h=600&fit=crop&auto=format",
        photoAlt: "A speaker addressing a student conclave",
        imageCaption: "A student addresses the Policy Conclave at Think India SVNIT's inaugural inter-college forum.",
        columns: [
          { title: "OUR DEBATES", body: "From energy policy to digital governance, our weekly debates tackle real policy questions with rigour and evidence." },
          { title: "RESEARCH & WRITING", body: "We publish policy briefs, opinion pieces, and research notes authored by our student members." },
          { title: "BE THE AUTHOR", body: "Have an opinion or policy idea? Submit your article for our next edition of IKIGAI." },
        ],
      },
      {
        id: 4,
        label: "COMMUNITY",
        headline: "Events, Voices & the Road Ahead:\nA Season in Review",
        deck: "From orientation drives to flagship debates — a look at what we built together this semester.",
        dropCapLetter: "T",
        dropCapRest:
          "his semester at Think India SVNIT has been one of our most active yet. We welcomed over 80 new members in our orientation drive, conducted three major awareness campaigns, and hosted our first inter-college policy conclave.",
        paragraphs: [
          "The Policy Conclave saw participation from seven institutions across Gujarat, with students presenting research on topics from electric mobility adoption to digital privacy laws.",
          "Our campus clean-up initiative — co-organised with the NSS unit at SVNIT — saw 200 volunteers over two weekends, collecting over 400 kg of waste and sparking vital discussions on sustainability.",
          "The semester closed with our flagship event: The Ikigai Talks — a speaker series where alumni and community leaders shared their journeys of purpose.",
        ],
        pullQuote: { text: "Alone we can do so little; together we can do so much.", attribution: "– Helen Keller" },
        photo: "https://images.unsplash.com/photo-1758599668178-d9716bbda9d5?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Volunteers gathering after a community drive",
        imageCaption: "Think India SVNIT volunteers during the campus and neighbourhood clean-up campaign.",
        columns: [
          { title: "POLICY HACKATHON", body: "Our upcoming 24-hour Policy Hackathon arrives this October. Teams of 4 develop civic solutions." },
          { title: "WORKSHOP SERIES", body: "A 6-week workshop series on public speaking and policy drafting starts next month." },
          { title: "CONNECT WITH US", body: "Follow @thinkindia_svnit for live announcements, archives, and past editions of IKIGAI." },
        ],
      },
    ],
  },
  {
    id: "edition-2",
    title: "Technology & Sustainable Bharat",
    editionName: "TECH & INNOVATION EDITION",
    volume: "VOL. 1 · ISSUE 2",
    date: "15 SEP 2026",
    price: "FREE",
    tagline: "TECHNOLOGY FOR SOCIETY. SCIENCE FOR SUSTAINABILITY.",
    description: "Exploring how engineering and technological innovation at SVNIT are meeting grassroots societal challenges across Gujarat and India.",
    coverStoryHeadline: "Engineering Bharat's Future:\nInnovation from Labs to Village",
    coverStoryDeck: "How student engineers and researchers at SVNIT are bridging emerging tech with community impact.",
    coverPhoto: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&auto=format",
    status: "published",
    createdAt: "2026-09-15T00:00:00.000Z",
    pages: [
      {
        id: 1,
        label: "COVER STORY",
        headline: "Engineering Bharat's Future:\nInnovation from Labs to Village",
        deck: "How student engineers and researchers at SVNIT are bridging emerging tech with community impact.",
        dropCapLetter: "W",
        dropCapRest:
          "hen technology serves human dignity, innovation finds its highest calling. In laboratories and workshops across SVNIT, students are moving beyond textbook equations to solve real problems facing local communities.",
        paragraphs: [
          "From low-cost agricultural sensors built by electrical engineering teams to indigenous water purification prototypes developed in chemical laboratories, the focus is squarely on affordable, scalable solutions.",
          "This edition highlights student-led patents, open-source hardware projects, and the philosophy of 'Technology as Seva' — the conviction that high-tech knowledge carries a social responsibility to empower every citizen.",
          "Our tech incubation wing has partnered with rural self-help groups to deploy digital inventory systems, proving that cutting-edge technology belongs just as much in agrarian centers as in metropolises.",
        ],
        pullQuote: { text: "Science without conscience is the death of the soul.", attribution: "– François Rabelais" },
        photo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Engineering students testing robotics and sensors in a laboratory",
        imageCaption: "SVNIT robotics and hardware cohort calibrating autonomous agricultural sensor kits.",
        columns: [
          { title: "INDIGENOUS HARDWARE", body: "Focusing on localized supply chains and repairable tech designs tailored for Indian rural conditions." },
          { title: "DIGITAL INCLUSION", body: "Designing vernacular interfaces and audio-first digital literacy tools for local artisans." },
          { title: "INCUBATION DESK", body: "Mentorship and seed-grants for student projects addressing water, energy, and civic logistics." },
        ],
      },
      {
        id: 2,
        label: "RESEARCH SPOTLIGHT",
        headline: "Green Mobility & Clean Grids:\nThe Surat Energy Transition",
        deck: "SVNIT research teams publish breakthroughs in sodium-ion battery chemistries and localized micro-grids.",
        dropCapLetter: "A",
        dropCapRest:
          "s industrial Surat accelerates its transition to clean power, researchers at the Electrical and Mechanical departments are pioneering decentralized battery management systems tailored for tropical climates.",
        paragraphs: [
          "Commercial lithium packs often degrade rapidly under extreme summer heat. The student-faculty collaborative research at SVNIT has demonstrated an intelligent thermal throttling algorithm that increases cycle life by 34%.",
          "Pilot tests conducted across campus transit shuttles have gathered real-time telemetry, demonstrating that smart localized power distribution can cut institutional energy costs significantly.",
          "The findings have been submitted to national energy policy forums, highlighting the vital role technical campuses play in India's Net Zero roadmaps.",
        ],
        pullQuote: { text: "Sustainable development is the pathway to the future we want for all.", attribution: "– Gro Harlem Brundtland" },
        photo: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Solar panels and clean energy installation",
        imageCaption: "Rooftop solar and microgrid telemetry station at SVNIT research block.",
        columns: [
          { title: "BATTERY CELL LAB", body: "Research into sodium-ion alternatives to mitigate critical mineral dependencies." },
          { title: "CAMPUS GRID", body: "Real-time energy tracking reducing peak load consumption across student hostels." },
          { title: "INDUSTRY TIE-UPS", body: "Collaborative testing partnerships with local Gujarat renewable equipment manufacturers." },
        ],
      },
      {
        id: 3,
        label: "OP-ED",
        headline: "Digital Sovereignty:\nWhy Open Protocols Matter for India",
        deck: "Open source protocols like ONDC and UPI prove that public digital infrastructure beats closed corporate monopolies.",
        dropCapLetter: "T",
        dropCapRest:
          "he architecture of the internet was always meant to be open and decentralized. Yet the last decade witnessed the rise of walled digital gardens that extracted disproportionate rents from consumers and small businesses.",
        paragraphs: [
          "India's counter-strategy — building Digital Public Goods — is being studied across the globe. By separating the network layer from the application layer, UPI and ONDC have leveled the economic playing field.",
          "As software engineers, our job is not merely to build proprietary apps, but to contribute to open standards that defend user privacy and national digital self-reliance.",
          "Think India SVNIT's open-source guild is hosting weekly sprint sessions to build contributors for public open-source governance tools.",
        ],
        pullQuote: { text: "Open protocols belong to everyone, ensuring fair competition and shared prosperity.", attribution: "– Tech Editorial Board" },
        photo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Digital code and network matrix visual",
        imageCaption: "Network visualization of decentralized ledger and payment routing protocols.",
        columns: [
          { title: "PUBLIC GOODS", body: "Why digital rails should be treated like public utilities: roads, ports, and electricity." },
          { title: "STUDENT SPRINTS", body: "Join the weekly Saturday hack-sessions on open data standards and privacy preservation." },
          { title: "POLICY BRIEFS", body: "Upcoming submission to the Ministry of Electronics on vernacular AI datasets." },
        ],
      },
    ],
  },
  {
    id: "edition-3",
    title: "Youth, Leadership & National Policy",
    editionName: "CONCLAVE SPECIAL EDITION",
    volume: "VOL. 2 · ISSUE 1",
    date: "20 OCT 2026",
    price: "FREE",
    tagline: "CITIZENSHIP, DIALOGUE, AND NATION BUILDING.",
    description: "Special edition recording the proceedings of the Gujarat Youth Policy Conclave, featuring keynote addresses, student white papers, and constitutional discussions.",
    coverStoryHeadline: "From Campus to Parliament:\nThe Rising Voice of Youth in Policy",
    coverStoryDeck: "Over 300 student delegates converge at SVNIT to debate India's decadal governance and policy framework.",
    coverPhoto: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=600&fit=crop&auto=format",
    status: "published",
    createdAt: "2026-10-20T00:00:00.000Z",
    pages: [
      {
        id: 1,
        label: "COVER STORY",
        headline: "From Campus to Parliament:\nThe Rising Voice of Youth in Policy",
        deck: "Over 300 student delegates converge at SVNIT to debate India's decadal governance framework.",
        dropCapLetter: "D",
        dropCapRest:
          "emocracy thrives when young citizens move from spectatorship to structured participation. The 2026 Gujarat Inter-College Policy Conclave at SVNIT marked a decisive turning point in youth engagement across the state.",
        paragraphs: [
          "Delegates representing 14 universities spent 48 intensive hours drafting policy resolutions across three tracks: Urban Water Security, Higher Education Reforms, and Youth Entrepreneurship.",
          "Rather than rhetorical debates, every committee was tasked with producing an actionable policy brief with quantitative budgeting and constitutional review.",
          "Distinguished guest speakers from the judiciary, civil service, and public think-tanks commended the exceptional standard of evidence and civil discourse presented by student lawmakers.",
        ],
        pullQuote: { text: "True leadership is not about wielding power, but about taking responsibility.", attribution: "– Conclave Chair" },
        photo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Conference hall filled with delegates and policy attendees",
        imageCaption: "Plenary session during the inaugural address of the Gujarat Youth Policy Conclave at SVNIT.",
        columns: [
          { title: "COMMITTEE ON REFORMS", body: "Drafting recommendations on inter-disciplinary research credits and industry apprenticeship credits." },
          { title: "URBAN INFRASTRUCTURE", body: "Focusing on Surat's sponge city infrastructure and flood management systems." },
          { title: "WHITE PAPERS", body: "Compendium of 12 student policy papers published and transmitted to state ministries." },
        ],
      },
      {
        id: 2,
        label: "CONSTITUTIONAL TALKS",
        headline: "Duties Before Rights:\nRediscovering Article 51A",
        deck: "A scholarly reflection on how Fundamental Duties anchor civic responsibility in the modern republic.",
        dropCapLetter: "T",
        dropCapRest:
          "he Indian Constitution is not merely a legal covenant between the state and its citizens; it is a moral compass for collective national progress. Article 51A reminds us that freedom without duty leads to decay.",
        paragraphs: [
          "In an era where rights are vigorously asserted, the Conclave panel on Constitutionalism emphasized that civic health depends equally on preserving composite heritage, safeguarding public property, and developing a scientific temper.",
          "Participants reflected on how campus cleanliness, academic honesty, and community volunteerism are direct, tangible expressions of fundamental constitutional duties.",
          "The panel resolved to launch a state-wide 'Know Your Constitution' outreach program in surrounding municipal schools this winter.",
        ],
        pullQuote: { text: "Constitution is not a mere lawyer's document, it is a vehicle of Life.", attribution: "– Dr. B.R. Ambedkar" },
        photo: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&auto=format",
        photoAlt: "Old manuscripts and leather-bound legal books",
        imageCaption: "Archives and legal reference documents during the Constitutional Law Workshop.",
        columns: [
          { title: "CIVIC LITERACY", body: "Bi-weekly community sessions explaining rights, consumer laws, and civic remediation." },
          { title: "SCIENTIFIC TEMPER", body: "Promoting evidence-based critical thinking and combating viral misinformation." },
          { title: "STUDENT CHARTER", body: "The Think India SVNIT code of student service and peer mentoring." },
        ],
      },
    ],
  },
];

function toArticle(id: string, data: Record<string, unknown>): Article {
  return {
    id,
    title: (data.title as string) || "",
    summary: (data.summary as string) || "",
    content: (data.content as string) || "",
    coverImageURL: (data.coverImageURL as string) || "",
    category: (data.category as string) || "other",
    tags: (data.tags as string[]) || [],
    authorId: (data.authorId as string) || "",
    authorName: (data.authorName as string) || "Member",
    authorPhotoURL: (data.authorPhotoURL as string) || "",
    status: (data.status as ArticleStatus) || "review",
    createdAt: (data.createdAt as string) || new Date().toISOString(),
    reviewedAt: (data.reviewedAt as string | null) || null,
    editionId: (data.editionId as string | undefined) || undefined,
  };
}

export async function submitArticle(
  input: Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags"> & { editionId?: string },
  author: Pick<Article, "authorId" | "authorName" | "authorPhotoURL">
): Promise<Article> {
  const record: Omit<Article, "id"> = { ...input, ...author, status: "review", createdAt: new Date().toISOString(), reviewedAt: null };
  const ref = await addDoc(collection(db, ARTICLES_COLLECTION), record);
  return { id: ref.id, ...record };
}

export async function getPublishedArticles(): Promise<Article[]> {
  const snapshot = await getDocs(query(collection(db, ARTICLES_COLLECTION), where("status", "==", "published")));
  return snapshot.docs.map((item) => toArticle(item.id, item.data() as Record<string, unknown>)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublishedArticle(id: string): Promise<Article | null> {
  const snapshot = await getDoc(doc(db, ARTICLES_COLLECTION, id));
  if (!snapshot.exists()) return null;
  const article = toArticle(snapshot.id, snapshot.data() as Record<string, unknown>);
  return article.status === "published" ? article : null;
}

export async function getAllArticles(): Promise<Article[]> {
  const snapshot = await getDocs(query(collection(db, ARTICLES_COLLECTION), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => toArticle(item.id, item.data() as Record<string, unknown>));
}

export async function reviewArticle(id: string, status: "published" | "rejected"): Promise<void> {
  await updateDoc(doc(db, ARTICLES_COLLECTION, id), { status, reviewedAt: new Date().toISOString() });
}

export async function updateArticle(
  id: string,
  changes: Partial<Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags" | "editionId">>
): Promise<void> {
  await updateDoc(doc(db, ARTICLES_COLLECTION, id), changes);
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
}

const EDITIONS_COLLECTION = "newspaper_editions";
const DELETED_EDITIONS_KEY = "ti_deleted_newspaper_editions";

export async function getNewspaperEditions(): Promise<NewspaperEdition[]> {
  try {
    const snapshot = await getDocs(query(collection(db, EDITIONS_COLLECTION)));
    const custom = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      return {
        id: docSnap.id,
        title: (data.title as string) || "Untitled Edition",
        editionName: (data.editionName as string) || "CAMPUS EDITION",
        volume: (data.volume as string) || "VOL. 1",
        date: (data.date as string) || new Date().toLocaleDateString(),
        price: (data.price as string) || "FREE",
        tagline: (data.tagline as string) || "IDEAS THAT INSPIRE. ACTION THAT TRANSFORMS.",
        description: (data.description as string) || "",
        coverStoryHeadline: (data.coverStoryHeadline as string) || "",
        coverStoryDeck: (data.coverStoryDeck as string) || "",
        coverPhoto: (data.coverPhoto as string) || "https://images.unsplash.com/photo-1708578200684-3aa944b73237?w=800&h=600&fit=crop&auto=format",
        status: (data.status as "published" | "draft") || "published",
        createdAt: (data.createdAt as string) || new Date().toISOString(),
        pages: (data.pages as NewspaperPage[]) || [],
      };
    });

    const merged = [...DEFAULT_EDITIONS];
    for (const c of custom) {
      const idx = merged.findIndex((m) => m.id === c.id);
      if (idx >= 0) {
        merged[idx] = c;
      } else {
        merged.push(c);
      }
    }

    // Filter out deleted editions
    const deletedIds = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem(DELETED_EDITIONS_KEY) || "[]") as string[];
        stored.forEach((item) => deletedIds.add(item));
      } catch {}
    }
    try {
      const deletedSnap = await getDocs(collection(db, "deleted_newspaper_editions"));
      deletedSnap.docs.forEach((d) => deletedIds.add(d.id));
    } catch {}

    const result = merged.filter((e) => !deletedIds.has(e.id));
    return result.length > 0 ? result : DEFAULT_EDITIONS;
  } catch (err) {
    console.warn("Unable to fetch newspaper editions from Firestore, using defaults", err);
    return DEFAULT_EDITIONS;
  }
}

export async function createNewspaperEdition(
  input: Omit<NewspaperEdition, "id" | "createdAt">
): Promise<NewspaperEdition> {
  const record = {
    ...input,
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, EDITIONS_COLLECTION), record);
  return { id: ref.id, ...record };
}

export async function deleteNewspaperEdition(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EDITIONS_COLLECTION, id));
  } catch {}
  try {
    await setDoc(doc(db, "deleted_newspaper_editions", id), {
      deletedAt: new Date().toISOString(),
    });
  } catch {}
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(DELETED_EDITIONS_KEY) || "[]") as string[];
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem(DELETED_EDITIONS_KEY, JSON.stringify(stored));
      }
    } catch {}
  }
}

export async function getUserArticles(authorId: string): Promise<Article[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, ARTICLES_COLLECTION), where("authorId", "==", authorId))
    );
    return snapshot.docs
      .map((item) => toArticle(item.id, item.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    console.warn("Unable to fetch user articles", err);
    return [];
  }
}

/** Stores a local, admin-only preview used by the existing /Article presentation UI. */
export function saveArticlePreview(article: Article): void {
  if (typeof window !== "undefined") localStorage.setItem(PREVIEW_KEY, JSON.stringify(article));
}

export function getArticlePreview(): Article | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? (JSON.parse(raw) as Article) : null;
  } catch {
    return null;
  }
}
