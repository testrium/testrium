<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { withBase } from 'vitepress'

// ── Mouse parallax for hero image ────────────────────────────
const mouseX = ref(0)
const mouseY = ref(0)
function onMouseMove(e: MouseEvent) {
  mouseX.value = (e.clientX / window.innerWidth - 0.5) * 18
  mouseY.value = (e.clientY / window.innerHeight - 0.5) * 18
}

// ── Screenshots carousel ─────────────────────────────────────
const screenshots = [
  { src: '/testrium/screenshots/dashboard.png',             label: 'Dashboard' },
  { src: '/testrium/screenshots/test_cases.png',            label: 'Test Cases' },
  { src: '/testrium/screenshots/test_runs.png',             label: 'Test Runs' },
  { src: '/testrium/screenshots/test_matric_dashboard.png', label: 'Metrics' },
  { src: '/testrium/screenshots/reports.png',               label: 'Reports' },
  { src: '/testrium/screenshots/help_guide.png',            label: 'Help & Guide' },
]
const activeSlide = ref(0)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
let slideTimer: ReturnType<typeof setInterval> | null = null

function startSlideTimer() {
  slideTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % screenshots.length
  }, 4000)
}
function stopSlideTimer() {
  if (slideTimer) { clearInterval(slideTimer); slideTimer = null }
}
function goSlide(i: number) {
  stopSlideTimer(); activeSlide.value = i; startSlideTimer()
}
function openLightbox(i: number) {
  lightboxIndex.value = i; lightboxOpen.value = true; stopSlideTimer()
}
function closeLightbox() {
  lightboxOpen.value = false; startSlideTimer()
}
function lightboxPrev() { lightboxIndex.value = (lightboxIndex.value - 1 + screenshots.length) % screenshots.length }
function lightboxNext() { lightboxIndex.value = (lightboxIndex.value + 1) % screenshots.length }

// ── Scroll-triggered animations ──────────────────────────────
let observer: IntersectionObserver | null = null
function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer!.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  document
    .querySelectorAll('.feature-card, .check-row, .faq-item, .quickstart-wrapper, .cta-inner')
    .forEach((el) => observer!.observe(el))
}


// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  setupObserver()
  startSlideTimer()
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  observer?.disconnect()
  stopSlideTimer()
})

// ── Data ──────────────────────────────────────────────────────
const features = [
  { icon: '🧪', title: 'Test Case Management',  desc: 'Create and organize test cases with steps, expected results, priorities, and types. Bulk import via Excel or CSV.' },
  { icon: '▶️', title: 'Test Run Execution',     desc: 'Execute tests individually or in bulk. Track real-time progress, record results, comments, and execution time.' },
  { icon: '⚡', title: 'Bulk Operations',        desc: 'Select multiple executions and update their status in one action. Save hours during large test runs.' },
  { icon: '🔗', title: 'JIRA Integration',       desc: 'File bugs directly from failed test executions. Configurable per project with encrypted API token storage.' },
  { icon: '📊', title: 'Reports & Analytics',    desc: 'Generate PDF and Excel reports with charts. Track trends, pass rates, and metrics across projects.' },
  { icon: '🤖', title: 'Automation API',         desc: 'RESTful API for Selenium, RestAssured, Playwright and more. Fetch test data and post results programmatically.' },
  { icon: '🗂️', title: 'Test Data Management',  desc: 'Store environment-specific data (DEV/QA/STAGING/PROD) in KEY_VALUE, JSON, CSV, or XML format.' },
  { icon: '🔒', title: 'Role-Based Access',      desc: 'Admin and User roles with project-level permissions. JWT authentication with BCrypt password encryption.' },
  { icon: '🐳', title: 'Docker Ready',           desc: 'Single Docker image. Full stack — app and database — with one docker compose up. No setup required.' },
]

const comparison = [
  { label: 'Self-hosted',      t: true,  s: true,  x: false },
  { label: 'Free to use',      t: true,  s: true,  x: false },
  { label: 'JIRA Integration', t: true,  s: false, x: true  },
  { label: 'Automation API',   t: true,  s: false, x: true  },
  { label: 'Reports & Charts', t: true,  s: false, x: true  },
  { label: 'Bulk Operations',  t: true,  s: false, x: true  },
  { label: 'Docker Deploy',    t: true,  s: false, x: false },
]

const faqs = [
  { q: '💰 Is Testrium free?',
    a: 'Yes. Testrium is completely free to self-host. There are no per-user fees, no seat limits, and no feature paywalls. You run it on your own infrastructure.' },
  { q: '🔓 Is it open source?',
    a: 'Yes. The full source code is on GitHub. You can inspect it, fork it, and contribute to it.' },
  { q: '👩‍💻 Who is it for?',
    a: 'QA Engineers, QA Managers, Automation Engineers, and Development Teams who want structured test management without expensive SaaS tools.' },
  { q: '☁️ Do I need cloud infrastructure?',
    a: 'No. Testrium runs anywhere Docker runs — your laptop, a local server, or cloud VMs (AWS, Azure, GCP). One image, one command.' },
  { q: '🔒 Is my data safe?',
    a: 'Your data never leaves your infrastructure. No telemetry, no third-party sharing. You own everything.' },
  { q: '🔁 Can I migrate from another tool?',
    a: 'Yes. Import test cases from Excel or CSV using the bulk import feature. Most tools support Excel export, making migration simple.' },
  { q: '📦 How do I update?',
    a: 'Run docker compose pull && docker compose up -d. Your database volume is preserved across updates.' },
  { q: '🧩 Does it integrate with CI/CD?',
    a: 'Yes. Use the Automation API to post test results from any CI/CD pipeline — Jenkins, GitHub Actions, GitLab CI, and more.' },
]

const terminalLines = [
  { prompt: '$', text: 'curl -O https://raw.githubusercontent.com/testrium/testrium/master/docker-compose.yml', comment: false },
  { prompt: '$', text: 'curl -O https://raw.githubusercontent.com/testrium/testrium/master/.env.example', comment: false },
  { prompt: '$', text: 'cp .env.example .env', comment: false },
  { prompt: '$', text: 'docker compose up -d', comment: false },
  { prompt: '',  text: '# Open http://localhost:8080 → login → start testing 🚀', comment: true },
]
</script>

<template>
  <div class="home-wrapper">

    <!-- ═══════════════════════════════════════════════════════
         HERO
    ═══════════════════════════════════════════════════════════ -->
    <section class="section hero-section">
      <div class="blob-field" aria-hidden="true">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
        <div class="blob blob-3" />
      </div>

      <div class="hero-inner">
        <div class="hero-text">
          <div class="hero-badge">Open Source · Self-Hosted · Free</div>
          <h1 class="hero-heading">
            Test Case Management<br>
            <span class="grad-text">Built for QA Teams</span>
          </h1>
          <p class="hero-tagline">
            Plan, execute, and report on your software testing — all in one
            place. Self-hosted, Docker-ready, and free to use.
          </p>
          <div class="hero-actions">
            <a href="/testrium/guide/" class="btn-primary">Get Started →</a>
            <a href="https://github.com/testrium/testrium"
               class="btn-secondary" target="_blank" rel="noopener">
              View on GitHub
            </a>
          </div>
        </div>

        <div
          class="hero-visual"
          :style="{ transform: `translate(${mouseX * 0.35}px, ${mouseY * 0.35}px)` }"
        >
          <div class="hero-glow" aria-hidden="true" />
          <img :src="withBase('/hero.png')" alt="Testrium dashboard" class="hero-img" />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         FEATURES
    ═══════════════════════════════════════════════════════════ -->
    <section class="section features-section">
      <div class="inner">
        <p class="section-label">Everything you need</p>
        <h2 class="section-heading">Nine reasons QA teams choose Testrium</h2>

        <div class="features-grid">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="feature-card"
            :style="{ '--i': i }"
          >
            <span class="card-icon">{{ f.icon }}</span>
            <h3 class="card-title">{{ f.title }}</h3>
            <p class="card-desc">{{ f.desc }}</p>
            <div class="card-border" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         SCREENSHOTS
    ═══════════════════════════════════════════════════════════ -->
    <section class="section screenshots-section">
      <div class="inner">
        <p class="section-label">See it in action</p>
        <h2 class="section-heading">A look inside Testrium</h2>

        <!-- Carousel -->
        <div class="carousel">
          <div class="carousel-track">
            <div
              v-for="(shot, i) in screenshots"
              :key="i"
              class="carousel-slide"
              :class="{ active: activeSlide === i }"
            >
              <div class="shot-frame" @click="openLightbox(i)">
                <img :src="shot.src" :alt="shot.label" class="shot-img" loading="lazy" />
                <div class="shot-overlay">
                  <span class="shot-zoom">🔍 Click to enlarge</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Label -->
          <p class="carousel-label">{{ screenshots[activeSlide].label }}</p>

          <!-- Dots -->
          <div class="carousel-dots">
            <button
              v-for="(_, i) in screenshots"
              :key="i"
              class="dot"
              :class="{ active: activeSlide === i }"
              @click="goSlide(i)"
              :aria-label="`Go to slide ${i + 1}`"
            />
          </div>

          <!-- Arrows -->
          <button class="carousel-arrow left" @click="goSlide((activeSlide - 1 + screenshots.length) % screenshots.length)" aria-label="Previous">&#8592;</button>
          <button class="carousel-arrow right" @click="goSlide((activeSlide + 1) % screenshots.length)" aria-label="Next">&#8594;</button>
        </div>

        <!-- Thumbnails -->
        <div class="thumb-row">
          <button
            v-for="(shot, i) in screenshots"
            :key="i"
            class="thumb"
            :class="{ active: activeSlide === i }"
            @click="goSlide(i)"
          >
            <img :src="shot.src" :alt="shot.label" loading="lazy" />
            <span>{{ shot.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
        <button class="lb-close" @click="closeLightbox" aria-label="Close">✕</button>
        <button class="lb-arrow left" @click="lightboxPrev" aria-label="Previous">&#8592;</button>
        <div class="lb-img-wrap">
          <img :src="screenshots[lightboxIndex].src" :alt="screenshots[lightboxIndex].label" class="lb-img" />
          <p class="lb-label">{{ screenshots[lightboxIndex].label }}</p>
        </div>
        <button class="lb-arrow right" @click="lightboxNext" aria-label="Next">&#8594;</button>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════════
         COMPARISON
    ═══════════════════════════════════════════════════════════ -->
    <section class="section comparison-section">
      <div class="inner">
        <p class="section-label">Why not spreadsheets?</p>
        <h2 class="section-heading">Testrium vs. the alternatives</h2>

        <div class="table-wrap">
          <table class="comp-table">
            <thead>
              <tr>
                <th></th>
                <th><span class="th-brand">Testrium</span></th>
                <th>Spreadsheets</th>
                <th>Heavy SaaS</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in comparison"
                :key="row.label"
                class="check-row"
                :style="{ '--row': i }"
              >
                <td class="row-label">{{ row.label }}</td>
                <td><span :class="['chip', row.t ? 'yes' : 'no']"><span class="tick">{{ row.t ? '✓' : '✕' }}</span></span></td>
                <td><span :class="['chip', row.s ? 'yes' : 'no']"><span class="tick">{{ row.s ? '✓' : '✕' }}</span></span></td>
                <td><span :class="['chip', row.x ? 'yes' : 'no']"><span class="tick">{{ row.x ? '✓' : '✕' }}</span></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         QUICK START
    ═══════════════════════════════════════════════════════════ -->
    <section class="section quickstart-section">
      <div class="inner quickstart-wrapper">
        <p class="section-label">Five commands</p>
        <h2 class="section-heading">Up and running in minutes</h2>
        <p class="section-sub">No account. No credit card. Just Docker.</p>

        <div class="terminal">
          <div class="term-bar" aria-hidden="true">
            <span class="dot red" /><span class="dot yellow" /><span class="dot green" />
            <span class="term-title">bash</span>
          </div>
          <div class="term-body">
            <div
              v-for="(line, i) in terminalLines"
              :key="i"
              class="term-line"
              :style="{ '--li': i }"
            >
              <span v-if="line.prompt" class="t-prompt">{{ line.prompt }}</span>
              <span :class="line.comment ? 't-comment' : 't-cmd'">{{ line.text }}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 36px">
          <a href="/testrium/guide/docker-setup" class="btn-primary">Full Setup Guide →</a>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         FAQ
    ═══════════════════════════════════════════════════════════ -->
    <section class="section faq-section">
      <div class="inner">
        <p class="section-label">Common questions</p>
        <h2 class="section-heading">Frequently asked questions</h2>

        <div class="faq-list">
          <details
            v-for="(item, i) in faqs"
            :key="i"
            class="faq-item"
          >
            <summary class="faq-q">
              <span>{{ item.q }}</span>
              <svg class="chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M4.5 7l4.5 4.5L13.5 7" stroke="currentColor" stroke-width="1.8"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </summary>
            <div class="faq-answer">
              <p>{{ item.a }}</p>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         BOTTOM CTA
    ═══════════════════════════════════════════════════════════ -->
    <section class="section cta-section">
      <div class="blob-field" aria-hidden="true">
        <div class="blob cta-blob-1" />
        <div class="blob cta-blob-2" />
      </div>
      <div class="inner cta-inner">
        <h2 class="cta-heading">Start testing smarter today.</h2>
        <p class="cta-sub">Free. Self-hosted. No limits.</p>
        <div class="cta-btns">
          <a href="/testrium/guide/" class="btn-primary btn-lg">Get Started Free →</a>
          <a href="https://github.com/testrium/testrium"
             class="btn-ghost" target="_blank" rel="noopener">Star on GitHub ★</a>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────── */
.home-wrapper {
  --brand:   #6366f1;
  --brand-2: #8b5cf6;
  --brand-3: #06b6d4;
  overflow-x: hidden;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

/* Full-width breakout */
.section {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  position: relative;
  overflow: hidden;
}

.inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 96px 32px;
}

/* ── Section labels & headings ───────────────────────────────── */
.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 10px;
}

.section-heading {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
}

.section-sub {
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
  margin-bottom: 48px;
}

/* ── Gradient text ───────────────────────────────────────────── */
.grad-text {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 50%, var(--brand-3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══════════════════════════════════════════════════════════════
   BLOBS
═══════════════════════════════════════════════════════════════ */
.blob-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: blobDrift linear infinite;
  will-change: transform;
}
.dark .blob { opacity: 0.18; }

.blob-1 { width: 650px; height: 650px; background: radial-gradient(circle, #6366f1, transparent 70%); top: -220px;  left: -120px;  animation-duration: 20s; }
.blob-2 { width: 500px; height: 500px; background: radial-gradient(circle, #8b5cf6, transparent 70%); top:  80px;   right: -160px; animation-duration: 26s; animation-delay: -7s; }
.blob-3 { width: 420px; height: 420px; background: radial-gradient(circle, #06b6d4, transparent 70%); bottom: -80px; left: 35%;    animation-duration: 30s; animation-delay: -14s; }

.cta-blob-1 { width: 450px; height: 450px; background: radial-gradient(circle, #6366f1, transparent 70%); top: -80px;    left: -60px;  animation-duration: 22s; }
.cta-blob-2 { width: 380px; height: 380px; background: radial-gradient(circle, #8b5cf6, transparent 70%); bottom: -60px; right: 4%;    animation-duration: 28s; animation-delay: -9s; }

@keyframes blobDrift {
  0%   { transform: translate(0px,   0px)   scale(1);    }
  25%  { transform: translate(28px, -22px)  scale(1.06); }
  50%  { transform: translate(-18px, 28px)  scale(0.95); }
  75%  { transform: translate(18px,  18px)  scale(1.08); }
  100% { transform: translate(0px,   0px)   scale(1);    }
}

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
.hero-section {
  background: radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.13) 0%, transparent 70%),
              var(--vp-c-bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 100px 32px 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}
@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; padding: 80px 24px 60px; gap: 48px; }
  .hero-visual { order: -1; }
}

/* Badge */
.hero-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 100px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.28);
  color: var(--brand);
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(16px);
  animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
}

.hero-heading {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0 0 22px;
  opacity: 0;
  transform: translateY(22px);
  animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.22s forwards;
}

.hero-tagline {
  font-size: 1.1rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
  max-width: 480px;
  margin-bottom: 38px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.38s forwards;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.52s forwards;
}

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* Hero visual */
.hero-visual {
  position: relative;
  transition: transform 0.1s ease-out;
  opacity: 0;
  animation: fadeUp 1s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
}

.hero-img {
  width: 100%;
  border-radius: 18px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.18);
  animation: float 6s ease-in-out infinite;
  display: block;
}

.hero-glow {
  position: absolute;
  inset: -24px;
  border-radius: 28px;
  background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.35) 0%, transparent 70%);
  filter: blur(24px);
  z-index: -1;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS
═══════════════════════════════════════════════════════════════ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 13px 26px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  color: #fff !important;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  transition: transform 0.22s, box-shadow 0.22s;
  box-shadow: 0 4px 18px rgba(99,102,241,0.38);
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(99,102,241,0.52); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 13px 26px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1) !important;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
  transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
}
.btn-secondary:hover { transform: translateY(-3px); border-color: var(--brand); box-shadow: 0 4px 18px rgba(99,102,241,0.18); }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1) !important;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.btn-ghost:hover { border-color: var(--brand); color: var(--brand) !important; }

.btn-lg { padding: 16px 36px; font-size: 1.05rem; }

/* ═══════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════ */
.features-section { background: var(--vp-c-bg-alt); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}
@media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .features-grid { grid-template-columns: 1fr; } }

.feature-card {
  position: relative;
  padding: 28px 24px;
  border-radius: 16px;
  background: var(--home-card-bg);
  border: 1px solid var(--home-card-border);
  box-shadow: var(--home-card-shadow);
  backdrop-filter: blur(12px);
  overflow: hidden;
  cursor: default;
  transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
  /* hidden before scroll trigger */
  opacity: 0;
  transform: translateY(36px);
}

.feature-card.is-visible {
  animation: cardIn 0.65s cubic-bezier(0.22,1,0.36,1) calc(var(--i) * 55ms) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(36px); }
  to   { opacity: 1; transform: translateY(0); }
}

.feature-card:hover { transform: translateY(-7px); box-shadow: var(--home-card-hover-shadow); }

/* Animated gradient border on hover */
.card-border {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, var(--brand), var(--brand-2), var(--brand-3), var(--brand));
  background-size: 300% 300%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
  animation: gradSpin 3s linear infinite paused;
  pointer-events: none;
}
.feature-card:hover .card-border { opacity: 1; animation-play-state: running; }

@keyframes gradSpin {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.card-icon  { font-size: 2rem; margin-bottom: 14px; display: block; }
.card-title { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.card-desc  { font-size: 0.875rem; line-height: 1.65; color: var(--vp-c-text-2); }

/* ═══════════════════════════════════════════════════════════════
   SCREENSHOTS
═══════════════════════════════════════════════════════════════ */
.screenshots-section { background: var(--vp-c-bg-alt); }

/* Carousel */
.carousel {
  position: relative;
  margin-top: 48px;
  user-select: none;
}
.carousel-track {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  max-height: 520px;
}
.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}
.carousel-slide.active {
  opacity: 1;
  pointer-events: auto;
}
.shot-frame {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  border: 2px solid var(--home-card-border);
  box-shadow: 0 8px 40px rgba(99,102,241,0.18), 0 2px 8px rgba(0,0,0,0.10);
  overflow: hidden;
  cursor: zoom-in;
  position: relative;
  background: var(--vp-c-bg);
  transition: box-shadow 0.25s, border-color 0.25s;
}
.shot-frame:hover {
  border-color: var(--brand);
  box-shadow: 0 12px 56px rgba(99,102,241,0.28), 0 2px 12px rgba(0,0,0,0.14);
}
.shot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
  transition: transform 0.4s ease;
}
.shot-frame:hover .shot-img { transform: scale(1.015); }
.shot-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99,102,241,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s;
}
.shot-frame:hover .shot-overlay { background: rgba(99,102,241,0.08); }
.shot-zoom {
  opacity: 0;
  background: rgba(99,102,241,0.92);
  color: #fff;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: opacity 0.25s;
}
.shot-frame:hover .shot-zoom { opacity: 1; }

.carousel-label {
  text-align: center;
  margin-top: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-divider);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  padding: 0;
}
.dot.active { background: var(--brand); transform: scale(1.4); }

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--vp-c-bg);
  border: 1px solid var(--home-card-border);
  border-radius: 50%;
  width: 42px;
  height: 42px;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  z-index: 2;
}
.carousel-arrow:hover { background: var(--brand); color: #fff; border-color: var(--brand); transform: translateY(-50%) scale(1.08); }
.carousel-arrow.left { left: -20px; }
.carousel-arrow.right { right: -20px; }

/* Thumbnails */
.thumb-row {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
}
.thumb-row::-webkit-scrollbar { display: none; }
.thumb {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: 2px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  padding: 0;
  width: 130px;
}
.thumb img {
  width: 100%;
  height: 72px;
  object-fit: cover;
  object-position: top;
  display: block;
}
.thumb span {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 4px 0 6px;
}
.thumb.active { border-color: var(--brand); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
.thumb.active span { color: var(--brand); }
.thumb:hover { border-color: var(--brand); }

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.88);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.lb-img-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 90vw;
  max-height: 90vh;
}
.lb-img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 12px;
  border: 2px solid rgba(99,102,241,0.4);
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  object-fit: contain;
}
.lb-label {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
  margin: 0;
}
.lb-close {
  position: fixed;
  top: 20px;
  right: 24px;
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-close:hover { background: rgba(255,255,255,0.25); }
.lb-arrow {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.lb-arrow:hover { background: rgba(99,102,241,0.6); }

@media (max-width: 640px) {
  .carousel-arrow { display: none; }
  .thumb { width: 100px; }
  .thumb img { height: 56px; }
}

/* ═══════════════════════════════════════════════════════════════
   COMPARISON
═══════════════════════════════════════════════════════════════ */
.comparison-section { background: var(--vp-c-bg); }

.table-wrap {
  margin-top: 48px;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.comp-table { width: 100%; border-collapse: collapse; }

.comp-table thead th {
  padding: 16px 20px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}
.comp-table thead th:first-child { text-align: left; }

.th-brand { color: var(--brand); }

.comp-table tbody tr {
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.18s;
}
.comp-table tbody tr:last-child { border-bottom: none; }
.comp-table tbody tr:hover { background: rgba(99,102,241,0.05); }

.row-label { padding: 16px 20px; font-size: 0.9rem; font-weight: 500; text-align: left; }
.comp-table td { padding: 14px 20px; text-align: center; }

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
}
.chip.yes { background: rgba(16,185,129,0.12); color: #10b981; }
.chip.no  { background: rgba(239,68,68,0.1);   color: #ef4444; }

.tick {
  display: inline-block;
  transform: scale(0);
  transition: none;
}
.check-row {
  opacity: 0;
  transform: translateX(-16px);
}
.check-row.is-visible {
  animation: rowIn 0.45s cubic-bezier(0.22,1,0.36,1) calc(var(--row) * 70ms) both;
}
@keyframes rowIn {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
.check-row.is-visible .tick {
  animation: tickPop 0.4s cubic-bezier(0.34,1.56,0.64,1) calc(var(--row) * 70ms + 200ms) both;
}
@keyframes tickPop {
  from { transform: scale(0) rotate(-15deg); }
  to   { transform: scale(1) rotate(0deg); }
}

/* ═══════════════════════════════════════════════════════════════
   QUICK START TERMINAL
═══════════════════════════════════════════════════════════════ */
.quickstart-section { background: var(--vp-c-bg-alt); }

.quickstart-wrapper {
  opacity: 0;
  transform: translateY(24px);
}
.quickstart-wrapper.is-visible {
  animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;
}

.terminal {
  background: var(--home-terminal-bg);
  border-radius: 14px;
  overflow: hidden;
  max-width: 700px;
  box-shadow: 0 28px 72px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
  font-family: 'JetBrains Mono','Fira Code','Consolas',monospace;
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #ffbd2e; }
.dot.green  { background: #28ca42; }

.term-title { margin-left: 8px; font-size: 0.72rem; color: rgba(255,255,255,0.3); letter-spacing: 0.08em; }

.term-body { padding: 20px 24px 24px; }

.term-line {
  display: flex;
  gap: 10px;
  padding: 3px 0;
  font-size: 0.82rem;
  line-height: 1.75;
  opacity: 0;
  animation: termIn 0.3s ease calc(var(--li) * 130ms + 300ms) forwards;
}
@keyframes termIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.t-prompt  { color: #4ade80; user-select: none; min-width: 14px; }
.t-cmd     { color: var(--home-terminal-text); word-break: break-all; }
.t-comment { color: rgba(165,243,252,0.4); }

/* ═══════════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════════ */
.faq-section { background: var(--vp-c-bg); }

.faq-list { max-width: 740px; margin-top: 48px; display: flex; flex-direction: column; gap: 10px; }

.faq-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--home-card-bg);
  backdrop-filter: blur(8px);
  transition: border-color 0.22s, box-shadow 0.22s, opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1);
  opacity: 0;
  transform: translateY(18px);
}
.faq-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.faq-item[open] {
  border-color: var(--brand);
  box-shadow: 0 0 0 1px var(--brand), 0 4px 20px rgba(99,102,241,0.14);
}

.faq-q {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: color 0.18s;
  list-style: none;
}
.faq-q::-webkit-details-marker { display: none; }
.faq-q:hover { color: var(--brand); }

.chevron {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  transition: transform 0.32s cubic-bezier(0.22,1,0.36,1), color 0.18s;
}
.faq-item[open] .chevron { transform: rotate(180deg); color: var(--brand); }

.faq-answer { padding: 0 20px 18px; }
.faq-answer p { margin: 0; font-size: 0.9rem; line-height: 1.72; color: var(--vp-c-text-2); }

/* ═══════════════════════════════════════════════════════════════
   BOTTOM CTA
═══════════════════════════════════════════════════════════════ */
.cta-section { background: var(--vp-c-bg-alt); }

.cta-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 112px 32px;
  opacity: 0;
  transform: translateY(24px);
}
.cta-inner.is-visible {
  animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;
}

.cta-heading {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--brand-3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cta-sub { font-size: 1.1rem; color: var(--vp-c-text-2); margin-bottom: 40px; }

.cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
</style>
