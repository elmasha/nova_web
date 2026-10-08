<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <v-btn icon class="back-btn" @click="$router.push('/dashboard')">
          <v-icon class="mr-2">mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1>Analytics & Reports</h1>
          <p class="subtitle">
            <v-icon small class="mr-1">mdi-calendar</v-icon>
            {{ periodLabel }}
            <span v-if="branches.length === 1" class="ml-2 grey--text text--darken-1">
              · {{ branches[0].name }}
            </span>
          </p>
        </div>
      </div>
      <div class="header-right">
        <!-- Branch selector: only show when 2+ branches (owner on Pro/Business with multiple branches) -->
        <select
          v-if="branches.length > 1"
          v-model="selectedBranch"
          class="branch-select"
        >
          <option v-for="b in branches" :key="b.id" :value="Number(b.id)">
            {{ b.name }}
          </option>
        </select>
        <span v-else-if="branches.length === 1" class="branch-name-label">
          <v-icon small class="mr-1">mdi-store</v-icon>
          {{ branches[0].name }}
        </span>

        <select v-model="selectedPeriod" class="period-select">
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
        </select>
        <v-btn icon class="refresh-btn" @click="loadAll" :class="{ spinning: loading }">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Period Tabs -->
    <div class="period-tabs">
      <button
        v-for="p in [{v:'7',l:'7 Days'},{v:'30',l:'30 Days'},{v:'90',l:'90 Days'}]"
        :key="p.v"
        :class="['tab-btn', { active: selectedPeriod === p.v }]"
        @click="selectedPeriod = p.v"
      >
        {{ p.l }}
      </button>
    </div>

    <!-- Paywall -->
    <div v-if="!subActive" class="paywall">
      <v-icon large color="error">mdi-lock</v-icon>
      <h2>Reports & Analytics Locked</h2>
      <p>
        Upgrade to <strong>Starter</strong>, <strong>Business</strong> or
        <strong>Pro</strong> to unlock detailed reports, profit analysis, waste
        tracking and more.
      </p>
      <v-btn color="error" large class="mt-4" @click="$router.push('/subscription')">
        View Plans
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading reports...</p>
    </div>

    <!-- No branch selected / no data -->
    <div v-else-if="!selectedBranch" class="empty-state-page">
      <v-icon size="56" color="grey lighten-2">mdi-store-off</v-icon>
      <h3>No branch available</h3>
      <p>You need at least one branch to view reports.</p>
    </div>

    <template v-else>
      <!-- ===== KPI CARDS ===== -->
      <div class="cards-grid">
        <!-- Revenue -->
        <div v-if="canViewBasicReports" class="metric-card revenue">
          <div class="card-header">
            <div class="icon-wrap"><v-icon>mdi-cash-multiple</v-icon></div>
            <span
              v-if="hasComparativeData && canViewAdvancedAnalytics"
              class="change-badge"
              :class="getChangeClass('actual_revenue')"
            >
              <v-icon small>{{ getChangeIcon('actual_revenue') }}</v-icon>
              {{ Math.abs(parseFloat(comparative.changes.actual_revenue) || 0) }}%
            </span>
            <span v-else class="change-badge neutral">—</span>
          </div>
          <div class="card-body">
            <h3>Revenue</h3>
            <div class="amount">{{ formatCurrency(comparative.thisMonth.actual_revenue) }}</div>
            <p class="vs-text">
              {{ hasComparativeData ? 'vs last month' : 'No comparison data' }}
            </p>
            <div v-if="hasRevenueVariance && canViewAdvancedReports" class="sub-note">
              Expected: {{ formatCurrency(comparative.thisMonth.expected_revenue) }}
            </div>
          </div>
        </div>
        <div v-else class="metric-card locked">
          <div class="locked-content">
            <v-icon large>mdi-lock</v-icon>
            <p>Revenue</p>
            <small>Starter plan & above</small>
          </div>
        </div>

        <!-- Net Profit -->
        <div v-if="canViewProfitAnalysis" class="metric-card profit">
          <div class="card-header">
            <div class="icon-wrap"><v-icon>mdi-chart-line</v-icon></div>
            <span
              v-if="hasComparativeData && canViewAdvancedAnalytics"
              class="change-badge"
              :class="getChangeClass('actual_profit')"
            >
              <v-icon small>{{ getChangeIcon('actual_profit') }}</v-icon>
              {{ Math.abs(parseFloat(comparative.changes.actual_profit) || 0) }}%
            </span>
            <span v-else class="change-badge neutral">—</span>
          </div>
          <div class="card-body">
            <h3>Net Profit</h3>
            <div class="amount" :class="getAmountClass(comparative.thisMonth.actual_profit)">
              {{ formatCurrency(comparative.thisMonth.actual_profit) }}
            </div>
            <p class="vs-text">
              {{ hasComparativeData ? 'vs last month' : 'No comparison data' }}
            </p>
            <div v-if="hasProfitVariance && canViewAdvancedReports" class="sub-note">
              Expected: {{ formatCurrency(comparative.thisMonth.expected_profit) }}
            </div>
          </div>
        </div>
        <div v-else class="metric-card locked">
          <div class="locked-content">
            <v-icon large>mdi-lock</v-icon>
            <p>Net Profit</p>
            <small>Business plan & above</small>
          </div>
        </div>

        <!-- Volume -->
        <div v-if="canViewBasicReports" class="metric-card volume">
          <div class="card-header">
            <div class="icon-wrap"><v-icon>mdi-weight-kilogram</v-icon></div>
            <span
              v-if="hasComparativeData && canViewAdvancedAnalytics"
              class="change-badge"
              :class="getChangeClass('sold')"
            >
              <v-icon small>{{ getChangeIcon('sold') }}</v-icon>
              {{ Math.abs(parseFloat(comparative.changes.sold) || 0) }}%
            </span>
            <span v-else class="change-badge neutral">—</span>
          </div>
          <div class="card-body">
            <h3>Volume Sold</h3>
            <div class="amount">{{ formatNumber(comparative.thisMonth.sold) }} kg</div>
            <p class="vs-text">
              {{ hasComparativeData ? 'vs last month' : 'No comparison data' }}
            </p>
          </div>
        </div>
        <div v-else class="metric-card locked">
          <div class="locked-content">
            <v-icon large>mdi-lock</v-icon>
            <p>Volume Sold</p>
            <small>Starter plan & above</small>
          </div>
        </div>

        <!-- Waste Rate -->
        <div v-if="canViewWaste" class="metric-card waste">
          <div class="card-header">
            <div class="icon-wrap"><v-icon>mdi-delete-outline</v-icon></div>
            <span
              v-if="hasComparativeData && canViewAdvancedAnalytics"
              class="change-badge"
              :class="getWasteChangeClass()"
            >
              <v-icon small>{{ getWasteChangeIcon() }}</v-icon>
              {{ Math.abs(parseFloat(comparative.changes.waste) || 0) }}%
            </span>
            <span v-else class="change-badge neutral">—</span>
          </div>
          <div class="card-body">
            <h3>Waste Rate</h3>
            <div class="amount" :class="wasteAmountClass">
              {{ wasteRatePct }}%
            </div>
            <p class="vs-text">{{ wasteStatusLabel }}</p>
            <div class="sub-note">
              Total Waste Cost: {{ formatCurrency(wasteTotalValue) }} • {{ wasteTotalKg }} kg / {{ wasteDaysCount }} days
            </div>
          </div>
        </div>
        <div v-else class="metric-card locked">
          <div class="locked-content">
            <v-icon large>mdi-lock</v-icon>
            <p>Waste Rate</p>
            <small>Business plan & above</small>
          </div>
        </div>
      </div>

      <!-- Variance Alert -->
      <div
        v-if="showVarianceAlert && canViewAdvancedReports"
        class="variance-alert"
        :class="revenueVariance > 0 ? 'warning' : 'success'"
      >
        <div class="alert-icon">
          <v-icon>{{ revenueVariance > 0 ? 'mdi-alert' : 'mdi-check-circle' }}</v-icon>
        </div>
        <div class="alert-content">
          <h4>
            {{ revenueVariance > 0 ? 'Revenue Shortfall Detected' : 'Revenue Surplus — Looking Good!' }}
          </h4>
          <p>
            Expected: {{ formatCurrency(comparative.thisMonth.expected_revenue) }}
            | Actual: {{ formatCurrency(comparative.thisMonth.actual_revenue) }}
            <strong>
              {{ revenueVariance > 0 ? 'Shortfall' : 'Surplus' }}:
              {{ formatCurrency(Math.abs(revenueVariance)) }}
            </strong>
          </p>
        </div>
      </div>

      <!-- ===== CHARTS ===== -->
      <div class="charts-row">
        <!-- Profit Trend -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3><v-icon left color="error">mdi-chart-bar</v-icon> Profit Trend</h3>
              <p class="chart-subtitle">
                Daily actual profit/loss (payments minus costs)
                <span v-if="hasProfitTrend">
                  · {{ formatDate(profitTrend[0]?.date) }} → {{ formatDate(profitTrend[profitTrend.length - 1]?.date) }}
                </span>
              </p>
            </div>
            <span class="chart-badge">Daily</span>
          </div>
          <div class="chart-body">
            <div v-if="!canViewProfitAnalysis" class="locked-section">
              <v-icon large>mdi-lock</v-icon>
              <p>Profit Trend requires <strong>Business</strong> plan or higher</p>
            </div>
            <div v-else-if="!hasProfitTrend" class="empty-state">
              <v-icon large color="grey lighten-2">mdi-chart-bar</v-icon>
              <p>No data for the selected period</p>
              <small>Try expanding the date range above</small>
            </div>
            <div v-else class="bar-chart">
              <div
                v-for="(item, i) in profitTrend"
                :key="i"
                class="bar-item"
                :class="getProfitTrendClass(item)"
              >
                <div class="bar-label">{{ formatDateShort(item.date) }}</div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ height: getBarHeight(item) + '%' }"></div>
                </div>
                <div class="bar-value" :class="getProfitTrendValueClass(item)">
                  {{ formatCurrencyCompact(getProfitTrendValue(item)) }}
                </div>
              </div>
            </div>
            <div v-if="hasProfitTrend && canViewProfitAnalysis" class="chart-legend">
              <span><i class="dot profit"></i> Profit</span>
              <span><i class="dot loss"></i> Loss</span>
            </div>
          </div>
        </div>

        <!-- Best Days -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3><v-icon left color="error">mdi-calendar-check</v-icon> Best Days</h3>
              <p class="chart-subtitle">Performance by day of week</p>
            </div>
          </div>
          <div class="chart-body">
            <div v-if="!canViewBasicReports" class="locked-section">
              <v-icon large>mdi-lock</v-icon>
              <p>Best Days requires <strong>Starter</strong> plan or higher</p>
            </div>
            <div v-else-if="!hasDayOfWeek" class="empty-state">
              <v-icon large color="grey lighten-2">mdi-calendar</v-icon>
              <p>No data for the selected period</p>
              <small>Try expanding to 90 days</small>
            </div>
            <div v-else class="best-days-list">
              <div v-for="(day, i) in sortedDays" :key="i" class="day-row">
                <div class="day-info">
                  <span
                    class="day-dot"
                    :style="{ background: dayColors[i % dayColors.length] }"
                  ></span>
                  <span class="day-name">{{ day.day_name }}</span>
                </div>
                <div class="day-metrics">
                  <div class="metric">
                    <span class="metric-label">Avg Actual</span>
                    <span class="metric-value">
                      {{ formatCurrency(day.avg_actual_revenue || day.avg_revenue || 0) }}
                    </span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Margin</span>
                    <span class="metric-value" :class="getMarginClass(day)">
                      {{ formatMargin(
                          day.avg_actual_profit || day.avg_profit,
                          day.avg_actual_revenue || day.avg_revenue
                      ) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== ANALYTICS ===== -->
      <div class="analytics-row">
        <!-- Waste Analysis -->
        <div class="analytics-card">
          <div class="card-header-flex">
            <div>
              <h3><v-icon left color="error">mdi-delete-outline</v-icon> Waste Analysis</h3>
              <p class="card-subtitle">Cost of spoilage & trimmings</p>
            </div>
            <span v-if="canViewWaste" class="badge" :class="wasteBadgeClass">
              {{ wasteRatePct }}% avg
            </span>
          </div>

          <div v-if="!canViewWaste" class="locked-section">
            <v-icon large>mdi-lock</v-icon>
            <p>Waste Analysis requires <strong>Business</strong> plan or higher</p>
          </div>
          <template v-else>
            <div class="waste-total">
              <span>Total Waste Cost</span>
              <strong>{{ formatCurrency(wasteData.totalWasteCost) }}</strong>
            </div>
            <div class="waste-total">
              <span>Total Waste Volume</span>
              <strong class="neutral-strong">
                {{ wasteTotalKg }} kg over {{ wasteDaysCount }} days
              </strong>
            </div>

            <div class="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Waste (kg)</th>
                    <th>%</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in wasteData.data" :key="i">
                    <td>{{ formatDate(item.date) }}</td>
                    <td>{{ item.waste_kg }} kg</td>
                    <td>
                      <span class="pct-badge" :class="getWasteBadgeClass(item.waste_pct)">
                        {{ parseFloat(item.waste_pct || 0).toFixed(1) }}%
                      </span>
                    </td>
                    <td>{{ formatCurrency(item.waste_cost) }}</td>
                  </tr>
                  <tr v-if="!wasteData.data || wasteData.data.length === 0">
                    <td colspan="4" class="empty-cell">No waste data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>

        <!-- Payment Mix -->
        <div class="analytics-card">
          <div class="card-header-flex">
            <div>
              <h3><v-icon left color="error">mdi-credit-card-outline</v-icon> Payment Mix</h3>
              <p class="card-subtitle">M-Pesa vs Cash breakdown</p>
            </div>
            <span v-if="canViewBasicReports && paymentMix.data.length > 0" class="badge mpesa">
              {{ paymentMix.avgMpesaPct || 0 }}% M-Pesa
            </span>
          </div>

          <div v-if="!canViewBasicReports" class="locked-section">
            <v-icon large>mdi-lock</v-icon>
            <p>Payment Mix requires <strong>Starter</strong> plan or higher</p>
          </div>
          <div v-else-if="paymentMix.data.length === 0" class="empty-state small">
            <v-icon size="40" color="grey lighten-2">mdi-cash-remove</v-icon>
            <p>No payment data for this period</p>
          </div>
          <template v-else>
            <div class="payment-donuts">
              <div class="donut-wrap">
                <div class="donut" :style="donutStyleMpesa">
                  <span class="donut-label">{{ paymentMix.avgMpesaPct || 0 }}%</span>
                </div>
                <span class="donut-name">M-Pesa</span>
                <span class="donut-amount">{{ formatCurrency(paymentMix.totalMpesa) }}</span>
              </div>
              <div class="donut-wrap">
                <div class="donut" :style="donutStyleCash">
                  <span class="donut-label">{{ cashPct }}%</span>
                </div>
                <span class="donut-name">Cash</span>
                <span class="donut-amount">{{ formatCurrency(paymentMix.totalCash) }}</span>
              </div>
            </div>
            <div v-if="showPaymentVariance" class="variance-mini">
              <v-icon small color="orange darken-2">mdi-alert-circle</v-icon>
              Revenue variance: {{ formatCurrency(paymentMix.revenueVariance) }}
            </div>
            <div class="data-table compact">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>M-Pesa</th>
                    <th>Cash</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in paymentMix.data" :key="i">
                    <td>{{ formatDate(item.date) }}</td>
                    <td class="mpesa">{{ formatCurrency(item.payment_mpesa) }}</td>
                    <td class="cash">{{ formatCurrency(item.payment_cash) }}</td>
                    <td>
                      <strong>{{ formatCurrency(getItemActualRevenue(item)) }}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>

      <!-- ===== EXPENSE BREAKDOWN ===== -->
      <div class="expense-card">
        <div class="card-header-flex">
          <div>
            <h3><v-icon left color="error">mdi-receipt</v-icon> Expense Breakdown</h3>
            <p class="card-subtitle">Where your money goes</p>
          </div>
          <span v-if="canViewBasicReports" class="total-expense">
            {{ formatCurrency(expenseData.grandTotal) }}
          </span>
        </div>

        <div v-if="!canViewBasicReports" class="locked-section">
          <v-icon large>mdi-lock</v-icon>
          <p>Expense Breakdown requires <strong>Starter</strong> plan or higher</p>
        </div>
        <div v-else-if="expenseData.data.length === 0" class="empty-state small">
          <v-icon size="40" color="grey lighten-2">mdi-receipt-text-off</v-icon>
          <p>No expense data for this period</p>
        </div>
        <div v-else class="expense-grid">
          <div class="expense-bars">
            <div v-for="(item, i) in expenseData.data" :key="i" class="expense-bar-item">
              <div class="expense-info">
                <span
                  class="expense-dot"
                  :style="{ background: expenseColors[i % expenseColors.length] }"
                ></span>
                <span class="expense-name">{{ item.title }}</span>
                <span class="expense-count">{{ item.count }}x</span>
              </div>
              <div class="expense-bar-track">
                <div
                  class="expense-bar-fill"
                  :style="{
                    width: (item.pct || 0) + '%',
                    background: expenseColors[i % expenseColors.length],
                  }"
                ></div>
              </div>
              <div class="expense-amount">{{ formatCurrency(item.total) }}</div>
            </div>
          </div>
          <div class="expense-table-wrap">
            <table class="expense-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>%</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in expenseData.data" :key="i">
                  <td>
                    <span
                      class="dot-sm"
                      :style="{ background: expenseColors[i % expenseColors.length] }"
                    ></span>
                    {{ item.title }}
                  </td>
                  <td>{{ formatCurrency(item.total) }}</td>
                  <td><span class="pct-badge">{{ item.pct || 0 }}%</span></td>
                  <td>{{ formatCurrency(item.avg_amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== DAILY SUMMARY ===== -->
      <div class="summary-card">
        <div class="card-header-flex">
          <div>
            <h3><v-icon left color="error">mdi-table</v-icon> Daily Summary</h3>
            <p class="card-subtitle">
              Complete daily records ({{ dailySummary.length }} days)
            </p>
          </div>
          <v-btn
            v-if="canViewAdvancedReports"
            text
            small
            color="error"
            class="export-btn"
            @click="exportCSV"
          >
            <v-icon left small>mdi-download</v-icon> Export CSV
          </v-btn>
        </div>

        <div v-if="!canViewBasicReports" class="locked-section">
          <v-icon large>mdi-lock</v-icon>
          <p>Daily Summary requires <strong>Starter</strong> plan or higher</p>
        </div>
        <template v-else>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Actual Revenue</th>
                  <th>Expected Revenue</th>
                  <th>Actual Profit</th>
                  <th>Margin</th>
                  <th>Sold</th>
                  <th>Waste %</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in paginatedSummary" :key="i">
                  <td>
                    <div class="date-cell">
                      <span class="date-day">{{ formatDay(item.date) }}</span>
                      <span class="date-full">{{ formatDate(item.date) }}</span>
                    </div>
                  </td>
                  <td>
                    <strong>{{
                      formatCurrency(item.actual_revenue || item.revenue)
                    }}</strong>
                  </td>
                  <td class="muted">
                    {{ formatCurrency(item.expected_revenue || item.revenue) }}
                  </td>
                  <td>
                    <span
                      class="chip"
                      :class="getAmountClass(item.actual_profit || item.profit)"
                    >
                      {{ formatCurrency(item.actual_profit || item.profit) }}
                    </span>
                  </td>
                  <td>
                    <span :class="getAmountClass(getItemMargin(item))">
                      {{ getItemMargin(item).toFixed(1) }}%
                    </span>
                  </td>
                  <td>{{ item.sold_kg || 0 }} kg</td>
                  <td>
                    <span class="waste-badge" :class="getWasteClass(item)">
                      {{ getWastePct(item) }}%
                    </span>
                  </td>
                </tr>
                <tr v-if="dailySummary.length === 0">
                  <td colspan="7" class="empty-cell">No daily records found</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" v-if="dailySummary.length > rowsPerPage">
            <span>
              Rows per page:
              <select v-model="rowsPerPage">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </span>
            <span>{{ paginationText }}</span>
            <div class="page-nav">
              <v-btn icon x-small :disabled="currentPage === 1" @click="currentPage--">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn
                icon
                x-small
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import apiClient from '../services/api'

export default {
  name: 'Reports',
  data() {
    return {
      loading: false,
      selectedBranch: null,
      selectedPeriod: '30',
      branches: [],
      user: null,
      userProfile: null,

      comparative: {
        thisMonth: { expected_revenue: 0, actual_revenue: 0, expected_profit: 0, actual_profit: 0, sold: 0, avg_waste: 0, expenses: 0 },
        lastMonth: { expected_revenue: 0, actual_revenue: 0, expected_profit: 0, actual_profit: 0, sold: 0, avg_waste: 0, expenses: 0 },
        changes: { expected_revenue: 0, actual_revenue: 0, expected_profit: 0, actual_profit: 0, sold: 0, waste: 0 }
      },

      profitTrend: [],
      dayOfWeek: [],

      wasteData: { data: [], avgWastePct: 0, totalWasteCost: 0, totalWasteKg: 0 },
      paymentMix: { data: [], totalCash: 0, totalMpesa: 0, totalActualRevenue: 0, totalExpectedRevenue: 0, avgMpesaPct: 0, revenueVariance: 0 },
      expenseData: { data: [], grandTotal: 0 },
      dailySummary: [],
      subData: null,
      subActive: false,
      features: [],

      currentPage: 1,
      rowsPerPage: 10,

      dayColors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
      expenseColors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
    };
  },

  computed: {
    periodLabel() {
      const map = { '7': 'Last 7 days', '30': 'Last 30 days', '90': 'Last 90 days' };
      return map[this.selectedPeriod] || 'Last 30 days';
    },

    hasComparativeData() {
      return (
        this.comparative &&
        this.comparative.thisMonth &&
        (this.comparative.thisMonth.actual_revenue > 0 ||
          this.comparative.thisMonth.expected_revenue > 0)
      );
    },

    revenueVariance() {
      if (!this.comparative || !this.comparative.thisMonth) return 0;
      return (
        (this.comparative.thisMonth.expected_revenue || 0) -
        (this.comparative.thisMonth.actual_revenue || 0)
      );
    },

    hasRevenueVariance() {
      return Math.abs(this.revenueVariance) > 0.01;
    },

    hasProfitVariance() {
      if (!this.comparative || !this.comparative.thisMonth) return false;
      return (
        Math.abs(
          (this.comparative.thisMonth.expected_profit || 0) -
            (this.comparative.thisMonth.actual_profit || 0)
        ) > 0.01
      );
    },

    showVarianceAlert() {
      return this.hasRevenueVariance && this.hasComparativeData;
    },

    hasProfitTrend() {
      return this.profitTrend && this.profitTrend.length > 0;
    },

    maxProfit() {
      if (!this.hasProfitTrend) return 1;
      const values = this.profitTrend.map((d) =>
        Math.abs(parseFloat(d.actual_profit || d.profit || 0))
      );
      return Math.max(...values, 1);
    },

    hasDayOfWeek() {
      return this.dayOfWeek && this.dayOfWeek.length > 0;
    },

    sortedDays() {
      if (!this.dayOfWeek) return [];
      return [...this.dayOfWeek].sort((a, b) => {
        const aRev = parseFloat(a.avg_actual_revenue || a.avg_revenue || 0);
        const bRev = parseFloat(b.avg_actual_revenue || b.avg_revenue || 0);
        return bRev - aRev;
      });
    },

    cashPct() {
      const mpesa = parseFloat(this.paymentMix.avgMpesaPct) || 0;
      return (100 - mpesa).toFixed(0);
    },

    donutStyleMpesa() {
      const pct = parseFloat(this.paymentMix.avgMpesaPct) || 0;
      return {
        background: `conic-gradient(#10b981 0% ${pct}%, #e5e7eb ${pct}% 100%)`
      };
    },

    donutStyleCash() {
      const pct = parseFloat(this.cashPct) || 0;
      return {
        background: `conic-gradient(#3b82f6 0% ${pct}%, #e5e7eb ${pct}% 100%)`
      };
    },

    showPaymentVariance() {
      return this.paymentMix && Math.abs(this.paymentMix.revenueVariance || 0) > 0.01;
    },

    // ── Waste computed properties ─────────────────────────────
    wasteRatePct() {
      return parseFloat(this.wasteData?.avgWastePct) || 0;
    },
    wasteTotalValue() {
      return parseFloat(this.wasteData?.totalWasteCost) || 0;
    },
    wasteTotalKg() {
      if (this.wasteData?.totalWasteKg) {
        return parseFloat(this.wasteData.totalWasteKg).toFixed(1);
      }
      return (this.wasteData?.data || [])
        .reduce((s, r) => s + (parseFloat(r.waste_kg) || 0), 0)
        .toFixed(1);
    },
    wasteDaysCount() {
      return this.wasteData?.data?.length || 0;
    },
    /**
     * Waste status thresholds:
     * ≤ 2% good | 2–5% warning | > 5% danger
     */
    wasteStatus() {
      const pct = this.wasteRatePct;
      if (pct <= 2) return { level: 'good',    label: 'Very good — tighter than most',        chip: 'waste-good' };
      if (pct <= 5) return { level: 'warning', label: 'Within normal range',                   chip: 'waste-warning' };
      return         { level: 'danger',  label: 'Above 5% — investigate immediately',          chip: 'waste-danger' };
    },
    wasteStatusLabel() {
      return this.wasteStatus.label;
    },
    wasteBadgeClass() {
      return this.wasteStatus.chip;
    },
    wasteAmountClass() {
      const level = this.wasteStatus.level;
      if (level === 'danger') return 'negative';
      if (level === 'warning') return 'warning-amount';
      return 'positive';
    },

    totalPages() {
      return Math.ceil((this.dailySummary || []).length / this.rowsPerPage);
    },

    paginatedSummary() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      return (this.dailySummary || []).slice(start, start + this.rowsPerPage);
    },

    paginationText() {
      const total = (this.dailySummary || []).length;
      if (total === 0) return '0 of 0';
      const start = (this.currentPage - 1) * this.rowsPerPage + 1;
      const end = Math.min(this.currentPage * this.rowsPerPage, total);
      return `${start}-${end} of ${total}`;
    },

    // ── Feature access helpers (exact-match) ──────────────────
    canViewBasicReports() {
      return this.hasFeature('Basic reports') || this.hasFeature('Advance reports');
    },
    canViewAdvancedReports() {
      return this.hasFeature('Advance reports') || this.hasFeature('Advanced analytics');
    },
    canViewProfitAnalysis() {
      return this.hasFeature('Profit Analysis') || this.hasFeature('Advance reports');
    },
    canViewWaste() {
      return this.hasFeature('Full stock management') || this.hasFeature('Advance reports');
    },
    canViewAdvancedAnalytics() {
      return this.hasFeature('Advanced analytics');
    }
  },

  watch: {
    selectedPeriod() { this.loadAll(); },
    selectedBranch() { this.loadAll(); }
  },

  mounted() {
    this.initReports();
  },

  methods: {
    async initReports() {
      try {
        const user = this.$fire?.auth?.currentUser;
        if (!user) {
          this.$router.push('/login');
          return;
        }
        this.user = user;

        await this.checkSubscription();

        const { data } = await apiClient.get(`/users/${user.uid}/profile`);
        this.userProfile = data;

        await this.loadBranches();

        if (this.selectedBranch) {
          await this.loadAll();
        } else {
          console.warn('No branch available for reports');
        }
      } catch (e) {
        console.error('Init error:', e);
      }
    },

    async checkSubscription() {
      try {
        const { data } = await apiClient.get(
          `/subscriptions/status?firebase_uid=${this.user.uid}`
        );
        this.subData = data;
        this.subActive = data?.is_active === true;
        this.features = this.parseFeatures(data?.subscription?.features);
      } catch (e) {
        console.error('Subscription check error:', e);
        this.subActive = false;
        this.features = [];
      }
    },

    /**
     * Exact-match feature check.
     * Pro plan unlocks everything.
     * Otherwise, the plan's features array must contain the exact string.
     */
    hasFeature(name) {
      if (!this.subActive) return false;

      const planName = (
        this.subData?.subscription?.plan_name ||
        this.subData?.subscription?.plan ||
        this.subData?.plan ||
        ''
      ).toString().toLowerCase().trim();

      if (planName === 'pro' || planName === 'professional') return true;

      const target = String(name).toLowerCase().trim();
      return this.features.some(
        (f) => String(f).toLowerCase().trim() === target
      );
    },

    parseFeatures(features) {
      if (!features) return [];
      if (typeof features === 'string') {
        try { return JSON.parse(features); } catch { return []; }
      }
      return Array.isArray(features) ? features : [];
    },

    async loadBranches() {
      try {
        if (!this.user?.uid) return;
        const { data } = await apiClient.get(
          `/branches/my?firebase_uid=${this.user.uid}`
        );
        this.branches = data || [];

        // Prefer the user's primary branch, else first available
        if (!this.selectedBranch && this.userProfile?.branch_id) {
          this.selectedBranch = Number(this.userProfile.branch_id);
        }
        if (!this.selectedBranch && this.branches.length > 0) {
          this.selectedBranch = Number(this.branches[0].id);
        }
      } catch (e) {
        console.error('Branches error:', e);
        this.branches = [];
      }
    },

    async loadAll() {
      if (!this.selectedBranch) {
        console.warn('No branch selected, skipping report load');
        return;
      }
      this.loading = true;
      try {
        await Promise.all([
          this.loadComparative(),
          this.loadProfitability(),
          this.loadWaste(),
          this.loadPaymentMix(),
          this.loadExpenses()
        ]);
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        this.loading = false;
      }
    },

    async loadComparative() {
      try {
        const { data } = await apiClient.get(`/reports/comparative`, {
          params: { branch_id: this.selectedBranch }
        });
        this.comparative = {
          thisMonth: {
            expected_revenue: 0, actual_revenue: 0,
            expected_profit: 0, actual_profit: 0,
            sold: 0, avg_waste: 0, expenses: 0,
            ...(data.thisMonth || {})
          },
          lastMonth: {
            expected_revenue: 0, actual_revenue: 0,
            expected_profit: 0, actual_profit: 0,
            sold: 0, avg_waste: 0, expenses: 0,
            ...(data.lastMonth || {})
          },
          changes: {
            expected_revenue: 0, actual_revenue: 0,
            expected_profit: 0, actual_profit: 0,
            sold: 0, waste: 0,
            ...(data.changes || {})
          }
        };
      } catch (e) {
        console.error('loadComparative failed:', e);
      }
    },

    async loadProfitability() {
      try {
        const { data } = await apiClient.get(`/reports/profitability`, {
          params: { branch_id: this.selectedBranch, days: this.selectedPeriod }
        });
        this.profitTrend = data.daily || [];
        this.dayOfWeek = data.dayOfWeek || [];
        this.dailySummary = [...(data.daily || [])].reverse();
        this.currentPage = 1;
      } catch (e) {
        console.error('loadProfitability failed:', e);
        this.profitTrend = [];
        this.dayOfWeek = [];
        this.dailySummary = [];
      }
    },

    async loadWaste() {
      try {
        const { data } = await apiClient.get(`/reports/waste-analysis`, {
          params: { branch_id: this.selectedBranch, days: this.selectedPeriod }
        });
        const dataArr = data.data || [];
        const computedTotalKg = dataArr.reduce(
          (s, r) => s + (parseFloat(r.waste_kg) || 0),
          0
        );
        this.wasteData = {
          data: dataArr,
          avgWastePct: data.avgWastePct || 0,
          totalWasteCost: data.totalWasteCost || 0,
          totalWasteKg: data.totalWasteKg || computedTotalKg
        };
      } catch (e) {
        console.error('loadWaste failed:', e);
        this.wasteData = { data: [], avgWastePct: 0, totalWasteCost: 0, totalWasteKg: 0 };
      }
    },

    async loadPaymentMix() {
      try {
        const { data } = await apiClient.get(`/reports/payment-mix`, {
          params: { branch_id: this.selectedBranch, days: this.selectedPeriod }
        });
        this.paymentMix = {
          data: data.data || [],
          totalCash: data.totalCash || 0,
          totalMpesa: data.totalMpesa || 0,
          totalActualRevenue: data.totalActualRevenue || 0,
          totalExpectedRevenue: data.totalExpectedRevenue || 0,
          avgMpesaPct: data.avgMpesaPct || 0,
          revenueVariance: data.revenueVariance || 0
        };
      } catch (e) {
        console.error('loadPaymentMix failed:', e);
        this.paymentMix = {
          data: [], totalCash: 0, totalMpesa: 0,
          totalActualRevenue: 0, totalExpectedRevenue: 0,
          avgMpesaPct: 0, revenueVariance: 0
        };
      }
    },

    async loadExpenses() {
      try {
        const { data } = await apiClient.get(`/reports/expense-breakdown`, {
          params: { branch_id: this.selectedBranch, days: this.selectedPeriod }
        });
        this.expenseData = {
          data: data.data || [],
          grandTotal: data.grandTotal || 0
        };
      } catch (e) {
        console.error('loadExpenses failed:', e);
        this.expenseData = { data: [], grandTotal: 0 };
      }
    },

    getProfitTrendValue(item) {
      return item.actual_profit !== undefined ? item.actual_profit : (item.profit || 0);
    },

    getProfitTrendClass(item) {
      const val = this.getProfitTrendValue(item);
      return val >= 0 ? 'profit' : 'loss';
    },

    getProfitTrendValueClass(item) {
      const val = this.getProfitTrendValue(item);
      return val >= 0 ? 'positive' : 'negative';
    },

    formatCurrency(n) {
      if (n === null || n === undefined || isNaN(n)) return 'Ksh 0';
      return new Intl.NumberFormat('en-KE', {
        style: 'currency', currency: 'KES', maximumFractionDigits: 0
      }).format(n);
    },

    formatCurrencyCompact(n) {
      if (n === null || n === undefined || isNaN(n)) return '0';
      const num = parseFloat(n);
      if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toFixed(0);
    },

    /**
     * Number formatter — trims trailing zeros, returns plain "0" for empty.
     */
    formatNumber(n) {
      if (n === null || n === undefined || isNaN(n)) return '0';
      const v = parseFloat(n);
      return v % 1 === 0 ? v.toString() : v.toFixed(2);
    },

    formatDate(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    },

    formatDateShort(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.getDate();
    },

    formatDay(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-GB', { weekday: 'short' });
    },

    formatMargin(profit, revenue) {
      const p = parseFloat(profit) || 0;
      const r = parseFloat(revenue) || 0;
      if (!r) return '—';
      return ((p / r) * 100).toFixed(1) + '%';
    },

    getChangeClass(field) {
      const val = parseFloat(this.comparative.changes[field]) || 0;
      return val >= 0 ? 'up' : 'down';
    },

    getChangeIcon(field) {
      const val = parseFloat(this.comparative.changes[field]) || 0;
      return val >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down';
    },

    getWasteChangeClass() {
      const val = parseFloat(this.comparative.changes.waste) || 0;
      // For waste, DOWN is GOOD
      return val <= 0 ? 'up' : 'down';
    },

    getWasteChangeIcon() {
      const val = parseFloat(this.comparative.changes.waste) || 0;
      return val <= 0 ? 'mdi-arrow-down' : 'mdi-arrow-up';
    },

    getAmountClass(n) {
      const val = parseFloat(n) || 0;
      return val >= 0 ? 'positive' : 'negative';
    },

    getMarginClass(day) {
      const profit = parseFloat(day.avg_actual_profit || day.avg_profit) || 0;
      return profit >= 0 ? 'positive' : 'negative';
    },

    getBarHeight(item) {
      const profit = parseFloat(
        item.actual_profit !== undefined ? item.actual_profit : (item.profit || 0)
      );
      if (this.maxProfit === 0) return 0;
      return Math.min((Math.abs(profit) / this.maxProfit) * 100, 100);
    },

    getItemActualRevenue(item) {
      const cash = parseFloat(item.payment_cash || item.paymentCash || 0);
      const mpesa = parseFloat(item.payment_mpesa || item.paymentMpesa || 0);
      if (cash > 0 || mpesa > 0) return cash + mpesa;
      return parseFloat(
        item.actual_revenue !== undefined ? item.actual_revenue : (item.revenue || 0)
      );
    },

    getItemMargin(item) {
      const profit = parseFloat(
        item.actual_profit !== undefined ? item.actual_profit : (item.profit || 0)
      );
      const revenue = parseFloat(item.actual_revenue || item.revenue || 0);
      if (!revenue) return 0;
      return (profit / revenue) * 100;
    },

    /**
     * Waste % — aligned with backend formula: waste / (opening + supply).
     */
    getWastePct(item) {
      if (item.waste_pct !== undefined && item.waste_pct !== null) {
        return parseFloat(item.waste_pct).toFixed(1);
      }
      const waste = parseFloat(item.waste_kg || item.wasteKg || 0);
      const opening = parseFloat(item.opening_stock_kg || 0);
      const supply = parseFloat(item.supply_kg || 0);
      const total = opening + supply;
      if (!total) return '0.0';
      return ((waste / total) * 100).toFixed(1);
    },

    /**
     * Classify waste % — thresholds must match getWasteBadgeClass:
     * ≤ 2% good | 2–5% warning | > 5% danger
     */
    getWasteClass(item) {
      const pct = parseFloat(this.getWastePct(item)) || 0;
      if (pct <= 2) return 'good';
      if (pct <= 5) return 'warning';
      return 'danger';
    },

    /**
     * Chip color class for a specific waste % value.
     */
    getWasteBadgeClass(pct) {
      const p = parseFloat(pct) || 0;
      if (p <= 2) return 'waste-good';
      if (p <= 5) return 'waste-warning';
      return 'waste-danger';
    },

    /**
     * CSV export — properly escapes values containing commas or quotes.
     */
    exportCSV() {
      if (!this.canViewAdvancedReports) return;

      const headers = [
        'Date', 'Actual Revenue', 'Expected Revenue',
        'Actual Profit', 'Expected Profit', 'Margin %',
        'Sold kg', 'Waste %', 'Cash', 'M-Pesa'
      ];
      const rows = this.dailySummary.map((item) => [
        item.date,
        item.actual_revenue || item.revenue || 0,
        item.expected_revenue || item.revenue || 0,
        item.actual_profit || item.profit || 0,
        item.expected_profit || item.profit || 0,
        this.getItemMargin(item).toFixed(1),
        item.sold_kg || 0,
        this.getWastePct(item),
        item.payment_cash || item.paymentCash || 0,
        item.payment_mpesa || item.paymentMpesa || 0
      ]);

      const escape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const csv = [headers, ...rows]
        .map((r) => r.map(escape).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meatpro-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
.reports-page {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
}

@media (max-width: 600px) {
  .reports-page {
    padding: 12px;
  }
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover { background: #f3f4f6; }

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  font-size: 13px;
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.branch-select, .period-select {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.branch-name-label {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 10px;
  background: #f3f4f6;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.refresh-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.refresh-btn:hover { background: #f3f4f6; }
.refresh-btn.spinning .v-icon { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* Period Tabs */
.period-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.tab-btn:hover:not(.active) { background: #f3f4f6; }

/* Paywall */
.paywall {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  margin-top: 20px;
}

.paywall h2 {
  margin: 16px 0 8px;
  font-size: 22px;
  color: #111827;
}

.paywall p {
  color: #6b7280;
  max-width: 420px;
  line-height: 1.5;
}

/* Empty state at page level */
.empty-state-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  margin-top: 20px;
}

.empty-state-page h3 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #111827;
}

.empty-state-page p {
  color: #6b7280;
  max-width: 420px;
}

/* Loading */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #ef4444;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
  min-width: 0;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}

.metric-card.locked {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  opacity: 0.9;
}

.locked-content { text-align: center; color: #9ca3af; }
.locked-content .v-icon { margin-bottom: 8px; color: #d1d5db; }
.locked-content p { margin: 0 0 4px; font-weight: 600; color: #6b7280; }
.locked-content small { font-size: 12px; }

.locked-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  gap: 12px;
}

.locked-section .v-icon { color: #d1d5db; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.revenue .icon-wrap { background: #fef2f2; color: #ef4444; }
.profit .icon-wrap { background: #f0fdf4; color: #22c55e; }
.volume .icon-wrap { background: #eff6ff; color: #3b82f6; }
.waste .icon-wrap { background: #fefce8; color: #eab308; }

.change-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.change-badge.up { background: #f0fdf4; color: #16a34a; }
.change-badge.down { background: #fef2f2; color: #dc2626; }
.change-badge.neutral { background: #f3f4f6; color: #9ca3af; }

.card-body h3 {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}

.amount {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.amount.positive { color: #16a34a; }
.amount.negative { color: #dc2626; }
.amount.warning-amount { color: #d97706; }

.vs-text {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.sub-note {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e5e7eb;
}

/* Variance Alert */
.variance-alert {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.variance-alert.warning {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.variance-alert.success {
  background: #f0fdf4;
  border: 1px solid #86efac;
}

.alert-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.variance-alert.warning .alert-icon { color: #f97316; }
.variance-alert.success .alert-icon { color: #22c55e; }

.alert-content h4 { margin: 0 0 4px; font-size: 15px; font-weight: 600; }
.alert-content p { margin: 0; font-size: 13px; color: #6b7280; }
.alert-content strong { color: #111827; }

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

@media (max-width: 900px) {
  .charts-row { grid-template-columns: 1fr; }
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-header h3 .v-icon { color: #ef4444; }

.chart-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.chart-badge {
  padding: 4px 12px;
  background: #f3f4f6;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: clamp(6px, 1.5vw, 20px);
  height: 200px;
  min-height: 160px;
  padding: 16px 4px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  width: clamp(28px, 8vw, 56px);
  min-width: 28px;
  max-width: 56px;
}

.bar-label {
  font-size: clamp(9px, 2.2vw, 12px);
  color: #9ca3af;
  font-weight: 500;
  line-height: 1.2;
}

.bar-track {
  width: clamp(14px, 4.5vw, 36px);
  height: clamp(100px, 28vw, 140px);
  max-height: 140px;
  background: #f3f4f6;
  border-radius: 8px 8px 4px 4px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 8px 8px 4px 4px;
  transition: height 0.5s ease;
}

.bar-item.profit .bar-fill { background: #22c55e; }
.bar-item.loss .bar-fill { background: #ef4444; }

.bar-value {
  font-size: clamp(9px, 2vw, 12px);
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.2;
}

.bar-value.positive { color: #16a34a; }
.bar-value.negative { color: #dc2626; }

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
  flex-wrap: wrap;
}

.chart-body { width: 100%; max-width: 100%; overflow: hidden; min-width: 0; }

@media (max-width: 900px) {
  .bar-chart {
    height: 180px;
    gap: clamp(6px, 1.8vw, 14px);
  }
  .bar-item { width: clamp(30px, 7vw, 48px); }
  .bar-track { width: clamp(16px, 4vw, 28px); height: 120px; }
}

@media (max-width: 600px) {
  .chart-card { padding: 14px 12px; }
  .chart-header { margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
  .chart-header h3 { font-size: 14px; }
  .chart-subtitle { font-size: 11px; }
  .bar-chart { height: 160px; padding: 10px 2px 8px; gap: 8px; }
  .bar-item {
    width: 32px;
    min-width: 32px;
    max-width: 36px;
    gap: 4px;
  }
  .bar-track { width: 18px; height: 110px; }
  .bar-label { font-size: 10px; }
  .bar-value { font-size: 9px; }
  .chart-legend { gap: 12px; font-size: 11px; margin-top: 8px; }
}

@media (max-width: 380px) {
  .bar-chart { height: 140px; gap: 6px; }
  .bar-item { width: 28px; min-width: 28px; }
  .bar-track { width: 14px; height: 95px; }
  .bar-label, .bar-value { font-size: 9px; }
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.dot.profit { background: #22c55e; }
.dot.loss { background: #ef4444; }

/* Best Days */
.best-days-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
}

.day-info { display: flex; align-items: center; gap: 10px; }
.day-dot { width: 10px; height: 10px; border-radius: 50%; }
.day-name { font-weight: 500; font-size: 14px; color: #374151; }
.day-metrics { display: flex; gap: 20px; }
.metric { text-align: right; }
.metric-label { display: block; font-size: 11px; color: #9ca3af; }
.metric-value { font-size: 14px; font-weight: 600; color: #111827; }
.metric-value.positive { color: #16a34a; }
.metric-value.negative { color: #dc2626; }

/* Analytics Row */
.analytics-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .analytics-row { grid-template-columns: 1fr; }
}

.analytics-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-header-flex h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header-flex h3 .v-icon { color: #ef4444; }

.card-subtitle { margin: 4px 0 0; font-size: 12px; color: #9ca3af; }

.badge {
  padding: 4px 12px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge.mpesa { background: #f0fdf4; color: #059669; }

/* Waste badge tier classes */
.badge.waste-good,
.pct-badge.waste-good { background: #f0fdf4; color: #16a34a; }
.badge.waste-warning,
.pct-badge.waste-warning { background: #fef3c7; color: #b45309; }
.badge.waste-danger,
.pct-badge.waste-danger { background: #fee2e2; color: #b91c1c; }

.waste-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.waste-total + .waste-total {
  padding-top: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.waste-total span { font-size: 13px; color: #6b7280; }
.waste-total strong { font-size: 18px; color: #ef4444; }
.waste-total strong.neutral-strong { color: #111827; font-size: 15px; }

/* Payment Donuts */
.payment-donuts {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px 0;
}

.donut-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.donut {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.donut::before {
  content: '';
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.donut-label {
  position: relative;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.donut-name { font-size: 13px; color: #6b7280; font-weight: 500; }
.donut-amount { font-size: 14px; font-weight: 600; color: #111827; }

.variance-mini {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 12px;
}

/* Expense Card */
.expense-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
  margin-bottom: 20px;
}

.total-expense { font-size: 20px; font-weight: 700; color: #ef4444; }

.expense-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .expense-grid { grid-template-columns: 1fr; }
}

.expense-bars { display: flex; flex-direction: column; gap: 16px; }
.expense-bar-item { display: flex; flex-direction: column; gap: 6px; }
.expense-info { display: flex; align-items: center; gap: 8px; }
.expense-dot { width: 10px; height: 10px; border-radius: 50%; }
.expense-name { font-weight: 500; font-size: 14px; color: #374151; }
.expense-count {
  font-size: 11px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
}
.expense-bar-track {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}
.expense-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
.expense-amount {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  text-align: right;
}

/* Summary Card */
.summary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}

.export-btn { text-transform: none; font-weight: 500; font-size: 13px; }

/* Data Table */
.data-table { overflow-x: auto; }
.data-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th {
  text-align: left;
  padding: 12px;
  color: #9ca3af;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f3f4f6;
}
.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f9fafb;
  color: #374151;
}
.data-table tbody tr:hover { background: #f9fafb; }
.data-table.compact td { padding: 8px 12px; }

.empty-cell { text-align: center; color: #9ca3af; padding: 24px; }

.date-cell { display: flex; flex-direction: column; }
.date-day { font-size: 11px; color: #9ca3af; }
.date-full { font-weight: 500; color: #374151; }

.chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.chip.positive { background: #f0fdf4; color: #16a34a; }
.chip.negative { background: #fef2f2; color: #dc2626; }

.muted { color: #9ca3af; }
.positive { color: #16a34a; }
.negative { color: #dc2626; }

.pct-badge {
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.mpesa { color: #059669; }
.cash { color: #3b82f6; }

.waste-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.waste-badge.good { background: #f0fdf4; color: #16a34a; }
.waste-badge.warning { background: #fef3c7; color: #d97706; }
.waste-badge.danger { background: #fef2f2; color: #dc2626; }

/* Expense Table */
.expense-table-wrap {
  border-left: 1px solid #f3f4f6;
  padding-left: 24px;
}

.expense-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.expense-table th {
  text-align: left;
  padding: 10px 12px;
  color: #9ca3af;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  border-bottom: 1px solid #f3f4f6;
}
.expense-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f9fafb;
}
.dot-sm {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0;
  margin-top: 12px;
  border-top: 1px solid #f3f4f6;
  font-size: 13px;
  color: #6b7280;
}

.pagination select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 13px;
}

.page-nav { display: flex; gap: 8px; }
.page-nav .v-btn {
  min-width: 32px !important;
  width: 32px;
  height: 32px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #d1d5db;
  gap: 12px;
}

.empty-state.small { padding: 20px; }
.empty-state .v-icon { font-size: 40px; }
.empty-state p { margin: 0; font-size: 14px; color: #9ca3af; }
.empty-state small { font-size: 12px; color: #b8bcc4; }
</style>