<template>
    <div class="text-center" style="padding-top: 1%;">
        <Dropdown
            :options="incomeAnalysisType"
            option-label="label"
            option-value="value"
            v-model="currentType"
            @change="updateData"
        />
        <div class="mt-5 pl-5 pr-5">
            <Chart type="bar" :data="analysisData" />
        </div>
    </div>
</template>


<script lang="ts" setup>
import { backgroundColor, incomeAnalysisMonth, incomeAnalysisYear } from '../store'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
const { t } = useI18n()
let incomeAnalysisType = [
    {
        label: t('incomeAnalysis.month'),
        value: 'month'
    }, {
        label: t('incomeAnalysis.year'),
        value: 'year'
    }]
let currentType = ref<'year' | 'month'>('month')
let labels = ref<string[]>([])
let sums = ref<number[]>([])
let averages = ref<number[]>([])
let counts = ref<number[]>([])
function updateData() {
    labels.value = []
    sums.value = []
    averages.value = []
    counts.value = []
    if (currentType.value === 'month') {
        for (let i = 0; i < incomeAnalysisMonth.value.length; ++i) {
            labels.value.push(incomeAnalysisMonth.value[i].firstClass)
            sums.value.push(incomeAnalysisMonth.value[i].moneySum)
            averages.value.push(incomeAnalysisMonth.value[i].moneyAverage)
            counts.value.push(incomeAnalysisMonth.value[i].count)
        }
    }
    else {
        for (let i = 0; i < incomeAnalysisYear.value.length; ++i) {
            labels.value.push(incomeAnalysisYear.value[i].firstClass)
            sums.value.push(incomeAnalysisYear.value[i].moneySum)
            averages.value.push(incomeAnalysisYear.value[i].moneyAverage)
            counts.value.push(incomeAnalysisYear.value[i].count)
        }
    }
}
updateData()
let analysisData = ref({
    labels: labels,
    datasets: [
        {
            label: t('incomeAnalysis.sum'),
            backgroundColor: backgroundColor[0],
            data: sums
        },
        {
            label: t('incomeAnalysis.average'),
            backgroundColor: backgroundColor[1],
            data: averages
        }
    ]
})
</script>