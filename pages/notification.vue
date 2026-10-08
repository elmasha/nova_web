<template>
  <div class="container">
    <v-row>
      <v-col cols="12" sm="6" md="6">
        <div>
          <div class="d-flex">
            <nuxt-link style="text-decoration: none; color: red" to="/">
              <v-chip class="ma-2" color="red">
                <v-icon color="white">mdi-chevron-left</v-icon>
              </v-chip>
            </nuxt-link>
            <h3 style="color: grey; margin-top: 10px">Notifications</h3>
          </div>
        </div>
      </v-col>
      <v-col cols="12" sm="12" md="12">
        <div class="">
          <v-card color="white" light elevation="0">
            <div class="d-flex">
              <v-text-field
                style="margin: 14px"
                v-model="notifications_search"
                @change="Search_notifications(notifications_search)"
                placeholder="Search notifications"
                filled
                rounded
                dense
                prepend-inner-icon="mdi-magnify"
              >
              </v-text-field>
              <v-spacer></v-spacer>
              <v-spacer></v-spacer>
            </div>
            <div>
              <v-list two-line>
                <v-list-item-group active-class="pink--text" multiple>
                  <template v-for="(item, index) in Notification">
                    <v-list-item :key="item.id">
                      <template v-slot:default="{ active }">
                        <v-list-item-content>
                          <v-list-item-title
                            class="text--primary"
                            v-text="item.title"
                          ></v-list-item-title>

                          <!-- <v-list-item-subtitle
                            class="text--primary"
                            v-text="item.headline"
                          ></v-list-item-subtitle> -->

                          <v-list-item-subtitle v-text="item.body"></v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                          <!-- <v-list-item-action-text v-text="item.action"></v-list-item-action-text> -->
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      active: false,
      notifications_search: "",
      Notification: [],
    };
  },
  created() {
    this.FetchUser();
  },
  methods: {
    FetchUser() {
      let that = this;
      that.Notification.splice(that.Notification);
      axios
        .get(
          `http://localhost:5055/notification/getNotification/${that.$fire.auth.currentUser.uid}`,
          {}
        )
        .then(function (response) {
          console.log("Payment page", response.data[0]);
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;

            that.Notification = response.data;
            console.log("Notification", that.Notification);
          } else if (response.status == 400) {
            that.snackbarError = true;
            that.snackbarTextError = response.data;
          }
        })
        .catch(function (error) {
          console.log(error);
          that.snackbarTextError = error;
          that.snackbarError = true;
        });
    },
    Search_notifications(val) {
      if (val == "") {
        this.FetchUser();
      } else {
        let that = this;
        that.Notification.splice(that.Notification);
        axios
          .get(`http://localhost:5055/notification/searchNotification?query=${val}`, {})
          .then(function (response) {
            if (response.status == 200) {
              // that.snackbar = true;
              // that.snackbarText = response.data;
              that.Notification = response.data;
              console.log("Search Notification", that.Notification);
            } else if (response.status == 400) {
              that.snackbarError = true;
              that.snackbarTextError = response.data;
            }
          })
          .catch(function (error) {
            console.log(error);
            that.snackbarTextError = error;
            that.snackbarError = true;
          });
      }
    },
  },
};
</script>
<style scoped></style>
