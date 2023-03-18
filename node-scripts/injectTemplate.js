const minify = require("minify");
const fs = require("fs");

options = {
    html: {
        removeAttributeQuotes: false
    }
}

// Reads and minifies "template.html" file, then calls injectTemplate
// to update template variable with minified "template.html" content
minify("template.html", options)
    .then(injectTemplate)
    .catch(console.error);

function injectTemplate(minifiedTemplate) {
    let appSourceCode = fs.readFileSync("app.js", { encoding: "utf8", flag: "r" });
    // Use a simple regex to locate the template string,
    // should be good for now
    appSourceCode = appSourceCode.replace(/var template = '[^']+';/, "var template = '" + minifiedTemplate + "';");

    fs.writeFileSync("app.js", appSourceCode);
}
