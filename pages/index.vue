<template>
  <div class="landing">

    <!-- ============ NAV ============ -->
    <header class="nav" :class="{ scrolled: scrolled }">
      <div class="nav-inner">
        <nuxt-link to="/" class="brand">
          <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
          <span class="brand-name">No<span class="brand-dot">va</span></span>
        </nuxt-link>

        <nav class="nav-links">
          <a
            v-for="l in navLinks"
            :key="l.href"
            :href="l.href"
            class="nav-link"
            :class="{ active: activeSection === l.id }"
          >{{ l.label }}</a>
        </nav>

        <div class="nav-actions">
          <v-btn
            text
            rounded
            class="nav-signin text-capitalize font-weight-bold"
            to="/login"
          >
            Sign in
          </v-btn>
          <v-btn
            color="accent"
            depressed
            rounded
            class="nav-cta text-capitalize font-weight-bold"
            to="/login?role=parent"
          >
            Get started
          </v-btn>
          <button class="nav-burger" @click="mobileOpen = true" aria-label="Open menu">
            <v-icon color="#4a3b8c">mdi-menu</v-icon>
          </button>
        </div>
      </div>
    </header>

    <!-- ============ MOBILE DRAWER ============ -->
    <transition name="drawer">
      <div v-if="mobileOpen" class="drawer-backdrop" @click.self="mobileOpen = false">
        <aside class="drawer">
          <div class="drawer-head">
            <span class="brand-name">No<span class="brand-dot">va</span></span>
            <button class="drawer-close" @click="mobileOpen = false" aria-label="Close menu">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>
          <a
            v-for="l in navLinks"
            :key="`m-${l.href}`"
            :href="l.href"
            class="drawer-link"
            @click="mobileOpen = false"
          >{{ l.label }}</a>
          <div class="drawer-cta">
            <v-btn block color="accent" depressed rounded class="text-capitalize font-weight-bold mb-2" to="/login?role=parent">
              Get started
            </v-btn>
            <v-btn block outlined rounded class="text-capitalize font-weight-bold" to="/login">
              Sign in
            </v-btn>
          </div>
        </aside>
      </div>
    </transition>

    <main class="main">
      <!-- ============ HERO ============ -->
      <section id="home" class="hero">
        <div class="hero-bg">
          <div class="blob blob-a" />
          <div class="blob blob-b" />
          <div class="blob blob-c" />
        </div>

        <div class="hero-inner">
          <div class="hero-copy reveal" :class="{ in: revealed.home }">
            <span class="hero-eyebrow">
              <span class="dot" />
              Built for Kenyan families
            </span>

            <h1 class="hero-title">
              We help families understand<br />
              their child's
              <span class="hero-highlight">support needs.</span>
            </h1>

            <p class="hero-lede">
              A trusted platform to arrange assessments, connect with verified
              professionals, and track your child's progress — without the guesswork.
            </p>

            <div class="hero-ctas">
              <v-btn color="accent" depressed rounded large class="text-capitalize font-weight-bold cta-primary" to="/login?role=parent">
                <v-icon left small>mdi-account-arrow-right</v-icon>
                Get started
              </v-btn>
              <v-btn outlined rounded large class="text-capitalize font-weight-bold cta-secondary" href="#services">
                <v-icon left small color="secondary">mdi-play-circle-outline</v-icon>
                Explore services
              </v-btn>
            </div>

            <div class="hero-trust">
              <div class="trust-item">
                <v-icon small color="#229954">mdi-shield-check</v-icon>
                <span>Verified professionals only</span>
              </div>
              <div class="trust-item">
                <v-icon small color="#229954">mdi-lock-outline</v-icon>
                <span>Private &amp; encrypted</span>
              </div>
              <div class="trust-item">
                <v-icon small color="#229954">mdi-clock-fast</v-icon>
                <span>Assessments in days, not months</span>
              </div>
            </div>

            <div class="hero-contact">
              <a class="contact-item" href="tel:+254700000000">
                <span class="contact-icon"><v-icon small color="white">mdi-phone</v-icon></span>
                <span>+254 700 000 000</span>
              </a>
              <a class="contact-item" href="mailto:hello@nova.co.ke">
                <span class="contact-icon"><v-icon small color="white">mdi-email-outline</v-icon></span>
                <span>hello@nova.co.ke</span>
              </a>
            </div>
          </div>

          <div class="hero-visual reveal" :class="{ in: revealed.home }">
            <div class="hero-image-wrap">
              <div class="hero-image">
                <v-icon size="120" color="#ffffff">mdi-account-group</v-icon>
                <span class="hero-image-hint">Add your hero photo</span>
              </div>

              <div class="hero-badge hero-badge-a">
                <v-icon small color="#4a3b8c">mdi-star</v-icon>
                <span>4.9 average</span>
              </div>
              <div class="hero-badge hero-badge-b">
                <v-icon small color="#229954">mdi-check-circle</v-icon>
                <span>50+ verified pros</span>
              </div>
              <div class="hero-mark">
                <v-icon color="#ffffff" size="24">mdi-bridge</v-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ ABOUT ============ -->
      <section id="about" class="section about">
        <div class="section-inner narrow reveal" :class="{ in: revealed.about }">
          <span class="section-eyebrow">About Nova</span>
          <h2 class="section-title">A calmer path from concern to care.</h2>
          <p class="section-text">
            Nova is a trusted digital platform that helps Kenyan parents and caregivers
            understand their child's developmental needs, connect with verified
            professionals, arrange assessments, and track progress — all in one place.
            We don't diagnose. We help you find the right next step, and the right
            professional to walk with you.
          </p>
          <div class="about-chips">
            <span class="chip">No diagnosis needed</span>
            <span class="chip">Verified professionals</span>
            <span class="chip">Everything in one place</span>
          </div>
          <v-btn outlined color="primary" rounded class="mt-6 text-capitalize font-weight-bold" href="#services">
            Learn more
          </v-btn>
        </div>
      </section>

      <!-- ============ SERVICES ============ -->
      <section id="services" class="section services">
        <div class="services-blob" />
        <div class="section-inner">
          <div class="section-center reveal" :class="{ in: revealed.services }">
            <span class="section-eyebrow">Our services</span>
            <h2 class="section-title">Support across every stage.</h2>
            <p class="section-text">
              We connect families with qualified professionals across Kenya. Whether
              you know the diagnosis or just have a concern, we help you find the
              right support.
            </p>
          </div>

          <div class="services-grid">
            <div
              v-for="(s, i) in services"
              :key="s.title"
              class="service-card reveal"
              :class="{ in: revealed.services }"
              :style="{ transitionDelay: `${i * 60}ms` }"
            >
              <div class="service-icon" :style="{ background: s.bg, color: s.color }">
                <v-icon :color="s.color" size="28">{{ s.icon }}</v-icon>
              </div>
              <div class="service-title">{{ s.title }}</div>
              <div class="service-hint">{{ s.hint }}</div>
            </div>
          </div>

          <div class="section-center cta-row">
            <v-btn color="accent" depressed rounded large class="mr-3 text-capitalize font-weight-bold" to="/login?role=parent">
              Get started
            </v-btn>
            <v-btn outlined color="primary" rounded large class="text-capitalize font-weight-bold" to="/login?role=professional">
              Join as a professional
            </v-btn>
          </div>
        </div>
      </section>

      <!-- ============ SPLIT ============ -->
      <section id="parents" class="section split">
        <div class="section-inner">
          <div class="split-grid">
            <div class="split-visual reveal" :class="{ in: revealed.parents }">
              <div class="split-image-wrap">
                <div class="split-image">
                  <v-icon size="100" color="#ffffff">mdi-human-male-child</v-icon>
                  <span class="split-image-hint">Photo of a family</span>
                </div>
                <div class="split-float">
                  <v-icon small color="#4a3b8c">mdi-calendar-check</v-icon>
                  <div>
                    <div class="split-float-title">Assessment booked</div>
                    <div class="split-float-sub">in under 5 minutes</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="split-copy reveal" :class="{ in: revealed.parents }">
              <span class="section-eyebrow">For parents</span>
              <h2 class="section-title text-left">Support for every child.</h2>
              <p class="section-text text-left">
                Every child develops at their own pace. Whether you've noticed something
                that concerns you, or you already have a diagnosis, our platform helps
                you navigate the next steps with clarity.
              </p>
              <p class="section-text text-left">
                From assessment to therapy, from school support to progress tracking —
                we bring the pieces together so you can focus on your child.
              </p>

              <ul class="split-list">
                <li v-for="f in parentFeatures" :key="f">
                  <v-icon small color="#229954">mdi-check-circle</v-icon>
                  <span>{{ f }}</span>
                </li>
              </ul>

              <div class="split-ctas">
                <v-btn color="primary" depressed rounded class="mr-3 text-capitalize font-weight-bold" to="/login?role=parent">
                  Know more
                </v-btn>
                <v-btn color="accent" depressed rounded class="text-capitalize font-weight-bold" href="#professionals">
                  View pricing
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ STATS ============ -->
      <section id="stats" class="section stats">
        <div class="section-inner">
          <div class="section-center reveal" :class="{ in: revealed.stats }">
            <span class="section-eyebrow">Our impact</span>
            <h2 class="section-title">Building the support infrastructure.</h2>
            <p class="section-text">
              We're building the digital support infrastructure for children with
              disabilities and developmental needs across Kenya.
            </p>
          </div>

          <div class="stats-grid">
            <div
              v-for="(stat, i) in stats"
              :key="stat.label"
              class="stat-card reveal"
              :class="{ in: revealed.stats }"
              :style="{ background: stat.bg, transitionDelay: `${i * 80}ms` }"
            >
              <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <p class="stat-desc">{{ stat.desc }}</p>
              <div class="stat-icon" :style="{ background: stat.color }">
                <v-icon small color="white">{{ stat.icon }}</v-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ TESTIMONIAL ============ -->
      <section id="testimonial" class="section testimonial">
        <div class="section-inner">
          <div class="testimonial-grid">
            <div class="testimonial-copy reveal" :class="{ in: revealed.testimonial }">
              <span class="section-eyebrow">What parents say</span>
              <h2 class="section-title text-left">Real stories, real progress.</h2>

              <div class="quote-mark">
                <v-icon size="44" color="#a3d9e8">mdi-format-quote-open</v-icon>
              </div>

              <transition name="fade-quote" mode="out-in">
                <div :key="activeQuote">
                  <p class="quote-text">{{ quotes[activeQuote].text }}</p>
                  <div class="quote-author">
                    <div class="author-avatar">{{ initialsOf(quotes[activeQuote].name) }}</div>
                    <div>
                      <div class="author-name">{{ quotes[activeQuote].name }}</div>
                      <div class="author-role">{{ quotes[activeQuote].role }}</div>
                    </div>
                  </div>
                </div>
              </transition>

              <div class="quote-nav">
                <button class="quote-nav-btn" @click="prevQuote" aria-label="Previous quote">
                  <v-icon small>mdi-arrow-left</v-icon>
                </button>
                <div class="quote-dots">
                  <span
                    v-for="(q, i) in quotes"
                    :key="`dot-${i}`"
                    class="quote-dot"
                    :class="{ active: i === activeQuote }"
                    @click="activeQuote = i"
                  />
                </div>
                <button class="quote-nav-btn" @click="nextQuote" aria-label="Next quote">
                  <v-icon small>mdi-arrow-right</v-icon>
                </button>
              </div>
            </div>

            <div class="testimonial-visual reveal" :class="{ in: revealed.testimonial }">
              <div class="testimonial-image">
                <v-icon size="100" color="#ffffff">mdi-account-heart</v-icon>
                <span class="testimonial-image-hint">Photo of a happy family</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ REFERRAL ============ -->
      <section id="professionals" class="section referral">
        <div class="section-inner">
          <div class="referral-wrap reveal" :class="{ in: revealed.dual }">
            <div class="referral-card">
              <div class="referral-visual">
                <div class="referral-icon">
                  <v-icon size="64" color="#ffffff">mdi-hand-heart</v-icon>
                </div>
                <div class="referral-pulse" />
              </div>

              <div class="referral-copy">
                <span class="section-eyebrow">Spread the word</span>
                <h3 class="referral-title">Make a referral</h3>
                <p class="referral-text">
                  Know a family who could benefit from Nova? Refer them and help
                  them find the right support for their child — an assessment,
                  a therapist, or just a clearer next step.
                </p>

                <ul class="referral-points">
                  <li>
                    <v-icon small color="#229954">mdi-check-circle</v-icon>
                    <span>Free for the family you refer</span>
                  </li>
                  <li>
                    <v-icon small color="#229954">mdi-check-circle</v-icon>
                    <span>They get priority scheduling</span>
                  </li>
                  <li>
                    <v-icon small color="#229954">mdi-check-circle</v-icon>
                    <span>You help a family take the first step</span>
                  </li>
                </ul>

                <div class="referral-ctas">
                  <v-btn color="primary" depressed rounded large class="text-capitalize font-weight-bold" href="#contact">
                    <v-icon left small>mdi-account-plus-outline</v-icon>
                    Refer a family
                  </v-btn>
                  <v-btn outlined color="primary" rounded large class="text-capitalize font-weight-bold" to="/login?role=professional">
                    Join as a professional
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ NEWSLETTER ============ -->
      <section class="section newsletter-wrap">
        <div class="section-inner">
          <div class="newsletter">
            <div class="newsletter-left">
              <div class="newsletter-icon"><v-icon small color="white">mdi-email-newsletter</v-icon></div>
              <div>
                <div class="newsletter-title">Newsletter sign up</div>
                <div class="newsletter-sub">Resources and updates for families</div>
              </div>
            </div>

            <div class="newsletter-form">
              <input
                v-model.trim="email"
                type="email"
                placeholder="Enter your email address"
                class="newsletter-input"
                :disabled="newsletterState === 'loading'"
                @keyup.enter="submitNewsletter"
              />
              <button
                class="newsletter-submit"
                :disabled="newsletterState === 'loading' || !emailValid"
                @click="submitNewsletter"
                aria-label="Subscribe"
              >
                <v-icon small color="#ffffff" v-if="newsletterState !== 'loading'">mdi-send</v-icon>
                <v-progress-circular v-else indeterminate size="16" width="2" color="#ffffff" />
              </button>
            </div>

            <transition name="fade-quote">
              <div v-if="newsletterMsg" class="newsletter-msg" :class="newsletterState">
                {{ newsletterMsg }}
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- ============ FOOTER ============ -->
      <footer id="contact" class="site-footer">
        <div class="section-inner">
          <div class="footer-grid">
            <div class="footer-col footer-col-brand">
              <div class="footer-brand">
                <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
                <span class="footer-brand-name">No<span class="brand-dot">va</span></span>
              </div>
              <p class="footer-blurb">
                A trusted platform helping Kenyan families understand their child's
                developmental needs and find the right support.
              </p>
              <div class="footer-social">
                <a v-for="s in socials" :key="s.icon" :href="s.href" :aria-label="s.label">
                  <v-icon small>{{ s.icon }}</v-icon>
                </a>
              </div>
            </div>

            <div class="footer-col">
              <div class="footer-info-title">Address</div>
              <div class="footer-info-text">123 Ngong Road<br />Nairobi, Kenya</div>
            </div>

            <div class="footer-col">
              <div class="footer-info-title">Phone</div>
              <a class="footer-info-text" href="tel:+254700000000">+254 700 000 000</a>
            </div>

            <div class="footer-col">
              <div class="footer-info-title">Email</div>
              <a class="footer-info-text" href="mailto:hello@nova.co.ke">hello@nova.co.ke</a>
            </div>
          </div>

          <div class="footer-divider" />

          <div class="footer-bottom">
            <div class="footer-links">
              <nuxt-link to="/">Home</nuxt-link>
              <nuxt-link to="/about">About</nuxt-link>
              <nuxt-link to="/services">Services</nuxt-link>
              <nuxt-link to="/privacy">Privacy</nuxt-link>
              <nuxt-link to="/terms">Terms</nuxt-link>
              <nuxt-link to="/contact">Contact</nuxt-link>
            </div>
            <div class="footer-copy">
              © {{ year }} Nova. All rights reserved. Not a diagnostic tool.
            </div>
          </div>
        </div>
      </footer>

      <transition name="fade-quote">
        <button v-if="scrolled" class="to-top" @click="scrollTop" aria-label="Back to top">
          <v-icon small color="#4a3b8c">mdi-arrow-up</v-icon>
        </button>
      </transition>
    </main>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',

  data() {
    return {
      email: '',
      scrolled: false,
      mobileOpen: false,
      activeSection: 'home',
      activeQuote: 0,
      newsletterState: '',
      newsletterMsg: '',

      navLinks: [
        { id: 'home',          href: '#home',          label: 'Home' },
        { id: 'about',         href: '#about',         label: 'About Us' },
        { id: 'services',      href: '#services',      label: 'Services' },
        { id: 'parents',       href: '#parents',       label: 'For Parents' },
        { id: 'professionals', href: '#professionals', label: 'For Professionals' },
        { id: 'contact',       href: '#contact',       label: 'Contact Us' }
      ],

      revealed: {
        home: false, about: false, services: false,
        parents: false, stats: false, testimonial: false, dual: false
      },

      services: [
        { title: 'Speech Therapy',          hint: 'Communication & language', icon: 'mdi-account-voice',           color: '#4a3b8c', bg: '#e6e0f5' },
        { title: 'Occupational Therapy',    hint: 'Daily living skills',      icon: 'mdi-hand-heart',              color: '#e86a8a', bg: '#fce4ec' },
        { title: 'Physiotherapy',           hint: 'Movement & mobility',      icon: 'mdi-human-handsup',           color: '#4a3b8c', bg: '#e6e0f5' },
        { title: 'Psychology',              hint: 'Emotional wellbeing',      icon: 'mdi-brain',                   color: '#56c2d9', bg: '#d9f0f6' },
        { title: 'Special-Needs Education', hint: 'Learning support',         icon: 'mdi-school',                  color: '#e86a8a', bg: '#fce4ec' },
        { title: 'Learning Support',        hint: 'Reading & numeracy',       icon: 'mdi-book-open-page-variant',  color: '#56c2d9', bg: '#d9f0f6' },
        { title: 'Parent Coaching',         hint: 'Guidance at home',         icon: 'mdi-account-supervisor',      color: '#4a3b8c', bg: '#e6e0f5' }
      ],

      parentFeatures: [
        'No diagnosis needed to start',
        'Verified professionals only',
        "Track your child's progress",
        'Everything in one place'
      ],

      stats: [
        {
          value: '100+',
          label: 'Families supported',
          desc: 'Parents who have found clarity and support through the platform.',
          color: '#4a3b8c',
          bg: '#e6e0f5',
          icon: 'mdi-account-group'
        },
        {
          value: '50+',
          label: 'Verified professionals',
          desc: 'Qualified therapists, teachers, and specialists across Kenya.',
          color: '#e86a8a',
          bg: '#fce4ec',
          icon: 'mdi-shield-check'
        },
        {
          value: '5+',
          label: 'Counties covered',
          desc: 'Expanding access to quality child development support.',
          color: '#56c2d9',
          bg: '#d9f0f6',
          icon: 'mdi-map-marker-multiple'
        }
      ],

      quotes: [
        {
          text: 'Before Nova, I spent months trying to figure out which therapist my son needed. Within a week, I had an assessment, a clear plan, and a therapist who actually understands him. It changed everything for our family.',
          name: 'Alice Wanjiku',
          role: 'Parent · Nairobi'
        },
        {
          text: 'The assessment process was calm and clear. For the first time I felt like someone was actually listening — and the plan we got was something I could act on the same week.',
          name: 'Peter Otieno',
          role: 'Parent · Kisumu'
        },
        {
          text: 'As a professional, Nova has given me a steady stream of families who genuinely need my skills. The scheduling and payouts are handled for me, so I can focus on the work.',
          name: 'Dr. Grace Mwangi',
          role: 'Speech therapist · Mombasa'
        }
      ],

      socials: [
        { label: 'Twitter',   icon: 'mdi-twitter',   href: '#' },
        { label: 'Facebook',  icon: 'mdi-facebook',  href: '#' },
        { label: 'LinkedIn',  icon: 'mdi-linkedin',  href: '#' },
        { label: 'Instagram', icon: 'mdi-instagram', href: '#' }
      ]
    };
  },

  computed: {
    year() { return new Date().getFullYear(); },
    emailValid() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email); }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('scroll', this.trackSection, { passive: true });
    this.setupReveals();
    this.trackSection();

    this._revealFallback = setTimeout(() => {
      Object.keys(this.revealed).forEach((k) => (this.revealed[k] = true));
    }, 1200);
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('scroll', this.trackSection);
    if (this._io) this._io.disconnect();
    if (this._revealFallback) clearTimeout(this._revealFallback);
  },

  head() {
    return {
      title: 'Nova — Child development support for Kenyan families',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: "A trusted platform for Kenyan families to understand their child's developmental needs, connect with verified professionals, and track progress."
        },
        { hid: 'theme-color', name: 'theme-color', content: '#4A3B8C' }
      ]
    };
  },

  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 8;
    },

    trackSection() {
      const ids = this.navLinks.map((l) => l.id);
      const scrollY = window.scrollY + 120;
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      this.activeSection = current;
    },

    setupReveals() {
      if (typeof IntersectionObserver === 'undefined') {
        Object.keys(this.revealed).forEach((k) => (this.revealed[k] = true));
        return;
      }

      const map = {
        home: 'home',
        about: 'about',
        services: 'services',
        parents: 'parents',
        stats: 'stats',
        testimonial: 'testimonial',
        professionals: 'dual'
      };

      this._io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const key = map[e.target.id];
            if (key) this.$set(this.revealed, key, true);
            this._io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

      this.$nextTick(() => {
        Object.keys(map).forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;

          this._io.observe(el);

          const r = el.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          if (r.top < vh && r.bottom > 0) {
            const key = map[id];
            if (key) this.$set(this.revealed, key, true);
          }
        });
      });
    },

    initialsOf(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },

    prevQuote() {
      this.activeQuote = (this.activeQuote - 1 + this.quotes.length) % this.quotes.length;
    },
    nextQuote() {
      this.activeQuote = (this.activeQuote + 1) % this.quotes.length;
    },

    async submitNewsletter() {
      if (this.newsletterState === 'loading') return;
      if (!this.emailValid) {
        this.newsletterState = 'error';
        this.newsletterMsg = 'Please enter a valid email address.';
        return;
      }
      this.newsletterState = 'loading';
      this.newsletterMsg = '';
      try {
        // await this.$axios.post('/api/newsletter', { email: this.email });
        await new Promise((r) => setTimeout(r, 600));
        this.newsletterState = 'success';
        this.newsletterMsg = "Thanks — you're on the list.";
        this.email = '';
        setTimeout(() => { this.newsletterMsg = ''; this.newsletterState = ''; }, 4000);
      } catch (e) {
        this.newsletterState = 'error';
        this.newsletterMsg = 'Something went wrong. Please try again.';
      }
    },

    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>
/* ============================================================
   GLOBAL
   ============================================================ */
.landing {
  --purple: #4a3b8c;
  --purple-2: #5b4b9e;
  --teal: #56c2d9;
  --pink: #e86a8a;
  --ink: #1f2a37;
  --muted: #7f8c8d;
  --line: #eef0f5;
  --bg: #ffffff;
  --bg-2: #f3f7fb;
  --radius: 20px;
  --shadow-1: 0 2px 8px -3px rgba(44, 62, 80, 0.08);
  --shadow-2: 0 16px 40px -22px rgba(74, 59, 140, 0.35);
  --shadow-3: 0 28px 56px -28px rgba(15, 13, 36, 0.4);
  background: var(--bg);
  color: var(--ink);
  overflow-x: hidden;
}

.main { padding-top: 76px; }
@media (max-width: 599px) { .main { padding-top: 64px; } }

.section { padding: 96px 0; position: relative; }
@media (max-width: 959px) { .section { padding: 72px 0; } }
@media (max-width: 599px) { .section { padding: 56px 0; } }

.section-inner { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
@media (min-width: 960px) { .section-inner { padding: 0 48px; } }
.section-inner.narrow { max-width: 780px; text-align: center; }
.section-center { text-align: center; max-width: 760px; margin: 0 auto; }

.section-eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--purple);
  background: rgba(74, 59, 140, 0.08);
  padding: 6px 12px;
  border-radius: 999px;
  margin-bottom: 18px;
}
.section-title {
  font-size: clamp(1.6rem, 3.2vw, 2.3rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.18;
  margin: 0 0 16px;
  color: var(--ink);
}
.section-text {
  font-size: 1.03rem;
  line-height: 1.8;
  color: var(--muted);
  margin: 0 0 14px;
}
.text-left { text-align: left; }

.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1),
              transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reveal.in { opacity: 1; transform: translateY(0); }

/* ============================================================
   NAV
   ============================================================ */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding-top: env(safe-area-inset-top, 0);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.nav.scrolled { border-bottom-color: var(--line); box-shadow: 0 12px 32px -24px rgba(44, 62, 80, 0.4); }

.nav-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
  height: 76px;
  display: flex;
  align-items: center;
  gap: 20px;
}
@media (min-width: 960px) { .nav-inner { padding: 0 48px; } }

.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; flex: 0 0 auto; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 11px;
  background: linear-gradient(135deg, var(--purple), var(--teal));
  display: grid; place-items: center;
  box-shadow: 0 8px 18px -8px rgba(74, 59, 140, 0.65);
}
.brand-name { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
.brand-dot { color: var(--pink); }

.nav-links {
  display: flex; gap: 26px; align-items: center;
  margin-left: auto; margin-right: 16px;
}
.nav-link {
  font-size: 14px; font-weight: 600; color: var(--muted);
  text-decoration: none; position: relative; padding: 6px 0;
  transition: color 0.15s ease;
}
.nav-link::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; border-radius: 2px;
  background: linear-gradient(90deg, var(--purple), var(--teal));
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.nav-link:hover { color: var(--purple); }
.nav-link:hover::after,
.nav-link.active::after { transform: scaleX(1); }
.nav-link.active { color: var(--purple); }

.nav-actions { display: flex; align-items: center; gap: 8px; }
.nav-signin { color: var(--ink) !important; text-transform: capitalize !important; letter-spacing: 0 !important; }
.nav-cta {
  text-transform: capitalize !important; letter-spacing: 0 !important;
  padding: 0 20px !important;
  box-shadow: 0 10px 22px -12px rgba(232, 106, 138, 0.7) !important;
}
.nav-burger {
  display: none;
  width: 42px; height: 42px; border-radius: 12px;
  background: #f7f5ff;
  border: 1px solid #e9e4f8;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.nav-burger:hover { background: #efeaf9; border-color: #d9d2ec; }

@media (max-width: 959px) {
  .nav-links { display: none; }
  .nav-burger { display: inline-flex; }
  .nav-actions { margin-left: auto; }
}

@media (max-width: 599px) {
  .nav-inner {
    padding: 0 16px;
    height: 64px;
    gap: 0;
    justify-content: space-between;
  }
  .brand { margin-right: auto; }
  .brand-name { font-size: 18px; }
  .brand-mark { width: 32px; height: 32px; border-radius: 10px; }
  .nav-cta, .nav-signin { display: none !important; }
  .nav-burger { margin-left: 0; }
}

/* ============================================================
   MOBILE DRAWER
   ============================================================ */
.drawer-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(15, 13, 36, 0.5);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; justify-content: flex-end;
}
.drawer {
  width: min(340px, 88vw); height: 100%;
  background: #fff;
  padding: calc(22px + env(safe-area-inset-top, 0)) 22px calc(32px + env(safe-area-inset-bottom, 0));
  display: flex; flex-direction: column; gap: 6px;
  box-shadow: -24px 0 60px -30px rgba(15, 13, 36, 0.5);
  overflow-y: auto;
}
.drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px;
}
.drawer-close {
  width: 34px; height: 34px; border-radius: 10px;
  border: 1px solid var(--line); background: transparent; cursor: pointer;
}
.drawer-link {
  padding: 14px 4px; font-size: 1rem; font-weight: 700;
  color: var(--ink); text-decoration: none;
  border-bottom: 1px solid var(--line);
}
.drawer-link:hover { color: var(--purple); }
.drawer-cta { margin-top: 22px; display: flex; flex-direction: column; }
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.drawer-enter, .drawer-leave-to { opacity: 0; }
.drawer-enter .drawer, .drawer-leave-to .drawer { transform: translateX(24px); }

/* ============================================================
   HERO  (unchanged)
   ============================================================ */
.hero {
  position: relative;
  padding: 72px 0 96px;
  overflow: hidden;
}
@media (max-width: 599px) { .hero { padding: 40px 0 72px; } }

.hero-bg { position: absolute; inset: 0; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.65; }
.blob-a { width: 520px; height: 520px; background: #d9f0f6; top: -180px; right: -120px; }
.blob-b { width: 420px; height: 420px; background: #fce4ec; bottom: -140px; left: -140px; }
.blob-c { width: 340px; height: 340px; background: #e6e0f5; top: 30%; right: 25%; opacity: 0.45; }

.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 72px;
  align-items: center;
}
@media (min-width: 960px) { .hero-inner { padding: 0 48px; } }
@media (max-width: 959px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  .hero-copy { display: flex; flex-direction: column; align-items: center; }
  .hero-ctas { justify-content: center; }
  .hero-trust { justify-content: center; }
  .hero-contact { justify-content: center; }
}

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.72rem; font-weight: 800;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--purple);
  background: rgba(74, 59, 140, 0.08);
  padding: 7px 12px; border-radius: 999px;
  margin-bottom: 20px;
}
.hero-eyebrow .dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.2);
}

.hero-title {
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin: 0 0 22px;
  max-width: 620px;
}
@media (max-width: 959px) { .hero-title { max-width: 700px; } }

.hero-highlight {
  background: linear-gradient(135deg, var(--purple), var(--teal));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-lede {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--muted);
  max-width: 560px;
  margin: 0 0 30px;
}

.hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
.cta-primary {
  box-shadow: 0 14px 30px -14px rgba(232, 106, 138, 0.8) !important;
}
.cta-secondary { border-color: rgba(74, 59, 140, 0.25) !important; }

.hero-trust {
  display: flex; flex-wrap: wrap; gap: 20px;
  margin-top: 28px;
}
.trust-item {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.85rem; font-weight: 600; color: #4a5568;
}

.hero-contact {
  display: flex; flex-wrap: wrap; gap: 20px; margin-top: 28px;
}
.contact-item {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 0.9rem; color: var(--muted); font-weight: 600;
  text-decoration: none; transition: color 0.15s ease;
}
.contact-item:hover { color: var(--purple); }
.contact-icon {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--teal));
  display: grid; place-items: center;
  box-shadow: 0 8px 16px -8px rgba(74, 59, 140, 0.6);
}

.hero-visual { display: flex; justify-content: center; align-items: center; }
.hero-image-wrap {
  position: relative;
  width: 100%;
  max-width: 520px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}
@media (max-width: 599px) { .hero-image-wrap { max-width: 320px; } }

.hero-image {
  position: absolute; inset: 0;
  border-radius: 50% 45% 55% 50% / 50% 50% 55% 45%;
  background: linear-gradient(135deg, #7ec8e3 0%, #a3a0d8 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 2; gap: 10px; overflow: hidden;
  box-shadow: 0 30px 60px -30px rgba(74, 59, 140, 0.5);
}
.hero-image-hint { font-size: 12px; color: #fff; font-weight: 600; opacity: 0.9; }

.hero-mark {
  position: absolute; bottom: 4%; right: 2%;
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--pink));
  display: grid; place-items: center;
  box-shadow: 0 16px 30px -14px rgba(74, 59, 140, 0.8);
  z-index: 3;
}
.hero-badge {
  position: absolute; z-index: 3;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 999px;
  background: #fff; font-size: 0.78rem; font-weight: 800;
  color: var(--ink);
  box-shadow: 0 18px 34px -18px rgba(15, 13, 36, 0.45);
}
.hero-badge-a { top: 8%; left: -4%; }
.hero-badge-b { bottom: 16%; left: -3%; }

@media (max-width: 959px) {
  .hero-badge-a { left: 0; }
  .hero-badge-b { left: 0; }
}
@media (max-width: 599px) {
  .hero-mark { width: 54px; height: 54px; }
  .hero-badge { padding: 8px 12px; font-size: 0.72rem; }
}

/* ============================================================
   ABOUT
   ============================================================ */
.about { background: var(--bg); }
.about-chips {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 8px; margin-top: 20px;
}
.chip {
  font-size: 0.78rem; font-weight: 700;
  color: var(--purple);
  background: rgba(74, 59, 140, 0.08);
  padding: 8px 14px; border-radius: 999px;
}

/* ============================================================
   SERVICES
   ============================================================ */
.services { background: var(--bg-2); overflow: hidden; }
.services-blob {
  position: absolute; width: 620px; height: 620px;
  border-radius: 50%; background: #d9f0f6;
  filter: blur(90px); top: -240px; left: -240px;
  opacity: 0.7; pointer-events: none;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 1100px;
  margin: 48px auto 0;
}
@media (max-width: 599px) {
  .services-grid { grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 32px; }
}
.service-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 28px 22px;
  text-align: center;
  box-shadow: var(--shadow-1);
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
              box-shadow 0.25s ease, border-color 0.25s ease;
}
@media (max-width: 599px) { .service-card { padding: 18px 12px; } }
.service-card:hover {
  transform: translateY(-4px);
  border-color: #d9d2ec;
  box-shadow: 0 24px 44px -24px rgba(74, 59, 140, 0.4);
}
.service-icon {
  width: 64px; height: 64px; border-radius: 18px;
  display: grid; place-items: center;
  margin: 0 auto 16px;
  transition: transform 0.25s ease;
}
@media (max-width: 599px) { .service-icon { width: 52px; height: 52px; border-radius: 14px; } }
.service-card:hover .service-icon { transform: scale(1.06) rotate(-3deg); }
.service-title { font-size: 0.94rem; font-weight: 800; color: var(--ink); margin-bottom: 6px; }
.service-hint { font-size: 0.78rem; color: var(--muted); font-weight: 600; }

.cta-row { margin-top: 48px; }

/* ============================================================
   SPLIT
   ============================================================ */
.split { background: var(--bg); }
.split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 80px;
  align-items: center;
}
@media (max-width: 959px) {
  .split-grid { grid-template-columns: 1fr; gap: 48px; }
  .split-copy { text-align: center; }
  .split-copy .section-title,
  .split-copy .section-text { text-align: center !important; }
  .split-list { justify-content: center; }
  .split-ctas { justify-content: center; }
}

.split-visual { display: flex; justify-content: center; }
.split-image-wrap {
  position: relative; width: 100%; max-width: 460px; aspect-ratio: 1 / 1;
}
.split-image {
  position: absolute; inset: 6%;
  border-radius: 50% 40% 55% 45% / 55% 50% 50% 45%;
  background: linear-gradient(135deg, #f48fb1 0%, #7ec8e3 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 2; gap: 10px;
  box-shadow: 0 30px 60px -30px rgba(232, 106, 138, 0.5);
}
.split-image-hint { font-size: 12px; color: #fff; font-weight: 600; opacity: 0.9; }

.split-float {
  position: absolute; z-index: 3;
  bottom: 6%; right: -4%;
  display: flex; align-items: center; gap: 10px;
  background: #fff; padding: 12px 16px; border-radius: 16px;
  box-shadow: 0 22px 40px -22px rgba(15, 13, 36, 0.45);
}
.split-float-title { font-size: 0.82rem; font-weight: 800; color: var(--ink); }
.split-float-sub { font-size: 0.72rem; color: var(--muted); font-weight: 600; }
@media (max-width: 599px) { .split-float { right: 2%; bottom: 2%; } }

.split-list {
  list-style: none; padding: 0; margin: 22px 0 0;
  display: grid; gap: 12px;
}
.split-list li {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.92rem; font-weight: 600; color: #4a5568;
}
.split-ctas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }

/* ============================================================
   STATS
   ============================================================ */
.stats { background: var(--bg); }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 48px;
}
.stat-card {
  position: relative; border-radius: 24px;
  padding: 32px 28px 28px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 44px -24px rgba(44, 62, 80, 0.22);
}
.stat-value {
  font-size: 2.5rem; font-weight: 900;
  letter-spacing: -0.03em; line-height: 1;
  margin-bottom: 10px;
}
@media (max-width: 599px) { .stat-value { font-size: 2rem; } }
.stat-label {
  font-size: 1rem; font-weight: 800;
  color: var(--ink); margin-bottom: 12px;
}
.stat-desc {
  font-size: 0.88rem; color: var(--muted);
  line-height: 1.65; margin: 0 0 22px;
}
.stat-icon {
  width: 46px; height: 46px; border-radius: 50%;
  display: grid; place-items: center;
}

/* ============================================================
   TESTIMONIAL
   ============================================================ */
.testimonial { background: var(--bg-2); }
.testimonial-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 80px;
  align-items: center;
}
@media (max-width: 959px) {
  .testimonial-grid { grid-template-columns: 1fr; gap: 48px; }
  .testimonial-copy { text-align: center; }
  .testimonial-copy .section-title { text-align: center; }
  .quote-author { justify-content: center; }
  .quote-nav { justify-content: center; }
}

.quote-mark { margin: 12px 0 8px; }
.quote-text {
  font-size: 1.03rem; line-height: 1.85;
  color: #4a5568; font-style: italic;
  margin: 0 0 24px; max-width: 540px;
}
@media (max-width: 959px) {
  .quote-text { margin-left: auto; margin-right: auto; }
}

.quote-author { display: flex; align-items: center; gap: 12px; }
.author-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), #7ec8e3);
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px;
  box-shadow: 0 12px 22px -12px rgba(74, 59, 140, 0.6);
}
.author-name { font-size: 0.95rem; font-weight: 800; color: var(--ink); }
.author-role { font-size: 0.78rem; color: #95a5a6; margin-top: 2px; }

.quote-nav { display: flex; align-items: center; gap: 14px; margin-top: 26px; }
.quote-nav-btn {
  width: 38px; height: 38px; border-radius: 50%;
  border: 1.5px solid var(--line); background: #fff;
  display: grid; place-items: center; cursor: pointer;
  color: var(--purple);
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}
.quote-nav-btn:hover { border-color: var(--purple); background: #f9f8ff; transform: translateY(-1px); }
.quote-dots { display: flex; gap: 6px; }
.quote-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #d4dae4; cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.quote-dot.active { background: var(--purple); transform: scale(1.25); }

.fade-quote-enter-active, .fade-quote-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-quote-enter { opacity: 0; transform: translateY(6px); }
.fade-quote-leave-to { opacity: 0; transform: translateY(-6px); }

.testimonial-visual { display: flex; justify-content: center; }
.testimonial-image {
  width: 100%; max-width: 440px; aspect-ratio: 1 / 1;
  border-radius: 50% 45% 55% 50% / 50% 50% 55% 45%;
  background: linear-gradient(135deg, #7ec8e3 0%, #f48fb1 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px;
  box-shadow: 0 30px 60px -30px rgba(74, 59, 140, 0.5);
}
.testimonial-image-hint { font-size: 12px; color: #fff; font-weight: 600; opacity: 0.9; }

/* ============================================================
   REFERRAL (replaces the old dual cards)
   ============================================================ */
.referral { background: var(--bg); }
.referral-wrap {
  max-width: 980px;
  margin: 0 auto;
}

.referral-card {
  position: relative;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 40px;
  align-items: center;
  padding: 44px 48px;
  border-radius: 32px;
  background: linear-gradient(135deg, #fce4ec 0%, #fdf0f5 45%, #f4eefb 100%);
  border: 1px solid rgba(232, 106, 138, 0.14);
  box-shadow: 0 30px 60px -34px rgba(232, 106, 138, 0.45);
  overflow: hidden;
}
/* Decorative dot pattern */
.referral-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(232, 106, 138, 0.14) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.55;
  pointer-events: none;
  mask-image: radial-gradient(circle at 20% 50%, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle at 20% 50%, black 0%, transparent 70%);
}

.referral-visual {
  position: relative;
  width: 180px; height: 180px;
  justify-self: center;
  display: grid;
  place-items: center;
}
.referral-icon {
  position: relative;
  width: 130px; height: 130px;
  border-radius: 32px;
  background: linear-gradient(135deg, #e86a8a 0%, #f48fb1 100%);
  display: grid; place-items: center;
  box-shadow: 0 24px 48px -18px rgba(232, 106, 138, 0.65);
  z-index: 2;
}
.referral-pulse {
  position: absolute;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.28) 0%, transparent 65%);
  animation: referralPulse 3.6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes referralPulse {
  0%, 100% { transform: scale(1);   opacity: 0.75; }
  50%      { transform: scale(1.08); opacity: 0.45; }
}

.referral-copy {
  position: relative;
  z-index: 2;
  max-width: 620px;
}
.referral-copy .section-eyebrow {
  background: rgba(232, 106, 138, 0.14);
  color: #c04a72;
}
.referral-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin: 0 0 12px;
  line-height: 1.15;
}
.referral-text {
  font-size: 1rem;
  line-height: 1.75;
  color: #4a5568;
  margin: 0 0 20px;
  max-width: 560px;
}

.referral-points {
  list-style: none;
  padding: 0;
  margin: 0 0 26px;
  display: grid;
  gap: 10px;
}
.referral-points li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #4a5568;
}

.referral-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.referral-ctas .v-btn { text-transform: capitalize !important; }

@media (max-width: 959px) {
  .referral-card {
    grid-template-columns: 1fr;
    padding: 36px 32px;
    gap: 28px;
    text-align: center;
  }
  .referral-copy { margin: 0 auto; }
  .referral-points li { justify-content: center; }
  .referral-ctas { justify-content: center; }
  .referral-text { margin-left: auto; margin-right: auto; }
}

@media (max-width: 599px) {
  .referral-card {
    padding: 28px 22px;
    border-radius: 24px;
    gap: 20px;
  }
  .referral-visual { width: 130px; height: 130px; }
  .referral-icon { width: 96px; height: 96px; border-radius: 24px; }
  .referral-icon .v-icon { font-size: 44px !important; }
  .referral-pulse { width: 130px; height: 130px; }
  .referral-title { font-size: 1.35rem; }
  .referral-text { font-size: 0.94rem; }
  .referral-points li { font-size: 0.86rem; }
  .referral-ctas { flex-direction: column; width: 100%; }
  .referral-ctas .v-btn { width: 100%; }
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
.newsletter-wrap { padding-top: 0; padding-bottom: 96px; }
@media (max-width: 599px) { .newsletter-wrap { padding-bottom: 72px; } }
.newsletter {
  position: relative;
  background: linear-gradient(135deg, var(--purple) 0%, var(--teal) 100%);
  border-radius: 28px;
  padding: 24px 32px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 20px;
  box-shadow: 0 26px 50px -22px rgba(74, 59, 140, 0.55);
  color: #fff;
}
.newsletter-left { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; }
.newsletter-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: grid; place-items: center;
}
.newsletter-title { font-size: 1.08rem; font-weight: 800; color: #fff; }
.newsletter-sub { font-size: 0.8rem; color: rgba(255, 255, 255, 0.85); font-weight: 600; margin-top: 2px; }

.newsletter-form {
  flex: 0 1 400px; display: flex; align-items: center;
  background: #fff; border-radius: 999px;
  padding: 6px 6px 6px 20px; gap: 8px; min-width: 260px;
}
.newsletter-input {
  flex: 1; border: none; outline: none;
  background: transparent; font-size: 0.9rem;
  color: var(--ink); font-family: inherit;
  min-width: 0;
}
.newsletter-input::placeholder { color: #95a5a6; }
.newsletter-input:disabled { opacity: 0.6; }
.newsletter-submit {
  width: 42px; height: 42px; border-radius: 50%;
  background: #e86a8a; border: none; cursor: pointer;
  display: grid; place-items: center; flex: 0 0 auto;
  transition: transform 0.15s ease, background 0.15s ease;
}
.newsletter-submit:hover:not(:disabled) { background: #e05575; transform: scale(1.05); }
.newsletter-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.newsletter-msg {
  flex-basis: 100%; text-align: right;
  font-size: 0.82rem; font-weight: 700;
  padding-top: 4px;
}
.newsletter-msg.success { color: #d4f5e0; }
.newsletter-msg.error   { color: #ffd6dc; }
@media (max-width: 599px) {
  .newsletter { border-radius: 24px; padding: 22px; }
  .newsletter-form { flex: 1 1 100%; }
  .newsletter-msg { text-align: left; }
}

/* ============================================================
   FOOTER
   ============================================================ */
.site-footer {
  background: #241c48;
  color: #fff;
  padding: 72px 0 calc(36px + env(safe-area-inset-bottom, 0));
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 48px;
}
@media (max-width: 959px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
@media (max-width: 599px) { .footer-grid { grid-template-columns: 1fr; gap: 28px; } }

.footer-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.footer-brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
.footer-blurb {
  font-size: 0.88rem; color: rgba(255, 255, 255, 0.7);
  line-height: 1.7; margin: 0 0 20px; max-width: 380px;
}
.footer-info-title {
  font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.14em; color: #7ec8e3;
  font-weight: 800; margin-bottom: 10px;
}
.footer-info-text {
  font-size: 0.92rem; color: rgba(255, 255, 255, 0.75);
  line-height: 1.65; text-decoration: none;
}
a.footer-info-text:hover { color: #f48fb1; }

.footer-social { display: flex; gap: 10px; }
.footer-social a {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: grid; place-items: center;
  color: #fff; text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}
.footer-social a:hover { background: var(--pink); transform: translateY(-2px); }

.footer-divider { height: 1px; background: rgba(255, 255, 255, 0.12); margin: 0 0 24px; }
.footer-bottom {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 20px;
}
.footer-links { display: flex; flex-wrap: wrap; gap: 24px; }
.footer-links a {
  color: rgba(255, 255, 255, 0.75); text-decoration: none;
  font-size: 0.86rem; font-weight: 600;
  transition: color 0.15s ease;
}
.footer-links a:hover { color: #f48fb1; }
.footer-copy { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

/* ============================================================
   BACK TO TOP
   ============================================================ */
.to-top {
  position: fixed;
  right: 20px;
  bottom: calc(20px + env(safe-area-inset-bottom, 0));
  z-index: 60;
  width: 44px; height: 44px; border-radius: 50%;
  background: #fff; border: 1px solid var(--line);
  display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 14px 30px -14px rgba(15, 13, 36, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.to-top:hover { transform: translateY(-2px); box-shadow: 0 18px 34px -16px rgba(15, 13, 36, 0.55); }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .section-title { font-size: 1.5rem; }
  .hero-title { font-size: 1.75rem; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
}
</style>