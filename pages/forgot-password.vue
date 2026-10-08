<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <div class="head">
        <div class="head-icon">
          <v-icon color="white" size="26">mdi-lock-reset</v-icon>
        </div>
        <h1>Reset your password</h1>
        <p class="sub">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <!-- SUCCESS STATE -->
      <div v-if="sent" class="state">
        <v-icon size="56" color="success">mdi-email-check-outline</v-icon>
        <h2>Check your inbox</h2>
        <p>
          We sent a password reset link to
          <strong>{{ email }}</strong>.
        </p>
        <p class="hint">
          Didn't get it? Check your spam folder, or try again in a minute.
        </p>
        <div class="actions-stacked">
          <v-btn text color="grey darken-1" @click="sent = false">
            Try a different email
          </v-btn>
          <v-btn rounded color="red darken-2" dark @click="goBack">
            Back to sign in
          </v-btn>
        </div>
      </div>

      <!-- FORM STATE -->
      <div v-else>
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
          <label class="form-label">Email address</label>
          <v-text-field
            v-model="email"
            type="email"
            placeholder="you@example.com"
            outlined
            rounded
            dense
            hide-details="auto"
            prepend-inner-icon="mdi-email-outline"
            class="mb-4"
            :rules="[
              v => !!v || 'Email is required',
              v => /.+@.+\..+/.test(v) || 'Enter a valid email'
            ]"
            :disabled="loading"
            autocomplete="email"
          ></v-text-field>

          <v-btn
            type="submit"
            block
            color="red darken-2"
            dark
            large
            class="rounded-xl font-weight-bold text-capitalize"
            :loading="loading"
            :disabled="!formValid"
          >
            <v-icon left>mdi-send</v-icon>
            Send reset link
          </v-btn>
        </v-form>

        <div class="divider">
          <span>or</span>
        </div>

        <v-btn
          block
          text
          color="grey darken-1"
          class="rounded-xl text-capitalize"
          @click="goBack"
        >
          <v-icon left small>mdi-arrow-left</v-icon>
          Back to sign in
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',

  data() {
    return {
      email: '',
      loading: false,
      sent: false,
      error: null,
      formValid: false,
    };
  },

  mounted() {
    // Prefill email if passed in from login page
    const prefill = this.$route.query.email;
    if (prefill) this.email = String(prefill);
  },

  methods: {
    async submit() {
      if (!this.formValid || this.loading) return;
      this.loading = true;
      this.error = null;

      try {
        // Determine the correct "continue" URL based on whether
        // the user came from the admin area or the main app.
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const isAdminFlow = this.isAdminFlow();
        const continueUrl = isAdminFlow ? `${baseUrl}/admin/login` : `${baseUrl}/login`;

        // Firebase sends the reset email with the continue URL.
        // In your Firebase Console → Authentication → Templates →
        // Password reset, ensure the action URL uses ContinueUrl if
        // you want this to work as intended.
        const actionCodeSettings = {
          url: continueUrl,
          handleCodeInApp: false,
        };

        await this.$fire.auth.sendPasswordResetEmail(this.email, actionCodeSettings);

        this.sent = true;
      } catch (err) {
        const code = err.code || '';
        if (code.includes('user-not-found')) {
          // Don't reveal whether an email exists — say "sent" anyway.
          // (Security best practice.)
          this.sent = true;
        } else if (code.includes('invalid-email')) {
          this.error = 'That email address is not valid.';
        } else if (code.includes('too-many-requests')) {
          this.error = 'Too many attempts. Please try again in a few minutes.';
        } else {
          this.error = err.message || 'Could not send the reset email.';
        }
      } finally {
        this.loading = false;
      }
    },

    isAdminFlow() {
      // If the user navigated here from /admin/login, they'll have
      // ?from=admin in the URL. Or if their redirect target is an
      // admin path. Either way — send them back to admin login.
      if (this.$route.query.from === 'admin') return true;
      if (this.$route.query.redirect) {
        const redirect = decodeURIComponent(String(this.$route.query.redirect));
        return redirect.startsWith('/admin');
      }
      return false;
    },

    goBack() {
      if (this.isAdminFlow()) {
        const redirect = this.$route.query.redirect || '';
        this.$router.replace(
          redirect
            ? `/admin/login?redirect=${encodeURIComponent(redirect)}`
            : '/admin/login'
        );
      } else {
        const redirect = this.$route.query.redirect || '';
        this.$router.replace(
          redirect
            ? `/login?redirect=${encodeURIComponent(redirect)}`
            : '/login'
        );
      }
    },
  },
};
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #1e293b;
}

.forgot-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
}

.head {
  text-align: center;
  margin-bottom: 28px;
}

.head-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(198, 40, 40, 0.3);
}

.head h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.sub {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

.form-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  position: relative;
  background: #ffffff;
  padding: 0 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  font-weight: 600;
}

.state {
  text-align: center;
  padding: 16px 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.state h2 {
  color: #1e293b;
  font-weight: 800;
  margin: 12px 0 4px;
  font-size: 1.2rem;
}

.state p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.state p strong {
  color: #c62828;
  word-break: break-all;
}

.hint {
  font-size: 0.8rem !important;
  color: #94a3b8 !important;
  margin-top: 8px !important;
}

.actions-stacked {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 20px;
}

.actions-stacked .v-btn {
  width: 100%;
}
</style>