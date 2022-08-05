const nodeHtmlToImage = require('node-html-to-image')
const qr = require('sexy-qr');
const fs = require("fs");

class QrGenerator {

    defaultConfiguration = {
        paths: {
            dirPath: './tmp/',
            qrName: 'qr.svg',
            imgName: 'img.jpg',
        }
    }

    constructor(configuration) {
        this.configuration = {...this.defaultConfiguration, ...configuration}
        this.paths = this.configuration.paths
        this.paths = {
            ...this.paths,
            qrPath: `${this.paths.dirPath}${this.paths.qrName}`,
            imgPath: `${this.paths.dirPath}${this.paths.imgName}`,
        }
    }

    generateQR = async (QRCodeConfig, SVGConfig) => {
        const qrCode = new qr.QRCode({
            content: 'Hello World',
            ecl: 'M', // 'L' | 'M' | 'Q' | 'H'
            ...QRCodeConfig
        });

        const qrSvg = new qr.QRSvg(qrCode, {
            fill: 'red',
            cornerBlocksAsCircles: true,
            size: 200, // px
            radiusFactor: 0.75, // 0-1
            cornerBlockRadiusFactor: 2, // 0-3
            roundOuterCorners: true,
            roundInnerCorners: true,
            ...SVGConfig
        });

        return qrSvg.svg;
    }

    generate = async (
        htmlTemplate = '',
        templateVariables = {},
        QRCodeConfig = {},
        SVGConfig = {},
    ) => {

        const svgStr = await this.generateQR(QRCodeConfig, SVGConfig)
        const base64Image = new Buffer.from(svgStr).toString('base64');
        const dataURI = 'data:image/svg+xml;base64,' + base64Image

        if (!fs.existsSync(this.paths.dirPath)) {
            fs.mkdirSync(this.paths.dirPath, {
                mode: 0o744,
            });
        }

        await nodeHtmlToImage({
            output: this.paths.imgPath,
            html: htmlTemplate,
            content: {
                ...templateVariables,
                imageSource: dataURI,
            },
        })
    }

}

const qrGenerator = new QrGenerator()

// example
const run = async () => {

    const htmlTemplate =
        `
        <html>
            <head>
                <style>
                    body {
                        width: 500px;
                        height: 500px;
                        display: grid;
                        justify-content: center;
                        align-items: center;
                        font-size: 12px;
                        min-width: 200px;
                        min-height: 200px;
                    }
                    img {
                        min-width: 100px;
                        min-height: 100px;
                        outline: 1px solid #000;
                    }
                </style>
            </head>
            <body>
                <img src="{{imageSource}}" />
                <script></script>
            </body>
        </html>
    `

    await qrGenerator.generate(
        htmlTemplate,
        {},
        {
            content: 'google.com'
        },
        {}
    )

}

run()