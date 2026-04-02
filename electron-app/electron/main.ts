import { app, BrowserWindow } from "electron"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rendererBuildPath = path.join(__dirname, "../build/client/index.html")

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    // width: 1280,
    // height: 800,
    // minWidth: 1024,
    // minHeight: 640,
    backgroundColor: "#ffffff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  })

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `Electron failed to load ${validatedURL} (${errorCode}): ${errorDescription}`,
      )
    },
  )

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error(`Electron renderer exited: ${details.reason}`)
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  if (devServerUrl) {
    void mainWindow.loadURL(devServerUrl).catch((error: unknown) => {
      console.error(`Electron could not open ${devServerUrl}`)
      console.error(error)
    })

    return mainWindow
  }

  if (!existsSync(rendererBuildPath)) {
    throw new Error(
      `Renderer build not found at ${rendererBuildPath}. Run \"npm run build\" before starting Electron.`,
    )
  }

  void mainWindow.loadFile(rendererBuildPath).catch((error: unknown) => {
    console.error(`Electron could not open ${rendererBuildPath}`)
    console.error(error)
  })

  return mainWindow
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on("second-instance", () => {
  const windows = BrowserWindow.getAllWindows()
  if (windows.length > 0) {
    if (windows[0].isMinimized()) windows[0].restore()
    windows[0].focus()
  }
})

app.whenReady().then(() => {
  createMainWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})