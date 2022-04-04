import { contextBridge, ipcRenderer} from 'electron'
import { domReady } from './utils'
import DataAPi from './DataApi'
import Settings from './Setting'

;(async () => {
  await domReady()
})()
// --------- Expose some API to the Renderer process. ---------

contextBridge.exposeInMainWorld('api',DataAPi)
contextBridge.exposeInMainWorld('Setting',Settings)
contextBridge.exposeInMainWorld('win',{
  max:()=>{ipcRenderer.invoke('win:max')},
  min:()=>{ipcRenderer.invoke('win:min')},
  close:()=>{ipcRenderer.invoke('win:close')},
  default:()=>{ipcRenderer.invoke('win:default')}
})
