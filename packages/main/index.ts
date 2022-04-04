import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { release } from 'os'
import { join } from 'path'
import { dataAPiToRenderer } from './Communication'
import installExtension, {VUEJS3_DEVTOOLS} from 'electron-devtools-installer';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// let t=new DataApi(new Date())

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    frame:false,
    width:1200,
    height:1000,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs')
    },
  })

  if (app.isPackaged || process.env["DEBUG"]) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }

  // Test active push message to Renderer-process
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}



app.whenReady()
.then(createWindow)
.then(dataAPiToRenderer)
.then(()=>{
  installExtension(VUEJS3_DEVTOOLS.id)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
})
.then(()=>{
  ipcMain.handle('win:min',()=>{win?.minimize()})
  ipcMain.handle('win:max',()=>win?.maximize())
  ipcMain.handle('win:close',()=>win?.close())
  ipcMain.handle('win:default',()=>{win?.restore()})
})



app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
  if (process.env.NODE_ENV !== 'production') {
  }
})
