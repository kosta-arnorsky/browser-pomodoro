import { minify } from "minify";
import { readFile, writeFile } from "fs/promises";

const options = {
    html: {
        removeAttributeQuotes: false
    }
}

try {
    // Reads and minifies "template.html" file
    const minifiedTemplate = await minify("./template.html", options);
    // injectTemplate updates app.js "template" variable with minified "template.html" content
    await injectTemplate(minifiedTemplate);
} catch (error) {
    console.error(error);
}

async function injectTemplate(minifiedTemplate) {
    let appSourceCode = await readFile("app.js", { encoding: "utf8", flag: "r" });
    // Use a simple regex to locate the template string,
    // should be good for now
    appSourceCode = appSourceCode.replace(/var template = '[^']+';/, "var template = '" + minifiedTemplate + "';");

    await writeFile("app.js", appSourceCode);

    console.log("app.js \"template\" variable has been updated with the latest changes.")
}
