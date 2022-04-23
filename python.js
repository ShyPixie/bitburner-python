const doc = globalThis['document']
const win = globalThis['window']

const brythonScripts = [
    'https://cdn.jsdelivr.net/npm/brython@3/brython.min.js',
    'https://cdn.jsdelivr.net/npm/brython@3/brython_stdlib.js',
]

/** @param { import("~/ns").NS } ns */
export async function main(ns) {
    // Install Brython
    if (!win.__BRYTHON__) {
        // Build script tags
        let numLoaded = 0
        for (const src of brythonScripts) {
            let scriptTag = doc.createElement('script')
            scriptTag.src = src
            scriptTag.async = false
            scriptTag.onload = () => (numLoaded = numLoaded + 1)
            doc.head.appendChild(scriptTag)
            await ns.sleep(200)
        }

        // Wait for loaded scripts
        let timedOut = false
        let timeStart = performance.now()
        const timeoutMs = 8000
        const scriptWatcher = setInterval(() => {
            if (performance.now() - timeStart >= timeoutMs)
                timedOut = { after: performance.now() - timeStart }

            if (numLoaded < 2 && timedOut === false) return

            if (timedOut) {
                clearInterval(scriptWatcher)
                throw new Error(`Timed out after ${timedOut.after / 1000}s while loading Brython`)
            }

            clearInterval(scriptWatcher)
        }, 150)
    }

    const program = ns.args[0]

    if (!ns.args[0]) {
        throw new Error(`You must specify a program to run`)
    }

    if (!ns.fileExists(program, 'home')) {
        throw new Error(`The file specified doesn't exist`)
    }

    const mainFunc = ns.read(program).replaceAll('\n    ', '\n        ')
    const brythonScriptId = crypto.randomUUID()

    const brythonScript = `
from browser import window, aio

async def handler():
    brythonScriptId = "${brythonScriptId}"
    ns = window.__brythonNs[brythonScriptId]

    ${mainFunc}

    await main()

aio.run(handler())
`

    // Save NS
    if (!win.__brythonNs) win.__brythonNs = {}
	win.__brythonNs[brythonScriptId] = ns

    // Run program
    eval(win.__BRYTHON__.python_to_js(brythonScript))
}
