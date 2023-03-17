<template>
    <div class="text-right relative">
        <div class="absolute" style="left: 1%;top: 20%;">
            {{t('title')}}
        </div>
        <Button icon="pi pi-minus" class="p-button-text" @click="win.min"></Button>
        <Button :icon="maxIcon" class="p-button-text" @click="win.max"></Button>
        <Button icon="pi pi-times" class="p-button-text" @click="win.close"></Button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {useI18n} from 'vue-i18n'

let maxIcon = ref("pi pi-window-maximize")
let isMax = ref(false)
const {t}=useI18n()

let win = {
    min: () => { window.win.min() },
    max: () => {
        if (isMax.value) {
            window.win.default()
            maxIcon.value = "pi pi-window-maximize"
            isMax.value = false
        } else {
            window.win.max()
            maxIcon.value = "pi pi-window-minimize"
            isMax.value = true
        }
    },
    close: () => { window.win.close() }
}
</script>

<style scoped>
div {
    background-color: white;
    -webkit-app-region: drag;
}

div button{
    -webkit-app-region: no-drag;
}
</style>