<template>
    <Menu :model="navs" style="width: 100%;height: 90vh;" class="p-card">
        <template #item="{ item }">
            <div v-if="item.items">
                {{ item.label }}
            </div>
            <div v-else>
                <router-link :to="item.to!" class="p-menuitem-link" style="border-radius:10px;color: inherit;"
                    @click="setActive(item.key!)">
                    <i :class="[item.icon, 'p-menuitem-icon']" style="color:inherit" />
                    {{ item.label }}
                </router-link>
            </div>
        </template>
    </Menu>
</template>

<script lang="ts" setup>
import Menu, { MenuProps } from 'primevue/menu';
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t } = useI18n()
let navs = ref<MenuProps['model']>([
    {
        label: t('navigator.normal.name'),
        items: [{
            label: t('navigator.normal.addBill'),
            icon: 'pi pi-fw pi-home',
            to: "/",
            key: '0-0',
            style: {
                color: 'var(--primary-color)'
            }
        },
        {
            label: t('navigator.normal.statistics'),
            icon: 'pi pi-database',
            to: "/statistics",
            key: '0-1'
        },
        {
            label: t('navigator.normal.automaticBill'),
            icon: 'pi pi-code',
            to: "/automaticBill",
            key: '0-2'
        }
        ]
    },
    {
        label: t('navigator.analysis.name'),
        items: [{
            label: t('navigator.analysis.spendingAnalysis'),
            icon: 'pi pi-chart-bar',
            to: '/spendingAnalysis',
            key: '1-0'
        },
        {
            label: t('navigator.analysis.incomeAnalysis'),
            icon: 'pi pi-chart-bar',
            to: '/incomeAnalysis',
            key: '1-1'
        }]
    },
    {
        label: t('navigator.settings.name'),
        items: [{
            label: t('navigator.settings.basic'),
            icon: 'pi pi-fw pi-cog',
            to: '/basicSetting',
            key: '2-0'
        }]
    }
])

let active = ref('0-0')
function setActive(key: string) {
    navs.value![Number(active.value[0])].items![Number(active.value[2])].style = {}
    navs.value![Number(key[0])].items![Number(key[2])].style = { color: 'var(--primary-color)' }
    active.value = key
}
</script>
