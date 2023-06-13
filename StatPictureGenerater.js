/// <reference path='SereinJSPluginHelper/index.d.ts'/>
// @ts-check

const {
    existFile,
    existDirectory,
    createDirectory,
    deleteFile,
    getFiles
} = require('./modules/stdio.js');

const {
    Drawing: {
        Imaging: {
            ImageFormat,
        },

        Drawing2D: {
            LinearGradientBrush,
            LinearGradientMode
        },

        Bitmap,
        Color,
        Font,
        FontStyle,
        Graphics,
        PointF,
        Rectangle,
        RectangleF,
        StringAlignment,
        StringFormat,
        SolidBrush,

    },
    GC
} = System;

const caches = new Map();

const PATH = {
    preLoadConfig: './plugins/StatPictureGenerater/PreLoadConfig.json',
    caches: './plugins/StatPictureGenerater/cache'
}

const baseConfig = {
    width: 1200,
    height: 1600,
    deg: -1,
    linear: [
        [
            {
                r: 255,
                g: 110,
                b: 127
            },
            {
                r: 191,
                g: 233,
                b: 255
            }
        ]
    ],
    padding: 30
}

let config = baseConfig;

/**
 * 检查预加载配置
 */
function checkPreLoadConfig() {
    if (!existFile(PATH.preLoadConfig)) {
        createDirectory(PATH.caches);
        serein.setPreLoadConfig(['System.Drawing']);
        throw new Error('请重新加载此插件');
    }
}

function generate() {
    if (!existDirectory(PATH.caches))
        createDirectory(PATH.caches);

    if (Array.from(caches.keys()).length > 100)
        clearCaches();

    const fileId = Math.floor((Math.random() * 256 * 256 * 256 * 256)).toString(16);
    const file = `${PATH.caches}/${fileId}.png`;
    const bitmap = new Bitmap(config.width, config.height);
    const graphics = Graphics.FromImage(bitmap);

    // 渐变背景

    if (config.linear && config.linear.length && config.linear.length > 0) {
        const rect = new Rectangle(0, 0, config.width, config.height);
        const linearGradientBrush = new LinearGradientBrush(
            rect,
            Color.FromArgb(
                config.linear[0][0].r,
                config.linear[0][0].g,
                config.linear[0][0].b
            ),
            Color.FromArgb(
                config.linear[0][1].r,
                config.linear[0][1].g,
                config.linear[0][1].b
            ),
            LinearGradientMode.Vertical
            // Math.floor(Math.random() * 360) // 渐变旋转角
        )

        // https://learn.microsoft.com/zh-cn/dotnet/api/system.drawing.graphics.fillrectangle?view=dotnet-plat-ext-7.0
        graphics.FillRectangle(linearGradientBrush, rect);

        graphics.FillRectangle(
            new SolidBrush(Color.FromArgb(80, 255, 255, 255)),
            new Rectangle(
                config.padding,
                config.padding,
                config.width - 2 * config.padding,
                config.height - 2 * config.padding,
            ));
    }
    const format = new StringFormat();
    format.Alignment = StringAlignment.Center;

    // 写字
    // https://learn.microsoft.com/zh-cn/dotnet/api/system.drawing.graphics.drawstring?view=dotnet-plat-ext-7.0
    graphics.DrawString(
        'Serein·测试',
        new Font('仿宋', 60, FontStyle.Bold),
        new SolidBrush(Color.White),
        new RectangleF(20, 40, config.width - 40, config.height - 60),
        format
    );

    bitmap.Save(file, ImageFormat.Png);
    bitmap.Dispose();

    // 设置缓存
    caches.set(file, Date.now());

    // 清理内存
    GC.Collect();
}

/**
 * 清除缓存
 */
function clearCaches() {
    caches.forEach((value, key) => {
        if (Number.isInteger(value) &&
            Date.now() - value > 5000 &&
            existFile(key)) {
            deleteFile(key);
            caches.delete(key);
        }
    })
}

/**
 * 强制清除所有缓存
 */
function clearAllCache() {
    for (const file of getFiles(PATH.caches, '*.png'))
        deleteFile(file);
}

serein.registerPlugin('状态图片生成', 'v1.0', 'Zaiton', '');
checkPreLoadConfig();
clearAllCache();

generate();
GC.Collect();

setInterval(clearCaches, 100_000);
serein.setListener('onPluginsReload', clearAllCache);