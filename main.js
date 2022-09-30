let msg = document.getElementById('msg');
let inputFile = document.getElementById('file');

let source = document.getElementById('source');
let result = document.getElementById('result');

let windowSize = document.getElementById('window-size');
let pixelSize = document.getElementById('pixel-size');

async function main() {
    try {
        window.pyodide = await loadPyodide();

        // fetch python script 
        const sourcecode = await fetch('pixelate.py').then(response => response.text())
        // load required packages
        await pyodide.loadPackagesFromImports(sourcecode)
        // execute python script
        pyodide.runPython(sourcecode)
        msg.classList.remove("processing")
        msg.innerHTML = 'Processing image..'
    }
    // if there was an error on any step, notify the user
    catch {
        msg.classList.remove("processing")
        alert('Initialization error. Please update the page.')
    }

    // handle image upload
    inputFile.onchange = () => {
        const file = inputFile.files[0]
        const reader = new FileReader();

        reader.onloadend = () => {
            msg.classList.add("processing")

            source.src = reader.result
            setTimeout(() => {
                // python set_img function needs only base64 part
                const img = reader.result.replace(/^data:.+;base64,/, '')

                const w = parseInt(windowSize.value)
                const p = parseInt(pixelSize.value)
                // execute python function
                try {
                    result.src = pyodide.globals.set_img(img, w, p)
                    // msg.classList.remove("processing")
                } catch { alert('Python error') }
                msg.classList.remove("processing")
            }, 0)
        }

        reader.readAsDataURL(file);
    }
}

const update = () => {
    msg.classList.add("processing")
    setTimeout(() => {
        const w = parseInt(windowSize.value)
        const p = parseInt(pixelSize.value)
        try {
            // execute python function
            result.src = pyodide.globals.pixelate_dense(w, p)
        } catch { alert('Python error') }

        msg.classList.remove("processing")
    }, 0)
}

main()