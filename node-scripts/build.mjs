import { minify } from "minify";
import { writeFile } from "fs/promises";

try {
    const minifiedApp = await minify("./app.js");
    await writeFile("./bundle.txt", "javascript: " + encodeURI(minifiedApp));
} catch (error) {
    console.error(error);
}
