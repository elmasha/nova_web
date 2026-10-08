<template>
  <div class="admin-login-root">
    <!-- Ambient background -->
    <div class="ambient-glow red"></div>
    <div class="ambient-glow dark"></div>

    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="6" lg="4">
          <v-card class="login-card rounded-2xl pa-6 pa-sm-8" elevation="12">
            <!-- Logo + brand -->
            <div class="text-center mb-6">
              <v-avatar color="red darken-2" size="64" class="mb-3 elevation-4">
                <v-icon color="white" size="32">mdi-shield-account</v-icon>
              </v-avatar>
              <h1 class="text-h5 font-weight-bold red--text text--darken-2">MeatPro Admin</h1>
              <p class="text-caption grey--text text--darken-1 mt-1">
                Sign in to the admin console
              </p>
            </div>

            <v-alert
              v-if="error"
              type="error"
              dense
              text
              class="mb-4 rounded-xl"
              @input="error = null"
            >
              {{ error }}
            </v-alert>

            <v-form ref="form" v-model="formValid" @submit.prevent="submit">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-3 rounded-lg"
                :rules="[v => !!v || 'Email required']"
                :disabled="loading"
                autocomplete="username"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPassword = !showPassword"
                outlined
                rounded
                dense
                hide-details="auto"
                class="mb-4 rounded-lg"
                :rules="[v => !!v || 'Password required']"
                :disabled="loading"
                autocomplete="current-password"
              ></v-text-field>

              <v-btn
                type="submit"
                block
                color="red darken-2"
                dark
                large
                class="rounded-xl font-weight-bold text-capitalize mb-3"
                :loading="loading"
                :disabled="!formValid"
              >
                <v-icon left>mdi-login</v-icon>
                Sign In
              </v-btn>
            </v-form>

            <v-divider class="my-4"></v-divider>

            <div class="text-center">
              <v-btn text small color="grey darken-1" @click="$router.push('/')">
                <v-icon left small>mdi-arrow-left</v-icon>
                Back to App
              </v-btn>
            </div>
          </v-card>

          <div class="text-center mt-4 text-caption grey--text">
            Admin access is restricted. Only authorized users may sign in.
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'AdminLogin',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      formValid: false
    }
  },
  mounted() {
    // If already signed in, go straight to admin
    if (this.$fire && this.$fire.auth && this.$fire.auth.currentUser) {
      this.$router.replace('/admin')
    }
  },
  methods: {
    async submit() {
      if (!this.formValid || this.loading) return
      this.loading = true
      this.error = null

      try {
        await this.$fire.auth.signInWithEmailAndPassword(this.email, this.password)

        // Verify the user is actually an admin via backend
        try {
          const { data } = await api.get('/admin/me')
          if (!data || !data.success) {
            throw new Error('Not an admin')
          }
          // Success — go to admin dashboard
          this.$router.replace('/admin')
        } catch (err) {
          // Not an admin — sign back out
          await this.$fire.auth.signOut()
          const status = err.response && err.response.status
          if (status === 403) {
            this.error = 'This account is not an admin.'
          } else if (status === 401) {
            this.error = 'Session could not be verified. Try again.'
          } else {
            this.error = 'Could not verify admin access.'
          }
        }
      } catch (err) {
        const code = err.code || ''
        if (code.includes('user-not-found')) {
          this.error = 'No account found with that email.'
        } else if (code.includes('wrong-password')) {
          this.error = 'Incorrect password.'
        } else if (code.includes('invalid-email')) {
          this.error = 'That email address is not valid.'
        } else if (code.includes('too-many-requests')) {
          this.error = 'Too many failed attempts. Try again later.'
        } else if (code.includes('user-disabled')) {
          this.error = 'This account has been disabled.'
        } else {
          this.error = err.message || 'Sign in failed.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login-root {
  min-height: 100vh;
  background: #0f172a;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

/* Ambient background glows */
.ambient-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}
.ambient-glow.red {
  width: 500px;
  height: 500px;
  background: #c62828;
  top: -150px;
  right: -100px;
}
.ambient-glow.dark {
  width: 600px;
  height: 600px;
  background: #b71c1c;
  bottom: -200px;
  left: -150px;
  opacity: 0.15;
}

.login-card {
  background: #ffffff !important;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.login-card ::v-deep .v-input__slot {
  background: #f8fafc !important;
}

.login-card ::v-deep .v-text-field--outlined fieldset {
  border-color: #e2e8f0 !important;
}

.login-card ::v-deep .v-text-field--outlined.v-input--is-focused fieldset {
  border-color: #c62828 !important;
}

.rounded-2xl { border-radius: 20px !important; }
</style>