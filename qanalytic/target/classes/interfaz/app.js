const { app, BrowserWindow, Menu } = require('electron')
const url = require('url');
const path = require('path');

let mainWindow

app.on('ready', () =>{
  mainWindow = new BrowserWindow({

  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "/Inicio.html"),
    protocol: 'file',
    slashes: true
  }))
  
  const mainMenu = Menu.buildFromTemplate(templateMenu)
  Menu.setApplicationMenu(mainMenu);
});

const templateMenu=[
  {
    label:'',
  }
];

// function createWindow () {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//     }
//   })

//   win.loadFile('Inicio.html')
// }

// app.whenReady().then(createWindow)
