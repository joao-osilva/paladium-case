# PaxBnb - AI-Powered Property Rental Platform

> **Built entirely with Claude Code - A complete Airbnb-like platform without writing a single line of code manually.**

🔗 **Live Demo**: [https://paxbnb.neustudio.co](https://paxbnb.neustudio.co)  
🎬 **Demo Videos**: [Registration](https://www.youtube.com/shorts/BBxrkibbFDs) • [Host Flow](https://www.youtube.com/watch?v=jIXbUINY4kU) • [Guest Flow](https://www.youtube.com/watch?v=Xl0GssxKPBk)

---

## What is PaxBnb?

A modern property rental platform that lets users find and book accommodations through **AI-powered conversational search**. Instead of traditional filters and forms, users simply talk to an AI assistant that understands natural language, provides real-time availability, and handles the entire booking process through conversation.

**Key Features:**
- 🤖 Natural language property search with voice commands
- ⚡ Real-time booking with instant confirmation
- 👥 Complete host/guest workflows
- 📱 Mobile-first responsive design
- 💬 Generative UI components during chat interactions

---

## My AI Development Journey

### The Experience

Coming from Cursor, I decided to try Claude Code for this project. **The results were incredible - I literally haven't touched a single line of code.** Claude handled everything from architecture planning to UI implementation with remarkable attention to detail.

### Development Process

I structured the development in **3 clear phases**:

1. **🏗️ Infrastructure Setup**: Vercel (deployment), Supabase (database/auth), GitHub (repo), Cloudflare (DNS)
2. **🏠 Host Journey**: Complete property listing and management workflow
3. **🎯 Guest Journey**: AI-powered search and booking experience

### Technology Decisions

**Next.js 14**: Chosen for simplicity and extensive integrations - perfect for AI-assisted development.

**Vercel AI SDK**: This was the game-changer. The SDK's built-in capabilities made AI integration seamless:
- LLM tool usage for property operations
- Generative UI components during conversations  
- Speech-to-text for voice commands
- Streaming responses for real-time interactions

**Supabase**: Handled authentication and real-time database needs without infrastructure complexity.

```
Stack: Next.js 14 + Supabase + Vercel AI SDK + OpenAI GPT-4
Deploy: Vercel + Cloudflare DNS
```

---

## What Impressed Me About Claude

### AI Superpowers
- **Design Taste**: Exceptional attention to UI/UX and mobile responsiveness
- **System Thinking**: Understood complex architectural patterns without guidance
- **Mobile-First**: I kept emphasizing mobile UX importance, and Claude consistently delivered
- **Integration Handling**: Seamlessly connected multiple services (Supabase, OpenAI, Vercel)
- **Nuanced Understanding**: Handled complex business logic and edge cases autonomously

### Where AI Needed Help
- **Supabase Debugging**: Got lost during one troubleshooting session - probably needed more platform-specific context
- **Platform Quirks**: Occasionally needed human intervention for service-specific issues

---

## Architecture Overview

### Database Design
```
profiles         → User authentication & profile data
properties       → Property listings with location data  
property_images  → Multiple images per property
bookings         → Reservations with conflict prevention
```

**Security**: Row Level Security (RLS) policies, automated triggers, real-time availability checking

### AI Assistant Features
- **Natural Language Processing**: Understands complex search queries
- **Tool Usage**: Directly interfaces with database for bookings and availability
- **Generative UI**: Creates visual components during conversations
- **Voice Commands**: Speech-to-text integration for accessibility
- **Context Awareness**: Maintains conversation state across interactions

---

## Getting Started

### Quick Setup

```bash
# Clone and setup main app
git clone https://github.com/neustudio-adm/paladium-case.git
cd paladium-case/web-app
npm install
cp .env.local.example .env.local

# Setup database
# Copy database/complete-schema.sql into Supabase SQL Editor and run

# Configure environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key # optional for voice

npm run dev
```

### Project Structure
```
paladium-case/
├── web-app/         # Main Next.js application
├── database/        # Supabase schema  
├── landing-page/    # Marketing site
└── README.md
```

---

## Demo Walkthrough

**🎯 [User Registration](https://www.youtube.com/shorts/BBxrkibbFDs)**  
Simple onboarding with host/guest role selection.

**🏠 [Host Experience](https://www.youtube.com/watch?v=jIXbUINY4kU)**  
Complete property management: listing creation, images, bookings, analytics.

**🎯 [Guest Experience](https://www.youtube.com/watch?v=Xl0GssxKPBk)**  
AI-powered search and booking with voice commands and natural language.

---

## Key Insights

This project demonstrates that **AI can handle enterprise-level development** including complex business logic, database design, modern UI/UX, and service integrations. 

**What this means for development:**
- Developers become **orchestrators** rather than implementers  
- **Context and clear requirements** are more valuable than coding skills
- **Rapid iteration** from concept to production becomes realistic
- **Mobile-first thinking** comes naturally to AI when emphasized

---

*Built entirely through AI assistance.*