<template>
  <div class="container">
    <v-card elevation="0" color="white">
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div>
            <div class="d-flex">
              <nuxt-link style="text-decoration: none; color: red" to="/">
                <v-chip class="ma-2" color="red">
                  <v-icon color="white">mdi-chevron-left</v-icon>
                </v-chip>
              </nuxt-link>
              <h3 style="color: grey; margin-top: 10px">Upload Stock</h3>
              <v-spacer></v-spacer>
            </div>
          </div>
        </v-col>

        <v-col v-show="true" cols="12" sm="12" md="12">
          <div>
            <br />
            <div class="d-flex text-center">
              <div>
                <v-chip
                  style="margin: 4px"
                  :input-value="true"
                  active-class="indigo--text"
                >
                  {{ cate }}
                </v-chip>
              </div>

              <div>
                <v-chip
                  style="margin: 4px"
                  :input-value="true"
                  active-class="indigo--text"
                >
                  {{ item_type }}
                </v-chip>
              </div>
            </div>

            <v-form ref="form" lazy-validation>
              <div style="padding: 0px">
                <v-item-group multiple>
                  <v-subheader>Category</v-subheader>
                  <v-item
                    v-for="category in categories"
                    :key="category"
                    v-slot="{ active }"
                  >
                    <v-chip
                      style="margin: 4px"
                      active-class="orange--text"
                      filter
                      :input-value="active"
                      @click="
                        (cate = category.cat),
                          (cat_ID = category.cat_id),
                          FetchProductSearchAll(category.cat)
                      "
                    >
                      {{ category.cat }}
                    </v-chip>
                  </v-item>
                </v-item-group>
                <br />
              </div>

              <v-text-field
                required
                v-model="cate"
                :counter="10"
                :rules="nameRules"
                label="Category"
                placeholder="Enter Category"
              ></v-text-field>

              <div class="container">
                {{ posterUrl }}
                <br />
                {{ item_units }}
                <v-flex>
                  <div class="with-header scrollmenu d-flex" key="" height="400">
                    <div
                      class="col-md-4"
                      v-for="all_product in all_products"
                      :key="all_product.id"
                      :id="all_products.id"
                      :all_product="all_product.all_product"
                    >
                      <v-card class="mx-auto" max-width="200">
                        <v-img
                          contain
                          height="200"
                          width="100%"
                          class="white--text align-top"
                          :src="all_product.item_im"
                          @click="
                            (item_name = all_product.item_b),
                              (input_Type_update = all_product.item_type),
                              (si_unit = all_product.item_sku_unit);
                            posterUrl = all_product.item_im;
                          "
                        >
                          <template v-slot:placeholder>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-progress-circular
                                indeterminate
                                color="red lighten-6"
                              ></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </v-card>
                    </div>
                  </div>
                </v-flex>
              </div>
              <div>
                <v-item-group multiple>
                  <v-subheader>Select Type</v-subheader>
                  <v-item v-for="type in types" :key="type" v-slot="{ active }">
                    <v-chip
                      style="margin: 4px"
                      active-class="orange--text"
                      :input-value="active"
                      filter
                      @click="(item_type = type.type), FetchProductSearchAll2(type.type)"
                    >
                      {{ type.type }}
                    </v-chip>
                  </v-item>
                </v-item-group>
                <br />
              </div>
              <div>
                <v-item-group multiple>
                  <v-subheader>Select Unit</v-subheader>
                  <v-item v-for="type in units" :key="type" v-slot="{ active }">
                    <v-chip
                      filter
                      style="margin: 4px"
                      active-class="orange--text"
                      :input-value="active"
                      @click="item_units = type.units"
                    >
                      {{ type.units }}
                    </v-chip>
                  </v-item>
                </v-item-group>
                <br />

                <strong>{{ item_units }}</strong>
              </div>
              <div class="d-flex">
                <v-text-field
                  v-model="item_type"
                  :rules="nameRules2"
                  label="Type"
                ></v-text-field>
                <v-text-field
                  v-model="unit_amount"
                  :rules="nameRules2"
                  label="Unit amount"
                ></v-text-field>
                <!-- <v-btn color="primary" class="mr-4" @click="UploadCategory(cate)">
                  Upload Type
                </v-btn> -->
              </div>

              <v-btn color="red" style="color: white" class="mr-4" @click="UploadItem">
                Upload item
              </v-btn>
            </v-form>
          </div>
        </v-col></v-row
      >
    </v-card>
  </div>
</template>
<script>
import Dropzone from "nuxt-dropzone";
import "nuxt-dropzone/dropzone.css";
import { uuid } from "vue-uuid";
import axios from "axios";
export default {
  data() {
    return {
      all_products: [],
      products: [],
      brands: [],
      unit_amount: null,
      categories: [],
      types: [],
      item_type_s: null,
      item_name_s: null,
      item_type: "",
      item_name: "",
      item_brand: "",
      dropState: false,
      item_units: "",
      unit_update: "",
      units: "",
      nameRules: [
        (v) => !!v || "Field is required",
        (v) => (v && v.length <= 18) || "Field must be less than 10 characters",
      ],
      nameRules2: [
        (v) => !!v || "Field is required",
        (v) => (v && v.length <= 18) || "Field must be less than 10 characters",
      ],

      selectItem: [
        "ltr",
        "ml",
        "kg",
        "g",
        "Jumbo pack",
        "pack",
        "meter",
        "Crate",
        "Bunch",
        "Bag",
        "Gram",
        "Bunch",
      ],
      skuUnit: "",
      cate: "",
      cat_ID: "",
      new_cat_id: "",
      inputCat: "",
      options: {
        url: "http://httpbin.org/anything",
        maxFilesize: 2, // Max file size in megabytes
        acceptedFiles: "image/*", // Accept only image files
      },
      snackbar: false,
      snackbarText: "",
      snackbar2: false,
      snackbarText2: "",
      posterUrl: "",
      images: [],
      units: [],
    };
  },
  methods: {
    UploadItem() {
      if (this.cate == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide category";
      } else if (this.posterUrl == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide a item image";
      } else if (this.item_type == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide a item type";
      } else if (this.item_units == "") {
        this.snackbar2 = true;
        this.snackbarText2 = "Provide a item unit";
      } else {
        this.id = uuid.v1();
        console.log(uuid.v1());
        let ID = uuid.v1();
        axios
          .post("http://localhost:5055/upload/uploadStockItems", {
            created_at: new Date(),
            discount: false,
            itemAmount: 0,
            itemCategory: this.cate,
            itemDescription: "",
            itemDiscount: Number(0),
            itemID: this.cate + this.item_units,
            itemImage: this.posterUrl,
            itemName: this.cate,
            itemSKUnits: this.item_type,
            itemStatus: 0,
            itemType: this.item_type,
            itemUnits: this.item_units,
            product_id: this.cate + this.item_units,
            updated_at: new Date(),
            userState: "Supplier",
            uid: this.$fire.auth.currentUser,
            category: this.cate,
            unit_id: this.item_units,
            unit_amount: this.unit_amount,
          })
          .then(function (response) {
            if (response.status == 200) {
              console.log(response);
              this.snackbar = true;
              this.snackbarText = response.data;
            } else if (response.status == 400) {
              this.snackbar2 = true;
              this.snackbarText2 = response.data;
            }
          })
          .catch(function (error) {
            console.log(error);
            // this.snackbarTextError = error;
            // this.snackbarError = true;
          });
      }
    },
    FetchProductSearchAll2(val) {
      const db = this.$fire.firestore;
      if (val != null) {
        this.all_products.splice(this.all_products);
        db.collection("items")
          .where("item_type", "==", val)
          .get()
          .then((queryResult6) => {
            queryResult6.forEach((doc) => {
              const data = {
                id: doc.id,
                item_b: doc.data().item_brand,
                item_cat_id: doc.data().item_category,
                item_im: doc.data().item_image,
                item_un: doc.data().item_unit,
                item_sku_unit: doc.data().item_sku_unit,
                item_type: doc.data().item_type,
              };
              this.all_products.push(data);
              console.log(this.all_products);
            });
          });
      } else {
      }
    },
    FetchProductSearchAll(val) {
      const db = this.$fire.firestore;
      if (val != null) {
        this.all_products.splice(this.all_products);
        db.collection("items")
          .where("item_category", "==", val)
          .get()
          .then((queryResult6) => {
            queryResult6.forEach((doc) => {
              const data = {
                id: doc.id,
                item_b: doc.data().item_brand,
                item_cat_id: doc.data().item_category,
                item_im: doc.data().item_image,
                item_un: doc.data().item_unit,
                item_sku_unit: doc.data().item_sku_unit,
                item_type: doc.data().item_type,
              };
              this.all_products.push(data);
              console.log(this.all_products);
            });
          });
      } else {
      }
    },
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
    FetchProducts() {
      if ((this.item_name_s == null) | (this.item_type_s == null)) {
        const db = this.$fire.firestore;
        this.products.splice(this.products);
        db.collection("items")
          .get()
          .then((queryResult6) => {
            queryResult6.forEach((doc) => {
              const data = {
                id: doc.id,
                item_b: doc.data().item_brand,
                item_cat_id: doc.data().item_category,
                item_im: doc.data().item_image,
                item_un: doc.data().item_unit,
                item_id: doc.data().item_id,
                item_sku_unit: doc.data().item_sku_unit,
                item_type: doc.data().item_type,
              };

              this.products.push(data);
              console.log(this.products);
            });
          });
      } else {
        const db = this.$fire.firestore;
        this.products.splice(this.products);
        db.collection("items")
          .where("item_category", "==", this.item_name_s)
          .where("tem_category", "==", this.item_type_s)
          .get()
          .then((queryResult6) => {
            queryResult6.forEach((doc) => {
              const data = {
                id: doc.id,
                item_b: doc.data().item_brand,
                item_cat_id: doc.data().item_category,
                item_im: doc.data().item_image,
                item_id: doc.data().item_id,
                item_un: doc.data().item_unit,
                item_sku_unit: doc.data().item_sku_unit,
                item_type: doc.data().item_type,
              };
              this.products.push(data);
              console.log(this.products);
            });
          });
      }
    },
    FetchProducts2() {
      if ((this.item_name_s == null) | (this.item_type_s == null)) {
        const db = this.$fire.firestore;
        this.all_products.splice(this.all_products);
        db.collection("items")
          .get()
          .then((queryResult6) => {
            queryResult6.forEach((doc) => {
              const data = {
                id: doc.id,
                item_b: doc.data().item_brand,
                item_cat_id: doc.data().item_category,
                item_im: doc.data().item_image,
                item_un: doc.data().item_unit,
                item_id: doc.data().item_id,
                item_sku_unit: doc.data().item_sku_unit,
                item_type: doc.data().item_type,
              };

              this.all_products.push(data);
              console.log(this.all_products);
            });
          });
      } else {
        const db = this.$fire.firestore;
        this.products.splice(this.products);
        db.collection("items")
          .where("item_category", "==", this.item_name_s)
          .where("tem_category", "==", this.item_type_s)
          .get()
          .then((queryResult6) => {
            queryResult6.forEach((doc) => {
              const data = {
                id: doc.id,
                item_b: doc.data().item_brand,
                item_cat_id: doc.data().item_category,
                item_im: doc.data().item_image,
                item_un: doc.data().item_unit,
                item_id: doc.data().item_id,
                item_sku_unit: doc.data().item_sku_unit,
                item_type: doc.data().item_type,
              };
              this.products.push(data);
              console.log(this.products);
            });
          });
      }
    },
    FetchBrands() {
      const db = this.$fire.firestore;
      this.brands.splice(this.brands);
      db.collection("Brand")
        .get()
        .then((queryResult6) => {
          queryResult6.forEach((doc) => {
            const data = {
              id: doc.id,
              brand: doc.data().brand,
            };

            this.brands.push(data);
            console.log(this.brands);
          });
        });
    },
    Fetch() {
      const db = this.$fire.firestore;
      this.categories.splice(this.categories);
      db.collection("categories")
        .get()
        .then((queryResult6) => {
          queryResult6.forEach((doc) => {
            const data = {
              id: doc.id,
              cat: doc.data().category,
              cat_id: doc.data().cat_id,
            };

            this.categories.push(data);
            console.log(this.categories);
          });
        });
    },
    FetchTypes() {
      const db = this.$fire.firestore;
      this.types.splice(this.types);
      db.collection("Type")
        .get()
        .then((queryResult6) => {
          queryResult6.forEach((doc) => {
            const data = {
              id: doc.id,
              type: doc.data().type,
            };

            this.types.push(data);
            console.log(this.categories);
          });
        });
    },
    FetchUnits() {
      const db = this.$fire.firestore;
      this.units.splice(this.units);
      db.collection("units")
        .get()
        .then((queryResult6) => {
          queryResult6.forEach((doc) => {
            const data = {
              id: doc.id,
              units: doc.data().units,
            };
            this.units.push(data);
            console.log("Category " + this.categories);
          });
        });
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
        var imageRef = storageRef.child(`images/${imageNameP}.png`);
        await imageRef.put(file, metadata);
        var downloadURLP = await imageRef.getDownloadURL();
        this.images.push({
          src: downloadURLP,
        });
        this.posterUrl = downloadURLP;
        console.log(this.posterUrl);
        this.snackbar = true;
        this.snackbarText = "Image Uploaded";
      } catch (error) {
        this.snackbar2 = true;
        this.snackbarText2 = error;
        console.log(error);
      }
    },
  },
  created() {
    this.Fetch();
    this.FetchTypes();
    this.FetchProducts();
    this.FetchProducts2();
    this.FetchBrands();
    this.FetchUnits();
  },
};
</script>
<style lang=""></style>
