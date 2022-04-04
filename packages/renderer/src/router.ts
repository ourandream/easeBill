import { createRouter, createWebHashHistory } from 'vue-router'
import Main from './views/Main.vue'
import Statistics from './views/Statistics.vue'
import SpendingAnalysis from './views/SpendingAnalysis.vue'
import CategorySetting from './views/CategorySetting.vue'
import BasicSetting from './views/BasicSetting.vue'
import IncomeAnalysis from './views/IncomeAnalysis.vue'
import AutomaticBill from './views/AutomaticBill.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        component: Main
    },
    {
        path: '/statistics',
        component: Statistics
    },
    {
        path:'/spendingAnalysis',
        component:SpendingAnalysis
    },
    {
        path:'/basicSetting',
        component:BasicSetting
    },
    {
        path:'/categorySetting',
        component:CategorySetting
    },
    {
        path:'/incomeAnalysis',
        component:IncomeAnalysis   
    },
    {
        path:'/automaticBill',
        component:AutomaticBill
    }
    ]
})

export default router