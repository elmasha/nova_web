<template>
  <div class="landing">

    <!-- ============ NAV ============ -->
    <v-app-bar app flat color="white" height="76" class="nav-bar">
      <v-container class="d-flex align-center pa-0">
        <nuxt-link to="/" class="brand">
          <span class="brand-mark">
            <v-icon small color="white">mdi-bridge</v-icon>
          </span>
          <span class="brand-name">No<span class="brand-dot">va</span></span>
        </nuxt-link>

        <v-spacer />

        <nav class="nav-links d-none d-md-flex">
          <a href="#home" class="nav-link">Home</a>
          <a href="#about" class="nav-link">About Us</a>
          <a href="#services" class="nav-link">Services</a>
          <a href="#parents" class="nav-link">For Parents</a>
          <a href="#professionals" class="nav-link">For Professionals</a>
          <a href="#contact" class="nav-link">Contact Us</a>
        </nav>

        <v-btn
          color="accent"
          depressed
          rounded
          large
          class="sign-in-btn ml-4 text-capitalize font-weight-bold"
          to="/login"
        >
          Sign in
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="pa-0">
      <div class="top-spacer" />

      <!-- ============ HERO ============ -->
      <section id="home" class="hero">
        <div class="hero-blob hero-blob-a" />
        <div class="hero-blob hero-blob-b" />

        <v-container class="hero-inner">
          <v-row align="center">
            <v-col cols="12" md="5" class="hero-copy">
              <h1 class="hero-title">
                We Help Families<br />
                Understand Their Child's<br />
                <span class="hero-highlight">Support Needs.</span>
              </h1>

              <div class="hero-ctas mt-6">
                <v-btn color="accent" depressed rounded large class="mr-3 text-capitalize font-weight-bold" to="/login?role=parent">
                  <v-icon left small>mdi-account-arrow-right</v-icon>
                  Get Started
                </v-btn>
                <v-btn outlined color="primary" rounded large class="text-capitalize font-weight-bold" href="#services">
                  <v-icon left small color="secondary">mdi-play-circle</v-icon>
                  Our Services
                </v-btn>
              </div>

              <div class="hero-contact mt-8">
                <div class="contact-item">
                  <div class="contact-icon"><v-icon small color="white">mdi-phone</v-icon></div>
                  <span>+254 700 000 000</span>
                </div>
                <div class="contact-item">
                  <div class="contact-icon"><v-icon small color="white">mdi-email-outline</v-icon></div>
                  <span>hello@nova.co.ke</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="7" class="hero-visual">
              <div class="hero-image-wrap">
                <div class="hero-image-shape" />
                <div class="hero-image">
                  <v-icon size="140" color="#ffffff">mdi-account-group</v-icon>
                  <span class="hero-image-hint">Add your hero photo</span>
                </div>
                <div class="hero-badge">
                  <v-icon color="#ffffff" size="26">mdi-bridge</v-icon>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ ABOUT ============ -->
      <section id="about" class="section about">
        <v-container>
          <div class="section-center">
            <h2 class="section-title">About Nova</h2>
            <p class="section-text">
              A trusted digital platform that helps Kenyan parents and caregivers understand their
              child's developmental needs, connect with verified professionals, arrange assessments,
              and track progress — all in one place. We don't diagnose. We help you find the right
              next step, and the right professional to walk with you.
            </p>
            <v-btn outlined color="primary" rounded class="mt-4 text-capitalize font-weight-bold" href="#services">
              Learn More
            </v-btn>
          </div>
        </v-container>
      </section>

      <!-- ============ SERVICES ============ -->
      <section id="services" class="section services">
        <div class="services-blob" />
        <v-container class="services-inner">
          <div class="section-center mb-10">
            <h2 class="section-title">Our Services</h2>
            <p class="section-text">
              We connect families with the right qualified professionals across Kenya.
              Whether you know the diagnosis or just have a concern, we help you find the right support.
            </p>
          </div>

          <div class="services-grid">
            <div v-for="s in services" :key="s.title" class="service-item">
              <div class="service-icon" :style="{ background: s.bg }">
                <v-icon :color="s.color" size="28">{{ s.icon }}</v-icon>
              </div>
              <div class="service-title">{{ s.title }}</div>
            </div>
          </div>

          <div class="section-center mt-10">
            <v-btn color="accent" depressed rounded large class="mr-3 text-capitalize font-weight-bold" to="/login?role=parent">
              Get Started
            </v-btn>
            <v-btn outlined color="primary" rounded large class="text-capitalize font-weight-bold" to="/login?role=professional">
              Join as a Professional
            </v-btn>
          </div>
        </v-container>
      </section>

      <!-- ============ SPLIT: CHILD SUPPORT ============ -->
      <section id="parents" class="section split">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6" class="split-image-col">
              <div class="split-image-wrap">
                <div class="split-image-shape" />
                <div class="split-image">
                  <v-icon size="120" color="#ffffff">mdi-human-male-child</v-icon>
                  <span class="split-image-hint">Photo of a family</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="split-copy">
              <h2 class="section-title text-left">Support For Every Child</h2>
              <p class="section-text text-left">
                Every child develops at their own pace. Whether you've noticed something
                that concerns you, or you already have a diagnosis, our platform helps
                you navigate the next steps with clarity.
              </p>
              <p class="section-text text-left">
                From assessment to therapy, from school support to progress tracking —
                we bring the pieces together so you can focus on your child.
              </p>
              <div class="mt-6">
                <v-btn color="primary" depressed rounded class="mr-3 text-capitalize font-weight-bold" to="/login?role=parent">
                  Know More
                </v-btn>
                <v-btn color="accent" depressed rounded class="text-capitalize font-weight-bold" href="#professionals">
                  View Pricing
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ STATS ============ -->
      <section class="section stats">
        <v-container>
          <div class="section-center mb-10">
            <h2 class="section-title">Our Impact</h2>
            <p class="section-text">
              We're building the digital support infrastructure for children with disabilities
              and developmental needs across Kenya.
            </p>
          </div>

          <v-row justify="center">
            <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="4">
              <div class="stat-card" :style="{ background: stat.bg }">
                <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <p class="stat-desc">{{ stat.desc }}</p>
                <div class="stat-icon" :style="{ background: stat.color }">
                  <v-icon small color="white">{{ stat.icon }}</v-icon>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ TESTIMONIAL ============ -->
      <section class="section testimonial">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6">
              <h2 class="section-title text-left">What Parents Say</h2>

              <div class="quote-mark">
                <v-icon size="48" color="#a3d9e8">mdi-format-quote-open</v-icon>
              </div>

              <p class="quote-text">
                Before Nova, I spent months trying to figure out which therapist
                my son needed. Within a week, I had an assessment, a clear plan, and a
                therapist who actually understands him. It changed everything for our family.
              </p>

              <div class="quote-author">
                <div class="author-avatar">AW</div>
                <div>
                  <div class="author-name">Alice Wanjiku</div>
                  <div class="author-role">Parent · Nairobi</div>
                </div>
              </div>

              <div class="quote-nav mt-6">
                <v-btn icon small outlined color="primary" class="mr-2">
                  <v-icon small>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn icon small outlined color="primary">
                  <v-icon small>mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="testimonial-image-col">
              <div class="testimonial-image">
                <v-icon size="120" color="#ffffff">mdi-account-heart</v-icon>
                <span class="testimonial-image-hint">Photo of a happy family</span>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ DUAL CARDS ============ -->
      <section id="professionals" class="section dual">
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <div class="dual-card dual-card-purple">
                <div class="dual-image">
                  <v-icon size="80" color="#4a3b8c">mdi-doctor</v-icon>
                </div>
                <div class="dual-copy">
                  <h3 class="dual-title">Join Our Team</h3>
                  <p class="dual-text">
                    Are you a speech therapist, occupational therapist, physiotherapist,
                    psychologist, or special-needs teacher? Reach families who need you.
                  </p>
                  <v-btn color="primary" depressed rounded class="text-capitalize font-weight-bold" to="/login?role=professional">
                    Apply Now
                  </v-btn>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="dual-card dual-card-pink">
                <div class="dual-image">
                  <v-icon size="80" color="#e86a8a">mdi-hand-heart</v-icon>
                </div>
                <div class="dual-copy">
                  <h3 class="dual-title">Make A Referral</h3>
                  <p class="dual-text">
                    Know a family who could benefit? Refer them to Nova and help
                    them find the right support for their child.
                  </p>
                  <v-btn color="primary" depressed rounded class="text-capitalize font-weight-bold" href="#contact">
                    Get Started
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ NEWSLETTER ============ -->
      <section class="section newsletter-wrap">
        <v-container>
          <div class="newsletter">
            <div class="newsletter-left">
              <v-icon size="26" color="#ffffff" class="mr-3">mdi-email-newsletter</v-icon>
              <span class="newsletter-title">Newsletter Sign Up</span>
            </div>

            <div class="newsletter-mid">
              Subscribe to get the latest updates and resources for families.
            </div>

            <div class="newsletter-form">
              <v-text-field
                v-model="email"
                placeholder="Enter your email address"
                dense
                outlined
                hide-details
                rounded
                class="newsletter-input"
              />
              <v-btn icon color="white" class="newsletter-submit">
                <v-icon color="#4a3b8c">mdi-send</v-icon>
              </v-btn>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ============ FOOTER ============ -->
      <footer id="contact" class="site-footer">
        <v-container>
          <v-row>
            <v-col cols="12" md="4" class="footer-col">
              <div class="footer-brand">
                <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
                <span class="footer-brand-name">No<span class="brand-dot">va</span></span>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="2" class="footer-col">
              <div class="footer-info">
                <v-icon small color="#7ec8e3" class="mr-2">mdi-map-marker</v-icon>
                <div>
                  <div class="footer-info-title">Address</div>
                  <div class="footer-info-text">123 Ngong Road<br />Nairobi, Kenya</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3" class="footer-col">
              <div class="footer-info">
                <v-icon small color="#7ec8e3" class="mr-2">mdi-phone</v-icon>
                <div>
                  <div class="footer-info-title">Phone</div>
                  <div class="footer-info-text">+254 700 000 000</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3" class="footer-col">
              <div class="footer-info">
                <v-icon small color="#7ec8e3" class="mr-2">mdi-email-outline</v-icon>
                <div>
                  <div class="footer-info-title">Email</div>
                  <div class="footer-info-text">hello@nova.co.ke</div>
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="footer-divider" />

          <div class="footer-bottom">
            <div class="footer-links">
              <nuxt-link to="/">Home</nuxt-link>
              <nuxt-link to="/about">About Us</nuxt-link>
              <nuxt-link to="/services">Services</nuxt-link>
              <nuxt-link to="/privacy">Privacy</nuxt-link>
              <nuxt-link to="/terms">Terms</nuxt-link>
              <nuxt-link to="/contact">Contact Us</nuxt-link>
            </div>

            <div class="footer-social">
              <a href="#" aria-label="Twitter"><v-icon small>mdi-twitter</v-icon></a>
              <a href="#" aria-label="Facebook"><v-icon small>mdi-facebook</v-icon></a>
              <a href="#" aria-label="LinkedIn"><v-icon small>mdi-linkedin</v-icon></a>
              <a href="#" aria-label="Instagram"><v-icon small>mdi-instagram</v-icon></a>
            </div>
          </div>

          <div class="footer-copy mt-4">
            © {{ year }} Nova. All rights reserved. Not a diagnostic tool.
          </div>
        </v-container>
      </footer>
    </v-main>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      email: '',
      services: [
        { title: 'Speech Therapy',           icon: 'mdi-account-voice',            color: '#4a3b8c', bg: '#e6e0f5' },
        { title: 'Occupational Therapy',     icon: 'mdi-hand-heart',              color: '#e86a8a', bg: '#fce4ec' },
        { title: 'Physiotherapy',            icon: 'mdi-human-handsup',           color: '#4a3b8c', bg: '#e6e0f5' },
        { title: 'Psychology',               icon: 'mdi-brain',                   color: '#56c2d9', bg: '#d9f0f6' },
        { title: 'Special-Needs Education',  icon: 'mdi-school',                  color: '#e86a8a', bg: '#fce4ec' },
        { title: 'Learning Support',         icon: 'mdi-book-open-page-variant',  color: '#56c2d9', bg: '#d9f0f6' },
        { title: 'Parent Coaching',          icon: 'mdi-account-supervisor',      color: '#4a3b8c', bg: '#e6e0f5' }
      ],
      stats: [
        {
          value: '100+',
          label: 'Families Supported',
          desc: 'Parents who have found clarity and support through the platform.',
          color: '#4a3b8c',
          bg: '#e6e0f5',
          icon: 'mdi-account-group'
        },
        {
          value: '50+',
          label: 'Verified Professionals',
          desc: 'Qualified therapists, teachers, and specialists across Kenya.',
          color: '#e86a8a',
          bg: '#fce4ec',
          icon: 'mdi-shield-check'
        },
        {
          value: '5+',
          label: 'Counties Covered',
          desc: 'Expanding access to quality child development support.',
          color: '#56c2d9',
          bg: '#d9f0f6',
          icon: 'mdi-map-marker-multiple'
        }
      ]
    };
  },
  computed: {
    year() {
      return new Date().getFullYear();
    }
  },
  head() {
    return {
      title: 'Nova — Child development support for Kenyan families',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'A trusted platform for Kenyan families to understand their child\'s developmental needs, connect with verified professionals, and track progress.'
        },
        { hid: 'theme-color', name: 'theme-color', content: '#4A3B8C' }
      ]
    };
  }
};
</script>

<style scoped>
/* ============================================================
   GLOBAL
   ============================================================ */
.landing {
  background: #ffffff;
  color: #2c3e50;
  overflow-x: hidden;
}
.top-spacer {
  height: 76px;
}
.section {
  padding: 72px 0;
  position: relative;
}
.section-center {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}
.section-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
  color: #2c3e50;
}
.section-text {
  font-size: 0.98rem;
  line-height: 1.75;
  color: #7f8c8d;
  margin: 0 0 12px;
}
.text-left { text-align: left; }

/* ============================================================
   NAV
   ============================================================ */
.nav-bar {
  border-bottom: 1px solid #f0f0f5 !important;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  display: grid;
  place-items: center;
}
.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.02em;
}
.brand-dot { color: #e86a8a; }
.nav-links {
  display: flex;
  gap: 28px;
  align-items: center;
}
.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #7f8c8d;
  text-decoration: none;
  transition: color 0.15s ease;
}
.nav-link:hover { color: #4a3b8c; }
.sign-in-btn {
  text-transform: capitalize !important;
  letter-spacing: 0 !important;
  padding: 0 22px !important;
  box-shadow: 0 6px 16px rgba(232, 106, 138, 0.35) !important;
}

/* ============================================================
   HERO
   ============================================================ */
.hero {
  position: relative;
  padding: 60px 0 80px;
  overflow: hidden;
}
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.55;
  pointer-events: none;
}
.hero-blob-a {
  width: 500px;
  height: 500px;
  background: #d9f0f6;
  top: -120px;
  right: -100px;
}
.hero-blob-b {
  width: 380px;
  height: 380px;
  background: #fce4ec;
  bottom: -80px;
  left: -80px;
}
.hero-inner {
  position: relative;
  z-index: 2;
}
.hero-title {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
  color: #2c3e50;
}
.hero-highlight {
  color: #4a3b8c;
  display: inline-block;
}
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.hero-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  color: #7f8c8d;
  font-weight: 500;
}
.contact-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4a3b8c;
  display: grid;
  place-items: center;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}
.hero-image-wrap {
  position: relative;
  width: 100%;
  max-width: 520px;
  aspect-ratio: 1 / 1;
}
.hero-image-shape {
  position: absolute;
  inset: -10% -5% 5% 5%;
  background: linear-gradient(135deg, #d9f0f6 0%, #c4b5e8 100%);
  border-radius: 60% 40% 50% 50% / 50% 55% 45% 50%;
  z-index: 1;
}
.hero-image {
  position: absolute;
  inset: 0;
  border-radius: 50% 45% 55% 50% / 50% 50% 55% 45%;
  background: linear-gradient(135deg, #7ec8e3 0%, #a3a0d8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  gap: 8px;
  overflow: hidden;
}
.hero-image-hint {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  opacity: 0.9;
}
.hero-badge {
  position: absolute;
  bottom: 8%;
  right: 4%;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #e86a8a;
  display: grid;
  place-items: center;
  box-shadow: 0 12px 24px rgba(232, 106, 138, 0.45);
  z-index: 3;
}

/* ============================================================
   ABOUT
   ============================================================ */
.about { background: #ffffff; }

/* ============================================================
   SERVICES
   ============================================================ */
.services {
  background: #f3f7fb;
  position: relative;
  overflow: hidden;
}
.services-blob {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: #d9f0f6;
  filter: blur(80px);
  top: -200px;
  left: -200px;
  opacity: 0.7;
  pointer-events: none;
}
.services-inner { position: relative; z-index: 2; }
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 32px 16px;
  max-width: 900px;
  margin: 0 auto;
}
.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
.service-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: transform 0.25s ease;
}
.service-item:hover .service-icon {
  transform: translateY(-4px);
}
.service-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
}

/* ============================================================
   SPLIT
   ============================================================ */
.split { background: #ffffff; }
.split-image-col { display: flex; justify-content: center; }
.split-image-wrap {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1 / 1;
}
.split-image-shape {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #d9f0f6 0%, #fce4ec 100%);
  border-radius: 50% 40% 55% 45% / 55% 50% 50% 45%;
  z-index: 1;
}
.split-image {
  position: absolute;
  inset: 8%;
  border-radius: 50% 40% 55% 45% / 55% 50% 50% 45%;
  background: linear-gradient(135deg, #f48fb1 0%, #7ec8e3 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  gap: 8px;
}
.split-image-hint {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  opacity: 0.9;
}

/* ============================================================
   STATS
   ============================================================ */
.stats { background: #ffffff; }
.stat-card {
  position: relative;
  border-radius: 24px;
  padding: 32px 24px;
  height: 100%;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(44, 62, 80, 0.08);
}
.stat-value {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}
.stat-desc {
  font-size: 0.86rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 20px;
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

/* ============================================================
   TESTIMONIAL
   ============================================================ */
.testimonial { background: #f3f7fb; }
.quote-mark { margin-bottom: 12px; }
.quote-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #4a5568;
  font-style: italic;
  margin: 0 0 24px;
  max-width: 520px;
}
.quote-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a3b8c, #7ec8e3);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
}
.author-name { font-size: 0.95rem; font-weight: 800; color: #2c3e50; }
.author-role { font-size: 0.78rem; color: #95a5a6; margin-top: 2px; }
.quote-nav { display: flex; }
.testimonial-image-col { display: flex; justify-content: center; }
.testimonial-image {
  width: 100%;
  max-width: 460px;
  aspect-ratio: 1 / 1;
  border-radius: 50% 45% 55% 50% / 50% 50% 55% 45%;
  background: linear-gradient(135deg, #7ec8e3 0%, #f48fb1 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.testimonial-image-hint {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  opacity: 0.9;
}

/* ============================================================
   DUAL CARDS
   ============================================================ */
.dual { background: #ffffff; }
.dual-card {
  display: flex;
  gap: 20px;
  border-radius: 20px;
  padding: 24px;
  height: 100%;
  overflow: hidden;
}
.dual-card-purple { background: #e6e0f5; }
.dual-card-pink   { background: #fce4ec; }
.dual-image {
  flex: 0 0 130px;
  height: 130px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  display: grid;
  place-items: center;
}
.dual-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.dual-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
}
.dual-text {
  font-size: 0.86rem;
  line-height: 1.6;
  color: #7f8c8d;
  margin: 0 0 8px;
}
.dual-card .v-btn {
  align-self: flex-start;
  text-transform: capitalize !important;
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
.newsletter-wrap { padding-top: 0; }
.newsletter {
  background: linear-gradient(135deg, #4a3b8c 0%, #56c2d9 100%);
  border-radius: 100px;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 20px 40px rgba(74, 59, 140, 0.3);
  color: #ffffff;
}
.newsletter-left {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}
.newsletter-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}
.newsletter-mid {
  flex: 1 1 260px;
  font-size: 0.86rem;
  color: #ffffff;
  opacity: 0.9;
  font-weight: 500;
  padding-left: 24px;
  border-left: 1px solid rgba(255, 255, 255, 0.25);
  margin-left: 12px;
}
.newsletter-form {
  flex: 0 1 340px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 999px;
  padding: 4px 4px 4px 16px;
  gap: 8px;
  min-width: 240px;
}
.newsletter-input >>> .v-input__slot {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-height: 32px !important;
}
.newsletter-input >>> fieldset { border: none !important; }
.newsletter-submit {
  background: #e86a8a !important;
  color: #ffffff !important;
  flex: 0 0 auto;
}

/* ============================================================
   FOOTER
   ============================================================ */
.site-footer {
  background: #2e2459;
  color: #ffffff;
  padding: 56px 0 24px;
  margin-top: 72px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.footer-brand-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.footer-info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.footer-info-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7ec8e3;
  font-weight: 700;
  margin-bottom: 4px;
}
.footer-info-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.55;
}
.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 40px 0 20px;
}
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.footer-links a {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.15s ease;
}
.footer-links a:hover { color: #f48fb1; }
.footer-social {
  display: flex;
  gap: 10px;
}
.footer-social a {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  color: #ffffff;
  text-decoration: none;
  transition: background 0.2s ease;
}
.footer-social a:hover {
  background: #e86a8a;
  color: #ffffff;
}
.footer-copy {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 960px) {
  .hero-title { font-size: 1.9rem; }
  .hero-visual { margin-top: 40px; }
  .hero-image-wrap { max-width: 380px; }
  .section-title { font-size: 1.6rem; }
  .split-copy { text-align: center; }
  .split-copy .section-title,
  .split-copy .section-text { text-align: center !important; }
  .stat-value { font-size: 2rem; }
  .newsletter { border-radius: 24px; padding: 20px; }
  .newsletter-mid { border-left: none; padding-left: 0; margin-left: 0; }
  .newsletter-form { flex: 1 1 100%; }
  .dual-card { flex-direction: column; }
}

@media (max-width: 599px) {
  .hero-title { font-size: 1.6rem; }
  .section { padding: 48px 0; }
  .section-title { font-size: 1.4rem; }
  .service-icon { width: 68px; height: 68px; }
  .dual-image { flex: 0 0 100%; height: 120px; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
}
</style>