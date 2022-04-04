<template>
    <Menu :model="navs" style="width: 100%;height: 90vh;" />
</template>

<script lang="ts" setup>
import Menu from 'primevue/menu';
import { useI18n } from 'vue-i18n'
import {ref} from 'vue'

const { t } = useI18n()
let navs = ref([
    {
        label: t('navigator.normal.name'),
        items: [{
            label: t('navigator.normal.addBill'),
            icon: 'pi pi-fw pi-home',
            to:"/"
        },
        {
            label: t('navigator.normal.statistics'),
            icon: 'pi pi-database',
            to:"/statistics"
        },
        {
            label:t('navigator.normal.automaticBill'),
            icon:'pi pi-code',
            to:"/automaticBill"
        }
        ]
    },
    {
        label: t('navigator.analysis.name'),
        items: [{
            label: t('navigator.analysis.spendingAnalysis'),
            icon: 'pi pi-chart-bar',
            to:'/spendingAnalysis'
        },
        {
            label: t('navigator.analysis.incomeAnalysis'),
            icon: 'pi pi-chart-bar',
            to:'/incomeAnalysis'
        }]
    },
    {
        label: t('navigator.settings.name'),
        items: [{
            label: t('navigator.settings.basic'),
            icon: 'pi pi-fw pi-cog',
            to:'/basicSetting'
        }]
    }
])
</script>
