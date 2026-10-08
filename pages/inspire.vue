<template>
  <v-card elevation="0">
    <v-card-title>Upload Post</v-card-title>
    <v-row>
      <v-col cols="12" md="6" lg="6" class="text-center">
        <div>
          <dropzone
            id="foo"
            ref="el"
            @vdropzone-success="handleSuccess"
            :options="options"
            :height="600"
            @vdropzone-error="handleError"
            @vdropzone-complete="afterCompletePoster"
          ></dropzone>
        </div>
        <div class="d-flex" style="margin: 12px">
          <v-btn icon @click="clearDropzone">
            <div class="d-flex">
              <v-icon small color="red">mdi-close</v-icon>
            </div>
          </v-btn>
          <span @click="clearDropzone" style="margin-top: 4px; color: red">
            Clear Drop Zone</span
          >
          <!-- <v-btn icon>
                          <v-icon small color="white">mdi-share-variant</v-icon>
                        </v-btn> -->
        </div>
      </v-col>
      <v-col cols="12" md="6" lg="6" class="text-center">
        <div class="container">
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="title"
                    :counter="10"
                    label="Title"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="body"
                    :counter="10"
                    label="Category"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="12">
                  <v-textarea
                    v-model="description"
                    solo
                    name="input-7-4"
                    label="Description"
                  ></v-textarea>
                </v-col>

                <v-col cols="12" md="12">
                  <v-btn color="primary" @click="UploadPost">Upload Post</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>

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
          <v-snackbar color="error" :timeout="2500" v-model="snackbar2" outlined center>
            {{ snackbarText2 }}
          </v-snackbar>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import Dropzone from "nuxt-dropzone";
import "nuxt-dropzone/dropzone.css";
import { uuid } from "vue-uuid";
import axios from "axios";

export default {
  components: {
    Dropzone,
  },
  name: "InspirePage",
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
      imageUrl: null,
      // See https://rowanwins.github.io/vue-dropzone/docs/dist/index.html#/props
      options: {
        url: "http://httpbin.org/anything",
      },
    };
  },
  methods: {
    handleError(file, errorMessage, xhr) {
      // Handle error event here
      console.error("Error uploading file:");
      this.snackbar2 = true;
      this.snackbarText2 = "Error uploading file";
    },
    handleSuccess(file, response) {
      // Handle success event here
      console.log("File uploaded successfully!", response);
      this.snackbar = true;
      this.snackbarText = "File uploaded";
    },
    clearDropzone() {
      this.$refs.el.dropzone.removeAllFiles();
    },
    async afterCompletePoster(upload2) {
      const storageRef = this.$fire.storage.ref();
      var imageNameP = uuid.v1();
      try {
        //save image
        let file = upload2;
        var metadata = {
          contentType: "image/png",
        };
        var imageRef = storageRef.child(`posts/${imageNameP}.png`);
        await imageRef.put(file, metadata);
        var downloadURLP = await imageRef.getDownloadURL();

        this.imageUrl = downloadURLP;
        console.log("image url", downloadURLP);
        this.snackbar = true;
        this.snackbarText = "Image Uploaded";
      } catch (error) {
        this.snackbar2 = true;
        this.snackbarText2 = error;
        console.log(error);
      }
    },
    UploadPost() {
      let that = this;
      if (that.title == "") {
        that.snackbarText2 = "Provide title..";
        that.snackbar2 = true;
      } else if (that.body == "") {
        that.snackbarText2 = "Provide category.";
        that.snackbar2 = true;
      } else if (that.description == "") {
        that.snackbarText2 = "Provide description.";
        that.snackbar2 = true;
      } else if (that.imageUrl == null) {
        that.snackbarText2 = "Provide image.";
        that.snackbar2 = true;
      } else {
        that.show6 = true;
        axios
          .post("https://node-mysql-5c19e7a5ca18.herokuapp.com/posts/uploadPost", {
            title: that.title,
            body: that.body,
            description: that.description,
            image: that.imageUrl,
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
  },
  mounted() {
    // Everything is mounted and you can access the dropzone instance
    const instance = this.$refs.el.dropzone;
  },
};
</script>
