<template>
    <div class="text-center">
        <h2>{{ t('spendingAnalysis.name') }}</h2>
        <Dropdown
            v-model="type"
            :options="analysisTypes"
            option-label="name"
            option-value="value"
            @change="changeType"
            class="mb-4"
        />
        <div style="margin:2.5% 2.5%">
            <DataTable :value="tableData" show-gridlines>
                <Column v-for="i of heads" :header="i" :field="i" style="width: 25%;"></Column>
            </DataTable>
        </div>
        <Splitter style="height: 300px;margin: 0 2.5%;">
            <SplitterPanel class="flex align-items-center justify-content-center">
                <Chart
                    type="bar"
                    :data="chartDataAverage"
                    style="width: 300px;height: 300px;"
                    :height="300"
                />
            </SplitterPanel>
            <SplitterPanel class="flex align-items-center justify-content-center">
                <Chart type="pie" :data="chartData" style="width: 300px;" />
            </SplitterPanel>
        </Splitter>
    </div>
</template>

<script lang="ts" setup>
import { category, spendingsByFirstClass, getSpendingBySecondClass } from '../store'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t } = useI18n()
let firstClassLabels: string[] = []
let firstClassSpendings: number[] = []
let firstClassAverage:number[]=[]
for (let i of spendingsByFirstClass.value) {
    firstClassSpendings.push(i.money_sum)
    firstClassAverage.push(i.money_average)
    firstClassLabels.push(i.firstClass!)
}
let chartData = ref({
    labels: firstClassLabels,
    datasets: [{
        label: t('spendingAnalysis.spendingByFirstClass'),
        backgroundColor: ['#EC407A', '#AB47BC', '#42A5F5', '#7E57C2', '#66BB6A', '#FFCA28', '#26A69A'],
        data: firstClassSpendings
    }]
})
let chartDataAverage = ref({
    labels: firstClassLabels,
    datasets: [{
        label: t('spendingAnalysis.spendingByFirstClass'),
        backgroundColor: ['#EC407A', '#AB47BC', '#42A5F5', '#7E57C2', '#66BB6A', '#FFCA28', '#26A69A'],
        data: firstClassAverage
    }]
})
let analysisTypes: { name: string, value: string }[] = []
for (let i of Object.keys(category.value.spending)) {
    if (i === 'firstClass') {
        analysisTypes.push({ name: t('heads.firstClass'), value: i })
    }
    else {
        analysisTypes.push({ name: i, value: i })
    }
}
let tableData = ref<any[]>([{}])
let heads = ref<string[]>([])
for (let i of spendingsByFirstClass.value) {
    heads.value.push(i.firstClass!)
    tableData.value[0][i.firstClass!] = i.money_sum.toFixed(2)
}

let type = ref('firstClass')
let spendingBySecondClass = ref<SpendingsAnalysis[]>([])
async function changeType() {
    if (type.value === 'firstClass') {
        chartData.value.labels = firstClassLabels
        chartData.value.datasets[0].data = firstClassSpendings
        chartData.value.datasets[0].label = t('spendingAnalysis.spendingByFirstClass')
        chartDataAverage.value.labels=firstClassLabels
        chartDataAverage.value.datasets[0].data = firstClassSpendings
        chartDataAverage.value.datasets[0].label = t('spendingAnalysis.spendingByFirstClass')
        heads.value=[]
        tableData.value=[{}]
        for (let i of spendingsByFirstClass.value) {
            heads.value.push(i.firstClass!)
            tableData.value[0][i.firstClass!] = i.money_sum.toFixed(2)
        }
    }
    else {
        spendingBySecondClass = await getSpendingBySecondClass(type.value)
        let labels: string[] = []
        let spendings: number[] = []
        let averages:number[]=[]
        for (let i of spendingBySecondClass.value) {
            spendings.push(i.money_sum)
            averages.push(i.money_average)
            labels.push(i.secondClass!)
        }
        chartData.value.labels = labels
        chartData.value.datasets[0].data = spendings
        chartData.value.datasets[0].label = type.value
        chartDataAverage.value.labels = labels
        chartDataAverage.value.datasets[0].data = averages
        chartDataAverage.value.datasets[0].label = type.value
        heads.value=[]
        tableData.value=[{}]
        for (let i of spendingBySecondClass.value) {
            heads.value.push(i.secondClass!)
            tableData.value[0][i.secondClass!] = i.money_sum.toFixed(2)
        }
    }
}
</script>