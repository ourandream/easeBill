<template>
    <Toast></Toast>
    <DataView :value="(automaticBillListReverse)" layout="list" paginator :rows="4" data-key="bill">
        <template #header>
            <div class="text-center">
                <h2>{{ t('automaticBill.automaticBillList') }}</h2>
            </div>
        </template>
        <template #list="slotProp">
            <div class="w-full">
                <div style="width: 50%;" class="inline-block">
                    <h3>
                        {{ t('automaticBill.index') }}:
                        {{ automaticBillListReverse.length - automaticBillListReverse.indexOf(slotProp.data) -1}}
                    </h3>
                    <Button
                        class="p-button-info"
                        @click="showBill(slotProp.index)"
                    >{{ t('automaticBill.bill') }}</Button>
                    <Dialog
                        v-model:visible="showBillDialog"
                        modal
                        :draggable="false"
                        style="white-space:pre-line;"
                    >{{ currentBill }}</Dialog>
                </div>
                <div class="inline-block text-right" style="width: 50%;">
                    <div class="mt-1 mb-1">
                        {{ t('automaticBill.startDate') }}:
                        <Tag>{{ slotProp.data.startDate.toISOString().split('T')[0] }}</Tag>
                    </div>
                    <div class="mt-1 mb-1">
                        {{ t('automaticBill.frequency') }}:
                        <Tag severity="success">{{ getFrequency(slotProp.data) }}</Tag>
                    </div>
                    <div class="mt-1 mb-1">
                        {{ t('automaticBill.endDate') }}:
                        <Tag
                            severity="danger"
                        >{{ slotProp.data.endDate.toISOString().split('T')[0] }}</Tag>
                    </div>
                </div>
            </div>
        </template>
    </DataView>
    <div class="absolute" style="bottom: 3%; right: 2%;">
        <Button icon="pi pi-plus" class="p-button-rounded mr-4" @click="showInputAutomatic = true" />
        <Sidebar v-model:visible="showInputAutomatic" position="full">
            <div class="flex justify-content-center">
                <form style="width: 50%;padding: 0 15%;">
                    <div class="form-item">
                        <p>{{ t('automaticBill.startDate') }}</p>
                        <Calendar v-model="automaticBill.startDate" date-format="yy/mm/dd" />
                    </div>
                    <div class="form-item">
                        <p>{{ t('automaticBill.endDate') }}</p>
                        <Calendar
                            v-model="automaticBill.endDate"
                            :min-date="automaticBill.startDate"
                            date-format="yy/mm/dd"
                        />
                    </div>
                    <div class="form-item">
                        <p>{{ t('automaticBill.frequency') }}</p>
                        <Dropdown
                            :options="frequencyList"
                            option-label="label"
                            option-value="value"
                            v-model="frequency"
                            editable
                        ></Dropdown>
                        <Dialog v-model:visible="showInputInterval">
                            <p>{{ t('automaticBill.frequency') }}</p>
                            <InputNumber v-model="automaticBill.interval"></InputNumber>
                            <div class="mt-3 text-center">
                                <Button @click="doInputInterval">{{ t('global.confirm') }}</Button>
                            </div>
                        </Dialog>
                    </div>
                    <div class="flex justify-content-between">
                        <div class="form-item flex-1">
                            <p>{{ t('heads.type') }}</p>
                            <Dropdown
                                v-model="automaticBill.bill.type"
                                :options="types"
                                optionLabel="name"
                                optionValue="value"
                            />
                        </div>
                        <div class="form-item flex-1">
                            <p>{{ t('heads.account') }}</p>
                            <Dropdown
                                v-model="automaticBill.bill.account"
                                :options="category['accounts']"
                            />
                        </div>
                    </div>
                    <div class="form-item">
                        <p>{{ t('heads.money') }}</p>
                        <InputNumber
                            v-model="automaticBill.bill.money"
                            mode="currency"
                            :currency="t('main.currency')"
                            ref="inputMoney"
                        />
                    </div>
                    <div class="flex justify-content-between">
                        <div class="form-item">
                            <p>{{ t('main.reactiveInfo', reactiveInfoIndex) }}</p>
                            <Dropdown
                                v-model="automaticBill.bill.firstClass"
                                ref="firstClassSelect"
                                :options="firstClasses"
                            ></Dropdown>
                        </div>
                        <div class="form-item" v-if="automaticBill.bill.type === 'spending'">
                            <p>{{ t('heads.secondClass') }}</p>
                            <Dropdown
                                v-model="automaticBill.bill.secondClass"
                                :options="automaticBill.bill.type === 'spending' ? category['spending'][automaticBill.bill.firstClass] : []"
                            />
                        </div>
                    </div>
                    <div class="form-item">
                        <p>{{ t('heads.note') }}</p>
                        <InputText v-model="automaticBill.bill.note"></InputText>
                    </div>
                    <div style="margin-top: 5%;">
                        <Button @click="doAddAutomaticBill">{{ t('main.confirm') }}</Button>
                    </div>
                </form>
            </div>
        </Sidebar>
        <Button
            icon="pi pi-minus"
            class="p-button-rounded p-button-danger"
            @click="showInputIndex = true"
        />
        <Dialog v-model:visible="showInputIndex">
            <template #header>
                <h3>{{ t('automaticBill.removeHeader') }}</h3>
            </template>
            <div class="mb-3">{{ t('automaticBill.index') }}</div>
            <InputNumber v-model="removeIndex"></InputNumber>
            <template #footer class="text-left">
                <div class="text-center">
                    <Button
                        @click="doRemoveAutomaticBill(removeIndex)"
                    >{{ t('automaticBill.remove') }}</Button>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script lang="ts" setup>
import { automaticBillList, addAutomaticBill, removeAutomaticBill, category } from '../store'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast'
const { t } = useI18n()
const toast = useToast()

let showInputAutomatic = ref(false)
let firstClasses = ref<string[]>([])
firstClasses.value = category.value['spending']['firstClass']
const automaticBill = ref<ShowAutomaticBill>({
    bill: {
        day: 0,
        type: 'spending',
        account: category.value['accounts'][0],
        money: 0,
        firstClass: firstClasses.value[0],
        secondClass: '',
        note: ''
    },
    startDate: new Date(),
    endDate: new Date()
})
automaticBill.value.bill.secondClass = category.value['spending'][automaticBill.value.bill.firstClass][0]
let frequencyList = [
    {
        label: t('automaticBill.everyMonth'), value: 'everyMonth'
    },
    {
        label: t('automaticBill.everyWeek'), value: 'everyWeek'
    },
    {
        label: t('automaticBill.customize'), value: 'customize'
    }
]
let frequency = ref('')
let automaticBillListReverse = ref((automaticBillList.value.slice()))
automaticBillListReverse.value.reverse()
watch(frequency, (value) => {
    if (value === 'everyWeek') {
        automaticBill.value.interval = 7
        automaticBill.value.dayOfMonth = 0
    }
    else if (value === 'everyMonth') {
        automaticBill.value.interval = 0
        automaticBill.value.dayOfMonth = 1
    }
    else if (value = 'customize') {
        showInputInterval.value = true
    }
})
let showInputInterval = ref(false)
function doInputInterval() {
    if (automaticBill.value.interval !== 7) {
        frequency.value = `每${automaticBill.value.interval}天`
        setTimeout(() => showInputInterval.value = false, 200)
    }
    else {
        frequency.value = 'everyWeek'
    }
    showInputInterval.value = false
}

let reactiveInfoIndex = ref(0)
let firstClass = computed(() => automaticBill.value.bill.firstClass)
let types = [{ name: t(`type.spending`), value: 'spending' }, { name: t(`type.income`), value: 'income' },
{ name: t(`type.transfer`), value: 'transfer' }]
async function doAddAutomaticBill() {
    await addAutomaticBill(automaticBill.value)
    automaticBillListReverse.value.unshift({ ...automaticBill.value })
    toast.add({
        detail: t('automaticBill.addSuccess'),
        severity: 'success',
        life: 3000
    })
}


let type = computed(() => { return automaticBill.value.bill.type })
watch(type, (value) => {
    if (value === 'spending') {
        firstClasses.value = category.value['spending']['firstClass']
        automaticBill.value.bill.firstClass = firstClasses.value[0]
        reactiveInfoIndex.value = 0
    }
    else {
        firstClasses.value = category.value[value] as string[]
        automaticBill.value.bill.firstClass = firstClasses.value[0]
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
        automaticBill.value.bill.secondClass = category.value['spending'][automaticBill.value.bill.firstClass][0]
    }
})


function getFrequency(automaticBill: ShowAutomaticBill) {
    if (automaticBill.interval) {
        if (automaticBill.interval === 7) {
            return t('automaticBill.everyWeek')
        }
        else {
            return t('automaticBill.interval', { day: automaticBill.interval })
        }
    }
    else {
        return t('automaticBill.everyMonth')
    }
}

let showBillDialog = ref(false)
let currentBill = ref('')
function showBill(index: number) {
    let bill: { day?: number } = { ...automaticBillList.value[index].bill }
    delete bill.day
    currentBill.value = JSON.stringify(bill, null, 4)
    showBillDialog.value = true
}

let removeIndex = ref(0)
let showInputIndex = ref(false)
async function doRemoveAutomaticBill(index: number) {
    if (index < automaticBillList.value.length && index >= 0) {
        await removeAutomaticBill(index)
        automaticBillListReverse.value.shift()
        toast.add({
            detail: t('automaticBill.removeInfo', { index: index }),
            severity: 'info',
            life: 3000
        })
    }
    else {
        toast.add({
            detail: t('automaticBill.removeFail'),
            severity: 'error',
            life: 3000
        })
    }

}
</script>