<template>
  <div class="pro-dashboard">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
      <nuxt-link to="/" class="brand">
        <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
        <span class="brand-name">No<span class="brand-dot">va</span></span>
      </nuxt-link>

      <div class="topbar-actions">
        <button class="icon-btn" @click="loadAll" :disabled="loading" aria-label="Refresh">
          <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
        </button>

        <div class="user-menu-wrap">
          <button class="user-avatar" @click.stop="menuOpen = !menuOpen">
            {{ initials }}
          </button>

          <transition name="menu">
            <div v-if="menuOpen" class="user-menu" @click.stop>
              <div class="user-menu-head">
                <div class="user-menu-name">{{ displayName }}</div>
                <div class="user-menu-email">{{ email }}</div>
                <span class="role-badge">Professional</span>
              </div>
              <button class="user-menu-item" @click="setTab('profile')">
                <v-icon small>mdi-account-outline</v-icon> Edit profile
              </button>
              <button class="user-menu-item" @click="setTab('services')">
                <v-icon small>mdi-tag-outline</v-icon> My services
              </button>
              <button class="user-menu-item" @click="setTab('availability')">
                <v-icon small>mdi-calendar-clock</v-icon> Availability
              </button>
              <button class="user-menu-item danger" @click="signOut">
                <v-icon small>mdi-logout</v-icon> Sign out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <!-- TABS -->
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon x-small :color="activeTab === t.value ? 'white' : '#7f8c8d'" class="mr-1">
          {{ t.icon }}
        </v-icon>
        <span>{{ t.label }}</span>
        <span v-if="t.value === 'bookings' && pendingCount" class="tab-badge">
          {{ pendingCount }}
        </span>
        <span
          v-else-if="t.value === 'requests' && requestCounts.assigned"
          class="tab-badge"
        >{{ requestCounts.assigned }}</span>
      </button>
    </nav>

    <main class="main">
      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-wrap">
        <div class="sk-hero"></div>
        <div class="sk-strip">
          <div v-for="n in 3" :key="n" class="sk-chip"></div>
        </div>
        <div class="sk-card"></div>
        <div class="sk-card"></div>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="38" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Something went wrong</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="loadAll">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon> Try again
        </button>
        <button class="link-btn mt-3" @click="signOut">Sign in again</button>
      </section>

      <transition v-else name="fade-slide" mode="out-in">
        <template>
          <!-- VERIFICATION BANNER -->
          <div
            v-if="verificationStatus !== 'verified' && activeTab !== 'profile'"
            :key="'banner-' + activeTab"
            class="verify-card"
            :class="verificationClass"
          >
            <div class="verify-icon">
              <v-icon size="22" :color="verificationIconColor">{{ verificationIcon }}</v-icon>
            </div>
            <div class="verify-body">
              <div class="verify-title">{{ verificationTitle }}</div>
              <div class="verify-text">{{ verificationText }}</div>
            </div>
            <button class="verify-btn" @click="setTab('profile')">
              {{ verificationAction }}
            </button>
          </div>

          <!-- ============================================================
               HOME
               ============================================================ -->
          <section v-if="activeTab === 'home'" key="home">
            <div class="hero">
              <div class="hero-body">
                <div class="hero-kicker">Professional dashboard</div>
                <h1 class="hero-title">Hello, {{ firstName }} 👋</h1>
                <p class="hero-sub">{{ heroSubtitle }}</p>
              </div>
              <div class="hero-glow"></div>
            </div>

            <div v-if="!pro" class="empty-card">
              <div class="empty-icon">
                <v-icon size="42" color="#4a3b8c">mdi-account-tie-outline</v-icon>
              </div>
              <h2>Set up your professional profile</h2>
              <p>
                Add your credentials, services, and availability so families
                can find and book you.
              </p>
              <button class="primary-btn mt-4" @click="setTab('profile')">
                <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                Complete setup
              </button>
            </div>

            <template v-else>
              <div class="stat-strip">
                <div class="stat-chip" @click="setTab('requests')">
                  <div class="stat-icon gradient-purple">
                    <v-icon small color="white">mdi-clipboard-text-outline</v-icon>
                  </div>
                  <div class="stat-body">
                    <div class="stat-value">{{ requestCounts.assigned }}</div>
                    <div class="stat-label">New requests</div>
                  </div>
                </div>

                <div class="stat-chip" @click="setTab('bookings')">
                  <div class="stat-icon gradient-teal">
                    <v-icon small color="white">mdi-calendar-check-outline</v-icon>
                  </div>
                  <div class="stat-body">
                    <div class="stat-value">{{ upcoming.length }}</div>
                    <div class="stat-label">Upcoming</div>
                  </div>
                </div>

                <div class="stat-chip" @click="setTab('bookings')">
                  <div class="stat-icon gradient-pink">
                    <v-icon small color="white">mdi-account-group-outline</v-icon>
                  </div>
                  <div class="stat-body">
                    <div class="stat-value">{{ uniqueClientCount }}</div>
                    <div class="stat-label">Clients</div>
                  </div>
                </div>
              </div>

              <!-- NEW REQUESTS PREVIEW -->
              <template v-if="requests.filter(r => r.status === 'assigned').length">
                <div class="section-head">
                  <h2>New assessment requests</h2>
                  <button class="link-btn" @click="setTab('requests')">View all</button>
                </div>
                <div class="list">
                  <div
                    v-for="r in requests.filter(r => r.status === 'assigned').slice(0, 3)"
                    :key="r.id"
                    class="list-row clickable"
                    @click="openRequest(r)"
                  >
                    <div class="child-avatar" :style="{ background: avatarBg(r.child_id) }">
                      {{ initialsOf(r.child_name) }}
                    </div>
                    <div class="row-body">
                      <div class="row-title">{{ r.child_name }}</div>
                      <div class="row-sub">{{ truncate(r.concerns, 70) }}</div>
                      <div class="row-meta">
                        <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                        {{ relativeTime(r.created_at) }}
                      </div>
                    </div>
                    <div class="row-tail">
                      <span class="status-pill status-amber">New</span>
                      <v-icon small color="#c8c0e0" class="chev">mdi-chevron-right</v-icon>
                    </div>
                  </div>
                </div>
                <div class="section-head mt-6">
                  <h2>Today's schedule</h2>
                  <span class="date-label">{{ todayLabel }}</span>
                </div>
              </template>

              <template v-else>
                <div class="section-head">
                  <h2>Today's schedule</h2>
                  <span class="date-label">{{ todayLabel }}</span>
                </div>
              </template>

              <div v-if="!todayBookings.length" class="empty-state">
                <div class="empty-illustration">
                  <v-icon size="28" color="#4a3b8c">mdi-calendar-blank-outline</v-icon>
                </div>
                <div class="empty-title">No sessions today</div>
                <div class="empty-sub">Enjoy the quiet — or add availability to attract bookings.</div>
              </div>

              <div v-else class="timeline">
                <div
                  v-for="b in todayBookings"
                  :key="b.id"
                  class="timeline-item clickable"
                  :class="statusClass(b.status)"
                  @click="openBooking(b)"
                >
                  <div class="timeline-time">
                    <div class="time-value">{{ shortTime(b.scheduled_at) }}</div>
                    <div class="time-ampm">{{ ampm(b.scheduled_at) }}</div>
                  </div>
                  <div class="timeline-body">
                    <div class="timeline-title">{{ b.child_name || 'Client' }}</div>
                    <div class="timeline-sub">
                      {{ b.service_name || 'Session' }} · {{ b.duration_minutes }} min
                    </div>
                    <div class="timeline-meta">
                      <span class="meta-item">
                        <v-icon x-small color="#7f8c8d" class="mr-1">
                          {{ b.location_type === 'online' ? 'mdi-video-outline' : 'mdi-map-marker-outline' }}
                        </v-icon>
                        {{ b.location_type === 'online' ? 'Online' : 'In person' }}
                      </span>
                    </div>
                  </div>
                  <span class="status-pill" :class="statusClass(b.status)">
                    {{ statusLabel(b.status) }}
                  </span>
                </div>
              </div>

              <div class="section-head mt-6">
                <h2>Upcoming sessions</h2>
                <button v-if="upcoming.length" class="link-btn" @click="setTab('bookings')">
                  View all
                </button>
              </div>

              <div v-if="!upcoming.length" class="empty-state">
                <div class="empty-illustration">
                  <v-icon size="28" color="#4a3b8c">mdi-calendar-blank-outline</v-icon>
                </div>
                <div class="empty-title">No upcoming sessions</div>
                <div class="empty-sub">Add availability so families can book you.</div>
                <button class="primary-btn small mt-3" @click="setTab('availability')">
                  Add availability
                </button>
              </div>

              <div v-else class="list">
                <div
                  v-for="b in upcoming.slice(0, 5)"
                  :key="b.id"
                  class="list-row clickable"
                  @click="openBooking(b)"
                >
                  <div class="date-block">
                    <div class="db-dow">{{ dowOf(b.scheduled_at) }}</div>
                    <div class="db-day">{{ dayOf(b.scheduled_at) }}</div>
                    <div class="db-mon">{{ monthOf(b.scheduled_at) }}</div>
                  </div>
                  <div class="row-body">
                    <div class="row-title">{{ b.child_name || 'Client' }}</div>
                    <div class="row-sub">{{ b.service_name || 'Session' }}</div>
                    <div class="row-meta">
                      <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                      {{ timeOf(b.scheduled_at) }}
                    </div>
                  </div>
                  <div class="row-tail">
                    <span class="status-pill" :class="statusClass(b.status)">
                      {{ statusLabel(b.status) }}
                    </span>
                    <v-icon small color="#c8c0e0" class="chev">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </div>

              <div class="section-head mt-6">
                <h2>Recent clients</h2>
              </div>

              <div v-if="!recentClients.length" class="empty-state">
                <div class="empty-illustration">
                  <v-icon size="28" color="#4a3b8c">mdi-account-group-outline</v-icon>
                </div>
                <div class="empty-title">No clients yet</div>
                <div class="empty-sub">Clients will appear here after your first session.</div>
              </div>

              <div v-else class="clients-grid">
                <div v-for="c in recentClients" :key="c.child_id" class="client-card">
                  <div class="client-avatar" :style="{ background: avatarBg(c.child_id) }">
                    {{ initialsOf(c.child_name) }}
                  </div>
                  <div class="client-body">
                    <div class="client-name">{{ c.child_name }}</div>
                    <div class="client-meta">
                      {{ c.sessionCount }} {{ c.sessionCount === 1 ? 'session' : 'sessions' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </section>

          <!-- ============================================================
               REQUESTS
               ============================================================ -->
          <section v-else-if="activeTab === 'requests'" key="requests">
            <div class="greeting">
              <h1>Assessment requests</h1>
              <p>Requests routed to you by our team.</p>
            </div>

            <div class="sub-tabs">
              <button
                v-for="f in requestFilters"
                :key="f.value"
                class="sub-tab"
                :class="{ active: requestFilter === f.value }"
                @click="requestFilter = f.value"
              >
                {{ f.label }}
                <span
                  v-if="f.value === 'assigned' && requestCounts.assigned"
                  class="tab-badge-inline"
                >{{ requestCounts.assigned }}</span>
                <span
                  v-else-if="f.value === 'in_progress' && requestCounts.in_progress"
                  class="tab-badge-inline"
                >{{ requestCounts.in_progress }}</span>
              </button>
            </div>

            <div v-if="!filteredRequests.length" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="28" color="#4a3b8c">mdi-clipboard-text-outline</v-icon>
              </div>
              <div class="empty-title">
                No {{ requestFilter === 'all' ? '' : requestFilter.replace('_', ' ') }} requests
              </div>
              <div class="empty-sub">
                When our admin routes a family to you, the request will appear here.
              </div>
            </div>

            <div v-else class="list">
              <div
                v-for="r in filteredRequests"
                :key="r.id"
                class="request-card clickable"
                @click="openRequest(r)"
              >
                <div class="request-top">
                  <div class="request-avatar" :style="{ background: avatarBg(r.child_id) }">
                    {{ initialsOf(r.child_name) }}
                  </div>
                  <div class="request-body">
                    <div class="row-title">{{ r.child_name }}</div>
                    <div class="row-sub">
                      {{ ageOf(r.child_dob) }}<span v-if="r.child_county"> · {{ r.child_county }}</span>
                    </div>
                  </div>
                  <span class="status-pill" :class="statusClass(r.status)">
                    {{ requestStatusLabel(r.status) }}
                  </span>
                </div>

                <div v-if="r.concerns" class="request-concern">
                  "{{ truncate(r.concerns, 120) }}"
                </div>

                <!-- Parent preference warning -->
                <div v-if="isPreferredDifferent(r)" class="request-pref-warning">
                  <v-icon x-small color="#b7791f" class="mr-1">mdi-information-outline</v-icon>
                  Parent chose <strong>{{ r.preferred_professional_name }}</strong>
                </div>

                <div class="request-meta">
                  <span v-if="r.parent_name" class="meta-item">
                    <v-icon x-small color="#7f8c8d" class="mr-1">mdi-account-outline</v-icon>
                    {{ r.parent_name }}
                  </span>
                  <span class="meta-item">
                    <v-icon x-small color="#7f8c8d" class="mr-1">mdi-clock-outline</v-icon>
                    {{ relativeTime(r.created_at) }}
                  </span>
                  <span v-if="r.report_id" class="meta-item meta-done">
                    <v-icon x-small color="#229954" class="mr-1">mdi-check-circle</v-icon>
                    Report ready
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- ============================================================
               BOOKINGS
               ============================================================ -->
          <section v-else-if="activeTab === 'bookings'" key="bookings">
            <div class="greeting">
              <h1>Bookings</h1>
              <p>All sessions you've been booked for.</p>
            </div>

            <div class="sub-tabs">
              <button
                v-for="f in bookingFilters"
                :key="f.value"
                class="sub-tab"
                :class="{ active: bookingFilter === f.value }"
                @click="bookingFilter = f.value"
              >
                {{ f.label }}
                <span v-if="f.value === 'pending' && pendingCount" class="tab-badge-inline">
                  {{ pendingCount }}
                </span>
              </button>
            </div>

            <div v-if="!filteredBookings.length" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="28" color="#4a3b8c">mdi-calendar-blank-outline</v-icon>
              </div>
              <div class="empty-title">
                No {{ bookingFilter === 'all' ? '' : bookingFilter }} bookings
              </div>
              <div class="empty-sub">New bookings will appear here.</div>
            </div>

            <div v-else class="list">
              <div
                v-for="b in filteredBookings"
                :key="b.id"
                class="list-row clickable"
                @click="openBooking(b)"
              >
                <div class="date-block">
                  <div class="db-dow">{{ dowOf(b.scheduled_at) }}</div>
                  <div class="db-day">{{ dayOf(b.scheduled_at) }}</div>
                  <div class="db-mon">{{ monthOf(b.scheduled_at) }}</div>
                </div>
                <div class="row-body">
                  <div class="row-title">{{ b.child_name || 'Client' }}</div>
                  <div class="row-sub">{{ b.service_name || 'Session' }}</div>
                  <div class="row-meta">
                    <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                    {{ timeOf(b.scheduled_at) }}
                  </div>
                </div>
                <div class="row-tail">
                  <span class="status-pill" :class="statusClass(b.status)">
                    {{ statusLabel(b.status) }}
                  </span>
                  <v-icon small color="#c8c0e0" class="chev">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>
          </section>

          <!-- ============================================================
               SERVICES
               ============================================================ -->
          <section v-else-if="activeTab === 'services'" key="services">
            <div class="greeting-row">
              <div>
                <h1>Services</h1>
                <p>What you offer and what you charge.</p>
              </div>
              <button class="primary-btn" @click="openServiceModal()">
                <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                Add
              </button>
            </div>

            <div v-if="!services.length" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="28" color="#4a3b8c">mdi-tag-outline</v-icon>
              </div>
              <div class="empty-title">No services yet</div>
              <div class="empty-sub">
                Add the services you offer — session types, prices, and durations.
              </div>
              <button class="primary-btn small mt-3" @click="openServiceModal()">
                Add first service
              </button>
            </div>

            <template v-else>
              <div class="summary-card">
                <div class="summary-stat">
                  <div class="summary-value">{{ services.length }}</div>
                  <div class="summary-label">{{ services.length === 1 ? 'Service' : 'Services' }}</div>
                </div>
                <div class="summary-divider" />
                <div class="summary-stat">
                  <div class="summary-value">{{ avgPrice ? `KSh ${avgPrice}` : '—' }}</div>
                  <div class="summary-label">Avg price</div>
                </div>
                <div class="summary-divider" />
                <div class="summary-stat">
                  <div class="summary-value">{{ avgDuration ? `${avgDuration}m` : '—' }}</div>
                  <div class="summary-label">Avg duration</div>
                </div>
              </div>

              <div class="services-list">
                <div v-for="s in services" :key="s.id" class="service-card">
                  <div class="service-head">
                    <div class="service-icon" :style="{ background: iconBg(s.type) }">
                      <v-icon small :color="iconColor(s.type)">{{ iconFor(s.type) }}</v-icon>
                    </div>
                    <div class="service-body">
                      <div class="service-name">{{ s.type }}</div>
                      <div class="service-chips">
                        <span class="chip-meta">KSh {{ formatPrice(s.price) }}</span>
                        <span class="chip-meta">{{ s.duration_minutes }} min</span>
                        <span class="chip-meta" :class="s.active ? 'chip-active' : 'chip-inactive'">
                          {{ s.active ? 'Active' : 'Hidden' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="s.description" class="service-desc">{{ s.description }}</div>
                  <div class="service-actions">
                    <button class="action-btn" @click="openServiceModal(s)">
                      <v-icon x-small color="#4a3b8c" class="mr-1">mdi-pencil</v-icon>Edit
                    </button>
                    <button class="action-btn" :disabled="toggling === s.id" @click="toggleService(s)">
                      <v-icon x-small color="#b7791f" class="mr-1">
                        {{ s.active ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                      </v-icon>
                      {{ s.active ? 'Hide' : 'Show' }}
                    </button>
                    <button class="action-btn danger" @click="confirmDeleteService(s)">
                      <v-icon x-small color="#e74c3c" class="mr-1">mdi-delete-outline</v-icon>Delete
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </section>

          <!-- ============================================================
               AVAILABILITY
               ============================================================ -->
          <section v-else-if="activeTab === 'availability'" key="availability">
            <div class="greeting-row">
              <div>
                <h1>Availability</h1>
                <p>When families can book you.</p>
              </div>
              <button class="primary-btn" @click="openAvailModal()">
                <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                Add slot
              </button>
            </div>

            <div v-if="!availability.length" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="28" color="#4a3b8c">mdi-calendar-clock</v-icon>
              </div>
              <div class="empty-title">No availability set</div>
              <div class="empty-sub">Add weekly slots so parents can see when you're free.</div>
              <button class="primary-btn small mt-3" @click="openAvailModal()">
                Add first slot
              </button>
            </div>

            <template v-else>
              <div class="week-grid">
                <div v-for="day in weekDays" :key="day.value" class="week-col">
                  <div class="week-day">{{ day.short }}</div>
                  <div class="week-slots">
                    <div
                      v-for="slot in slotsForDay(day.value)"
                      :key="slot.id"
                      class="week-slot"
                      :class="locClass(slot.location_type)"
                    >
                      <div class="slot-time">{{ shortTimeStr(slot.start_time) }}</div>
                      <div class="slot-arrow">→</div>
                      <div class="slot-time">{{ shortTimeStr(slot.end_time) }}</div>
                      <button
                        class="slot-remove"
                        @click.stop="confirmDeleteAvail(slot)"
                        aria-label="Remove slot"
                      >
                        <v-icon x-small color="#e74c3c">mdi-close</v-icon>
                      </button>
                    </div>
                    <div v-if="!slotsForDay(day.value).length" class="week-empty">—</div>
                  </div>
                </div>
              </div>

              <div class="tip-box">
                <v-icon small color="#4a3b8c" class="mr-2">mdi-lightbulb-outline</v-icon>
                <span>
                  Availability sets your typical week. Parents still request specific times,
                  which you can confirm or decline.
                </span>
              </div>
            </template>
          </section>

          <!-- ============================================================
               PROFILE
               ============================================================ -->
          <section v-else-if="activeTab === 'profile'" key="profile">
            <div class="greeting">
              <h1>Your profile</h1>
              <p>This is what families see when they find you.</p>
            </div>

            <div class="verify-mini-card" :class="verificationClass">
              <div class="vm-icon">
                <v-icon small :color="verificationIconColor">{{ verificationIcon }}</v-icon>
              </div>
              <div>
                <div class="verify-mini-title">{{ verificationTitle }}</div>
                <div class="verify-mini-text">{{ verificationText }}</div>
              </div>
            </div>

            <div class="card">
              <h2 class="card-title">Professional details</h2>

              <label class="field-label">Professional type</label>
              <select v-model="form.type" class="text-input" :disabled="saving">
                <option value="">Select one</option>
                <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>

              <label class="field-label mt-4">Years of experience</label>
              <input
                v-model.number="form.years_experience"
                type="number"
                min="0"
                max="60"
                class="text-input"
                :disabled="saving"
              />

              <label class="field-label mt-4">Languages</label>
              <div class="chip-row">
                <button
                  v-for="l in allLanguages"
                  :key="l"
                  type="button"
                  class="chip"
                  :class="{ active: form.languages.includes(l) }"
                  :disabled="saving"
                  @click="toggleLanguage(l)"
                >
                  <v-icon v-if="form.languages.includes(l)" x-small color="white" class="mr-1">mdi-check</v-icon>
                  {{ l }}
                </button>
              </div>

              <label class="field-label mt-4">
                Bio
                <span class="field-hint">{{ form.bio.length }}/1000</span>
              </label>
              <textarea
                v-model.trim="form.bio"
                rows="5"
                maxlength="1000"
                class="text-input textarea"
                :disabled="saving"
                placeholder="Tell families about your approach and background."
              ></textarea>

              <label class="field-label mt-4">County</label>
              <select v-model="form.county" class="text-input" :disabled="saving">
                <option value="">Select a county</option>
                <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
              </select>

              <label class="field-label mt-4">Area (optional)</label>
              <input v-model.trim="form.area" type="text" class="text-input" :disabled="saving" />

              <label class="field-label mt-4">Session type</label>
              <div class="chip-row">
                <button
                  type="button"
                  class="chip"
                  :class="{ active: form.online === true }"
                  :disabled="saving"
                  @click="form.online = true"
                >
                  <v-icon x-small class="mr-1">mdi-video-outline</v-icon>
                  In person & online
                </button>
                <button
                  type="button"
                  class="chip"
                  :class="{ active: form.online === false }"
                  :disabled="saving"
                  @click="form.online = false"
                >
                  <v-icon x-small class="mr-1">mdi-map-marker-outline</v-icon>
                  In person only
                </button>
              </div>

              <label class="field-label mt-4">Typical session price (KSh)</label>
              <div class="budget-row">
                <input v-model.number="form.price_min" type="number" min="0" step="100" placeholder="Min" class="text-input" :disabled="saving" />
                <span class="budget-sep">–</span>
                <input v-model.number="form.price_max" type="number" min="0" step="100" placeholder="Max" class="text-input" :disabled="saving" />
              </div>

              <div v-if="saveError" class="error-box mt-4">{{ saveError }}</div>

              <button class="primary-btn mt-4" :disabled="!canSaveProfile || saving" @click="saveProfile">
                <span v-if="!saving">
                  Save profile
                  <v-icon small color="white" class="ml-2">mdi-check</v-icon>
                </span>
                <span v-else class="loading-row">
                  <v-progress-circular indeterminate size="16" width="2" color="white" />
                  <span class="ml-2">Saving…</span>
                </span>
              </button>
            </div>

            <div class="card">
              <h2 class="card-title">Account identity</h2>

              <div class="identity-row">
                <div class="identity-icon">
                  <v-icon small color="#4a3b8c">mdi-fingerprint</v-icon>
                </div>
                <div class="identity-body">
                  <div class="identity-label">Firebase UID</div>
                  <div class="identity-value">{{ pro?.firebase_uid || '—' }}</div>
                </div>
                <button
                  class="copy-btn"
                  @click="copyUid"
                  :disabled="!pro?.firebase_uid"
                  aria-label="Copy UID"
                >
                  <v-icon x-small color="#4a3b8c">
                    {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
                  </v-icon>
                </button>
              </div>

              <div class="identity-row mt-3">
                <div class="identity-icon">
                  <v-icon small color="#4a3b8c">mdi-identifier</v-icon>
                </div>
                <div class="identity-body">
                  <div class="identity-label">Professional ID</div>
                  <div class="identity-value">{{ pro?.id || '—' }}</div>
                </div>
              </div>
            </div>
          </section>
        </template>
      </transition>
    </main>

    <!-- BOTTOM NAV -->
    <nav class="bottom-nav">
      <button
        v-for="t in bottomTabs"
        :key="'bn-' + t.value"
        class="bn-item"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon small :color="activeTab === t.value ? '#4a3b8c' : '#95a5a6'">{{ t.icon }}</v-icon>
        <span>{{ t.label }}</span>
      </button>
    </nav>

    <!-- REQUEST DETAIL MODAL -->
    <transition name="modal">
      <div v-if="selectedRequest" class="modal-backdrop" @click.self="closeRequest">
        <div class="modal modal-lg">
          <div class="modal-head">
            <div class="modal-title">
              {{ selectedRequest.child_name }}
              <span class="modal-sub">{{ ageOf(selectedRequest.child_dob) }}</span>
            </div>
            <button class="modal-close" @click="closeRequest">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="request-status-row">
              <span class="status-pill" :class="statusClass(selectedRequest.status)">
                {{ requestStatusLabel(selectedRequest.status) }}
              </span>
              <span class="request-id">#{{ selectedRequest.id }}</span>
            </div>

            <!-- PARENT PREFERENCE NOTE -->
            <div
              v-if="selectedRequest.preferred_professional_name
                     && selectedRequest.preferred_professional_id !== selectedRequest.assigned_professional_id"
              class="req-section req-section-note"
            >
              <div class="req-label">Parent's preference</div>
              <div class="req-value">
                {{ selectedRequest.preferred_professional_name }}
                <div class="req-sub">
                  The parent originally chose this professional. Our team assigned you instead.
                </div>
              </div>
            </div>

            <div v-if="selectedRequest.parent_name" class="req-section">
              <div class="req-label">Parent / guardian</div>
              <div class="req-value">
                {{ selectedRequest.parent_name }}
                <div class="req-sub">
                  <span v-if="selectedRequest.parent_phone">{{ selectedRequest.parent_phone }}</span>
                  <span v-if="selectedRequest.parent_email">
                    <span v-if="selectedRequest.parent_phone"> · </span>
                    {{ selectedRequest.parent_email }}
                  </span>
                </div>
              </div>
            </div>

            <div class="req-section">
              <div class="req-label">Child</div>
              <div class="req-value">
                {{ selectedRequest.child_name }}
                <div class="req-sub">
                  <span v-if="selectedRequest.child_gender">{{ selectedRequest.child_gender }}</span>
                  <span v-if="selectedRequest.child_county">
                    <span v-if="selectedRequest.child_gender"> · </span>
                    {{ selectedRequest.child_county }}
                  </span>
                  <span v-if="selectedRequest.child_school">
                    <span v-if="selectedRequest.child_gender || selectedRequest.child_county"> · </span>
                    {{ selectedRequest.child_school }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="selectedRequest.concerns" class="req-section">
              <div class="req-label">Parent's concern</div>
              <div class="req-quote">"{{ selectedRequest.concerns }}"</div>
            </div>

            <div v-if="questionnaireEntries.length" class="req-section">
              <div class="req-label">Areas of concern</div>
              <div class="q-list">
                <div
                  v-for="q in questionnaireEntries"
                  :key="q.key"
                  class="q-row"
                  :class="`q-${q.value}`"
                >
                  <span class="q-label">{{ q.label }}</span>
                  <span class="q-value">{{ q.valueLabel }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="selectedRequest.preferred_language || selectedRequest.preferred_time || selectedRequest.preferred_county || selectedRequest.budget_min || selectedRequest.budget_max"
              class="req-section"
            >
              <div class="req-label">Preferences</div>
              <div class="req-pills">
                <span v-if="selectedRequest.preferred_county" class="req-pill">
                  <v-icon x-small class="mr-1">mdi-map-marker-outline</v-icon>
                  {{ selectedRequest.preferred_county }}
                </span>
                <span v-if="selectedRequest.preferred_language" class="req-pill">
                  <v-icon x-small class="mr-1">mdi-translate</v-icon>
                  {{ selectedRequest.preferred_language }}
                </span>
                <span v-if="selectedRequest.preferred_time" class="req-pill">
                  <v-icon x-small class="mr-1">mdi-clock-outline</v-icon>
                  {{ preferredTimeLabel(selectedRequest.preferred_time) }}
                </span>
                <span v-if="budgetRange(selectedRequest)" class="req-pill">
                  <v-icon x-small class="mr-1">mdi-cash</v-icon>
                  {{ budgetRange(selectedRequest) }}
                </span>
              </div>
            </div>

            <!-- START ASSESSMENT -->
            <div
              v-if="selectedRequest.status === 'assigned' && !selectedRequest.assessment"
              class="req-section req-section-action"
            >
              <div class="req-label">Schedule the assessment</div>
              <div class="schedule-row">
                <input
                  v-model="scheduleForm.scheduled_at"
                  type="datetime-local"
                  class="text-input"
                  :disabled="acting"
                />
                <input
                  v-model.trim="scheduleForm.type"
                  type="text"
                  placeholder="Type (e.g. Speech assessment)"
                  class="text-input"
                  :disabled="acting"
                />
              </div>
            </div>

            <!-- ACTIVE ASSESSMENT -->
            <div
              v-if="selectedRequest.assessment && selectedRequest.status === 'in_progress'"
              class="req-section"
            >
              <div class="req-label">Assessment</div>
              <div class="req-value">
                In progress
                <div class="req-sub">
                  <span v-if="selectedRequest.assessment.type">{{ selectedRequest.assessment.type }}</span>
                  <span v-if="selectedRequest.assessment.scheduled_at">
                    <span v-if="selectedRequest.assessment.type"> · </span>
                    {{ fullDate(selectedRequest.assessment.scheduled_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- REPORT PREVIEW -->
            <div v-if="selectedRequest.report_id" class="req-section req-section-done">
              <div class="req-label">Report</div>
              <div class="req-value">
                <v-icon x-small color="#229954" class="mr-1">mdi-check-circle</v-icon>
                Submitted
                <div class="req-sub">The parent can now view the report.</div>
              </div>
            </div>

            <!-- REPORT FORM -->
            <div
              v-if="selectedRequest.assessment && !selectedRequest.report_id && selectedRequest.status === 'in_progress' && reportOpen"
              class="req-section req-section-form"
            >
              <div class="req-label">Write the assessment report</div>

              <label class="field-label">Findings *</label>
              <textarea
                v-model.trim="reportForm.findings"
                rows="5"
                class="text-input textarea"
                placeholder="Observations, assessment results, notable behaviours…"
                :disabled="acting"
              ></textarea>

              <label class="field-label mt-4">Strengths</label>
              <textarea
                v-model.trim="reportForm.strengths"
                rows="3"
                class="text-input textarea"
                placeholder="What the child does well"
                :disabled="acting"
              ></textarea>

              <label class="field-label mt-4">Needs</label>
              <textarea
                v-model.trim="reportForm.needs"
                rows="3"
                class="text-input textarea"
                placeholder="Areas requiring support"
                :disabled="acting"
              ></textarea>

              <label class="field-label mt-4">Recommendations</label>
              <textarea
                v-model.trim="reportForm.recommendations"
                rows="3"
                class="text-input textarea"
                placeholder="Suggested therapy, frequency, further referrals…"
                :disabled="acting"
              ></textarea>

              <label class="field-label mt-4">Follow-up date (optional)</label>
              <input
                v-model="reportForm.follow_up_date"
                type="date"
                class="text-input"
                :disabled="acting"
              />

              <div v-if="reportError" class="error-box mt-4">{{ reportError }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              v-if="selectedRequest.status === 'assigned' && !selectedRequest.assessment"
              class="btn-primary"
              :disabled="acting"
              @click="startAssessment"
            >
              <v-icon small color="white" class="mr-1">mdi-play-circle-outline</v-icon>
              {{ acting ? 'Starting…' : 'Start assessment' }}
            </button>

            <template v-if="selectedRequest.status === 'in_progress' && !selectedRequest.report_id">
              <button
                v-if="!reportOpen"
                class="btn-primary"
                :disabled="acting"
                @click="reportOpen = true"
              >
                <v-icon small color="white" class="mr-1">mdi-file-document-plus-outline</v-icon>
                Write report
              </button>
              <template v-else>
                <button class="btn-secondary" :disabled="acting" @click="reportOpen = false">
                  Cancel
                </button>
                <button
                  class="btn-primary"
                  :disabled="acting || !canSubmitReport"
                  @click="submitReport"
                >
                  <span v-if="!acting">Submit report</span>
                  <span v-else class="loading-row">
                    <v-progress-circular indeterminate size="14" width="2" color="white" />
                    <span class="ml-2">Submitting…</span>
                  </span>
                </button>
              </template>
            </template>

            <button
              v-if="selectedRequest.report_id"
              class="btn-secondary"
              @click="viewReport(selectedRequest.report_id)"
            >
              <v-icon x-small class="mr-1">mdi-open-in-new</v-icon>
              View report
            </button>

            <button class="btn-secondary" @click="closeRequest">Close</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- BOOKING MODAL -->
    <transition name="modal">
      <div v-if="selected" class="modal-backdrop" @click.self="selected = null">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">{{ selected.child_name || 'Session' }}</div>
            <button class="modal-close" @click="selected = null">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-row">
              <div class="modal-label">Status</div>
              <span class="status-pill" :class="statusClass(selected.status)">
                {{ statusLabel(selected.status) }}
              </span>
            </div>
            <div class="modal-row">
              <div class="modal-label">When</div>
              <div class="modal-value">{{ fullDate(selected.scheduled_at) }}</div>
            </div>
            <div class="modal-row">
              <div class="modal-label">Time</div>
              <div class="modal-value">{{ timeRange(selected.scheduled_at, selected.duration_minutes) }}</div>
            </div>
            <div class="modal-row" v-if="selected.service_name">
              <div class="modal-label">Service</div>
              <div class="modal-value">{{ selected.service_name }}</div>
            </div>
            <div class="modal-row" v-if="selected.parent_name">
              <div class="modal-label">Parent</div>
              <div class="modal-value">
                {{ selected.parent_name }}
                <span v-if="selected.parent_phone"> · {{ selected.parent_phone }}</span>
              </div>
            </div>
            <div class="modal-row" v-if="selected.notes">
              <div class="modal-label">Notes</div>
              <div class="modal-value">{{ selected.notes }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              v-if="selected.status === 'pending'"
              class="btn-primary"
              :disabled="acting"
              @click="setStatus(selected, 'confirmed')"
            >
              <v-icon small color="white" class="mr-1">mdi-check</v-icon>
              Confirm
            </button>
            <button
              v-if="selected.status === 'confirmed'"
              class="btn-primary"
              :disabled="acting"
              @click="setStatus(selected, 'completed')"
            >
              <v-icon small color="white" class="mr-1">mdi-check-all</v-icon>
              Mark complete
            </button>
            <button
              v-if="selected.status === 'confirmed'"
              class="btn-danger"
              :disabled="acting"
              @click="setStatus(selected, 'no_show')"
            >
              <v-icon small color="white" class="mr-1">mdi-account-off-outline</v-icon>
              No-show
            </button>
            <button class="btn-secondary" @click="openBookingDetail(selected)">
              <v-icon x-small class="mr-1">mdi-open-in-new</v-icon>
              Full page
            </button>
            <button class="btn-secondary" @click="selected = null">Close</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- SERVICE MODAL -->
    <transition name="modal">
      <div v-if="serviceModal.open" class="modal-backdrop" @click.self="closeServiceModal">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">{{ serviceModal.editing ? 'Edit service' : 'Add a service' }}</div>
            <button class="modal-close" @click="closeServiceModal">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <label class="field-label">Service name</label>
            <select v-model="serviceModal.type" class="text-input" :disabled="serviceModal.saving">
              <option value="">Select a service</option>
              <option v-for="s in serviceTypes" :key="s" :value="s">{{ s }}</option>
            </select>

            <div v-if="serviceModal.type === 'Other'" class="mt-4">
              <label class="field-label">Custom service name</label>
              <input
                v-model.trim="serviceModal.customType"
                type="text"
                placeholder="e.g. Feeding therapy"
                class="text-input"
                :disabled="serviceModal.saving"
              />
            </div>

            <label class="field-label mt-4">Description (optional)</label>
            <textarea
              v-model.trim="serviceModal.description"
              rows="3"
              class="text-input textarea"
              :disabled="serviceModal.saving"
            ></textarea>

            <div class="field-row mt-4">
              <div class="field-col">
                <label class="field-label">Price (KSh)</label>
                <input v-model.number="serviceModal.price" type="number" min="0" step="100" class="text-input" :disabled="serviceModal.saving" />
              </div>
              <div class="field-col">
                <label class="field-label">Duration (min)</label>
                <input v-model.number="serviceModal.duration_minutes" type="number" min="15" step="15" class="text-input" :disabled="serviceModal.saving" />
              </div>
            </div>

            <div class="preset-row mt-4">
              <button
                v-for="p in presets"
                :key="p.label"
                type="button"
                class="preset-chip"
                :disabled="serviceModal.saving"
                @click="applyPreset(p)"
              >{{ p.label }}</button>
            </div>

            <div v-if="serviceModal.error" class="error-box mt-4">{{ serviceModal.error }}</div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" :disabled="serviceModal.saving" @click="closeServiceModal">Cancel</button>
            <button class="btn-primary" :disabled="!canSaveService || serviceModal.saving" @click="saveService">
              {{ serviceModal.saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- AVAILABILITY MODAL -->
    <transition name="modal">
      <div v-if="availModal.open" class="modal-backdrop" @click.self="closeAvailModal">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">Add time slot</div>
            <button class="modal-close" @click="closeAvailModal">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <label class="field-label">Day</label>
            <select v-model.number="availModal.day_of_week" class="text-input">
              <option v-for="d in days" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>

            <div class="field-row mt-4">
              <div class="field-col">
                <label class="field-label">Start</label>
                <input v-model="availModal.start_time" type="time" class="text-input" />
              </div>
              <div class="field-col">
                <label class="field-label">End</label>
                <input v-model="availModal.end_time" type="time" class="text-input" />
              </div>
            </div>

            <label class="field-label mt-4">Location</label>
            <select v-model="availModal.location_type" class="text-input">
              <option value="in_person">In person</option>
              <option value="online">Online</option>
              <option value="both">Both</option>
            </select>

            <div v-if="availModal.error" class="error-box mt-4">{{ availModal.error }}</div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeAvailModal">Cancel</button>
            <button class="btn-primary" :disabled="availModal.saving" @click="saveAvail">
              {{ availModal.saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- DELETE SERVICE CONFIRM -->
    <transition name="modal">
      <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
        <div class="modal modal-sm">
          <div class="confirm-icon danger">
            <v-icon size="34" color="#e74c3c">mdi-delete-outline</v-icon>
          </div>
          <h3 class="confirm-title">Delete service?</h3>
          <p class="confirm-text">
            <strong>{{ deleteTarget.type }}</strong> will be removed from your profile.
            Existing bookings aren't affected.
          </p>
          <div class="modal-footer">
            <button class="btn-secondary" @click="deleteTarget = null">Cancel</button>
            <button class="btn-danger" :disabled="deleting" @click="deleteService">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- DELETE AVAILABILITY CONFIRM -->
    <transition name="modal">
      <div v-if="deleteAvailTarget" class="modal-backdrop" @click.self="deleteAvailTarget = null">
        <div class="modal modal-sm">
          <div class="confirm-icon danger">
            <v-icon size="34" color="#e74c3c">mdi-calendar-remove-outline</v-icon>
          </div>
          <h3 class="confirm-title">Remove slot?</h3>
          <p class="confirm-text">
            {{ dayName(deleteAvailTarget.day_of_week) }} ·
            {{ shortTimeStr(deleteAvailTarget.start_time) }} – {{ shortTimeStr(deleteAvailTarget.end_time) }}
          </p>
          <div class="modal-footer">
            <button class="btn-secondary" @click="deleteAvailTarget = null">Cancel</button>
            <button class="btn-danger" :disabled="deleting" @click="deleteAvail">
              {{ deleting ? 'Removing…' : 'Remove' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- TOASTS -->
    <div class="toast-wrap">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
        >
          <v-icon small color="white" class="mr-2">{{ t.icon }}</v-icon>
          <span class="toast-text">{{ t.message }}</span>
          <span class="toast-bar" />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'ProfessionalDashboard',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      menuOpen: false,
      loadError: '',
      copied: false,
      scrolled: false,
      loadedTabs: {},

      activeTab: 'home',
      tabs: [
        { value: 'home',         label: 'Home',         icon: 'mdi-home-variant-outline' },
        { value: 'requests',     label: 'Requests',     icon: 'mdi-clipboard-text-outline' },
        { value: 'bookings',     label: 'Bookings',     icon: 'mdi-calendar-month-outline' },
        { value: 'services',     label: 'Services',     icon: 'mdi-tag-outline' },
        { value: 'availability', label: 'Availability', icon: 'mdi-calendar-clock' },
        { value: 'profile',      label: 'Profile',      icon: 'mdi-account-outline' }
      ],
      bottomTabs: [
        { value: 'home',     label: 'Home',     icon: 'mdi-home-variant-outline' },
        { value: 'requests', label: 'Requests', icon: 'mdi-clipboard-text-outline' },
        { value: 'bookings', label: 'Bookings', icon: 'mdi-calendar-month-outline' },
        { value: 'profile',  label: 'Profile',  icon: 'mdi-account-outline' }
      ],

      bookingFilter: 'upcoming',
      bookingFilters: [
        { value: 'upcoming',  label: 'Upcoming' },
        { value: 'pending',   label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'all',       label: 'All' }
      ],

      requestFilter: 'assigned',
      requestFilters: [
        { value: 'assigned',    label: 'Assigned' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'completed',   label: 'Completed' },
        { value: 'all',         label: 'All' }
      ],

      user: null,
      pro: null,
      bookings: [],
      services: [],
      availability: [],
      requests: [],
      requestCounts: { assigned: 0, in_progress: 0, completed: 0 },

      form: {
        type: '', bio: '', languages: [], county: '', area: '',
        online: true, years_experience: null, price_min: null, price_max: null
      },

      saveError: '',
      saving: false,

      selected: null,
      selectedRequest: null,
      acting: false,

      scheduleForm: { scheduled_at: '', type: '' },
      reportOpen: false,
      reportForm: {
        findings: '', strengths: '', needs: '', recommendations: '', follow_up_date: ''
      },
      reportError: '',

      toggling: null,
      deleting: null,
      deleteTarget: null,
      deleteAvailTarget: null,

      serviceModal: {
        open: false,
        editing: null,
        saving: false,
        error: '',
        type: '',
        customType: '',
        description: '',
        price: null,
        duration_minutes: 60
      },

      availModal: {
        open: false, saving: false, error: '',
        day_of_week: 1, start_time: '09:00', end_time: '17:00', location_type: 'in_person'
      },

      toasts: [],

      presets: [
        { label: '30 min · KSh 1,500', price: 1500, duration_minutes: 30 },
        { label: '45 min · KSh 2,000', price: 2000, duration_minutes: 45 },
        { label: '60 min · KSh 2,500', price: 2500, duration_minutes: 60 },
        { label: '90 min · KSh 3,500', price: 3500, duration_minutes: 90 }
      ],

      serviceTypes: [
        'Speech therapy session',
        'Speech & language assessment',
        'Occupational therapy session',
        'Occupational therapy assessment',
        'Physiotherapy session',
        'Physiotherapy assessment',
        'Psychology session',
        'Psychological assessment',
        'Special-needs education session',
        'Learning support session',
        'Parent coaching session',
        'Group therapy session',
        'Home visit',
        'School consultation',
        'Other'
      ],

      types: [
        { value: 'speech_therapist', label: 'Speech & language therapist' },
        { value: 'occupational_therapist', label: 'Occupational therapist' },
        { value: 'physiotherapist', label: 'Physiotherapist' },
        { value: 'psychologist', label: 'Psychologist' },
        { value: 'special_needs_teacher', label: 'Special-needs teacher' },
        { value: 'learning_support', label: 'Learning support' },
        { value: 'parent_coach', label: 'Parent coach' },
        { value: 'other', label: 'Other' }
      ],

      allLanguages: ['English', 'Kiswahili'],
      counties: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi',
        'Meru', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira',
        'Kitui', 'Garissa', 'Turkana', 'Other'
      ],
      days: [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
      ],
      weekDays: [
        { value: 1, short: 'Mon' },
        { value: 2, short: 'Tue' },
        { value: 3, short: 'Wed' },
        { value: 4, short: 'Thu' },
        { value: 5, short: 'Fri' },
        { value: 6, short: 'Sat' },
        { value: 0, short: 'Sun' }
      ]
    };
  },

  computed: {
    displayName() { return this.user?.display_name || this.user?.email || 'User'; },
    firstName() {
      const n = this.user?.display_name || '';
      return n.split(' ')[0] || 'there';
    },
    email() { return this.user?.email || ''; },
    initials() {
      const n = this.displayName.trim();
      if (!n) return 'U';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },

    verificationStatus() { return this.pro?.verification_status || 'none'; },
    verificationClass() {
      if (this.verificationStatus === 'pending') return 'verify-amber';
      if (this.verificationStatus === 'rejected' || this.verificationStatus === 'suspended') {
        return 'verify-red';
      }
      return 'verify-purple';
    },
    verificationIcon() {
      if (this.verificationStatus === 'pending') return 'mdi-clock-outline';
      if (this.verificationStatus === 'rejected') return 'mdi-close-circle-outline';
      if (this.verificationStatus === 'suspended') return 'mdi-pause-circle-outline';
      return 'mdi-account-check-outline';
    },
    verificationIconColor() {
      if (this.verificationStatus === 'pending') return '#b7791f';
      if (this.verificationStatus === 'rejected' || this.verificationStatus === 'suspended') return '#c0392b';
      return '#4a3b8c';
    },
    verificationTitle() {
      if (this.verificationStatus === 'none') return 'Complete your profile';
      if (this.verificationStatus === 'pending') return 'Verification in review';
      if (this.verificationStatus === 'rejected') return 'Verification rejected';
      if (this.verificationStatus === 'suspended') return 'Account suspended';
      if (this.verificationStatus === 'verified') return 'Verified';
      return '';
    },
    verificationText() {
      if (this.verificationStatus === 'none') return 'Add your credentials so we can verify your account.';
      if (this.verificationStatus === 'pending') return 'Our team is reviewing your credentials. This usually takes 1–2 working days.';
      if (this.verificationStatus === 'rejected') return 'Please review your submission and resubmit.';
      if (this.verificationStatus === 'suspended') return 'Contact support if you believe this is an error.';
      if (this.verificationStatus === 'verified') return 'Your profile is visible to families.';
      return '';
    },
    verificationAction() {
      if (this.verificationStatus === 'none') return 'Complete setup';
      if (this.verificationStatus === 'pending') return 'View submission';
      return 'Resubmit';
    },

    heroSubtitle() {
      if (!this.pro) return 'Set up your profile to start appearing in family searches.';
      if (this.requestCounts.assigned) {
        return `${this.requestCounts.assigned} new ${this.requestCounts.assigned === 1 ? 'request' : 'requests'} waiting.`;
      }
      if (this.todayBookings.length) {
        return `${this.todayBookings.length} ${this.todayBookings.length === 1 ? 'session' : 'sessions'} today.`;
      }
      if (this.upcoming.length) {
        return `${this.upcoming.length} upcoming ${this.upcoming.length === 1 ? 'booking' : 'bookings'}.`;
      }
      return 'No sessions scheduled — add availability to attract bookings.';
    },

    todayBookings() {
      const today = new Date();
      const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
      return this.bookings
        .filter((b) => {
          const t = new Date(b.scheduled_at);
          return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d && b.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    upcoming() {
      const now = Date.now();
      return this.bookings
        .filter((b) => {
          const t = new Date(b.scheduled_at).getTime();
          return t >= now && (b.status === 'pending' || b.status === 'confirmed');
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    filteredBookings() {
      if (this.bookingFilter === 'all') return this.bookings;
      if (this.bookingFilter === 'upcoming') return this.upcoming;
      return this.bookings.filter((b) => b.status === this.bookingFilter);
    },
    pendingCount() {
      return this.bookings.filter((b) => b.status === 'pending').length;
    },
    recentClients() {
      const map = new Map();
      const sorted = this.bookings
        .filter((b) => b.status === 'completed' || b.status === 'confirmed')
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
      for (const b of sorted) {
        if (!b.child_id) continue;
        if (map.has(b.child_id)) map.get(b.child_id).sessionCount += 1;
        else map.set(b.child_id, { child_id: b.child_id, child_name: b.child_name || 'Client', sessionCount: 1 });
      }
      return Array.from(map.values()).slice(0, 6);
    },
    uniqueClientCount() {
      const ids = new Set();
      for (const b of this.bookings) if (b.child_id) ids.add(b.child_id);
      return ids.size;
    },
    todayLabel() {
      return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
    },

    avgPrice() {
      if (!this.services.length) return null;
      const sum = this.services.reduce((a, s) => a + Number(s.price || 0), 0);
      return Math.round(sum / this.services.length).toLocaleString('en-US');
    },
    avgDuration() {
      if (!this.services.length) return null;
      const sum = this.services.reduce((a, s) => a + Number(s.duration_minutes || 0), 0);
      return Math.round(sum / this.services.length);
    },

    filteredRequests() {
      if (this.requestFilter === 'all') return this.requests;
      return this.requests.filter((r) => r.status === this.requestFilter);
    },
    questionnaireEntries() {
      const q = this.selectedRequest?.questionnaire;
      if (!q) return [];
      let parsed = q;
      if (typeof q === 'string') {
        try { parsed = JSON.parse(q); } catch (e) { return []; }
      }
      const labels = {
        communication: 'Communication & speech',
        movement: 'Movement & coordination',
        learning: 'Learning & attention',
        social: 'Social interaction',
        daily_living: 'Daily living',
        behaviour: 'Behaviour & emotions',
        sensory: 'Sensory sensitivity',
        school: 'School'
      };
      const valueLabels = {
        no_concern: 'Not an issue',
        mild: 'Mild',
        moderate: 'Moderate',
        significant: 'Significant'
      };
      return Object.entries(parsed)
        .filter(([k, v]) => labels[k] && v)
        .map(([k, v]) => ({
          key: k,
          label: labels[k],
          value: v,
          valueLabel: valueLabels[v] || v
        }));
    },
    canSubmitReport() {
      return this.reportForm.findings.trim().length >= 20;
    },

    canSaveProfile() {
      const f = this.form;
      return !!f.type && !!f.county && f.bio.trim().length >= 30;
    },
    canSaveService() {
      const m = this.serviceModal;
      if (!m.type) return false;
      if (m.type === 'Other' && (!m.customType || m.customType.length < 3)) return false;
      return m.price !== null && Number(m.price) >= 0
        && m.duration_minutes && Number(m.duration_minutes) >= 15;
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu);
    window.addEventListener('scroll', this.onScroll, { passive: true });

    const qTab = this.$route.query.tab;
    const valid = ['home', 'requests', 'bookings', 'services', 'availability', 'profile'];
    if (valid.includes(qTab)) this.activeTab = qTab;

    this.loadAll();
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    onScroll() { this.scrolled = window.scrollY > 4; },

    toast(message, type = 'success', icon = 'mdi-check-circle-outline') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, icon });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3200);
    },

    _fbAuth() {
      if (this.$fire?.auth) return this.$fire.auth;
      if (this.$firebase) {
        return typeof this.$firebase.auth === 'function' ? this.$firebase.auth() : this.$firebase.auth;
      }
      return null;
    },
    async authHeader() {
      const auth = this._fbAuth();
      const user = auth?.currentUser;
      if (!user) return {};
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    },

    closeMenu() { this.menuOpen = false; },

    setTab(tab) {
      this.menuOpen = false;
      this.activeTab = tab;
      this.$router.replace({ path: '/dashboard/professional', query: { tab } }).catch(() => {});

      if (tab === 'requests') this.loadRequests();
      else if (tab === 'services' && !this.loadedTabs.services) this.loadServices();
      else if (tab === 'availability' && !this.loadedTabs.availability) this.loadAvailability();
    },

    goTo(path) {
      try {
        const r = this.$router.push(path);
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch (e) {}
    },

    goToOnboarding() {
      this.goTo('/onboarding/professional');
    },

    async copyUid() {
      const uid = this.pro?.firebase_uid;
      if (!uid) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(uid);
        } else {
          const el = document.createElement('textarea');
          el.value = uid;
          el.style.position = 'fixed';
          el.style.opacity = '0';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        this.copied = true;
        this.toast('UID copied');
        setTimeout(() => { this.copied = false; }, 1500);
      } catch (e) {
        this.toast('Copy not supported', 'warn', 'mdi-alert-outline');
      }
    },

    async loadAll() {
      this.loading = true;
      this.loadError = '';
      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          this.loadError = 'You are not signed in.';
          this.loading = false;
          return;
        }

        const [meRes, proRes, bookRes, reqRes] = await Promise.all([
          axios.get(`${API}/api/users/me`, { headers }),
          axios.get(`${API}/api/professionals/me/profile`, { headers }).catch(() => ({ data: { data: null } })),
          axios.get(`${API}/api/bookings/assigned`, { headers }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API}/api/assessments/requests/assigned`, { headers }).catch(() => ({ data: { data: [], counts: {} } }))
        ]);

        this.user = meRes.data?.data || null;
        this.pro = proRes.data?.data || null;
        this.bookings = bookRes.data?.data || [];
        this.requests = reqRes.data?.data || [];
        this.requestCounts = {
          assigned:    reqRes.data?.counts?.assigned    || 0,
          in_progress: reqRes.data?.counts?.in_progress || 0,
          completed:   reqRes.data?.counts?.completed   || 0
        };

        if (this.pro) {
          this.form.type = this.pro.type || '';
          this.form.bio = this.pro.bio || '';
          this.form.county = this.pro.county || '';
          this.form.area = this.pro.area || '';
          this.form.online = !!this.pro.online;
          this.form.years_experience = this.pro.years_experience || null;
          this.form.price_min = this.pro.price_min || null;
          this.form.price_max = this.pro.price_max || null;
          this.form.languages = this.parseLangs(this.pro.languages);
        }

        await Promise.all([this.loadServices(), this.loadAvailability()]);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          this.loadError = 'Access denied. Please sign in again.';
        } else {
          this.loadError = 'Could not load your dashboard. Please try again.';
        }
        console.error('[pro dashboard] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    async loadServices() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/services`, { headers });
        this.services = data.data || [];
        this.loadedTabs.services = true;
      } catch (err) {
        console.warn('[services]', err.response?.data || err.message);
      }
    },

    async loadAvailability() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/availability`, { headers });
        this.availability = data.data || [];
        this.loadedTabs.availability = true;
      } catch (err) {
        console.warn('[availability]', err.response?.data || err.message);
      }
    },

    async loadRequests() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/assessments/requests/assigned`, { headers });
        this.requests = data.data || [];
        this.requestCounts = {
          assigned:    data.counts?.assigned    || 0,
          in_progress: data.counts?.in_progress || 0,
          completed:   data.counts?.completed   || 0
        };
        this.loadedTabs.requests = true;
      } catch (err) {
        console.warn('[requests]', err.response?.data || err.message);
      }
    },

    async openRequest(r) {
      if (!r) return;
      this.selectedRequest = r;
      this.reportOpen = false;
      this.reportError = '';
      this.scheduleForm = { scheduled_at: '', type: '' };
      this.reportForm = {
        findings: '',
        strengths: '',
        needs: '',
        recommendations: '',
        follow_up_date: ''
      };

      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/assessments/requests/${r.id}`, { headers });
        if (data?.data) this.selectedRequest = data.data;
      } catch (err) {
        // Non-fatal — keep the row we already have
      }
    },

    closeRequest() {
      this.selectedRequest = null;
      this.reportOpen = false;
      this.reportError = '';
    },

    async startAssessment() {
      if (!this.selectedRequest || this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        const payload = {
          scheduled_at: this.scheduleForm.scheduled_at || null,
          type: this.scheduleForm.type || null
        };
        await axios.post(
          `${API}/api/assessments/requests/${this.selectedRequest.id}/start`,
          payload,
          { headers }
        );
        this.toast('Assessment started');
        await this.loadRequests();
        await this.openRequest({ id: this.selectedRequest.id });
      } catch (err) {
        const code = err.response?.data?.error;
        this.toast(
          {
            request_closed: 'This request is already closed.',
            not_assigned: 'You are not assigned to this request.'
          }[code] || 'Could not start.',
          'error',
          'mdi-alert-circle-outline'
        );
      } finally {
        this.acting = false;
      }
    },

    async submitReport() {
      if (!this.selectedRequest?.assessment?.id || !this.canSubmitReport || this.acting) return;
      this.acting = true;
      this.reportError = '';
      try {
        const headers = await this.authHeader();
        const payload = {
          findings: this.reportForm.findings,
          strengths: this.reportForm.strengths || null,
          needs: this.reportForm.needs || null,
          recommendations: this.reportForm.recommendations || null,
          goals: null,
          follow_up_date: this.reportForm.follow_up_date || null
        };
        await axios.post(
          `${API}/api/assessments/${this.selectedRequest.assessment.id}/report`,
          payload,
          { headers }
        );
        this.toast('Report submitted');
        await this.loadRequests();
        await this.openRequest({ id: this.selectedRequest.id });
      } catch (err) {
        const code = err.response?.data?.error;
        this.reportError = {
          findings_too_short: 'Findings must be at least 20 characters.',
          findings_too_long: 'Findings is too long. Keep it under 10,000 characters.',
          report_exists: 'A report already exists for this assessment.',
          not_assigned: 'You are not assigned to this request.'
        }[code] || err.response?.data?.message || 'Could not submit. Try again.';
      } finally {
        this.acting = false;
      }
    },

    viewReport(reportId) {
      if (!reportId) return;
      this.selectedRequest = null;
      this.goTo(`/reports/${reportId}`);
    },

    parseLangs(l) {
      if (!l) return [];
      if (Array.isArray(l)) return l;
      try {
        const p = JSON.parse(l);
        return Array.isArray(p) ? p : [];
      } catch (e) { return []; }
    },

    toggleLanguage(l) {
      const i = this.form.languages.indexOf(l);
      if (i >= 0) this.form.languages.splice(i, 1);
      else this.form.languages.push(l);
    },

    async saveProfile() {
      if (!this.canSaveProfile || this.saving) return;
      this.saveError = '';
      this.saving = true;
      try {
        const headers = await this.authHeader();
        const payload = {
          type: this.form.type,
          bio: this.form.bio || null,
          languages: this.form.languages,
          county: this.form.county || null,
          area: this.form.area || null,
          online: !!this.form.online,
          years_experience: this.form.years_experience || null,
          price_min: this.form.price_min || null,
          price_max: this.form.price_max || null
        };
        await axios.post(`${API}/api/professionals/me`, payload, { headers });
        this.pro = { ...this.pro, ...payload };
        this.toast('Profile saved');
      } catch (err) {
        const code = err.response?.data?.error;
        this.saveError = {
          invalid_type: 'Pick a valid professional type.',
          invalid_price_min: 'Minimum price must be a positive number.',
          invalid_price_max: 'Maximum price must be a positive number.',
          price_max_lt_min: 'Maximum price must be at least the minimum price.',
          invalid_years: 'Years of experience must be between 0 and 60.'
        }[code] || 'Could not save. Please try again.';
      } finally {
        this.saving = false;
      }
    },

    openBooking(b) { this.selected = b; },

    openBookingDetail(b) {
      if (!b || !b.id) return;
      this.selected = null;
      this.goTo(`/bookings/${b.id}`);
    },

    async setStatus(b, status) {
      if (!b || this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(`${API}/api/bookings/${b.id}/status`, { status }, { headers });
        b.status = status;
        this.selected = null;
        const verb = { confirmed: 'Booking confirmed', completed: 'Marked complete', no_show: 'Marked no-show' }[status] || 'Updated';
        this.toast(verb);
      } catch (err) {
        this.toast(err.response?.data?.error || 'Could not update.', 'error', 'mdi-alert-circle-outline');
      } finally {
        this.acting = false;
      }
    },

    openServiceModal(s = null) {
      const existingType = s?.type || '';
      const isPreset = this.serviceTypes.includes(existingType);

      this.serviceModal = {
        open: true,
        saving: false,
        error: '',
        editing: s,
        type: isPreset ? existingType : (existingType ? 'Other' : ''),
        customType: isPreset ? '' : existingType,
        description: s?.description || '',
        price: s?.price ? Number(s.price) : null,
        duration_minutes: s?.duration_minutes || 60
      };
    },
    closeServiceModal() { this.serviceModal.open = false; },
    applyPreset(p) {
      this.serviceModal.price = p.price;
      this.serviceModal.duration_minutes = p.duration_minutes;
    },

    async saveService() {
      if (!this.canSaveService || this.serviceModal.saving) return;
      this.serviceModal.saving = true;
      this.serviceModal.error = '';

      const resolvedType = this.serviceModal.type === 'Other'
        ? this.serviceModal.customType.trim()
        : this.serviceModal.type;

      try {
        const headers = await this.authHeader();
        const payload = {
          type: resolvedType,
          description: this.serviceModal.description || null,
          price: this.serviceModal.price,
          duration_minutes: this.serviceModal.duration_minutes
        };
        if (this.serviceModal.editing) {
          await axios.patch(`${API}/api/services/${this.serviceModal.editing.id}`, payload, { headers });
        } else {
          await axios.post(`${API}/api/services`, payload, { headers });
        }
        this.closeServiceModal();
        await this.loadServices();
        this.toast(this.serviceModal.editing ? 'Service updated' : 'Service added');
      } catch (err) {
        this.serviceModal.error = err.response?.data?.message || err.response?.data?.error || 'Could not save.';
      } finally {
        this.serviceModal.saving = false;
      }
    },

    async toggleService(s) {
      if (this.toggling) return;
      this.toggling = s.id;
      try {
        const headers = await this.authHeader();
        await axios.patch(`${API}/api/services/${s.id}`, { active: !s.active }, { headers });
        s.active = !s.active;
        this.toast(s.active ? 'Service shown' : 'Service hidden');
      } catch (err) {
        this.toast('Could not update.', 'error', 'mdi-alert-circle-outline');
      } finally {
        this.toggling = null;
      }
    },

    confirmDeleteService(s) {
      this.deleteTarget = s;
    },

    async deleteService() {
      if (!this.deleteTarget) return;
      const id = this.deleteTarget.id;
      const name = this.deleteTarget.type;
      this.deleting = id;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/services/${id}`, { headers });
        this.services = this.services.filter((s) => s.id !== id);
        this.deleteTarget = null;
        this.toast(`Deleted ${name}`, 'warn', 'mdi-delete-outline');
      } catch (err) {
        this.toast('Could not delete.', 'error', 'mdi-alert-circle-outline');
      } finally {
        this.deleting = null;
      }
    },

    openAvailModal() {
      this.availModal = {
        open: true, saving: false, error: '',
        day_of_week: 1, start_time: '09:00', end_time: '17:00', location_type: 'in_person'
      };
    },
    closeAvailModal() { this.availModal.open = false; },

    async saveAvail() {
      this.availModal.saving = true;
      this.availModal.error = '';
      try {
        const headers = await this.authHeader();
        await axios.post(`${API}/api/availability`, {
          day_of_week: this.availModal.day_of_week,
          start_time: this.availModal.start_time,
          end_time: this.availModal.end_time,
          location_type: this.availModal.location_type
        }, { headers });
        this.closeAvailModal();
        await this.loadAvailability();
        this.toast('Slot added');
      } catch (err) {
        const code = err.response?.data?.error;
        const body = err.response?.data;
        if (code === 'slot_overlap' && body?.conflicting) {
          this.availModal.error = `Overlaps an existing slot (${body.conflicting.start_time} – ${body.conflicting.end_time}).`;
        } else if (code === 'end_before_start') {
          this.availModal.error = 'End time must be after start time.';
        } else if (code === 'invalid_day') {
          this.availModal.error = 'Pick a valid day.';
        } else if (code === 'slot_exists') {
          this.availModal.error = 'That exact slot already exists.';
        } else {
          this.availModal.error = code || 'Could not save.';
        }
      } finally {
        this.availModal.saving = false;
      }
    },

    confirmDeleteAvail(slot) {
      this.deleteAvailTarget = slot;
    },

    async deleteAvail() {
      if (!this.deleteAvailTarget) return;
      const id = this.deleteAvailTarget.id;
      this.deleting = id;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/availability/${id}`, { headers });
        this.availability = this.availability.filter((a) => a.id !== id);
        this.deleteAvailTarget = null;
        this.toast('Slot removed', 'warn', 'mdi-calendar-remove-outline');
      } catch (err) {
        this.toast('Could not remove.', 'error', 'mdi-alert-circle-outline');
      } finally {
        this.deleting = null;
      }
    },

    async signOut() {
      this.menuOpen = false;
      try {
        const auth = this._fbAuth();
        if (auth) await auth.signOut();
      } catch (e) {}
      this.$router.replace('/login').catch(() => {});
    },

    /* ---- Helpers ---- */
    initialsOf(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg(id) {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return p[(Number(id) || 0) % p.length];
    },
    shortTime(dt) {
      const d = new Date(dt);
      const h = d.getHours() % 12 || 12;
      return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    ampm(dt) { return new Date(dt).getHours() < 12 ? 'AM' : 'PM'; },
    timeOf(dt) {
      return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    },
    timeRange(dt, mins = 60) {
      const s = new Date(dt);
      const e = new Date(s.getTime() + (Number(mins) || 60) * 60000);
      const f = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${f(s)} – ${f(e)}`;
    },
    fullDate(dt) {
      return new Date(dt).toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    },
    dowOf(dt) { return new Date(dt).toLocaleDateString('en-KE', { weekday: 'short' }); },
    dayOf(dt) { return new Date(dt).getDate(); },
    monthOf(dt) { return new Date(dt).toLocaleString('en-US', { month: 'short' }).toUpperCase(); },
    statusClass(status) {
      const s = String(status || '').toLowerCase();
      if (['confirmed', 'completed', 'assigned', 'active'].includes(s)) return 'status-green';
      if (['pending', 'submitted', 'routing', 'in_progress'].includes(s)) return 'status-amber';
      if (['cancelled', 'no_show', 'rejected'].includes(s)) return 'status-red';
      return 'status-grey';
    },
    statusLabel(status) {
      const s = String(status || '').toLowerCase();
      const m = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' };
      return m[s] || s || 'Unknown';
    },
    requestStatusLabel(status) {
      const s = String(status || '').toLowerCase();
      return {
        submitted:   'Submitted',
        routing:     'Routing',
        assigned:    'New',
        in_progress: 'In progress',
        completed:   'Completed',
        cancelled:   'Cancelled'
      }[s] || s;
    },
    formatPrice(n) { return Number(n || 0).toLocaleString('en-US'); },
    iconFor(type) {
      const t = String(type || '').toLowerCase();
      if (t.includes('speech') || t.includes('language')) return 'mdi-account-voice';
      if (t.includes('occupational')) return 'mdi-hand-heart';
      if (t.includes('physio')) return 'mdi-human-handsup';
      if (t.includes('psych')) return 'mdi-brain';
      if (t.includes('special') || t.includes('education')) return 'mdi-school';
      if (t.includes('learning')) return 'mdi-book-open-page-variant';
      if (t.includes('parent')) return 'mdi-account-supervisor';
      if (t.includes('assess')) return 'mdi-clipboard-text-outline';
      if (t.includes('group')) return 'mdi-account-multiple-outline';
      if (t.includes('home')) return 'mdi-home-outline';
      if (t.includes('school')) return 'mdi-school-outline';
      return 'mdi-tag-outline';
    },
    iconBg(type) {
      const t = String(type || '').toLowerCase();
      if (t.includes('speech') || t.includes('physio')) return '#e6e0f5';
      if (t.includes('occupational') || t.includes('special')) return '#fce4ec';
      if (t.includes('psych') || t.includes('learning')) return '#d9f0f6';
      return '#e6e0f5';
    },
    iconColor(type) {
      const t = String(type || '').toLowerCase();
      if (t.includes('occupational') || t.includes('special')) return '#e86a8a';
      if (t.includes('psych') || t.includes('learning')) return '#56c2d9';
      return '#4a3b8c';
    },
    dayName(d) {
      const found = this.days.find((x) => x.value === Number(d));
      return found ? found.label : '';
    },
    shortTimeStr(t) {
      if (!t) return '';
      const parts = String(t).split(':');
      const h = Number(parts[0]);
      const m = parts[1] || '00';
      const ampm = h < 12 ? 'AM' : 'PM';
      const hh = h % 12 || 12;
      return `${hh}:${m} ${ampm}`;
    },
    locLabel(l) {
      if (l === 'online') return 'Online';
      if (l === 'both') return 'Both';
      return 'In person';
    },
    locClass(l) {
      if (l === 'online') return 'loc-online';
      if (l === 'both') return 'loc-both';
      return 'loc-in-person';
    },
    slotsForDay(d) {
      return this.availability.filter((a) => Number(a.day_of_week) === Number(d));
    },
    ageOf(dob) {
      if (!dob) return 'Age not set';
      const d = new Date(dob);
      if (isNaN(d.getTime())) return 'Age not set';
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      let months = now.getMonth() - d.getMonth();
      if (months < 0) { years--; months += 12; }
      if (years <= 0) return `${months} mo`;
      if (years === 1) return '1 yr';
      return `${years} yrs`;
    },
    truncate(text, n) {
      const t = String(text || '');
      return t.length > n ? `${t.slice(0, n)}…` : t;
    },
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
    preferredTimeLabel(value) {
      return {
        weekday_mornings:   'Weekday mornings',
        weekday_afternoons: 'Weekday afternoons',
        weekday_evenings:   'Weekday evenings',
        weekends:           'Weekends'
      }[value] || value;
    },
    budgetRange(r) {
      const min = r?.budget_min;
      const max = r?.budget_max;
      if (!min && !max) return '';
      const fmt = (n) => Number(n || 0).toLocaleString('en-US');
      if (min && max) return `KSh ${fmt(min)}–${fmt(max)}`;
      if (min) return `From KSh ${fmt(min)}`;
      return `Up to KSh ${fmt(max)}`;
    },
    isPreferredDifferent(r) {
      if (!r) return false;
      if (!r.preferred_professional_id) return false;
      if (!r.assigned_professional_id) return false;
      return r.preferred_professional_id !== r.assigned_professional_id;
    }
  }
};
</script>

<style scoped>
.pro-dashboard {
  --purple: #4a3b8c;
  --purple-2: #5b4b9e;
  --teal: #56c2d9;
  --teal-2: #7ec8e3;
  --pink: #e86a8a;
  --pink-2: #f48fb1;
  --ink: #2c3e50;
  --muted: #7f8c8d;
  --line: #ececf1;
  --bg: #f5f7fb;

  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 96px;
}
@media (min-width: 768px) { .pro-dashboard { padding-bottom: 64px; } }

/* TOPBAR */
.topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid transparent;
  height: 64px; padding: 0 16px;
  display: flex; align-items: center; justify-content: space-between;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.topbar.scrolled { border-bottom-color: var(--line); box-shadow: 0 8px 24px -18px rgba(44, 62, 80, 0.25); }
@media (min-width: 768px) { .topbar { padding: 0 32px; } }

.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-mark {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, var(--purple), var(--teal));
  display: grid; place-items: center;
  box-shadow: 0 6px 14px -6px rgba(74, 59, 140, 0.55);
}
.brand-name { font-size: 16px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.brand-dot { color: var(--pink); }

.topbar-actions { display: flex; align-items: center; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
  transition: background 0.15s ease;
}
.icon-btn:hover { background: #e6eef5; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.user-menu-wrap { position: relative; }
.user-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pink), var(--pink-2));
  color: #fff; border: 2px solid #fff; font-weight: 800; font-size: 13px;
  cursor: pointer; letter-spacing: 0.3px;
  box-shadow: 0 6px 14px -6px rgba(232, 106, 138, 0.55);
}
.user-menu {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 240px;
  background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 24px 48px -16px rgba(44, 62, 80, 0.25);
  overflow: hidden; z-index: 50;
}
.user-menu-head { padding: 16px; border-bottom: 1px solid #f0f0f5; }
.user-menu-name { font-size: 0.9rem; font-weight: 800; color: var(--ink); }
.user-menu-email {
  font-size: 0.76rem; color: var(--muted); margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.role-badge {
  display: inline-block; margin-top: 10px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
  background: #fce4ec; color: #c2185b;
}
.user-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 13px 16px; background: transparent; border: none;
  text-align: left; font-size: 0.86rem; color: var(--ink); cursor: pointer;
  font-family: inherit; font-weight: 600;
}
.user-menu-item.danger { color: #e74c3c; }
.user-menu-item:hover { background: #f9fafc; }

/* TABS */
.tabs {
  position: sticky; top: 64px; z-index: 30;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid var(--line);
  padding: 0 8px; display: flex; overflow-x: auto; scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .tabs { padding: 0 32px; } }

.tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 15px 18px; border: none; background: transparent;
  font-size: 0.82rem; font-weight: 700; color: var(--muted);
  border-bottom: 2px solid transparent; cursor: pointer;
  font-family: inherit; white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.tab:hover { color: var(--purple); }
.tab.active { color: var(--purple); border-bottom-color: var(--purple); }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 6px;
  border-radius: 999px; background: var(--pink); color: #fff;
  font-size: 0.62rem; font-weight: 800; margin-left: 4px;
}
.tab:not(.active) .tab-badge { background: #ede7f8; color: var(--purple); }

/* BOTTOM NAV */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-top: 1px solid var(--line);
  display: flex;
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 24px -18px rgba(44, 62, 80, 0.25);
}
@media (min-width: 768px) { .bottom-nav { display: none; } }
.bn-item {
  flex: 1;
  background: transparent; border: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 8px 4px; border-radius: 12px;
  color: #95a5a6; font-size: 0.62rem; font-weight: 700;
  font-family: inherit; letter-spacing: 0.2px;
  transition: background 0.15s ease, color 0.15s ease;
}
.bn-item.active { color: var(--purple); background: #f0ecfa; }

/* MAIN */
.main { max-width: 980px; margin: 0 auto; padding: 20px 16px; }
@media (min-width: 768px) { .main { padding: 32px; } }

.greeting { margin-bottom: 20px; }
.greeting h1 {
  font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em;
  color: var(--ink); margin: 0 0 6px;
}
.greeting p { font-size: 0.92rem; color: var(--muted); margin: 0; }

.greeting-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
}
.greeting-row h1 {
  font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em;
  color: var(--ink); margin: 0 0 6px;
}
.greeting-row p { font-size: 0.92rem; color: var(--muted); margin: 0; }

.section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 0 12px;
}
.section-head h2 {
  font-size: 1.05rem; font-weight: 800; color: var(--ink);
  margin: 0; letter-spacing: -0.01em;
}
.date-label { font-size: 0.78rem; color: var(--muted); font-weight: 600; }
.link-btn {
  background: transparent; border: none; color: var(--purple);
  font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
}

/* HERO */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #e86a8a 0%, #f48fb1 45%, #4a3b8c 140%);
  color: #fff;
  border-radius: 22px;
  padding: 24px 22px;
  margin-bottom: 20px;
  box-shadow: 0 24px 48px -20px rgba(232, 106, 138, 0.55);
}
.hero-body { position: relative; z-index: 2; }
.hero-kicker {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase; opacity: 0.75; margin-bottom: 6px;
}
.hero-title {
  font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em;
  margin: 0 0 8px; line-height: 1.2;
}
.hero-sub {
  font-size: 0.86rem; opacity: 0.88; margin: 0; line-height: 1.5; max-width: 480px;
}
.hero-glow {
  position: absolute; top: -40%; right: -20%; width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(74, 59, 140, 0.6), transparent 70%);
  filter: blur(20px); pointer-events: none;
}

/* STAT STRIP */
.stat-strip {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 28px;
}
.stat-chip {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid var(--line); border-radius: 14px;
  padding: 12px; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -18px rgba(74, 59, 140, 0.4);
  border-color: #d9d2ec;
}
.stat-chip:active { transform: translateY(0) scale(0.99); }
.stat-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-body { min-width: 0; }
.stat-value { font-size: 1.15rem; font-weight: 900; color: var(--ink); line-height: 1; }
.stat-label {
  font-size: 0.66rem; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px;
}
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }

/* SKELETON */
.skeleton-wrap { padding-top: 4px; }
.sk-hero {
  height: 130px; border-radius: 22px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 16px;
}
.sk-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
.sk-chip {
  height: 58px; border-radius: 14px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
.sk-card {
  height: 76px; border-radius: 16px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 12px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ERROR */
.error-card {
  background: #fff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon {
  width: 76px; height: 76px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 16px;
}
.error-card h2 { font-size: 1.2rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 24px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 28px; }

/* VERIFY BANNER */
.verify-card {
  display: flex; align-items: center; gap: 14px;
  border-radius: 16px; padding: 14px 18px; margin-bottom: 20px;
  border: 1px solid;
}
.verify-amber  { background: #fef3e0; border-color: #f8d7a1; }
.verify-red    { background: #fdecea; border-color: #f5c2bd; }
.verify-purple { background: #ede7f8; border-color: #d9d2ec; }
.verify-green  { background: #e6f9ee; border-color: #a7e3c0; }
.verify-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
  display: grid; place-items: center; flex: 0 0 auto;
}
.verify-body { flex: 1; min-width: 0; }
.verify-title { font-size: 0.92rem; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.verify-text { font-size: 0.8rem; color: var(--muted); line-height: 1.5; }
.verify-btn {
  padding: 9px 16px; border-radius: 10px; border: none;
  background: var(--purple); color: #fff;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  font-family: inherit; white-space: nowrap;
}
.verify-btn:hover { background: #3f327a; }

.verify-mini-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 14px;
  border: 1px solid; margin-bottom: 16px;
}
.vm-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.75);
  display: grid; place-items: center; flex: 0 0 auto;
}
.verify-mini-title { font-size: 0.9rem; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.verify-mini-text { font-size: 0.8rem; color: var(--muted); line-height: 1.5; }

/* EMPTY */
.empty-card {
  background: #fff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid var(--line);
  max-width: 520px; margin: 24px auto;
}
.empty-icon {
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg, #ede7f8, #fce4ec);
  display: grid; place-items: center; margin: 0 auto 18px;
}
.empty-card h2 { font-size: 1.2rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.empty-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 28px 24px; text-align: center;
  background: #fff; border: 1px dashed #d4dae4; border-radius: 18px;
}
.empty-illustration {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, #ede7f8, #e6f4f8);
  display: grid; place-items: center; margin-bottom: 12px;
}
.empty-title { font-size: 0.95rem; font-weight: 800; color: var(--ink); }
.empty-sub { font-size: 0.82rem; color: var(--muted); margin-top: 4px; max-width: 320px; line-height: 1.5; }

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.9rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  transition: transform 0.15s ease;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.primary-btn.small { padding: 9px 16px; font-size: 0.82rem; }

.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-secondary:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer;
  font-family: inherit;
  display: inline-flex; align-items: center;
}
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  display: inline-flex; align-items: center;
  box-shadow: 0 10px 22px -12px rgba(231, 76, 60, 0.6);
}
.btn-danger:hover:not(:disabled) { background: linear-gradient(135deg, #dc4433, #b0331f); }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

/* LIST ROWS */
.list { display: grid; gap: 10px; }
.list-row {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.list-row:hover { border-color: #d9d2ec; transform: translateY(-1px); box-shadow: 0 16px 28px -20px rgba(74, 59, 140, 0.35); }
.list-row:active { transform: translateY(0) scale(0.995); }
.list-row.clickable { position: relative; }
.list-row.clickable::before {
  content: ''; position: absolute; left: 0; top: 14px; bottom: 14px;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--purple), var(--teal-2));
  opacity: 0; transition: opacity 0.15s ease;
}
.list-row.clickable:hover::before { opacity: 1; }

/* DATE BLOCK */
.date-block {
  width: 52px; flex: 0 0 auto;
  background: linear-gradient(180deg, #f7f5ff, #ece7fa);
  border-radius: 14px;
  padding: 8px 0;
  text-align: center;
  border: 1px solid #e5def5;
}
.db-dow {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--purple);
  opacity: 0.75;
}
.db-day {
  font-size: 1.25rem; font-weight: 900; color: var(--purple);
  line-height: 1; margin: 3px 0;
}
.db-mon {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--purple);
  opacity: 0.7;
}

.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 0.94rem; font-weight: 800; color: var(--ink); margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 0.78rem; color: var(--muted); margin-bottom: 3px; text-transform: capitalize; }
.row-meta { font-size: 0.72rem; color: #95a5a6; display: flex; align-items: center; gap: 6px; }
.row-tail { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }

.chev { opacity: 0.55; transition: opacity 0.15s ease, transform 0.15s ease; }
.list-row:hover .chev { opacity: 1; transform: translateX(2px); }

/* CHILD AVATAR (for request preview) */
.child-avatar {
  width: 46px; height: 46px; border-radius: 14px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px; flex: 0 0 auto;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}

/* TIMELINE */
.timeline { display: grid; gap: 8px; }
.timeline-item {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid var(--line);
  border-left-width: 4px; border-radius: 14px; padding: 12px 14px;
  cursor: pointer; transition: all 0.15s ease;
}
.timeline-item:hover { border-color: #d9d2ec; transform: translateX(2px); }
.timeline-item.status-amber { border-left-color: #b7791f; }
.timeline-item.status-green { border-left-color: #229954; }
.timeline-item.status-red   { border-left-color: #c0392b; }
.timeline-time {
  flex: 0 0 56px; text-align: center;
  padding: 8px 4px; background: #f3f7fb; border-radius: 10px;
}
.time-value {
  font-size: 0.94rem; font-weight: 800; color: var(--ink);
  line-height: 1; letter-spacing: -0.02em;
}
.time-ampm {
  font-size: 0.62rem; font-weight: 800; color: var(--muted);
  letter-spacing: 0.5px; margin-top: 4px;
}
.timeline-body { flex: 1; min-width: 0; }
.timeline-title { font-size: 0.94rem; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.timeline-sub { font-size: 0.76rem; color: var(--muted); margin-bottom: 4px; }
.timeline-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-item { display: inline-flex; align-items: center; font-size: 0.72rem; color: var(--muted); }

/* STATUS PILLS */
.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.64rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.4px; white-space: nowrap;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

/* SUB TABS */
.sub-tabs {
  display: flex; gap: 4px; background: #fff;
  border: 1px solid var(--line); border-radius: 12px;
  padding: 4px; margin-bottom: 16px;
  overflow-x: auto; scrollbar-width: none;
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex: 1; padding: 9px 14px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700;
  color: var(--muted); cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all 0.15s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.sub-tab.active { background: var(--purple); color: #fff; box-shadow: 0 6px 14px -8px rgba(74, 59, 140, 0.6); }
.tab-badge-inline {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px; background: var(--pink); color: #fff;
  font-size: 0.62rem; font-weight: 800;
}
.sub-tab:not(.active) .tab-badge-inline { background: #ede7f8; color: var(--purple); }

/* REQUEST CARDS */
.request-card {
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  position: relative;
}
.request-card:hover {
  border-color: #d9d2ec;
  transform: translateY(-1px);
  box-shadow: 0 16px 28px -20px rgba(74, 59, 140, 0.35);
}
.request-card:hover::before {
  content: ''; position: absolute; left: 0; top: 14px; bottom: 14px;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--purple), var(--teal-2));
  opacity: 1;
  transition: opacity 0.15s ease;
}
.request-card::before { content: ''; opacity: 0; transition: opacity 0.15s ease; }

.request-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.request-avatar {
  width: 44px; height: 44px; border-radius: 13px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px; flex: 0 0 auto;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.request-body { flex: 1; min-width: 0; }

.request-concern {
  font-size: 0.83rem; color: #556;
  font-style: italic;
  padding: 10px 12px;
  background: #f7f9fc;
  border-left: 3px solid #c8c0e0;
  border-radius: 6px;
  line-height: 1.5;
  margin-bottom: 10px;
}

/* Parent preference warning on card */
.request-pref-warning {
  display: flex; align-items: center;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: #fef3e0;
  border-left: 3px solid #b7791f;
  font-size: 0.78rem;
  color: #8a5a12;
  font-weight: 600;
  line-height: 1.4;
}
.request-pref-warning strong {
  font-weight: 800;
  color: #6b4410;
  margin-left: 3px;
}

.request-meta {
  display: flex; flex-wrap: wrap; gap: 10px;
  font-size: 0.72rem; color: var(--muted);
}
.request-meta .meta-done { color: #229954; font-weight: 700; }

/* CLIENTS */
.clients-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.client-card {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid var(--line);
  border-radius: 14px; padding: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.client-card:hover { transform: translateY(-1px); box-shadow: 0 12px 22px -18px rgba(74, 59, 140, 0.35); }
.client-avatar {
  width: 40px; height: 40px; border-radius: 12px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 13px; flex: 0 0 auto;
  letter-spacing: 0.3px;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.client-body { min-width: 0; flex: 1; }
.client-name {
  font-size: 0.86rem; font-weight: 800; color: var(--ink);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.client-meta { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

/* SUMMARY */
.summary-card {
  display: flex; align-items: center;
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 18px 12px; margin-bottom: 16px;
}
.summary-stat { flex: 1; text-align: center; }
.summary-value {
  font-size: 1.15rem; font-weight: 900; color: var(--purple);
  letter-spacing: -0.02em; line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.summary-label {
  font-size: 0.66rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;
}
.summary-divider { width: 1px; height: 30px; background: var(--line); }

/* SERVICES */
.services-list { display: grid; gap: 12px; }
.service-card {
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.service-card:hover { border-color: #d9d2ec; transform: translateY(-1px); box-shadow: 0 16px 28px -22px rgba(74, 59, 140, 0.4); }
.service-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.service-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.service-body { flex: 1; min-width: 0; }
.service-name {
  font-size: 0.98rem; font-weight: 800; color: var(--ink);
  text-transform: capitalize; margin-bottom: 6px;
}
.service-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip-meta {
  display: inline-flex; align-items: center;
  font-size: 0.72rem; font-weight: 700;
  padding: 3px 9px; border-radius: 999px;
  background: #f3f7fb; color: #4a5568;
}
.chip-active { background: #e6f9ee; color: #229954; }
.chip-inactive { background: #ececf1; color: var(--muted); }
.service-desc {
  font-size: 0.84rem; color: var(--muted);
  line-height: 1.55; margin-bottom: 12px; padding-top: 4px;
}
.service-actions {
  display: flex; gap: 6px; padding-top: 12px;
  border-top: 1px solid #f0f0f5; flex-wrap: wrap;
}
.action-btn {
  display: inline-flex; align-items: center;
  padding: 8px 14px; border-radius: 10px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s ease; font-family: inherit;
}
.action-btn:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn.danger:hover:not(:disabled) { border-color: #e74c3c; background: #fdecea; }

/* WEEK GRID */
.week-grid {
  display: grid; grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 8px; margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}
@media (max-width: 900px) {
  .week-grid { grid-template-columns: repeat(7, 130px); }
}
.week-col {
  background: #fff; border: 1px solid var(--line);
  border-radius: 14px; padding: 10px 8px;
  min-height: 110px;
  display: flex; flex-direction: column; gap: 8px;
}
.week-day {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--purple);
  text-align: center; padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f5;
}
.week-slots { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.week-slot {
  position: relative;
  padding: 8px 8px 8px 10px;
  border-radius: 10px;
  background: #f5f2fd;
  border-left: 3px solid var(--purple);
  display: flex; align-items: center; gap: 4px;
  font-size: 0.72rem; font-weight: 700; color: var(--ink);
}
.week-slot.loc-online { background: #e6f4f8; border-left-color: #56c2d9; }
.week-slot.loc-both { background: #fce4ec; border-left-color: #e86a8a; }
.slot-time { flex: 1; text-align: center; font-variant-numeric: tabular-nums; }
.slot-arrow { color: var(--muted); font-weight: 700; }
.slot-remove {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; border: 1px solid #e0e4eb;
  display: grid; place-items: center;
  cursor: pointer; opacity: 0;
  transition: opacity 0.15s ease;
}
.week-slot:hover .slot-remove { opacity: 1; }
.slot-remove:hover { border-color: #e74c3c; background: #fdecea; }
.week-empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: #cdd4dd; font-size: 1.2rem; font-weight: 800;
}

/* TIP */
.tip-box {
  display: flex; align-items: flex-start; gap: 8px;
  background: #ede7f8; border-radius: 12px;
  padding: 12px 14px; font-size: 0.82rem;
  color: var(--purple); line-height: 1.55;
}

/* CARD */
.card {
  background: #fff; border: 1px solid var(--line);
  border-radius: 18px; padding: 20px; margin-bottom: 16px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: var(--ink);
  margin: 0 0 16px; letter-spacing: -0.01em;
}

/* IDENTITY */
.identity-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: #f9fafc; border: 1px solid #f0f0f5;
  border-radius: 12px;
}
.identity-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: #e6e0f5; display: grid; place-items: center; flex: 0 0 auto;
}
.identity-body { flex: 1; min-width: 0; }
.identity-label {
  font-size: 0.68rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;
}
.identity-value {
  font-size: 0.85rem; font-weight: 700; color: var(--ink);
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.copy-btn {
  width: 32px; height: 32px; border-radius: 9px;
  border: 1.5px solid #e0e4eb; background: #fff;
  cursor: pointer; display: grid; place-items: center;
  flex: 0 0 auto; transition: all 0.15s ease;
}
.copy-btn:hover:not(:disabled) { border-color: var(--purple); background: #f7f5fd; }
.copy-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* FORM */
.field-label {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 8px;
}
.field-hint { font-size: 0.7rem; font-weight: 600; color: var(--muted); }

.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #fff; color: var(--ink);
  outline: none; font-family: inherit;
  -webkit-appearance: none; appearance: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.text-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.textarea { resize: vertical; min-height: 100px; line-height: 1.55; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center;
  padding: 10px 16px; border-radius: 999px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; font-family: inherit; min-height: 40px;
  transition: all 0.15s ease;
}
.chip:hover:not(:disabled) { border-color: var(--purple); color: var(--purple); }
.chip.active { background: var(--purple); color: #fff; border-color: var(--purple); }
.chip:disabled { opacity: 0.6; cursor: not-allowed; }

.budget-row { display: flex; align-items: center; gap: 10px; }
.budget-row .text-input { flex: 1; }
.budget-sep { color: var(--muted); font-weight: 700; }

.field-row { display: flex; gap: 10px; }
.field-col { flex: 1; }

.hint { font-size: 0.78rem; color: #95a5a6; margin: 6px 0 0; }

.error-box {
  padding: 12px 14px; border-radius: 12px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500; line-height: 1.45;
}

/* PRESETS */
.preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
.preset-chip {
  padding: 7px 12px; border-radius: 999px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--purple); font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.preset-chip:hover:not(:disabled) { border-color: var(--purple); background: #f7f5fd; }
.preset-chip:disabled { opacity: 0.5; cursor: not-allowed; }

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #fff; border-radius: 22px;
  max-width: 460px; width: 100%; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 40px 80px -24px rgba(15, 13, 36, 0.5);
}
.modal-lg { max-width: 560px; }
.modal-sm { max-width: 400px; text-align: center; }
.modal-head {
  padding: 20px 22px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #f0f0f5;
}
.modal-title { font-size: 1.02rem; font-weight: 800; color: var(--ink); }
.modal-sub {
  font-size: 0.78rem; font-weight: 600; color: var(--muted);
  margin-left: 6px;
}
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 10px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { padding: 16px 22px; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 14px 22px 18px;
  display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
  border-top: 1px solid #f0f0f5;
  background: #fbfcfe;
}
.modal-sm .modal-footer { justify-content: center; }
.modal-text { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 20px; padding: 0 4px; }
.confirm-icon {
  width: 68px; height: 68px; border-radius: 50%;
  background: #fdecea;
  display: grid; place-items: center;
  margin: 4px auto 14px;
}
.confirm-title {
  font-size: 1.05rem; font-weight: 800; color: var(--ink);
  margin: 0 0 8px;
}
.confirm-text {
  font-size: 0.88rem; color: var(--muted); line-height: 1.55;
  margin: 0 0 20px; padding: 0 4px;
}
.modal-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 8px 0; border-bottom: 1px solid #f0f0f5;
}
.modal-row:last-child { border-bottom: none; }
.modal-label {
  font-size: 0.72rem; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px; flex: 0 0 auto;
}
.modal-value {
  font-size: 0.88rem; color: var(--ink); font-weight: 600;
  text-align: right; flex: 1; min-width: 0; word-break: break-word;
}

/* REQUEST DETAIL MODAL */
.request-status-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f5; margin-bottom: 12px;
}
.request-id {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.74rem; color: var(--muted);
}
.req-section { padding: 12px 0; border-bottom: 1px solid #f0f0f5; }
.req-section:last-child { border-bottom: none; }
.req-label {
  font-size: 0.68rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
}
.req-value {
  font-size: 0.92rem; color: var(--ink); font-weight: 600; line-height: 1.5;
}
.req-sub {
  font-size: 0.78rem; color: var(--muted); font-weight: 500; margin-top: 3px;
}
.req-quote {
  font-size: 0.86rem; color: #4a5568; font-style: italic;
  padding: 12px 14px;
  background: #f7f9fc;
  border-left: 3px solid #c8c0e0;
  border-radius: 8px;
  line-height: 1.55;
  white-space: pre-wrap;
}
.req-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.req-pill {
  display: inline-flex; align-items: center;
  padding: 5px 10px; border-radius: 999px;
  font-size: 0.74rem; font-weight: 700;
  background: #ede7f8; color: var(--purple);
}
.req-section-action,
.req-section-form {
  background: #f7f5ff;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e5def5;
  margin-top: 10px;
}
.req-section-done {
  background: #f7faf8;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #d9efe1;
  margin-top: 10px;
}

/* Parent preference highlighted block in modal */
.req-section-note {
  background: #fef3e0;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #f8d7a1;
  margin-top: 10px;
  margin-bottom: 10px;
}
.req-section-note .req-label { color: #b7791f; }
.req-section-note .req-value { color: #6b4410; }
.req-section-note .req-sub { color: #8a5a12; }

.schedule-row { display: flex; flex-direction: column; gap: 8px; }

/* QUESTIONNAIRE ROWS */
.q-list { display: flex; flex-direction: column; gap: 6px; }
.q-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 0.82rem;
  background: #f9fafc;
  border-left: 3px solid #e0e4eb;
}
.q-label { font-weight: 700; color: var(--ink); }
.q-value { font-weight: 800; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.3px; }
.q-no_concern { border-left-color: #229954; background: #f1fbf5; }
.q-no_concern .q-value { color: #229954; }
.q-mild       { border-left-color: #b7791f; background: #fffaf0; }
.q-mild .q-value { color: #b7791f; }
.q-moderate   { border-left-color: #e86a8a; background: #fff5f8; }
.q-moderate .q-value { color: #c2185b; }
.q-significant { border-left-color: #c0392b; background: #fdf2f0; }
.q-significant .q-value { color: #c0392b; }

/* TOASTS */
.toast-wrap {
  position: fixed; bottom: 90px; right: 24px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
@media (min-width: 768px) { .toast-wrap { bottom: 24px; } }
.toast {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center;
  padding: 12px 18px 14px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 700; color: #fff;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.5);
  max-width: 340px;
}
.toast-text { flex: 1; }
.toast-bar {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: rgba(255, 255, 255, 0.45);
  transform-origin: left;
  animation: toastBar 3.2s linear forwards;
}
@keyframes toastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.toast-success { background: linear-gradient(135deg, #229954, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

/* TRANSITIONS */
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }

.menu-enter-active, .menu-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.menu-enter { opacity: 0; transform: translateY(-6px) scale(0.98); }
.menu-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
}
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal { transform: translateY(20px) scale(0.97); opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(20px); }

/* MOBILE */
@media (max-width: 599px) {
  .main { padding: 18px 14px; }
  .hero { padding: 20px 18px; border-radius: 18px; }
  .hero-title { font-size: 1.35rem; }
  .greeting h1, .greeting-row h1 { font-size: 1.4rem; }
  .stat-strip { gap: 8px; }
  .stat-chip { flex-direction: column; align-items: flex-start; padding: 10px; gap: 6px; }
  .stat-value { font-size: 1.05rem; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-footer button { width: 100%; }
  .verify-card { flex-direction: column; align-items: stretch; text-align: center; }
  .verify-icon { margin: 0 auto; }
  .verify-btn { width: 100%; }
  .field-row { flex-direction: column; gap: 0; }
  .field-col + .field-col { margin-top: 16px; }
  .toast-wrap { left: 14px; right: 14px; align-items: stretch; }
  .toast { max-width: none; }
  .request-meta { font-size: 0.7rem; }
  .req-quote { font-size: 0.82rem; padding: 10px 12px; }
}
</style>