/// <reference path='SereinJSPluginHelper/index.d.ts'/>
/// @ts-check

serein.registerPlugin('聊天增强', 'v1.3', 'Zaitonn', '对群聊消息互通提供更多增强功能');

let config = {
    disableColorSymbol: true,
    enableGameID: true,
    /** @type {number[]} */
    ignore: [],
    prefix: '',
    template: '§b[{{time}}]§r{{name}}:{{msg}}',
    cqCode: {
        '[CQ:face]': '[表情]',
        '[CQ:reply]': '[回复]',
        '[CQ:image]': '[图片]',
        '[CQ:video]': '[视频]',
        '[CQ:record]': '[语音]',
        '[CQ:music]': '[音乐]',
        '[CQ:redbag]': '[红包]',
        '[CQ:forward]': '[合并转发消息]',
        '[CQ:node]': '[合并转发消息]',
        '[CQ:xml]': '[XML卡片]',
        '[CQ:json]': '[JSON卡片]',
    },
    NOTICE: '更多信息请访问 https://market.serein.cc/resources/CHATEX'
};

// @ts-ignore
const File = System.IO.File;
const Directory = System.IO.Directory;
const logger = new Logger('CHATEX');
let shouldForward = false;

const configText = read('plugins/CHATEX', 'config.json', JSON.stringify(config, null, 2));
if (configText)
    config = JSON.parse(configText);
else
    throw new Error('配置文件已生成，请重新加载');

setInterval(check, 2000);
serein.setListener('onReceiveGroupMessage', handle);
logger.info('加载完毕！更多信息请访问 https://market.serein.cc/resources/CHATEX');

/**
 * 处理消息
 * @param {number} groupid 群号
 * @param {number} userid 用户ID
 * @param {string} msg 消息
 * @param {string} shown_name 显示名称
 */
function handle(groupid, userid, msg, shown_name) {
    if (!serein.getSettingsObject().Bot.GroupList.includes(groupid) || // 监听的群聊
        config.prefix && !msg.startsWith(config.prefix) || // 检验触发前缀
        !shouldForward || // 检验服务器状态
        (config.ignore || []).includes(userid) // 检验排除对象
    )
        return;

    const text = parseAt(fitter(msg), shown_name);
    logger.info(`${shown_name}:${text}`);

    switch (serein.getSettingsObject().Server.Type) {
        case 1:
            serein.sendCmd('tellraw @a ' +
                JSON.stringify({
                    rawtext: [
                        {
                            text: getOutputText(text, shown_name, userid)
                        }
                    ]
                }));
            break;
        case 2:
            serein.sendCmd('tellraw @a ' +
                JSON.stringify({
                    rawtext: {
                        text: getOutputText(text, shown_name, userid)
                    }
                }));
            break;

        default:
            throw new Error('你需要在<设置-服务器-服务器类型>指定你所使用的服务器类型');
    }
}

/**
 * 检查服务器状态
 */
function check() {
    if (serein.getServerStatus()) {
        const motd = serein.getServerMotd();
        if (motd?.isSuccessful)
            shouldForward = motd.onlinePlayer != 0;
        else
            logger.warn('服务器正在运行中，但是Motd获取失败。\n请检查“设置-服务器-服务器类型”和“设置-服务器-端口”是否设置正确');
    }
}

/**
 * 去除不必要的CQ字符
 * @param {string} text 文本
 * @returns 过滤后的文本
 */
function fitter(text) {
    if (text.indexOf('CQ') < 0)
        return text;
    else
        return text
            .replace(/\[CQ:at,qq=all\]/g, '@全体成员')
            .replace(/\[CQ:at,.+?name=([^,]+?).+?\]/g, '@$1')
            .replace(/\[CQ:at,qq=(\d+)\]/g, '@$1')
            .replace(/\[CQ:([^,]+?),.+?\]/g, '[CQ:$1]')
            .replace(/\[CQ:\w+\]/g, (j) => config.cqCode[j] || '[不支持预览的内容]');
}

/**
 * 转义At
 * @param {string} text 
 * @param {string} shown_name
 * @returns 转义后文本
 */
function parseAt(text, shown_name) {
    if (!/@\d+/.test(text))
        return text;

    const match = text.match(/(?<=@)\d+/g) || [];
    for (let i = 0; i < match.length; i++) {

        const gameid = serein.getGameID(Number(match[i]));

        if (config.enableGameID && gameid)
            text = text.replace(`@${match[i]}`, `@${gameid}`);

        else if (shown_name)
            text = text.replace(`@${match[i]}`, `@${shown_name}`);
    }
    return text;
}

/**
 * 获取输出文本
 * @param {string} msg 
 * @param {string} shown_name
 * @param {number} user_id
 * @returns 处理后文本
 */
function getOutputText(msg, shown_name, user_id) {
    return (config.template || '[Group]<{{name}}> {{msg}}')
        .replace('{{time}}', new Date().toLocaleTimeString())
        .replace('{{name}}', fitterColorSymbol(config.enableGameID && serein.getGameID(user_id) || shown_name))
        .replace('{{id}}', user_id.toString())
        .replace('{{msg}}', fitterColorSymbol(msg));
}

/**
 * 过滤颜色符号
 * @param {string} text 
 * @returns 过滤文本
 */
function fitterColorSymbol(text) {
    if (config.disableColorSymbol)
        return text.replace(/\u00a7./, '');
    return text;
}

/**
 * 读取文件
 * @param {string} directory 目录
 * @param {string} file 文件名
 * @param {string?} _default 默认值
 * @returns 读取内容
 */
function read(directory, file, _default) {
    if (!Directory.Exists(directory))
        Directory.CreateDirectory(directory);

    // @ts-expect-error
    if (!File.Exists(directory + '/' + file) && _default)
        // @ts-expect-error
        File.WriteAllText(directory + '/' + file, _default);

    else
        // @ts-expect-error
        return File.ReadAllText(directory + '/' + file);

    return undefined;
}
