<template>
    <Toast></Toast>
    <div>
        <!-- <div class="setting-item">
            <div class="setting-head">
                <h3 class="inline">{{ t('settings.basic.language') }}</h3>
            </div>
            <div class="setting-content">
                <Dropdown v-model="locale" :options="availableLocales"></Dropdown>
            </div>
        </div>-->
        <div class="setting-item">
            <div class="setting-head">
                <h3 class="inline">{{ t('settings.basic.category') }}</h3>
            </div>

            <div class="setting-content" style="padding-right:3%;padding-left: 12%;">
                <SelectButton
                    v-model="current"
                    :options="types"
                    option-label="name"
                    option-value="value"
                    @change="changeTypeOp"
                    class="pb-2 text-right"
                ></SelectButton>

                <OrderList
                    v-model="currentChangeList"
                    listStyle="height:auto"
                    v-model:selection="currentSelect"
                >
                    <template #item="slotProps">{{ slotProps.item }}</template>
                </OrderList>
            </div>
            <div class="setting-content" style="padding-left: 10%;">
                <SplitButton
                    :label="t('settings.basic.op.add')"
                    icon="pi pi-plus"
                    @click="addOp"
                    :model="changes"
                ></SplitButton>
            </div>
            <Dialog :header="t('heads.firstClass')" v-model:visible="inputFirstClass">
                <InputText v-model="firstClass"></InputText>
                <template #footer class="text-center">
                    <div class="width-full text-center">
                        <Button @click="addSecondClassList">{{ t('settings.basic.confirm') }}</Button>
                    </div>
                </template>
            </Dialog>
            <Dialog
                :header="t('settings.basic.changeVal', changeType)"
                v-model:visible="inputChangeVal"
            >
                <InputText v-model="changeVal"></InputText>
                <template #footer class="text-center">
                    <div class="width-full text-center">
                        <Button @click="currentOp">{{ t('settings.basic.confirm') }}</Button>
                    </div>
                </template>
            </Dialog>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { category, changeCategory } from '../store'
import { useToast } from 'primevue/usetoast';

const { availableLocales, locale, t } = useI18n({})
let toast = useToast()

let currentChangeList = ref(category.value.income)
let current = ref<'income' | 'accounts' | 'spending'>('income')
let inputFirstClass = ref(false)
let firstClass = ref('')
let isFirstClass = ref(false)
function updateList() {
    if (current.value !== 'spending') {
        currentChangeList.value = category.value[current.value]
    }
    else {
        if (isFirstClass.value) {
            currentChangeList.value = category.value.spending.firstClass
        }
        else {
            currentChangeList.value = category.value.spending[firstClass.value]
        }
    }
}
function addSecondClassList() {
    currentChangeList.value = category.value.spending[firstClass.value]
    inputFirstClass.value = false
}
watch(current, () => {
    updateList()
})

let types = [
    { name: t('type.income'), value: 'income' },
    { name: t('heads.firstClass'), value: 'spending' },
    { name: t('heads.secondClass'), value: 'secondClass' },
    { name: t('heads.account'), value: 'accounts' }
]
function changeTypeOp() {
    if (current.value === 'spending') {
        isFirstClass.value = true
    }
    else if (current.value as string === 'secondClass') {
        current.value = 'spending'
        isFirstClass.value = false
        inputFirstClass.value = true
    }
}
let currentSelect = ref<string[]>([])
let currentOp = ref<() => void>(() => { })
function addOp() {
    changeType.value = 1
    inputChangeVal.value = true
    currentOp.value = add
}
let changes = [
    {
        label: t('settings.basic.op.remove'),
        icon: 'pi pi-minus',
        command: () => {
            remove()
        }
    },
    {
        label: t('settings.basic.op.replace'),
        icon: 'pi pi-refresh',
        command: () => {
            changeType.value = 0
            inputChangeVal.value = true
            currentOp.value = replace
        }
    }
]
let changeType = ref(0)
let changeVal = ref('')
let inputChangeVal = ref(false)
async function add() {
    if (!isFirstClass.value && current.value === 'spending') {
        await changeCategory(current.value, "add", firstClass.value, changeVal.value)
        toast.add({
            severity: 'success',
            detail: t('settings.basic.addInfo', { type: firstClass.value, add: changeVal.value }),
            life: 3000
        })
    }
    else {
        await changeCategory(current.value, "add", changeVal.value)
        toast.add({
            severity: 'success',
            detail: t('settings.basic.addInfo', { type: t(`type.${current.value}`), add: changeVal.value }),
            life: 3000
        })
    }
    updateList()
}
async function remove() {
    if (currentSelect.value.length === 0) {
        toast.add({
            severity: 'error',
            detail: t('settings.basic.selectError'),
            life: 3000
        })
        return
    }
    if (!isFirstClass.value && current.value === 'spending') {
        await changeCategory(current.value, "remove", firstClass.value, currentSelect.value[0])
        toast.add({
            severity: 'info',
            detail: t('settings.basic.removeInfo', { type: firstClass.value, remove: currentSelect.value[0] }),
            life: 3000
        })
    }
    else {
        await changeCategory(current.value, "remove", currentSelect.value[0])
        toast.add({
            severity: 'info',
            detail: t('settings.basic.removeInfo', { type: t(`type.${current.value}`), remove: currentSelect.value[0] }),
            life: 3000
        })
    }
    updateList()
}
async function replace() {
    if (currentSelect.value.length === 0) {
        toast.add({
            severity: 'error',
            detail: t('settings.basic.selectError'),
            life: 3000
        })
        return
    }
    if (!isFirstClass.value && current.value === 'spending') {
        await changeCategory(current.value, "replace", firstClass.value, currentSelect.value[0], changeVal.value)
        toast.add({
            severity: 'info',
            detail: t('settings.basic.replaceInfo', { from: currentSelect.value[0], to: changeVal.value }),
            life: 3000
        })
    }
    else {
        await changeCategory(current.value, "replace", currentSelect.value[0], changeVal.value)
        toast.add({
            severity: 'info',
            detail: t('settings.basic.replaceInfo', { from: currentSelect.value[0], to: changeVal.value }),
            life: 3000
        })
    }
    updateList()
}
</script>


<style scoped>
.setting-item {
    width: 100%;
    padding: 3%;
}

.setting-head {
    width: 100%;
    padding-bottom: 3%;
    text-align: center;
}

.setting-content {
    display: inline-block;
    width: 50%;
}
</style>

<style>
a.p-speeddial-action {
    text-decoration: none;
}
</style>