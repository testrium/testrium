import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Home from './Home.vue'
import type { EnhanceAppContext } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('Home', Home)
  }
}
