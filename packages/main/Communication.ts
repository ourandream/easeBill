import { ipcMain } from "electron";
import DataApi from "./DataApi";
import * as Settings from './Setting'
import { readJsonSync, writeJSONSync } from 'fs-extra'
import { existsSync } from "fs";

let lastCallInfo: { year: number, month: number } | null = null
if (existsSync('./data/last_call_info.json')) {
    lastCallInfo = readJsonSync('./data/last_call_info.json')
}
let current = new Date()
writeJSONSync('./data/last_call_info.json', { year: current.getFullYear(), month: current.getMonth() })


async function dataAPiToRenderer() {
    await DataApi.checkAutomatic()
    let api = new DataApi(current)
    if (lastCallInfo) {
        await api.dataInit(new Date(lastCallInfo.year, lastCallInfo.month))
    }
    else {
        await api.dataInit()
    }
    ipcMain.handle('data:data', (event) => { return api.getData() })
    ipcMain.handle('data:category', (event) => { return DataApi.category })
    ipcMain.handle('data:rowSize', (event) => { return api.dataRowSize })
    ipcMain.handle('data:statistics', (event) => api.statistics)
    ipcMain.handle('data:currentDate', () => api.currentDate)
    ipcMain.handle('op:save', (event) => api.save())
    ipcMain.handle('op:addBill', (event, bill) => api.addBill(JSON.parse(bill)))
    ipcMain.handle('op:removeBill', (event) => api.removeBill())
    ipcMain.handle('op:changePlan', (event, newPlan) => api.setPlan(newPlan))
    ipcMain.handle('data:spendingAnalysis', (event, type: string, firstClass: string) => {
        if (type === 'day') {
            return api.spendingsByDay
        }
        else if (type === 'firstClass') {
            return api.spendingsByFirstClass
        }
        else {
            return api.spendingsBySecondClass(firstClass)
        }
    })
    ipcMain.handle('op:changeMonth', async (event, year: number, month: number) => {
        api = new DataApi(new Date(year, month - 1))
        await api.dataInit()
        return
    })
    ipcMain.handle('setCategory', (event, type: 'income' | 'spending' | 'transfer' | 'accounts',
        op: 'add' | 'remove' | 'replace',
        val: string,
        optionVal?: string,
        optionVal2?: string) => {
        Settings.changeCategory(type, op, val, optionVal, optionVal2)
    })
    ipcMain.handle('data:incomeAnalysis', (event, type: 'year' | 'month', year?: number) => {
        if (type === 'month') {
            return api.incomAnalysis
        }
        else {
            return DataApi.getIncomeAnalysisByYear(year!)
        }
    })
    ipcMain.handle('data:automaticList', () => {
        return DataApi.getAutomaticList()
    })
    ipcMain.handle('op:addAutomaticBill', (event, automaticBill: ShowAutomaticBill) =>
        DataApi.addAutomaticBill(automaticBill)
    )
    ipcMain.handle('op:removeAutomaticBill', (event, index: number) =>
        DataApi.removeAutomaticBill(index)
    )
}

export { dataAPiToRenderer }