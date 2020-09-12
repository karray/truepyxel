let msg = document.getElementById('msg');
let inputFile = document.getElementById('file');

let source = document.getElementById('source');
let result = document.getElementById('result');

let windowSize = document.getElementById('window-size');
let pixelSize = document.getElementById('pixel-size');

languagePluginLoader
    // load required packages
    // .then(() => pyodide.loadPackage(['numpy', 'matplotlib']))
    // fetch python script 
    .then(() => fetch('pixelate.py'))
    // get bodu as text
    .then(response => response.text())
    // execute python script
    .then(pyscript => pyodide.runPythonAsync(pyscript))
    .then(() => {
        msg.classList.remove("processing")
        msg.innerHTML = 'Processing image..'
    })



// handle image upload
inputFile.onchange = () => {
    let file = inputFile.files[0]
    let reader = new FileReader();

    reader.onloadend = () => {
        msg.classList.add("processing")

        source.src = reader.result
        setTimeout(() => {
            // python set_img function needs only base64 part
            let img = reader.result.replace(/^data:.+;base64,/, '')

            let w = parseInt(windowSize.value)
            let p = parseInt(pixelSize.value)
            // execute python function
            try {
                result.src = pyodide.globals.set_img(img, w, p)
                // msg.classList.remove("processing")
            } catch{ alert('Python error') }
            msg.classList.remove("processing")
        }, 0)
    }

    reader.readAsDataURL(file);
}

let update = () => {
    msg.classList.add("processing")
    setTimeout(() => {
        let w = parseInt(windowSize.value)
        let p = parseInt(pixelSize.value)
        // execute python function
        try {
            result.src = pyodide.globals.pixelate_dense(w, p)
        } catch{ alert('Python error') }
        msg.classList.remove("processing")
    }, 0)
}