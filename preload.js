// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronIPC', {
    invoke: async (channel, data) => {
        try {
            const result = await ipcRenderer.invoke(channel, data);
            return result;
        } catch (error) {
            throw new Error(error);
        }
    },
    on: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(event, ...args));
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    shell: {
        openExternal: (url) => {
            ipcRenderer.send('openExternalURL', url);
        },
    },
    remote: {
        getCurrentWindow: () => {
            return ipcRenderer.sendSync('getCurrentWindow');
        },
    },
});
