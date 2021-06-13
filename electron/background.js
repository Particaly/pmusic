import ipcControl from './ipcMain';
import {
    createProtocol
} from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

const isDevelopment = process.env.NODE_ENV !== 'production'
const {app, BrowserWindow, protocol} =require('electron');// 引入electron

let win;
// Scheme must be registered before the app is ready
// 有了protoco才能通过app://的形式去请求到资源，资源被打包在app.asar文件中，可使用asar的npm包解压
protocol.registerSchemesAsPrivileged([{
    scheme: 'app',
    privileges: {
        secure: true,
        standard: true
    }
}])
// 窗口的配置
let windowConfig = {
    width:800,
    height:600,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        experimentalFeatures: true
    }
};

// 窗口配置程序运行窗口的大小
function createWindow(){
    win = new BrowserWindow(windowConfig);// 创建一个窗口
    ipcControl.useWindow(win);
    // win.loadURL(`file://${__dirname}/index.html`);// 在窗口内要展示的内容index.html 就是打包生成的index.html
    if(process.env.NODE_ENV === 'development'){
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    }else{
        // win.loadFile('./index.html')
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
    win.webContents.openDevTools();  // 开启调试工具
    win.on('close',() => {
        // 回收BrowserWindow对象
        win = null;
    });
    win.on('resize', () => {
        win.reload();
    });
}
function loadVueDevTool() {
    if (isDevelopment) {
        return installExtension(VUEJS_DEVTOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));
    }
}
app.whenReady().then(createWindow).then(loadVueDevTool);
app.on('window-all-closed',() => {
    app.quit();
});
app.on('activate',() => {
    if(win == null){
        createWindow();
    }
});

