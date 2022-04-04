import { readFileSync, writeFileSync } from "fs"
import {join} from 'path'
import DataApi from './DataApi'
import {app} from 'electron'

let preIndex:string
if (process.env['production']){
  preIndex=join(__dirname,'../../data/')
}
else{
  preIndex = './data/'
}

export function changeCategory(
    type: 'income' | 'spending' | 'transfer' | 'accounts',
    op: 'add' | 'remove' | 'replace',
    val: string,
    optionVal?: string,
    optionVal2?: string
) {
    let category: CategoryType = JSON.parse(readFileSync(`${preIndex}/category.json`).toString())
    if (type !== 'spending') {
        if (op === 'add') {
            if (!category[type].includes(val)) {
                category[type].push(val)
            }
        }
        else if (op === 'remove') {
            category[type] = category[type].filter(value => value !== val)
        }
        else {
            if (category[type].includes(val) && optionVal) {
                let index = category[type].indexOf(val)
                category[type][index] = optionVal
            }
        }
    }
    else {
        if (optionVal) {
            if (op === 'add') {
                if (!category[type][val].includes(optionVal)) {
                    category[type][val].push(optionVal)
                }
            }
            else if (op === 'remove') {
                category[type][val] = category[type][val].filter(value => value !== optionVal)
            }
            else {
                if (optionVal2) {
                    if (category[type][val].includes(optionVal)) {
                        let index = category[type][val].indexOf(optionVal)
                        category[type][val][index] = optionVal2
                    }
                }
                else {
                    if (category[type]['firstClass'].includes(val)) {
                        let index = category[type]['firstClass'].indexOf(val)
                        category[type]['firstClass'][index] = optionVal
                    }
                }
            }
        }
        else {
            if (op === 'add') {
                if (!category[type]['firstClass'].includes(val)) {
                    category[type]['firstClass'].push(val)
                }
            }
            else if (op === 'remove') {
                category[type]['firstClass'] = category[type]['firstClass'].filter(value => value !== val)
            }
        }
    }
    writeFileSync(`${preIndex}/category.json`, JSON.stringify(category, null, 4))
    DataApi.updateCategory()
}
