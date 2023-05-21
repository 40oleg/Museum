const font2base64 = require('node-font2base64')

const regular = font2base64.encodeToDataUrlSync('./fonts/Manrope-Regular.ttf')
const bold = font2base64.encodeToDataUrlSync('./fonts/Manrope-Bold.ttf')
const extrabold = font2base64.encodeToDataUrlSync('./fonts/Manrope-ExtraBold.ttf')


module.exports = (imgBase64, art, author, name, year, sequenceNumber) => {
    return {
        output: `./results/${sequenceNumber}.jpg`,
            quality: 4000,
        content: {imageSource: imgBase64},
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
        <div class="card__art">${art}</div>
        <div class="card__artist">${author}</div>
        <div class="card__work-name">${name}</div>
        <div class="card__description">${year}</div>
        <img class="card__image" src="{{imageSource}}">
    </div>
    
    </body>
    </html>
    `
    }
};
