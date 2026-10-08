<<template>
  <div class="d-flex bg-grey-lighten-4 dashboard-root" style="min-height: 100vh;">
    <!-- Desktop Sidebar -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="280"
      class="elevation-2 sidebar-modern"
      color="white"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center">
          <div class="logo-container mr-3">
            <v-avatar color="red darken-2" size="44">
              <v-icon color="white" size="22">mdi-shield-account</v-icon>
            </v-avatar>
          </div>
          <div>
            <div class="text-h6 font-weight-bold red--text text--darken-2">MeatPro</div>
            <div class="text-caption grey--text text--darken-1 text-truncate" style="max-width: 160px">
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      <v-divider class="mx-4 mb-2" />

      <v-list dense nav class="px-3 py-2">
        <v-list-item
          v-for="(item, idx) in menuItems"
          :key="item.title"
          :to="item.to"
          link
          class="mb-1 rounded-xl nav-item-modern"
          active-class="red lighten-5 red--text text--darken-2"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-medium text-body-2">{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <v-card class="rounded-xl pa-3 red lighten-5" elevation="0">
            <div class="d-flex align-center mb-2">
              <v-icon color="red" small>mdi-headset</v-icon>
              <span class="text-caption font-weight-bold red--text ml-2">Admin Support</span>
            </div>
            <div class="text-caption grey--text text--darken-1 mb-2">
              Manage plans, users & revenue
            </div>
          </v-card>
          <v-btn
            block
            outlined
            color="grey darken-1"
            class="rounded-xl text-capitalize mt-3"
            @click="logout"
          >
            <v-icon left size="18">mdi-logout</v-icon> Exit Admin
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-modern">
      <!-- Sticky Header -->
      <div class="sticky-header px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn v-if="nav_bars" icon small class="mr-2" @click="mobileDrawer = true">
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold grey--text text--darken-3">
                      {{ pageTitle }}
                    </h1>
                    <v-chip
                      x-small
                      color="red lighten-5 red--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                    >Admin</v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="grey" class="mr-1">mdi-shield-check</v-icon>
                    <span class="text-caption grey--text text--darken-1">{{ userName }}</span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-btn
                icon
                outlined
                small
                color="grey lighten-1"
                class="mr-2"
                @click="refreshPage"
                :loading="loading"
              >
                <v-icon small>mdi-refresh</v-icon>
              </v-btn>
              <v-menu offset-y transition="slide-y-transition" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    text
                    v-bind="attrs"
                    v-on="on"
                    class="text-capitalize rounded-lg px-2 user-btn-modern"
                  >
                    <v-avatar color="red lighten-4" size="34" class="mr-2">
                      <span class="red--text text--darken-2 font-weight-bold text-caption">{{ userInitials }}</span>
                    </v-avatar>
                    <span class="hidden-sm-and-down text-body-2 grey--text text--darken-2 font-weight-medium">{{ userName }}</span>
                    <v-icon small color="grey">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list dense class="py-2 rounded-xl" min-width="200" elevation="4">
                  <div class="px-4 py-2 mb-1">
                    <div class="text-caption grey--text">Admin User</div>
                    <div class="text-body-2 font-weight-bold grey--text text--darken-2">{{ userName }}</div>
                  </div>
                  <v-divider class="mb-1" />
                  <v-list-item to="/dashboard" class="rounded-lg mx-1">
                    <v-list-item-icon class="mr-3">
                      <v-icon small color="grey">mdi-view-dashboard</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-body-2">Back to App</v-list-item-title>
                  </v-list-item>
                  <v-divider class="my-1" />
                  <v-list-item @click="logout" class="rounded-lg mx-1">
                    <v-list-item-icon class="mr-3">
                      <v-icon small color="red">mdi-logout</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-body-2 red--text">Sign Out</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Page Content -->
      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <router-view />
      </v-container>
    </v-main>

    <!-- Mobile Navigation -->
    <v-bottom-navigation
      v-if="nav_bars"
      v-model="bottomNav"
      color="red darken-2"
      grow
      fixed
      class="elevation-8 bottom-nav-modern"
      style="z-index: 100"
    >
      <v-btn v-for="item in mobileMenuItems" :key="item.to" :to="item.to">
        <span>{{ item.title }}</span>
        <v-icon>{{ item.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>

    <!-- Mobile Drawer -->
    <v-navigation-drawer
      v-model="mobileDrawer"
      temporary
      right
      width="280"
      class="mobile-drawer-modern"
    >
      <div class="pa-6">
        <div class="d-flex align-center mb-8">
          <v-avatar color="red darken-2" size="36" class="mr-3">
            <v-icon color="white" size="20">mdi-shield-account</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold red--text text--darken-2">MeatPro Admin</div>
            <div class="text-caption grey--text">Management Panel</div>
          </div>
        </div>
        <v-list dense class="pa-0">
          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :to="item.to"
            class="rounded-xl mb-1"
            active-class="red lighten-5 red--text"
          >
            <v-list-item-icon class="mr-3">
              <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      nav_bars: false,
      mobileDrawer: false,
      bottomNav: 0,
      loading: false,
      userName: 'Admin',
      pageTitle: 'Dashboard'
    }
  },
  computed: {
    userInitials() {
      return this.userName.substring(0, 2).toUpperCase()
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/admin' },
        { title: 'Plans', icon: 'mdi-tag-multiple', to: '/admin/plans' },
        { title: 'Users', icon: 'mdi-account-group', to: '/admin/users' },
        { title: 'Subscriptions', icon: 'mdi-calendar-check', to: '/admin/subscriptions' },
        { title: 'Payments', icon: 'mdi-cash-multiple', to: '/admin/payments' },
        { title: 'Finance', icon: 'mdi-chart-line', to: '/admin/finance' }
      ]
    },
    mobileMenuItems() {
      return [
        { title: 'Dash', icon: 'mdi-view-dashboard', to: '/admin' },
        { title: 'Plans', icon: 'mdi-tag-multiple', to: '/admin/plans' },
        { title: 'Users', icon: 'mdi-account-group', to: '/admin/users' },
        { title: 'Finance', icon: 'mdi-chart-line', to: '/admin/finance' }
      ]
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(route) {
        const item = this.menuItems.find(i => i.to === route.path)
        this.pageTitle = item?.title || 'Admin'
      }
    }
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.nav_bars = window.innerWidth < 768
    },
    refreshPage() {
      this.loading = true
      this.$router.go(0)
    },
    logout() {
      this.$fire.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Copy ALL styles from your Dashboard.vue here */
.bg-grey-lighten-4 { background-color: #f5f5f5 !important; }
.rounded-xl { border-radius: 16px !important; }
.h-100 { height: 100%; }
.tracking-wide { letter-spacing: 0.08em; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal-card {
  animation: fadeInUp 0.6s ease-out both;
}

.sidebar-modern { border-right: 1px solid #f0f0f0 !important; }
.nav-item-modern {
  transition: all 0.25s ease;
  margin-bottom: 4px;
}
.nav-item-modern:hover {
  background-color: #fafafa;
  transform: translateX(4px);
}

.main-modern { scroll-behavior: smooth; }

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(245, 245, 245, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.user-btn-modern { transition: all 0.25s ease; }
.user-btn-modern:hover { background: #fafafa; }

.bottom-nav-modern {
  border-radius: 20px 20px 0 0 !important;
  overflow: hidden;
}

.mobile-drawer-modern { background: white !important; }

@media (max-width: 599px) {
  .sticky-header { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
}
</style>