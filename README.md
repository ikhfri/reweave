# Reweave

**Reweave** is a mental-wellness web application for reflecting on emotions, keeping a personal diary, and understanding emotional patterns over time.

Reweave offers a calm space to pause, record what you feel, and look back on your experiences with supportive AI-generated reflections.

> Understand your feelings, one reflection at a time.

## Features

- **Daily Check-in** — record your emotions and relevant context.
- **Digital Diary** — write and revisit personal reflections.
- **AI Analysis** — receive summaries and possible emotional insights from diary or check-in entries.
- **Emotional Insights** — review patterns and trends over time.
- **Coping Suggestions** — explore supportive activities and practical next steps.
- **Indonesian and English** — switch between supported interface languages.

> AI-generated reflections are for informational and self-reflection purposes only. They are not a clinical diagnosis and do not replace professional mental-health care.

## Tech Stack

Based on the current implementation, Reweave uses:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- YupiAI for AI-powered analysis (`cheap-qwen3.7-flash`)

Database, authentication, and deployment configuration may vary by environment.

## Getting Started

### Prerequisites

Install Node.js and npm. Check your installed versions:

```bash
node -v
npm -v
```

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

Replace the placeholders with your repository URL and local project directory.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the variables required by your application.

```env
DATABASE_URL=""

# Add the YupiAI API key using the exact variable name
# expected by your AI client implementation.

# Add authentication secrets and URLs if required.
```

The example above is a template, not a definitive list of variable names. Check the application's database, authentication, and AI client configuration for the exact requirements.

**Never commit API keys, database credentials, or other secrets to version control.**

### 4. Prepare the database

For a Prisma-based setup, these commands are common in development:

```bash
npx prisma generate
npx prisma migrate dev
```

Use the migration workflow configured for your repository. Review migrations before applying them to a production database.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. If locale-prefixed routing is enabled, the Indonesian version may be available at `/id`.

## Available Scripts

The actual scripts are defined in `package.json`. Common Next.js scripts include:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Run only scripts that are present in your project.

## Project Structure

A typical structure for Reweave may look like this:

```text
src/
├── app/          # Pages, layouts, and API routes
├── components/   # Reusable UI components
├── lib/          # Shared utilities and integrations
└── i18n/         # Locale configuration

prisma/
└── schema.prisma # Database schema

public/           # Static assets
```

The actual repository structure may differ; use the files in your project as the source of truth.

## AI Analysis

Reweave can use an AI provider to generate reflections from supported entries.

When developing AI features:

- Handle provider errors, rate limits, and timeouts gracefully.
- Show a clear loading state while an analysis is running.
- Validate generated output before saving or displaying it.
- Do not present AI interpretations as clinical facts or diagnoses.
- Avoid logging private diary content or secrets unnecessarily.

## Privacy and Safety

Diary entries and emotional check-ins may contain sensitive personal information.

- Keep API keys and database credentials in environment variables.
- Enforce authentication and authorization for private records.
- Ensure users can access only their own diary entries and analyses.
- Explain clearly when AI analysis fails or is unavailable.
- Provide relevant support resources where appropriate.
- Reweave is not an emergency service and does not replace professional support.

## Deployment

Reweave can be deployed to a hosting platform that supports Next.js, such as Vercel, or another compatible environment.

Before deployment:

1. Configure all required environment variables.
2. Set up the production database and review migrations.
3. Verify authentication callback URLs and allowed origins.
4. Confirm the AI provider configuration and request limits.
5. Run a production build:

   ```bash
   npm run build
   ```

6. Test authentication, check-ins, diary entries, AI analysis, and localized routes.

## Contributing

Contributions and improvements are welcome.

1. Create a branch for your change.
2. Follow the existing TypeScript and styling conventions.
3. Keep components focused and reusable.
4. Test the affected features before submitting changes.
5. Never commit `.env` files or private user data.

## License

No license information is specified in this README. Add a `LICENSE` file and update this section when the project's license has been decided.
