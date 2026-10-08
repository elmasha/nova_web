<template>
  <div class="d-flex bg-surface dashboard-root" style="min-height: 100vh;">
    <!-- Desktop Sidebar -->
    <v-navigation-drawer
      v-if="!nav_bars"
      permanent
      width="280"
      class="elevation-1 sidebar-glass"
      :class="{ 'sidebar-dark': $vuetify.theme.dark }"
    >
      <div class="pa-6 pb-4">
        <div class="d-flex align-center cursor-pointer brand-hover" @click="$router.push('/')">
          <div class="logo-container mr-3">
            <v-avatar color="red darken-2" size="46" class="elevation-2">
              <v-icon color="white" size="24">mdi-shield-account</v-icon>
            </v-avatar>
          </div>
          <div>
            <div class="text-h6 font-weight-bold red--text brand-text">MeatPro</div>
            <div class="text-caption text--secondary font-weight-medium">Admin Console</div>
          </div>
        </div>
      </div>

      <v-divider class="mx-4 mb-2 opacity-30"></v-divider>

      <v-list dense nav class="px-3 py-2">
        <v-list-item
          v-for="(item, idx) in menuItems"
          :key="item.title"
          @click="activeSection = item.section"
          link
          class="mb-1 rounded-xl nav-item-premium"
          :class="{
            'red lighten-5 red--text': activeSection === item.section && !$vuetify.theme.dark,
            'red darken-4 white--text': activeSection === item.section && $vuetify.theme.dark
          }"
          :style="{ 'animation-delay': idx * 50 + 'ms' }"
        >
          <v-list-item-icon class="mr-3">
            <v-icon :color="activeSection === item.section ? 'red' : 'grey'" size="22">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-semibold text-body-2">{{ item.title }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action v-if="item.section === 'payments' && stats.pendingApprovals > 0">
            <v-chip x-small color="error" text-color="white" class="font-weight-bold" style="font-size: 10px;">
              {{ stats.pendingApprovals }}
            </v-chip>
          </v-list-item-action>
          <v-list-item-action v-if="item.section === 'approvals' && pendingRequests.length > 0">
            <v-chip x-small color="warning" text-color="white" class="font-weight-bold" style="font-size: 10px;">
              {{ pendingRequests.length }}
            </v-chip>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 pb-6">
          <v-card class="rounded-xl pa-4 premium-card" elevation="0" outlined>
            <div class="d-flex align-center mb-3">
              <v-avatar size="32" color="red lighten-5" class="mr-3">
                <v-icon color="red darken-2" small>mdi-headset</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption font-weight-bold red--text">Need Help?</div>
                <div class="text-caption text--secondary">Support available</div>
              </div>
            </div>
            <v-btn block small text color="red darken-2" class="text-capitalize rounded-lg justify-start px-0">
              <v-icon left small>mdi-open-in-new</v-icon> Documentation
            </v-btn>
          </v-card>
          <v-btn
            block
            outlined
            color="red darken-2"
            class="rounded-xl text-capitalize mt-3 font-weight-medium red--text text--darken-2"
            @click="logout"
          >
            <v-icon left size="18" color="red darken-2">mdi-logout</v-icon> Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Mobile Bottom Navigation -->
    <v-bottom-navigation
      v-if="nav_bars"
      v-model="mobileDrawer"
      color="red darken-2"
      grow
      fixed
      class="elevation-8 bottom-nav-premium"
      style="z-index: 100"
      height="64"
    >
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        @click="activeSection = item.section"
        :class="{ 'v-btn--active': activeSection === item.section }"
        class="mobile-nav-btn"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="mobile-nav-label">{{ item.title }}</span>
        <v-badge
          v-if="item.section === 'payments' && stats.pendingApprovals > 0"
          color="error"
          dot
          overlap
          offset-x="8"
          offset-y="4"
        ></v-badge>
        <v-badge
          v-if="item.section === 'approvals' && pendingRequests.length > 0"
          color="warning"
          dot
          overlap
          offset-x="8"
          offset-y="4"
        ></v-badge>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main Content -->
    <v-main :class="nav_bars ? 'pb-16' : ''" class="main-premium">
      <!-- Sticky Header -->
      <div class="sticky-header-premium px-4 px-sm-6 py-3">
        <v-container fluid class="pa-0">
          <v-row align="center" no-gutters>
            <v-col cols="8" sm="6">
              <div class="d-flex align-center">
                <v-btn v-if="nav_bars" icon small class="mr-2" @click="mobileDrawer = true" color="grey darken-1">
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
                <div>
                  <div class="d-flex align-center">
                    <h1 class="text-h6 text-sm-h5 font-weight-bold text--primary page-title">
                      {{ currentSectionTitle }}
                    </h1>
                    <v-chip
                      x-small
                      color="red lighten-5 red--text"
                      class="ml-2 font-weight-bold hidden-xs-only"
                      label
                      style="opacity: 0.8;"
                    >Admin</v-chip>
                  </div>
                  <div class="d-flex align-center mt-1">
                    <v-icon x-small color="success" class="mr-1">mdi-circle</v-icon>
                    <span class="text-caption text--secondary">{{ userName }} &middot; Online</span>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="4" sm="6" class="d-flex justify-end align-center">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    outlined
                    small
                    color="grey darken-1"
                    class="mr-2 refresh-btn"
                    @click="refreshAll"
                    :loading="loading"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon small>mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>Refresh Data</span>
              </v-tooltip>

              <v-btn icon small class="mr-2" @click="$vuetify.theme.dark = !$vuetify.theme.dark" color="grey darken-1">
                <v-icon small color="grey">{{ $vuetify.theme.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
              </v-btn>

              <v-menu offset-y transition="slide-y-transition" bottom rounded="xl">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    text
                    v-bind="attrs"
                    v-on="on"
                    class="text-capitalize rounded-xl px-2 user-btn-premium"
                  >
                    <v-avatar color="red lighten-4" size="36" class="mr-2">
                      <span class="red--text text--darken-2 font-weight-bold text-caption">{{ userInitials }}</span>
                    </v-avatar>
                    <span class="hidden-sm-and-down text-body-2 text--primary font-weight-semibold">{{ userName }}</span>
                    <v-icon small color="grey darken-1" class="ml-1">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list dense class="py-2 rounded-xl" min-width="220" elevation="4">
                  <div class="px-4 py-3 mb-1">
                    <div class="text-caption text--secondary mb-1">Signed in as</div>
                    <div class="text-body-2 font-weight-bold text--primary">{{ userName }}</div>
                    <div class="text-caption text--secondary">Administrator</div>
                  </div>
                  <v-divider class="mb-1"></v-divider>
                  <v-list-item @click="activeSection = 'dashboard'" class="rounded-lg mx-1">
                    <v-list-item-icon class="mr-3">
                      <v-icon small color="red darken-2">mdi-view-dashboard</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-body-2 font-weight-medium">Dashboard</v-list-item-title>
                  </v-list-item>
                  <v-list-item to="/dashboard" class="rounded-lg mx-1">
                    <v-list-item-icon class="mr-3">
                      <v-icon small color="grey">mdi-arrow-left</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-body-2">Back to App</v-list-item-title>
                  </v-list-item>
                  <v-divider class="my-1"></v-divider>
                  <v-list-item @click="logout" class="rounded-lg mx-1">
                    <v-list-item-icon class="mr-3">
                      <v-icon small color="error">mdi-logout</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="text-body-2 error--text font-weight-medium">Sign Out</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- ==================== DASHBOARD SECTION ==================== -->
      <v-container v-if="activeSection === 'dashboard'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <!-- Maker-checker banner -->
        <v-alert
          v-if="pendingApprovalCode"
          type="warning"
          prominent
          text
          dismissible
          class="mb-4 rounded-2xl"
          @input="pendingApprovalCode = null"
        >
          <div class="font-weight-bold">Change submitted for approval</div>
          <div class="text-caption">
            Code <strong>{{ pendingApprovalCode }}</strong>. Super admins have been notified by SMS.
          </div>
        </v-alert>

        <!-- KPI Cards -->
        <v-row dense class="mb-4 mb-sm-6">
          <v-col
            cols="6"
            lg="3"
            v-for="(card, i) in kpiCards"
            :key="i"
            class="reveal-card"
            :style="{ 'animation-delay': i * 100 + 'ms' }"
          >
            <v-card
              class="pa-4 pa-sm-5 rounded-2xl h-100 kpi-card-premium"
              elevation="0"
              outlined
            >
              <div class="d-flex align-start justify-space-between mb-3">
                <v-avatar :color="card.iconBg" size="48" class="elevation-0 kpi-avatar-premium">
                  <v-icon :color="card.iconColor" size="24">{{ card.icon }}</v-icon>
                </v-avatar>
                <v-chip
                  v-if="card.trend"
                  x-small
                  :color="card.trend >= 0 ? 'success lighten-5' : 'error lighten-5'"
                  :text-color="card.trend >= 0 ? 'success darken-2' : 'error darken-2'"
                  class="font-weight-bold trend-chip"
                  label
                >
                  <v-icon x-small left>{{ card.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                  {{ Math.abs(card.trend) }}%
                </v-chip>
              </div>
              <div class="text-caption font-weight-bold text-uppercase mb-1 tracking-wide text--secondary">
                {{ card.label }}
              </div>
              <div class="text-h5 text-sm-h4 font-weight-bold text--primary">
                {{ card.value }}
              </div>
              <div v-if="card.subtitle" class="text-caption mt-1 font-weight-medium text--secondary">
                {{ card.subtitle }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions -->
        <v-row class="mb-4 mb-sm-6 reveal-card" style="animation-delay: 200ms">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4 pa-sm-5" elevation="0" outlined>
              <v-card-title class="px-0 pt-0 pb-3">
                <v-avatar color="red lighten-5" size="40" class="mr-3">
                  <v-icon color="red darken-2">mdi-lightning-bolt</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold text--primary">Quick Actions</span>
              </v-card-title>
              <v-row dense>
                <v-col v-for="action in quickActions" :key="action.section" cols="6" sm="3">
                  <v-btn
                    block
                    @click="activeSection = action.section"
                    class="rounded-xl text-capitalize py-5 action-btn-premium white--text"
                    :color="action.color"
                    dark
                    elevation="0"
                  >
                    <v-icon left size="20">{{ action.icon }}</v-icon>
                    <span class="font-weight-semibold">{{ action.label }}</span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts + Health Row -->
        <v-row class="mb-4 reveal-card" style="animation-delay: 250ms">
          <v-col cols="12" md="8">
            <v-card class="rounded-2xl h-100" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium">
                <div class="d-flex align-center">
                  <v-avatar color="info lighten-5" size="36" class="mr-3">
                    <v-icon color="info">mdi-chart-areaspline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Revenue Trend</div>
                    <div class="text-caption text--secondary">Monthly successful payments</div>
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-chip small color="red lighten-5 red--text" label class="font-weight-bold">
                  <v-icon x-small left color="red">mdi-check-circle</v-icon>
                  Live
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-4 pa-sm-6">
                <div class="chart-container" style="height: 280px; position: relative;">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" class="chart-svg">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#c62828" stop-opacity="0.15"></stop>
                        <stop offset="100%" stop-color="#c62828" stop-opacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path :d="chartAreaPath" fill="url(#chartGradient)"></path>
                    <path :d="chartLinePath" fill="none" stroke="#c62828" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
                    <circle v-for="(point, i) in chartPoints" :key="i" :cx="point.x" :cy="point.y" r="5" fill="white" stroke="#c62828" stroke-width="2.5"></circle>
                  </svg>
                  <div class="chart-labels d-flex justify-space-between px-8 mt-2">
                    <span v-for="(label, i) in chartLabels" :key="i" class="text-caption text--secondary">{{ label }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="rounded-2xl h-100" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium">
                <div class="d-flex align-center">
                  <v-avatar color="warning lighten-5" size="36" class="mr-3">
                    <v-icon color="warning">mdi-pulse</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Subscription Health</div>
                    <div class="text-caption text--secondary">Current status overview</div>
                  </div>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-4 pa-sm-6">
                <div class="health-grid">
                  <div class="health-item" v-for="stat in subStats" :key="stat.label">
                    <div class="health-ring-container">
                      <svg viewBox="0 0 36 36" class="health-ring">
                        <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                        <path class="ring-fill" :stroke="stat.color === 'success' ? '#c62828' : stat.color === 'warning' ? '#e53935' : '#b71c1c'" :stroke-dasharray="stat.pct + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                      </svg>
                      <span class="ring-value text--primary">{{ stat.pct }}%</span>
                    </div>
                    <div class="d-flex align-center mt-2">
                      <v-icon x-small :color="stat.color" class="mr-1">{{ stat.icon }}</v-icon>
                      <span class="text-caption font-weight-bold text--secondary">{{ stat.label }}</span>
                    </div>
                    <div class="text-h6 font-weight-bold text--primary mt-1">{{ stat.value }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activity -->
        <v-row class="reveal-card" style="animation-delay: 300ms">
          <v-col cols="12" md="6">
            <v-card class="rounded-2xl h-100" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium">
                <div class="d-flex align-center">
                  <v-avatar color="blue lighten-5" size="36" class="mr-3">
                    <v-icon color="blue">mdi-account-clock</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Recent Users</div>
                    <div class="text-caption text--secondary">New signups this week</div>
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-btn text small color="red darken-2" class="text-capitalize font-weight-medium red--text" @click="activeSection = 'users'">
                  View All
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-list class="pa-0">
                <v-list-item v-for="user in recentUsers" :key="user.id" class="py-3 px-4 px-sm-6 hover-row">
                  <v-list-item-avatar color="grey lighten-4" size="40">
                    <span class="text--secondary font-weight-bold text-caption">{{ getInitials(user.name) }}</span>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-semibold text--primary">{{ user.name || 'Unknown' }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption text--secondary">{{ user.phone }} &middot; {{ user.user_type }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-chip
                      :color="user.subscription_status === 'active' ? 'success lighten-5' : 'grey lighten-4'"
                      :text-color="user.subscription_status === 'active' ? 'success darken-2' : 'grey darken-1'"
                      x-small
                      label
                      class="font-weight-medium"
                    >
                      {{ user.subscription_status }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item v-if="recentUsers.length === 0" class="py-8 text-center">
                  <v-list-item-content>
                    <v-icon large color="grey lighten-2" class="mb-2">mdi-account-off</v-icon>
                    <div class="text-caption text--secondary">No recent users</div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="rounded-2xl h-100" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium">
                <div class="d-flex align-center">
                  <v-avatar color="orange lighten-5" size="36" class="mr-3">
                    <v-icon color="orange">mdi-cash-clock</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold text--primary">Pending Payments</div>
                    <div class="text-caption text--secondary">Awaiting manual confirmation</div>
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-btn text small color="red darken-2" class="text-capitalize font-weight-medium red--text" @click="activeSection = 'payments'">
                  View All
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-list class="pa-0">
                <v-list-item v-for="pay in pendingPayments" :key="pay.id" class="py-3 px-4 px-sm-6 hover-row">
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-semibold text--primary">
                      {{ pay.user_name || 'User #' + pay.user_id }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text--secondary">
                      <span class="font-weight-bold red--text">KES {{ Number(pay.amount).toLocaleString() }}</span> &middot; {{ pay.subscription }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn x-small color="success" class="rounded-lg font-weight-medium" @click="confirmPayment(pay.id)" elevation="0">
                      <v-icon x-small left>mdi-check</v-icon> Confirm
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item v-if="pendingPayments.length === 0" class="py-8 text-center">
                  <v-list-item-content>
                    <v-icon large color="grey lighten-2" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-caption text--secondary">No pending payments</div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- ==================== APPROVALS SECTION ==================== -->
      <v-container v-if="activeSection === 'approvals'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <v-row>
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="d-flex align-center px-4 px-sm-6 py-4 card-header-premium">
                <v-avatar color="warning lighten-5" size="36" class="mr-3">
                  <v-icon color="warning darken-2">mdi-shield-key</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text--primary">Pending Approvals</div>
                  <div class="text-caption text--secondary">
                    Changes awaiting super-admin review ({{ pendingRequests.length }})
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  small
                  color="red darken-2"
                  class="text-capitalize font-weight-medium red--text"
                  :loading="pendingRequestsLoading"
                  @click="fetchPendingRequests"
                >
                  <v-icon left small>mdi-refresh</v-icon> Refresh
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>

              <div v-if="pendingRequests.length === 0" class="pa-12 text-center">
                <v-icon size="56" color="grey lighten-2">mdi-check-all</v-icon>
                <div class="text-h6 grey--text text--darken-1 mt-3">All clear</div>
                <div class="text-body-2 grey--text">No pending change requests.</div>
              </div>

              <v-data-table
                v-else
                :headers="approvalHeaders"
                :items="pendingRequests"
                item-key="id"
                :loading="pendingRequestsLoading"
                class="entries-table-premium"
                hide-default-footer
                :items-per-page="-1"
              >
                <template v-slot:item.request_code="{ item }">
                  <v-chip small label color="warning lighten-5" class="font-weight-bold">
                    <span class="warning--text text--darken-2">{{ item.request_code }}</span>
                  </v-chip>
                </template>

                <template v-slot:item.action="{ item }">
                  <div class="d-flex align-center">
                    <v-icon small color="red darken-2" class="mr-2">{{ actionIcon(item.action) }}</v-icon>
                    <span class="font-weight-medium text--primary">{{ actionLabel(item.action) }}</span>
                  </div>
                </template>

                <template v-slot:item.target="{ item }">
                  <span class="text-caption text--secondary">
                    {{ item.target_type }}<span class="font-weight-bold">#{{ item.target_id || 'new' }}</span>
                  </span>
                </template>

                <template v-slot:item.maker_name="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="28" color="red lighten-5" class="mr-2">
                      <span class="red--text font-weight-bold text-caption">{{ getInitials(item.maker_name || '?') }}</span>
                    </v-avatar>
                    <span class="font-weight-medium">{{ item.maker_name || item.maker_uid }}</span>
                  </div>
                </template>

                <template v-slot:item.expires_at="{ item }">
                  <v-chip x-small label :color="expiryColor(item.expires_at)" text-color="white" class="font-weight-bold">
                    {{ timeLeft(item.expires_at) }}
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn
                    text
                    x-small
                    color="error"
                    class="text-capitalize font-weight-medium mr-1"
                    @click="decideChange(item.request_code, 'reject')"
                  >
                    <v-icon x-small left>mdi-close</v-icon> Reject
                  </v-btn>
                  <v-btn
                    x-small
                    color="success"
                    dark
                    class="rounded-lg font-weight-medium"
                    elevation="0"
                    @click="decideChange(item.request_code, 'approve')"
                  >
                    <v-icon x-small left>mdi-check</v-icon> Approve
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- ==================== PLANS SECTION ==================== -->
      <v-container v-if="activeSection === 'plans'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <v-row>
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="d-flex align-center px-4 px-sm-6 py-4 card-header-premium">
                <v-avatar color="red lighten-5" size="36" class="mr-3">
                  <v-icon color="red darken-2">mdi-tag-multiple</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold text--primary">Subscription Plans</span>
                <v-spacer></v-spacer>
                <v-btn color="red darken-2" dark class="rounded-xl font-weight-semibold" @click="openPlanDialog()" elevation="0">
                  <v-icon left size="18">mdi-plus</v-icon> Add Plan
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table
                :headers="planHeaders"
                :items="plans"
                item-key="id"
                :loading="loading"
                class="entries-table-premium"
                hide-default-footer
                :items-per-page="-1"
              >
                <template v-slot:item.price_kes="{ item }">
                  <span class="font-weight-bold text--primary">KES {{ Number(item.price_kes).toLocaleString() }}</span>
                  <span class="text-caption text--secondary">/{{ item.billing_cycle }}</span>
                </template>
                <template v-slot:item.is_active="{ item }">
                  <v-switch
                    v-model="item.is_active"
                    @change="togglePlanStatus(item)"
                    dense
                    hide-details
                    :color="item.is_active ? 'success' : 'grey'"
                    class="mt-0"
                  ></v-switch>
                </template>
                <template v-slot:item.features="{ item }">
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip v-for="(feat, i) in parseFeatures(item.features).slice(0, 3)" :key="i" x-small class="mr-1 mb-1" label color="grey lighten-4 text--secondary">
                      {{ feat }}
                    </v-chip>
                    <v-chip v-if="parseFeatures(item.features).length > 3" x-small label color="red lighten-5 red--text">
                      +{{ parseFeatures(item.features).length - 3 }}
                    </v-chip>
                  </div>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon small class="mr-1 action-btn-hover" @click="openPlanDialog(item)">
                    <v-icon small color="red darken-2">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon small class="action-btn-hover" color="error" @click="deletePlan(item)">
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- ==================== USERS SECTION ==================== -->
      <v-container v-if="activeSection === 'users'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">

        <!-- ↓↓↓ NEW: SMS BALANCE CARD ↓↓↓ -->
        <v-row dense class="mb-4">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4" elevation="0" outlined>
              <div class="d-flex align-center flex-wrap" style="gap: 16px;">
                <v-avatar :color="smsBalanceOk ? 'purple lighten-5' : 'red lighten-5'" size="48">
                  <v-icon :color="smsBalanceOk ? 'purple darken-2' : 'red darken-2'">
                    mdi-message-text-outline
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-caption text-uppercase font-weight-bold text--secondary tracking-wide">
                    SMS Balance
                  </div>
                  <div class="text-h5 font-weight-bold text--primary">
                    <span v-if="smsBalanceLoading">Loading…</span>
                    <span v-else-if="smsBalanceError" class="red--text text--darken-2">
                      {{ smsBalanceError }}
                    </span>
                    <span v-else>KES {{ Number(smsBalance).toLocaleString() }}</span>
                  </div>
                  <div class="text-caption text--secondary">
                    <span v-if="smsBalanceUpdated">Updated {{ smsBalanceUpdated }}</span>
                    <span v-else>Advanta Bulk SMS credit</span>
                  </div>
                </div>
                <v-btn
                  text
                  color="red darken-2"
                  class="text-capitalize font-weight-medium"
                  :loading="smsBalanceLoading"
                  @click="fetchSmsBalance"
                >
                  <v-icon left small>mdi-refresh</v-icon> Refresh
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <!-- ↑↑↑ END NEW ↑↑↑ -->

        <v-row>
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="d-flex align-center px-4 px-sm-6 py-4 card-header-premium">
                <v-avatar color="blue lighten-5" size="36" class="mr-3">
                  <v-icon color="blue">mdi-account-group</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold text--primary">All Users</span>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="userSearch"
                  placeholder="Search users..."
                  dense
                  outlined
                  rounded
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  class="rounded-lg search-field-premium hidden-xs-only"
                  style="max-width: 260px"
                  clearable
                ></v-text-field>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table
                :headers="userHeaders"
                :items="filteredUsers"
                item-key="id"
                :loading="loading"
                class="entries-table-premium"
                hide-default-footer
                :items-per-page="-1"
              >
                <template v-slot:item.name="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="red lighten-5" class="mr-3">
                      <span class="red--text font-weight-bold text-caption">{{ getInitials(item.name) }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-semibold text--primary">{{ item.name || 'Unknown' }}</div>
                      <div class="text-caption text--secondary">{{ item.email || item.phone }}</div>
                    </div>
                  </div>
                </template>
                <template v-slot:item.subscription_status="{ item }">
                  <v-chip
                    :color="getStatusColor(item.subscription_status) + ' lighten-5'"
                    :text-color="getStatusColor(item.subscription_status) + ' darken-2'"
                    small
                    label
                    class="font-weight-medium"
                  >
                    {{ item.subscription_status }}
                  </v-chip>
                </template>
                <template v-slot:item.days_left="{ item }">
                  <span v-if="item.days_left > 0" class="success--text text--darken-2 font-weight-bold">{{ item.days_left }} days</span>
                  <span v-else-if="item.days_left === 0" class="warning--text font-weight-bold">Today</span>
                  <span v-else class="text--disabled">&mdash;</span>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon small class="action-btn-hover mr-1" @click="openUserDialog(item, 'view')" title="View User">
                    <v-icon small color="red darken-2">mdi-eye</v-icon>
                  </v-btn>
                  <v-btn icon small class="action-btn-hover mr-1" @click="openUserDialog(item, 'edit')" title="Edit User">
                    <v-icon small color="red darken-2">mdi-pencil</v-icon>
                  </v-btn>
                  <!-- ↓↓↓ NEW: SEND SMS BUTTON ↓↓↓ -->
                  <v-btn
                    icon
                    small
                    class="action-btn-hover mr-1"
                    color="purple"
                    @click="openSendSmsDialog(item)"
                    title="Send SMS"
                  >
                    <v-icon small>mdi-message-text-outline</v-icon>
                  </v-btn>
                  <!-- ↑↑↑ END NEW ↑↑↑ -->
                  <v-btn
                    icon
                    small
                    class="action-btn-hover mr-1"
                    color="info"
                    @click="sendPasswordReset(item)"
                    title="Send password reset email"
                  >
                    <v-icon small>mdi-lock-reset</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    class="action-btn-hover mr-1"
                    color="success"
                    @click="startTrial(item)"
                    title="Start 30-day Trial"
                  >
                    <v-icon small>mdi-calendar-clock</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    class="action-btn-hover"
                    color="error"
                    @click="deleteUser(item)"
                    title="Delete User"
                  >
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- ==================== SUBSCRIPTIONS SECTION ==================== -->
      <v-container v-if="activeSection === 'subscriptions'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <v-row class="mb-4">
          <v-col v-for="stat in subStats" :key="stat.label" cols="6" sm="3">
            <v-card class="pa-4 rounded-2xl text-center" elevation="0" outlined>
              <v-icon size="28" :color="stat.color" class="mb-2">{{ stat.icon }}</v-icon>
              <div class="text-h4 font-weight-bold text--primary">{{ stat.value }}</div>
              <div class="text-caption text--secondary font-weight-medium">{{ stat.label }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="d-flex align-center px-4 px-sm-6 py-4 card-header-premium">
                <v-avatar color="purple lighten-5" size="36" class="mr-3">
                  <v-icon color="purple">mdi-calendar-check</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold text--primary">Subscriptions</span>
                <v-spacer></v-spacer>
                <v-select
                  v-model="subFilter.status"
                  :items="[{ text: 'Active', value: 'active' }, { text: 'Pending', value: 'pending' }, { text: 'Expired', value: 'expired' }, { text: 'All', value: 'all' }]"
                  dense
                  outlined
                  rounded
                  hide-details
                  class="rounded-lg mr-2"
                  style="max-width: 140px"
                  @change="fetchSubscriptions"
                ></v-select>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table
                :headers="subHeaders"
                :items="subscriptions"
                item-key="id"
                :loading="loading"
                class="entries-table-premium"
                hide-default-footer
                :items-per-page="-1"
              >
                <template v-slot:item.user_name="{ item }">
                  <div class="font-weight-semibold text--primary">{{ item.user_name || 'Unknown' }}</div>
                  <div class="text-caption text--secondary">{{ item.user_phone }}</div>
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip :color="getStatusColor(item.status) + ' lighten-5'" :text-color="getStatusColor(item.status) + ' darken-2'" small label class="font-weight-medium">
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.days_remaining="{ item }">
                  <v-progress-linear
                    :value="Math.max(0, Math.min(100, (item.days_remaining / 30) * 100))"
                    :color="item.expiry_status === 'critical' ? 'error' : item.expiry_status === 'warning' ? 'warning' : 'success'"
                    height="22"
                    rounded
                    class="mt-1"
                  >
                    <template v-slot:default>
                      <span class="white--text text-caption font-weight-medium">
                        {{ item.days_remaining > 0 ? item.days_remaining + ' days' : 'Expired' }}
                      </span>
                    </template>
                  </v-progress-linear>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-menu offset-y rounded="lg">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon small v-bind="attrs" v-on="on" class="action-btn-hover">
                        <v-icon small color="grey">mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list dense class="py-2 rounded-lg">
                      <v-list-item @click="renewSub(item)" class="rounded-lg mx-1">
                        <v-list-item-icon class="mr-3"><v-icon color="success" small>mdi-calendar-refresh</v-icon></v-list-item-icon>
                        <v-list-item-title class="text-body-2">Renew</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="extendSub(item)" class="rounded-lg mx-1">
                        <v-list-item-icon class="mr-3"><v-icon color="info" small>mdi-calendar-plus</v-icon></v-list-item-icon>
                        <v-list-item-title class="text-body-2">Extend Days</v-list-item-title>
                      </v-list-item>
                      <v-divider class="my-1"></v-divider>
                      <v-list-item @click="cancelSub(item)" :disabled="item.status === 'cancelled'" class="rounded-lg mx-1">
                        <v-list-item-icon class="mr-3"><v-icon color="error" small>mdi-cancel</v-icon></v-list-item-icon>
                        <v-list-item-title class="text-body-2 error--text">Cancel</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- ==================== PAYMENTS SECTION ==================== -->
      <v-container v-if="activeSection === 'payments'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <v-row>
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="d-flex align-center px-4 px-sm-6 py-4 card-header-premium">
                <v-avatar color="green lighten-5" size="36" class="mr-3">
                  <v-icon color="green">mdi-cash-multiple</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold text--primary">Payment History</span>
                <v-spacer></v-spacer>
                <v-chip small color="red lighten-5 red--text" label class="font-weight-bold">
                  Only successful payments count as revenue
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table
                :headers="paymentHeaders"
                :items="payments"
                item-key="id"
                :loading="loading"
                class="entries-table-premium"
                hide-default-footer
                :items-per-page="-1"
              >
                <template v-slot:item.amount="{ item }">
                  <span class="font-weight-bold text--primary">KES {{ Number(item.amount).toLocaleString() }}</span>
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip :color="getStatusColor(item.status) + ' lighten-5'" :text-color="getStatusColor(item.status) + ' darken-2'" x-small label class="font-weight-bold">
                    <v-icon x-small left>{{ item.status === 'success' ? 'mdi-check-circle' : item.status === 'pending' ? 'mdi-clock' : 'mdi-close-circle' }}</v-icon>
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.mpesa_receipt="{ item }">
                  <v-chip v-if="item.mpesa_receipt && item.status === 'success'" color="success lighten-5" text-color="success darken-2" small label class="font-weight-medium">
                    <v-icon x-small left color="success">mdi-check</v-icon>
                    {{ item.mpesa_receipt }}
                  </v-chip>
                  <v-chip v-else-if="item.mpesa_receipt && item.status === 'failed'" color="error lighten-5" text-color="error darken-2" small label class="font-weight-medium">
                    <v-icon x-small left color="error">mdi-close-circle</v-icon>
                    {{ item.mpesa_receipt }}
                  </v-chip>
                  <v-chip v-else-if="item.mpesa_receipt && item.status === 'pending'" color="warning lighten-5" text-color="warning darken-2" small label class="font-weight-medium">
                    <v-icon x-small left color="warning">mdi-clock</v-icon>
                    {{ item.mpesa_receipt }}
                  </v-chip>
                  <v-chip v-else color="grey lighten-4" text-color="grey darken-1" small label class="font-weight-medium">
                    <v-icon x-small left color="grey">mdi-minus-circle</v-icon>
                    None
                  </v-chip>
                </template>
                <template v-slot:item.created_at="{ item }">
                  <span class="text-caption text--secondary">{{ new Date(item.created_at).toLocaleString() }}</span>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn v-if="item.status !== 'success'" x-small color="success" class="rounded-lg font-weight-medium" @click="confirmPayment(item.id)" elevation="0">
                    <v-icon x-small left>mdi-check</v-icon> Confirm
                  </v-btn>
                  <span v-else class="text-caption success--text font-weight-medium">
                    <v-icon x-small left color="red">mdi-check-circle</v-icon> Completed
                  </span>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- ==================== FINANCE SECTION ==================== -->
      <v-container v-if="activeSection === 'finance'" :fluid="nav_bars" class="px-4 px-sm-6 pt-2 pt-sm-4 pb-8">
        <v-row dense class="mb-4">
          <v-col v-for="card in financeCards" :key="card.title" cols="12" sm="6" md="3">
            <v-card :color="card.color" dark class="pa-5 rounded-2xl finance-card" elevation="0">
              <div class="d-flex align-center mb-2">
                <v-icon small class="mr-1 opacity-70">mdi-calendar</v-icon>
                <div class="text-caption text-uppercase font-weight-bold opacity-80">{{ card.title }}</div>
              </div>
              <div class="text-h4 font-weight-bold mb-1">KES {{ card.value }}</div>
              <div class="text-caption opacity-70">{{ card.subtitle }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-4 pa-sm-5" elevation="0" outlined>
              <v-row align="center">
                <v-col cols="12" sm="3">
                  <v-menu v-model="startMenu" :close-on-content-click="false" offset-y rounded="lg">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="financeFilters.start_date" label="Start Date" readonly v-bind="attrs" v-on="on" outlined rounded dense hide-details prepend-inner-icon="mdi-calendar-start" ></v-text-field>
                    </template>
                    <v-date-picker v-model="financeFilters.start_date" @input="startMenu = false" ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-menu v-model="endMenu" :close-on-content-click="false" offset-y rounded="lg">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="financeFilters.end_date" label="End Date" readonly v-bind="attrs" v-on="on" outlined rounded dense hide-details prepend-inner-icon="mdi-calendar-end" ></v-text-field>
                    </template>
                    <v-date-picker v-model="financeFilters.end_date" @input="endMenu = false" ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select v-model="financeFilters.group_by" :items="[{ text: 'Daily', value: 'day' }, { text: 'Monthly', value: 'month' }]" label="Group By" outlined rounded dense hide-details prepend-inner-icon="mdi-view-grid" ></v-select>
                </v-col>
                <v-col cols="12" sm="3" class="d-flex">
                  <v-btn color="red darken-2" dark class="rounded-xl mr-2 font-weight-semibold" @click="fetchRevenue" elevation="0">
                    <v-icon left size="18">mdi-refresh</v-icon> Update
                  </v-btn>
                  <v-btn outlined color="red darken-2" class="rounded-xl font-weight-semibold red--text text--darken-2" @click="exportCSV" elevation="0">
                    <v-icon left size="18" color="red darken-2">mdi-download</v-icon> CSV
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="0" outlined>
              <v-card-title class="px-4 px-sm-6 py-4 card-header-premium">
                <v-avatar color="red lighten-5" size="36" class="mr-3">
                  <v-icon color="red darken-2">mdi-chart-bar</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold red--text text--darken-2">Revenue Breakdown</span>
                <v-spacer></v-spacer>
                <v-chip small color="red lighten-5 red--text" label class="font-weight-bold">
                  <v-icon x-small left color="red">mdi-information</v-icon>
                  Success payments only
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table
                :headers="revenueHeaders"
                :items="revenueData"
                item-key="period"
                :loading="loading"
                class="entries-table-premium"
                hide-default-footer
                :items-per-page="-1"
              >
                <template v-slot:item.total_revenue="{ item }">
                  <span class="font-weight-bold red--text text--darken-2">KES {{ Number(item.total_revenue).toLocaleString() }}</span>
                </template>
                <template v-slot:item.confirmed_revenue="{ item }">
                  <span class="success--text font-weight-bold">KES {{ Number(item.confirmed_revenue).toLocaleString() }}</span>
                </template>
                <template v-slot:item.pending_revenue="{ item }">
                  <span class="warning--text font-weight-bold">KES {{ Number(item.pending_revenue).toLocaleString() }}</span>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="4000"
        bottom
        rounded="pill"
        class="mb-6 snackbar-premium"
        elevation="6"
      >
        <div class="d-flex align-center">
          <v-avatar :color="snackbar.color === 'success' ? 'success darken-2' : 'error darken-2'" size="28" class="mr-3">
            <v-icon color="white" small>{{ snackbar.color === 'success' ? 'mdi-check' : 'mdi-alert' }}</v-icon>
          </v-avatar>
          <span class="font-weight-medium">{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-main>

    <!-- ==================== DIALOGS ==================== -->

    <!-- Plan Dialog -->
    <v-dialog v-model="planDialog" max-width="600" rounded="xl">
      <v-card class="rounded-2xl overflow-hidden">
        <v-toolbar color="red darken-2" dark flat height="72" class="dialog-toolbar-premium">
          <v-btn icon dark @click="planDialog = false"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title class="text-h6 font-weight-bold">{{ editPlanMode ? 'Edit Plan' : 'New Plan' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn text dark class="text-capitalize font-weight-bold rounded-lg" @click="savePlan" :disabled="!planValid">
            Save Plan
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4 pa-sm-6 bg-surface">
          <v-form ref="planForm" v-model="planValid">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="planForm.name" label="Plan Code" :rules="[v => !!v || 'Required']" :disabled="editPlanMode" outlined rounded dense hide-details="auto" class="mb-4" ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="planForm.display_name" label="Display Name" :rules="[v => !!v || 'Required']" outlined rounded dense hide-details="auto" class="mb-4" ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model.number="planForm.price_kes" label="Price (KES)" type="number" prefix="KES" :rules="[v => v >= 0 || 'Invalid']" outlined rounded dense hide-details="auto" class="mb-4" ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="planForm.billing_cycle" :items="['monthly', 'yearly']" label="Billing Cycle" outlined rounded dense hide-details="auto" class="mb-4" ></v-select>
              </v-col>
            </v-row>
            <v-textarea v-model="planForm.description" label="Description" rows="2" outlined rounded dense hide-details="auto" class="mb-4" ></v-textarea>
            <v-combobox v-model="planForm.features" label="Features (press Enter to add)" multiple chips clearable outlined rounded dense hide-details="auto" ></v-combobox>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- User Dialog -->
    <v-dialog v-model="userDialog" max-width="500" rounded="xl">
      <v-card class="rounded-2xl overflow-hidden">
        <v-toolbar color="red darken-2" dark flat height="72" class="dialog-toolbar-premium">
          <v-btn icon dark @click="userDialog = false"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title class="text-h6 font-weight-bold">{{ userDialogMode === 'view' ? 'View User' : 'Edit User' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn v-if="userDialogMode !== 'view'" text dark class="text-capitalize font-weight-bold rounded-lg" @click="saveUser">
            Save Changes
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4 pa-sm-6 bg-surface">
          <v-form ref="userForm" v-model="userValid">
            <v-text-field v-model="userForm.name" label="Full Name" :readonly="userDialogMode === 'view'" outlined rounded dense hide-details="auto" class="mb-4" prepend-inner-icon="mdi-account" ></v-text-field>
            <v-text-field v-model="userForm.phone" label="Phone Number" :readonly="userDialogMode === 'view'" outlined rounded dense hide-details="auto" class="mb-4" prepend-inner-icon="mdi-phone" ></v-text-field>
            <v-select v-model="userForm.user_type" :items="['WholeSeller', 'Retailer', 'Distributor', 'Admin']" label="User Type" :readonly="userDialogMode === 'view'" outlined rounded dense hide-details="auto" class="mb-4" prepend-inner-icon="mdi-briefcase" ></v-select>
            <v-select v-model="userForm.subscription_status" :items="['free', 'active', 'expired', 'pending', 'cancelled']" label="Subscription Status" :readonly="userDialogMode === 'view'" outlined rounded dense hide-details="auto" class="mb-4" prepend-inner-icon="mdi-shield-check" ></v-select>
            <v-select v-model="userForm.plan_id" :items="plans" item-text="display_name" item-value="id" label="Assign Plan" :readonly="userDialogMode === 'view'" clearable outlined rounded dense hide-details="auto" class="mb-4" prepend-inner-icon="mdi-tag" ></v-select>
            <v-text-field v-model="userForm.subscription_expires" label="Subscription Expires" type="date" :readonly="userDialogMode === 'view'" outlined rounded dense hide-details="auto" prepend-inner-icon="mdi-calendar" ></v-text-field>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Renew Dialog -->
    <v-dialog v-model="renewDialog" max-width="420" rounded="xl">
      <v-card class="rounded-2xl pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4 pb-2">
          <v-avatar color="success lighten-5" size="36" class="mr-3">
            <v-icon color="success">mdi-calendar-refresh</v-icon>
          </v-avatar>
          Renew Subscription
        </v-card-title>
        <v-card-text class="px-4 py-3">
          <div class="mb-4 pa-3 rounded-xl" :class="$vuetify.theme.dark ? 'grey darken-4' : 'grey lighten-4'">
            <div class="d-flex align-center mb-2">
              <v-avatar size="32" color="red lighten-5" class="mr-3">
                <span class="red--text font-weight-bold text-caption">{{ getInitials(selectedSub ? selectedSub.user_name : '') }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-bold text--primary">{{ selectedSub ? selectedSub.user_name : '' }}</div>
                <div class="text-caption text--secondary">{{ selectedSub ? selectedSub.plan_name : '' }}</div>
              </div>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-caption">
              <span class="text--secondary">Current Expiry:</span>
              <span class="font-weight-medium text--primary">{{ selectedSub ? selectedSub.end_date : '' }}</span>
            </div>
          </div>
          <v-select v-model="renewMonths" :items="[1, 3, 6, 12]" label="Renewal Period (Months)" outlined rounded dense hide-details prepend-inner-icon="mdi-calendar-range" ></v-select>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn text class="text-capitalize font-weight-medium rounded-lg" @click="renewDialog = false">Cancel</v-btn>
          <v-btn color="success" dark class="rounded-xl font-weight-semibold" @click="confirmRenew" elevation="0">
            <v-icon left size="18">mdi-check</v-icon> Renew Now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Extend Dialog -->
    <v-dialog v-model="extendDialog" max-width="420" rounded="xl">
      <v-card class="rounded-2xl pa-2">
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4 pb-2">
          <v-avatar color="info lighten-5" size="36" class="mr-3">
            <v-icon color="info">mdi-calendar-plus</v-icon>
          </v-avatar>
          Extend Subscription
        </v-card-title>
        <v-card-text class="px-4 py-3">
          <div class="mb-4 pa-3 rounded-xl" :class="$vuetify.theme.dark ? 'grey darken-4' : 'grey lighten-4'">
            <div class="d-flex align-center">
              <v-avatar size="32" color="red lighten-5" class="mr-3">
                <span class="red--text font-weight-bold text-caption">{{ getInitials(selectedSub ? selectedSub.user_name : '') }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-bold text--primary">{{ selectedSub ? selectedSub.user_name : '' }}</div>
                <div class="text-caption text--secondary">Add extra days to current subscription</div>
              </div>
            </div>
          </div>
          <v-text-field v-model.number="extendDays" label="Additional Days" type="number" outlined rounded dense hide-details prepend-inner-icon="mdi-calendar-clock" ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn text class="text-capitalize font-weight-medium rounded-lg" @click="extendDialog = false">Cancel</v-btn>
          <v-btn color="info" dark class="rounded-xl font-weight-semibold" @click="confirmExtend" elevation="0">
            <v-icon left size="18">mdi-plus</v-icon> Extend
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ↓↓↓ NEW: SEND SMS DIALOG ↓↓↓ -->
    <v-dialog v-model="sendSmsDialog" max-width="520" rounded="xl">
      <v-card class="rounded-2xl overflow-hidden">
        <v-toolbar color="red darken-2" dark flat height="72" class="dialog-toolbar-premium">
          <v-btn icon dark @click="sendSmsDialog = false"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title class="text-h6 font-weight-bold">Send SMS</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            text
            dark
            class="text-capitalize font-weight-bold rounded-lg"
            :loading="sendSmsLoading"
            :disabled="!sendSmsForm.message || sendSmsForm.message.length > 480"
            @click="submitSendSms"
          >
            Send
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 pa-sm-6 bg-surface">
          <div class="mb-4 pa-3 rounded-xl" :class="$vuetify.theme.dark ? 'grey darken-4' : 'grey lighten-4'">
            <div class="d-flex align-center">
              <v-avatar size="36" color="red lighten-5" class="mr-3">
                <span class="red--text font-weight-bold text-caption">
                  {{ getInitials(sendSmsForm.userName || '?') }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-bold text--primary">
                  {{ sendSmsForm.userName || 'User' }}
                </div>
                <div class="text-caption text--secondary">
                  {{ sendSmsForm.to || 'No phone on file' }}
                </div>
              </div>
            </div>
          </div>

          <label class="form-label">Send to</label>
          <v-text-field
            v-model="sendSmsForm.to"
            placeholder="2547XXXXXXXX"
            outlined
            rounded
            dense
            hide-details="auto"
            prepend-inner-icon="mdi-phone-outline"
            class="rounded-lg mb-4"
            hint="Leave as-is or override with another number"
            persistent-hint
          />

          <label class="form-label">Message</label>
          <v-textarea
            v-model="sendSmsForm.message"
            placeholder="Type your message…"
            outlined
            rounded
            rows="4"
            hide-details="auto"
            class="rounded-lg"
            :rules="[v => (v || '').length <= 480 || 'Max 480 characters']"
            counter="480"
            maxlength="480"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- ↑↑↑ END NEW ↑↑↑ -->
  </div>
</template>
<script>
import api from '@/services/api'

export default {
  name: 'AdminPage',
  data() {
    return {
      nav_bars: false,
      mobileDrawer: false,
      activeSection: 'dashboard',
      loading: false,
      userName: 'Admin',
      stats: {
        totalUsers: 0,
        totalBusinesses: 0,
        totalBranches: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingApprovals: 0
      },
      recentUsers: [],
      pendingPayments: [],
      plans: [],
      // ── Maker-checker state ──
      pendingRequests: [],
      pendingRequestsLoading: false,
      pendingApprovalCode: null,
      users: [],
      subscriptions: [],
      payments: [],
      revenueData: [],
      revenueSummary: {},
      userSearch: '',
      subFilter: { status: 'active' },
      financeFilters: {
        start_date: new Date(new Date().setDate(1)).toISOString().substr(0, 10),
        end_date: new Date().toISOString().substr(0, 10),
        group_by: 'day'
      },
      startMenu: false,
      endMenu: false,
      planDialog: false,
      editPlanMode: false,
      planValid: false,
      planForm: { name: '', display_name: '', price_kes: 0, billing_cycle: 'monthly', description: '', features: [] },
      selectedPlan: null,
      userDialog: false,
      userDialogMode: 'edit',
      userValid: false,
      userForm: { name: '', phone: '', user_type: '', subscription_status: '', plan_id: null, subscription_expires: '' },
      selectedUser: null,
      renewDialog: false,
      extendDialog: false,
      selectedSub: null,
      renewMonths: 1,
      extendDays: 7,
      snackbar: { show: false, text: '', color: 'red darken-1' },
      authUnsubscribe: null,
      _approvalPoll: null,
      chartData: [12000, 15000, 13500, 18000, 22000, 24000],

      // ── SMS balance state ──
      smsBalance: 0,
      smsBalanceLoading: false,
      smsBalanceError: null,
      smsBalanceOk: false,
      smsBalanceUpdated: null,

      // ── Send SMS dialog state ──
      sendSmsDialog: false,
      sendSmsLoading: false,
      sendSmsForm: { userId: null, userName: '', to: '', message: '' }
    }
  },
  computed: {
    userInitials() {
      return this.userName.substring(0, 2).toUpperCase()
    },
    currentSectionTitle() {
      const titles = {
        dashboard: 'Dashboard',
        plans: 'Subscription Plans',
        users: 'User Management',
        subscriptions: 'Active Subscriptions',
        payments: 'Payment History',
        finance: 'Revenue & Finance',
        approvals: 'Pending Approvals'
      }
      return titles[this.activeSection] || 'Admin'
    },
    menuItems() {
      return [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', section: 'dashboard' },
        { title: 'Plans', icon: 'mdi-tag-multiple', section: 'plans' },
        { title: 'Users', icon: 'mdi-account-group', section: 'users' },
        { title: 'Subscriptions', icon: 'mdi-calendar-check', section: 'subscriptions' },
        { title: 'Payments', icon: 'mdi-cash-multiple', section: 'payments' },
        { title: 'Finance', icon: 'mdi-chart-line', section: 'finance' },
        { title: 'Approvals', icon: 'mdi-shield-key', section: 'approvals' }
      ]
    },
    approvalHeaders() {
      return [
        { text: 'Code', value: 'request_code', sortable: false },
        { text: 'Action', value: 'action', sortable: false },
        { text: 'Target', value: 'target', sortable: false },
        { text: 'Requested by', value: 'maker_name', sortable: false },
        { text: 'Expires', value: 'expires_at', sortable: false, align: 'center' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ]
    },
    kpiCards() {
      return [
        { label: 'Total Users', value: this.stats.totalUsers, subtitle: 'Registered accounts', icon: 'mdi-account-group', iconBg: 'red lighten-5', iconColor: 'red darken-2' },
        { label: 'Businesses', value: this.stats.totalBusinesses, subtitle: this.stats.totalBranches + ' branches total', icon: 'mdi-store', iconBg: 'purple lighten-5', iconColor: 'purple' },
        { label: 'Active Subs', value: this.stats.activeSubscriptions, subtitle: this.stats.pendingApprovals + ' pending approval', icon: 'mdi-calendar-check', iconBg: 'success lighten-5', iconColor: 'success', trend: 12 },
        { label: 'Monthly Revenue', value: 'KES ' + Number(this.stats.monthlyRevenue).toLocaleString(), subtitle: 'Successful payments only', icon: 'mdi-cash-multiple', iconBg: 'warning lighten-5', iconColor: 'warning' }
      ]
    },
    quickActions() {
      return [
        { label: 'Add Plan', section: 'plans', icon: 'mdi-tag-plus', color: 'red darken-2', dark: true },
        { label: 'View Users', section: 'users', icon: 'mdi-account-search', color: 'red', dark: true },
        { label: 'Revenue', section: 'finance', icon: 'mdi-chart-bar', color: 'red lighten-1', dark: true },
        { label: 'Payments', section: 'payments', icon: 'mdi-cash-check', color: 'red darken-1', dark: true }
      ]
    },
    planHeaders() {
      return [
        { text: 'Name', value: 'display_name' },
        { text: 'Code', value: 'name' },
        { text: 'Price', value: 'price_kes' },
        { text: 'Cycle', value: 'billing_cycle' },
        { text: 'Features', value: 'features', sortable: false },
        { text: 'Active', value: 'is_active', align: 'center' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ]
    },
    userHeaders() {
      return [
        { text: 'User', value: 'name' },
        { text: 'Phone', value: 'phone' },
        { text: 'Type', value: 'user_type' },
        { text: 'Business', value: 'business_name' },
        { text: 'Plan', value: 'plan_name' },
        { text: 'Status', value: 'subscription_status', align: 'center' },
        { text: 'Days Left', value: 'days_left', align: 'center' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ]
    },
    filteredUsers() {
      if (!this.userSearch) return this.users
      const q = this.userSearch.toLowerCase()
      return this.users.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
    },
    subHeaders() {
      return [
        { text: 'User', value: 'user_name' },
        { text: 'Plan', value: 'plan' },
        { text: 'Status', value: 'status', align: 'center' },
        { text: 'Time Left', value: 'days_remaining' },
        { text: 'Dates', value: 'dates' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ]
    },
    subStats() {
      const total = this.subscriptions.length || 1
      const active = this.subscriptions.filter(s => s.status === 'active').length
      const expiring = this.subscriptions.filter(s => s.days_remaining <= 7 && s.days_remaining > 0).length
      const expired = this.subscriptions.filter(s => s.days_remaining <= 0).length
      return [
        { label: 'Total', value: this.subscriptions.length, color: 'red darken-2', icon: 'mdi-account-group', pct: 100 },
        { label: 'Active', value: active, color: 'red darken-1', icon: 'mdi-check-circle', pct: Math.round((active / total) * 100) },
        { label: 'Expiring', value: expiring, color: 'warning', icon: 'mdi-alert', pct: Math.round((expiring / total) * 100) },
        { label: 'Expired', value: expired, color: 'error', icon: 'mdi-calendar-remove', pct: Math.round((expired / total) * 100) }
      ]
    },
    paymentHeaders() {
      return [
        { text: 'ID', value: 'id' },
        { text: 'User', value: 'user_name' },
        { text: 'Amount', value: 'amount' },
        { text: 'Plan', value: 'plan_name' },
        { text: 'Status', value: 'status', align: 'center' },
        { text: 'Receipt', value: 'mpesa_receipt', align: 'center' },
        { text: 'Date', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ]
    },
    financeCards() {
      var s = this.revenueSummary
      return [
        { title: 'Today', value: Number(s.today || 0).toLocaleString(), color: 'red darken-2', subtitle: new Date().toLocaleDateString() },
        { title: '7 Days', value: Number(s.last_7_days || 0).toLocaleString(), color: 'red', subtitle: 'This week' },
        { title: '30 Days', value: Number(s.last_30_days || 0).toLocaleString(), color: 'red lighten-1', subtitle: 'This month' },
        { title: 'All Time', value: Number(s.total_all_time || 0).toLocaleString(), color: 'red darken-4', subtitle: (s.paying_customers || 0) + ' customers' }
      ]
    },
    revenueHeaders() {
      return [
        { text: 'Period', value: 'period' },
        { text: 'Transactions', value: 'transaction_count', align: 'center' },
        { text: 'Confirmed', value: 'confirmed_revenue' },
        { text: 'Pending', value: 'pending_revenue' },
        { text: 'Total', value: 'total_revenue' }
      ]
    },
    chartPoints() {
      const max = Math.max(...this.chartData) * 1.1
      const width = 800
      const height = 200
      const padding = 40
      return this.chartData.map((val, i) => ({
        x: padding + (i / (this.chartData.length - 1)) * (width - padding * 2),
        y: height - padding - ((val / max) * (height - padding * 2))
      }))
    },
    chartLinePath() {
      return this.chartPoints.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ')
    },
    chartAreaPath() {
      const last = this.chartPoints[this.chartPoints.length - 1]
      const first = this.chartPoints[0]
      return this.chartLinePath + ' L ' + last.x + ' ' + 200 + ' L ' + first.x + ' ' + 200 + ' Z'
    },
    chartLabels() {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const now = new Date()
      return this.chartData.map((_, i) => {
        const idx = (now.getMonth() - this.chartData.length + 1 + i + 12) % 12
        return months[idx]
      })
    }
  },
  watch: {
    activeSection(newVal) {
      this.loadSectionData(newVal)
      if (newVal === 'approvals') this.fetchPendingRequests()
      if (newVal === 'users') this.fetchSmsBalance()
    }
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
    this.authUnsubscribe = this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userName = user.displayName || 'Admin'
        this.refreshAll()
        this.fetchPendingRequests()
      } else {
        this.$router.push('/login')
      }
    })
    this._approvalPoll = setInterval(() => {
      if (this.$fire && this.$fire.auth && this.$fire.auth.currentUser) {
        this.fetchPendingRequests()
      }
    }, 30000)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    if (this.authUnsubscribe) this.authUnsubscribe()
    if (this._approvalPoll) clearInterval(this._approvalPoll)
  },
  methods: {
    getUid() {
      return this.$fire && this.$fire.auth && this.$fire.auth.currentUser
        ? this.$fire.auth.currentUser.uid
        : ''
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    onResize() {
      this.nav_bars = window.innerWidth < 768
    },
    async refreshAll() {
      this.loading = true
      await this.fetchStats()
      await this.fetchUsers()
      await this.fetchPayments()
      await this.fetchPlans()
      await this.fetchSubscriptions()
      await this.fetchRevenue()
      this.loading = false
    },
    async loadSectionData(section) {
      this.loading = true
      switch (section) {
        case 'dashboard': await Promise.all([this.fetchStats(), this.fetchUsers(), this.fetchPayments()]); break
        case 'plans': await this.fetchPlans(); break
        case 'users': await this.fetchUsers(); await this.fetchSmsBalance(); break
        case 'subscriptions': await this.fetchSubscriptions(); break
        case 'payments': await this.fetchPayments(); break
        case 'finance': await this.fetchRevenue(); break
        case 'approvals': await this.fetchPendingRequests(); break
      }
      this.loading = false
    },

    /* ─── DATA FETCHERS ─── */
    async fetchStats() {
      try {
        const uid = this.getUid()
        const { data } = await api.get('/admin/stats?uid=' + uid)
        this.stats = data.data || data
      } catch (err) {
        console.error(err)
      }
    },
    async fetchUsers() {
      try {
        const { data } = await api.get('/admin/users')
        var d = data.data || data
        this.users = Object.freeze(d)
        this.recentUsers = Object.freeze(d.slice(0, 5))
      } catch (err) { console.error(err) }
    },
    async fetchPayments() {
      try {
        const { data } = await api.get('/admin/payments')
        var d = data.data || data
        this.payments = Object.freeze(d)
        this.pendingPayments = Object.freeze(d.filter(p => p.status === 'pending').slice(0, 5))
      } catch (err) { console.error(err) }
    },
    async fetchPlans() {
      try {
        const { data } = await api.get('/admin/plans')
        this.plans = Object.freeze(data.data || data)
      } catch (err) { console.error(err) }
    },
    async fetchSubscriptions() {
      try {
        var params = { ...this.subFilter }
        if (params.status === 'all') delete params.status
        const { data } = await api.get('/admin/subscriptions', { params: params })
        this.subscriptions = Object.freeze(data.data || data)
      } catch (err) { console.error(err) }
    },
    async fetchRevenue() {
      try {
        const { data } = await api.get('/admin/revenue', { params: this.financeFilters })
        var d = data.data || data
        this.revenueData = Object.freeze(d.timeline || d)
        this.revenueSummary = d.summary || {}
      } catch (err) { console.error(err) }
    },

    /* ─── MAKER-CHECKER HELPERS ─── */
    isQueued(res) {
      return res && res.status === 202 && res.data && res.data.status === 'pending_approval'
    },
    showQueuedSnackbar(code) {
      this.pendingApprovalCode = code
      this.snackbar = {
        show: true,
        text: 'Submitted for approval. Code: ' + code + '. Super admins notified by SMS.',
        color: 'warning darken-2'
      }
      setTimeout(() => { this.snackbar.show = false }, 8000)
    },
    async fetchPendingRequests() {
      this.pendingRequestsLoading = true
      try {
        const { data } = await api.get('/admin/change-requests')
        this.pendingRequests = data.data || []
      } catch (err) {
        if (err.response && err.response.status === 403) {
          this.pendingRequests = []
        } else {
          console.error('fetchPendingRequests', err)
        }
      } finally {
        this.pendingRequestsLoading = false
      }
    },
    async decideChange(code, decision) {
      try {
        await api.post('/admin/change-requests/' + code + '/decide', { decision: decision })
        this.showSnackbar(
          decision === 'approve' ? 'Change approved and applied' : 'Change rejected',
          decision === 'approve' ? 'success' : 'info'
        )
        this.fetchPendingRequests()
      } catch (err) {
        this.showSnackbar((err.response && err.response.data && err.response.data.error) || 'Action failed', 'error')
      }
    },
    actionLabel(action) {
      return String(action).replace('.', ' › ')
    },
    actionIcon(action) {
      if (action.startsWith('plan.')) return 'mdi-currency-usd'
      if (action.startsWith('user.')) return 'mdi-account'
      if (action.startsWith('subscription.')) return 'mdi-credit-card'
      if (action.startsWith('payment.')) return 'mdi-cash'
      return 'mdi-shield-key'
    },
    expiryColor(ts) {
      const s = Math.floor((new Date(ts).getTime() - Date.now()) / 1000)
      if (s <= 60) return 'error'
      if (s <= 300) return 'warning darken-2'
      return 'success'
    },
    timeLeft(ts) {
      const s = Math.floor((new Date(ts).getTime() - Date.now()) / 1000)
      if (s <= 0) return 'expired'
      if (s < 60) return s + 's'
      const m = Math.floor(s / 60)
      if (m < 60) return m + 'm ' + (s % 60) + 's'
      return Math.floor(m / 60) + 'h'
    },

    /* ─── PLANS ─── */
    parseFeatures(features) {
      if (!features) return []
      if (typeof features === 'string') {
        try { return JSON.parse(features) } catch { return [] }
      }
      return features
    },
    openPlanDialog(item) {
      this.editPlanMode = !!item
      if (item) {
        this.planForm = {
          name: item.name,
          display_name: item.display_name,
          price_kes: item.price_kes,
          billing_cycle: item.billing_cycle,
          description: item.description || '',
          features: this.parseFeatures(item.features)
        }
        this.selectedPlan = item
      } else {
        this.planForm = { name: '', display_name: '', price_kes: 0, billing_cycle: 'monthly', description: '', features: [] }
        this.selectedPlan = null
      }
      this.planDialog = true
    },
    async savePlan() {
      try {
        let res
        if (this.editPlanMode) {
          res = await api.put('/admin/plans/' + this.selectedPlan.id, {
            display_name: this.planForm.display_name,
            price_kes: this.planForm.price_kes,
            billing_cycle: this.planForm.billing_cycle,
            description: this.planForm.description,
            features: this.planForm.features
          })
        } else {
          res = await api.post('/admin/plans', this.planForm)
        }
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          this.planDialog = false
          this.fetchPlans()
          return
        }
        this.showSnackbar(this.editPlanMode ? 'Plan updated' : 'Plan created')
        this.planDialog = false
        this.fetchPlans()
      } catch (err) {
        this.showSnackbar((err.response && err.response.data && err.response.data.error) || 'Save failed', 'error')
      }
    },
    async togglePlanStatus(item) {
      var action = item.is_active ? 'deactivate' : 'activate'
      if (!confirm(action + ' "' + item.display_name + '"?')) {
        item.is_active = !item.is_active
        return
      }
      try {
        const res = await api.patch('/admin/plans/' + item.id + '/status', { active: !item.is_active })
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          item.is_active = !item.is_active
          this.fetchPlans()
          return
        }
        this.showSnackbar('Plan ' + action + 'd')
        this.fetchPlans()
      } catch (err) {
        item.is_active = !item.is_active
        this.showSnackbar('Failed', 'error')
      }
    },
    async deletePlan(item) {
      if (!confirm('Delete "' + item.display_name + '" permanently?')) return
      try {
        const res = await api.delete('/admin/plans/' + item.id)
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          this.fetchPlans()
          return
        }
        this.showSnackbar('Plan deleted')
        this.fetchPlans()
      } catch (err) {
        this.showSnackbar((err.response && err.response.data && err.response.data.error) || 'Delete failed', 'error')
      }
    },

    /* ─── USERS ─── */
    openUserDialog(item, mode) {
      this.userDialogMode = mode || 'edit'
      this.selectedUser = item
      this.userForm = {
        name: item.name || '',
        phone: item.phone || '',
        user_type: item.user_type || 'Retailer',
        subscription_status: item.subscription_status || 'free',
        plan_id: item.plan_id || null,
        subscription_expires: item.subscription_expires || ''
      }
      this.userDialog = true
    },
    async saveUser() {
      try {
        const res1 = await api.put('/admin/users/' + this.selectedUser.id, {
          name: this.userForm.name,
          phone: this.userForm.phone,
          user_type: this.userForm.user_type,
          subscription_status: this.userForm.subscription_status,
          subscription_expires: this.userForm.subscription_expires
        })
        if (this.isQueued(res1)) {
          this.showQueuedSnackbar(res1.data.request_code)
          this.userDialog = false
          this.fetchUsers()
          return
        }
        if (this.userForm.plan_id && this.userForm.subscription_status === 'active') {
          const res2 = await api.put('/admin/users/' + this.selectedUser.id + '/subscription', {
            plan_id: this.userForm.plan_id,
            subscription_status: 'active',
            months: 1
          })
          if (this.isQueued(res2)) {
            this.showQueuedSnackbar(res2.data.request_code)
            this.userDialog = false
            this.fetchUsers()
            return
          }
        }
        this.showSnackbar('User updated')
        this.userDialog = false
        this.fetchUsers()
      } catch (err) {
        this.showSnackbar((err.response && err.response.data && err.response.data.error) || 'Update failed', 'error')
      }
    },
    async deleteUser(item) {
      if (!confirm('Are you sure you want to permanently delete "' + (item.name || 'this user') + '"?\n\nThis will also remove their payments and subscriptions.')) {
        return
      }
      try {
        const res = await api.delete('/admin/users/' + item.id)
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          return
        }
        this.showSnackbar('User deleted successfully')
        this.fetchUsers()
        this.fetchStats()
      } catch (err) {
        this.showSnackbar((err.response && err.response.data && err.response.data.error) || 'Failed to delete user', 'error')
      }
    },
    async sendPasswordReset(item) {
      if (!item.email) {
        this.showSnackbar('This user has no email on file', 'error')
        return
      }
      if (!confirm(`Send a password reset email to "${item.name || item.email}"?\n\nEmail: ${item.email}`)) {
        return
      }
      try {
        const res = await api.post(`/admin/users/${item.id}/send-password-reset`)
        this.showSnackbar(res.data.message || 'Reset email sent', 'success')
      } catch (err) {
        const msg = (err.response && err.response.data && err.response.data.error) || 'Could not send reset email'
        this.showSnackbar(msg, 'error')
      }
    },
    async startTrial(item) {
      if (!confirm('Put "' + (item.name || 'this user') + '" on a 30-day free trial?')) {
        return
      }
      try {
        const res = await api.post('/admin/users/' + item.id + '/trial', { days: 30 })
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          return
        }
        this.showSnackbar(res.data.message || 'Trial started successfully')
        this.fetchUsers()
        this.fetchStats()
        this.fetchSubscriptions()
      } catch (err) {
        this.showSnackbar((err.response && err.response.data && err.response.data.error) || 'Failed to start trial', 'error')
      }
    },
    getStatusColor(status) {
      var colors = { active: 'success', pending: 'warning', expired: 'error', cancelled: 'grey', free: 'info', success: 'success', failed: 'error' }
      return colors[status] || 'grey'
    },

    /* ─── SMS BALANCE ─── */
    async fetchSmsBalance() {
      this.smsBalanceLoading = true
      this.smsBalanceError = null
      try {
        const { data } = await api.get('/admin/sms/balance')
        this.smsBalance = Number(data.balance) || 0
        this.smsBalanceOk = true
        this.smsBalanceUpdated = new Date().toLocaleTimeString()
      } catch (err) {
        this.smsBalanceOk = false
        this.smsBalanceError =
          (err.response && err.response.data && err.response.data.error) ||
          'Failed to load balance'
        this.smsBalance = 0
      } finally {
        this.smsBalanceLoading = false
      }
    },

    /* ─── SEND SMS ─── */
    openSendSmsDialog(user) {
      this.sendSmsForm = {
        userId: user.id,
        userName: user.name || '',
        to: user.phone || '',
        message: ''
      }
      this.sendSmsDialog = true
    },
    async submitSendSms() {
      if (!this.sendSmsForm.message || !this.sendSmsForm.message.trim()) {
        this.showSnackbar('Enter a message first', 'error')
        return
      }
      if (this.sendSmsForm.message.length > 480) {
        this.showSnackbar('Message too long (max 480 characters)', 'error')
        return
      }
      this.sendSmsLoading = true
      try {
        const { data } = await api.post(
          `/admin/users/${this.sendSmsForm.userId}/send-sms`,
          {
            to: this.sendSmsForm.to || undefined,
            message: this.sendSmsForm.message.trim()
          }
        )
        this.showSnackbar(data.message || 'SMS sent', 'success')
        this.sendSmsDialog = false
      } catch (err) {
        this.showSnackbar(
          (err.response && err.response.data && err.response.data.error) || 'Failed to send SMS',
          'error'
        )
      } finally {
        this.sendSmsLoading = false
      }
    },

    /* ─── SUBSCRIPTIONS ─── */
    renewSub(item) {
      this.selectedSub = item
      this.renewMonths = 1
      this.renewDialog = true
    },
    async confirmRenew() {
      try {
        const res = await api.post('/admin/subscriptions/' + this.selectedSub.id + '/renew', { months: this.renewMonths })
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          this.renewDialog = false
          return
        }
        this.showSnackbar('Renewed for ' + this.renewMonths + ' month(s)')
        this.renewDialog = false
        this.fetchSubscriptions()
      } catch (err) {
        this.showSnackbar('Renew failed', 'error')
      }
    },
    extendSub(item) {
      this.selectedSub = item
      this.extendDays = 7
      this.extendDialog = true
    },
    async confirmExtend() {
      try {
        const res = await api.post('/admin/subscriptions/' + this.selectedSub.id + '/extend', { days: this.extendDays })
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          this.extendDialog = false
          return
        }
        this.showSnackbar('Extended by ' + this.extendDays + ' days')
        this.extendDialog = false
        this.fetchSubscriptions()
      } catch (err) {
        this.showSnackbar('Extend failed', 'error')
      }
    },
    async cancelSub(item) {
      if (!confirm('Cancel subscription for ' + item.user_name + '?')) return
      try {
        const res = await api.post('/admin/subscriptions/' + item.id + '/cancel')
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          return
        }
        this.showSnackbar('Subscription cancelled')
        this.fetchSubscriptions()
      } catch (err) {
        this.showSnackbar('Cancel failed', 'error')
      }
    },

    /* ─── PAYMENTS ─── */
    async confirmPayment(id) {
      if (!confirm('Confirm this payment manually?')) return
      try {
        const res = await api.post('/admin/payments/confirm', { payment_id: id })
        if (this.isQueued(res)) {
          this.showQueuedSnackbar(res.data.request_code)
          return
        }
        this.showSnackbar('Payment confirmed')
        this.fetchPayments()
        this.fetchStats()
      } catch (err) {
        this.showSnackbar('Confirm failed', 'error')
      }
    },

    /* ─── MISC ─── */
    exportCSV() {
      var lines = []
      lines.push('Period,Transactions,Confirmed,Pending,Total')
      this.revenueData.forEach(function(row) {
        lines.push(row.period + ',' + row.transaction_count + ',' + row.confirmed_revenue + ',' + row.pending_revenue + ',' + row.total_revenue)
      })
      var csv = lines.join('\n')
      var blob = new Blob([csv], { type: 'text/csv' })
      var url = window.URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = 'revenue_' + this.financeFilters.start_date + '_to_' + this.financeFilters.end_date + '.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    },
    showSnackbar(text, color) {
      color = color || 'success'
      this.snackbar = { show: true, text: text, color: color }
    },
    logout() {
      this.$fire.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* ===== PREMIUM DESIGN SYSTEM ===== */
.cursor-pointer { cursor: pointer; }
.bg-surface { background-color: #f8fafc !important; }
.rounded-2xl { border-radius: 20px !important; }
.h-100 { height: 100%; }
.tracking-wide { letter-spacing: 0.08em; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal-card { animation: fadeInUp 0.6s ease-out both; }

/* Sidebar */
.sidebar-glass {
  background: rgba(255, 255, 255, 0.95) !important;
  border-right: 1px solid #e2e8f0 !important;
}
.sidebar-dark {
  background: rgba(15, 23, 42, 0.98) !important;
  border-right: 1px solid #334155 !important;
}

.brand-text {
  letter-spacing: -0.5px;
}
.brand-hover { transition: opacity 0.2s; }
.brand-hover:hover { opacity: 0.8; }

.nav-item-premium {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border-radius: 12px !important;
}
.nav-item-premium:hover {
  background-color: rgba(198, 40, 40, 0.06);
  transform: translateX(4px);
}

.premium-card {
  background: linear-gradient(135deg, rgba(198, 40, 40, 0.05) 0%, rgba(183, 28, 28, 0.05) 100%) !important;
  border: 1px solid rgba(198, 40, 40, 0.1) !important;
}

/* Main */
.main-premium { scroll-behavior: smooth; }

.sticky-header-premium {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.page-title {
  letter-spacing: -0.5px;
}

.user-btn-premium { transition: all 0.25s ease; }
.user-btn-premium:hover { background: rgba(198, 40, 40, 0.08); }

.refresh-btn { transition: all 0.2s ease; }
.refresh-btn:hover { border-color: #c62828; color: #c62828 !important; }

/* KPI Cards */
.kpi-card-premium {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  background: white;
}
.kpi-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06) !important;
  border-color: #cbd5e1;
}
.kpi-avatar-premium { transition: all 0.3s ease; }
.kpi-card-premium:hover .kpi-avatar-premium { transform: scale(1.08); }

.trend-chip { font-size: 11px !important; height: 22px !important; }

/* Action Buttons */
.action-btn-premium {
  transition: all 0.2s ease;
  font-weight: 600 !important;
  letter-spacing: 0.01em;
}
.action-btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

/* Card Headers */
.card-header-premium {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
}

/* Tables */
.entries-table-premium ::v-deep tbody tr {
  transition: background-color 0.2s ease;
}
.entries-table-premium ::v-deep tbody tr:hover {
  background-color: #f8fafc !important;
}
.entries-table-premium ::v-deep th {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 11px !important;
  letter-spacing: 0.05em;
  color: #64748b !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

/* Hover rows */
.hover-row { transition: background-color 0.2s ease; }
.hover-row:hover { background-color: #f8fafc !important; }

/* Action button hover (default red) */
.action-btn-hover { transition: all 0.2s ease; }
.action-btn-hover:hover { background: rgba(198, 40, 40, 0.1); }

/* ─── NEW: Purple SMS button hover ─── */
.action-btn-hover[color="purple"]:hover { background: rgba(156, 39, 176, 0.1); }

/* Search field */
.search-field-premium ::v-deep .v-input__slot {
  transition: all 0.25s ease;
}
.search-field-premium ::v-deep .v-input__slot:hover,
.search-field-premium.v-input--is-focused ::v-deep .v-input__slot {
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);
}

/* Snackbar */
.snackbar-premium ::v-deep .v-snackbar__content {
  padding: 12px 20px;
}

/* Dialog */
.dialog-toolbar-premium {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%) !important;
}

/* ─── NEW: Form labels used in the Send SMS dialog ─── */
.form-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Finance cards */
.finance-card {
  position: relative;
  overflow: hidden;
}
.finance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

/* Mobile nav */
.bottom-nav-premium {
  border-top: 1px solid #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
}
.mobile-nav-btn { min-width: 0 !important; }
.mobile-nav-label { font-size: 10px; margin-top: 2px; }

/* Chart */
.chart-container { position: relative; }
.chart-svg { width: 100%; height: 200px; }
.chart-labels { padding: 0 2rem; }

/* Health rings */
.health-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.health-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.health-ring-container {
  position: relative;
  width: 80px;
  height: 80px;
}
.health-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}
.ring-fill {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}
.ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 700;
}

/* Gap utility */
.gap-1 { gap: 4px; }

/* Responsive */
@media (max-width: 599px) {
  .sticky-header-premium { padding-left: 12px; padding-right: 12px; }
  .reveal-card { animation-duration: 0.4s; }
  .kpi-card-premium { padding: 16px !important; }
  .health-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
}

/* Dark mode overrides */
.theme--dark .bg-surface { background-color: #0f172a !important; }
.theme--dark .sidebar-glass { background: rgba(30, 10, 10, 0.98) !important; }
.theme--dark .sticky-header-premium { background: rgba(15, 23, 42, 0.9) !important; }
.theme--dark .kpi-card-premium { background: #1e293b !important; border-color: #334155; }
.theme--dark .card-header-premium { background: linear-gradient(to bottom, #1e293b, #0f172a); }
.theme--dark .entries-table-premium ::v-deep th { background: #1e293b !important; color: #94a3b8 !important; border-color: #334155 !important; }
.theme--dark .hover-row:hover { background-color: #1e293b !important; }
.theme--dark .bottom-nav-premium { background: rgba(15, 23, 42, 0.95) !important; border-color: #334155 !important; }
.theme--dark .form-label { color: #cbd5e1; }
</style>