import { ref } from 'vue'

const category = ref<CategoryType>({ accounts: [], heads: [], spending: { firstClass: [] }, transfer: [], income: [], type: [] })
const bills = ref<Bill[]>([])
const spendingsByDay = ref<SpendingsAnalysis[]>([])
const spendingsByFirstClass = ref<SpendingsAnalysis[]>([])
const spendingsBySecondClass = ref<SpendingsAnalysis[]>([])
const incomeAnalysisMonth=ref<IncomeAnalysis[]>([])
const incomeAnalysisYear=ref<IncomeAnalysis[]>([])
const currentDate=ref<Date>()
const backgroundColor=['#EC407A','#AB47BC','#42A5F5','#7E57C2','#66BB6A','#FFCA28','#26A69A']
const statistics = ref<StatisticsType>({
    monthBegin: {},
    budgets: {
        plan: 0,
        used: 0,
        remain: 0,
        dailyPlan: 0,
        dailyRemain: 0
    },
    current: {}
})
const automaticBillList=ref<ShowAutomaticBill[]>([])

async function update() {
    statistics.value = await window.api.getStatistics()
    bills.value = await window.api.getData()
    spendingsByDay.value = await window.api.getSpendingAnalysis('day')
    spendingsByFirstClass.value = await window.api.getSpendingAnalysis('firstClass')
    incomeAnalysisMonth.value=await window.api.getIncomeAnalysis('month')
    currentDate.value=await window.api.getCurrentDate()
    incomeAnalysisYear.value=await window.api.getIncomeAnalysis('year',currentDate.value.getFullYear())
    automaticBillList.value=await window.api.getAutomaticList()
}

async function addBill(bill: Bill) {
    if (bill.type !== 'spending') {
        bill.secondClass = ''
    }
    await window.api.addBill(JSON.stringify(bill))
    await update()
}

async function removeBill() {
    await window.api.removeBill()
    await update()
}

async function getSpendingBySecondClass(firstClass: string) {
    spendingsBySecondClass.value = await window.api.getSpendingAnalysis('secondClass', firstClass)

    return spendingsBySecondClass
}

async function changeCategory(
    type: 'income' | 'spending' | 'transfer' | 'accounts',
    op: 'add' | 'remove' | 'replace',
    val: string,
    optionVal?: string,
    optionVal2?: string
) {
    await window.Setting.changeCategory(type,op,val,optionVal,optionVal2)
    category.value = await window.api.getCategory()
}

async function changeMonth(year:number,month:number) {
    await window.api.changeMonth(year,month)
    await update()
}

async function addAutomaticBill(automaticBill:ShowAutomaticBill) {
   await window.api.addAutomaticBill(JSON.stringify(automaticBill))
   automaticBillList.value=await window.api.getAutomaticList() 
}

async function removeAutomaticBill(index:number) {
    await window.api.removeAutomaticBill(index)
    automaticBillList.value=await window.api.getAutomaticList()
}

async function setPlan(newPlan:number) {
    await window.api.setPlan(newPlan)
    statistics.value=await window.api.getStatistics()
}

async function dataInit() {
    category.value = await window.api.getCategory()
    await update()
}
await dataInit()

export {
    category, bills, spendingsByDay, spendingsByFirstClass,
    getSpendingBySecondClass, statistics, addBill, removeBill,
    changeCategory,changeMonth,backgroundColor,incomeAnalysisMonth,incomeAnalysisYear,
    automaticBillList,addAutomaticBill,removeAutomaticBill,
    setPlan
}