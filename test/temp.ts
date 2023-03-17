import { writeJsonSync } from "fs-extra";
import DataApi from "../packages/main/DataApi";

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
dataApi.dataInit().then(()=>{
    writeJsonSync('test/data/analysisDay.json',dataApi.spendingsByDay)
    writeJsonSync('test/data/analysisFirstClass.json',dataApi.spendingsByFirstClass)
    writeJsonSync('test/data/analysisSecondClass.json',dataApi.spendingsBySecondClass('餐饮类'))
    dataApi.addBill(testBill)
    writeJsonSync('test/data/analysisDayAdd.json',dataApi.spendingsByDay)
    writeJsonSync('test/data/analysisFirstClassAdd.json',dataApi.spendingsByFirstClass)
    writeJsonSync('test/data/analysisSecondClassAdd.json',dataApi.spendingsBySecondClass('餐饮类'))
    dataApi.removeBill()
})