const nodeHtmlToImage = require('node-html-to-image')

const fs = require('fs');

const image = fs.readFileSync('../../code/client/src/assets/paintings/painting2.jpg');
const base64Image = new Buffer.from(image).toString('base64');
const dataURI = 'data:image/jpeg;base64,' + base64Image

const font2base64 = require('node-font2base64')

const regular = font2base64.encodeToDataUrlSync('./fonts/Manrope-Regular.ttf')
const bold = font2base64.encodeToDataUrlSync('./fonts/Manrope-Bold.ttf')
const extrabold = font2base64.encodeToDataUrlSync('./fonts/Manrope-ExtraBold.ttf')

nodeHtmlToImage({
    output: './image.jpg',
    quality: 2000,
    content: {imageSource: dataURI},
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<style>
@font-face {
    font-family: Manrope;
    src: url(${regular}) format('woff2');
}
@font-face {
    font-family: Manrope-Bold;
    src: url(${bold}) format('woff2');
}
@font-face {
    font-family: Manrope-ExtraBold;
    src: url(${extrabold}) format('woff2');
}

* {
    margin: 0;
    padding: 0;
}
body {
    width: 3840px;
    height: 2160px;
    background: #222;
}
.card {
    position: fixed;
    right: 2vw;
    bottom: 3vw;
    width: 35vw;
    padding: 1vw;
    border: 1px #686967 solid;
    border-radius: 1.5vw;
}

.card__art {
    color: #7a7b79;
    text-transform: uppercase;
    font-size: 0.8vw;
    font-family: Manrope;
}


.card__artist  {
    color: #e3e3e3;
    font-size: 1.4vw;
    font-family: Manrope-ExtraBold;
    margin-top: 0.4vw;
}
.card__work-name {
    color: #e3e3e3;
    font-size: 1.2vw;
    font-family: Manrope-ExtraBold;
    margin-top: 1vw;
}

.card__description {
    color: #7a7b79;
    font-size: 0.8vw;
    font-family: Manrope-Bold;
    line-height: 1.8;
    margin-top: 0.8vw;
}

.card__image {
    width: 100%;
    border-radius: 1vw;
    margin-top: 1.8vw;
}
</style>
<body>

<div class="card">
    <div class="card__art">Изобразительное искусство</div>
    <div class="card__artist">Иван Айвазовский</div>
    <div class="card__work-name">Девятый вал</div>
    <div class="card__description">Живописец изображает море после очень сильного ночного шторма и людей, потерпевших кораблекрушение. Лучи солнца освещают громадные волны. Самая большая из них — девятый вал — готова обрушиться на людей, пытающихся спастись на обломках мачты.</div>
    <img class="card__image" src="{{imageSource}}">
</div>

</body>
</html>
`

})
