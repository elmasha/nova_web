<template>
  <v-app>
    <v-main>
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout'
};
</script>

<style>
* {
  font-family: 'Inter', 'Lato', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

html,
body {
  background: #ffffff;
  color: #2c3e50;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Fix: page-level scroll behaviour on mobile */
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  overflow-x: hidden;
}

/* Vuetify main should not add extra padding on top of what pages already have */
.v-main {
  background: #ffffff;
}

/* Prevent sticky navbar from jumping on iOS */
@supports (-webkit-touch-callout: none) {
  .v-application {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
}
</style>