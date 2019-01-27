const { Menu, app } = require("electron");
const mw = require("./mainWindow");
var template = [{
    label: "Application",
    submenu: [{
            label: "Reload",
            accelerator: "CmdOrCtrl+R",
            click: () => {
                mw.mainWindow && mw.mainWindow.reload();
            }
        },
        {
            label: "Developer Tools",
            accelerator: "Alt+CmdOrCtrl+I",
            click: () => {
                mw.mainWindow.webContents.openDevTools()
            }
        },
        { type: "separator" },
        {
            label: "Quit",
            accelerator: "Command+Q",
            click: () => {
                app && app.quit();
            }
        }
    ]
}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },

        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
}];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));