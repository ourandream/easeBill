import {
	DefineLocaleMessage
} from 'vue-i18n'

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		readonly VITE_DEV_SERVER_HOST: string
		readonly VITE_DEV_SERVER_PORT: string
	}
}


type cn = typeof import('./locales/cn.json')
declare module 'vue-i18n' {
	// define the locale messages schema
	export interface DefineLocaleMessage extends cn {

	}
}

export global {
	interface CategoryType {
		[index: string]: string[] | { [index: string]: string[] }
		income: string[]
		transfer: string[]
		accounts: string[]
		heads: string[]
		spending: {
			[index: string]: string[]
			firstClass: string[]
		}
		type: string[]
	}
	interface Bill {
		day: number
		type: string
		account: string
		money: number | null
		firstClass: string
		secondClass: string
		note: string
	}

	interface SpendingsAnalysis {
		day?: string
		firstClass?: string
		secondClass?: string
		count: number
		money_average: number
		money_sum: number
	}

	interface StatisticsType {
		monthBegin: { [index: string]: number },
		budgets: {
			[index: string]: number,
			plan: number,
			used: number,
			remain: number,
			dailyPlan: number,
			dailyRemain: number
		},
		current: { [index: string]: number }
	}
	interface IncomeAnalysis {
		firstClass: string,
		moneySum: number
		moneyAverage: number
		count: number
	}
	interface AutomaticBill {
		bill: Bill,
		startDate: string,
		endDate: string,
		interval?: number,
		addSuccess: boolean[],
		dayOfMonth?: number
	}
	interface ShowAutomaticBill {
		bill: Bill,
		startDate: Date,
		endDate: Date,
		interval?: number,
		dayOfMonth?: number
	}

}
