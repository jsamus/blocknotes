// main.js

// Modules to control application life and create native browser window
const { ipcMain, app, BrowserWindow } = require('electron')
const path = require('path')

let windows = []

const createWindow = () => {
  // Create the browser window.
  const window = new BrowserWindow({
    frame: false,
    transparent: true,
    minWidth: 300,
    width: 800,
    height: 61,
    // maxHeight: 61,
    minHeight: 61,  
    maxWidth: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  let windowIndex = windows.length;
  windowObj = {id:windowIndex,window:window,docked:false,childWindows:[]}
  windows.push(windowObj)
  // and load the index.html of the app.
  window.loadFile('index.html')

  window.on("move",()=>{
    let focusedWindowObj = getFocusedWindowObj(windows);
    if(focusedWindowObj.childWindows.length === 0 && focusedWindowObj.docked === false){
      console.log("erster")
      let otherWindows = windows.filter(win => !win.window.isFocused());
      let [focusX,focusY] = window.getPosition();
      for(let other of otherWindows){
        let [otherX,otherY] = other.window.getPosition()
        let otherWidth = other.window.getBounds().width
        let otherHeight = other.window.getBounds().height
        let deltaX = focusX-otherX
        let deltaY = focusY-(otherY+otherHeight)
        if(range(deltaX,40) && range(deltaY,20)){
          window.webContents.send('dock-window')
          window.setPosition(otherX,otherY+otherHeight+5);
          if(!isInArray(focusedWindowObj,other.childWindows)){
            other.childWindows.push(focusedWindowObj);
          }
          // console.log("i can dock now!")
        } else {
          removeAsChildFromParent(other.childWindows);
          window.webContents.send('undock-window')
        }
      }
    } else if(focusedWindowObj.childWindows.length > 0 && focusedWindowObj.docked === false){
      console.log("zweiter")
      console.log("moving childs!")
      for(let child of focusedWindowObj.childWindows){
        let [parentX,parentY] = focusedWindowObj.window.getPosition()
        let parentHeight = focusedWindowObj.window.getBounds().height;
        child.window.setPosition(parentX,parentY+parentHeight+5);
      }
    }
    
  })

  // window.on("moved"),()=>{
  //   window.setPosition(otherX,otherY+otherHeight+5);
  // }

  // Open the DevTools.
  window.webContents.openDevTools()
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

function range(val,threshold){
  return val > -threshold && val <= threshold;
}

ipcMain.on("resize-window",(event,arg)=>{
  resizeFocusedWindow(arg);
});

ipcMain.on("add-window",createWindow);

ipcMain.on("close-window",()=>{
  BrowserWindow.getFocusedWindow().destroy();
  let focusedWindowObj = getFocusedWindowObj(windows);
  let otherWindows = windows.filter(win => !win.window.isFocused());
  windows.splice(focusedWindowObj.index,1);
  for(let other of otherWindows){
    removeAsChildFromParent(other.childWindows);
  }
  
})

function getFocusedWindowObj(windows){
  console.log(windows);
  for(let windowObj of windows){
    if(windowObj.window.isFocused()){
      console.log(windowObj.childWindows.length);
      return windowObj;
    }
  }
}

function removeAsChildFromParent(windows){
  for(let [index,windowObj] of windows.entries()){
    if(windowObj.window.isFocused()){
      windows.splice(index,1); 
    }
  }
}

function isInArray(windowObj,childWindows){
  return childWindows.some(child => child.id === windowObj.id);
}