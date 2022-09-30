let status = document.getElementById('status');
let msg = document.getElementById('msg');
let output = document.getElementById('output');
let inputFile = document.getElementById('file');

let source = document.getElementById('source');
let result = document.getElementById('result');

let windowSize = document.getElementById('window-size');
let pixelSize = document.getElementById('pixel-size');

function updateStatus(msg){
    output.innerHTML=msg
    console.log(msg)
}

async function main() {
    try {
        window.pyodide = await loadPyodide({ stdout: updateStatus, stderr: updateStatus })
        // fetch python script 
        const sourcecode = await fetch('pixelate.py').then(response => response.text())
        // load required packages
        await pyodide.loadPackagesFromImports(sourcecode)
        // execute python script
        pyodide.runPython(sourcecode)
        status.classList.remove("processing")
        msg.innerHTML = 'Processing image..'
    }
    // if there was an error on any step, notify the user
    catch (e){
        status.classList.remove("processing")
        alert('Initialization error. Please update the page.\n'+e.message)
        console.log("Error", e.stack);
        console.log("Error", e.name);
        console.log("Error", e.message);
}

    // handle image upload
    inputFile.onchange = () => {
        const file = inputFile.files[0]
        const reader = new FileReader();

        reader.onloadend = () => {
            status.classList.add("processing")

            source.src = reader.result
            setTimeout(() => {
                // python set_img function needs only base64 part
                const img = reader.result.replace(/^data:.+;base64,/, '')

                const w = parseInt(windowSize.value)
                const p = parseInt(pixelSize.value)
                // execute python function
                try {
                    result.src = pyodide.globals.get('set_img')(img, w, p).toJs()
                    // status.classList.remove("processing")
                } catch (e) {
                    alert(e.message)
                    console.log("Error", e.stack);
                    console.log("Error", e.name);
                    console.log("Error", e.message);
                }
                status.classList.remove("processing")
            }, 0)
        }

        reader.readAsDataURL(file);
    }
}

function update() {
    msg.classList.add("processing")
    setTimeout(() => {
        const w = parseInt(windowSize.value)
        const p = parseInt(pixelSize.value)
        try {
            // execute python function
            result.src = pyodide.globals.get('pixelate_dense')(w, p).toJs()
        } catch { alert('Python error') }

        msg.classList.remove("processing")
    }, 0)
}

main()