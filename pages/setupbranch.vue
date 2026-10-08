<template>
  <div class="auth-page">
    <!-- Ambient Background -->
    <div class="ambient-bg">
      <div class="orb orb-red"></div>
      <div class="orb orb-orange"></div>
      <div class="orb orb-pink"></div>
      <div class="noise-overlay"></div>
    </div>

    <v-container class="fill-height d-flex align-center justify-center relative z-10 py-8">
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">

          <!-- ── Access Restricted (non-owners) ────────────── -->
          <div v-if="profileLoaded && !isOwner" class="text-center py-12">
            <v-avatar color="orange lighten-5" size="80" class="mb-4">
              <v-icon size="42" color="orange darken-2">mdi-lock-alert</v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-bold white--text mt-4">Access Restricted</h2>
            <p class="text-body-2 grey--text text--lighten-1 mt-2">
              Only the business owner can create or manage branches.
              You're being redirected back to the dashboard.
            </p>
            <v-btn
              color="red darken-2"
              dark
              class="rounded-lg text-capitalize mt-6"
              to="/dashboard"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Back to Dashboard
            </v-btn>
          </div>

          <!-- ── Owner content ─────────────────────────────── -->
          <template v-else>

            <!-- Back link -->
            <div class="d-flex justify-start mb-4">
              <v-btn
                text
                small
                color="grey lighten-1"
                class="text-capitalize"
                to="/dashboard"
              >
                <v-icon left small>mdi-arrow-left</v-icon>
                Back to Dashboard
              </v-btn>
            </div>

            <!-- Header -->
            <div class="text-center mb-8 logo-reveal">
              <div class="logo-glow mb-4 d-inline-block">
                <v-avatar color="red darken-2" size="64" class="elevation-6">
                  <v-icon color="white" size="32">mdi-food-steak</v-icon>
                </v-avatar>
              </div>
              <h1 class="text-h4 font-weight-black white--text tracking-tight">Manage Branches</h1>
              <p class="text-subtitle-2 grey--text text--lighten-1 mt-2">
                {{ planLabel }} · {{ branches.length }} of {{ branchLimitLabel }} used
              </p>
            </div>

            <!-- Plan / Slots Card -->
            <v-card class="glass-card rounded-3xl overflow-hidden mb-5" elevation="0">
              <div class="pa-5 pa-sm-6">
                <div class="d-flex align-center justify-space-between flex-wrap">
                  <div class="d-flex align-center mb-2 mb-sm-0">
                    <v-avatar :color="planColor" size="40" class="mr-3">
                      <v-icon color="white" small>mdi-crown</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-body-1 font-weight-bold white--text">{{ planDisplayName }} Plan</div>
                      <div class="text-caption grey--text">
                        {{ remainingSlots === Infinity ? 'Unlimited branches' : `${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining` }}
                      </div>
                    </div>
                  </div>
                  <v-chip
                    small
                    :color="atLimit ? 'orange darken-2' : 'green darken-2'"
                    dark
                    label
                    class="font-weight-bold"
                  >
                    {{ atLimit ? 'Limit Reached' : `${branches.length}/${branchLimitLabel}` }}
                  </v-chip>
                </div>

                <v-progress-linear
                  v-if="branchLimit !== Infinity"
                  :value="(branches.length / branchLimit) * 100"
                  :color="atLimit ? 'orange' : 'red darken-2'"
                  background-color="rgba(255,255,255,0.08)"
                  height="6"
                  rounded
                  class="mt-4"
                />
              </div>
            </v-card>

            <!-- Existing Branches List -->
            <v-card class="glass-card rounded-3xl overflow-hidden mb-5" elevation="0">
              <div class="pa-5 pa-sm-6">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="blue darken-2" size="36" class="mr-3">
                    <v-icon color="white" small>mdi-store</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h6 font-weight-bold white--text">Your Branches</h2>
                    <p class="text-caption grey--text">Tap a branch to set it as primary</p>
                  </div>
                </div>

                <div v-if="!profileLoaded" class="text-center py-6">
                  <v-progress-circular indeterminate color="red" size="32" />
                  <div class="text-caption grey--text mt-3">Loading branches…</div>
                </div>

                <div v-else-if="branches.length === 0" class="text-center py-6">
                  <v-icon size="48" color="grey darken-1">mdi-store-off</v-icon>
                  <div class="text-body-1 grey--text mt-3">No branches yet</div>
                  <div class="text-caption grey--text">Create your first branch below</div>
                </div>

                <div v-else class="branch-list">
                  <div
                    v-for="b in branches"
                    :key="b.id"
                    class="branch-item"
                    :class="{ 'branch-primary': b.id === primaryBranchId, 'branch-selecting': selectingId === b.id || deletingId === b.id }"
                    @click="setPrimaryBranch(b)"
                  >
                    <div class="d-flex align-center">
                      <v-avatar
                        :color="b.id === primaryBranchId ? 'red darken-2' : 'rgba(255,255,255,0.08)'"
                        size="42"
                        class="mr-3"
                      >
                        <v-icon :color="b.id === primaryBranchId ? 'white' : 'grey lighten-1'" small>
                          {{ b.id === primaryBranchId ? 'mdi-star' : 'mdi-store' }}
                        </v-icon>
                      </v-avatar>
                      <div class="flex-grow-1 min-width-0">
                        <div class="d-flex align-center">
                          <span class="text-body-1 font-weight-bold white--text text-truncate">{{ b.name }}</span>
                          <v-chip
                            v-if="b.id === primaryBranchId"
                            x-small
                            color="red darken-2"
                            dark
                            label
                            class="ml-2 font-weight-bold"
                          >
                            Primary
                          </v-chip>
                        </div>
                        <div class="text-caption grey--text text-truncate">
                          <v-icon x-small color="grey" class="mr-1">mdi-map-marker</v-icon>
                          {{ b.location || 'No location' }}
                        </div>
                      </div>

                      <!-- Loading spinner when selecting or deleting -->
                      <v-progress-circular
                        v-if="selectingId === b.id || deletingId === b.id"
                        indeterminate
                        size="20"
                        width="2"
                        color="red"
                        class="ml-2"
                      />
                      <template v-else>
                        <v-icon
                          v-if="b.id === primaryBranchId"
                          color="red lighten-2"
                          small
                          class="ml-2"
                        >
                          mdi-check-circle
                        </v-icon>
                        <v-icon v-else color="grey darken-1" small class="ml-2">
                          mdi-chevron-right
                        </v-icon>

                        <!-- Delete button -->
                        <v-btn
                          icon
                          x-small
                          color="grey darken-1"
                          class="ml-1 delete-btn"
                          @click.stop="confirmDelete(b)"
                        >
                          <v-icon small>mdi-delete-outline</v-icon>
                        </v-btn>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>

            <!-- Create Branch Form -->
            <v-card class="glass-card rounded-3xl overflow-hidden" elevation="0">
              <div class="pa-5 pa-sm-6">
                <div class="d-flex align-center mb-5">
                  <v-avatar color="red darken-2" size="36" class="mr-3">
                    <v-icon color="white" small>mdi-store-plus</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h6 font-weight-bold white--text">Add New Branch</h2>
                    <p class="text-caption grey--text">
                      {{ atLimit ? 'Upgrade your plan to add more branches' : 'Where is your next shop?' }}
                    </p>
                  </div>
                </div>

                <!-- At limit warning -->
                <v-alert
                  v-if="profileLoaded && atLimit"
                  type="warning"
                  text
                  dense
                  class="mb-4 rounded-xl"
                  color="orange"
                >
                  <div class="d-flex align-center flex-wrap">
                    <span>You've reached the {{ planDisplayName }} limit of {{ branchLimit }} branch{{ branchLimit === 1 ? '' : 'es' }}.</span>
                    <v-btn
                      text
                      small
                      color="orange"
                      class="ml-2 text-capitalize"
                      @click="$router.push('/subscription')"
                    >
                      Upgrade Plan
                    </v-btn>
                  </div>
                </v-alert>

                <!-- Not Pro warning -->
                <v-alert
                  v-if="profileLoaded && !isPro && planName === 'free'"
                  type="warning"
                  text
                  dense
                  class="mb-4 rounded-xl"
                  color="orange"
                >
                  Branch creation requires an active subscription.
                  <v-btn text small color="orange" class="ml-2 text-capitalize" @click="$router.push('/subscription')">
                    Subscribe
                  </v-btn>
                </v-alert>

                <!-- No business warning -->
                <v-alert
                  v-if="profileLoaded && isPro && !businessId"
                  type="warning"
                  text
                  dense
                  class="mb-4 rounded-xl"
                  color="orange"
                >
                  No business found. Please create a business first.
                </v-alert>

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
                  :disabled="!canCreate"
                />
                <v-text-field
                  v-model="branch.location"
                  label="Location"
                  placeholder="e.g. Nairobi CBD, Moi Avenue"
                  outlined
                  dark
                  color="red"
                  background-color="rgba(255,255,255,0.03)"
                  class="modern-input rounded-xl mb-5"
                  prepend-inner-icon="mdi-map-marker"
                  :rules="[v => !!v || 'Required']"
                  :disabled="!canCreate"
                />

                <v-btn
                  block
                  x-large
                  color="red darken-2"
                  dark
                  class="rounded-xl text-capitalize font-weight-bold elevation-4 hover-lift"
                  :loading="loading"
                  :disabled="!canCreate || !branch.name || !branch.location"
                  @click="createBranch"
                >
                  {{ atLimit ? 'Limit Reached' : 'Create Branch' }}
                  <v-icon right>{{ atLimit ? 'mdi-lock' : 'mdi-check-circle' }}</v-icon>
                </v-btn>
              </div>
            </v-card>

            <!-- Actions -->
            <div class="d-flex justify-center align-center mt-6 flex-wrap">
              <v-btn
                text
                small
                color="grey darken-1"
                class="text-capitalize rounded-lg mr-2"
                @click="goToDashboard"
              >
                <v-icon left small>mdi-view-dashboard</v-icon>
                Go to Dashboard
              </v-btn>
              <v-btn
                text
                small
                color="grey darken-1"
                class="text-capitalize rounded-lg"
                @click="skipSetup"
              >
                Skip for now
              </v-btn>
            </div>
          </template>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card class="glass-card rounded-2xl" dark>
        <v-card-title class="text-h6 font-weight-bold pt-5 px-5">
          Delete Branch?
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <p class="mb-2">
            Are you sure you want to permanently delete
            <strong class="white--text">"{{ branchToDelete?.name }}"</strong>?
          </p>
          <p class="text-caption grey--text mb-0">
            This action cannot be undone.
            <span v-if="branchToDelete?.id === primaryBranchId">
              This is your primary branch — another branch will be set as primary automatically.
            </span>
          </p>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn
            text
            color="grey lighten-1"
            class="text-capitalize"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="red darken-2"
            dark
            class="text-capitalize rounded-lg"
            :loading="!!deletingId"
            @click="deleteBranch"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" bottom rounded="lg" class="mb-4">
      <div class="d-flex align-center">
        <v-icon left small>
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : snackbar.color === 'warning' ? 'mdi-alert' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  layout: 'public',
  name: 'SetupBranch',

  data() {
    return {
      loading: false,
      selectingId: null,
      deletingId: null,
      deleteDialog: false,
      branchToDelete: null,
      uid: null,
      businessId: null,
      isPro: false,
      profileLoaded: false,
      planName: 'free',           // free | starter | pro | business

      // ── Role state ────────────────────────────────────────────
      role: null,                 // 'owner' | 'manager' | 'none'
      isOwner: false,

      primaryBranchId: null,      // users.branch_id
      branches: [],
      branch: { name: '', location: '' },
      snackbar: { show: false, text: '', color: 'success' },
      authUnsubscribe: null,
      branchCount: 0,

      // Plans loaded from API
      plans: [],
      plansLoaded: false,
    }
  },

  computed: {
    // Dynamically resolve limit from the loaded plan's features
    branchLimit() {
      if (!this.plansLoaded || !this.plans.length) {
        return this.getFallbackLimit(this.planName)
      }

      const plan = this.plans.find(p => {
        const key = (p.slug || p.name || p.code || p.id || '').toString().toLowerCase()
        return key === this.planName || key.includes(this.planName)
      })

      if (!plan) return this.getFallbackLimit(this.planName)

      return this.extractBranchLimit(plan)
    },

    branchLimitLabel() {
      return this.branchLimit === Infinity ? '∞' : String(this.branchLimit)
    },

    remainingSlots() {
      if (this.branchLimit === Infinity) return Infinity
      return Math.max(0, this.branchLimit - this.branches.length)
    },

    atLimit() {
      if (this.branchLimit === Infinity) return false
      return this.branches.length >= this.branchLimit
    },

    canCreate() {
      return this.isOwner && this.isPro && this.businessId && !this.atLimit
    },

    planDisplayName() {
      const map = { free: 'Free', starter: 'Starter', pro: 'Professional', business: 'Business' }
      return map[this.planName] || 'Free'
    },

    planLabel() {
      return this.planDisplayName
    },

    planColor() {
      const map = {
        free: 'grey darken-1',
        starter: 'blue darken-2',
        pro: 'red darken-2',
        business: 'purple darken-2',
      }
      return map[this.planName] || 'grey darken-1'
    },
  },

  methods: {
    // ---------- Plans ----------
    async loadPlans() {
      try {
        const { data } = await api.get('/plans')
        this.plans = Array.isArray(data) ? data : (data?.plans || data?.data || [])
        console.log('Plans loaded:', this.plans)
      } catch (e) {
        console.error('Failed to load plans:', e)
        this.plans = []
      } finally {
        this.plansLoaded = true
      }
    },

    extractBranchLimit(plan) {
      if (typeof plan.max_branches === 'number') return plan.max_branches
      if (typeof plan.branch_limit === 'number') return plan.branch_limit
      if (typeof plan.branches === 'number') return plan.branches

      const features = plan.features || plan.feature_list || []
      for (const f of features) {
        const name = (f.name || f.key || f.slug || f.code || '').toString().toLowerCase()
        const value = f.value ?? f.limit ?? f.quantity ?? f.count

        if (
          name.includes('branch') ||
          name === 'branches' ||
          name === 'max_branches' ||
          name === 'branch_limit'
        ) {
          if (value === null || value === undefined) continue
          if (typeof value === 'number') return value
          if (typeof value === 'string') {
            const lower = value.toLowerCase()
            if (lower.includes('unlimited') || lower === '∞' || lower === 'inf') return Infinity
            const num = parseInt(value.replace(/[^0-9]/g, ''), 10)
            if (!isNaN(num)) return num
          }
          if (value === true) return Infinity
        }
      }

      // Fall through: parse the feature strings directly (e.g. ["2 branch", "5 users"])
      for (const f of features) {
        const s = String(f).toLowerCase()
        if (s.includes('unlimited') && s.includes('branch')) return Infinity
        const m = s.match(/(\d+)\s*branch/)
        if (m) return parseInt(m[1], 10)
      }

      const desc = (plan.description || plan.features_text || '').toString().toLowerCase()
      if (desc.includes('unlimited') && desc.includes('branch')) return Infinity
      const match = desc.match(/(\d+)\s*branch/)
      if (match) return parseInt(match[1], 10)

      return this.getFallbackLimit(this.planName)
    },

    getFallbackLimit(planName) {
      // Matches the backend PLAN_BRANCH_LIMITS map
      const FALLBACK = { free: 0, starter: 1, business: 2, pro: 3 }
      return FALLBACK[planName] ?? 0
    },

    // ---------- Branches ----------
    async loadBranches() {
      try {
        if (!this.uid) return
        const { data } = await api.get(`/branches/my?firebase_uid=${this.uid}`)
        this.branches = data || []
        this.branchCount = this.branches.length
        console.log('Branches loaded:', this.branches, 'Count:', this.branchCount)
      } catch (e) {
        console.error('Branches load error:', e)
        this.branches = []
      }
    },

    checkDuplicateBranch() {
      const nameLower = this.branch.name.trim().toLowerCase()
      const locationLower = this.branch.location.trim().toLowerCase()

      return this.branches.find((b) => {
        const existingName = (b.name || '').toLowerCase()
        const existingLocation = (b.location || '').toLowerCase()
        return existingName === nameLower || existingLocation === locationLower
      })
    },

    // ---------- Profile (now also loads role + plans) ----------
    async loadUserProfile() {
      try {
        if (!this.uid) return

        await Promise.all([
          this.loadPlans(),
          this._loadRoleOnly(),
          this._loadProfileOnly(),
        ])
      } catch (e) {
        console.error('Profile / plans load error:', e)
      } finally {
        this.profileLoaded = true
      }
    },

    // ── Role fetch — blocks non-owners from using this page ──
    async _loadRoleOnly() {
      try {
        const { data } = await api.get(`/users/me/role?firebase_uid=${this.uid}`)
        this.role = data.role || 'none'
        this.isOwner = this.role === 'owner'

        // Hard redirect: managers shouldn't be here
        if (!this.isOwner) {
          this.showSnackbar('Only the business owner can manage branches.', 'warning')
          setTimeout(() => {
            this.$router.replace('/dashboard')
          }, 1500)
        }
      } catch (e) {
        console.warn('Role fetch failed — defaulting to non-owner', e)
        this.role = 'none'
        this.isOwner = false
        // Fail safe: also redirect on error
        setTimeout(() => {
          this.$router.replace('/dashboard')
        }, 1500)
      }
    },

    async _loadProfileOnly() {
      const { data } = await api.get(`/users/${this.uid}/profile`)
      console.log('User profile loaded:', data)

      const rawPlan = (
        data.subscription ||
        data.plan ||
        data.subscription_status ||
        'free'
      ).toString().toLowerCase()

      if (['pro', 'professional'].includes(rawPlan) || data.subscription === 'pro') {
        this.planName = 'pro'
        this.isPro = true
      } else if (['starter'].includes(rawPlan)) {
        this.planName = 'starter'
        this.isPro = true
      } else if (['business'].includes(rawPlan)) {
        this.planName = 'business'
        this.isPro = true
      } else if (data.subscription_status === 'active' && data.subscription) {
        this.planName = data.subscription.toLowerCase()
        this.isPro = true
      } else {
        this.planName = 'free'
        this.isPro = false
      }

      if (data.business_id) this.businessId = data.business_id
      if (data.branch_id) this.primaryBranchId = data.branch_id

      await this.loadBranches()
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },

    async setPrimaryBranch(b) {
      if (!this.isOwner) {
        this.showSnackbar('Only the business owner can change the primary branch.', 'warning')
        return
      }
      if (!b || b.id === this.primaryBranchId) return
      if (this.selectingId || this.deletingId) return

      this.selectingId = b.id
      try {
        await api.patch(`/users/${this.uid}/profile`, {
          branch_id: b.id,
        })
        this.primaryBranchId = b.id
        this.showSnackbar(`"${b.name}" set as primary branch`, 'success')
      } catch (error) {
        try {
          await api.put(`/users/${this.uid}/profile`, {
            branch_id: b.id,
          })
          this.primaryBranchId = b.id
          this.showSnackbar(`"${b.name}" set as primary branch`, 'success')
        } catch (err2) {
          console.error('Set primary branch error:', err2)
          this.showSnackbar(
            err2.response?.data?.message || 'Failed to set primary branch',
            'error'
          )
        }
      } finally {
        this.selectingId = null
      }
    },

    confirmDelete(b) {
      if (!this.isOwner) {
        this.showSnackbar('Only the business owner can delete branches.', 'warning')
        return
      }
      if (!b || this.deletingId || this.selectingId) return
      this.branchToDelete = b
      this.deleteDialog = true
    },

    async deleteBranch() {
      if (!this.isOwner) {
        this.showSnackbar('Only the business owner can delete branches.', 'warning')
        return
      }
      if (!this.branchToDelete || !this.uid) return

      const target = this.branchToDelete
      this.deletingId = target.id
      this.deleteDialog = false

      try {
        await api.delete(`/branches/${target.id}`, {
          params: { firebase_uid: this.uid },
        })

        this.branches = this.branches.filter((b) => b.id !== target.id)
        this.branchCount = this.branches.length

        if (this.primaryBranchId === target.id) {
          if (this.branches.length > 0) {
            await this.setPrimaryBranch(this.branches[0])
          } else {
            try {
              await api.patch(`/users/${this.uid}/profile`, { branch_id: null })
            } catch (e) {
              try {
                await api.put(`/users/${this.uid}/profile`, { branch_id: null })
              } catch (e2) {
                console.error('Failed to clear primary branch:', e2)
              }
            }
            this.primaryBranchId = null
          }
        }

        this.showSnackbar(`"${target.name}" deleted successfully`, 'success')
      } catch (error) {
        console.error('Delete branch error:', error)
        this.showSnackbar(
          error.response?.data?.message || 'Failed to delete branch',
          'error'
        )
      } finally {
        this.deletingId = null
        this.branchToDelete = null
      }
    },

    async createBranch() {
      if (!this.isOwner) {
        this.showSnackbar('Only the business owner can create branches.', 'error')
        return
      }
      if (!this.branch.name || !this.branch.location) {
        this.showSnackbar('Please fill all fields', 'warning')
        return
      }
      if (!this.businessId) {
        this.showSnackbar('No business found. Cannot create branch.', 'error')
        return
      }
      if (!this.isPro) {
        this.showSnackbar('An active subscription is required to create branches', 'error')
        return
      }
      if (this.atLimit) {
        this.showSnackbar(
          `Your ${this.planDisplayName} plan allows only ${this.branchLimit} branch${this.branchLimit === 1 ? '' : 'es'}. Upgrade to add more.`,
          'warning'
        )
        return
      }

      const duplicate = this.checkDuplicateBranch()
      if (duplicate) {
        this.showSnackbar(
          `A branch already exists with name "${duplicate.name}" or location "${duplicate.location}"`,
          'error'
        )
        return
      }

      this.loading = true
      try {
        const { data } = await api.post('/branches', {
          business_id: this.businessId,
          name: this.branch.name.trim(),
          location: this.branch.location.trim(),
          firebase_uid: this.uid,
        })

        const created = data?.branch || data || {
          id: data?.id,
          name: this.branch.name.trim(),
          location: this.branch.location.trim(),
        }
        if (created.id) {
          this.branches.push(created)
        } else {
          await this.loadBranches()
        }

        if (this.branches.length === 1 && created.id) {
          await this.setPrimaryBranch(created)
        }

        this.branch = { name: '', location: '' }
        this.showSnackbar('Branch created successfully!', 'success')
      } catch (error) {
        const status = error.response?.status
        const code = error.response?.data?.code
        const message = error.response?.data?.message

        // ── Backend plan-limit responses ─────────────────────
        if (status === 403 && code === 'PLAN_LIMIT_REACHED') {
          this.showSnackbar(
            message || 'Plan limit reached. Upgrade to add more branches.',
            'warning'
          )
          // Refresh branches count in case it was stale
          await this.loadBranches()
          return
        }

        if (status === 403 && code === 'NO_ACTIVE_SUBSCRIPTION') {
          this.showSnackbar(
            message || 'An active subscription is required to create branches.',
            'warning'
          )
          // Send them to subscription page
          setTimeout(() => this.$router.push('/subscription'), 1800)
          return
        }

        // ── Generic errors ───────────────────────────────────
        this.showSnackbar(message || 'Failed to create branch', 'error')
      } finally {
        this.loading = false
      }
    },

    goToDashboard() {
      this.$router.push('/dashboard')
    },

    skipSetup() {
      this.$router.push('/dashboard')
    },
  },

  mounted() {
    this.authUnsubscribe = this.$fire.auth.onAuthStateChanged((user) => {
      if (!user) {
        this.$router.push('/login')
      } else {
        this.uid = user.uid
        this.loadUserProfile()          // loads role + plans + profile in parallel
      }
    })
  },

  beforeDestroy() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe()
    }
  },
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #0a0a0f;
  position: relative;
  overflow-x: hidden;
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

/* Branch list */
.branch-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.branch-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.25s ease;
}

.branch-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.branch-item.branch-primary {
  background: rgba(211, 47, 47, 0.12);
  border-color: rgba(211, 47, 47, 0.35);
}

.branch-item.branch-selecting {
  opacity: 0.7;
  pointer-events: none;
}

.min-width-0 {
  min-width: 0;
}

.delete-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.branch-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef5350 !important;
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

.modern-input.v-input--is-disabled >>> .v-input__slot {
  opacity: 0.5;
}

/* Button */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover:not(.v-btn--disabled) {
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

.rounded-2xl {
  border-radius: 20px !important;
}
</style>