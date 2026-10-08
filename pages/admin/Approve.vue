<template>
  <div class="approve-page">
    <div class="approve-card" v-if="!done">
      <div v-if="loading || checkingRole" class="state">
        <v-progress-circular indeterminate color="red darken-2" size="52" />
        <p v-if="checkingRole">Checking permissions…</p>
        <p v-else>Loading request <strong>{{ code }}</strong>…</p>
      </div>

      <div v-else-if="!isSuperAdmin" class="state error">
        <v-icon size="56" color="red lighten-1">mdi-shield-off</v-icon>
        <h2>Not authorized</h2>
        <p>
          You need <strong>super admin</strong> access to approve changes.
          Ask a super admin to approve this request, or contact support.
        </p>
        <v-btn rounded color="red darken-2" dark class="mt-4" @click="$router.push('/admin')">
          Back to Admin
        </v-btn>
      </div>

      <div v-else-if="error" class="state error">
        <v-icon size="56" color="red lighten-1">mdi-alert-circle</v-icon>
        <h2>Cannot load request</h2>
        <p>{{ error }}</p>
        <v-btn rounded color="red darken-2" dark class="mt-4" @click="$router.push('/admin')">
          Back to Admin
        </v-btn>
      </div>

      <template v-else-if="request">
        <div class="card-head">
          <div class="head-icon">
            <v-icon color="white" size="24">mdi-shield-key</v-icon>
          </div>
          <div>
            <h1>Change Approval</h1>
            <p class="sub">
              Code <strong>{{ request.request_code }}</strong>
            </p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span>Action</span>
            <strong>{{ actionLabel(request.action) }}</strong>
          </div>
          <div class="meta-item">
            <span>Target</span>
            <strong>{{ request.target_type }}#{{ request.target_id || "new" }}</strong>
          </div>
          <div class="meta-item">
            <span>Requested by</span>
            <strong>{{ request.maker_name || request.maker_uid }}</strong>
          </div>
          <div class="meta-item">
            <span>Status</span>
            <strong :class="'status-' + request.status">{{ request.status }}</strong>
          </div>
        </div>

        <h4 class="subhead">Proposed change</h4>
        <div class="diff">
          <div v-if="request.payload_before" class="diff-col before">
            <div class="diff-head">Before</div>
            <pre>{{ pretty(request.payload_before) }}</pre>
          </div>
          <div class="diff-col after">
            <div class="diff-head">After</div>
            <pre>{{ pretty(request.payload_after) }}</pre>
          </div>
        </div>

        <div v-if="request.status !== 'pending'" class="notice">
          <v-icon small left color="orange">mdi-information</v-icon>
          This request is already <strong>{{ request.status }}</strong>. No further action needed.
        </div>

        <div v-else class="actions">
          <v-btn
            text
            color="red lighten-1"
            large
            :disabled="deciding"
            @click="decide('reject')"
          >
            <v-icon left>mdi-close-circle</v-icon>
            Reject
          </v-btn>
          <v-btn
            rounded
            color="red darken-2"
            dark
            large
            :loading="deciding"
            @click="decide('approve')"
          >
            <v-icon left>mdi-check-circle</v-icon>
            Approve
          </v-btn>
        </div>
      </template>
    </div>

    <div v-else class="approve-card result">
      <v-icon size="72" :color="resultColor">{{ resultIcon }}</v-icon>
      <h2>{{ resultTitle }}</h2>
      <p>{{ resultMessage }}</p>
      <div class="result-actions">
        <v-btn text color="grey lighten-1" @click="$router.push('/admin')">
          Back to Admin
        </v-btn>
        <v-btn rounded color="red darken-2" dark @click="$router.push('/admin')">
          Go to Dashboard
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import api from '~/services/api';

export default {
  name: 'AdminApprove',

  data() {
    return {
      code: null,
      loading: true,
      checkingRole: true,
      isSuperAdmin: false,
      error: null,
      request: null,
      deciding: false,
      done: false,
      resultTitle: '',
      resultMessage: '',
      resultColor: 'success',
      resultIcon: 'mdi-check-circle',
    };
  },

  async mounted() {
    this.code = (this.$route.query.code || '').toString().trim().toUpperCase();

    if (!this.code) {
      this.error = 'No approval code provided in the URL.';
      this.loading = false;
      this.checkingRole = false;
      return;
    }

    // If not logged in, bounce to login and come back
    if (!this.$fire?.auth?.currentUser) {
      this.$router.replace({
        path: '/login',
        query: { redirect: this.$route.fullPath },
      });
      return;
    }

    // Verify the caller is a super_admin before doing anything else
    await this.checkSuperAdmin();

    if (!this.isSuperAdmin) {
      this.loading = false;
      return;
    }

    this.fetchRequest();
  },

  methods: {
    async checkSuperAdmin() {
      this.checkingRole = true;
      try {
        const res = await api.get('/admin/me');
        const admin = res.data?.admin || {};
        this.isSuperAdmin = admin.role === 'super_admin';

        if (!this.isSuperAdmin) {
          // Not a super_admin — show the unauthorized state, don't fetch the request
          this.error = null;
        }
      } catch (err) {
        this.isSuperAdmin = false;
        if (err.response?.status === 401 || err.response?.status === 403) {
          this.error = 'You are not signed in as an admin.';
        } else {
          this.error = err.response?.data?.error || 'Could not verify admin role.';
        }
      } finally {
        this.checkingRole = false;
      }
    },

    async fetchRequest() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get(`/admin/change-requests/${this.code}`);
        this.request = res.data?.data || null;
        if (!this.request) this.error = 'Request not found.';
      } catch (err) {
        this.error =
          err.response?.data?.error ||
          'Could not load this request. It may have expired or already been reviewed.';
      } finally {
        this.loading = false;
      }
    },

    async decide(decision) {
      this.deciding = true;
      try {
        await api.post(`/admin/change-requests/${this.code}/decide`, { decision });

        if (decision === 'approve') {
          this.resultTitle = 'Change approved';
          this.resultMessage = 'The change has been applied successfully.';
          this.resultColor = 'success';
          this.resultIcon = 'mdi-check-circle';
        } else {
          this.resultTitle = 'Change rejected';
          this.resultMessage = 'The maker has been notified of your decision.';
          this.resultColor = 'warning';
          this.resultIcon = 'mdi-close-circle';
        }
        this.done = true;
      } catch (err) {
        this.error =
          err.response?.data?.error ||
          'Could not record your decision. Try again or use the Approvals page.';
      } finally {
        this.deciding = false;
      }
    },

    actionLabel(action) {
      return String(action).replace('.', ' › ');
    },

    pretty(val) {
      if (val == null) return '—';
      try {
        const obj = typeof val === 'string' ? JSON.parse(val) : val;
        return JSON.stringify(obj, null, 2);
      } catch {
        return String(val);
      }
    },
  },
};
</script>

<style scoped>
.approve-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px;
  color: #1e293b;
}

.approve-card {
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 320px;
  text-align: center;
  color: #64748b;
}

.state h2 { color: #1e293b; margin: 8px 0 0; font-weight: 800; }
.state p { margin: 0; font-size: 0.9rem; max-width: 400px; }
.state.error h2 { color: #c62828; }

.card-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.head-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(198, 40, 40, 0.3);
}

.card-head h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.sub {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.sub strong {
  color: #c62828;
  font-family: 'SF Mono', 'Courier New', monospace;
  letter-spacing: 1px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.meta-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.meta-item span {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 700;
}

.meta-item strong {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-pending { color: #e65100 !important; }
.status-consumed,
.status-approved { color: #2e7d32 !important; }
.status-rejected { color: #c62828 !important; }
.status-expired { color: #94a3b8 !important; }

.subhead {
  margin: 22px 0 10px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
}

.diff-col {
  border-radius: 14px;
  padding: 14px;
}

.diff-col.before {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.diff-col.after {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.diff-head {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 800;
  margin-bottom: 8px;
}

.diff-col.before .diff-head { color: #c62828; }
.diff-col.after .diff-head { color: #2e7d32; }

.diff-col pre {
  margin: 0;
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 0.8rem;
  color: #1e293b;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 320px;
  overflow-y: auto;
}

.notice {
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: 14px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  color: #e65100;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.result {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 56px 32px;
}

.result h2 {
  color: #1e293b;
  font-weight: 800;
  margin: 12px 0 0;
}

.result p { color: #64748b; margin: 0; }

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .meta-grid, .diff { grid-template-columns: 1fr; }
  .approve-card { padding: 22px; border-radius: 20px; }
  .actions { flex-direction: column-reverse; }
  .actions .v-btn { width: 100%; }
}
</style>