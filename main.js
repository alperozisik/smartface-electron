// Modules to control application life and create native browser window
const { app, BrowserWindow, shell } = require('electron')
const urlParse = require('url-parse');
const fs = require("fs");
const path = require("path");
const mw = require("./mainWindow");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var appIcon;
var cssContent = "";

require("./menu");
const defaultWindowPrefs = Object.freeze({
    width: 1024,
    height: 768,
    webPreferences: Object.freeze({
        //nativeWindowOpen: true,
        nodeIntegration: false,
        //sandbox: true
    }),
    icon: "./icon.png",
    titleBarStyle: 'hiddenInset'
});

function createWindow() {
    // Create the browser window.
    mw.mainWindow = new BrowserWindow(Object.assign({}, defaultWindowPrefs));

    // and load the index.html of the app.
    //mw.mainWindow.loadFile('index.html')
    //mw.mainWindow.loadFile('smartface.html');
    mw.mainWindow.loadURL('https://cloud.smartface.io/')

    // Open the DevTools.
    // mw.mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mw.mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mw.mainWindow = null;
    });

    mw.mainWindow.on("enter-full-screen", () => {
        evalJS();
    });
    mw.mainWindow.on("leave-full-screen", () => {
        evalJS();
    });

    mw.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        if (frameName === 'modal') {
            // open window as modal
            // 
            // Object.assign(options, defaultWindowPrefs, {
            //     modal: true,
            //     parent: mw.mainWindow,
            // });
            // event.newGuest = new BrowserWindow(options);

        }
        event.preventDefault();
        let parsedUrl = urlParse(url);
        let { hostname } = parsedUrl;
        if (/(?:^(cloud|ide).*)\.smartface\.io$/.test(hostname)) {
            mw.mainWindow.loadURL(url);
        } else {
            shell.openExternal(url);
        }
    });

    mw.mainWindow.webContents.on('did-finish-load', function() {
        evalJS().then(() => getCssContent())
            .then(content => {
                mw.mainWindow.webContents.insertCSS(content);
            });
        //mw.mainWindow.webContents.insertCSS('@import url("file://${__dirname}/styles.css")');
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    //appIcon = new Tray('./icon.png');
    return createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mw.mainWindow === null) {
        createWindow();
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


getCssContent = () => {
    return new Promise((resolve, reject) => {
        if (cssContent)
            return resolve(cssContent);
        else {
            fs.readFile(path.join(__dirname, "styles.css"), "utf8", (err, content) => {
                if (err) {
                    return reject(err);
                } else {
                    cssContent = content;
                    return resolve(cssContent);
                }
            });
        }

    });
}

getJS = () => {
    let isFullScreen = mw.mainWindow.isFullScreen();
    let scripts = [];
    if (isFullScreen) {
        scripts.push(`document.body.classList.add("full-screen")`);
    } else {
        scripts.push(`document.body.classList.remove("full-screen")`);
    }

    return scripts.join("\n");
};

evalJS = () => {
    return new Promise((resolve, reject) => {
        let content = getJS();
        mw.mainWindow.webContents.executeJavaScript(content, () => {
            return resolve();
        });
    });
};