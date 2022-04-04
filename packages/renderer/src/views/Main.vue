<template>
    <Toast />
    <Sidebar v-model:visible="showForm" position="full" @show="inputMoneyFocus">
        <div class="flex justify-content-center">
            <form style="width: 50%;padding: 0 15%;">
                <div class="form-item">
                    <p>{{ t('heads.day') }}</p>
                    <InputNumber v-model="bill.day" mode="decimal" showButtons :min="1" :max="31" />
                </div>
                <div class="flex justify-content-between">
                    <div class="form-item flex-1">
                        <p>{{ t('heads.type') }}</p>
                        <Dropdown
                            v-model="bill.type"
                            :options="types"
                            optionLabel="name"
                            optionValue="value"
                        />
                    </div>
                    <div class="form-item flex-1">
                        <p>{{ t('heads.account') }}</p>
                        <Dropdown v-model="bill.account" :options="category['accounts']" />
                    </div>
                </div>
                <div class="form-item">
                    <p>{{ t('heads.money') }}</p>
                    <InputNumber
                        v-model="bill.money"
                        mode="currency"
                        :currency="t('main.currency')"
                        @Keydown.enter="moneyEnter"
                        @input="moneyInputHandler"
                        ref="inputMoney"
                    />
                </div>
                <div class="flex justify-content-between">
                    <div class="form-item">
                        <p>{{ t('main.reactiveInfo', reactiveInfoIndex) }}</p>
                        <Dropdown
                            v-model="bill.firstClass"
                            ref="firstClassSelect"
                            :options="firstClasses"
                        ></Dropdown>
                    </div>
                    <div class="form-item" v-if="bill.type === 'spending'">
                        <p>{{ t('heads.secondClass') }}</p>
                        <Dropdown
                            v-model="bill.secondClass"
                            :options="bill.type === 'spending' ? category['spending'][bill.firstClass] : []"
                        />
                    </div>
                </div>
                <div class="form-item">
                    <p>{{ t('heads.note') }}</p>
                    <InputText v-model="bill.note"></InputText>
                </div>
                <div style="margin-top: 5%;">
                    <Button @click="doAddBill">{{ t('main.confirm') }}</Button>
                </div>
            </form>
        </div>
    </Sidebar>
    <Dialog :header="t('main.spendingByDay')" v-model:visible="showSpendingByDay" modal>
        <DataTable
            :value="spendingByDayReverse"
            responsiveLayout="scroll"
            scrollHeight="60vh"
            scrollable
            showGridlines
        >
            <Column field="day" :header="t('heads.day')" />
            <Column field="money_sum" :header="t('main.moneySum')" />
            <Column field="money_average" :header="t('main.moneyAverage')" />
        </DataTable>
    </Dialog>
    <Dialog :header="t('main.changeMonth')" v-model:visible="showChangeMonth" modal>
        <Calendar v-model="yearAndMonth" view="month" dateFormat="yy/mm" />
        <template #footer>
            <div class="text-center">
                <Button
                    @click="doChangeMonth(yearAndMonth.getFullYear(), yearAndMonth.getMonth() + 1)"
                >{{ t('main.confirm') }}</Button>
            </div>
        </template>
    </Dialog>

    <div class="buttons">
        <Button
            icon="pi pi-list"
            class="p-button-rounded p-button-secondary mr-3"
            @click="showSpendingByDay = true"
        ></Button>
        <Button icon="pi pi-calendar" class="p-button-rounded mr-3" @click="showChangeMonth = true"></Button>
        <Button icon="pi pi-plus" class="p-button-rounded mr-3" @click="showForm = true"></Button>
        <Button icon="pi pi-minus" class="p-button-rounded p-button-danger" @click="doRemoveBill"></Button>
    </div>
    <DataTable
        :value="showBills"
        scrollable
        v-model:filters="filters"
        filterDisplay="menu"
        data-key="id"
        scrollHeight="90vh"
    >
        <column
            v-for="column of columns"
            :field="column"
            :header="t(`heads.${column}`)"
            :key="column"
            :showFilterMatchModes="false"
            sortable
        >
            <template #filter="{ filterModel, filterCallback }">
                <InputText
                    type="text"
                    v-model="filterModel.value"
                    @keydown.enter="filterCallback()"
                />
            </template>
        </column>
    </DataTable>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { FilterMatchMode } from 'primevue/api'
import { useI18n } from 'vue-i18n'
import { InputNumberInputEvent } from 'primevue/inputnumber';
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown';
import { useToast } from "primevue/usetoast";
import { category, bills, spendingsByDay, addBill, removeBill, changeMonth } from '../store';
import Toast from 'primevue/toast';

const toast = useToast();
let { t } = useI18n({ useScope: 'global' })
interface InputNumberInstance extends InstanceType<typeof InputNumber> {
    $el: {
        children: [HTMLInputElement]
    }
}
let inputMoney = ref<InputNumberInstance | null>(null)
function inputMoneyFocus() {
    console.log(inputMoney.value!.$el.children[0])
    const p1 = inputMoney.value?.$el.children[0]
    nextTick(() => { p1!.focus() })
}

let reactiveInfoIndex = ref(0)
let columns = computed(() => category.value['heads'])
let showForm = ref<boolean>(false)
let showSpendingByDay = ref(false)
let types = [{ name: t(`type.spending`), value: 'spending' }, { name: t(`type.income`), value: 'income' },
{ name: t(`type.transfer`), value: 'transfer' }]

let firstClasses = ref<string[]>([])
firstClasses.value = category.value['spending']['firstClass']

let filters = ref<{ [index: string]: { value: any, matchMode: any } }>({})
for (let i = 0; i < columns.value.length; ++i) {
    filters.value[columns.value[i]] = {
        value: null,
        matchMode: FilterMatchMode.STARTS_WITH
    }
}

let showBills = ref<Bill[]>([])
function updateShowBills() {
    showBills.value = bills.value.slice()
    showBills.value.reverse()
    for (let i = 0; i < showBills.value.length; ++i) {
        if (!category.value['type'].includes(showBills.value[i].type)) {
            showBills.value[i].type = t(`type.${showBills.value[i].type}`)
        }
    }
}
updateShowBills()

let spendingByDayReverse = ref<SpendingsAnalysis[]>([])
function updateSpendingByDay() {
    spendingByDayReverse.value = spendingsByDay.value.reverse().slice()
    spendingsByDay.value.reverse()
    for (let i = 0; i < spendingByDayReverse.value.length; ++i) {
        spendingByDayReverse.value[i].money_sum = Number(spendingByDayReverse.value[i].money_sum.toFixed(2))
        spendingByDayReverse.value[i].money_average = Number(spendingByDayReverse.value[i].money_average.toFixed(2))
    }
}
updateSpendingByDay()

let bill = ref<Bill>({
    day: (new Date()).getDate(),
    type: 'spending',
    account: category.value['accounts'][0],
    money: 0,
    firstClass: firstClasses.value[0],
    secondClass: '',
    note: ''
})
bill.value.secondClass = category.value['spending'][bill.value.firstClass][0]
let type = computed(() => { return bill.value.type })
let firstClass = computed(() => bill.value.firstClass)

watch(type, (value) => {
    if (value === 'spending') {
        firstClasses.value = category.value['spending']['firstClass']
        bill.value.firstClass = firstClasses.value[0]
        reactiveInfoIndex.value = 0
    }
    else {
        firstClasses.value = category.value[value] as string[]
        bill.value.firstClass = firstClasses.value[0]
        if (value === 'income') {
            reactiveInfoIndex.value = 1
        }
        else {
            reactiveInfoIndex.value = 2
        }
    }
})
watch(firstClass, (value) => {
    if (type.value === 'spending') {
        bill.value.secondClass = category.value['spending'][bill.value.firstClass][0]
    }
})

let currentMoney = ref(0)
let moneyInputHandler = ref((payload: unknown) => {
    currentMoney.value = (payload as InputNumberInputEvent).value as number
})
function moneyEnter() {
    bill.value.money = currentMoney.value
    doAddBill()
}
async function doAddBill() {
    await addBill(bill.value)
    updateShowBills()
    updateSpendingByDay()
    toast.add({
        severity: 'success',
        detail: t('main.successAdd'),
        life: 3000
    });
}
async function doRemoveBill() {
    await removeBill()
    updateShowBills()
    updateSpendingByDay()
    toast.add({
        severity: 'info',
        detail: t('main.removeInfo'),
        life: 3000
    });
}
let showChangeMonth = ref(false)
let yearAndMonth = ref<Date>(new Date())
async function doChangeMonth(year: number, month: number) {
    await changeMonth(year, month)

    showChangeMonth.value = false
    updateShowBills()
    updateSpendingByDay()
    toast.add({
        severity: "info",
        detail: t('main.changeMonthInfo', { year: yearAndMonth.value.getFullYear(), month: yearAndMonth.value.getMonth() + 1 }),
        life: 3000
    })
}
</script>

<style scoped>
.buttons {
    position: absolute;
    bottom: 5%;
    right: 3%;
    z-index: 5;
}

form {
    padding: 3%;
}
</style>