<template>
  <div class="pro-dashboard">
    <!-- TOP BAR -->
    <header class="topbar">
      <nuxt-link to="/" class="brand">
        <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
        <span class="brand-name">No<span class="brand-dot">va</span></span>
      </nuxt-link>

      <div class="topbar-actions">
        <button class="icon-btn" @click="loadAll" :disabled="loading" aria-label="Refresh">
          <v-icon small color="#4a3b8c">mdi-refresh</v-icon>
        </button>

        <div class="user-menu-wrap">
          <button class="user-avatar" @click.stop="menuOpen = !menuOpen">
            {{ initials }}
          </button>

          <div v-if="menuOpen" class="user-menu" @click.stop>
            <div class="user-menu-head">
              <div class="user-menu-name">{{ displayName }}</div>
              <div class="user-menu-email">{{ email }}</div>
              <span class="role-badge">Professional</span>
            </div>
            <button class="user-menu-item" @click="setTab('profile')">
              <v-icon small>mdi-account-outline</v-icon>
              Edit profile
            </button>
            <button class="user-menu-item" @click="setTab('services')">
              <v-icon small>mdi-tag-outline</v-icon>
              My services
            </button>
            <button class="user-menu-item" @click="setTab('availability')">
              <v-icon small>mdi-calendar-clock</v-icon>
              Availability
            </button>
            <button class="user-menu-item danger" @click="signOut">
              <v-icon small>mdi-logout</v-icon>
              Sign out
            </button>
          </div>
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
        <span
          v-if="t.value === 'bookings' && pendingCount"
          class="tab-badge"
        >{{ pendingCount }}</span>
      </button>
    </nav>

    <main class="main">
      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="32" width="3" />
        <span>Loading…</span>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Something went wrong</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="loadAll">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
        <button class="link-btn mt-3" @click="signOut">Sign in again</button>
      </section>

      <template v-else>
        <!-- VERIFICATION BANNER -->
        <section
          v-if="verificationStatus !== 'verified' && activeTab !== 'profile'"
          class="verify-card"
          :class="verificationClass"
        >
          <div class="verify-icon">
            <v-icon size="26" :color="verificationIconColor">{{ verificationIcon }}</v-icon>
          </div>
          <div class="verify-body">
            <div class="verify-title">{{ verificationTitle }}</div>
            <div class="verify-text">{{ verificationText }}</div>
          </div>
          <button class="verify-btn" @click="setTab('profile')">
            {{ verificationAction }}
          </button>
        </section>

        <!-- ============================================================
             TAB: HOME
             ============================================================ -->
        <template v-if="activeTab === 'home'">
          <section class="greeting">
            <h1>Hello, {{ firstName }} 👋</h1>
            <p>Here's your practice at a glance.</p>
          </section>

          <section v-if="!pro" class="empty-card">
            <div class="empty-icon">
              <v-icon size="48" color="#4a3b8c">mdi-account-tie-outline</v-icon>
            </div>
            <h2>Set up your professional profile</h2>
            <p>
              Add your credentials, services, and availability so families can
              find and book you.
            </p>
            <button class="primary-btn" @click="setTab('profile')">
              <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
              Complete setup
            </button>
          </section>

          <template v-else>
            <section class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Today</div>
                <div class="stat-value">{{ todayBookings.length }}</div>
                <div class="stat-sub">
                  {{ todayBookings.length === 1 ? 'session' : 'sessions' }}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Upcoming</div>
                <div class="stat-value">{{ upcoming.length }}</div>
                <div class="stat-sub">
                  {{ upcoming.length === 1 ? 'booking' : 'bookings' }}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Clients</div>
                <div class="stat-value">{{ uniqueClientCount }}</div>
                <div class="stat-sub">total</div>
              </div>
            </section>

            <section class="section">
              <div class="section-head">
                <h2 class="section-title">Today's schedule</h2>
                <span class="date-label">{{ todayLabel }}</span>
              </div>

              <div v-if="!todayBookings.length" class="mini-empty">
                <v-icon small color="#95a5a6" class="mr-2">mdi-calendar-blank-outline</v-icon>
                <span>No sessions today.</span>
              </div>

              <div v-else class="timeline">
                <div
                  v-for="b in todayBookings"
                  :key="b.id"
                  class="timeline-item"
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
            </section>

            <section class="section">
              <div class="section-head">
                <h2 class="section-title">Upcoming sessions</h2>
                <button class="link-btn" @click="setTab('bookings')">View all</button>
              </div>

              <div v-if="!upcoming.length" class="mini-empty">
                <v-icon small color="#95a5a6" class="mr-2">mdi-calendar-blank-outline</v-icon>
                <span>No upcoming sessions. Add availability to attract bookings.</span>
              </div>

              <div v-else class="booking-list">
                <div
                  v-for="b in upcoming.slice(0, 5)"
                  :key="b.id"
                  class="booking-row"
                  @click="openBooking(b)"
                >
                  <div class="booking-date">
                    <div class="booking-day">{{ dayOf(b.scheduled_at) }}</div>
                    <div class="booking-month">{{ monthOf(b.scheduled_at) }}</div>
                  </div>
                  <div class="booking-info">
                    <div class="booking-title">{{ b.child_name || 'Client' }}</div>
                    <div class="booking-sub">
                      {{ b.service_name || 'Session' }} · {{ timeOf(b.scheduled_at) }}
                    </div>
                  </div>
                  <span class="status-pill" :class="statusClass(b.status)">
                    {{ statusLabel(b.status) }}
                  </span>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-head">
                <h2 class="section-title">Recent clients</h2>
              </div>

              <div v-if="!recentClients.length" class="mini-empty">
                <v-icon small color="#95a5a6" class="mr-2">mdi-account-group-outline</v-icon>
                <span>Clients will appear here after your first session.</span>
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
            </section>
          </template>
        </template>

        <!-- ============================================================
             TAB: BOOKINGS
             ============================================================ -->
        <template v-else-if="activeTab === 'bookings'">
          <section class="greeting">
            <h1>Bookings</h1>
            <p>All sessions you've been booked for.</p>
          </section>

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

          <div v-if="!filteredBookings.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-calendar-blank-outline</v-icon>
            <span>No {{ bookingFilter === 'all' ? '' : bookingFilter }} bookings yet.</span>
          </div>

          <div v-else class="booking-list">
            <div
              v-for="b in filteredBookings"
              :key="b.id"
              class="booking-row"
              @click="openBooking(b)"
            >
              <div class="booking-date">
                <div class="booking-day">{{ dayOf(b.scheduled_at) }}</div>
                <div class="booking-month">{{ monthOf(b.scheduled_at) }}</div>
              </div>
              <div class="booking-info">
                <div class="booking-title">{{ b.child_name || 'Client' }}</div>
                <div class="booking-sub">
                  {{ b.service_name || 'Session' }} · {{ timeOf(b.scheduled_at) }}
                </div>
              </div>
              <span class="status-pill" :class="statusClass(b.status)">
                {{ statusLabel(b.status) }}
              </span>
            </div>
          </div>
        </template>

        <!-- ============================================================
             TAB: SERVICES
             ============================================================ -->
        <template v-else-if="activeTab === 'services'">
          <section class="greeting">
            <h1>Services</h1>
            <p>What you offer and what you charge.</p>
          </section>

          <section class="summary-card">
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
          </section>

          <button class="add-btn" @click="openServiceModal()">
            <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
            Add a service
          </button>

          <section v-if="!services.length" class="empty-card">
            <div class="empty-icon">
              <v-icon size="48" color="#4a3b8c">mdi-tag-outline</v-icon>
            </div>
            <h2>No services yet</h2>
            <p>Add the services you offer — session types, prices, and durations.</p>
          </section>

          <section v-else class="services-list">
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
                <button class="action-btn danger" @click="deleteTarget = s">
                  <v-icon x-small color="#e74c3c" class="mr-1">mdi-delete-outline</v-icon>Delete
                </button>
              </div>
            </div>
          </section>
        </template>

        <!-- ============================================================
             TAB: AVAILABILITY
             ============================================================ -->
        <template v-else-if="activeTab === 'availability'">
          <section class="greeting">
            <h1>Availability</h1>
            <p>When families can book you.</p>
          </section>

          <button class="add-btn" @click="openAvailModal()">
            <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
            Add a time slot
          </button>

          <section v-if="!availability.length" class="empty-card">
            <div class="empty-icon">
              <v-icon size="48" color="#4a3b8c">mdi-calendar-clock</v-icon>
            </div>
            <h2>No availability set</h2>
            <p>Add weekly slots so parents can see when you're free.</p>
          </section>

          <section v-else class="avail-list">
            <div v-for="a in availability" :key="a.id" class="avail-row">
              <div class="avail-day">{{ dayName(a.day_of_week) }}</div>
              <div class="avail-time">
                {{ shortTimeStr(a.start_time) }} – {{ shortTimeStr(a.end_time) }}
              </div>
              <div class="avail-loc">{{ locLabel(a.location_type) }}</div>
              <button class="icon-sm danger" @click="deleteAvailTarget = a" aria-label="Remove">
                <v-icon x-small color="#e74c3c">mdi-close</v-icon>
              </button>
            </div>
          </section>

          <div class="tip-box">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-lightbulb-outline</v-icon>
            <span>
              Availability sets your typical week. Parents still request specific times,
              which you can confirm or decline.
            </span>
          </div>
        </template>

        <!-- ============================================================
             TAB: PROFILE
             ============================================================ -->
        <template v-else-if="activeTab === 'profile'">
          <section class="greeting">
            <h1>Your profile</h1>
            <p>This is what families see when they find you.</p>
          </section>

          <section class="card">
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

            <label class="field-label mt-4">Bio</label>
            <textarea
              v-model.trim="form.bio"
              rows="5"
              class="text-input textarea"
              :disabled="saving"
              placeholder="Tell families about your approach and background."
            ></textarea>
            <p class="hint">{{ form.bio.length }}/1000</p>

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
            <div v-if="saveSuccess" class="success-box mt-4">{{ saveSuccess }}</div>

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

            <!-- Account identity (read-only) -->
            <div class="identity-row mt-4">
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
          </section>

          <!-- Verification status card -->
          <section class="card">
            <h2 class="card-title">Verification</h2>
            <div class="verify-mini" :class="verificationClass">
              <v-icon small :color="verificationIconColor" class="mr-2">{{ verificationIcon }}</v-icon>
              <div>
                <div class="verify-mini-title">{{ verificationTitle }}</div>
                <div class="verify-mini-text">{{ verificationText }}</div>
              </div>
            </div>
            <button
              v-if="verificationStatus !== 'verified'"
              class="btn-secondary mt-4"
              @click="goToOnboarding"
            >
              {{ verificationAction }}
            </button>
          </section>
        </template>
      </template>
    </main>

    <!-- BOTTOM NAV -->
    <nav class="bottom-nav">
      <button
        v-for="t in bottomTabs"
        :key="t.value"
        class="nav-item"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon small :color="activeTab === t.value ? '#4a3b8c' : '#95a5a6'">
          {{ t.icon }}
        </v-icon>
        <span>{{ t.label }}</span>
      </button>
    </nav>

    <!-- BOOKING DETAIL MODAL -->
    <div v-if="selected" class="modal-backdrop" @click.self="selected = null">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">{{ selected.child_name || 'Session' }}</div>
          <button class="modal-close" @click="selected = null" aria-label="Close">
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

        <div class="modal-actions">
          <button v-if="selected.status === 'pending'" class="btn-primary" :disabled="acting" @click="setStatus(selected, 'confirmed')">Confirm</button>
          <button v-if="selected.status === 'confirmed'" class="btn-primary" :disabled="acting" @click="setStatus(selected, 'completed')">Mark complete</button>
          <button v-if="selected.status === 'confirmed'" class="btn-danger" :disabled="acting" @click="setStatus(selected, 'no_show')">No-show</button>
          <button class="btn-secondary" @click="openBookingDetail(selected)">
            <v-icon x-small class="mr-1">mdi-open-in-new</v-icon>
            Full page
          </button>
          <button class="btn-secondary" @click="selected = null">Close</button>
        </div>
      </div>
    </div>

    <!-- SERVICE MODAL -->
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
          <select
            v-model="serviceModal.type"
            class="text-input"
            :disabled="serviceModal.saving"
          >
            <option value="">Select a service</option>
            <option v-for="s in serviceTypes" :key="s" :value="s">{{ s }}</option>
          </select>

          <!-- Custom name when "Other" is selected -->
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
          <textarea v-model.trim="serviceModal.description" rows="3" class="text-input textarea" :disabled="serviceModal.saving"></textarea>

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

        <div class="modal-actions">
          <button class="btn-secondary" :disabled="serviceModal.saving" @click="closeServiceModal">Cancel</button>
          <button class="btn-primary" :disabled="!canSaveService || serviceModal.saving" @click="saveService">
            {{ serviceModal.saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- AVAILABILITY MODAL -->
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

        <div class="modal-actions">
          <button class="btn-secondary" @click="closeAvailModal">Cancel</button>
          <button class="btn-primary" :disabled="availModal.saving" @click="saveAvail">
            {{ availModal.saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE SERVICE CONFIRM -->
    <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <h3 class="modal-title">Delete service?</h3>
        <p class="modal-text">
          <strong>{{ deleteTarget.type }}</strong> will be removed from your profile.
          Existing bookings aren't affected.
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn-danger" :disabled="deleting" @click="deleteService">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE AVAILABILITY CONFIRM -->
    <div v-if="deleteAvailTarget" class="modal-backdrop" @click.self="deleteAvailTarget = null">
      <div class="modal modal-sm">
        <h3 class="modal-title">Remove slot?</h3>
        <p class="modal-text">
          {{ dayName(deleteAvailTarget.day_of_week) }} ·
          {{ shortTimeStr(deleteAvailTarget.start_time) }} – {{ shortTimeStr(deleteAvailTarget.end_time) }}
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteAvailTarget = null">Cancel</button>
          <button class="btn-danger" :disabled="deleting" @click="deleteAvail">
            {{ deleting ? 'Removing…' : 'Remove' }}
          </button>
        </div>
      </div>
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
      loadedTabs: {},

      activeTab: 'home',
      tabs: [
        { value: 'home',         label: 'Home',         icon: 'mdi-home-variant-outline' },
        { value: 'bookings',     label: 'Bookings',     icon: 'mdi-calendar-month-outline' },
        { value: 'services',     label: 'Services',     icon: 'mdi-tag-outline' },
        { value: 'availability', label: 'Availability', icon: 'mdi-calendar-clock' },
        { value: 'profile',      label: 'Profile',      icon: 'mdi-account-outline' }
      ],
      bottomTabs: [
        { value: 'home',     label: 'Home',     icon: 'mdi-home-variant-outline' },
        { value: 'bookings', label: 'Bookings', icon: 'mdi-calendar-month-outline' },
        { value: 'services', label: 'Services', icon: 'mdi-tag-outline' },
        { value: 'profile',  label: 'Profile',  icon: 'mdi-account-outline' }
      ],

      bookingFilter: 'upcoming',
      bookingFilters: [
        { value: 'upcoming',  label: 'Upcoming' },
        { value: 'pending',   label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'all',       label: 'All' }
      ],

      user: null,
      pro: null,
      bookings: [],
      services: [],
      availability: [],

      form: {
        type: '', bio: '', languages: [], county: '', area: '',
        online: true, years_experience: null, price_min: null, price_max: null
      },

      saveError: '',
      saveSuccess: '',
      saving: false,

      selected: null,
      acting: false,

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

    // Topbar avatar — no arguments
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
    const qTab = this.$route.query.tab;
    const valid = ['home', 'bookings', 'services', 'availability', 'profile'];
    if (valid.includes(qTab)) this.activeTab = qTab;
    this.loadAll();
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
  },

  methods: {
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
      if ((tab === 'services' || tab === 'availability') && !this.loadedTabs[tab]) {
        this.loadServices();
        this.loadAvailability();
      }
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
        setTimeout(() => { this.copied = false; }, 1500);
      } catch (e) {
        console.warn('[copyUid]', e);
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

        const [meRes, proRes, bookRes] = await Promise.all([
          axios.get(`${API}/api/users/me`, { headers }),
          axios.get(`${API}/api/professionals/me/profile`, { headers }).catch(() => ({ data: { data: null } })),
          axios.get(`${API}/api/bookings/assigned`, { headers }).catch(() => ({ data: { data: [] } }))
        ]);

        this.user = meRes.data?.data || null;
        this.pro = proRes.data?.data || null;
        this.bookings = bookRes.data?.data || [];

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
      this.saveSuccess = '';
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
        this.saveSuccess = 'Profile updated.';
        setTimeout(() => { this.saveSuccess = ''; }, 3000);
      } catch (err) {
        this.saveError = err.response?.data?.message || err.response?.data?.error || 'Could not save.';
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
      } catch (err) {
        alert(`Could not update. ${err.response?.data?.error || 'Try again.'}`);
      } finally {
        this.acting = false;
      }
    },

    openServiceModal(s = null) {
      const existingType = s?.type || '';
      // Preset match: exact string match against serviceTypes
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
      } catch (err) {
        alert('Could not update.');
      } finally {
        this.toggling = null;
      }
    },

    async deleteService() {
      if (!this.deleteTarget) return;
      const id = this.deleteTarget.id;
      this.deleting = id;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/services/${id}`, { headers });
        this.services = this.services.filter((s) => s.id !== id);
        this.deleteTarget = null;
      } catch (err) {
        alert('Could not delete.');
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
      } catch (err) {
        this.availModal.error = err.response?.data?.error || 'Could not save.';
      } finally {
        this.availModal.saving = false;
      }
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
      } catch (err) {
        alert('Could not remove.');
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
      try {
        const r = this.$router.push('/login');
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch (e) {}
    },

    // Takes a name — used for client cards
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
    }
  }
};
</script>

<style scoped>
/* ============================================================
   LAYOUT
   ============================================================ */
.pro-dashboard {
  min-height: 100vh;
  background: #f3f7fb;
  padding-bottom: 100px;
}

/* TOP BAR */
.topbar {
  position: sticky; top: 0; z-index: 40;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  height: 64px; padding: 0 16px;
  display: flex; align-items: center; justify-content: space-between;
}
@media (min-width: 768px) { .topbar { padding: 0 32px; } }
.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-mark {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  display: grid; place-items: center;
}
.brand-name { font-size: 16px; font-weight: 800; color: #2c3e50; letter-spacing: -0.02em; }
.brand-dot { color: #e86a8a; }
.topbar-actions { display: flex; align-items: center; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
  transition: background 0.15s ease;
}
.icon-btn:hover { background: #e6eef5; }
.user-menu-wrap { position: relative; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #e86a8a, #f48fb1);
  color: #ffffff; border: none; font-weight: 800; font-size: 13px;
  cursor: pointer; letter-spacing: 0.3px;
}
.user-menu {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 240px;
  background: #ffffff; border: 1px solid #ececf1; border-radius: 14px;
  box-shadow: 0 20px 40px -12px rgba(44, 62, 80, 0.18);
  overflow: hidden; z-index: 50;
}
.user-menu-head { padding: 14px 16px; border-bottom: 1px solid #f0f0f5; }
.user-menu-name { font-size: 0.88rem; font-weight: 800; color: #2c3e50; }
.user-menu-email {
  font-size: 0.76rem; color: #7f8c8d; margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.role-badge {
  display: inline-block; margin-top: 8px;
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.4px;
  text-transform: uppercase; padding: 3px 8px; border-radius: 999px;
  background: #fce4ec; color: #c2185b;
}
.user-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 12px 16px; background: transparent; border: none;
  text-align: left; font-size: 0.86rem; color: #2c3e50; cursor: pointer;
  font-family: inherit;
}
.user-menu-item:hover { background: #f7f8fb; }
.user-menu-item.danger { color: #e74c3c; }

/* TABS */
.tabs {
  position: sticky; top: 64px; z-index: 30;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  padding: 0 8px; display: flex; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 14px 16px; border: none; background: transparent;
  font-size: 0.82rem; font-weight: 700; color: #7f8c8d;
  border-bottom: 2px solid transparent; cursor: pointer;
  font-family: inherit; white-space: nowrap;
  transition: all 0.15s ease;
}
.tab:hover { color: #4a3b8c; }
.tab.active { color: #4a3b8c; border-bottom-color: #4a3b8c; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px; background: #e86a8a; color: #ffffff;
  font-size: 0.62rem; font-weight: 800; margin-left: 4px;
}
.tab:not(.active) .tab-badge { background: #e6e0f5; color: #4a3b8c; }

/* MAIN */
.main { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 768px) { .main { padding: 32px 32px; } }

.greeting { margin-bottom: 20px; }
.greeting h1 {
  font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em;
  color: #2c3e50; margin: 0 0 6px;
}
.greeting p { font-size: 0.95rem; color: #7f8c8d; margin: 0; }

.loading {
  display: flex; align-items: center; gap: 12px;
  padding: 60px 0; justify-content: center;
  color: #7f8c8d; font-size: 0.9rem;
}

/* ERROR */
.error-card {
  background: #ffffff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon {
  width: 84px; height: 84px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 20px;
}
.error-card h2 { font-size: 1.2rem; font-weight: 800; color: #2c3e50; margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 24px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 20px; }

/* VERIFY BANNER */
.verify-card {
  display: flex; align-items: center; gap: 14px;
  border-radius: 16px; padding: 16px 18px; margin-bottom: 20px;
  border: 1px solid;
}
.verify-amber  { background: #fef3e0; border-color: #f8d7a1; }
.verify-red    { background: #fdecea; border-color: #f5c2bd; }
.verify-purple { background: #e6e0f5; border-color: #c8b8e8; }
.verify-green  { background: #e6f9ee; border-color: #a7e3c0; }
.verify-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  display: grid; place-items: center; flex: 0 0 auto;
}
.verify-body { flex: 1; min-width: 0; }
.verify-title { font-size: 0.92rem; font-weight: 800; color: #2c3e50; margin-bottom: 2px; }
.verify-text { font-size: 0.8rem; color: #7f8c8d; line-height: 1.5; }
.verify-btn {
  padding: 9px 16px; border-radius: 10px; border: none;
  background: #4a3b8c; color: #ffffff;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  font-family: inherit; white-space: nowrap;
}
.verify-btn:hover { background: #3f327a; }

.verify-mini {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; border-radius: 12px;
  border: 1px solid;
}
.verify-mini .verify-mini-title { font-size: 0.88rem; font-weight: 800; color: #2c3e50; margin-bottom: 2px; }
.verify-mini .verify-mini-text { font-size: 0.8rem; color: #7f8c8d; line-height: 1.5; }

/* EMPTY */
.empty-card {
  background: #ffffff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #ececf1;
  max-width: 520px; margin: 24px auto;
}
.empty-icon {
  width: 84px; height: 84px; border-radius: 50%; background: #e6e0f5;
  display: grid; place-items: center; margin: 0 auto 20px;
}
.empty-card h2 { font-size: 1.2rem; font-weight: 800; color: #2c3e50; margin: 0 0 10px; }
.empty-card p { font-size: 0.9rem; color: #7f8c8d; line-height: 1.6; margin: 0; }

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 13px 24px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; border: none; border-radius: 12px;
  font-size: 0.92rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  transition: transform 0.15s ease; font-family: inherit;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #ffffff; color: #2c3e50;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-secondary:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.88rem; font-weight: 700; cursor: pointer;
  font-family: inherit;
}
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: #e74c3c; color: #ffffff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:hover:not(:disabled) { background: #c0392b; }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.add-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.92rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  margin-bottom: 20px; min-height: 50px;
}

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: #4a3b8c; font-weight: 700; font-size: 0.82rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 32px; }
.stat-card {
  background: #ffffff; border: 1px solid #ececf1; border-radius: 14px;
  padding: 16px 12px; text-align: center;
}
.stat-label {
  font-size: 0.68rem; font-weight: 700; color: #7f8c8d;
  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;
}
.stat-value {
  font-size: 1.8rem; font-weight: 900; color: #4a3b8c;
  line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums;
}
.stat-sub { font-size: 0.72rem; color: #95a5a6; margin-top: 4px; font-weight: 600; }

/* SECTIONS */
.section { margin-bottom: 32px; }
.section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 1.05rem; font-weight: 800; color: #2c3e50;
  margin: 0; letter-spacing: -0.01em;
}
.date-label { font-size: 0.78rem; color: #7f8c8d; font-weight: 600; }

/* TIMELINE */
.timeline { display: grid; gap: 8px; }
.timeline-item {
  display: flex; align-items: center; gap: 14px;
  background: #ffffff; border: 1px solid #ececf1;
  border-left-width: 4px; border-radius: 12px; padding: 12px 14px;
  cursor: pointer; transition: all 0.15s ease;
}
.timeline-item:hover { border-color: #c8c0e0; transform: translateX(2px); }
.timeline-item.status-amber { border-left-color: #b7791f; }
.timeline-item.status-green { border-left-color: #229954; }
.timeline-item.status-red   { border-left-color: #c0392b; }
.timeline-time {
  flex: 0 0 52px; text-align: center;
  padding: 6px 4px; background: #f3f7fb; border-radius: 10px;
}
.time-value {
  font-size: 0.92rem; font-weight: 800; color: #2c3e50;
  line-height: 1; letter-spacing: -0.02em;
}
.time-ampm {
  font-size: 0.62rem; font-weight: 800; color: #7f8c8d;
  letter-spacing: 0.5px; margin-top: 3px;
}
.timeline-body { flex: 1; min-width: 0; }
.timeline-title { font-size: 0.92rem; font-weight: 800; color: #2c3e50; margin-bottom: 2px; }
.timeline-sub { font-size: 0.76rem; color: #7f8c8d; margin-bottom: 4px; }
.timeline-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-item { display: inline-flex; align-items: center; font-size: 0.72rem; color: #7f8c8d; }

/* BOOKINGS */
.mini-empty {
  display: flex; align-items: center; padding: 20px;
  background: #ffffff; border: 1px dashed #d4dae4;
  border-radius: 14px; font-size: 0.86rem; color: #7f8c8d;
}
.booking-list { display: grid; gap: 10px; }
.booking-row {
  display: flex; align-items: center; gap: 14px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 14px; padding: 14px; cursor: pointer;
  transition: all 0.15s ease;
}
.booking-row:hover {
  border-color: #c8c0e0; transform: translateY(-1px);
  box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25);
}
.booking-date {
  flex: 0 0 52px; text-align: center;
  background: #f3f7fb; border-radius: 10px; padding: 8px 4px;
}
.booking-day {
  font-size: 1.15rem; font-weight: 900; color: #4a3b8c;
  line-height: 1; letter-spacing: -0.02em;
}
.booking-month {
  font-size: 0.62rem; font-weight: 800; color: #7f8c8d;
  letter-spacing: 1px; margin-top: 4px;
}
.booking-info { flex: 1; min-width: 0; }
.booking-title { font-size: 0.9rem; font-weight: 700; color: #2c3e50; margin-bottom: 2px; }
.booking-sub { font-size: 0.78rem; color: #7f8c8d; text-transform: capitalize; }

.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.66rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.3px; white-space: nowrap; flex: 0 0 auto;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

/* SUB TABS */
.sub-tabs {
  display: flex; gap: 4px; background: #ffffff;
  border: 1px solid #ececf1; border-radius: 12px;
  padding: 4px; margin-bottom: 16px;
  overflow-x: auto; scrollbar-width: none;
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex: 1; padding: 10px 12px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700;
  color: #7f8c8d; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all 0.15s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.sub-tab.active { background: #4a3b8c; color: #ffffff; }
.tab-badge-inline {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px; background: #e86a8a; color: #ffffff;
  font-size: 0.62rem; font-weight: 800;
}
.sub-tab:not(.active) .tab-badge-inline { background: #e6e0f5; color: #4a3b8c; }

/* CLIENTS */
.clients-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.client-card {
  display: flex; align-items: center; gap: 10px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 14px; padding: 12px;
}
.client-avatar {
  width: 40px; height: 40px; border-radius: 12px;
  color: #ffffff; display: grid; place-items: center;
  font-weight: 800; font-size: 13px; flex: 0 0 auto;
  letter-spacing: 0.3px;
}
.client-body { min-width: 0; flex: 1; }
.client-name {
  font-size: 0.86rem; font-weight: 800; color: #2c3e50;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.client-meta { font-size: 0.72rem; color: #7f8c8d; margin-top: 2px; }

/* SUMMARY (services) */
.summary-card {
  display: flex; align-items: center;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 16px; padding: 18px 12px; margin-bottom: 16px;
}
.summary-stat { flex: 1; text-align: center; }
.summary-value {
  font-size: 1.15rem; font-weight: 900; color: #4a3b8c;
  letter-spacing: -0.02em; line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.summary-label {
  font-size: 0.66rem; font-weight: 800; color: #95a5a6;
  text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;
}
.summary-divider { width: 1px; height: 30px; background: #ececf1; }

/* SERVICES */
.services-list { display: grid; gap: 12px; }
.service-card {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 16px; padding: 16px;
}
.service-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.service-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.service-body { flex: 1; min-width: 0; }
.service-name {
  font-size: 0.98rem; font-weight: 800; color: #2c3e50;
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
.chip-inactive { background: #ececf1; color: #7f8c8d; }
.service-desc {
  font-size: 0.84rem; color: #7f8c8d;
  line-height: 1.55; margin-bottom: 12px; padding-top: 4px;
}
.service-actions {
  display: flex; gap: 6px; padding-top: 12px;
  border-top: 1px solid #f0f0f5; flex-wrap: wrap;
}
.action-btn {
  display: inline-flex; align-items: center;
  padding: 8px 14px; border-radius: 10px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  color: #2c3e50; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s ease; font-family: inherit;
}
.action-btn:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn.danger:hover:not(:disabled) { border-color: #e74c3c; background: #fdecea; }

/* AVAILABILITY */
.avail-list { display: grid; gap: 10px; }
.avail-row {
  display: flex; align-items: center; gap: 12px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 12px; padding: 12px 14px;
}
.avail-day {
  flex: 0 0 90px; font-size: 0.85rem; font-weight: 800; color: #2c3e50;
}
.avail-time {
  flex: 1; font-size: 0.82rem; color: #4a5568; font-weight: 600;
}
.avail-loc {
  font-size: 0.72rem; color: #7f8c8d; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.icon-sm {
  width: 34px; height: 34px; border-radius: 10px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  cursor: pointer; display: grid; place-items: center;
}
.icon-sm:hover { border-color: #4a3b8c; }
.icon-sm.danger:hover { border-color: #e74c3c; }

/* TIP */
.tip-box {
  display: flex; align-items: flex-start; gap: 8px;
  background: #e6e0f5; border-radius: 12px;
  padding: 12px 14px; font-size: 0.82rem;
  color: #4a3b8c; line-height: 1.55; margin-top: 16px;
}

/* CARD */
.card {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 18px; padding: 20px; margin-bottom: 16px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: #2c3e50;
  margin: 0 0 16px; letter-spacing: -0.01em;
}

/* IDENTITY ROWS */
.identity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f9fafc;
  border: 1px solid #f0f0f5;
  border-radius: 12px;
}
.identity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e6e0f5;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.identity-body { flex: 1; min-width: 0; }
.identity-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}
.identity-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.copy-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  transition: all 0.15s ease;
}
.copy-btn:hover:not(:disabled) {
  border-color: #4a3b8c;
  background: #f7f5fd;
}
.copy-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* FORM */
.field-label {
  display: block; font-size: 0.82rem; font-weight: 700;
  color: #2c3e50; margin-bottom: 8px;
}
.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #ffffff; color: #2c3e50;
  outline: none; font-family: inherit;
  -webkit-appearance: none; appearance: none;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
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
  border: 1.5px solid #e0e4eb; background: #ffffff;
  color: #2c3e50; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; font-family: inherit; min-height: 40px;
}
.chip.active { background: #4a3b8c; color: #ffffff; border-color: #4a3b8c; }

.budget-row { display: flex; align-items: center; gap: 10px; }
.budget-row .text-input { flex: 1; }
.budget-sep { color: #7f8c8d; font-weight: 700; }

.field-row { display: flex; gap: 10px; }
.field-col { flex: 1; }

.hint { font-size: 0.78rem; color: #95a5a6; margin: 8px 0 0; }

.error-box, .success-box {
  padding: 12px 14px; border-radius: 10px;
  font-size: 0.83rem; font-weight: 500; line-height: 1.45;
}
.error-box { background: #fdecea; color: #c0392b; }
.success-box { background: #e6f9ee; color: #229954; }

/* PRESETS */
.preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
.preset-chip {
  padding: 7px 12px; border-radius: 999px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  color: #4a3b8c; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.preset-chip:hover { border-color: #4a3b8c; background: #f7f5fd; }

/* BOTTOM NAV */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 68px; background: #ffffff;
  border-top: 1px solid #ececf1;
  display: flex; align-items: center; justify-content: space-around;
  z-index: 30; padding-bottom: env(safe-area-inset-bottom, 0);
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: transparent; border: none; cursor: pointer;
  color: #95a5a6; font-size: 0.68rem; font-weight: 700;
  font-family: inherit; padding: 6px 12px;
  transition: color 0.15s ease;
}
.nav-item.active, .nav-item:hover { color: #4a3b8c; }

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #ffffff; border-radius: 20px; padding: 22px;
  max-width: 460px; width: 100%; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
.modal-sm { max-width: 380px; text-align: center; }
.modal-sm .modal-actions { justify-content: center; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.modal-title { font-size: 1.05rem; font-weight: 800; color: #2c3e50; margin: 0 0 4px; }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-text { font-size: 0.88rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 22px; }
.modal-body {
  display: grid; gap: 12px; margin-bottom: 16px;
  padding-bottom: 16px; border-bottom: 1px solid #f0f0f5;
}
.modal-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
}
.modal-label {
  font-size: 0.76rem; font-weight: 700; color: #7f8c8d;
  text-transform: uppercase; letter-spacing: 0.4px; flex: 0 0 auto;
}
.modal-value {
  font-size: 0.88rem; color: #2c3e50; font-weight: 600;
  text-align: right; flex: 1; min-width: 0; word-break: break-word;
}
.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
}

/* RESPONSIVE */
@media (min-width: 768px) {
  .pro-dashboard { padding-bottom: 48px; }
  .bottom-nav { display: none; }
}
@media (max-width: 599px) {
  .main { padding: 20px 14px; }
  .greeting h1 { font-size: 1.4rem; }
  .stat-value { font-size: 1.5rem; }
  .verify-card { flex-direction: column; align-items: stretch; text-align: center; }
  .verify-icon { margin: 0 auto; }
  .verify-btn { width: 100%; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
  .field-row { flex-direction: column; gap: 0; }
  .field-col + .field-col { margin-top: 18px; }
  .avail-row { flex-wrap: wrap; }
  .avail-day { flex: 0 0 100%; }
}
</style>