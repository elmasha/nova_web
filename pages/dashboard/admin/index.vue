<template>
  <div class="admin-dashboard">
    <header class="topbar" :class="{ scrolled: scrolled }">
      <nuxt-link to="/" class="brand">
        <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
        <span class="brand-name">No<span class="brand-dot">va</span></span>
      </nuxt-link>

      <div class="topbar-actions">
        <button class="icon-btn" @click="reloadActive" :disabled="loading" aria-label="Refresh">
          <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
        </button>
        <div class="user-menu-wrap">
          <button class="user-avatar" @click.stop="menuOpen = !menuOpen">{{ initials }}</button>
          <transition name="menu">
            <div v-if="menuOpen" class="user-menu" @click.stop>
              <div class="user-menu-head">
                <div class="user-menu-name">{{ displayName }}</div>
                <div class="user-menu-email">{{ email }}</div>
                <span class="role-badge">Admin</span>
              </div>
              <button class="user-menu-item danger" @click="signOut">
                <v-icon small>mdi-logout</v-icon>
                Sign out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <!-- DESKTOP TABS -->
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon x-small :color="activeTab === t.value ? 'white' : '#7f8c8d'" class="mr-1">{{ t.icon }}</v-icon>
        <span>{{ t.label }}</span>
        <span v-if="t.badge" class="tab-badge">{{ t.badge }}</span>
      </button>
    </nav>

    <main class="main">
      <div v-if="loading" class="skeleton-wrap">
        <div class="sk-greeting">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-sub"></div>
        </div>
        <div class="stats-grid">
          <div v-for="n in 6" :key="n" class="sk-stat">
            <div class="sk-circle"></div>
            <div class="sk-stat-body">
              <div class="sk-line sk-label"></div>
              <div class="sk-line sk-value"></div>
            </div>
          </div>
        </div>
      </div>

      <section v-else-if="loadError" class="error-card">
        <div class="error-icon"><v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon></div>
        <h2>Something went wrong</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="loadAll">Try again</button>
      </section>

      <transition v-else name="fade-slide" mode="out-in">
        <template>
          <!-- HOME (stats + analytics) -->
          <section v-if="activeTab === 'home'" key="home">
            <div class="greeting"><h1>Admin</h1><p>Platform at a glance.</p></div>

            <div class="stats-grid">
              <div class="stat-card gradient-purple" @click="setTab('verifications')">
                <div class="stat-icon"><v-icon small color="white">mdi-account-check-outline</v-icon></div>
                <div class="stat-body">
                  <div class="stat-label">Pending verifications</div>
                  <div class="stat-value">{{ stats.pending_verifications }}</div>
                </div>
                <v-icon small color="#c8c0e0" class="stat-chevron">mdi-chevron-right</v-icon>
              </div>
              <div class="stat-card gradient-pink" @click="setTab('assessments')">
                <div class="stat-icon"><v-icon small color="white">mdi-file-document-outline</v-icon></div>
                <div class="stat-body">
                  <div class="stat-label">Pending assessments</div>
                  <div class="stat-value">{{ stats.pending_assessments }}</div>
                </div>
                <v-icon small color="#f5b7c8" class="stat-chevron">mdi-chevron-right</v-icon>
              </div>
              <div class="stat-card gradient-indigo" @click="setTab('bookings')">
                <div class="stat-icon"><v-icon small color="white">mdi-calendar-check-outline</v-icon></div>
                <div class="stat-body">
                  <div class="stat-label">Total bookings</div>
                  <div class="stat-value">{{ stats.total_bookings }}</div>
                </div>
                <v-icon small color="#c8c0e0" class="stat-chevron">mdi-chevron-right</v-icon>
              </div>
              <div class="stat-card gradient-green">
                <div class="stat-icon"><v-icon small color="white">mdi-shield-check</v-icon></div>
                <div class="stat-body">
                  <div class="stat-label">Verified professionals</div>
                  <div class="stat-value">{{ stats.verified_professionals }}</div>
                </div>
              </div>
              <div class="stat-card gradient-teal">
                <div class="stat-icon"><v-icon small color="white">mdi-account-group-outline</v-icon></div>
                <div class="stat-body">
                  <div class="stat-label">Active parents</div>
                  <div class="stat-value">{{ stats.active_parents }}</div>
                </div>
              </div>
              <div class="stat-card gradient-amber" @click="setTab('complaints')">
                <div class="stat-icon"><v-icon small color="white">mdi-alert-outline</v-icon></div>
                <div class="stat-body">
                  <div class="stat-label">Open complaints</div>
                  <div class="stat-value">{{ stats.open_complaints }}</div>
                </div>
                <v-icon small color="#c8c0e0" class="stat-chevron">mdi-chevron-right</v-icon>
              </div>
            </div>

            <!-- TRENDS -->
            <div class="analytics-head">
              <h2 class="analytics-h2">Trends</h2>
              <div class="sub-tabs analytics-range-tabs">
                <button
                  v-for="r in analyticsRanges"
                  :key="r.value"
                  class="sub-tab"
                  :class="{ active: analyticsRange === r.value }"
                  @click="setAnalyticsRange(r.value)"
                >{{ r.label }}</button>
              </div>
            </div>

            <div v-if="analyticsLoading || !analytics" class="chart-skeleton-grid">
              <div class="chart-skeleton" v-for="n in 4" :key="`sk-${n}`"></div>
            </div>

            <template v-else>
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-label">Bookings</div>
                  <div class="kpi-value">{{ analytics.kpis.total_bookings }}</div>
                  <div class="kpi-sub">{{ analytics.kpis.completed_bookings }} completed</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Revenue</div>
                  <div class="kpi-value">{{ formatRevenueShort(analytics.kpis.total_revenue) }}</div>
                  <div class="kpi-sub">avg {{ formatPrice(Math.round(analytics.kpis.avg_ticket)) }}</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">New users</div>
                  <div class="kpi-value">{{ analytics.kpis.new_users }}</div>
                  <div class="kpi-sub">{{ analytics.kpis.active_pros }} active pros</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Completion</div>
                  <div class="kpi-value">{{ analytics.kpis.completion_rate }}%</div>
                  <div class="kpi-sub">{{ analytics.kpis.no_show_rate }}% no-show · {{ analytics.kpis.cancel_rate }}% cancelled</div>
                </div>
              </div>

              <div class="chart-card">
                <div class="chart-head">
                  <div class="chart-title">Bookings</div>
                  <div class="chart-legend"><span class="legend-dot" style="background: #4a3b8c"></span> Per day</div>
                </div>
                <div v-if="analytics.bookings_series.length" class="chart-body">
                  <svg viewBox="0 0 600 140" preserveAspectRatio="none" class="chart-svg">
                    <defs>
                      <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#4a3b8c" stop-opacity="0.28" />
                        <stop offset="100%" stop-color="#4a3b8c" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline fill="none" stroke="#4a3b8c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                      :points="svgPoints(analytics.bookings_series.map(s => s.count), 600, 140, 8)" />
                    <polygon :points="`0,140 ${svgPoints(analytics.bookings_series.map(s => s.count), 600, 140, 8)} 600,140`" fill="url(#bkGrad)" />
                  </svg>
                  <div class="chart-x-axis">
                    <span>{{ shortDayLabel(analytics.bookings_series[0].day) }}</span>
                    <span>{{ shortDayLabel(analytics.bookings_series[analytics.bookings_series.length - 1].day) }}</span>
                  </div>
                </div>
                <div v-else class="chart-empty">No booking data for this range</div>
              </div>

              <div class="chart-card">
                <div class="chart-head">
                  <div class="chart-title">Revenue</div>
                  <div class="chart-legend"><span class="legend-dot" style="background: #56c2d9"></span> Monthly</div>
                </div>
                <div v-if="analytics.revenue_series.length" class="chart-body">
                  <div class="bar-chart">
                    <div v-for="m in analytics.revenue_series" :key="m.month" class="bar-col">
                      <div class="bar-value">{{ formatRevenueShort(m.total) }}</div>
                      <div class="bar" :style="{ height: barHeight(m.total, Math.max(...analytics.revenue_series.map(x => x.total)), 120) + 'px' }"></div>
                      <div class="bar-label">{{ shortMonthLabel(m.month) }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="chart-empty">No revenue for this range</div>
              </div>

              <div class="chart-split">
                <div class="chart-card">
                  <div class="chart-head"><div class="chart-title">Service mix</div></div>
                  <div v-if="analytics.service_mix.length" class="donut-wrap">
                    <svg viewBox="0 0 100 100" class="donut-svg">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#ececf1" stroke-width="14" />
                      <circle v-for="(s, i) in donutSlices(analytics.service_mix)" :key="`slice-${i}`"
                        cx="50" cy="50" r="40" fill="none" :stroke="s.color" stroke-width="14"
                        :stroke-dasharray="s.dasharray" :stroke-dashoffset="s.dashoffset" transform="rotate(-90 50 50)" />
                    </svg>
                    <div class="donut-legend">
                      <div v-for="(s, i) in donutSlices(analytics.service_mix)" :key="`leg-${i}`" class="legend-row">
                        <span class="legend-dot" :style="{ background: s.color }"></span>
                        <span class="legend-label">{{ s.label }}</span>
                        <span class="legend-value">{{ s.pct }}%</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="chart-empty">No services booked</div>
                </div>

                <div class="chart-card">
                  <div class="chart-head"><div class="chart-title">Outcomes</div></div>
                  <div class="outcomes">
                    <div class="outcome-row">
                      <div class="outcome-label">Completed</div>
                      <div class="outcome-bar"><span :style="{ width: analytics.kpis.completion_rate + '%', background: '#229954' }"></span></div>
                      <div class="outcome-pct">{{ analytics.kpis.completion_rate }}%</div>
                    </div>
                    <div class="outcome-row">
                      <div class="outcome-label">No-show</div>
                      <div class="outcome-bar"><span :style="{ width: analytics.kpis.no_show_rate + '%', background: '#b7791f' }"></span></div>
                      <div class="outcome-pct">{{ analytics.kpis.no_show_rate }}%</div>
                    </div>
                    <div class="outcome-row">
                      <div class="outcome-label">Cancelled</div>
                      <div class="outcome-bar"><span :style="{ width: analytics.kpis.cancel_rate + '%', background: '#c0392b' }"></span></div>
                      <div class="outcome-pct">{{ analytics.kpis.cancel_rate }}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="chart-card">
                <div class="chart-head">
                  <div class="chart-title">Top professionals</div>
                  <div class="chart-legend">{{ analyticsRanges.find(r => r.value === analyticsRange)?.label }}</div>
                </div>
                <div v-if="analytics.top_pros.length" class="top-list">
                  <div v-for="(p, i) in analytics.top_pros" :key="p.id" class="top-row">
                    <div class="top-rank">{{ i + 1 }}</div>
                    <div class="top-avatar" :style="{ background: avatarBg(p.id) }">{{ initialsOf(p.name) }}</div>
                    <div class="top-body">
                      <div class="top-name">{{ p.name }}</div>
                      <div class="top-sub">{{ typeLabel(p.type) }}</div>
                    </div>
                    <div class="top-stat">
                      <div class="top-stat-value">{{ p.completed }}</div>
                      <div class="top-stat-label">sessions</div>
                    </div>
                    <div class="top-stat">
                      <div class="top-stat-value">{{ formatRevenueShort(p.revenue) }}</div>
                      <div class="top-stat-label">earned</div>
                    </div>
                  </div>
                </div>
                <div v-else class="chart-empty">No completed sessions in this range</div>
              </div>

              <div class="chart-card">
                <div class="chart-head">
                  <div class="chart-title">New users</div>
                  <div class="chart-legend"><span class="legend-dot" style="background: #e86a8a"></span> Daily signups</div>
                </div>
                <div v-if="analytics.user_growth.length" class="chart-body">
                  <svg viewBox="0 0 600 140" preserveAspectRatio="none" class="chart-svg">
                    <defs>
                      <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#e86a8a" stop-opacity="0.28" />
                        <stop offset="100%" stop-color="#e86a8a" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline fill="none" stroke="#e86a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                      :points="svgPoints(analytics.user_growth.map(s => s.count), 600, 140, 8)" />
                    <polygon :points="`0,140 ${svgPoints(analytics.user_growth.map(s => s.count), 600, 140, 8)} 600,140`" fill="url(#ugGrad)" />
                  </svg>
                  <div class="chart-x-axis">
                    <span>{{ shortDayLabel(analytics.user_growth[0].day) }}</span>
                    <span>{{ shortDayLabel(analytics.user_growth[analytics.user_growth.length - 1].day) }}</span>
                  </div>
                </div>
                <div v-else class="chart-empty">No new users in this range</div>
              </div>

              <div class="chart-card">
                <div class="chart-head"><div class="chart-title">Bookings by county</div></div>
                <div v-if="analytics.by_county.length" class="county-list">
                  <div v-for="c in analytics.by_county" :key="c.county" class="county-row">
                    <div class="county-label">{{ c.county }}</div>
                    <div class="county-bar"><span :style="{ width: (c.count / Math.max(...analytics.by_county.map(x => x.count)) * 100) + '%' }"></span></div>
                    <div class="county-value">{{ c.count }}</div>
                  </div>
                </div>
                <div v-else class="chart-empty">No bookings in this range</div>
              </div>
            </template>
          </section>

          <!-- VERIFICATIONS -->
          <section v-else-if="activeTab === 'verifications'" key="verifications">
            <div class="greeting"><h1>Verifications</h1><p>Review professional credentials.</p></div>
            <div class="list-toolbar">
              <div class="sub-tabs">
                <button v-for="f in verificationFilters" :key="f.value" class="sub-tab" :class="{ active: verificationFilter === f.value }" @click="verificationFilter = f.value; loadVerifications()">{{ f.label }}</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="verificationSearch" placeholder="Search name, county…" />
              </div>
            </div>
            <div v-if="!filteredVerifications.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-check-circle-outline</v-icon>
              <div>
                <div class="empty-title">{{ verificationSearch ? 'No matches' : `No ${verificationFilter} verifications` }}</div>
                <div class="empty-sub">{{ verificationSearch ? 'Try a different search term.' : 'You are all caught up.' }}</div>
              </div>
            </div>
            <div v-else class="list">
              <div v-for="v in filteredVerifications" :key="v.professional_id" class="list-row" @click="openVerification(v)">
                <div class="row-avatar" :style="{ background: avatarBg(v.professional_id) }">{{ initialsOf(v.display_name) }}</div>
                <div class="row-body">
                  <div class="row-title">{{ v.display_name || 'Professional' }}</div>
                  <div class="row-sub">{{ typeLabel(v.type) }} · {{ v.county || '—' }}</div>
                  <div class="row-meta">
                    <span>{{ v.years_experience || 0 }} yrs</span>
                    <span v-if="v.email"> · {{ v.email }}</span>
                    <span v-if="hasAnyDoc(v)" class="doc-flag"> · docs</span>
                  </div>
                </div>
                <span class="status-pill" :class="statusClass(v.status)">{{ v.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- ASSESSMENTS -->
          <section v-else-if="activeTab === 'assessments'" key="assessments">
            <div class="greeting"><h1>Assessment requests</h1><p>Route requests to verified professionals.</p></div>
            <div class="list-toolbar">
              <div class="sub-tabs">
                <button v-for="f in assessmentFilters" :key="f.value" class="sub-tab" :class="{ active: assessmentFilter === f.value }" @click="assessmentFilter = f.value; loadAssessments()">{{ f.label }}</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="assessmentSearch" placeholder="Search child, county…" />
              </div>
            </div>
            <div v-if="!filteredAssessments.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-file-document-outline</v-icon>
              <div>
                <div class="empty-title">{{ assessmentSearch ? 'No matches' : `No ${assessmentFilter} requests` }}</div>
                <div class="empty-sub">New requests will appear here.</div>
              </div>
            </div>
            <div v-else class="list">
              <div v-for="a in filteredAssessments" :key="a.id" class="list-row" @click="openAssessment(a)">
                <div class="row-avatar row-avatar-purple"><v-icon small color="white">mdi-file-document-outline</v-icon></div>
                <div class="row-body">
                  <div class="row-title">{{ a.child_name }}</div>
                  <div class="row-sub">{{ a.preferred_county || a.child_county || '—' }} · {{ relativeTime(a.created_at) }}</div>
                  <div v-if="a.assigned_professional_name" class="row-meta">Assigned to {{ a.assigned_professional_name }}</div>
                </div>
                <span class="status-pill" :class="statusClass(a.status)">{{ a.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- BOOKINGS -->
          <section v-else-if="activeTab === 'bookings'" key="bookings">
            <div class="greeting"><h1>Bookings</h1><p>All sessions across the platform.</p></div>
            <div class="list-toolbar">
              <div class="sub-tabs">
                <button v-for="f in bookingFilters" :key="f.value" class="sub-tab" :class="{ active: bookingFilter === f.value }" @click="bookingFilter = f.value; loadBookings()">{{ f.label }}</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="bookingSearch" placeholder="Search child, parent…" />
              </div>
            </div>
            <div class="toolbar-actions">
              <button class="btn-secondary" @click="exportBookings"><v-icon small class="mr-2">mdi-download</v-icon>Export CSV</button>
            </div>
            <div v-if="!filteredBookings.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-calendar-outline</v-icon>
              <div><div class="empty-title">No bookings</div><div class="empty-sub">Nothing to show for this filter.</div></div>
            </div>
            <div v-else class="list">
              <div v-for="b in filteredBookings" :key="b.id" class="list-row" @click="openBooking(b)">
                <div class="row-avatar row-avatar-purple"><v-icon small color="white">mdi-calendar-check-outline</v-icon></div>
                <div class="row-body">
                  <div class="row-title">{{ b.child_name || 'Booking' }}<span v-if="b.is_paid" class="paid-flag"> · paid</span></div>
                  <div class="row-sub">{{ b.parent_name || '—' }} · {{ b.professional_name || '—' }}</div>
                  <div class="row-meta">
                    <span>{{ shortDate(b.scheduled_at) }}</span>
                    <span v-if="b.service_name"> · {{ b.service_name }}</span>
                    <span v-if="b.service_price"> · KSh {{ formatPrice(b.service_price) }}</span>
                  </div>
                </div>
                <span class="status-pill" :class="statusClass(b.status)">{{ b.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- PAYMENTS -->
          <section v-else-if="activeTab === 'payments'" key="payments">
            <div class="greeting"><h1>Payments</h1><p>Every M-Pesa charge, receipt, and payout in one place.</p></div>

            <!-- Summary strip -->
            <div class="payment-summary" v-if="paymentsSummary">
              <div class="pm-card">
                <div class="pm-label">Confirmed revenue</div>
                <div class="pm-value">{{ formatRevenueShort(paymentsSummary.confirmed_revenue) }}</div>
                <div class="pm-sub">{{ paymentsSummary.paid_count }} paid · {{ paymentsSummary.refunded_count }} refunded</div>
              </div>
              <div class="pm-card">
                <div class="pm-label">Pending</div>
                <div class="pm-value">{{ paymentsSummary.pending_count }}</div>
                <div class="pm-sub">awaiting callback</div>
              </div>
              <div class="pm-card">
                <div class="pm-label">Failed</div>
                <div class="pm-value">{{ paymentsSummary.failed_count }}</div>
                <div class="pm-sub">cancelled or errored</div>
              </div>
              <div class="pm-card">
                <div class="pm-label">Pending payouts</div>
                <div class="pm-value">{{ formatRevenueShort(paymentsSummary.pending_payout_amount) }}</div>
                <div class="pm-sub">owed to professionals</div>
              </div>
            </div>

            <div class="list-toolbar">
              <div class="sub-tabs">
                <button v-for="f in paymentFilters" :key="f.value" class="sub-tab" :class="{ active: paymentFilter === f.value }" @click="paymentFilter = f.value; loadPayments()">{{ f.label }}</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="paymentSearch" placeholder="Search receipt, parent, child…" @keyup.enter="loadPayments" />
              </div>
            </div>

            <div class="toolbar-actions">
              <button class="btn-secondary" @click="toggleConfirmedOnly">
                <v-icon small class="mr-2">{{ paymentsConfirmedOnly ? 'mdi-check-circle' : 'mdi-check-circle-outline' }}</v-icon>
                {{ paymentsConfirmedOnly ? 'Confirmed only' : 'All payments' }}
              </button>
              <button class="btn-secondary" @click="exportPayments"><v-icon small class="mr-2">mdi-download</v-icon>Export CSV</button>
            </div>

            <div v-if="!filteredPayments.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-cash-multiple</v-icon>
              <div><div class="empty-title">No payments</div><div class="empty-sub">Try a different filter or search.</div></div>
            </div>
            <div v-else class="list">
              <div v-for="p in filteredPayments" :key="p.id" class="list-row" @click="openPayment(p)">
                <div class="row-avatar" :style="{ background: paymentAvatarBg(p.status) }">
                  <v-icon small color="white">{{ paymentStatusIcon(p.status) }}</v-icon>
                </div>
                <div class="row-body">
                  <div class="row-title">
                    KSh {{ formatPrice(p.amount) }}
                    <span v-if="p.is_confirmed" class="paid-flag"> · confirmed</span>
                    <span v-else-if="p.status === 'pending'" class="pending-flag"> · pending</span>
                    <span v-else-if="p.status === 'failed'" class="failed-flag"> · failed</span>
                  </div>
                  <div class="row-sub">{{ p.parent_name || '—' }}<span v-if="p.child_name"> · {{ p.child_name }}</span></div>
                  <div class="row-meta">
                    <span>{{ p.method }}</span>
                    <span v-if="p.mpesa_receipt"> · {{ p.mpesa_receipt }}</span>
                    <span v-else-if="p.mpesa_checkout_id"> · {{ shortId(p.mpesa_checkout_id) }}</span>
                    <span v-if="p.booking_id"> · BK-{{ p.booking_id }}</span>
                    <span> · {{ relativeTime(p.created_at) }}</span>
                  </div>
                </div>
                <span class="status-pill" :class="paymentStatusClass(p)">{{ paymentStatusLabel(p) }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- USERS -->
          <section v-else-if="activeTab === 'users'" key="users">
            <div class="greeting"><h1>Users</h1><p>All registered accounts.</p></div>
            <div class="list-toolbar">
              <div class="sub-tabs">
                <button v-for="f in userFilters" :key="f.value" class="sub-tab" :class="{ active: userFilter === f.value }" @click="userFilter = f.value; loadUsers()">{{ f.label }}</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="userSearch" placeholder="Search name, email…" />
              </div>
            </div>
            <div class="toolbar-actions">
              <button class="btn-secondary" @click="exportUsers"><v-icon small class="mr-2">mdi-download</v-icon>Export CSV</button>
            </div>
            <div v-if="!filteredUsers.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-account-group-outline</v-icon>
              <div>
                <div class="empty-title">{{ userSearch ? 'No matches' : 'No users' }}</div>
                <div class="empty-sub">Registered users will appear here.</div>
              </div>
            </div>
            <div v-else class="list">
              <div v-for="u in filteredUsers" :key="u.id" class="list-row" @click="openUser(u)">
                <div class="row-avatar" :style="{ background: avatarBg(u.id) }">{{ initialsOf(u.display_name || u.email) }}</div>
                <div class="row-body">
                  <div class="row-title">{{ u.display_name || 'No name' }}</div>
                  <div class="row-sub">{{ u.email || u.phone || '—' }}</div>
                  <div class="row-meta"><span class="role-chip">{{ u.role }}</span> · joined {{ relativeTime(u.created_at) }}</div>
                </div>
                <span class="status-pill" :class="statusClass(u.status)">{{ u.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- COMPLAINTS -->
          <section v-else-if="activeTab === 'complaints'" key="complaints">
            <div class="greeting"><h1>Complaints</h1><p>Reports filed by users.</p></div>
            <div class="list-toolbar">
              <div class="sub-tabs">
                <button v-for="f in complaintFilters" :key="f.value" class="sub-tab" :class="{ active: complaintFilter === f.value }" @click="complaintFilter = f.value; loadComplaints()">{{ f.label }}</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="complaintSearch" placeholder="Search reporter, subject…" />
              </div>
            </div>
            <div v-if="!filteredComplaints.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-flag-outline</v-icon>
              <div><div class="empty-title">No complaints</div><div class="empty-sub">Nothing here yet.</div></div>
            </div>
            <div v-else class="list">
              <div v-for="c in filteredComplaints" :key="c.id" class="list-row" @click="openComplaint(c)">
                <div class="row-avatar" :style="{ background: avatarBg(c.id) }"><v-icon small color="white">mdi-flag-outline</v-icon></div>
                <div class="row-body">
                  <div class="row-title">{{ c.type }} — {{ c.reporter_name }}</div>
                  <div class="row-sub">Against {{ c.subject_name || '—' }}</div>
                  <div class="row-meta">{{ relativeTime(c.created_at) }}</div>
                </div>
                <span class="status-pill" :class="complaintClass(c.status)">{{ c.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- AUDIT -->
          <section v-else-if="activeTab === 'audit'" key="audit">
            <div class="greeting"><h1>Audit log</h1><p>Every action across the platform.</p></div>
            <div class="list-toolbar">
              <div class="sub-tabs">
                <button class="sub-tab" :class="{ active: !auditAction }" @click="auditAction = ''; loadAudit()">All</button>
                <button class="sub-tab" :class="{ active: auditAction === 'admin' }" @click="auditAction = 'admin'; loadAudit()">Admin</button>
                <button class="sub-tab" :class="{ active: auditAction === 'payment' }" @click="auditAction = 'payment'; loadAudit()">Payments</button>
                <button class="sub-tab" :class="{ active: auditAction === 'booking' }" @click="auditAction = 'booking'; loadAudit()">Bookings</button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="auditSearch" placeholder="Search action…" />
              </div>
            </div>
            <div v-if="!filteredAudit.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-history</v-icon>
              <div><div class="empty-title">No log entries</div><div class="empty-sub">Actions will appear as they happen.</div></div>
            </div>
            <div v-else class="list">
              <div v-for="a in filteredAudit" :key="a.id" class="list-row audit-row">
                <div class="audit-action-chip"><v-icon small color="white">{{ auditIcon(a.action) }}</v-icon></div>
                <div class="row-body">
                  <div class="row-title">{{ a.action }}</div>
                  <div class="row-sub">{{ a.entity }}{{ a.entity_id ? ' #' + a.entity_id : '' }} · {{ a.actor_name || 'system' }}</div>
                  <div class="row-meta">{{ relativeTime(a.created_at) }}<span v-if="a.ip"> · {{ a.ip }}</span></div>
                </div>
              </div>
            </div>
          </section>
        </template>
      </transition>
    </main>

    <!-- MOBILE BOTTOM NAV -->
    <nav class="bottom-nav">
      <button
        v-for="t in tabs"
        :key="`bn-${t.value}`"
        class="bn-item"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <span class="bn-icon-wrap">
          <v-icon small>{{ t.icon }}</v-icon>
          <span v-if="t.badge" class="bn-badge">{{ t.badge }}</span>
        </span>
        <span class="bn-label">{{ t.shortLabel || t.label }}</span>
      </button>
    </nav>

    <!-- VERIFICATION DIALOG -->
    <transition name="modal">
      <div v-if="selectedVerification" class="modal-backdrop" @click.self="closeVerification">
        <div class="modal modal-lg">
          <div class="modal-head">
            <div class="modal-title">Verification · {{ selectedVerification.display_name }}</div>
            <button class="modal-close" @click="closeVerification"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>

          <div class="modal-body">
            <div class="modal-row"><div class="modal-label">Type</div><div class="modal-value">{{ typeLabel(selectedVerification.type) }}</div></div>
            <div class="modal-row"><div class="modal-label">Experience</div><div class="modal-value">{{ selectedVerification.years_experience || 0 }} years</div></div>
            <div class="modal-row"><div class="modal-label">County</div><div class="modal-value">{{ selectedVerification.county || '—' }}<span v-if="selectedVerification.area">, {{ selectedVerification.area }}</span></div></div>
            <div class="modal-row" v-if="selectedVerification.price_min || selectedVerification.price_max">
              <div class="modal-label">Price range</div>
              <div class="modal-value">KSh {{ formatPrice(selectedVerification.price_min) }} – {{ formatPrice(selectedVerification.price_max) }}</div>
            </div>
            <div class="modal-row"><div class="modal-label">Online</div><div class="modal-value">{{ selectedVerification.online ? 'Yes' : 'No' }}</div></div>
            <div v-if="selectedVerification.bio" class="modal-row"><div class="modal-label">Bio</div><div class="modal-value">{{ selectedVerification.bio }}</div></div>

            <div class="section-title-sm mt-4">Documents</div>

            <div class="doc-edit">
              <label class="field-label">National ID / Passport URL</label>
              <input v-model.trim="docForm.id" type="url" class="text-input" placeholder="https://…" :disabled="savingDocs" />
              <a v-if="docForm.id" :href="docForm.id" target="_blank" rel="noopener" class="doc-link-sm">Open document</a>
            </div>
            <div class="doc-edit">
              <label class="field-label">Qualification URL</label>
              <input v-model.trim="docForm.qualification" type="url" class="text-input" placeholder="https://…" :disabled="savingDocs" />
              <a v-if="docForm.qualification" :href="docForm.qualification" target="_blank" rel="noopener" class="doc-link-sm">Open document</a>
            </div>
            <div class="doc-edit">
              <label class="field-label">Practising licence URL</label>
              <input v-model.trim="docForm.licence" type="url" class="text-input" placeholder="https://…" :disabled="savingDocs" />
              <a v-if="docForm.licence" :href="docForm.licence" target="_blank" rel="noopener" class="doc-link-sm">Open document</a>
            </div>
            <button class="btn-secondary mt-2" :disabled="savingDocs || !docsDirty" @click="saveDocuments">
              {{ savingDocs ? 'Saving…' : 'Save document URLs' }}
            </button>

            <div class="section-title-sm mt-4">References</div>
            <div v-if="verificationRefs.length" class="ref-list-sm">
              <div v-for="(r, i) in verificationRefs" :key="i" class="ref-row-sm">
                <div><b>{{ r.name }}</b> · {{ r.phone }}<span v-if="r.relationship"> · {{ r.relationship }}</span></div>
                <button class="ref-x" @click="removeReference(i)"><v-icon x-small color="#e74c3c">mdi-close</v-icon></button>
              </div>
            </div>
            <p v-else class="hint">No references yet.</p>
            <div class="ref-add-sm">
              <input v-model.trim="newRef.name" class="text-input" placeholder="Name" />
              <input v-model.trim="newRef.phone" class="text-input" placeholder="Phone" />
              <input v-model.trim="newRef.relationship" class="text-input" placeholder="Relationship" />
              <button class="btn-secondary" :disabled="!newRef.name || !newRef.phone || addingRef" @click="addReference">Add</button>
            </div>

            <div class="section-title-sm mt-4">Reviewer notes</div>
            <textarea v-model.trim="reviewerNotes" rows="3" class="text-input textarea" placeholder="Internal notes — not shown to the professional" :disabled="savingNotes"></textarea>
            <button class="btn-secondary mt-2" :disabled="savingNotes || !notesDirty" @click="saveNotes">{{ savingNotes ? 'Saving…' : 'Save notes' }}</button>

            <div v-if="verificationError" class="error-box mt-4">{{ verificationError }}</div>
            <div v-if="rejectMode" class="reject-box mt-4">
              <label class="field-label">Reason for rejection</label>
              <textarea v-model.trim="rejectNotes" rows="3" class="text-input textarea" placeholder="Explain what needs fixing so the professional can resubmit." :disabled="acting"></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <template v-if="selectedVerification.status === 'pending'">
              <template v-if="!rejectMode">
                <button class="btn-danger" :disabled="acting" @click="rejectMode = true">Reject</button>
                <button class="btn-primary" :disabled="acting" @click="approveVerification">{{ acting ? 'Approving…' : 'Approve' }}</button>
              </template>
              <template v-else>
                <button class="btn-secondary" :disabled="acting" @click="rejectMode = false">Back</button>
                <button class="btn-danger" :disabled="acting || rejectNotes.length < 5" @click="submitReject">{{ acting ? 'Rejecting…' : 'Confirm rejection' }}</button>
              </template>
            </template>
            <template v-else>
              <button class="btn-secondary" @click="closeVerification">Close</button>
              <button class="btn-primary" :disabled="acting" @click="resetVerification">{{ acting ? '…' : 'Reset to pending' }}</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- ASSESSMENT DIALOG -->
    <transition name="modal">
      <div v-if="selectedAssessment" class="modal-backdrop" @click.self="closeAssessment">
        <div class="modal modal-lg">
          <div class="modal-head">
            <div class="modal-title">Assessment request</div>
            <button class="modal-close" @click="closeAssessment"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>
          <div class="modal-body">
            <div class="modal-row"><div class="modal-label">Child</div><div class="modal-value">{{ selectedAssessment.child_name }}</div></div>
            <div class="modal-row" v-if="selectedAssessment.child_dob"><div class="modal-label">DOB</div><div class="modal-value">{{ selectedAssessment.child_dob }}</div></div>
            <div class="modal-row" v-if="selectedAssessment.child_gender"><div class="modal-label">Gender</div><div class="modal-value">{{ selectedAssessment.child_gender }}</div></div>
            <div class="modal-row"><div class="modal-label">Parent</div><div class="modal-value">{{ selectedAssessment.parent_name }}<span v-if="selectedAssessment.parent_phone"> · {{ selectedAssessment.parent_phone }}</span></div></div>
            <div v-if="selectedAssessment.preferred_county" class="modal-row"><div class="modal-label">Preferred county</div><div class="modal-value">{{ selectedAssessment.preferred_county }}</div></div>
            <div v-if="selectedAssessment.preferred_language" class="modal-row"><div class="modal-label">Language</div><div class="modal-value">{{ selectedAssessment.preferred_language }}</div></div>
            <div v-if="selectedAssessment.budget_min || selectedAssessment.budget_max" class="modal-row">
              <div class="modal-label">Budget</div>
              <div class="modal-value">KSh {{ formatPrice(selectedAssessment.budget_min) }} – {{ formatPrice(selectedAssessment.budget_max) }}</div>
            </div>
            <div v-if="selectedAssessment.concerns" class="modal-row"><div class="modal-label">Concerns</div><div class="modal-value">{{ selectedAssessment.concerns }}</div></div>

            <label class="field-label mt-4">Assign to professional</label>
            <select v-model.number="assignProfessionalId" class="text-input" :disabled="acting">
              <option :value="null" disabled>Select a verified professional</option>
              <option v-for="p in verifiedProfessionals" :key="p.id" :value="p.id">
                {{ p.display_name }} — {{ typeLabel(p.type) }} · {{ p.county || '—' }}
              </option>
            </select>
            <p class="hint">Only verified professionals appear here.</p>
            <div v-if="assignError" class="error-box mt-4">{{ assignError }}</div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" :disabled="acting" @click="closeAssessment">Cancel</button>
            <button class="btn-primary" :disabled="!assignProfessionalId || acting" @click="submitAssign">{{ acting ? 'Assigning…' : 'Assign' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- BOOKING DIALOG -->
    <transition name="modal">
      <div v-if="selectedBooking" class="modal-backdrop" @click.self="selectedBooking = null">
        <div class="modal modal-lg">
          <div class="modal-head">
            <div class="modal-title">Booking #{{ selectedBooking.id }}</div>
            <button class="modal-close" @click="selectedBooking = null"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>
          <div class="modal-body">
            <div class="modal-row"><div class="modal-label">Status</div><div class="modal-value"><span class="status-pill" :class="statusClass(selectedBooking.status)">{{ selectedBooking.status }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Child</div><div class="modal-value">{{ selectedBooking.child_name || '—' }}</div></div>
            <div class="modal-row"><div class="modal-label">Parent</div><div class="modal-value">{{ selectedBooking.parent_name || '—' }}<span v-if="selectedBooking.parent_email"> · {{ selectedBooking.parent_email }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Professional</div><div class="modal-value">{{ selectedBooking.professional_name || '—' }}<span v-if="selectedBooking.professional_type"> · {{ typeLabel(selectedBooking.professional_type) }}</span></div></div>
            <div class="modal-row"><div class="modal-label">When</div><div class="modal-value">{{ fullDate(selectedBooking.scheduled_at) }}</div></div>
            <div class="modal-row"><div class="modal-label">Duration</div><div class="modal-value">{{ selectedBooking.duration_minutes }} min</div></div>
            <div class="modal-row"><div class="modal-label">Format</div><div class="modal-value">{{ selectedBooking.location_type === 'online' ? 'Online' : 'In person' }}</div></div>
            <div v-if="selectedBooking.service_name" class="modal-row"><div class="modal-label">Service</div><div class="modal-value">{{ selectedBooking.service_name }}<span v-if="selectedBooking.service_price"> · KSh {{ formatPrice(selectedBooking.service_price) }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Payment</div><div class="modal-value"><span :class="selectedBooking.is_paid ? 'paid-yes' : 'paid-no'">{{ selectedBooking.is_paid ? 'Paid' : 'Not paid' }}</span></div></div>
            <div v-if="selectedBooking.notes" class="modal-row"><div class="modal-label">Notes</div><div class="modal-value">{{ selectedBooking.notes }}</div></div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="selectedBooking = null">Close</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- PAYMENT DIALOG -->
    <transition name="modal">
      <div v-if="selectedPayment" class="modal-backdrop" @click.self="selectedPayment = null">
        <div class="modal modal-lg">
          <div class="modal-head">
            <div class="modal-title">Payment #{{ selectedPayment.id }}</div>
            <button class="modal-close" @click="selectedPayment = null"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>
          <div class="modal-body">
            <div class="modal-row">
              <div class="modal-label">Status</div>
              <div class="modal-value">
                <span class="status-pill" :class="paymentStatusClass(selectedPayment)">{{ paymentStatusLabel(selectedPayment) }}</span>
              </div>
            </div>
            <div class="modal-row"><div class="modal-label">Amount</div><div class="modal-value">KSh {{ formatPrice(selectedPayment.amount) }} {{ selectedPayment.currency }}</div></div>
            <div class="modal-row"><div class="modal-label">Method</div><div class="modal-value">{{ selectedPayment.method }}</div></div>
            <div class="modal-row"><div class="modal-label">Parent</div><div class="modal-value">{{ selectedPayment.parent_name || '—' }}<span v-if="selectedPayment.parent_email"> · {{ selectedPayment.parent_email }}</span><span v-if="selectedPayment.parent_phone"> · {{ selectedPayment.parent_phone }}</span></div></div>
            <div class="modal-row" v-if="selectedPayment.child_name"><div class="modal-label">Child</div><div class="modal-value">{{ selectedPayment.child_name }}</div></div>
            <div class="modal-row" v-if="selectedPayment.professional_name"><div class="modal-label">Professional</div><div class="modal-value">{{ selectedPayment.professional_name }}<span v-if="selectedPayment.professional_type"> · {{ typeLabel(selectedPayment.professional_type) }}</span></div></div>
            <div class="modal-row" v-if="selectedPayment.service_name"><div class="modal-label">Service</div><div class="modal-value">{{ selectedPayment.service_name }}</div></div>
            <div class="modal-row" v-if="selectedPayment.booking_id"><div class="modal-label">Booking</div><div class="modal-value">#{{ selectedPayment.booking_id }}<span v-if="selectedPayment.booking_status"> · {{ selectedPayment.booking_status }}</span></div></div>
            <div class="modal-row" v-if="selectedPayment.booking_scheduled_at"><div class="modal-label">Scheduled</div><div class="modal-value">{{ fullDate(selectedPayment.booking_scheduled_at) }}</div></div>

            <div class="section-title-sm mt-4">M-Pesa</div>
            <div class="modal-row" v-if="selectedPayment.mpesa_receipt"><div class="modal-label">Receipt</div><div class="modal-value mono">{{ selectedPayment.mpesa_receipt }}</div></div>
            <div class="modal-row" v-if="selectedPayment.mpesa_checkout_id"><div class="modal-label">Checkout ID</div><div class="modal-value mono">{{ selectedPayment.mpesa_checkout_id }}</div></div>
            <div class="modal-row" v-if="selectedPayment.mpesa_ref"><div class="modal-label">Legacy ref</div><div class="modal-value mono">{{ selectedPayment.mpesa_ref }}</div></div>
            <div class="modal-row" v-if="selectedPayment.failure_reason"><div class="modal-label">Failure</div><div class="modal-value" style="color:#c0392b">{{ selectedPayment.failure_reason }}</div></div>
            <div class="modal-row"><div class="modal-label">Payout</div><div class="modal-value">{{ selectedPayment.payout_status || '—' }}</div></div>
            <div class="modal-row"><div class="modal-label">Created</div><div class="modal-value">{{ fullDate(selectedPayment.created_at) }}</div></div>
            <div class="modal-row"><div class="modal-label">Updated</div><div class="modal-value">{{ fullDate(selectedPayment.updated_at) }}</div></div>

            <template v-if="selectedPayment.webhook_events && selectedPayment.webhook_events.length">
              <div class="section-title-sm mt-4">Webhook events</div>
              <div v-for="ev in selectedPayment.webhook_events" :key="ev.id" class="webhook-box">
                <div class="webhook-head">
                  <span class="mono">{{ ev.event_type }}</span>
                  <span class="hint" style="margin:0">{{ fullDate(ev.created_at) }}</span>
                </div>
                <pre class="webhook-pre">{{ prettyJson(ev.payload) }}</pre>
                <div v-if="ev.processing_error" class="error-box" style="margin-top:8px">Processing error: {{ ev.processing_error }}</div>
              </div>
            </template>

            <template v-if="selectedPayment.audit_trail && selectedPayment.audit_trail.length">
              <div class="section-title-sm mt-4">Audit trail</div>
              <div v-for="a in selectedPayment.audit_trail" :key="a.id" class="audit-trail-row">
                <div class="audit-trail-action">{{ a.action }}</div>
                <div class="audit-trail-time">{{ fullDate(a.created_at) }}<span v-if="a.ip"> · {{ a.ip }}</span></div>
              </div>
            </template>

            <template v-if="selectedPayment.payout">
              <div class="section-title-sm mt-4">Payout</div>
              <div class="modal-row"><div class="modal-label">Amount</div><div class="modal-value">KSh {{ formatPrice(selectedPayment.payout.amount) }}</div></div>
              <div class="modal-row"><div class="modal-label">Commission</div><div class="modal-value">KSh {{ formatPrice(selectedPayment.payout.commission) }}</div></div>
              <div class="modal-row"><div class="modal-label">Status</div><div class="modal-value">{{ selectedPayment.payout.status }}<span v-if="selectedPayment.payout.paid_at"> · {{ fullDate(selectedPayment.payout.paid_at) }}</span></div></div>
            </template>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="selectedPayment = null">Close</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- USER DIALOG -->
    <transition name="modal">
      <div v-if="selectedUser" class="modal-backdrop" @click.self="selectedUser = null">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">{{ selectedUser.display_name || 'User' }}</div>
            <button class="modal-close" @click="selectedUser = null"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>
          <div class="modal-body">
            <div class="modal-row"><div class="modal-label">Email</div><div class="modal-value">{{ selectedUser.email || '—' }}</div></div>
            <div class="modal-row"><div class="modal-label">Phone</div><div class="modal-value">{{ selectedUser.phone || '—' }}</div></div>
            <div class="modal-row"><div class="modal-label">Role</div><div class="modal-value"><span class="role-chip">{{ selectedUser.role }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Status</div><div class="modal-value"><span class="status-pill" :class="statusClass(selectedUser.status)">{{ selectedUser.status }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Joined</div><div class="modal-value">{{ fullDate(selectedUser.created_at) }}</div></div>
            <div v-if="selectedUser.professional" class="modal-row">
              <div class="modal-label">Professional</div>
              <div class="modal-value">{{ typeLabel(selectedUser.professional.type) }} · {{ selectedUser.professional.verification_status }}</div>
            </div>

            <template v-if="selectedUser.role !== 'admin'">
              <div class="section-title-sm mt-4">Change role</div>
              <div class="role-change">
                <select v-model="newRole" class="text-input" :disabled="acting">
                  <option value="parent">Parent</option>
                  <option value="professional">Professional</option>
                </select>
                <button class="btn-primary" :disabled="acting || newRole === selectedUser.role" @click="changeUserRole">{{ acting ? '…' : 'Change' }}</button>
              </div>
            </template>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="selectedUser = null">Close</button>
            <button
              v-if="selectedUser.role !== 'admin'"
              :class="selectedUser.status === 'active' ? 'btn-danger' : 'btn-primary'"
              :disabled="acting"
              @click="toggleUserStatus"
            >{{ acting ? '…' : (selectedUser.status === 'active' ? 'Suspend' : 'Reactivate') }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- COMPLAINT DIALOG -->
    <transition name="modal">
      <div v-if="selectedComplaint" class="modal-backdrop" @click.self="selectedComplaint = null">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">Complaint #{{ selectedComplaint.id }}</div>
            <button class="modal-close" @click="selectedComplaint = null"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>
          <div class="modal-body">
            <div class="modal-row"><div class="modal-label">Type</div><div class="modal-value">{{ selectedComplaint.type }}</div></div>
            <div class="modal-row"><div class="modal-label">Status</div><div class="modal-value"><span class="status-pill" :class="complaintClass(selectedComplaint.status)">{{ selectedComplaint.status }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Reporter</div><div class="modal-value">{{ selectedComplaint.reporter_name }}<span v-if="selectedComplaint.reporter_email"> · {{ selectedComplaint.reporter_email }}</span></div></div>
            <div class="modal-row"><div class="modal-label">Against</div><div class="modal-value">{{ selectedComplaint.subject_name || '—' }}</div></div>
            <div class="modal-row"><div class="modal-label">Description</div><div class="modal-value">{{ selectedComplaint.description }}</div></div>
            <div v-if="selectedComplaint.resolution" class="modal-row"><div class="modal-label">Resolution</div><div class="modal-value">{{ selectedComplaint.resolution }}</div></div>

            <div class="section-title-sm mt-4">Update</div>
            <select v-model="newComplaintStatus" class="text-input" :disabled="acting">
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <textarea v-model.trim="complaintResolution" rows="3" class="text-input textarea mt-2" placeholder="Resolution notes (optional)" :disabled="acting"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="selectedComplaint = null">Close</button>
            <button class="btn-primary" :disabled="acting" @click="updateComplaint">{{ acting ? '…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CONFIRM DIALOG -->
    <transition name="modal">
      <div v-if="confirmDialog" class="modal-backdrop" @click.self="confirmDialog = null">
        <div class="modal modal-sm">
          <div class="modal-head">
            <div class="modal-title">{{ confirmDialog.title }}</div>
            <button class="modal-close" @click="confirmDialog = null"><v-icon small color="#7f8c8d">mdi-close</v-icon></button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">{{ confirmDialog.message }}</p>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDialog = null">Cancel</button>
            <button class="btn-danger" :disabled="confirmDialog.loading" @click="confirmDialog.onConfirm">
              {{ confirmDialog.loading ? 'Working…' : confirmDialog.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- TOASTS -->
    <div class="toast-wrap">
      <transition-group name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast-${t.type}`">
          <v-icon small color="white" class="mr-2">{{ t.icon }}</v-icon>
          <span>{{ t.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'AdminDashboard',
  middleware: ['auth'],

  data() {
    return {
      loading: true, menuOpen: false, loadError: '', scrolled: false,
      activeTab: 'home',
      user: null,
      stats: {
        pending_verifications: 0, pending_assessments: 0, verified_professionals: 0,
        active_parents: 0, total_bookings: 0, open_complaints: 0
      },

      verificationFilter: 'pending',
      verificationFilters: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'all', label: 'All' }
      ],
      verificationSearch: '',
      verifications: [],
      selectedVerification: null,
      rejectMode: false,
      rejectNotes: '',
      verificationError: '',
      docForm: { id: '', qualification: '', licence: '' },
      savedDocs: { id: '', qualification: '', licence: '' },
      savingDocs: false,
      verificationRefs: [],
      newRef: { name: '', phone: '', relationship: '' },
      addingRef: false,
      reviewerNotes: '',
      savedNotes: '',
      savingNotes: false,

      assessmentFilter: 'submitted',
      assessmentFilters: [
        { value: 'submitted', label: 'Submitted' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'completed', label: 'Completed' },
        { value: 'all', label: 'All' }
      ],
      assessmentSearch: '',
      assessments: [],
      verifiedProfessionals: [],
      selectedAssessment: null,
      assignProfessionalId: null,
      assignError: '',

      bookingFilter: 'all',
      bookingFilters: [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no_show', label: 'No-show' }
      ],
      bookingSearch: '',
      bookings: [],
      selectedBooking: null,

      paymentFilter: 'all',
      paymentFilters: [
        { value: 'all', label: 'All' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ],
      paymentSearch: '',
      payments: [],
      paymentsSummary: null,
      paymentsConfirmedOnly: false,
      selectedPayment: null,

      userFilter: 'all',
      userFilters: [
        { value: 'all', label: 'All' },
        { value: 'parent', label: 'Parents' },
        { value: 'professional', label: 'Professionals' },
        { value: 'suspended', label: 'Suspended' }
      ],
      userSearch: '',
      users: [],
      selectedUser: null,
      newRole: '',

      complaintFilter: 'open',
      complaintFilters: [
        { value: 'open', label: 'Open' },
        { value: 'investigating', label: 'Investigating' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' },
        { value: 'all', label: 'All' }
      ],
      complaintSearch: '',
      complaints: [],
      selectedComplaint: null,
      newComplaintStatus: '',
      complaintResolution: '',

      auditAction: '', auditSearch: '', auditLog: [],

      analyticsRange: '30d',
      analyticsRanges: [
        { value: '7d',  label: '7d' },
        { value: '30d', label: '30d' },
        { value: '90d', label: '90d' },
        { value: 'all', label: 'All' }
      ],
      analytics: null,
      analyticsLoading: false,

      acting: false, confirmDialog: null, toasts: []
    };
  },

  computed: {
    tabs() {
      return [
        { value: 'home', label: 'Home', shortLabel: 'Home', icon: 'mdi-home-variant-outline' },
        { value: 'verifications', label: 'Verifications', shortLabel: 'Verify', icon: 'mdi-account-check-outline', badge: this.stats.pending_verifications || null },
        { value: 'assessments', label: 'Assessments', shortLabel: 'Assess', icon: 'mdi-file-document-outline', badge: this.stats.pending_assessments || null },
        { value: 'bookings', label: 'Bookings', shortLabel: 'Book', icon: 'mdi-calendar-check-outline' },
        { value: 'payments', label: 'Payments', shortLabel: 'Pay', icon: 'mdi-cash-multiple' },
        { value: 'users', label: 'Users', shortLabel: 'Users', icon: 'mdi-account-group-outline' },
        { value: 'complaints', label: 'Complaints', shortLabel: 'Reports', icon: 'mdi-flag-outline', badge: this.stats.open_complaints || null },
        { value: 'audit', label: 'Audit', shortLabel: 'Audit', icon: 'mdi-history' }
      ];
    },
    displayName() { return this.user?.display_name || this.user?.email || 'Admin'; },
    email() { return this.user?.email || ''; },
    initials() {
      const n = this.displayName.trim();
      if (!n) return 'A';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    filteredVerifications() {
      const q = this.verificationSearch.toLowerCase();
      if (!q) return this.verifications;
      return this.verifications.filter((v) => [v.display_name, v.type, v.county, v.area, v.email].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    filteredAssessments() {
      const q = this.assessmentSearch.toLowerCase();
      if (!q) return this.assessments;
      return this.assessments.filter((a) => [a.child_name, a.preferred_county, a.child_county, a.parent_name, a.assigned_professional_name].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    filteredBookings() {
      const q = this.bookingSearch.toLowerCase();
      if (!q) return this.bookings;
      return this.bookings.filter((b) => [b.child_name, b.parent_name, b.professional_name, b.service_name].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    filteredPayments() {
      const q = this.paymentSearch.toLowerCase();
      if (!q) return this.payments;
      return this.payments.filter((p) => [
        p.parent_name, p.parent_email, p.parent_phone, p.child_name,
        p.professional_name, p.service_name, p.mpesa_receipt,
        p.mpesa_checkout_id, p.failure_reason, p.status, p.method
      ].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    filteredUsers() {
      const q = this.userSearch.toLowerCase();
      if (!q) return this.users;
      return this.users.filter((u) => [u.display_name, u.email, u.phone, u.role].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    filteredComplaints() {
      const q = this.complaintSearch.toLowerCase();
      if (!q) return this.complaints;
      return this.complaints.filter((c) => [c.reporter_name, c.subject_name, c.type, c.description].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    filteredAudit() {
      const q = this.auditSearch.toLowerCase();
      if (!q) return this.auditLog;
      return this.auditLog.filter((a) => [a.action, a.entity, a.actor_name].filter(Boolean).some((x) => String(x).toLowerCase().includes(q)));
    },
    docsDirty() {
      return (this.docForm.id || '') !== (this.savedDocs.id || '') ||
             (this.docForm.qualification || '') !== (this.savedDocs.qualification || '') ||
             (this.docForm.licence || '') !== (this.savedDocs.licence || '');
    },
    notesDirty() { return (this.reviewerNotes || '') !== (this.savedNotes || ''); }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    const qTab = this.$route.query.tab;
    const valid = ['home', 'verifications', 'assessments', 'bookings', 'payments', 'users', 'complaints', 'audit'];
    if (valid.includes(qTab)) this.activeTab = qTab;
    this.loadAll();
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    onScroll() { this.scrolled = window.scrollY > 4; },
    closeMenu() { this.menuOpen = false; },

    toast(message, type = 'success', icon = 'mdi-check-circle-outline') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, icon });
      setTimeout(() => { this.toasts = this.toasts.filter((t) => t.id !== id); }, 3200);
    },

    _fbAuth() {
      if (this.$fire?.auth) return this.$fire.auth;
      if (this.$firebase) return typeof this.$firebase.auth === 'function' ? this.$firebase.auth() : this.$firebase.auth;
      return null;
    },
    async authHeader() {
      const auth = this._fbAuth();
      const user = auth?.currentUser;
      if (!user) return {};
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    },

    setTab(tab) {
      this.menuOpen = false;
      this.activeTab = tab;
      this.$router.replace({ path: '/dashboard/admin', query: { tab } }).catch(() => {});
      this.reloadActive();
    },

    reloadActive() {
      switch (this.activeTab) {
        case 'verifications': return this.loadVerifications();
        case 'assessments': return this.loadAssessments();
        case 'bookings': return this.loadBookings();
        case 'payments': return this.loadPayments();
        case 'users': return this.loadUsers();
        case 'complaints': return this.loadComplaints();
        case 'audit': return this.loadAudit();
        default: return Promise.resolve();
      }
    },

    async loadAll() {
      this.loading = true; this.loadError = '';
      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) return this.$router.replace('/login/admin');
        const [meRes, statsRes] = await Promise.all([
          axios.get(`${API}/api/users/me`, { headers }),
          axios.get(`${API}/api/admin/stats`, { headers })
        ]);
        this.user = meRes.data?.data || null;
        if (!this.user || this.user.role !== 'admin') {
          this.loadError = 'Admin access required.';
          this.loading = false;
          setTimeout(() => this.$router.replace('/login/admin'), 1500);
          return;
        }
        this.stats = statsRes.data?.data || this.stats;
        this.loadAnalytics();
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) { this.loadError = 'Your session expired.'; setTimeout(() => this.$router.replace('/login/admin'), 1500); }
        else if (status === 403) this.loadError = 'Admin access required.';
        else this.loadError = 'Could not load admin dashboard.';
      } finally { this.loading = false; }
    },

    /* VERIFICATIONS */
    async loadVerifications() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/professionals?status=${this.verificationFilter}`, { headers });
        this.verifications = data.data || [];
      } catch (err) { console.warn('[admin] load verifications', err.response?.status); }
    },

    async openVerification(v) {
      this.selectedVerification = v;
      this.rejectMode = false; this.rejectNotes = ''; this.verificationError = '';
      this.docForm = { id: v.id_doc_url || '', qualification: v.qualification_doc_url || '', licence: v.licence_doc_url || '' };
      this.savedDocs = { ...this.docForm };
      this.reviewerNotes = v.notes || '';
      this.savedNotes = this.reviewerNotes;
      this.newRef = { name: '', phone: '', relationship: '' };

      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/professionals/${v.professional_id}`, { headers });
        const full = data.data;
        this.verificationRefs = Array.isArray(full.references) ? full.references : [];
        this.docForm = { id: full.id_doc_url || '', qualification: full.qualification_doc_url || '', licence: full.licence_doc_url || '' };
        this.savedDocs = { ...this.docForm };
        this.reviewerNotes = full.reviewer_notes || '';
        this.savedNotes = this.reviewerNotes;
      } catch (e) { this.verificationRefs = []; }
    },

    closeVerification() {
      this.selectedVerification = null;
      this.rejectMode = false; this.rejectNotes = ''; this.verificationError = '';
      this.verificationRefs = []; this.reviewerNotes = ''; this.savedNotes = '';
      this.docForm = { id: '', qualification: '', licence: '' };
      this.savedDocs = { id: '', qualification: '', licence: '' };
    },

    async saveDocuments() {
      const pid = this.selectedVerification?.professional_id;
      if (!pid) return;
      this.savingDocs = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(`${API}/api/admin/professionals/${pid}/documents`, {
          id: this.docForm.id || null,
          qualification: this.docForm.qualification || null,
          licence: this.docForm.licence || null
        }, { headers });
        this.savedDocs = { ...this.docForm };
        this.toast('Document URLs saved');
        await this.loadVerifications();
      } catch (err) {
        this.toast(err.response?.data?.error || 'Save failed', 'error', 'mdi-alert-circle-outline');
      } finally { this.savingDocs = false; }
    },

    async addReference() {
      const pid = this.selectedVerification?.professional_id;
      if (!pid || !this.newRef.name || !this.newRef.phone) return;
      this.addingRef = true;
      try {
        const headers = await this.authHeader();
        const { data } = await axios.post(`${API}/api/admin/professionals/${pid}/references`, this.newRef, { headers });
        this.verificationRefs = data.references || [];
        this.newRef = { name: '', phone: '', relationship: '' };
        this.toast('Reference added');
      } catch (err) {
        this.toast('Could not add reference', 'error', 'mdi-alert-circle-outline');
      } finally { this.addingRef = false; }
    },

    async removeReference(i) {
      const pid = this.selectedVerification?.professional_id;
      if (!pid) return;
      try {
        const headers = await this.authHeader();
        const { data } = await axios.delete(`${API}/api/admin/professionals/${pid}/references/${i}`, { headers });
        this.verificationRefs = data.references || [];
      } catch (err) {
        this.toast('Could not remove reference', 'error', 'mdi-alert-circle-outline');
      }
    },

    async saveNotes() {
      const pid = this.selectedVerification?.professional_id;
      if (!pid) return;
      this.savingNotes = true;
      try {
        const headers = await this.authHeader();
        await axios.post(`${API}/api/admin/professionals/${pid}/notes`, { notes: this.reviewerNotes }, { headers });
        this.savedNotes = this.reviewerNotes;
        this.toast('Notes saved');
      } catch (err) {
        this.toast('Could not save notes', 'error', 'mdi-alert-circle-outline');
      } finally { this.savingNotes = false; }
    },

    async approveVerification() {
      const pid = this.selectedVerification?.professional_id;
      if (!pid || this.acting) return;
      this.acting = true; this.verificationError = '';
      try {
        const headers = await this.authHeader();
        await axios.post(`${API}/api/admin/professionals/${pid}/approve`, {}, { headers });
        this.toast('Professional approved');
        this.closeVerification();
        await this.loadVerifications();
        await this.reloadStats();
        await this.loadAnalytics();
      } catch (err) { this.verificationError = err.response?.data?.error || 'Could not approve.'; }
      finally { this.acting = false; }
    },

    async submitReject() {
      const pid = this.selectedVerification?.professional_id;
      if (!pid || this.acting || this.rejectNotes.length < 5) return;
      this.acting = true; this.verificationError = '';
      try {
        const headers = await this.authHeader();
        await axios.post(`${API}/api/admin/professionals/${pid}/reject`, { notes: this.rejectNotes }, { headers });
        this.toast('Professional rejected', 'warn', 'mdi-alert-outline');
        this.closeVerification();
        await this.loadVerifications();
        await this.reloadStats();
      } catch (err) { this.verificationError = err.response?.data?.error || 'Could not reject.'; }
      finally { this.acting = false; }
    },

    async resetVerification() {
      const pid = this.selectedVerification?.professional_id;
      if (!pid || this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.post(`${API}/api/admin/professionals/${pid}/reset-to-pending`, {}, { headers });
        this.toast('Reset to pending', 'warn', 'mdi-alert-outline');
        this.closeVerification();
        await this.loadVerifications();
        await this.reloadStats();
      } catch (err) { this.verificationError = err.response?.data?.error || 'Could not reset.'; }
      finally { this.acting = false; }
    },

    /* ASSESSMENTS */
    async loadAssessments() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/assessment-requests?status=${this.assessmentFilter}`, { headers });
        this.assessments = data.data || [];
      } catch (err) { console.warn('[admin] load assessments', err.response?.status); }
    },
    async loadVerifiedProfessionals() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/verified-professionals`, { headers });
        this.verifiedProfessionals = data.data || [];
      } catch (err) { console.warn('[admin] load professionals'); }
    },
    async openAssessment(a) {
      this.selectedAssessment = a;
      this.assignProfessionalId = a.assigned_professional_id || null;
      this.assignError = '';
      if (!this.verifiedProfessionals.length) await this.loadVerifiedProfessionals();
    },
    closeAssessment() {
      this.selectedAssessment = null;
      this.assignProfessionalId = null;
      this.assignError = '';
    },
    async submitAssign() {
      if (!this.selectedAssessment || !this.assignProfessionalId || this.acting) return;
      this.acting = true; this.assignError = '';
      try {
        const headers = await this.authHeader();
        await axios.post(`${API}/api/admin/assessment-requests/${this.selectedAssessment.id}/assign`, { professional_id: this.assignProfessionalId }, { headers });
        this.toast('Assessment assigned');
        this.closeAssessment();
        await this.loadAssessments();
        await this.reloadStats();
      } catch (err) { this.assignError = err.response?.data?.error || 'Could not assign.'; }
      finally { this.acting = false; }
    },

    /* BOOKINGS */
    async loadBookings() {
      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.bookingFilter !== 'all') params.status = this.bookingFilter;
        const { data } = await axios.get(`${API}/api/admin/bookings`, { headers, params });
        this.bookings = data.data || [];
      } catch (err) { console.warn('[admin] load bookings', err.response?.status); }
    },
    async openBooking(b) {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/bookings/${b.id}`, { headers });
        this.selectedBooking = data.data;
      } catch (err) {
        this.selectedBooking = b;
      }
    },
    async exportBookings() {
      try {
        const headers = await this.authHeader();
        const res = await axios.get(`${API}/api/admin/bookings/export.csv`, { headers, responseType: 'blob' });
        this.downloadBlob(res.data, 'nova-bookings.csv');
      } catch (e) { this.toast('Export failed', 'error', 'mdi-alert-circle-outline'); }
    },

    /* PAYMENTS */
    async loadPayments() {
      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.paymentFilter !== 'all') params.status = this.paymentFilter;
        if (this.paymentsConfirmedOnly) params.confirmed = '1';
        const { data } = await axios.get(`${API}/api/admin/payments`, { headers, params });
        this.payments = data.data || [];
        this.paymentsSummary = data.summary || null;
      } catch (err) { console.warn('[admin] load payments', err.response?.status); }
    },
    toggleConfirmedOnly() {
      this.paymentsConfirmedOnly = !this.paymentsConfirmedOnly;
      this.loadPayments();
    },
    async openPayment(p) {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/payments/${p.id}`, { headers });
        this.selectedPayment = data.data;
      } catch (err) {
        this.selectedPayment = p;
      }
    },
    async exportPayments() {
      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.paymentFilter !== 'all') params.status = this.paymentFilter;
        if (this.paymentsConfirmedOnly) params.confirmed = '1';
        const res = await axios.get(`${API}/api/admin/payments/export.csv`, { headers, params, responseType: 'blob' });
        this.downloadBlob(res.data, 'nova-payments.csv');
      } catch (e) { this.toast('Export failed', 'error', 'mdi-alert-circle-outline'); }
    },
    paymentStatusLabel(p) {
      if (!p) return '';
      if (p.status === 'paid' && p.mpesa_receipt) return 'confirmed';
      if (p.status === 'paid') return 'paid';
      return p.status;
    },
    paymentStatusClass(p) {
      if (!p) return 'status-grey';
      if (p.status === 'paid' && p.mpesa_receipt) return 'status-green';
      if (p.status === 'paid') return 'status-amber';
      if (p.status === 'failed') return 'status-red';
      if (p.status === 'refunded') return 'status-grey';
      return 'status-amber';
    },
    paymentStatusIcon(status) {
      if (status === 'paid') return 'mdi-check-circle';
      if (status === 'failed') return 'mdi-close-circle';
      if (status === 'refunded') return 'mdi-backup-restore';
      return 'mdi-clock-outline';
    },
    paymentAvatarBg(status) {
      if (status === 'paid') return 'linear-gradient(135deg, #1e8a4c, #2ecc71)';
      if (status === 'failed') return 'linear-gradient(135deg, #c0392b, #e74c3c)';
      if (status === 'refunded') return 'linear-gradient(135deg, #7f8c8d, #95a5a6)';
      return 'linear-gradient(135deg, #b7791f, #f39c12)';
    },
    shortId(s) {
      if (!s) return '';
      return s.length > 18 ? `${s.slice(0, 10)}…${s.slice(-5)}` : s;
    },
    prettyJson(v) {
      if (v == null) return '';
      try {
        if (typeof v === 'string') return JSON.stringify(JSON.parse(v), null, 2);
        return JSON.stringify(v, null, 2);
      } catch (e) {
        return String(v);
      }
    },

    /* USERS */
    async loadUsers() {
      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.userFilter === 'parent' || this.userFilter === 'professional') params.role = this.userFilter;
        else if (this.userFilter === 'suspended') params.status = 'suspended';
        const { data } = await axios.get(`${API}/api/admin/users`, { headers, params });
        this.users = data.data || [];
      } catch (err) { console.warn('[admin] load users', err.response?.status); }
    },
    async openUser(u) {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/users/${u.id}`, { headers });
        this.selectedUser = data.data;
        this.newRole = data.data.role;
      } catch (err) {
        this.selectedUser = u;
        this.newRole = u.role;
      }
    },
    async changeUserRole() {
      if (!this.selectedUser || this.newRole === this.selectedUser.role || this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(`${API}/api/admin/users/${this.selectedUser.id}/role`, { role: this.newRole }, { headers });
        this.selectedUser.role = this.newRole;
        this.toast('Role changed');
        await this.loadUsers();
      } catch (err) { this.toast(err.response?.data?.error || 'Could not change role', 'error', 'mdi-alert-circle-outline'); }
      finally { this.acting = false; }
    },
    async toggleUserStatus() {
      if (!this.selectedUser || this.acting) return;
      const isActive = this.selectedUser.status === 'active';
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(`${API}/api/admin/users/${this.selectedUser.id}/status`, { status: isActive ? 'suspended' : 'active' }, { headers });
        this.selectedUser.status = isActive ? 'suspended' : 'active';
        this.toast(isActive ? 'User suspended' : 'User reactivated', isActive ? 'warn' : 'success');
        await this.loadUsers();
      } catch (err) { this.toast(err.response?.data?.error || 'Could not update', 'error', 'mdi-alert-circle-outline'); }
      finally { this.acting = false; }
    },
    async exportUsers() {
      try {
        const headers = await this.authHeader();
        const res = await axios.get(`${API}/api/admin/users/export.csv`, { headers, responseType: 'blob' });
        this.downloadBlob(res.data, 'nova-users.csv');
      } catch (e) { this.toast('Export failed', 'error', 'mdi-alert-circle-outline'); }
    },

    /* COMPLAINTS */
    async loadComplaints() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/complaints?status=${this.complaintFilter}`, { headers });
        this.complaints = data.data || [];
      } catch (err) { console.warn('[admin] load complaints', err.response?.status); }
    },
    openComplaint(c) {
      this.selectedComplaint = c;
      this.newComplaintStatus = c.status;
      this.complaintResolution = c.resolution || '';
    },
    async updateComplaint() {
      if (!this.selectedComplaint || this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(`${API}/api/admin/complaints/${this.selectedComplaint.id}/status`, {
          status: this.newComplaintStatus,
          resolution: this.complaintResolution || null
        }, { headers });
        this.selectedComplaint.status = this.newComplaintStatus;
        this.selectedComplaint.resolution = this.complaintResolution;
        this.toast('Complaint updated');
        await this.loadComplaints();
      } catch (err) { this.toast('Could not update', 'error', 'mdi-alert-circle-outline'); }
      finally { this.acting = false; }
    },

    /* AUDIT */
    async loadAudit() {
      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.auditAction) params.action = this.auditAction;
        const { data } = await axios.get(`${API}/api/admin/audit-log`, { headers, params });
        this.auditLog = data.data || [];
      } catch (err) { console.warn('[admin] load audit', err.response?.status); }
    },
    auditIcon(action) {
      if (!action) return 'mdi-history';
      if (action.startsWith('admin.') || action.startsWith('user.')) return 'mdi-shield-account-outline';
      if (action.startsWith('payment.')) return 'mdi-cash';
      if (action.startsWith('booking.')) return 'mdi-calendar-check-outline';
      if (action.startsWith('assessment')) return 'mdi-file-document-outline';
      if (action.startsWith('professional.')) return 'mdi-stethoscope';
      return 'mdi-history';
    },

    /* ANALYTICS */
    async loadAnalytics() {
      this.analyticsLoading = true;
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(
          `${API}/api/admin/analytics?range=${this.analyticsRange}`,
          { headers }
        );
        this.analytics = data.data || null;
      } catch (err) {
        console.warn('[admin] load analytics', err.response?.status);
        this.analytics = null;
      } finally {
        this.analyticsLoading = false;
      }
    },

    setAnalyticsRange(r) {
      this.analyticsRange = r;
      this.loadAnalytics();
    },

    svgPoints(values, width, height, pad = 4) {
      if (!values.length) return '';
      const max = Math.max(...values, 1);
      const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
      return values.map((v, i) => {
        const x = pad + i * stepX;
        const y = height - pad - (v / max) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
    },

    barHeight(v, max, height) {
      if (!max || max <= 0) return 0;
      return Math.max(2, (v / max) * height);
    },

    formatRevenueShort(n) {
      n = Number(n || 0);
      if (n >= 1000000) return `KSh ${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000)    return `KSh ${(n / 1000).toFixed(1)}k`;
      return `KSh ${n}`;
    },

    shortDayLabel(d) {
      if (!d) return '';
      const dt = new Date(d);
      return dt.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
    },

    shortMonthLabel(m) {
      if (!m) return '';
      const [y, mo] = m.split('-');
      const dt = new Date(Number(y), Number(mo) - 1, 1);
      return dt.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' });
    },

    donutSlices(data) {
      const total = data.reduce((s, d) => s + d.count, 0) || 1;
      let offset = 0;
      const r = 40, C = 2 * Math.PI * r;
      const palette = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1', '#b7791f', '#229954', '#95a5a6'];
      return data.map((d, i) => {
        const frac = d.count / total;
        const slice = {
          label: d.type,
          count: d.count,
          pct: Math.round(frac * 100),
          color: palette[i % palette.length],
          dasharray: `${(frac * C).toFixed(2)} ${C.toFixed(2)}`,
          dashoffset: (-offset * C).toFixed(2)
        };
        offset += frac;
        return slice;
      });
    },

    async reloadStats() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/stats`, { headers });
        this.stats = data.data || this.stats;
      } catch (e) { console.warn('[admin] reload stats failed', e.message); }
    },

    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    hasAnyDoc(v) { return !!(v.id_doc_url || v.qualification_doc_url || v.licence_doc_url); },
    initialsOf(name) { const n = (name || '').trim(); if (!n) return '?'; return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase(); },
    avatarBg(id) { const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1']; return p[(Number(id) || 0) % p.length]; },
    statusClass(s) {
      s = String(s || '').toLowerCase();
      if (['approved', 'verified', 'completed', 'assigned', 'active', 'resolved', 'paid', 'confirmed'].includes(s)) return 'status-green';
      if (['pending', 'submitted', 'routing', 'in_progress', 'investigating', 'refunded'].includes(s)) return 'status-amber';
      if (['rejected', 'cancelled', 'no_show', 'suspended', 'open', 'failed'].includes(s)) return 'status-red';
      return 'status-grey';
    },
    complaintClass(s) {
      s = String(s || '').toLowerCase();
      if (s === 'open') return 'status-red';
      if (s === 'investigating') return 'status-amber';
      if (s === 'resolved') return 'status-green';
      return 'status-grey';
    },
    typeLabel(t) {
      const m = { speech_therapist: 'Speech & language', occupational_therapist: 'Occupational therapy', physiotherapist: 'Physiotherapy', psychologist: 'Psychology', special_needs_teacher: 'Special-needs education', learning_support: 'Learning support', parent_coach: 'Parent coaching', other: 'Other' };
      return m[t] || t || '';
    },
    formatPrice(n) { return Number(n || 0).toLocaleString('en-US'); },
    shortDate(dt) { if (!dt) return '—'; return new Date(dt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); },
    fullDate(dt) { if (!dt) return '—'; return new Date(dt).toLocaleString('en-KE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); },
    relativeTime(ts) {
      if (!ts) return '';
      const diff = Date.now() - new Date(ts).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days === 1) return '1 day ago';
      if (days < 30) return `${days} days ago`;
      return new Date(ts).toLocaleDateString();
    },

    async signOut() {
      this.menuOpen = false;
      try { const auth = this._fbAuth(); if (auth) await auth.signOut(); } catch (e) {}
      this.$router.replace('/login/admin').catch(() => {});
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  --purple: #4a3b8c; --purple-2: #5b4b9e; --purple-soft: #ede7f8;
  --teal: #56c2d9; --teal-2: #7ec8e3;
  --pink: #e86a8a; --pink-2: #f48fb1;
  --ink: #1f2a37; --muted: #7f8c8d; --muted-2: #95a5a6;
  --line: #e9eaf0; --line-2: #f0f0f5;
  --bg: #f5f7fb; --bg-2: #fbfcfe; --white: #ffffff;
  --green: #229954; --green-soft: #e6f9ee;
  --amber: #b7791f; --amber-soft: #fef3e0;
  --red: #c0392b; --red-soft: #fdecea;
  --radius-lg: 20px; --radius: 14px; --radius-sm: 10px;
  --shadow-1: 0 2px 6px -2px rgba(44, 62, 80, 0.06);
  --shadow-2: 0 14px 32px -20px rgba(74, 59, 140, 0.28);
  --shadow-3: 0 28px 56px -24px rgba(15, 13, 36, 0.32);
  --ring: 0 0 0 3px rgba(74, 59, 140, 0.12);
  min-height: 100vh;
  background:
    radial-gradient(1200px 500px at 0% -10%, #ece7fa 0%, transparent 55%),
    radial-gradient(900px 480px at 100% 0%, #e6f4f8 0%, transparent 55%),
    var(--bg);
  padding-bottom: 64px;
  color: var(--ink);
}
@media (max-width: 599px) {
  .admin-dashboard { padding-bottom: 88px; }
}

.topbar {
  position: sticky; top: 0; z-index: 40; height: 66px; padding: 0 16px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.topbar.scrolled { border-bottom-color: var(--line); box-shadow: 0 10px 30px -22px rgba(44, 62, 80, 0.35); }
@media (min-width: 768px) { .topbar { padding: 0 32px; } }

.brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 11px;
  background: linear-gradient(135deg, var(--purple) 0%, var(--purple-2) 45%, var(--teal) 100%);
  display: grid; place-items: center;
  box-shadow: 0 8px 18px -8px rgba(74, 59, 140, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.brand-name { font-size: 16.5px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
.brand-dot { color: var(--pink); }

.topbar-actions { display: flex; align-items: center; gap: 10px; }
.icon-btn {
  width: 38px; height: 38px; border-radius: 11px; border: 1px solid var(--line);
  background: var(--white); display: grid; place-items: center; cursor: pointer; color: var(--purple);
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  box-shadow: var(--shadow-1);
}
.icon-btn:hover:not(:disabled) { background: #f7f5ff; border-color: #d9d2ec; transform: translateY(-1px); }
.icon-btn:active:not(:disabled) { transform: scale(0.96); }
.icon-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.user-menu-wrap { position: relative; }
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--teal-2));
  color: #fff; border: 2px solid var(--white);
  font-weight: 800; font-size: 13px; cursor: pointer;
  box-shadow: 0 8px 18px -8px rgba(74, 59, 140, 0.65);
}
.user-menu {
  position: absolute; top: calc(100% + 10px); right: 0; min-width: 250px;
  background: var(--white); border: 1px solid var(--line); border-radius: 18px;
  box-shadow: var(--shadow-3); overflow: hidden; z-index: 50;
}
.user-menu-head { padding: 18px; border-bottom: 1px solid var(--line-2); }
.user-menu-name { font-size: 0.92rem; font-weight: 800; color: var(--ink); }
.user-menu-email { font-size: 0.76rem; color: var(--muted); margin-top: 3px; }
.role-badge {
  display: inline-block; margin-top: 12px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px; background: var(--purple-soft); color: var(--purple);
}
.user-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 14px 18px; background: transparent; border: none;
  text-align: left; font-size: 0.88rem; color: var(--ink); cursor: pointer;
  font-family: inherit; font-weight: 600;
}
.user-menu-item.danger { color: var(--red); }
.user-menu-item:hover { background: var(--bg-2); }

.tabs {
  position: sticky; top: 66px; z-index: 30; display: flex; gap: 2px;
  padding: 0 12px; overflow-x: auto; scrollbar-width: none;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--line);
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 15px 16px 14px; border: none; background: transparent;
  font-size: 0.83rem; font-weight: 700; color: var(--muted); cursor: pointer;
  font-family: inherit; white-space: nowrap; position: relative;
  transition: color 0.18s ease;
}
.tab::after {
  content: ''; position: absolute; left: 12px; right: 12px; bottom: 0;
  height: 2px; border-radius: 2px;
  background: linear-gradient(90deg, var(--purple), var(--teal));
  transform: scaleX(0); transform-origin: center;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.tab:hover { color: var(--purple); }
.tab.active { color: var(--purple); }
.tab.active::after { transform: scaleX(1); }

.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 7px; border-radius: 999px;
  background: linear-gradient(135deg, var(--pink), var(--pink-2));
  color: #fff; font-size: 0.63rem; font-weight: 800; margin-left: 2px;
  box-shadow: 0 4px 10px -4px rgba(232, 106, 138, 0.7);
}
.tab:not(.active) .tab-badge { background: var(--purple-soft); color: var(--purple); box-shadow: none; }

@media (max-width: 599px) { .tabs { display: none; } }

.main { max-width: 1040px; margin: 0 auto; padding: 28px 16px 48px; }
@media (min-width: 768px) { .main { padding: 40px 32px 64px; } }
.greeting { margin-bottom: 24px; }
.greeting h1 { font-size: 1.7rem; font-weight: 800; letter-spacing: -0.025em; color: var(--ink); margin: 0 0 6px; }
.greeting p { font-size: 0.95rem; color: var(--muted); margin: 0; }

.skeleton-wrap { padding-top: 4px; }
.sk-greeting { margin-bottom: 24px; }
.sk-line {
  height: 12px; border-radius: 8px;
  background: linear-gradient(90deg, #eaedf3 0%, #f6f8fb 50%, #eaedf3 100%);
  background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite;
}
.sk-title { width: 200px; height: 26px; margin-bottom: 10px; }
.sk-sub { width: 140px; }
.sk-stat {
  display: flex; align-items: center; gap: 12px;
  background: var(--white); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 16px;
}
.sk-circle { width: 42px; height: 42px; border-radius: 12px; background: #eaedf3; flex: 0 0 auto; animation: shimmer 1.4s ease-in-out infinite; }
.sk-stat-body { flex: 1; }
.sk-label { width: 60%; height: 10px; margin-bottom: 8px; }
.sk-value { width: 40%; height: 18px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.error-card {
  background: var(--white); border-radius: var(--radius-lg); padding: 48px 28px;
  text-align: center; border: 1px solid var(--red-soft);
  max-width: 520px; margin: 40px auto; box-shadow: var(--shadow-2);
}
.error-icon { width: 88px; height: 88px; border-radius: 50%; background: var(--red-soft); display: grid; place-items: center; margin: 0 auto 22px; }
.error-card h2 { font-size: 1.25rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.error-card p { font-size: 0.92rem; color: var(--muted); line-height: 1.6; margin: 0 0 26px; }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 24px; }
@media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
.stat-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--white); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 18px; cursor: pointer;
  position: relative; overflow: hidden; box-shadow: var(--shadow-1);
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s ease, border-color 0.22s ease;
}
.stat-card::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  background: linear-gradient(135deg, transparent 40%, rgba(74, 59, 140, 0.05));
  opacity: 0; transition: opacity 0.22s ease; pointer-events: none;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 22px 40px -22px rgba(74, 59, 140, 0.38); border-color: #d9d2ec; }
.stat-card:hover::before { opacity: 1; }
.stat-icon {
  width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 10px 22px -12px rgba(74, 59, 140, 0.6);
}
.stat-body { flex: 1; min-width: 0; }
.stat-label { font-size: 0.66rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
.stat-value { font-size: 1.65rem; font-weight: 900; color: var(--ink); line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.stat-chevron { flex: 0 0 auto; }

.gradient-purple .stat-icon { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-pink   .stat-icon { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-green  .stat-icon { background: linear-gradient(135deg, #1e8a4c, #2ecc71); }
.gradient-teal   .stat-icon { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }
.gradient-indigo .stat-icon { background: linear-gradient(135deg, #4a3b8c, #7ec8e3); }
.gradient-amber  .stat-icon { background: linear-gradient(135deg, #b7791f, #f39c12); }

/* ===== ANALYTICS ===== */
.analytics-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin: 20px 0 16px;
}
.analytics-h2 {
  font-size: 1.15rem; font-weight: 800; color: var(--ink);
  margin: 0; letter-spacing: -0.01em;
}
.analytics-range-tabs { flex: 0 0 auto; min-width: 260px; }
@media (max-width: 599px) { .analytics-range-tabs { min-width: 100%; } }

.chart-skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 640px) { .chart-skeleton-grid { grid-template-columns: 1fr; } }
.chart-skeleton {
  height: 220px; border-radius: var(--radius);
  background: linear-gradient(90deg, #eaedf3 0%, #f6f8fb 50%, #eaedf3 100%);
  background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite;
}

.kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
@media (min-width: 720px) { .kpi-grid { grid-template-columns: repeat(4, 1fr); } }
.kpi-card {
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 16px; box-shadow: var(--shadow-1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 20px 36px -22px rgba(74, 59, 140, 0.35); }
.kpi-label { font-size: 0.64rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
.kpi-value { font-size: 1.5rem; font-weight: 900; color: var(--ink); letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 4px; }
.kpi-sub { font-size: 0.72rem; color: var(--muted-2); }

.chart-card {
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 20px; box-shadow: var(--shadow-1); margin-bottom: 14px;
}
.chart-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 12px; }
.chart-title { font-size: 0.95rem; font-weight: 800; color: var(--ink); }
.chart-legend { font-size: 0.73rem; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 2px; flex: 0 0 auto; }

.chart-body { position: relative; }
.chart-svg { width: 100%; height: 140px; display: block; }
.chart-x-axis { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--muted-2); margin-top: 6px; padding: 0 8px; }
.chart-empty { padding: 22px; text-align: center; color: var(--muted-2); font-size: 0.85rem; border: 1px dashed #d4dae4; border-radius: 12px; }

.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 170px; padding-top: 20px; }
.bar-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; height: 100%; }
.bar-value { font-size: 0.64rem; font-weight: 800; color: var(--purple); white-space: nowrap; transform: rotate(-12deg); transform-origin: center bottom; }
.bar {
  width: 100%; max-width: 48px;
  background: linear-gradient(180deg, #7ec8e3, #56c2d9);
  border-radius: 8px 8px 4px 4px;
  box-shadow: 0 10px 20px -12px rgba(86, 194, 217, 0.7);
  transition: transform 0.2s ease;
}
.bar:hover { transform: scaleY(1.03); }
.bar-label { font-size: 0.68rem; color: var(--muted-2); font-weight: 700; white-space: nowrap; }

.chart-split { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
@media (max-width: 720px) { .chart-split { grid-template-columns: 1fr; } }
.chart-split .chart-card { margin-bottom: 0; }

.donut-wrap { display: grid; grid-template-columns: 150px 1fr; gap: 16px; align-items: center; }
@media (max-width: 520px) { .donut-wrap { grid-template-columns: 1fr; } }
.donut-svg { width: 150px; height: 150px; display: block; }
.donut-legend { display: grid; gap: 8px; }
.legend-row { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; }
.legend-label { flex: 1; color: var(--ink); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.legend-value { color: var(--muted); font-weight: 700; font-size: 0.78rem; }

.outcomes { display: grid; gap: 14px; padding-top: 4px; }
.outcome-row { display: grid; grid-template-columns: 90px 1fr 44px; gap: 12px; align-items: center; }
.outcome-label { font-size: 0.82rem; font-weight: 700; color: var(--ink); }
.outcome-bar { height: 8px; background: #ececf1; border-radius: 999px; overflow: hidden; }
.outcome-bar span { display: block; height: 100%; border-radius: 999px; transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.outcome-pct { font-size: 0.82rem; font-weight: 800; color: var(--ink); text-align: right; }

.top-list { display: grid; gap: 8px; }
.top-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: var(--bg-2); border: 1px solid var(--line-2); }
.top-rank { width: 24px; font-size: 0.82rem; font-weight: 900; color: var(--muted); text-align: center; flex: 0 0 auto; }
.top-avatar { width: 36px; height: 36px; border-radius: 10px; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 0.78rem; flex: 0 0 auto; }
.top-body { flex: 1; min-width: 0; }
.top-name { font-size: 0.88rem; font-weight: 800; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top-sub { font-size: 0.74rem; color: var(--muted); margin-top: 2px; }
.top-stat { text-align: right; flex: 0 0 auto; min-width: 60px; }
.top-stat-value { font-size: 0.9rem; font-weight: 800; color: var(--ink); }
.top-stat-label { font-size: 0.64rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }

.county-list { display: grid; gap: 10px; }
.county-row { display: grid; grid-template-columns: 100px 1fr 44px; gap: 12px; align-items: center; }
.county-label { font-size: 0.82rem; font-weight: 700; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.county-bar { height: 8px; background: #ececf1; border-radius: 999px; overflow: hidden; }
.county-bar span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #4a3b8c, #56c2d9); transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.county-value { font-size: 0.82rem; font-weight: 800; color: var(--ink); text-align: right; }

/* ===== PAYMENT SUMMARY STRIP ===== */
.payment-summary {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;
}
@media (min-width: 720px) { .payment-summary { grid-template-columns: repeat(4, 1fr); } }
.pm-card {
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 16px; box-shadow: var(--shadow-1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pm-card:hover { transform: translateY(-2px); box-shadow: 0 20px 36px -22px rgba(74, 59, 140, 0.35); }
.pm-label { font-size: 0.64rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
.pm-value { font-size: 1.4rem; font-weight: 900; color: var(--ink); letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 4px; }
.pm-sub { font-size: 0.72rem; color: var(--muted-2); }

/* ===== REST ===== */
.list-toolbar { display: grid; gap: 12px; margin-bottom: 14px; }
@media (min-width: 640px) { .list-toolbar { grid-template-columns: 1fr 280px; align-items: center; } }
.sub-tabs {
  display: flex; gap: 4px; background: var(--white);
  border: 1px solid var(--line); border-radius: var(--radius);
  padding: 4px; overflow-x: auto; scrollbar-width: none;
  box-shadow: var(--shadow-1);
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex: 1; padding: 9px 14px; border: none; background: transparent;
  border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--muted);
  cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}
.sub-tab:hover { color: var(--purple); background: #f7f5ff; }
.sub-tab.active {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; box-shadow: 0 10px 20px -10px rgba(74, 59, 140, 0.7);
}
.search {
  position: relative; display: flex; align-items: center;
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 0 14px; height: 44px; box-shadow: var(--shadow-1);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.search:focus-within { border-color: var(--purple); box-shadow: var(--ring); }
.search-icon { margin-right: 10px; flex: 0 0 auto; }
.search input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.88rem; color: var(--ink); font-family: inherit; min-width: 0; }
.toolbar-actions { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }

.mini-empty {
  display: flex; align-items: center; padding: 28px;
  background: var(--white); border: 1px dashed #d4dae4; border-radius: var(--radius);
}
.empty-title { font-size: 0.92rem; font-weight: 800; color: var(--ink); }
.empty-sub { font-size: 0.8rem; color: var(--muted); margin-top: 3px; }

.list { display: grid; gap: 10px; }
.list-row {
  display: flex; align-items: center; gap: 16px;
  background: var(--white); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 16px 18px; cursor: pointer;
  box-shadow: var(--shadow-1);
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease, border-color 0.18s ease;
}
.list-row:hover { border-color: #d9d2ec; transform: translateY(-2px); box-shadow: 0 20px 36px -22px rgba(74, 59, 140, 0.4); }
.audit-row { cursor: default; }
.audit-row:hover { transform: none; box-shadow: var(--shadow-1); border-color: var(--line); }

.row-avatar {
  width: 48px; height: 48px; border-radius: 14px; color: #fff;
  display: grid; place-items: center; font-weight: 800; font-size: 14.5px;
  flex: 0 0 auto; box-shadow: 0 10px 22px -10px rgba(74, 59, 140, 0.55);
}
.row-avatar-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.audit-action-chip {
  width: 42px; height: 42px; border-radius: 13px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 10px 22px -12px rgba(74, 59, 140, 0.6);
}
.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 0.95rem; font-weight: 800; color: var(--ink); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 0.79rem; color: var(--muted); margin-bottom: 4px; }
.row-meta { font-size: 0.72rem; color: var(--muted-2); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.doc-flag { color: var(--green); font-weight: 700; }
.paid-flag { color: var(--green); font-weight: 700; font-size: 0.75rem; }
.pending-flag { color: var(--amber); font-weight: 700; font-size: 0.75rem; }
.failed-flag { color: var(--red); font-weight: 700; font-size: 0.75rem; }
.paid-yes { color: var(--green); font-weight: 700; }
.paid-no  { color: var(--amber); font-weight: 700; }

.role-chip {
  display: inline-block; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
  background: var(--purple-soft); color: var(--purple);
}
.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.64rem; font-weight: 800; padding: 6px 11px; border-radius: 999px;
  text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; flex: 0 0 auto;
}
.status-pill::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; flex: 0 0 auto;
}
.status-green { background: var(--green-soft); color: var(--green); }
.status-amber { background: var(--amber-soft); color: var(--amber); }
.status-red   { background: var(--red-soft); color: var(--red); }
.status-grey  { background: #ececf1; color: var(--muted); }

.row-action {
  padding: 9px 15px; border-radius: 11px; border: 1.5px solid var(--line);
  background: var(--white); color: var(--ink); font-size: 0.79rem;
  font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease; flex: 0 0 auto;
}
.row-action.danger:hover { border-color: var(--red); color: var(--red); background: var(--red-soft); }
.row-action.success:hover { border-color: var(--green); color: var(--green); background: var(--green-soft); }
.row-action:disabled { opacity: 0.55; cursor: not-allowed; }

.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 13px 24px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 14px 26px -12px rgba(74, 59, 140, 0.75);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 20px 34px -14px rgba(74, 59, 140, 0.85); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 18px; border-radius: 12px; border: 1.5px solid var(--line);
  background: var(--white); color: var(--ink); font-size: 0.88rem;
  font-weight: 700; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.btn-secondary:hover:not(:disabled) { border-color: var(--purple); color: var(--purple); background: #f9f8ff; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-danger {
  padding: 12px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 12px 24px -12px rgba(231, 76, 60, 0.75);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-danger:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 28px -14px rgba(231, 76, 60, 0.85); }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: var(--white); border-radius: 24px; padding: 28px;
  max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-3);
}
.modal-lg { max-width: 680px; }
.modal-sm { max-width: 420px; }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.modal-title { font-size: 1.08rem; font-weight: 800; color: var(--ink); }
.modal-close { background: transparent; border: none; padding: 8px; cursor: pointer; border-radius: 10px; }
.modal-close:hover { background: #f3f7fb; }
.modal-body { display: grid; gap: 10px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--line-2); }
.modal-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.modal-label { font-size: 0.7rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; flex: 0 0 auto; }
.modal-value { font-size: 0.88rem; color: var(--ink); font-weight: 600; text-align: right; flex: 1; min-width: 0; word-break: break-word; line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }

.section-title-sm { font-size: 0.7rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.7px; margin: 12px 0 6px; }
.mt-2 { margin-top: 10px; }
.mt-4 { margin-top: 20px; }

.doc-edit { display: grid; gap: 5px; padding: 12px 14px; background: var(--bg-2); border: 1px solid var(--line-2); border-radius: 12px; margin-bottom: 8px; }
.doc-edit:focus-within { border-color: var(--purple); background: #fbfaff; }
.doc-edit .text-input { font-size: 0.85rem; padding: 9px 11px; }
.doc-link-sm { font-size: 0.76rem; color: var(--purple); font-weight: 700; text-decoration: none; justify-self: start; }
.doc-link-sm:hover { text-decoration: underline; }

.ref-list-sm { display: grid; gap: 6px; margin-bottom: 8px; }
.ref-row-sm { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-2); border: 1px solid var(--line-2); border-radius: 11px; font-size: 0.83rem; }
.ref-x { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 8px; }
.ref-x:hover { background: var(--red-soft); }
.ref-add-sm { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 6px; margin-top: 6px; }
@media (max-width: 599px) { .ref-add-sm { grid-template-columns: 1fr 1fr; } .ref-add-sm button { grid-column: span 2; } }

.role-change { display: grid; grid-template-columns: 1fr auto; gap: 10px; }

.reject-box { padding: 16px; background: var(--red-soft); border-radius: 14px; border: 1px solid #f5c2bd; }
.field-label { display: block; font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 7px; }
.text-input {
  width: 100%; padding: 12px 14px; border: 1.5px solid var(--line);
  border-radius: 12px; font-size: 0.92rem; background: var(--white); color: var(--ink);
  outline: none; font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.text-input:focus { border-color: var(--purple); box-shadow: var(--ring); }
.textarea { resize: vertical; min-height: 70px; line-height: 1.55; }
.hint { font-size: 0.78rem; color: var(--muted-2); margin: 8px 0 0; }
.error-box { padding: 13px 15px; border-radius: 12px; background: var(--red-soft); color: var(--red); font-size: 0.85rem; font-weight: 500; border: 1px solid #f5c2bd; }
.confirm-text { font-size: 0.9rem; color: var(--ink); line-height: 1.6; margin: 0; }

/* Payment detail — webhook + audit */
.mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; font-size: 0.8rem; word-break: break-all; }
.webhook-box { background: var(--bg-2); border: 1px solid var(--line-2); border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
.webhook-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; font-size: 0.78rem; }
.webhook-pre {
  margin: 0; padding: 12px; border-radius: 10px; background: #0f0d24; color: #d6e2ff;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.74rem; line-height: 1.55; overflow-x: auto; white-space: pre;
  max-height: 260px;
}
.audit-trail-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 12px; background: var(--bg-2); border: 1px solid var(--line-2); border-radius: 10px; margin-bottom: 6px; }
.audit-trail-action { font-size: 0.82rem; font-weight: 700; color: var(--ink); }
.audit-trail-time { font-size: 0.72rem; color: var(--muted); }

/* ===== MOBILE BOTTOM NAV ===== */
.bottom-nav { display: none; }
@media (max-width: 599px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 90;
    height: 68px;
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: saturate(180%) blur(16px);
    -webkit-backdrop-filter: saturate(180%) blur(16px);
    border-top: 1px solid var(--line);
    box-shadow: 0 -10px 30px -22px rgba(44, 62, 80, 0.4);
    overflow-x: auto;
    scrollbar-width: none;
    justify-content: space-between;
  }
  .bottom-nav::-webkit-scrollbar { display: none; }
  .bn-item {
    flex: 1 0 auto; min-width: 52px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3px; padding: 6px 4px;
    background: transparent; border: none; cursor: pointer;
    font-family: inherit; color: var(--muted);
    transition: color 0.15s ease, transform 0.15s ease;
    position: relative;
  }
  .bn-item:active { transform: scale(0.94); }
  .bn-item.active { color: var(--purple); }
  .bn-icon-wrap {
    position: relative; display: grid; place-items: center;
    width: 34px; height: 28px; border-radius: 10px;
    transition: background 0.18s ease;
  }
  .bn-item.active .bn-icon-wrap { background: var(--purple-soft); }
  .bn-badge {
    position: absolute; top: -2px; right: -4px;
    min-width: 16px; height: 16px; padding: 0 4px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--pink), var(--pink-2));
    color: #fff; font-size: 0.56rem; font-weight: 800;
    border: 1.5px solid #fff;
    box-shadow: 0 4px 10px -4px rgba(232, 106, 138, 0.7);
  }
  .bn-label {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.1px; white-space: nowrap;
  }
}

.toast-wrap {
  position: fixed; bottom: 28px; right: 28px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
@media (max-width: 599px) {
  .toast-wrap { bottom: 100px; }
}
.toast {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 13px 20px; border-radius: 13px;
  font-size: 0.86rem; font-weight: 700; color: #fff;
  box-shadow: 0 24px 44px -18px rgba(15, 13, 36, 0.6);
  max-width: 360px;
}
.toast-success { background: linear-gradient(135deg, #1e8a4c, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1); }
.fade-slide-enter { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }
.menu-enter-active, .menu-leave-active { transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1); }
.menu-enter { opacity: 0; transform: translateY(-8px) scale(0.97); }
.menu-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.22s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease; }
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal { transform: translateY(24px) scale(0.96); opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.28s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(28px); }

/* ===== MOBILE: 2-column grid for stat + KPI cards ===== */
@media (max-width: 599px) {
  .main { padding: 22px 14px 56px; }
  .greeting h1 { font-size: 1.45rem; }

  /* Stat cards: 2 columns */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .stat-card {
    padding: 14px 12px;
    gap: 10px;
    align-items: flex-start;
  }
  .stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }
  .stat-label {
    font-size: 0.58rem;
    letter-spacing: 0.3px;
  }
  .stat-value {
    font-size: 1.25rem;
  }
  .stat-chevron { display: none; }

  /* KPI cards: 2 columns */
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .kpi-card { padding: 14px 12px; }
  .kpi-label { font-size: 0.58rem; }
  .kpi-value { font-size: 1.3rem; }
  .kpi-sub { font-size: 0.66rem; }

  /* Payment summary: 2 columns */
  .payment-summary { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .pm-card { padding: 14px 12px; }
  .pm-label { font-size: 0.58rem; }
  .pm-value { font-size: 1.2rem; }
  .pm-sub { font-size: 0.66rem; }

  /* Modals / misc */
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
  .list-row { flex-wrap: wrap; }
  .toast-wrap { left: 16px; right: 16px; align-items: stretch; }
  .toast { max-width: none; }
}
</style>