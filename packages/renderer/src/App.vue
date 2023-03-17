<template>
  <TitleBar></TitleBar>
  <div class="page">
    <div class="nav">
      <Navigator />
    </div>
    <div class="view">
      <div class="p-card" style="height:90vh;overflow-y: auto;">
          <div>
            <router-view></router-view>
          </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Navigator from './views/Navigator.vue';
import TitleBar from './components/TitleBar.vue';
</script>

<style>
#app {
  height: 100vh;
}
</style>

<style scoped>
.page {
  display: flex;
  width: 100vw;
  height: calc(90vh - 18px)
}

.nav {
  flex: 1;
  padding: 1%;
}

.view {
  flex: 6;
  padding-top: 1%;
  padding-right: 1%;
}
</style>

<style>
body {
  margin: 0;
  overflow-x: hidden;
  /* background-color: #eff3f8; */
}



.custom .p-scrollpanel-wrapper {
  border-right: 9px solid #f4f4f4;
}

.custom .p-scrollpanel-bar {
  background-color: #1976d2 !important;
  opacity: 1;
  transition: background-color .3s;
}

.custom .p-scrollpanel-bar:hover {
  background-color: #135ba1 !important;
}
</style>

