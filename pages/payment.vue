<template>
  <div class="">
    <v-row v-resize="onResize">
      <v-col cols="12" sm="8" md="8">
        <div class="container">
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <div class="container">
                <nuxt-link style="text-decoration: none; color: red" to="/">
                  <v-chip class="ma-2" color="red" outlined>
                    <v-icon color="red">mdi-chevron-left</v-icon> Back home
                  </v-chip>
                </nuxt-link>
              </div>
            </v-col>
            <v-col cols="12" sm="12" md="12"></v-col>
            <br />
            <br />
            <v-col cols="12" sm="6" md="6">
              <div class="container">
                <h2 style="color: grey">Choose a plan</h2>
                <p>
                  Find the perfect subscription that suits your business needs. MeatPro
                  offers flexible payment plans to streamline your operations, enhance
                  efficiency, and ensure you never miss out on essential features.
                </p>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="6"></v-col>

            <v-col cols="12" v-show="!paymentForm" sm="4" md="4" class="">
              <v-card class="mx-auto">
                <v-card-text>
                  <div><h3>Monthly</h3></div>
                  <p class="text-h2 text--primary">Ksh/• {{ amountMonth }}</p>
                  <p>Subscribe to our monthly plan</p>
                  <div class="text--primary">
                    well meaning and kindly.<br />
                    "a benevolent smile"
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    style="margin: 8px; color: white"
                    rounded
                    color="#f10000"
                    class="text-white"
                    @click="
                      (amount = amountMonth), (paymentForm = true), (duration = 'Monthly')
                    "
                  >
                    Get Started
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4" v-show="!paymentForm" md="4" class="">
              <v-card class="mx-auto">
                <v-card-text>
                  <div><h3>Yearly</h3></div>
                  <p class="text-h2 text--primary">Ksh/• {{ amountYear }}</p>
                  <p>Subscribe to our yearly plan</p>
                  <div class="text--primary">
                    well meaning and kindly.<br />
                    "a benevolent smile"
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    rounded
                    style="margin: 8px; color: white"
                    color="#f10000"
                    class="text-white"
                    @click="
                      (amount = amountYear), (paymentForm = true), (duration = 'Yearly')
                    "
                  >
                    Get Started
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4" md="4"></v-col>
            <v-col cols="12" sm="4" md="4"></v-col>
            <v-col cols="12" sm="12" md="12" v-show="paymentForm">
              <div class="container">
                <v-card dark color="black" elevation="0">
                  <div class="container">
                    <v-card-text>
                      <div class="">
                        <div class="d-flex">
                          <span>Mpesa Payment</span>
                          <v-avatar style="margin: 10px" color="primary" size="30">
                            <img alt="Avatar" :src="mpesaIcon" />
                          </v-avatar>
                          <v-spacer></v-spacer>
                          <v-btn icon @click="paymentForm = false">
                            <v-icon color="red">mdi-close</v-icon>
                          </v-btn>
                        </div>
                        <div class="d-flex">
                          <v-text-field
                            active-class="green"
                            outlined
                            hint="254767**456*"
                            v-model="phone"
                            type="number"
                            label="Provide mpesa number"
                          ></v-text-field>
                          <v-spacer></v-spacer>
                          <v-spacer></v-spacer>
                          <p class="text-h4" style="color: white">Ksh/{{ amount }}</p>
                          <p>{{ "   -- " }}{{ duration }}</p>
                        </div>
                      </div>
                    </v-card-text>
                    <div>
                      <v-progress-linear
                        v-show="progress_bar"
                        indeterminate
                        color="red"
                      ></v-progress-linear>
                    </div>
                    <v-btn
                      ref="button"
                      style="margin: 10px; font-size: 1.2rem; color: red"
                      color="white"
                      class="red--text"
                      @click="StkPush()"
                      >Stk Push</v-btn
                    >
                    <v-spacer />
                  </div>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="12" sm="4" md="4" v-show="!showSide">
        <v-card elevation="0" color="#f10000" height="100vh">
          <v-card-title>
            <h1 style="margin: 30px; color: white; font-size: 2.2rem">Subscription</h1>
          </v-card-title>
          <v-img style="margin: 10px" :src="walletIcon" contain height="400"> </v-img>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      color="primary accent-8"
      :timeout="6000"
      v-model="snackbar_s"
      centered
      bottom
    >
      {{ snackbarText_s }}
    </v-snackbar>
    <v-snackbar color="success" :timeout="2000" v-model="snackbar" outlined center>
      {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="error" :timeout="4000" v-model="snackbarError" outlined center>
      {{ snackbarTextError }}
    </v-snackbar>
  </div>
</template>
<script>
import axios from "axios";
import * as easings from "vuetify/lib/services/goto/easing-patterns";

export default {
  data() {
    return {
      type: "number",
      number: 9999,
      selector: "#third",
      selections: ["#first"],
      selected: "Button",
      elements: ["Button"],
      duration: 300,
      offset: 0,
      easing: "easeInOutCubic",
      easings: Object.keys(easings),
      progress_bar: false,
      duration: "",
      paymentForm: false,
      windowSize: {
        x: window.innerHeight,
        y: window.innerWidth,
      },
      supplier: {
        month: "70",
        year: "700",
      },
      retailer: {
        month: "50",
        year: "500",
      },
      amountMonth: "0",
      mpesaIcon: require("@/assets/mpesa.png"),
      walletIcon: require("@/assets/wallet.svg"),
      amountYear: "0",
      showSide: true,
      phone: null,
      amount: null,
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbarError: false,
      snackbarText: "",
      snackbarTextError: "",
      uid: null,
      UserType: null,
      UserName: null,
      shopName: null,
      payment: false,
      paymentDate: null,
      mpesaReceipt: null,
      subscription: null,
      subscriptionType: null,
      subscriptionAmount: 0,
      timerEnabled: false,
      show6: false,
      timerCount: 25,
      successResponse: "",
      errorResponse: "",
      CheckoutRequestID: null,
      authUnsubscribe: null,
      CheckoutResponseID: null,
      CheckoutRequestDate: null,
      CheckoutResponseDate: null,
      timestamp2: new Date(),
      title: "",
      body: "",
      from: "",
      to: "",
      status: "",
    };
  },
  methods: {
    ////Stk Query////
    StkQuery() {
      let that = this;
      that.snackbar_s = true;
      that.snackbarText_s = "Checking payment status...";
      apiClient
        .post("/payments/stk/query", {
          checkoutRequestId: that.CheckoutRequestID,
        })
        .then(function (response) {
          console.log("StkPush Query", response.data);
          that.show6 = false;

          if (response.status == 200) {
            that.progress_bar = false;
            that.paymentForm = true;
            if (response.data.errorCode == "400.002.02") {
              that.snackbarError = true;
              that.snackbarTextError = response.data.errorMessage;
              that.errorResponse = response.data.errorMessage;
              that.timerCount = 25;
              that.timerEnabled = false;
            } else if (response.data.errorCode == "500.001.1001") {
              that.snackbar = true;
              that.snackbarText = response.data.errorMessage;
              that.errorResponse = response.data.errorMessage;
              that.timerCount = 25;
              that.timerEnabled = false;
            } else {
              if (response.data.ResultCode == "0") {
                that.snackbar = true;
                that.snackbarText = response.data.ResultDesc;
                that.successResponse = response.data.ResultDesc;
                that.timerEnabled = false;
                that.UploadNotification();
                that.timerCount = 25;
              } else if (response.data.ResultCode == "1032") {
                that.snackbarError = true;
                that.snackbarTextError = "Request was cancelled";
                that.errorResponse = "Request was cancelled";
                that.UploadNotification();
                that.timerCount = 25;
                that.timerEnabled = false;
              } else if (response.data.ResultCode == "2001") {
                that.snackbarError = true;
                that.snackbarTextError = "You entered a wrong pin";
                that.errorResponse = "You entered a wrong pin";
                that.timerCount = 25;
                that.timerEnabled = false;
              } else {
                that.snackbarError = true;
                that.snackbarTextError = response.data.ResultDesc;
                that.errorResponse = response.data.ResultDesc;
                that.timerEnabled = false;
                that.timerCount = 25;
              }
            }
          } else if (response.status == 400) {
            that.paymentForm = true;
            that.snackbarError = true;
            that.snackbarTextError = response.data;
            that.timerCount = 25;
            that.timerEnabled = false;
            that.progress_bar = false;
          }
        })
        .catch(function (error) {
          that.paymentForm = true;
          that.snackbarError = true;
          that.snackbarTextError = error;
          that.timerCount = 25;
          that.timerEnabled = false;
          that.show6 = false;
          that.progress_bar = false;
        });
    },
    UploadNotification() {
      this.title = this.duration + " subscription updated";
      this.body = `You have successfully a paid ksh/${this.amount} for your ${this.duration} plan.`;
      this.from = this.$fire.auth.currentUser.uid;
      this.to = this.$fire.auth.currentUser.uid;
      this.status = "unseen";
      this.uid = this.$fire.auth.currentUser.uid;
      apiClient
        .put("/notification/addNotification", {
          title: this.title,
          body: this.body,
          from_user: this.from,
          uid: this.$fire.auth.currentUser.uid,
          to_user: this.to,
          status: this.status,
          payment_date: new Date(),
          timestamp: new Date(),
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    onResize() {
      this.windowSize = {
        x: window.innerWidth,
        y: window.innerHeight,
      };
      if (this.windowSize.x < 950) {
        this.showSide = true;
      } else {
        this.showSide = false;
      }
      return this.windowSize;
    },
    FetchUser() {
      let that = this;
      apiClient
        .get(`/user/getUser/${that.user.uid}`, {})
        .then(function (response) {
          console.log("Payment page", response.data[0]);
          if (response.status == 200) {
            const userData = response.data[0];
            that.UserName = userData.shopName;
            that.UserType = userData.userCategory;
            that.UserName = userData.username;
            that.paymentDate = userData.payment_date;
            that.subscriptionType = userData.subscriptionType;
            that.subscriptionAmount = userData.subscriptionAmount;
            that.mpesaReceipt = userData.mpesaReceipt;

            if (that.UserType == "retailer") {
              that.amountMonth = that.retailer.month;
              that.amountYear = that.retailer.year;
            } else if (that.UserType == "supplier") {
              that.amountMonth = that.supplier.month;
              that.amountYear = that.supplier.year;
            }

            if (userData.mpesaReceipt == null) {
              that.snackbarError = true;
              that.snackbarTextError = "Please pay for subscription";
            }
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    StkPush() {
      let that = this;
      if (that.phone == null) {
        that.snackbarTextError = "Provide phone..";
        that.snackbarError = true;
      } else if (that.amount == null) {
        that.snackbarTextError = "Provide amount.";
        that.snackbarError = true;
      } else {
        apiClient
          .post("/payments/stk", {
            phone: that.phone,
            amount: that.amount,
            user_id: that.user.uid,
            User_name: that.UserName,
            subscription: that.duration,
            User_type: that.UserType,
          })
          .then(function (response) {
            if (response.status == 200) {
              that.snackbar = true;
              that.progress_bar = true;
              that.snackbarText = response.data;
              that.CheckoutRequestID = response.data.CheckoutRequestID;
              that.timerEnabled = true;
            }
          })
          .catch(function (error) {
            console.error(error);
            that.snackbarTextError = error;
            that.snackbarError = true;
            that.progress_bar = false;
          });
      }
    },
    logout() {
      this.$fire.auth.signOut();
      this.$router.push("/login");
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize);
    this.authUnsubscribe = this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        this.FetchUser();
      } else {
        this.$router.push("/login");
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  },
  watch: {
    timerEnabled(value) {
      if (value) {
        setTimeout(() => {
          this.timerCount--;
        }, 1000);
      }
    },
    timerCount: {
      handler(value) {
        if (value > 0 && this.timerEnabled) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        } else if (value == 0) {
          this.StkQuery();
          this.timerCount = 25;
        }
      },
      immediate: true, // This ensures the watcher is triggered upon creation
    },
  },
  computed: {
    target() {
      const value = this[this.type];
      if (!isNaN(value)) return Number(value);
      else return value;
    },
    options() {
      return {
        duration: this.duration,
        offset: this.offset,
        easing: this.easing,
      };
    },
    element() {
      if (this.selected === "Button") return this.$refs.button;
      else return null;
    },
  },
};
</script>
<style>
/* From Uiverse.io by Yaya12085 */
.cardPay {
  margin-left: -1rem;
  margin-right: -1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  margin-bottom: 2rem;
  width: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;
  background-color: rgba(17, 24, 39, 1);
  padding: 1.5rem;
}

.header {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #fff;
}

.price {
  font-size: 3.75rem;
  line-height: 1;
  font-weight: 700;
  color: #fff;
}

.desc {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.625;
  color: rgba(156, 163, 175, 1);
}

.lists {
  margin-bottom: 1.5rem;
  flex: 1 1 0%;
  color: rgba(156, 163, 175, 1);
}

.lists .list {
  margin-bottom: 0.5rem;
  display: flex;
  margin-left: 0.5rem;
}

.lists .list svg {
  height: 1.5rem;
  width: 1.5rem;
  flex-shrink: 0;
  margin-right: 0.5rem;
  color: rgba(167, 139, 250, 1);
}

.action {
  border: none;
  outline: none;
  display: inline-block;
  border-radius: 0.25rem;
  background-color: rgba(167, 139, 250, 1);
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(17, 24, 39, 1);
}
</style>
