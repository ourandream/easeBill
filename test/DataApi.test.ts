import DataApi from "../packages/main/DataApi";
import {test,expect, beforeAll} from 'vitest'
import category from '../data/category.json'
import {isEqual} from 'lodash'
import current from 'test/current.json'
import currentWithAdd from 'test/currentWithAdd.json'
import spendingDay from 'test/data/analysisDay.json'
import spendingFirstCLass from 'test/data/analysisFirstClass.json'
import spendingSecondClass from 'test/data/analysisSecondClass.json'
import spendingDayAdd from 'test/data/analysisDayAdd.json'
import spendingFirstCLassAdd from 'test/data/analysisFirstClassAdd.json'
import spendingSecondClassAdd from 'test/data/analysisSecondClassAdd.json'


let dataApi=new DataApi(new Date(2022,4))
let testBill:Bill={
    day:32,
    type:'spending',
    account:'饭卡',
    money:5,
    firstClass:'餐饮类',
    secondClass:'食堂',
    note:''
}

beforeAll(async ()=>{
    await dataApi.dataInit()
})


test('Test basic data operations',()=>{
    expect(isEqual(Object.keys(dataApi.getData()[0]),
    category.heads
    )).toBeTruthy()

    dataApi.addBill(testBill)
    let data=dataApi.getData()
    expect(isEqual(data.pop(),testBill)).toBeTruthy()

    dataApi.removeBill()
    data=dataApi.getData()
    expect(isEqual(data.pop(),testBill)).toBeFalsy()
})

test('Check statistics',()=>{
    expect(dataApi.statistics.current).toStrictEqual(current)
    dataApi.addBill(testBill)
    expect(dataApi.statistics.current).toStrictEqual(currentWithAdd)
    dataApi.removeBill()
    expect(dataApi.statistics.current).toStrictEqual(current)
})


test('Check spending analysis',()=>{
    expect(dataApi.spendingsByDay).toStrictEqual(spendingDay)
    expect(dataApi.spendingsByFirstClass).toStrictEqual(spendingFirstCLass)
    expect(dataApi.spendingsBySecondClass('餐饮类')).toStrictEqual(spendingSecondClass)
    dataApi.addBill(testBill)
    expect(dataApi.spendingsByDay).toStrictEqual(spendingDayAdd)
    expect(dataApi.spendingsByFirstClass).toStrictEqual(spendingFirstCLassAdd)
    expect(dataApi.spendingsBySecondClass('餐饮类')).toStrictEqual(spendingSecondClassAdd)
    dataApi.removeBill()
})