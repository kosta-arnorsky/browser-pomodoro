const minify = require("minify");
const fs = require("fs");

minify("app.js")
    .then(saveBundle)
    .catch(console.error);

function saveBundle(minifiedApp) {
    fs.writeFileSync("bundle.js", "javascript: " + minifiedApp);
}
