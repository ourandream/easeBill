<template>
    <div style="margin: 0 2.5%;">
        <div class="text-center mt-3">
            <SelectButton
                v-model="type"
                :options="typeOptions"
                optionLabel="name"
                optionValue="value"
                @change="changeListItems"
            />
        </div>
        <div style="margin-top: 3%;">
            <PickList v-model="currentChange" listStyle="height:342px;">
                <template #sourceheader>Available</template>
                <template #targetheader>Selected</template>
                <template #item="slotProps">
                    <div>{{ slotProps.item }}</div>
                </template>
            </PickList>
        </div>
        <SpeedDial :model="ops" direction="left" class="absolute" style="right:2.5%" showIcon="pi pi-bars"/>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { category } from '../store'
const { t } = useI18n()

let currentChange = ref([category.value.income, []])
let type = ref<'income' | 'spending' | 'account'>('income')
let typeOptions = [
    { name: t('type.income'), value: 'income' },
    { name: t('type.spending'), value: 'spending' },
    { name: t('heads.account'), value: 'account' },
]
function changeListItems() {
    currentChange.value[1]=[]
    if (type.value === 'income') {
        currentChange.value[0] = category.value.income
    }
    else if (type.value === 'spending') {
        currentChange.value[0] = category.value.spending.firstClass
    }
    else {
        currentChange.value[0] = category.value.accounts
    }
}

let ops =
    [
        {
            label: 'Add',
            icon: 'pi pi-pencil',
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
        },
        {
            label: 'Update',
            icon: 'pi pi-refresh',
        }
    ]
</script>