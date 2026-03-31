# LLM API Comparator ⚡

> **Make data-driven decisions about which AI model fits your budget.** Compare pricing and features of GPT-4, Claude, Gemini, Llama and more with real-time pricing data.

## 🎯 About

LLM API Comparator is a modern, interactive web application that helps developers, data scientists, and teams make informed decisions when selecting Large Language Model (LLM) APIs. It provides comprehensive pricing comparisons, detailed model specifications, and intelligent recommendations across multiple AI providers.

**Live Demo:** https://llm-comparator.abelgalloruiz.me

## ✨ Key Features

### 📊 **Interactive Comparison**
- Side-by-side pricing comparison of 50+ LLM models
- Real-time pricing data from multiple providers
- Filter and sort by cost, performance, and features
- Subscription vs. pay-per-use pricing models

### 🧮 **Usage Calculator**
- Calculate total API costs based on token usage
- Break down input and output token costs
- Support for batch processing scenarios
- Visual cost projections

### 🤖 **Smart Recommender**
- AI-powered model recommendations
- Filter by use case (chat, text generation, embeddings, etc.)
- Budget-aware suggestions
- Feature-based matching

### 🌍 **Multi-Language Support**
- English, Spanish, Portuguese, and French
- Automatic language detection
- Persistent language preference
- Translated model descriptions

### 🎨 **Dark/Light Theme**
- System preference detection
- Manual theme toggle
- Smooth transitions
- Persistent theme choice

### 📱 **Responsive Design**
- Mobile-first approach
- Desktop, tablet, and mobile optimized
- Touch-friendly interface
- Progressive Web App ready

### ❓ **Comprehensive FAQ**
- Cost breakdown diagrams
- API usage explanation
- Billing model comparisons
- Common questions answered

## 🏗️ Project Structure

```
llm-api-comparator/
├── src/
│   ├── components/
│   │   ├── layout/              # Header, Footer components
│   │   ├── charts/              # Cost visualization charts
│   │   ├── comparison/          # Comparison table & panels
│   │   ├── calculator/          # Usage calculator
│   │   ├── models/              # Model cards & grid
│   │   ├── recommender/         # AI recommender engine
│   │   ├── faq/                 # Frequently asked questions
│   │   ├── filters/             # Filter controls
│   │   └── ui/                  # Reusable UI components
│   ├── data/
│   │   └── models.ts            # Model data source
│   ├── hooks/
│   │   ├── useTheme.ts          # Theme management
│   │   └── useI18n.ts           # Internationalization
│   ├── i18n/
│   │   └── locales/             # Translation files (en, es, pt, fr)
│   ├── lib/
│   │   ├── calculator.ts        # Cost calculation logic
│   │   ├── recommender.ts       # Recommendation engine
│   │   ├── modelsApi.ts         # Backend API client
│   │   ├── codeHighlight.ts     # Syntax highlighting
│   │   └── utils.ts             # Utility functions
│   ├── pages/
│   │   └── index.astro          # Main page
│   ├── store/
│   │   ├── appStore.tsx         # Application state
│   │   └── context.ts           # React context
│   ├── styles/
│   │   └── global.css           # Global styles
│   └── types/
│       └── index.ts             # TypeScript types
├── public/                       # Static assets
├── Dockerfile                    # Docker configuration
├── astro.config.mjs             # Astro configuration
├── package.json
├── tsconfig.json
└── README.md

```

## 🛠️ Tech Stack

- **Framework:** [Astro 6](https://astro.build) - Ultra-fast static site builder
- **UI Library:** [React 19](https://react.dev) - Interactive components
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS
- **Package Manager:** [Bun](https://bun.sh) - Fast JavaScript runtime
- **Visualizations:** [D3.js](https://d3js.org) - Data-driven charts
- **Containerization:** [Docker](https://www.docker.com) - Container deployment
- **Reverse Proxy:** [Nginx](https://nginx.org) - Web server
- **Type Safety:** [TypeScript](https://www.typescriptlang.org) - Static typing

## 🚀 Quick Start

### Prerequisites
- Node.js >= 22.12.0
- Bun package manager (optional but recommended)

### Development

```bash
# Install dependencies
bun install
# or
npm install

# Start dev server
bun run dev
# or
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
bun run build

# Preview build locally
bun run preview

# Or run with Docker
docker build -t llm-comparator .
docker run -p 80:80 llm-comparator
```

## 📋 Available Commands

| Command | Action |
|---------|--------|
| `bun run dev` | Start development server at `http://localhost:3000` |
| `bun run build` | Build production site to `./dist/` |
| `bun run preview` | Preview production build locally |
| `bun run astro check` | Check for TypeScript errors |
| `bun run astro add` | Add new integrations |

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API for fetching live model data
PUBLIC_BACKEND_URL=https://swissknife.abelgalloruiz.me/llm-models

# Optional: fallback to local API if not set
# PUBLIC_BACKEND_URL=http://localhost:3000/llm-models
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t llm-comparator:latest .
```

### Run Container
```bash
docker run -d \
  --name llm-comparator \
  --restart unless-stopped \
  -p 80:80 \
  -v llm-comparator-data:/var/www/html/tmp \
  --env-file .env \
  llm-comparator:latest
```

### Docker Compose (Optional)
```yaml
version: '3.8'

services:
  llm-comparator:
    image: llm-comparator:latest
    container_name: llm-comparator
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - llm-comparator-data:/var/www/html/tmp
    env_file: .env
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  llm-comparator-data:
```

## 🚢 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow (`deploy.yml`) that:

1. **Validates** code with TypeScript checks
2. **Builds** Docker image with caching
3. **Deploys** to production with blue-green strategy
4. **Rolls back** automatically on failure
5. **Cleans up** old container images

### Required Secrets for Deployment
- `SERVER_HOST` - Target server IP/hostname
- `SERVER_USER` - SSH username
- `SERVER_PORT` - Container port mapping
- `SSH_PRIVATE_KEY` - Private SSH key
- `GHCR_PAT` - GitHub Container Registry token
- `ENV_FILE_PATH` - Path to `.env` file on server

## 🎨 Customization

### Adding New Models
Edit `src/data/models.ts` to add new LLM providers and models.

### Translations
Add translations in `src/i18n/locales/` following the existing pattern in `en.ts`.

### Styling
Customize theme colors in `astro.config.mjs` and Tailwind configuration.

### Charts
Modify chart components in `src/components/charts/` to change visualizations.

## 📊 Supported LLM Providers

- OpenAI (GPT-4, GPT-3.5, etc.)
- Anthropic (Claude 3 family)
- Google (Gemini, PaLM)
- Meta (Llama)
- Cohere
- Mistral AI
- HuggingFace

*Add more providers by submitting a pull request*

## 🔄 Data Updates

Model pricing data is fetched from a centralized backend API. To use fresh data:

1. Update `PUBLIC_BACKEND_URL` environment variable
2. Rebuild and redeploy
3. Data refreshes on each page load

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure:
- Code follows TypeScript conventions
- Components use React hooks
- Styles use Tailwind CSS classes
- Translations are added for all languages

## 📝 License

This project is open source and available under the MIT License.

## 📧 Support & Contact

For issues, feature requests, or questions:
- Open an [Issue](https://github.com/abelrgr/llm-api-comparator/issues)
- Contact: [abelgalloruiz.me](https://abelgalloruiz.me)

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build)
- Icons by [Heroicons](https://heroicons.com)
- Charts powered by [D3.js](https://d3js.org)
- Deployed with [Docker](https://www.docker.com)

---

**Last Updated:** March 2026  
**Current Version:** 1.0.0
