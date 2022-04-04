import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs"
import { writeJSONSync, readJsonSync } from 'fs-extra'
import { readFile } from 'data-forge-fs'
import { DataFrame, IDataFrame, Series } from 'data-forge'
import { join } from 'path'

let preIndex: string
preIndex = './data/'

/**
 * 提供data相关的api
 * @param {Date} date - 数据的日期信息,包括年月和基准日.
 */
export default class DataApi {
  private path: string
  private now: Date
  private dayOfMonth: number
  private remainDay: number
  private data: IDataFrame
  static category: CategoryType
  statistics: StatisticsType
  static accounts: string[]
  private static automaticPath = `${preIndex}automatic.json`
  /**
 * 将数字四舍五入到小数点后两位
 * @param num - 四舍五入的数字
 * @returns 四舍五入后的结果
 */
  private static approximateTwo(num: number) {
    return Number(num.toFixed(2))
  }

  public static updateCategory() {
    DataApi.category = JSON.parse(readFileSync(`${preIndex}/category.json`).toString())
  }

  public static async getIncomeAnalysisByYear(year: number): Promise<IncomeAnalysis[]> {
    let result: IncomeAnalysis[] = []
    if (existsSync(`${preIndex}${year}`)) {
      let data: IDataFrame = new DataFrame({ columnNames: DataApi.accounts })
      for (let i = 1; i <= 12; ++i) {
        let csvPath = `${preIndex}${year}/${year}.${i}.csv`
        if (existsSync(csvPath)) {
          let newData = await readFile(csvPath).parseCSV()
          newData = newData.parseFloats('money')
          data = data.concat(newData)
        }
      }
      data.filter(row => row.type === 'income').groupBy(row => row.firstClass).forEach(
        (firstClassData) => {
          let summarize = firstClassData.summarize({
            money: {
              moneySum: Series.sum,
              moneyAverage: Series.average,
              count: Series.count
            }
          })
          let firstClass: string = firstClassData.toArray()[0]['firstClass']
          let incomeAnalysis: IncomeAnalysis = { ...summarize, firstClass: firstClass }
          result.push(incomeAnalysis)

        }
      )
    }
    return result
  }

  public static async checkAutomatic() {
    if (!existsSync(DataApi.automaticPath)) {
      writeJSONSync(DataApi.automaticPath, [], { spaces: 4 })
      return
    }
    let automatic: AutomaticBill[] = readJsonSync(DataApi.automaticPath)
    let api = new DataApi(new Date())
    await api.dataInit()
    for (let i = 0; i < automatic.length; ++i) {
      let bill = { ...automatic[i].bill }
      let startDate = new Date(automatic[i].startDate)
      let currentDate = new Date(startDate)
      if (startDate.getTime() > (new Date).getTime()) {
        continue
      }
      for (let j = 0; j < automatic[i].addSuccess.length; ++j) {
        if (!automatic[i].addSuccess[j]) {
          if (
            api.currentDate.getFullYear() !== currentDate.getFullYear() ||
            api.currentDate.getMonth() !== currentDate.getMonth()) {
            api = new DataApi(currentDate)
            await api.dataInit()
          }
          if (automatic[i].dayOfMonth) {
            bill.day = startDate.getDate()
          }
          else {
            bill.day = currentDate.getDate()
          }
          api.addBill({ ...bill })
          automatic[i].addSuccess[j] = true
        }
        if (automatic[i].interval) {
          currentDate.setDate(currentDate.getDate() + automatic[i].interval!)
        }
        else if (automatic[i].dayOfMonth) {
          currentDate.setMonth(currentDate.getMonth() + 1)
        }
        if (currentDate.getTime() > (new Date).getTime()) {
          break
        }
      }
    }
    writeJSONSync(DataApi.automaticPath, automatic, {
      spaces: 4
    })
  }

  public static addAutomaticBill(automaticBill: {
    bill: Bill,
    startDate: Date,
    endDate: Date,
    interval?: number,
    dayOfMonth?: number
  }) {
    let automatic: AutomaticBill[] = readJsonSync(DataApi.automaticPath)
    let finalAutomatic: AutomaticBill = {
      bill: automaticBill.bill,
      startDate: automaticBill.startDate.toDateString(),
      endDate: automaticBill.endDate.toDateString(),
      addSuccess: []
    }
    let currentDate = automaticBill.startDate
    let endDate = automaticBill.endDate
    if (automaticBill.dayOfMonth) {
      finalAutomatic.dayOfMonth = automaticBill.dayOfMonth
      while ((currentDate.getFullYear() <= endDate.getFullYear() &&
        currentDate.getMonth() <= endDate.getMonth()) ||
        currentDate.getFullYear() < endDate.getFullYear()) {
        finalAutomatic.addSuccess.push(false)
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }
    else if (automaticBill.interval) {
      finalAutomatic.interval = automaticBill.interval
      while (currentDate.getTime() < endDate.getTime()) {
        finalAutomatic.addSuccess.push(false)
        currentDate.setDate(currentDate.getDate() + finalAutomatic.interval)
      }
    }

    automatic.push(finalAutomatic)
    writeJSONSync(DataApi.automaticPath, automatic, {
      spaces: 4
    })
  }

  public static removeAutomaticBill(index: number) {
    let automatic: AutomaticBill[] = readJsonSync(DataApi.automaticPath)
    if (automatic.length >= index) {
      automatic = automatic.filter((value, currentIndex) => {
        return currentIndex != index
      })
    }
    writeJSONSync(DataApi.automaticPath, automatic, {
      spaces: 4
    })
  }

  public static getAutomaticList() {
    let automatic: AutomaticBill[] = readJsonSync(DataApi.automaticPath)
    let finalAutomaticList: ShowAutomaticBill[] = []
    for (let i of automatic) {
      let finalAutomaticBill: ShowAutomaticBill = {
        bill: i.bill,
        startDate: new Date(i.startDate),
        endDate: new Date(i.endDate)
      }
      if (i.dayOfMonth) {
        finalAutomaticBill.dayOfMonth = i.dayOfMonth
      }
      else {
        finalAutomaticBill.interval = i.interval
      }
      finalAutomaticList.push(finalAutomaticBill)
    }
    return finalAutomaticList
  }

  constructor(date: Date) {
    if (!existsSync(`${preIndex}${date.getFullYear()}`)) {
      mkdirSync(`${preIndex}${date.getFullYear()}`)
    }
    this.path = `${preIndex}${date.getFullYear()}/${date.getFullYear()}.${date.getMonth() + 1}`
    this.now = date
    this.dayOfMonth = (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate()
    this.remainDay = this.dayOfMonth - this.now.getDate()
    if (this.remainDay === 0) {
      this.remainDay = 1
    }
    DataApi.category = JSON.parse(readFileSync(`${preIndex}/category.json`).toString())
    this.statistics = {
      monthBegin: {},
      budgets: {
        plan: 1200,
        used: 0,
        remain: 1200,
        dailyPlan: 1200 / this.dayOfMonth,
        dailyRemain: 1200 / this.remainDay
      }, current: {}
    }
    DataApi.accounts = DataApi.category['accounts']
    this.data = new DataFrame({ columnNames: DataApi.accounts })
    for (const i of DataApi.category['accounts']) {
      this.statistics.monthBegin[i] = 0
      this.statistics.current[i] = 0
    }
  }

  /**
   * 初始化数据，必须调用一次
   * @param lastDate 
   */
  async dataInit(lastDate?: Date) {
    if (existsSync(this.path + '.csv')) {
      this.data = await readFile(this.path + '.csv').parseCSV()
      this.data = this.data.parseFloats("money")
      this.data = this.data.parseInts("day")
    }
    else {
      writeFileSync(this.path + '.csv', '')
    }

    if (existsSync(this.path + '.json')) {
      this.statistics = JSON.parse(readFileSync(this.path + '.json').toString())
    }
    else {
      if (lastDate !== undefined) {
        let last_path = `data/${lastDate.getFullYear()}/${lastDate.getFullYear()}.${lastDate.getMonth() + 1}`
        let last_statistics: StatisticsType = JSON.parse(readFileSync(last_path + '.json').toString())
        for (let i of DataApi.category['accounts']) {
          this.statistics.monthBegin[i] = last_statistics.current[i]
          this.statistics.current[i] = last_statistics.current[i]
        }
        writeFileSync(this.path + '.json', JSON.stringify(this.statistics))
      }
      else {
        writeFileSync(this.path + '.json', JSON.stringify(this.statistics))
      }
    }
    this.statisticsReactive()
    this.checkStatistics()
    this.data = this.data.orderBy(bill => bill.day)
  }

  /**
   * 为statistics添加自动校检数据的功能
   */
  private statisticsReactive() {
    Object.defineProperty(this.statistics.monthBegin, 'all', {
      get: function (this: StatisticsType['monthBegin']) {
        let all: number = 0
        for (const i of DataApi.accounts) {
          all += this[i]
        }
        return DataApi.approximateTwo(all)
      }
    })
    Object.defineProperty(this.statistics.current, 'all', {
      get: function (this: StatisticsType['current']) {
        let all: number = 0
        for (const i of DataApi.accounts) {
          all += this[i]
        }
        return DataApi.approximateTwo(all)
      }
    })

    this.statistics.budgets['dayOfMonth'] = this.dayOfMonth
    this.statistics.budgets['remainDay'] = this.remainDay
    Object.defineProperty(this.statistics.budgets, 'remain', {
      get: function (this: StatisticsType['budgets']) {
        let remain = this['plan'] - this['used']
        return DataApi.approximateTwo(remain)
      }
    })
    Object.defineProperty(this.statistics.budgets, 'dailyPlan', {
      get: function (this: StatisticsType['budgets']) {
        return DataApi.approximateTwo(this['plan'] / this['dayOfMonth'])
      }
    })
    Object.defineProperty(this.statistics.budgets, 'dailyRemain', {
      get: function (this: StatisticsType['budgets']) {
        return DataApi.approximateTwo(this['remain'] / this['remainDay'])
      }
    })
  }

  setPlan(newPlan: number) {
    this.statistics.budgets.plan = newPlan
    this.save()
  }

  /**
   * 获取当前数据的行数
   */
  get dataRowSize() {
    return this.data.count()
  }

  get currentDate() {
    return this.now
  }

  /**
   * 保存当前数据到磁盘
   */
  save() {
    this.data.asCSV().writeFileSync(this.path + '.csv')
    writeFileSync(this.path + '.json', JSON.stringify(this.statistics, null, 4))
  }


  /**
   * 获取当前数据
   * @returns 当前数据的object形式
   */
  getData(): Bill[] {
    return JSON.parse(this.data.toJSON()) as Bill[]
  }

  /**
   * 添加一行数据
   * @param bill 添加的数据
   */
  addBill(bill: Bill) {
    this.data = this.data.appendPair([this.data.count(), bill])
    this.checkStatistics()
    this.save()
  }

  /**
   * 删除一行数据
   * @param index 删除的数据的index 
   */
  removeBill(index?: number[]) {
    this.data = this.data.endAt(this.data.count() - 2)
    this.checkStatistics()
    this.save()
  }

  /**
   * 日期与对应的支出分析数据
   * @returns `{day,money_sum,money_average,count}`
   */
  get spendingsByDay(): SpendingsAnalysis[] {
    let result: SpendingsAnalysis[] = []
    this.data.filter(row => row.type === 'spending').groupBy(row => row.day).forEach(
      (firstClassData) => {
        let summarize = firstClassData.summarize({
          money: {
            money_sum: Series.sum,
            money_average: Series.average,
            count: Series.count
          }
        })
        let day: string = firstClassData.toArray()[0]['day']
        let SpendingsAnalysis: SpendingsAnalysis = { ...summarize, day: day }
        result.push(SpendingsAnalysis)
      }
    )

    return result
  }

  /**
   * firstClass与其对应的支出分析数据
   * @returns `{firstClass,money_sum,money_average,count}`
   */
  get spendingsByFirstClass(): SpendingsAnalysis[] {
    let result: SpendingsAnalysis[] = []
    this.data.filter(row => row.type === 'spending').groupBy(row => row.firstClass).forEach(
      (firstClassData) => {
        let summarize = firstClassData.summarize({
          money: {
            money_sum: Series.sum,
            money_average: Series.average,
            count: Series.count
          }
        })
        let firstClass: string = firstClassData.toArray()[0]['firstClass']
        let SpendingsAnalysis: SpendingsAnalysis = { ...summarize, firstClass: firstClass }
        result.push(SpendingsAnalysis)
      }
    )

    return result
  }

  /**
   * secondClass与其对应的支出分析数据
   * @param firstClass secondClass所属的firstClass
   * @returns `{secondClass,money_sum,money_average,count}`
   */
  spendingsBySecondClass(firstClass: string): SpendingsAnalysis[] {
    let result: SpendingsAnalysis[] = []
    this.data.filter(row => row.type === 'spending').groupBy(row => row.firstClass).forEach(
      (firstClassData) => {
        let currentFirstClass: string = firstClassData.toArray()[0]['firstClass']
        if (currentFirstClass !== firstClass) {
          return
        }
        else {
          firstClassData.groupBy(row => row.secondClass).forEach((secondClassData) => {
            let secondClass: string = secondClassData.toArray()[0]['secondClass']
            let summarize = secondClassData.summarize({
              money: {
                money_sum: Series.sum,
                money_average: Series.average,
                count: Series.count
              }
            })

            let SpendingsAnalysis: SpendingsAnalysis = { ...summarize, secondClass: secondClass }
            result.push(SpendingsAnalysis)
          })
        }
      }
    )

    return result
  }

  public get incomAnalysis(): IncomeAnalysis[] {
    let result: IncomeAnalysis[] = []
    this.data.filter(row => row.type === 'income').groupBy(row => row.firstClass).forEach(
      (firstClassData) => {
        let summarize = firstClassData.summarize({
          money: {
            moneySum: Series.sum,
            moneyAverage: Series.average,
            count: Series.count
          }
        })
        let firstClass: string = firstClassData.toArray()[0]['firstClass']
        let incomeAnalysis: IncomeAnalysis = { ...summarize, firstClass: firstClass }
        result.push(incomeAnalysis)

      }
    )
    return result
  }
  /**
   * 根据数据检查statistics
   */
  private checkStatistics() {
    if (this.data.count() === 0) {
      return
    }
    else {
      for (let i of DataApi.category["accounts"]) {
        this.statistics["current"][i] = this.statistics["monthBegin"][i]
      }

      let income = this.data.filter(row => row.type === 'income')
      if (income.count() !== 0) {
        income.groupBy(row => row.account).forEach(accountData => {
          let account = accountData.toArray()[0]['account']
          let sum = accountData.getSeries('money').sum()
          this.statistics['current'][account] += sum
        })
      }


      let spending = this.data.filter(row => row.type === 'spending')
      if (spending.count() !== 0) {
        spending.groupBy(row => row.account).forEach(accountData => {
          let account = accountData.toArray()[0]['account']
          let sum = accountData.getSeries('money').sum()
          this.statistics['current'][account] -= sum
        })
      }
      this.statistics.budgets.used = spending.getSeries('money').sum()

      let transfer = this.data.filter(row => row.type === 'transfer')
      if (transfer.count() !== 0) {
        transfer.groupBy(row => row.account).forEach(accountData => {
          let account = accountData.toArray()[0]['account']
          let sum = accountData.getSeries('money').sum()
          this.statistics['current'][account] += sum
        })
        transfer.groupBy(row => row.firstClass).forEach(firstClassData => {
          let firstClass = firstClassData.toArray()[0]['firstClass']
          let sum = firstClassData.getSeries('money').sum()
          this.statistics['current'][firstClass] -= sum
        })
      }
      this.checkFloat()
    }
  }

  private checkFloat() {
    for (let i of DataApi.category["accounts"]) {
      this.statistics.monthBegin[i] = DataApi.approximateTwo(this.statistics.monthBegin[i])
      this.statistics["current"][i] = DataApi.approximateTwo(this.statistics["current"][i])
    }
    this.statistics.budgets.used = DataApi.approximateTwo(this.statistics.budgets.used)
  }
}

// DataApi.checkAutomatic()