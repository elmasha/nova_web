<<template>
  <div class="auth-page">
    <!-- Ambient Background -->
    <div class="ambient-bg">
      <div class="orb orb-red"></div>
      <div class="orb orb-orange"></div>
      <div class="orb orb-pink"></div>
      <div class="noise-overlay"></div>
    </div>

    <v-container class="fill-height d-flex align-center justify-center relative z-10">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="5">
          
          <!-- Header -->
          <div class="text-center mb-8 logo-reveal">
            <div class="logo-glow mb-4 d-inline-block">
              <v-avatar color="red darken-2" size="64" class="elevation-6">
                <v-icon color="white" size="32">mdi-food-steak</v-icon>
              </v-avatar>
            </div>
            <h1 class="text-h4 font-weight-black white--text tracking-tight">Setup Your Business</h1>
            <p class="text-subtitle-2 grey--text text--lighten-1 mt-2">Let's get your shop ready</p>
          </div>

          <!-- Progress -->
          <div class="d-flex justify-center mb-6">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: step === 1 ? '50%' : '100%' }"></div>
              <div class="progress-step" :class="{ active: step >= 1 }">1</div>
              <div class="progress-step" :class="{ active: step >= 2 }">2</div>
            </div>
          </div>

          <!-- Glass Card -->
          <v-card class="glass-card rounded-3xl overflow-hidden" elevation="0">
            <v-scroll-x-transition mode="out-in">
              
              <!-- Step 1: Business -->
              <div v-if="step === 1" key="business" class="pa-6 pa-sm-8">
                <div class="d-flex align-center mb-6">
                  <v-avatar color="red darken-2" size="40" class="mr-3">
                    <v-icon color="white">mdi-store</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h6 font-weight-bold white--text">Business Details</h2>
                    <p class="text-caption grey--text">Tell us about your company</p>
                  </div>
                </div>

                <v-text-field
                  v-model="business.name"
                  label="Business Name"
                  placeholder="e.g. Prime Cuts Ltd"
                  outlined
                  dark
                  color="red"
                  background-color="rgba(255,255,255,0.03)"
                  class="modern-input rounded-xl mb-4"
                  prepend-inner-icon="mdi-storefront"
                  :rules="[v => !!v || 'Required']"
                />
                <v-text-field
                  v-model="business.owner_name"
                  label="Owner Name"
                  placeholder="Your full name"
                  outlined
                  dark
                  color="red"
                  background-color="rgba(255,255,255,0.03)"
                  class="modern-input rounded-xl mb-4"
                  prepend-inner-icon="mdi-account"
                  :rules="[v => !!v || 'Required']"
                />
                <v-text-field
                  v-model="business.phone"
                  label="Business Phone"
                  placeholder="254712345678"
                  outlined
                  dark
                  color="red"
                  background-color="rgba(255,255,255,0.03)"
                  class="modern-input rounded-xl mb-6"
                  prepend-inner-icon="mdi-phone"
                  :rules="[v => !!v || 'Required', v => /^254\d{9}$/.test(v) || 'Format: 254712345678']"
                />

                <v-btn
                  block
                  x-large
                  color="red darken-2"
                  dark
                  class="rounded-xl text-capitalize font-weight-bold elevation-4 hover-lift"
                  :loading="loading"
                  @click="createBusiness"
                >
                  Continue
                  <v-icon right>mdi-arrow-right</v-icon>
                </v-btn>
              </div>

              <!-- Step 2: Branch -->
              <div v-else key="branch" class="pa-6 pa-sm-8">
                <div class="d-flex align-center mb-6">
                  <v-avatar color="red darken-2" size="40" class="mr-3">
                    <v-icon color="white">mdi-map-marker</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h6 font-weight-bold white--text">First Branch</h2>
                    <p class="text-caption grey--text">Where is your first shop located?</p>
                  </div>
                </div>

                <v-text-field
                  v-model="branch.name"
                  label="Branch Name"
                  placeholder="e.g. CBD Shop"
                  outlined
                  dark
                  color="red"
                  background-color="rgba(255,255,255,0.03)"
                  class="modern-input rounded-xl mb-4"
                  prepend-inner-icon="mdi-source-branch"
                  :rules="[v => !!v || 'Required']"
                />
                <v-text-field
                  v-model="branch.location"
                  label="Location"
                  placeholder="e.g. Nairobi CBD, Moi Avenue"
                  outlined
                  dark
                  color="red"
                  background-color="rgba(255,255,255,0.03)"
                  class="modern-input rounded-xl mb-6"
                  prepend-inner-icon="mdi-map-marker"
                  :rules="[v => !!v || 'Required']"
                />

                <v-row dense>
                  <v-col cols="4">
                    <v-btn
                      block
                      large
                      text
                      color="grey"
                      class="rounded-xl text-capitalize"
                      @click="step = 1"
                    >
                      Back
                    </v-btn>
                  </v-col>
                  <v-col cols="8">
                    <v-btn
                      block
                      large
                      color="red darken-2"
                      dark
                      class="rounded-xl text-capitalize font-weight-bold elevation-4 hover-lift"
                      :loading="loading"
                      @click="createBranch"
                    >
                      Complete Setup
                      <v-icon right>mdi-check-circle</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-scroll-x-transition>
          </v-card>

          <!-- Skip -->
          <div class="text-center mt-6">
            <v-btn text small color="grey darken-1" class="text-capitalize rounded-lg" @click="skipSetup">
              Skip for now
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" bottom rounded="lg" class="mb-4">
      <div class="d-flex align-center">
        <v-icon left small>{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  layout: 'public',
  name: 'Setup',
  
  data() {
    return {
      step: 1,
      loading: false,
      uid: null,
      business: { name: '', owner_name: '', phone: '' },
      branch: { name: '', location: '' },
      createdBusinessId: null,
      snackbar: { show: false, text: '', color: 'success' },
      authUnsubscribe: null
    }
  },

  methods: {
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },

    async createBusiness() {
      if (!this.business.name || !this.business.owner_name || !this.business.phone) {
        this.showSnackbar('Please fill all fields', 'warning')
        return
      }
      this.loading = true
      try {
        const { data } = await api.post('/businesses', {
          ...this.business,
          firebase_uid: this.uid
        })
        this.createdBusinessId = data.data.id
        this.showSnackbar('Business created!')
        this.step = 2
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'Failed to create business', 'error')
      } finally {
        this.loading = false
      }
    },

    async createBranch() {
      if (!this.branch.name || !this.branch.location) {
        this.showSnackbar('Please fill all fields', 'warning')
        return
      }
      this.loading = true
      try {
        await api.post('/branches', {
          business_id: this.createdBusinessId,
          name: this.branch.name,
          location: this.branch.location,
          firebase_uid: this.uid
        })
        this.showSnackbar('Setup complete! Redirecting...')
        setTimeout(() => this.$router.push('/dashboard'), 1200)
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'Failed to create branch', 'error')
      } finally {
        this.loading = false
      }
    },

    skipSetup() {
      this.$router.push('/dashboard')
    }
  },

  mounted() {
    this.authUnsubscribe = this.$fire.auth.onAuthStateChanged(user => {
      if (!user) {
        this.$router.push('/login')
      } else {
        this.uid = user.uid
        api.get(`/users/${user.uid}/profile`)
          .then(({ data }) => {
            if (data.business_id) this.$router.push('/dashboard')
          })
          .catch(() => {})
      }
    })
  },

  beforeDestroy() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe()
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #0a0a0f;
  position: relative;
  overflow: hidden;
}

/* Ambient Background */
.ambient-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
  animation: float 20s infinite ease-in-out;
}

.orb-red {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #d32f2f 0%, transparent 70%);
  top: -10%;
  right: -10%;
}

.orb-orange {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #ff6f00 0%, transparent 70%);
  bottom: -10%;
  left: -10%;
  animation-delay: -7s;
}

.orb-pink {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #c2185b 0%, transparent 70%);
  top: 40%;
  left: 30%;
  animation-delay: -14s;
  opacity: 0.2;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Glass Card */
.glass-card {
  background: rgba(20, 20, 30, 0.6) !important;
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
              0 0 0 1px rgba(255, 255, 255, 0.02) inset;
}

/* Logo */
.logo-glow {
  position: relative;
}

.logo-glow::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.4) 0%, transparent 70%);
  animation: pulse-glow 3s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.3; }
}

.logo-reveal {
  animation: fade-up 0.8s ease-out;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Progress Track */
.progress-track {
  position: relative;
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #d32f2f, #ff5252);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
}

.progress-step.active {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  border-color: rgba(211, 47, 47, 0.5);
  color: white;
  box-shadow: 0 0 15px rgba(211, 47, 47, 0.4);
}

/* Modern Inputs */
.modern-input >>> .v-input__slot {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.3s ease;
}

.modern-input >>> .v-input__slot:hover {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.modern-input.v-input--is-focused >>> .v-input__slot {
  border-color: rgba(211, 47, 47, 0.6) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.modern-input >>> .v-label {
  color: rgba(255, 255, 255, 0.4) !important;
}

.modern-input >>> .v-icon {
  color: rgba(255, 255, 255, 0.3) !important;
}

.modern-input.v-input--is-focused >>> .v-icon {
  color: rgba(211, 47, 47, 0.8) !important;
}

/* Button */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.4) !important;
}

/* Utilities */
.z-10 {
  position: relative;
  z-index: 10;
}

.tracking-tight {
  letter-spacing: -0.02em;
}

.rounded-3xl {
  border-radius: 24px !important;
}

.rounded-xl {
  border-radius: 16px !important;
}
</style>