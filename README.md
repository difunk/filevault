# filevault - Google Drive Clone

Ein moderner Cloud-Speicher-Service, der mit Next.js 15, TypeScript und modernen Web-Technologien entwickelt wurde.

## 🚀 Übersicht

filevault ist eine Google Drive Alternative mit folgenden Kernfunktionen:

- 📁 Dateien und Ordner verwalten
- ☁️ Datei-Upload
- 🔐 Sichere Authentifizierung mit Clerk
- 📱 Responsive Design für alle Geräte
- 🗃️ Leistungsstarke SingleStore Datenbank
- 📊 Integrierte Analytics mit PostHog

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React Framework mit App Router
- **TypeScript** - Typsicherheit
- **Tailwind CSS** - Utility-first CSS Framework
- **Radix UI** - Accessible UI Components
- **Lucide React** - Icon Library

### Backend & Database

- **SingleStore** - Cloud-native Datenbank
- **Drizzle ORM** - Type-safe SQL toolkit
- **Clerk** - Benutzer-Authentifizierung
- **UploadThing** - File Upload Service

### Developer Tools

- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **TypeScript** - Static Type Checking
- **Drizzle Kit** - Database Migrations

## 📦 Installation

1. **Repository klonen**

   ```bash
   git clone <repository-url>
   cd filevault
   ```

2. **Dependencies installieren**

   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**

   ```bash
   cp .env.example .env.local
   ```

   Erforderliche Variablen:

   ```env
   # Database
   SINGLESTORE_HOST=
   SINGLESTORE_PORT=
   SINGLESTORE_USER=
   SINGLESTORE_PASS=
   SINGLESTORE_DB_NAME=
   DATABASE_URL=

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   # File Upload (UploadThing)
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=

   # Analytics (PostHog)
   NEXT_PUBLIC_POSTHOG_KEY=
   NEXT_PUBLIC_POSTHOG_HOST=
   ```

4. **Datenbank einrichten**
   ```bash
   npm run db:push
   ```

## 🚀 Entwicklung

**Development Server starten:**

```bash
npm run dev
```

Die Anwendung ist unter `http://localhost:3000` verfügbar.

**Weitere Scripts:**

```bash
# Produktions-Build erstellen
npm run build

# Production Server starten
npm start

# Code formatieren
npm run format:write

# Datenbank Studio
npm run db:studio
```

## 🎯 Features

### ✅ Implementiert

- [x] Datenbank Setup und Data Model
- [x] Folder-Status in URL
- [x] Benutzer-Authentifizierung
- [x] Datei-Upload Funktionalität
- [x] Analytics Integration
- [x] Konsistente Sortierung
- [x] Homepage & Onboarding
- [x] Dateien löschen
- [x] Dateien umbenennen
- [x] Ordner erstellen

### 🔄 In Entwicklung

- [ ] Dateien und Ordner per Drag-and-Drop verschieben
- [ ] Ordner verwalten
- [ ] Datei-Sharing
- [ ] Such-Funktionalität
