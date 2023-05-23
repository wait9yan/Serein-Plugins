/// <reference path="SereinJSPluginHelper/index.d.ts"/>
/// <reference path="CommandHelper.d.ts"/>
/// @ts-check

'use strict';

const commands = [];
const prefix = '';
const logger = new Logger('CommandHelper');

serein.registerPlugin('命令助手', 'v1.0', 'Zaitonn', '提供快捷的命令注册功能');
serein.export('CHregCommand', regCommand);
serein.setListener('onReceivePacket', handleMsg);
regCommand({
  name: '帮助',
  keywords: ['help', '帮助'],
  callback: getHelpText,
  needAdmin: false,
  description: ['显示所有命令及其介绍', '用法：发送 “帮助” | “help”'],
  author: '内置',
  version: 'v1.0'
});

/**
 * 注册命令
 * @param {CommandConfig} config 配置
 */
function regCommand({ name, keywords, callback, needAdmin, description, excludedGroups, permissionList, author, version }) {
  if (!name || typeof (name) !== 'string')
    logger.error('`name`错误');

  else if (typeof (keywords) !== 'object')
    logger.error(name + '的`keywords`类型错误');

  else if (typeof (callback) !== 'function')
    logger.error(name + '的`callback`类型错误');

  else {

    needAdmin ||= false;
    description ||= [];
    excludedGroups ||= [];
    permissionList ||= [];
    author ||= '佚名';
    version ||= '未知版本';
    commands.push({
      name,
      keywords,
      callback,
      needAdmin,
      description,
      permissionList,
      excludedGroups
    });
    logger.info(
      `命令[${name}(${version})]注册成功. 
  · 作者: ${author}
  · 介绍
    ${description?.join('\n    ')}
  · 需要管理员权限: ${needAdmin ? '是' : '否'}
  · 权限列表: ${permissionList.join(',') || '空'}
  · 排除的群聊: ${excludedGroups.join(',') || '空'}    
`    );
    return true;
  }
  logger.warn(`命令[${name}]注册失败.`);
  return false;
}

/**
 * 获取帮助信息
 */
function getHelpText() {
  let text = '';
  commands.forEach((command) => {
    text +=
      `◉ ${command.name}
  · 介绍
    ${command.description?.join('\n    ')}
  · 需要管理员权限: ${command.needAdmin ? '是' : '否'}\n`;
  });
  return text;
}

/**
 * 处理消息
 * @param {string} packet 数据包
 */
function handleMsg(packet) {
  const packetBody = JSON.parse(packet);

  const {
    post_type,
    message_type,
    group_id,
    message,
    sender,
  } = packetBody;

  if (post_type != 'message' || message_type != 'group')
    return;

  if (!sender)
    throw new Error('数据包[发送者]为空');

  const { user_id } = sender;

  if (!serein.getSettingsObject().Bot.GroupList.includes(group_id) ||
    !message ||
    (prefix && !message.startsWith(prefix)))
    return;

  const isAdmin = hasPermission(user_id);
  const keyword = message.replace(new RegExp(`^${prefix}`), '').trim().split(' ')[0];

  for (const /** @type {CommandConfig} */ commandConfig of commands) {
    if (
      commandConfig.needAdmin && !isAdmin && !commandConfig?.excludedGroups.includes(group_id) ||
      commandConfig.permissionList.includes(user_id) ||
      !commandConfig.keywords.includes(keyword))
      continue;

    try {
      const reply = commandConfig.callback(packetBody);
      if (reply)
        serein.sendGroup(group_id, reply);
    }
    catch (e) {
      serein.sendGroup(group_id, `插件[${commandConfig.name}]异常，请到控制台查看`);
      logger.error(`触发插件[${commandConfig.name}]时异常：\n${e}`);
    }
  }
};

/**
 * 是否有权限
 * @param {number} userID 
 */
function hasPermission(userID) {
  return serein.getSettingsObject().Bot.PermissionList.includes(userID) >= 0;
}
