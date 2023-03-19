#### Source Code and Building
All Pomodoro appication code lives in [app.js](../app.js). To facilitate testing there is [test.html](../test.html) page that includes app.js as a script. To test a change, edit app.js, open or reload the test.html page in a browser and test your change.

Code is intentionally kept simple, uses only ES3 JavaScript, and doesn't use any libraries.

There is a script that helps to transform app.js in `javascript:<single_line_app_code>` format required for adding the app to browser. Run  `npm run build` to transform app.js and save the result in [bundle.txt](../bundle.txt). For the build script to run, [Node.js](https://nodejs.org/) must be installed on your system.

#### Editing UI
App HTML markdown is saved as a string in "template" variable. But it's not very convenient to edit HTML as a single line string, so there is [template.html](../template.html). If you wish to make a change to the app markdown, edit and save template.html and run `npm run inject-template`, it will update "template" variable. As with the build script, Node.js must be installed on your system.