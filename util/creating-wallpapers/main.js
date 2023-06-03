const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs');
const pattern = require("./pattern");

let paintingSequenceNumber = 0;

(async () => {
    const PAINTINGS = JSON.parse(fs.readFileSync('./paintings/paintings.json').toString());
    console.time('start')
    while(PAINTINGS.length) {
        console.log(PAINTINGS.length)
        const batch = PAINTINGS.splice(0, 7);
        const allPromises = [];
        for (const item of batch) {
            const image = fs.readFileSync(`./paintings/${item.file}`);
            const base64Image = new Buffer.from(image).toString('base64');
            const imgBase64 = 'data:image/jpeg;base64,' + base64Image
            allPromises.push(nodeHtmlToImage(pattern(imgBase64, "Изобразительное искусство", item.author, item.name, item.years, paintingSequenceNumber)));
            paintingSequenceNumber++;
        }
        await Promise.all(allPromises);
    }
    console.timeEnd('start')
})()
