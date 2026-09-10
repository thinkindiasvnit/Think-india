# 🇮🇳 Think India SVNIT

> Empowering youth through leadership, dialogue, and nation-building

Think India is a student-driven forum dedicated to binding the youth of India with nationalistic spirit and channelizing creative energies towards building a stronger nation through education, innovation, and civic engagement.

## ✨ Features

- **Events & Conclaves**: Leadership events, panel discussions, and keynote sessions
- **Social Initiatives**: Community outreach and civic engagement programs
- **Gallery**: Visual documentation of activities and impact
- **Blog Platform**: Youth perspectives and opinion pieces
- **Admin Dashboard**: Content management system for team members
- **Internship Program**: Track internships and testimonials
- **Team Management**: Showcase core team and volunteers

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP, Lenis (smooth scroll)
- **3D Graphics**: Three.js, React Three Fiber
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd Think-india

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase config to .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🗂️ Project Structure

```
Think-india/
├── src/
│   ├── app/              # Next.js app directory (pages & routes)
│   │   ├── about/        # About page
│   │   ├── admin/        # Admin dashboard & management
│   │   ├── blogs/        # Blog listing & detail pages
│   │   ├── events/       # Events listing & detail pages
│   │   ├── gallery/      # Gallery & albums
│   │   ├── internships/  # Internship program page
│   │   └── team/         # Team showcase
│   ├── components/       # React components
│   ├── lib/              # Services & utilities (Firebase, etc.)
│   └── data/             # Static data files
├── public/               # Static assets
└── scripts/              # Utility scripts (admin seeding, etc.)
```

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Use admin credentials (set up via `scripts/seedAdmin.mjs`)
3. Access admin dashboard to manage:
   - Events
   - Blogs
   - Gallery albums
   - Team members
   - User queries
   - Articles submissions

## 🎨 Design Philosophy

- **Minimalist & Premium**: Clean layouts with amber/beige color palette
- **Smooth Animations**: GSAP-powered entrance animations
- **Responsive**: Mobile-first approach with touch-friendly interactions
- **Accessibility**: Semantic HTML and ARIA compliance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Connect With Us

- **Instagram**: [@thinkindia.svnit](https://www.instagram.com/thinkindia.svnit)
- **Facebook**: [Think India SVNIT](https://www.facebook.com/thinkindiasvnit/)
- **LinkedIn**: [Think India Org](https://www.linkedin.com/company/thinkindiaorg/)
- **X (Twitter)**: [@thinkindiaorg](https://x.com/thinkindiaorg)
- **YouTube**: [@thinkindiaorg](https://youtube.com/@thinkindiaorg)

## 📄 License

This project is private and maintained by Think India SVNIT.

---

**Made with ❤️ by Think India Team**
