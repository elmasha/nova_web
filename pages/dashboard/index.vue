<template>
  <div class="redirect-page">
    <div class="spinner-wrap">
      <v-progress-circular indeterminate color="#4a3b8c" size="36" width="3" />
      <p>Loading your dashboard…</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'DashboardRedirect',
  middleware: 'auth',

  async mounted() {
    try {
      const auth = this._fbAuth();
      const user = auth?.currentUser;
      if (!user) {
        this.$router.replace('/login');
        return;
      }

      const token = await user.getIdToken();
      const { data } = await axios.get(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const role = data?.data?.role;

      if (role === 'professional') {
        this.$router.replace('/dashboard/professional');
      } else {
        this.$router.replace('/dashboard/parent');
      }
    } catch (err) {
      console.error('[dashboard redirect]', err.response?.data || err.message);
      this.$router.replace('/login');
    }
  },

  methods: {
    _fbAuth() {
      if (this.$fire?.auth) return this.$fire.auth;
      if (this.$firebase) {
        return typeof this.$firebase.auth === 'function'
          ? this.$firebase.auth()
          : this.$firebase.auth;
      }
      return null;
    }
  }
};
</script>

<style scoped>
.redirect-page {
  min-height: 100vh;
  background: #f3f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner-wrap {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}
.spinner-wrap p {
  margin-top: 14px;
}
</style>