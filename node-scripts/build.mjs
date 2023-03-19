import { minify } from "minify";
import { writeFile } from "fs/promises";

try {
    let minifiedApp = await minify("./app.js");
    if (minifiedApp.startsWith("!function()") && minifiedApp.endsWith("}();")) {
        // Have no idea why minify changes the function declaration
        minifiedApp = `(${minifiedApp.slice(1, minifiedApp.length - 4)}})()`;
    }
    await writeFile("./bundle.txt", "javascript: " + encodeURI(minifiedApp));
} catch (error) {
    console.error(error);
}
