<template>
  <TitleBar></TitleBar>
  <div class="page">
    <div class="nav">
      <Navigator />
    </div>
    <div class="view">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Navigator from './views/Navigator.vue';
import TitleBar from './components/TitleBar.vue';
</script>

<style scoped>
.page{
  display: flex;
  width: 100vw;
  padding-top: 1%;
  height: 90vh;
}

.nav{
  flex: 1;
  padding: 1%;
}

.view{
  flex: 6;
}
</style>

<style>
body{
  margin: 0;
  overflow-x: hidden;
}
</style>

