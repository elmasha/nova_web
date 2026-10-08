<template>
  <div class="container">
    <v-card elevation="0" :loading="loading" class="mx-auto my-0">
      <v-card-actions>
        <v-btn style="margin: 10px" color="deep-black" text :to="`/`" icon>
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-card-actions>
      <template slot="progress">
        <v-progress-linear
          color="deep-purple"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>

      <v-img
        :src="image"
        class="white--text align-end"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        height="600px"
      >
        <div>
          <div>
            <h2 style="color: white; font-size: 1.6rem; margin: 8px">
              {{ title }}
            </h2>
          </div>
        </div>
      </v-img>

      <v-card-text>
        <v-row align="center" class="mx-0">
          <v-icon color="red" large>mdi-heart-multiple</v-icon>
          <div class="my-4 text-subtitle-1" style="color: red; font-size: 1.5rem">
            • {{ likes }}
          </div>
        </v-row>
        <br />
      </v-card-text>

      <v-divider class="mx-4"></v-divider>

      <v-card-text>
        <div>
          {{ description }}
        </div>
        <!-- <v-chip-group
          v-model="selection"
          active-class="deep-purple accent-4 white--text"
          column
        >
          <v-chip>5:30PM</v-chip>

          <v-chip>7:30PM</v-chip>

          <v-chip>8:00PM</v-chip>

          <v-chip>9:00PM</v-chip>
        </v-chip-group> -->
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import CryptoJS from "crypto-js";
import axios from "axios";
import dayjs from "@nuxtjs/dayjs";
import moment from "moment";
export default {
  data() {
    return {
      snackbar_s: false,
      snackbarText_s: "",
      snackbar: false,
      snackbar2: false,
      snackbarText: "",
      snackbarText2: "",
      title: "",
      body: "",
      description: "",
      image: null,
      likes: 0,
      postss: [],
    };
  },
  methods: {
    Fetch_Post() {
      let that = this;
      axios
        .get(
          `https://node-mysql-5c19e7a5ca18.herokuapp.com/posts/getPost/${that.$route.params.id}`,
          {}
        )
        .then(function (response) {
          if (response.status == 200) {
            // that.snackbar = true;
            // that.snackbarText = response.data;
            that.postss = response.data;
            that.title = that.postss[0].title;
            that.body = that.postss[0].body;
            that.likes = that.postss[0].likes;
            that.image = that.postss[0].image;
            that.description = that.postss[0].description;
            console.log("Post", that.postss[0].description);
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
    },
  },
  created() {
    this.Fetch_Post();
  },
  mounted() {},
};
</script>
<style></style>
