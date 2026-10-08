<template>
  <div style="background-color: white; height: 100vh">
    <v-row v-resize="onResize">
      <v-col v-show="!showSide" cols="12" md="6">
        <v-card elevation="0" color="#f10000" height="100vh">
          <v-card-title>
            <h1 style="margin: 30px; color: white; font-size: 2.2rem">Welcome back</h1>
          </v-card-title>
          <v-img style="margin: 10px" :src="logo" contain height="600"> </v-img>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="0" color="white">
          <div class="container">
            <div>
              <v-progress-linear
                v-show="progress_bar"
                indeterminate
                color="red"
              ></v-progress-linear>
            </div>

            <v-row>
              <v-col cols="12" md="12" lg="12" sm="12">
                <div>
                  <div class="">
                    <div class="d-flex">
                      <v-spacer />
                      <v-img style="margin-top: 10px" :src="otp" contain height="200">
                      </v-img>
                      <v-spacer />
                    </div>
                  </div>
                </div>
                <div>
                  <div class="container text-center">
                    <div class="d-flex">
                      <v-spacer />
                      <v-tabs color="red" centered :show-arrows="true">
                        <v-tab @click="register = false" value="one"
                          ><span>Log In</span></v-tab
                        >
                        <v-tab @click="register = true" value="one"
                          ><span>Register</span></v-tab
                        >
                      </v-tabs>
                      <v-spacer />
                    </div>
                  </div>
                </div>
                <div>
                  <div class="container">
                    <div class="d-flex">
                      <v-spacer /> <label>Select user type</label>
                      <v-spacer />
                    </div>

                    <div class="d-flex">
                      <v-spacer />
                      <div>
                        <v-radio-group v-model="user_state" row>
                          <v-radio
                            color="red"
                            label="Retailer"
                            value="retailer"
                          ></v-radio>
                          <v-radio
                            color="red"
                            label="Supplier"
                            value="supplier"
                          ></v-radio>
                        </v-radio-group>
                      </div>
                      <v-spacer />
                    </div>
                    <div class="d-flex">
                      <v-spacer />
                      <strong style="font-size: 1.3rem"> {{ user_state }}</strong>
                      <v-spacer />
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="12" lg="12">
                <div>
                  <v-row v-show="!register">
                    <v-col
                      class="text-center"
                      v-show="!code_state"
                      cols="12"
                      md="12"
                      sm="12"
                    >
                      <div class="container">
                        <v-form>
                          <v-row>
                            <v-col cols="12">
                              <div class="d-flex">
                                <v-spacer />
                                <div id="inputPhone" class="d-flex">
                                  <div>
                                    <vue-country-code
                                      style="padding: 10px 6px 10px 6px"
                                      color="white"
                                      id="codePicker"
                                      elevation="0"
                                      aria-orientation="vertical"
                                      @onSelect="onSelect"
                                      defaultCountry="ke"
                                    >
                                    </vue-country-code>
                                  </div>
                                  <div class="">
                                    <v-text-field
                                      active-class="green"
                                      outlined
                                      v-model="phone_number"
                                      :counter="16"
                                      type="number"
                                      label="Provide phone number"
                                    ></v-text-field>
                                  </div>
                                </div>
                                <v-spacer />
                              </div>
                            </v-col>
                          </v-row>
                        </v-form>

                        <div class="d-flex">
                          <v-spacer />
                          <div
                            id="recaptcha-container"
                            data-sitekey="AIzaSyC3mQVwxoJF5MLAtslONUyKE_gQCtQ5kQo"
                            data-callback="sendForm"
                            data-size="visible"
                          ></div>
                          <v-spacer />
                        </div>

                        <div class="d-flex">
                          <v-spacer />
                          <v-btn
                            color="red"
                            class="white--text"
                            @click="sendOtpForVerification()"
                            >Request OTP</v-btn
                          >
                          <v-spacer />
                        </div>
                      </div>
                    </v-col>
                    <v-col v-show="code_state" cols="12" md="12" sm="12">
                      <v-spacer />
                      <div class="container">
                        <div class="d-flex">
                          <v-spacer />
                          <v-otp-input
                            outlined
                            width="200"
                            v-model="code_no"
                            type="phone"
                            label="Verification Code"
                            length="6"
                          ></v-otp-input>
                          <v-spacer />
                        </div>

                        <div class="d-flex">
                          <v-spacer />
                          <v-btn color="green" class="white--text" @click="ConfirmCode"
                            >Verify Code</v-btn
                          >
                          <v-spacer />
                        </div>
                        <v-progress-circular
                          v-show="show66"
                          :rotate="360"
                          :size="20"
                          :width="8"
                          :value="timerCount"
                          color="secondary"
                        >
                          {{ timerCount }} sec
                        </v-progress-circular>
                      </div>
                      <v-spacer />
                    </v-col>
                  </v-row>
                  <v-row v-show="register">
                    <v-col
                      class="text-center"
                      v-show="!code_state"
                      cols="12"
                      md="12"
                      sm="12"
                    >
                      <div class="container">
                        <v-form>
                          <v-row>
                            <v-col cols="12">
                              <v-form ref="form" v-model="valid" lazy-validation>
                                <v-row>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      outlined
                                      v-model="intput_username"
                                      :counter="10"
                                      :rules="nameRules"
                                      label="User Name"
                                      required
                                    ></v-text-field>
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      outlined
                                      v-model="county"
                                      :counter="10"
                                      :rules="nameRules"
                                      label="County"
                                      required
                                    ></v-text-field>
                                  </v-col>

                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      outlined
                                      v-model="intput_shopName"
                                      :counter="10"
                                      :rules="nameRules"
                                      label="Shop Name"
                                      required
                                    ></v-text-field>
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <div class="d-flex">
                                      <v-spacer />
                                      <div id="inputPhone" class="d-flex">
                                        <div>
                                          <vue-country-code
                                            style="padding: 10px 6px 10px 6px"
                                            color="white"
                                            id="codePicker"
                                            elevation="0"
                                            aria-orientation="vertical"
                                            @onSelect="onSelect"
                                            defaultCountry="ke"
                                          >
                                          </vue-country-code>
                                        </div>

                                        <div class="d-flex">
                                          <v-text-field
                                            active-class="green"
                                            outlined
                                            v-model="phone_no"
                                            type="number"
                                            label="Provide phone number"
                                          ></v-text-field>

                                          <v-btn
                                            style="
                                              margin-top: 10px;
                                              margin-left: 10px;
                                              font-size: 1.2rem;
                                            "
                                            color="black"
                                            class="white--text"
                                            @click="QueryExistingUser()"
                                            >SEND OTP</v-btn
                                          >
                                          <v-spacer />
                                        </div>
                                      </div>
                                      <v-spacer />
                                    </div>
                                    <div class="d-flex">
                                      <v-spacer />
                                      <div
                                        id="recaptcha-container1"
                                        data-sitekey="AIzaSyC3mQVwxoJF5MLAtslONUyKE_gQCtQ5kQo"
                                        data-callback="sendForm"
                                        data-size="visible"
                                      ></div>
                                      <v-spacer />
                                    </div>
                                  </v-col>
                                  <v-col v-show="code_state1" cols="12" md="6" sm="6">
                                    <v-spacer />
                                    <div class="container">
                                      <div class="d-flex">
                                        <v-spacer />
                                        <v-otp-input
                                          v-model="code_no1"
                                          type="phone"
                                          label="Verification Code"
                                          length="6"
                                        ></v-otp-input>
                                        <v-spacer />
                                      </div>

                                      <div class="d-flex">
                                        <v-spacer />
                                        <v-btn
                                          color="green"
                                          class="white--text"
                                          @click="ConfirmCode1"
                                          >Verify Code</v-btn
                                        >
                                        <v-spacer />
                                      </div>
                                      <v-progress-circular
                                        v-show="show66"
                                        :rotate="360"
                                        :size="20"
                                        :width="8"
                                        :value="timerCount"
                                        color="secondary"
                                      >
                                        {{ timerCount }} sec
                                      </v-progress-circular>
                                    </div>
                                    <v-spacer />
                                  </v-col>
                                  <v-col cols="12" md="12">
                                    <v-checkbox
                                      v-model="checkbox"
                                      :rules="[
                                        (v) => !!v || 'You must agree to continue!',
                                      ]"
                                      label="Do you agree?"
                                      required
                                    ></v-checkbox>
                                  </v-col>
                                  <v-col cols="12" md="12" sm="12">
                                    <v-btn
                                      color="red"
                                      class="white--text"
                                      @click="QueryExistingUser()"
                                    >
                                      Submit Form
                                    </v-btn>
                                  </v-col>
                                </v-row>
                              </v-form>
                            </v-col>
                          </v-row>
                        </v-form>
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>
        <div>
          <v-snackbar color="white--text" :timeout="4000" v-model="snackbar" center>
            {{ snackbarText }}
          </v-snackbar>
          <v-snackbar
            color="red"
            :timeout="4000"
            v-model="snackbar2"
            outlined
            bottom
            center
          >
            {{ snackbarText2 }}
          </v-snackbar>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import moment from "moment";
import Vue from "vue";
import VueCountryCode from "vue-country-code";
import axios from "axios";

Vue.use(VueCountryCode);
export default {
  data() {
    return {
      moment,
      showSide: true,
      windowSize: {
        x: 0,
        y: 0,
      },
      logo: require("@/assets/eat.svg"),
      otp: require("@/assets/OTP.svg"),
      intput_username: "",
      intput_email: "",
      intput_shopName: "",
      register: false,
      code_stateR: false,
      progress_bar: false,
      showauth: true,
      showRegister2: false,
      snackbar: false,
      snackbarText: "No error message",
      snackbar2: false,
      showLogin: false,
      snackbarText2: "",
      viewItemDialog: false,
      user_name: "",
      phone_number: "",
      county: "",
      landMark: "",
      email: "",
      auth: {
        email: "",
        password: "",
      },
      loader: null,
      loading: false,
      loading2: false,
      user_state: "",
      progress_bar: false,
      code_state: false,
      phone_no: null,
      phone_no_r: "",
      code_no1: "",
      code_no_r: "",
      request_no: null,
      appVerifier2: null,
      appVerifier2_r: null,
      confirmation_Result: null,
      confirmation_Result_r: null,
      phone: "",
      county: "",
      checkbox: false,
      progress_bar_r: false,
      progress_bar: false,
      progress_bar2: false,
      snackbar: false,
      snackbarText: "No error message",
      snackbar2: false,
      showLogin: false,
      snackbarText2: "",
      new_account: true,
      new_account1: false,
      user_name: "",
      user_name_dis: "",
      email: "",
      user_uid: null,
      user_uid_dis: null,
      verified: false,
      user_image: "",
      password: "",
      auth: {
        email: "",
        password: "",
      },
      image: null,
      s: false,
      timerCount: 30,
      timerEnabled: false,
      snackbar_login_text: "",
      snackbar_login: true,
      show66: false,
      s: false,
      to_screen: false,
    };
  },
  methods: {
    QueryExistingUser() {
      let that = this;
      if (that.phone_no == "") {
        that.snackbarText2 = "Provide phone number.";
        that.snackbar2 = true;
      } else {
        axios
          .get(`http://localhost:5055/user/existingUser/${that.phone_no}`, {})
          .then(function (response) {
            console.log(response);
            if (response.status == 200) {
              that.snackbar = true;
              that.snackbarText = response.data.exists;
              if (response.data.exists == true) {
                that.snackbar2 = true;
                that.snackbarText2 = "This User exists";
              } else {
                that.sendOtpForVerification1();
              }
            } else if (response.status == 400) {
              that.snackbar2 = true;
              that.snackbarText2 = response.data;
            }
          })
          .catch(function (error) {
            console.log(error);
            that.snackbarText2 = error;
            that.snackbar2 = true;
          });
      }
    },
    UploadRecord() {
      let that = this;
      if (that.checkbox == false) {
        that.snackbarText2 = "Do you agree with the terms?..";
        that.snackbar2 = true;
      } else if (that.intput_username == "") {
        that.snackbarText2 = "Provide username..";
        that.snackbar2 = true;
      } else if (that.intput_shopName == "") {
        that.snackbarText2 = "Provide shop name.";
        that.snackbar2 = true;
      } else if (that.county == "") {
        that.snackbarText2 = "Provide county.";
        that.snackbar2 = true;
      } else if (that.user_state == "") {
        that.snackbarText2 = "Provide user type.";
        that.snackbar2 = true;
      } else if (that.phone_no == "") {
        that.snackbarText2 = "Provide phone number.";
        that.snackbar2 = true;
      } else {
        axios
          .put("http://localhost:5055/user/registerUser", {
            webCode: "",
            subscriptionType: null,
            month: this.moment(new Date()).format("MMM"),
            subscriptionAmount: 0,
            record_last_update: null,
            payment_date: null,
            mpesaReceipt: null,
            username: that.intput_username,
            shopName: that.intput_shopName,
            uid: that.$fire.auth.currentUser.uid,
            userCategory: that.user_state,
            deviceToken: that.moment(new Date()).format("YYYY-MM-DD"),
            county: that.county,
            phone: that.phone_no,
            date: that.moment(new Date()).format("MMM"),
            timestamp: new Date(),
          })
          .then(function (response) {
            console.log(response);
            if (response.status == 200) {
              that.snackbar = true;
              that.snackbarText = response.data;
            } else if (response.status == 400) {
              that.snackbar2 = true;
              that.snackbarText2 = response.data;
            }
          })
          .catch(function (error) {
            console.log(error);
            that.snackbarText2 = error;
            that.snackbar2 = true;
          });
      }
    },
    onResize() {
      this.windowSize = {
        x: window.innerWidth,
        y: window.innerHeight,
      };
      console.log("size", this.windowSize.x);
      if (this.windowSize.x < 950) {
        this.showSide = true;
      } else {
        this.showSide = false;
      }
      return this.windowSize;
    },
    configureRecaptcha() {
      window.recaptchaVerifier = new this.$fireModule.auth.RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "visible",
          callback: (response) => {
            console.log(response);
          },
        }
      );
    },
    configureRecaptcha2() {
      window.recaptchaVerifier = new this.$fireModule.auth.RecaptchaVerifier(
        "recaptcha-container1",
        {
          size: "visible",
          callback: (response) => {
            console.log(response);
          },
        }
      );
    },
    // handle otpsend
    sendOtpForVerification1() {
      if (this.checkbox == false) {
        this.snackbarText2 = "Do you agree with the terms?..";
        this.snackbar2 = true;
      } else if (this.intput_username == "") {
        this.snackbarText2 = "Provide username..";
        this.snackbar2 = true;
      } else if (this.intput_shopName == "") {
        this.snackbarText2 = "Provide shop name.";
        this.snackbar2 = true;
      } else if (this.county == "") {
        this.snackbarText2 = "Provide county.";
        this.snackbar2 = true;
      } else if (this.user_state == "") {
        this.snackbarText2 = "Provide user type.";
        this.snackbar2 = true;
      } else if (this.phone_no == "") {
        this.snackbarText2 = "Provide phone number.";
        this.snackbar2 = true;
      } else {
        this.progress_bar = true;
        this.configureRecaptcha2();
        const phoneNumber = "+254" + this.phone_no; //user phone number
        this.appVerifier2 = window.recaptchaVerifier;
        console.log("init SMS", this.appVerifier2, "\n", phoneNumber);
        firebase.auth().languageCode = "en";
        firebase
          .auth()
          .signInWithPhoneNumber(phoneNumber, this.appVerifier2)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).

            window.confirmationResult = confirmationResult;
            this.confirmation_Result = confirmationResult;
            this.code_state1 = true;
            this.progress_bar = false;
            this.timerEnabled = true;
            console.log("Result", this.confirmation_Result, "OTP sent");
            this.snackbar = true;
            this.snackbarText = "OTP was successfully";
            //this.$toast.success("Otp sent successfully");
          })
          .catch((error) => {
            // Error; SMS not sent
            this.progress_bar = false;
            console.log("Error", error);
            this.snackbar2 = true;
            this.snackbarText2 = error;
          });
      }
    },
    ConfirmCode1() {
      console.log("Code sent to you.", this.code_no1);

      var credential = firebase.auth.PhoneAuthProvider.credential(
        this.confirmation_Result.verificationId,
        this.code_no1
      );
      if ((this.code_no1 = "")) {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide Code sent to you";
        console.log("Provide Code sent to you");
      } else {
        console.log("Verify Code", this.code_no1);
        this.progress_bar = true;
        firebase
          .auth()
          .signInWithCredential(credential)
          .then((user) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            //this.$toast.success("Otp sent successfully");
            // this.$router.push("/");
            this.UploadRecord();
          })
          .catch((error) => {
            this.progress_bar = false;
            // Error; SMS not sent
            console.log("Error", error);
            this.snackbar2 = true;
            this.snackbarText2 = error;
          });
      }
    },
    // handle otpsend
    sendOtpForVerification() {
      if (this.phone_number == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide phone number";
      } else {
        this.progress_bar = true;
        this.configureRecaptcha();
        const phoneNumber = "+254" + this.phone_number; //user phone number
        this.appVerifier2 = window.recaptchaVerifier;
        console.log("init SMS", this.appVerifier2, "\n", phoneNumber);
        firebase.auth().languageCode = "en";
        firebase
          .auth()
          .signInWithPhoneNumber(phoneNumber, this.appVerifier2)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).

            window.confirmationResult = confirmationResult;
            this.confirmation_Result = confirmationResult;
            this.code_state = true;
            this.progress_bar = false;
            this.timerEnabled = true;
            console.log("Result", this.confirmation_Result, "OTP sent");
            this.snackbar = true;
            this.snackbarText = "OTP was successfully";
            //this.$toast.success("Otp sent successfully");
          })
          .catch((error) => {
            // Error; SMS not sent
            this.progress_bar = false;
            console.log("Error", error);
            this.snackbar2 = true;
            this.snackbarText2 = error;
          });
      }
    },
    ConfirmCode() {
      console.log("Code sent to you.", this.code_no);

      var credential = firebase.auth.PhoneAuthProvider.credential(
        this.confirmation_Result.verificationId,
        this.code_no
      );
      if ((this.code_no = "")) {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide Code sent to you";
        console.log("Provide Code sent to you");
      } else {
        console.log("Verify Code", this.code_no);
        this.progress_bar = true;
        firebase
          .auth()
          .signInWithCredential(credential)
          .then((user) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            //this.$toast.success("Otp sent successfully");
            this.$router.push("/");
          })
          .catch((error) => {
            this.progress_bar = false;
            // Error; SMS not sent
            console.log("Error", error);
            this.snackbar2 = true;
            this.snackbarText2 = error;
          });
      }
    },

    checkUser() {
      if (this.$fire.auth.currentUser != null) {
        this.s = true;
      } else {
        this.s = false;
      }
    },
    signUpGoogle() {
      let that = this;
      const provider = new this.$fireModule.auth.GoogleAuthProvider();
      this.$fire.auth
        .signInWithPopup(provider)
        .catch((error) => {
          console.log(error);
          that.snackbar2 = true;
          that.snackbarText2 = error;
        })
        .then((user) => {
          that.snackbar = true;
          that.snackbarText = "Sign up success";
          this.showauth = true;
          this.showLogin = true;
          this.auth_state = true;

          this.$router.push("/905/admin");
        });
    },
    login() {
      let that = this;
      that.progress_bar = true;
      const mAuth = this.$fire.auth;
      mAuth
        .signInWithEmailAndPassword(this.auth.email, this.auth.password)
        .catch(function (error) {
          that.snackbarText = error.message;
          that.snackbar = true;
          that.progress_bar = false;
        })
        .then((user) => {
          that.progress_bar = false;
          //we are signed in
          this.$router.push("/905/admin");
        });
    },
    signUp() {
      if (this.auth.email == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide email address";
      } else if (this.auth.password == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide password";
      } else {
        const mAuth = this.$fire.auth;
        this.progress_bar2 = true;
        // if (this.password === this.registrationPassword) {
        mAuth
          .createUserWithEmailAndPassword(this.auth.email, this.auth.password)
          .catch((error) => {
            console.log(error);
            this.snackbar2 = true;
            this.snackbarText2 = error;
            this.progress_bar2 = false;
          })
          .then((user) => {
            this.$router.push("/905/admin");
          });
      }
    },
  },
  created() {
    this.checkUser();
  },
};
</script>

<style>
h1 {
  color: #f10000;
}

/* .card {
  width: 100%;
  height: 100vh;
  background: lightgray;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  color: #333;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  cursor: pointer;
  position: relative;
  transition: all 0.7s ease-in-out;
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  height: 100%;
  width: 100%;
  margin-top: 50px;
  background-color: #ffffff;
  bottom: 0;
  right: 0;
  transform: translatey(70px);
  border-radius: 100%;
  transition: all 0.7s ease-in-out;
}

.c-txt {
  z-index: 2;
}

.card:hover::before {
  transform: scale(7) translate(-40px);
}

.card:hover {
  box-shadow: 1px -10px 500px 500px #9fe4e400;
  color: #f3f3f3;
} */
</style>
