import { ipcRenderer } from "electron";


let api={
  getData:()=>ipcRenderer.invoke('data:data') as Promise<Bill[]>,
  getCategory:()=>ipcRenderer.invoke('data:category') as Promise<CategoryType>,
  getRowSize:()=>ipcRenderer.invoke('data:rowSize') as Promise<number>,
  getStatistics:()=>ipcRenderer.invoke('data:statistics') as Promise<StatisticsType>,
  save:()=>ipcRenderer.invoke('op:save') as Promise<void>,
  addBill:(bill:string)=>ipcRenderer.invoke('op:addBill',bill) as Promise<void>,
  removeBill:()=>ipcRenderer.invoke('op:removeBill') as Promise<void>,
  getSpendingAnalysis:(type:string,firstClass?:string)=>
  ipcRenderer.invoke('data:spendingAnalysis',type,firstClass) as Promise<SpendingsAnalysis[]>,
  changeMonth:(year:number,month:number)=>
    ipcRenderer.invoke('op:changeMonth',year,month) as Promise<Promise<void>>,
  getIncomeAnalysis:(type:'year'|'month',year?:number)=>
  ipcRenderer.invoke('data:incomeAnalysis',type,year) as Promise<IncomeAnalysis[]>,
  getCurrentDate:()=>ipcRenderer.invoke('data:currentDate') as Promise<Date>,
  getAutomaticList:()=>ipcRenderer.invoke('data:automaticList') as Promise<ShowAutomaticBill[]>,
  addAutomaticBill:(automaticBill:string)=>{
    let finalAutomaticBill=JSON.parse(automaticBill)
    finalAutomaticBill.startDate=new Date(finalAutomaticBill.startDate)
    finalAutomaticBill.endDate=new Date(finalAutomaticBill.endDate)
    ipcRenderer.invoke('op:addAutomaticBill',finalAutomaticBill)
  },
  removeAutomaticBill:(index:number)=>ipcRenderer.invoke('op:removeAutomaticBill',index),
  setPlan:(newPlan:number)=>ipcRenderer.invoke('op:changePlan',newPlan)
}

export default api