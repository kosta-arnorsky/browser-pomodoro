import { minify } from "minify";
import { writeFile } from "fs/promises";

try {
    const minifiedApp = await minify("./app.js");
    await writeFile("./bundle.js", "javascript: " + encodeURI(minifiedApp));
} catch (error) {
    console.error(error);
}
