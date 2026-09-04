# Build an AI Video Clipping Dashboard

Build a production-quality web application that acts as my **AI video clipping control center**, similar in concept to OpusClip, but with a modular architecture where I can control every part of the pipeline.

## Goal

The application should let me upload a long video (30 minutes to several hours), analyze it with AI, automatically discover the best short-form moments, generate clips, automatically reframe them to 9:16, generate captions, score/rank the clips, and let me manually review and edit everything from one dashboard.

The application should NOT be a simple landing page or mockup.

Build the actual functional application with clean architecture, real API endpoints, background processing, persistent jobs/statuses, and a polished dashboard.

---

# TECH STACK

Use:

* Next.js 15+ / App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* PostgreSQL
* Prisma ORM
* Redis + BullMQ for background jobs
* FFmpeg for video processing
* Docker/Docker Compose for local development
* REST API or Next.js API routes
* WebSockets or Server-Sent Events for real-time job progress

Use environment variables for all API keys and configuration.

The application must be easy to run with:

```bash
docker compose up -d
npm install
npm run dev
```

---

# MAIN PIPELINE

Implement this pipeline:

VIDEO UPLOAD
↓
VIDEO PROBING
↓
AUDIO EXTRACTION
↓
TRANSCRIPTION
↓
SCENE / SHOT DETECTION
↓
CONTENT SEGMENTATION
↓
AI VIDEO UNDERSTANDING
↓
AI CLIP DISCOVERY
↓
CLIP SCORING
↓
BEST CLIPS RANKING
↓
AUTOMATIC START/END REFINEMENT
↓
9:16 REFRAMING
↓
CAPTIONS
↓
FINAL RENDER
↓
DOWNLOAD / EXPORT

Every stage must be represented as a job with a status.

---

# AI PROVIDER SYSTEM

Create a provider abstraction so models can be changed without rewriting the application.

For example:

```typescript
interface AIProvider {
  analyzeVideo(input: VideoAnalysisInput): Promise<VideoAnalysisResult>;
  findClips(input: ClipDiscoveryInput): Promise<ClipCandidate[]>;
  scoreClips(input: ClipScoringInput): Promise<ClipScore[]>;
}
```

Create providers for:

### Qwen

Primary provider.

Use Qwen3.8-Max through its API when configured.

Environment variable:

```env
QWEN_API_KEY=
QWEN_MODEL=qwen3.8-max
```

Do NOT hardcode API keys.

### Gemini

Create a provider interface for Gemini so it can be enabled later.

### GLM

Create a provider interface for GLM.

### Local AI

Create a generic OpenAI-compatible provider so I can connect local models later.

The dashboard must allow me to select:

* AI provider
* model
* temperature
* max tokens
* analysis mode
* clip-generation strategy

---

# TRANSCRIPTION

Implement a transcription abstraction.

Support:

* OpenAI Whisper API
* faster-whisper/local Whisper
* future providers

The transcription result must contain:

```typescript
{
  text: string;
  start: number;
  end: number;
  speaker?: string;
}
```

Store the transcript in PostgreSQL.

Allow the user to search the transcript.

Clicking a transcript sentence should jump the video player to that timestamp.

---

# AI CLIP DISCOVERY

The AI should NOT simply ask:

"Find interesting clips."

Instead divide the video into intelligently sized segments and analyze them.

For every candidate segment calculate:

```text
Hook Score
Value Score
Emotion Score
Surprise Score
Story Score
Standalone Score
Clarity Score
Virality Score
Visual Interest Score
Overall Score
```

Use configurable weights.

Example:

```text
Overall =
Hook × 0.20
+ Emotion × 0.15
+ Value × 0.15
+ Story × 0.15
+ Standalone × 0.10
+ Surprise × 0.10
+ Visual × 0.05
+ Clarity × 0.10
```

Make these weights editable from the dashboard.

---

# CLIP REQUIREMENTS

Each generated clip candidate should contain:

```typescript
{
  id: string;
  projectId: string;

  startTime: number;
  endTime: number;

  duration: number;

  title: string;
  hook: string;
  description: string;

  transcript: string;

  scores: {
    hook: number;
    value: number;
    emotion: number;
    surprise: number;
    story: number;
    standalone: number;
    clarity: number;
    visual: number;
    virality: number;
    overall: number;
  };

  reasoning: string;

  status: "candidate" | "approved" | "rejected" | "rendering" | "completed";

  outputUrl?: string;
}
```

---

# AUTOMATIC CLIP BOUNDARY OPTIMIZATION

Do not blindly use AI-generated timestamps.

After finding a candidate:

1. Look slightly before the proposed start.
2. Look slightly after the proposed end.
3. Use transcript timestamps.
4. Detect sentence boundaries.
5. Avoid cutting words.
6. Preserve enough context.
7. Ensure the clip has a strong beginning.
8. End near the payoff.

Add a configurable:

```text
Context Before: 0–10 seconds
Context After: 0–10 seconds
Minimum Duration: 10 seconds
Maximum Duration: 180 seconds
```

---

# VIDEO PROCESSING

Use FFmpeg.

Create a dedicated video processing service.

It should support:

* cutting
* trimming
* scaling
* cropping
* 9:16
* 16:9
* 1:1
* audio normalization
* subtitle burning
* thumbnail generation
* preview generation
* final rendering

Never perform long FFmpeg jobs directly inside a normal HTTP request.

Use BullMQ workers.

---

# AI AUTO-REFRAMING

Implement automatic 9:16 reframing.

The system should detect the important person/object and keep them inside the frame.

Create a modular tracking system so later I can plug in:

* YOLO
* MediaPipe
* face detection
* other vision models

The UI should allow:

```text
Auto
Center
Face tracking
Speaker tracking
Manual
```

For manual mode, provide a simple crop-position editor.

---

# CAPTIONS

Implement automatic captions.

Features:

* word-level timestamps
* automatic line breaking
* maximum characters per line
* caption position
* font size
* font
* background
* animation style
* capitalization
* highlighted words

Provide several presets:

```text
Clean
Bold
TikTok
Podcast
Minimal
Karaoke
```

Allow the user to customize them.

---

# VIDEO EDITOR

Create a lightweight browser-based editor.

It should include:

### Video player

* play/pause
* timeline
* seek
* current timestamp
* duration
* volume
* fullscreen

### Timeline

Show:

* video
* transcript
* detected scenes
* clip boundaries
* captions

Allow:

* drag start
* drag end
* split
* delete
* duplicate

Do NOT attempt to recreate Premiere Pro.

Keep it lightweight and focused on short-form clipping.

---

# DASHBOARD

Create a professional dark dashboard.

Sidebar:

```text
Dashboard
Projects
AI Clips
Transcripts
Rendering
Exports
Settings
AI Models
```

---

# DASHBOARD HOME

Show:

```text
Projects
Videos processed
Clips generated
Rendering jobs
Average clip score
Processing time
```

Include recent projects.

---

# PROJECT PAGE

When opening a project show:

## Header

Project name

Original video

Duration

Resolution

FPS

File size

Processing status

## Tabs

```text
Overview
Clips
Transcript
Scenes
Editor
Render
Settings
```

---

# CLIPS PAGE

Show all AI-generated clips as cards.

Each card should contain:

* thumbnail
* title
* duration
* overall score
* hook score
* virality score
* start/end timestamps
* AI reasoning

Actions:

```text
Preview
Edit
Approve
Reject
Render
Download
Delete
```

Allow sorting:

```text
Overall score
Virality
Hook
Emotion
Duration
Newest
```

Allow filtering:

```text
All
Top picks
Approved
Rejected
Rendered
```

---

# CLIP DETAIL

When opening a clip:

Left:

Video player

Right:

```text
AI Score
Hook
Value
Emotion
Surprise
Story
Standalone
Visual
Clarity
Virality
```

Below:

AI explanation:

"Why this clip was selected"

Then:

```text
Start: 00:43:21
End: 00:44:07
Duration: 46 sec
```

Allow editing these timestamps manually.

---

# BATCH GENERATION

The user should be able to specify:

```text
Number of clips: 10
Minimum duration: 20 sec
Maximum duration: 60 sec

Aspect ratio: 9:16

Style: TikTok / Instagram / YouTube Shorts

Find:
[✓] Strong hooks
[✓] Funny moments
[✓] Surprising moments
[✓] Educational moments
[✓] Emotional moments
```

Then click:

# Generate Clips

Create a background job.

Show real-time progress:

```text
Uploading       ✓
Extracting      ✓
Transcribing    ✓
Finding scenes  ✓
AI analysis     ███████░░░ 72%
Ranking clips   ○
Rendering       ○
```

---

# MULTI-PROVIDER COMPARISON

Add an advanced feature:

Allow me to run the SAME video analysis through multiple models.

Example:

```text
Qwen3.8-Max
Gemini
GLM
```

Then compare:

```text
Clip A
Qwen:   92
Gemini: 88
GLM:    94

Clip B
Qwen:   87
Gemini: 93
GLM:    89
```

Calculate a combined score.

This lets me test which model actually performs best on my content.

---

# SETTINGS

Create a comprehensive settings page.

## AI

* provider
* model
* API key
* temperature
* token limit

## Clipping

* number of clips
* min duration
* max duration
* context padding
* scoring weights

## Video

* default aspect ratio
* default resolution
* FPS
* encoding preset

## Captions

* default style
* font
* size
* position

## Storage

* local storage
* S3-compatible storage

---

# JOB SYSTEM

Create persistent jobs.

Database model:

```text
Job
id
projectId
type
status
progress
message
startedAt
completedAt
error
metadata
```

Job types:

```text
UPLOAD
PROBE
TRANSCRIBE
SCENE_DETECT
AI_ANALYSIS
CLIP_DISCOVERY
CLIP_SCORING
REFRAME
CAPTIONS
RENDER
THUMBNAIL
```

Use BullMQ.

The UI must update automatically when job progress changes.

---

# DATABASE

Use Prisma.

Create models for:

```text
User
Project
Video
Transcript
TranscriptSegment
Scene
Clip
ClipScore
RenderJob
Job
AIProvider
ProjectSettings
CaptionPreset
```

Use proper relations and indexes.

---

# STORAGE

Abstract storage:

```typescript
interface StorageProvider {
  upload();
  download();
  delete();
  getSignedUrl();
}
```

Implement local filesystem first.

Design it so S3 can be added later.

---

# API

Create clean API endpoints.

Examples:

```text
POST /api/projects
POST /api/projects/:id/upload
POST /api/projects/:id/analyze
POST /api/projects/:id/find-clips
POST /api/clips/:id/render

GET /api/projects
GET /api/projects/:id
GET /api/projects/:id/clips
GET /api/projects/:id/transcript

PATCH /api/clips/:id
DELETE /api/clips/:id

GET /api/jobs/:id
```

Validate all input using Zod.

---

# SECURITY

Implement:

* authentication
* authorization
* input validation
* file type validation
* file size limits
* safe filenames
* FFmpeg argument sanitization
* API key encryption/storage
* rate limiting
* no shell command injection

Never directly interpolate user input into shell commands.

---

# UX

The interface should feel like a serious SaaS product.

Use:

* dark mode
* clean typography
* responsive layout
* subtle animations
* skeleton loaders
* toast notifications
* progress indicators
* empty states
* error states
* confirmation dialogs

Do NOT overuse gradients.

Do NOT make it look like a generic AI landing page.

Prioritize usability.

---

# IMPORTANT PERFORMANCE REQUIREMENTS

Long videos can be several GB.

DO NOT:

* load entire videos into browser memory
* send entire videos through ordinary API requests
* process long FFmpeg jobs synchronously
* store large videos inside PostgreSQL
* block the Next.js server during processing

Use streaming/chunked uploads where appropriate.

All heavy processing must happen in workers.

---

# LOCAL DEVELOPMENT

Create:

```text
docker-compose.yml
```

with:

```text
postgres
redis
app
worker
```

Provide:

```text
.env.example
README.md
```

README must explain:

1. Installation
2. Environment variables
3. Starting Docker
4. Database migration
5. Starting the application
6. Starting workers
7. Configuring Qwen
8. Uploading a video
9. Running analysis
10. Rendering clips

---

# PROJECT STRUCTURE

Use a clean structure similar to:

```text
app/
  dashboard/
  projects/
  clips/
  settings/
  api/

components/
  video/
  clips/
  editor/
  dashboard/
  ui/

lib/
  ai/
    providers/
      qwen.ts
      gemini.ts
      glm.ts
      openai-compatible.ts
  video/
  transcription/
  storage/
  scoring/
  jobs/
  db/

workers/
  video-worker.ts
  ai-worker.ts
  render-worker.ts

prisma/
  schema.prisma
```

---

# ERROR HANDLING

Every pipeline stage must handle failures gracefully.

If AI analysis fails:

```text
AI analysis failed
Retry
Change model
View error
```

If rendering fails:

```text
Render failed
Retry
```

Never lose the project or previous completed clips because one job failed.

---

# IMPORTANT IMPLEMENTATION RULE

Do NOT build fake functionality.

If an external service is not configured, provide a clearly marked mock/demo provider ONLY for development.

The production code must have real provider interfaces and real processing paths.

Do not put fake statistics into the dashboard.

Do not use hardcoded fake clips.

---

# DEVELOPMENT PROCESS

Before coding:

1. Inspect the repository.
2. Determine what already exists.
3. Reuse existing code where appropriate.
4. Create a detailed implementation plan.
5. Implement the database.
6. Implement storage.
7. Implement job queue.
8. Implement video processing.
9. Implement transcription.
10. Implement AI provider abstraction.
11. Implement Qwen provider.
12. Implement clip discovery/scoring.
13. Implement rendering.
14. Implement dashboard.
15. Implement editor.
16. Add tests.
17. Run type checking.
18. Run linting.
19. Fix all errors.
20. Test the complete pipeline.

Do not stop after creating the UI.

The final result should be a functioning **AI video clipping control center**.

At the end, give me:

* what was implemented
* files created/changed
* commands to run it
* required environment variables
* known limitations
* recommended next improvements

One important recommendation: don't make Claude Code try to send the entire 2-hour video directly to Qwen. Have it extract/transcribe/segment locally first, then send intelligently selected chunks + transcript/context to the vision model. That will be dramatically cheaper and more reliable.