<template>
  <div class="container">
    <v-progress-linear
      v-show="progress_bar"
      indeterminate
      color="green"
    ></v-progress-linear>
    <div class="container">
      <v-card color="black" flat height="200px" tile>
        <v-row>
          <v-col cols="12" md="12" lg="12" sm="12"> </v-col>
          <v-col cols="12" md="12" lg="12" sm="12">
            <div class="container">
              <div class="d-flex">
                <v-btn icon to="/"><v-icon>mdi-arrow-left</v-icon></v-btn>

                <v-img style="margin-top: 10px" :src="logo" contain height="180"> </v-img>
                <v-spacer />
              </div>
            </div>

            <div class="container">
              <div class="d-flex">
                <v-spacer />
                <v-tabs color="green" centered :show-arrows="true">
                  <v-tab @click="register = false" value="one"
                    ><span>Reset pin</span></v-tab
                  >
                </v-tabs>
                <v-spacer />
              </div>
            </div>
            <v-row v-show="!register">
              <br />
              <br />
              <v-col class="text-center" v-show="!code_state" cols="12" md="12" sm="12">
                <div class="container">
                  <v-form>
                    <v-row>
                      <v-col cols="12">
                        <div class="container">
                          <h5>Provide Phone number to reset your pin</h5>
                        </div>
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
                                v-model="phone_no"
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
                      data-sitekey="AIzaSyB2Y6dTz49BnkQYls5ywP1EUKxa9HJ3d-Y"
                      data-callback="sendForm"
                      data-size="visible"
                    ></div>
                    <v-spacer />
                  </div>

                  <div class="d-flex">
                    <v-spacer />
                    <v-btn class="white--text" @click="sendOtpForVerification()"
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
                    <v-text-field
                      outlined
                      width="200"
                      v-model="code_no"
                      :counter="16"
                      type="phone"
                      label="Verification Code"
                    ></v-text-field>
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

            <v-spacer />
          </v-col>
        </v-row>
      </v-card>
    </div>
    <v-snackbar color="white--text" :timeout="4000" v-model="snackbar" center>
      {{ snackbarText }}
    </v-snackbar>
    <v-snackbar color="red" :timeout="4000" v-model="snackbar2" outlined bottom center>
      {{ snackbarText2 }}
    </v-snackbar>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import Vue from "vue";
import VueCountryCode from "vue-country-code";

Vue.use(VueCountryCode);
export default {
  data() {
    return {
      logo: require("@/assets/logo.svg"),
      intput_username: "",
      intput_email: "",
      intput_farmName: "",
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
      phone_no_r: "",
      code_no_r: "",
      request_no: null,
      appVerifier2: null,
      appVerifier2_r: null,
      confirmation_Result: null,
      confirmation_Result_r: null,
      phone: "",
      county: "",
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
        "recaptcha-container2",
        {
          size: "visible",
          callback: (response) => {
            console.log(response);
          },
        }
      );
    },
    // handle otpsend
    sendOtpForVerification() {
      if (this.phone_no == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide phone number";
      } else {
        this.progress_bar = true;
        this.configureRecaptcha();
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
            this.resetPin();
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
    resetPin() {
      const db = this.$fire.firestore;
      console.log("Reset pin", uuid.v1());
      db.collection("charge24_admin_user")
        .doc(this.$route.params.id)
        .update({
          pin: null,
        })
        .then(() => {
          this.$router.push("/");
        })
        .catch(function (error) {
          console.log("Error adding document: ", error);
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

<style></style>
