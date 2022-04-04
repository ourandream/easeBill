<template>
    <Toast />
    <div class="text-center relative">
        <p
            class="absolute"
            style="left: 2.5%;"
        >{{ `${t('statistics.currentTotal')}:${currentTotal}` }}</p>
        <Button
            icon="pi pi-caret-up"
            class="p-button-rounded p-button-secondary absolute"
            style="right: 2.5%;"
            @click="displayMonthBegin = true"
        />
        <h2>{{ t('statistics.current') }}</h2>
        <Dialog :header="t('statistics.monthBegin')" v-model:visible="displayMonthBegin" modal>
            <DataTable
                :value="[{ ...statistics?.monthBegin, monthBeginTotal: monthBeginTotal }]"
                responsiveLayout="scroll"
                showGridlines
            >
                <Column v-for="i of category?.accounts" :field="i" :header="i" />
                <Column field="monthBeginTotal" :header="t('statistics.monthBeginTotal')" />
            </DataTable>
        </Dialog>

        <div class="cards flex justify-content-around">
            <Card v-for="i of category?.accounts" style="width: 15%;">
                <template #header>
                    <img alt="accounts" src="../assets/accounts.jpg" />
                </template>
                <template #title>{{ i }}</template>
                <template #content>{{ statistics ? statistics.current[i] : null }}</template>
            </Card>
        </div>
        <div class="relative">
            <h2>{{ t('statistics.budgets.name') }}</h2>
            <Button
                class="absolute top-0 p-button-rounded"
                style="right: 2.5%;"
                icon="pi pi-user-edit"
                @click="showSetPlan = true"
            />
            <Dialog v-model:visible="showSetPlan" modal :draggable="false">
                <template #header>
                    <h3>{{ t('statistics.setPlan') }}</h3>
                </template>
                <InputNumber v-model="newPlan"></InputNumber>
                <template #footer>
                    <div class="text-center">
                        <Button @click="doSetPlan">{{ t('global.confirm') }}</Button>
                    </div>
                </template>
            </Dialog>
        </div>
        <div class="relative">
            <div class="absolute top-auto w-3 h-7" style="left: 2.5%;">
                <Panel class="mb-3">
                    <template #header>
                        <div class="text-center w-full">{{ t('statistics.budgets.dailyPlan') }}</div>
                    </template>
                    {{ statistics ? statistics.budgets.dailyPlan : null }}
                </Panel>
                <Panel>
                    <template #header>
                        <div class="text-center w-full">{{ t('statistics.budgets.dailyRemain') }}</div>
                    </template>
                    {{ statistics ? statistics.budgets.dailyRemain : null }}
                </Panel>
            </div>
            <div class="absolute top-auto w-3 h-7" style="right: 2.5%;">
                <Panel class="mb-3">
                    <template #header>
                        <div class="text-center w-full">{{ t('statistics.budgets.plan') }}</div>
                    </template>
                    {{ statistics ? statistics.budgets.plan : null }}
                </Panel>
                <Panel>
                    <template #header>
                        <div class="text-center w-full">{{ t('statistics.budgets.remain') }}</div>
                    </template>
                    {{ statistics ? statistics.budgets.remain : null }}
                </Panel>
            </div>
            <Knob v-model="used" :max="plan" readonly :size="200" />
            <p>{{ t('statistics.budgets.used') }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { statistics, category, setPlan } from '../store'
import { useToast } from 'primevue/usetoast';

const { t } = useI18n()
const toast = useToast()

let used = ref(statistics.value.budgets.used)
let plan = ref(statistics.value.budgets.plan)
let displayMonthBegin = ref(false)
let currentTotal = computed(() => {
    if (statistics.value && category.value) {
        let sum = 0
        for (let i = 0; i < category.value.accounts.length; ++i) {
            sum += statistics.value.current[category.value.accounts[i]]
        }
        return sum.toFixed(2)
    }
    else {
        return 0
    }
})
let monthBeginTotal = computed(() => {
    if (statistics.value && category.value) {
        let sum = 0
        for (let i = 0; i < category.value.accounts.length; ++i) {
            sum += statistics.value.monthBegin[category.value.accounts[i]]
        }
        return sum.toFixed(2)
    }
    else {
        return 0
    }
})
let newPlan = ref(0)
let showSetPlan = ref(false)
async function doSetPlan() {
    showSetPlan.value = false
    await setPlan(newPlan.value)
    toast.add({
        detail: t('statistics.setPlanSuccess', { newPlan: newPlan.value }),
        life: 3000,
        severity: 'success'
    })
}
</script>

<style scoped>
.cards {
    width: 100%;
}

.card {
    width: 30%;
}
</style>

<style>
.p-knob-text {
    font-size: 1rem;
    text-align: center;
}
</style>