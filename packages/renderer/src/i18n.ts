import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import cn from './locales/cn.json'

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: 'cn', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: {
        en:en,
        cn:cn
    }
})

export default i18n