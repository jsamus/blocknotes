// main.js

// Modules to control application life and create native browser window
const { ipcMain, app, BrowserWindow } = require('electron')
const path = require('path')

let windows = new Set()

const createWindow = () => {
  // Create the browser window.
  const window = new BrowserWindow({
    frame: false,
    transparent: true,
    minWidth: 300,
    width: 800,
    height: 61,
    maxHeight: 61,
    minHeight: 61,
    maxWidth: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  windows.add(window)
  // and load the index.html of the app.
  window.loadFile('index.html')

  // Open the DevTools.
  //window.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.  
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function resizeFocusedWindow(newHeight){
  let window = BrowserWindow.getFocusedWindow();
  let [currWidth,currHeight] = window.getSize();
  window.setMinimumSize(300,newHeight);
  window.setMaximumSize(1000,newHeight);
  window.setSize(currWidth,newHeight);
}

ipcMain.on("resize-window",(event,arg)=>{
  resizeFocusedWindow(arg);
});

ipcMain.on("add-window",createWindow);

ipcMain.on("close-window",()=>{
  BrowserWindow.getFocusedWindow().close();
})