/*!
 * @Author       : Maraudern
 * @Date         : 2023-01-16 20:19:47
 * @LastEditors  : 9Yan
 * @LastEditTime : 2023-05-23 11:52:19
 * @FilePath     : \Serein-Plugins\Serein\plugins\BetterWhitelist.js
 * @Description  : 更好的白名单
 */
/// <reference path="CommandHelper.d.ts"/>
/// <reference path="SereinJSPluginHelper/index.d.ts"/>
/// @ts-check

"use strict";

const FILE = importNamespace("System.IO").File;
const DIRECTORY = importNamespace("System.IO").Directory;
const ENCODING = importNamespace("System.Text").Encoding;

const MEMBERS_PATH = "data/members.json";

let whitelistPath, whitelist, config, members;
let logger = new Logger("betterWhitelist");
let betterWhitelist = {
	name: "更好的白名单",
	version: "v1.9",
	author: "9Yan",
	description: "更完善的白名单管理方案，基于Serein成员管理，需禁用白名单相关正则",
	configPath: "plugins/BetterWhitelist",
	config: "plugins/BetterWhitelist/config.json",
};
serein.registerPlugin(betterWhitelist.name, betterWhitelist.version, betterWhitelist.author, betterWhitelist.description);

if (!DIRECTORY.Exists(betterWhitelist.configPath)) {
	DIRECTORY.CreateDirectory(betterWhitelist.configPath);
}

if (!FILE.Exists(betterWhitelist.config)) {
	init();
	logger.info("配置初始化成功");
} else {
	config = JSON.parse(FILE.ReadAllText(betterWhitelist.config));
	logger.info("配置加载成功");
}

if (config.version != betterWhitelist.version) {
	init();
	logger.info("已更新，请重新配置插件");
}

let gameIDRegex = "^[0-9A-Za-z";
let gameIDTips = "- 数字\\字母";
if (config.gameID.allowUnderscore) {
	gameIDRegex += "_";
	gameIDTips += "\\下划线";
}
if (config.gameID.allowSpace) {
	gameIDRegex += " ";
	gameIDTips += "\\空格";
}
gameIDRegex += `]{${config.gameID.minLength},${config.gameID.maxLength}}$`;
gameIDTips += `组成\n- 长度 ${config.gameID.minLength} 到 ${config.gameID.maxLength} 个字符`;

const IS_GAME_ID = new RegExp(gameIDRegex);
const IS_PATH = /([^<>/\\\|:""\*\?]+)\.\w+$/;
const IS_QQ_NUMBER = /^[0-9]{5,11}$/;
const IS_CQ_AT = /^\[CQ:at,qq=(\d+)\]$/;

for (let file of config.whitelist.path) {
	whitelistPath = serein.getSettingsObject().server.path.replace(IS_PATH, file);
	if (FILE.Exists(whitelistPath)) {
		break;
	}
}

function init() {
	config = {
		NOTICE: "如何配置请查阅文档 https://market.serein.cc/resources/BetterWhitelist#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6",
		version: betterWhitelist.version,
		ignoreGroup: [],
		exitGroup: true,
		editCard: true,
		sendGroup: true,
		hasBind: true,
		gameID: {
			check: true,
			minLength: 3,
			maxLength: 16,
			allowUnderscore: true,
			allowSpace: true,
		},
		whitelist: {
			autoSync: true,
			path: [
				"whitelist.json",
				"allowlist.json"
			]
		},
		betterMembers: {
			enable: false,
			interServer: [
				"^.*?Player Spawned: (.*?) xuid:.*$",
				"^.*?Player connected: (.*?), xuid:.*$",
				"^.*?UUID of player BE_(.*?) is.*$",
				"^.*?UUID of player (.*?) is.*$",
				"^.*?INFO]: (.*?)[(.*?)] logged in",
				"^.*?INFO]: (.*?) joined the game.*$"
			],
			interServerReply: [
				"^.*?Kicked (.*?) .*You do not have a whitelist!.*$",
				"^.*?操作员Console踢出了BE_(.*?)，时长：.*$",
				"^.*?操作员Console踢出了(.*?)，时长：.*$",
				"^.*?Spigot] (.*?) 因为 You do not have a whitelist!.*$",
				"^.*?INFO]: (.*?) lost connection: You do not have a whitelist!.*$",
				"^.*?INFO]: (.*?) left the game.*$"
			]
		},
		command: {
			bind: {
				name: "绑定",
				keywords: ["绑定", "bind"],
			},
			unbind: {
				name: "解绑",
				keywords: ["解绑", "unbind"],
			},
			addBind: {
				name: "添加绑定",
				keywords: ["添加绑定", "addbind"],
			},
			removeBind: {
				name: "删除绑定",
				keywords: ["删除绑定", "rmbind"],
			},
			syncWhitelist: {
				name: "同步白名单",
				keywords: ["同步白名单", "syncwhitelist", "syncwl"],
			},
			whitelist: {
				name: "白名单列表",
				keywords: ["白名单列表", "whitelist", "wl"],
			},
		},
	};
	FILE.WriteAllText(betterWhitelist.config, JSON.stringify(config, null, 4));
}

/**
 * @description: 检查指定的QQ号是否在serein管理权限列表中
 * @param {Number} userID QQ号
 * @return {Boolean} 存在返回true，否则返回false
 */
function hasPermission(userID) {
	const permissionList = serein.getSettingsObject().bot.permissionList;
	return permissionList.includes(userID);
}

/**
 * @description: 检查指定的QQ群号是否在serein监听群列表中
 * @param {Number} groupID QQ群号
 * @return {Boolean} 存在返回true，否则返回false
 */
function isGroup(groupID) {
	const groupList = serein.getSettingsObject().bot.groupList;
	return groupList.includes(groupID);
}

/**
 * @description: 在serein成员管理列表中检查游戏ID是否存在
 * @param {String} gameID 游戏ID
 * @return {Number} 存在则返回数组下标，否则返回-1
 */
function isMember(gameID) {
	members = JSON.parse(FILE.ReadAllText(MEMBERS_PATH, ENCODING.UTF8));
	let data = -1;
	members.data.some((item, index) => {
		if (gameID === item.gameID) {
			data = index;
			return true;
		}
	});
	return data;
}

/**
 * @description: 检查指定的QQ群号是否在betterWhitelist排除监听群列表中
 * @param {Number} groupID QQ群号
 * @return {Boolean} 存在返回true，否则返回false
 */
function isIgnoreGroup(groupID) {
	const ignoreGroupList = config.ignoreGroup;
	return ignoreGroupList.includes(groupID);
}

/**
 * @description: 添加绑定
 * @param {Number} groupID QQ群号
 * @param {Number} userID QQ号
 * @param {String} gameID 游戏ID
 * @return {Boolean} 成功为true，否则为false
 */
function bindAdd(groupID, userID, gameID) {
	if (config.autoSyncWhitelist) {
		const whitelistCommand = gameID.includes(' ') ? `whitelist add "${gameID}"` : `whitelist add ${gameID}`;
		serein.sendCmd(whitelistCommand);
	}

	if (!config.editCard) {
		return serein.bindMember(userID, gameID);
	} else {
		const setCardPacket = JSON.stringify({
			action: "set_group_card",
			params: {
				group_id: groupID,
				user_id: userID,
				card: gameID,
			},
		});
		serein.sendPacket(setCardPacket);
		return serein.bindMember(userID, gameID);
	}
}

/**
 * @description: 删除白名单
 * @param {Number} userID QQ号
 * @param {String} gameID 游戏ID
 * @return {Boolean} 成功为true，否则为false
 */
function whitelistRemove(userID, gameID) {
	const whitelistCommand = gameID.includes(' ') ? `whitelist remove "${gameID}"` : `whitelist remove ${gameID}`;
	const kickCommand = `kick ${gameID} You do not have a whitelist!`;

	serein.sendCmd(whitelistCommand);
	serein.sendCmd(kickCommand);

	return serein.unbindMember(userID);
}

/**
 * @description: 发送群聊消息
 * @param {Number} groupID QQ群号
 * @param {String} msg 消息内容
 * @return {Boolean} 成功为true，否则为false
 */
function sendGroup(groupID, msg) {
	if (!config.sendGroup) return false;

	return serein.sendGroup(groupID, msg);
}

/**
 * @description: 同步serein成员管理至服务器白名单
 * @param {Number} groupID QQ群号
 * @return {void}
 */
function syncMemberToWhitelist(groupID) {
	sendGroup(groupID, "正在同步绑定数据至白名单...");

	let whitelistAddList = [];
	let whitelistRemoveList = [];

	whitelist = JSON.parse(FILE.ReadAllText(whitelistPath, ENCODING.UTF8));
	members = JSON.parse(FILE.ReadAllText(MEMBERS_PATH, ENCODING.UTF8));

	setTimeout(() => {
		let oldWhitelist = whitelist.map((item) => item.name);
		let newMembers = members.data.filter((item) => !oldWhitelist.includes(item.gameID));
		newMembers.forEach((item) => {
			whitelistAddList.push(item.gameID);
			let whitelistAddCmd = item.gameID.includes(' ') ? `whitelist add "${item.gameID}"` : `whitelist add ${item.gameID}`;
			serein.sendCmd(whitelistAddCmd);
		});

		if (whitelistAddList.length) {
			let addListStr = whitelistAddList.join("\n");
			sendGroup(groupID, `添加白名单：\n${addListStr}`);
		}

		let oldMembers = members.data.map((item) => item.gameID);
		let newWhitelist = whitelist.filter((item) => !oldMembers.includes(item.name));
		newWhitelist.forEach((item) => {
			if (item.gameID) {
				whitelistRemoveList.push(item.name);
				let whitelistRemoveCmd = item.gameID.includes(' ') ? `whitelist remove "${item.gameID}"` : `whitelist remove ${item.gameID}`;
				serein.sendCmd(whitelistRemoveCmd);
			}
		});

		if (whitelistRemoveList.length) {
			let removeListStr = whitelistRemoveList.join("\n");
			sendGroup(groupID, `删除白名单：\n${removeListStr}`);
		}

		if (!whitelistAddList.length && !whitelistRemoveList.length) {
			sendGroup(groupID, "没有需要同步的白名单");
		}
	}, 100);
	return;
}

serein.setListener("onReceiveGroupMessage", (groupID, userID, msg, shownName) => {
	if (!isGroup(groupID) || isIgnoreGroup(groupID)) return;

	let command = msg.split(" ").filter((item) => item && item.trim());
	let keyword = command[0].toLowerCase();
	command.splice(0, 1);

	let keywords = [];
	for (let key in config.command) {
		if (config.command.hasOwnProperty(key)) {
			keywords = keywords.concat(config.command[key].keywords);
		}
	}

	for (let key of keywords) {
		if (keyword.startsWith(key) && keyword !== key) {
			sendGroup(groupID, `关键词${key}后需要添加空格！`);
			return;
		}
	}

	if (config.command.bind.keywords.includes(keyword)) {
		if (!hasPermission(userID) && !config.hasBind) {
			sendGroup(groupID, `绑定失败！\n您没有使用${keyword}的权限！`);
			return;
		}

		if (!command.length) {
			sendGroup(groupID, `绑定失败！语法错误\n应当为：<${keyword}> <gameID>`);
			return;
		}

		let text = command.join(" ");
		if (config.gameID.check && !IS_GAME_ID.test(text)) {
			sendGroup(groupID, `绑定失败！\n错误的：>>${text}<<\n应当为：<gameID>\n${gameIDTips}`);
			return;
		}

		let index = isMember(text);
		if (index !== -1) {
			sendGroup(groupID, `绑定失败！已存在相同ID\n${text}（${members.data[index].id}）`);
			return;
		}

		let gameID = serein.getGameID(userID);
		if (gameID) {
			whitelistRemove(userID, gameID);
			if (bindAdd(groupID, userID, text)) {
				sendGroup(groupID, `已存在数据：\n${gameID}(${userID})\n成功修改为：\n${text}(${userID})`);
			} else {
				sendGroup(groupID, `绑定失败！\n（可联系插件作者反馈问题）`);
			}
			return;
		}

		if (bindAdd(groupID, userID, text)) {
			sendGroup(groupID, `绑定成功：\n${text}（${userID}）`);
		} else {
			sendGroup(groupID, `绑定失败！\n（可联系插件作者反馈问题）`);
		}
		return;
	}

	if (config.command.unbind.keywords.includes(keyword)) {
		if (!hasPermission(userID) && !config.hasBind) {
			sendGroup(groupID, `解绑失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		let gameID = serein.getGameID(userID);
		if (!gameID) {
			sendGroup(groupID, "解绑失败！\n您还未绑定ID");
			return;
		}

		if (whitelistRemove(userID, gameID)) {
			sendGroup(groupID, `解绑成功：\n${gameID}（${userID}）`);
		} else {
			sendGroup(groupID, "解绑失败！\n（可联系插件作者反馈问题）");
		}
		return;
	}

	if (config.command.addBind.keywords.includes(keyword)) {
		if (!hasPermission(userID)) {
			sendGroup(groupID, `添加绑定失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		if (!command.length) {
			sendGroup(groupID, `添加绑定失败！语法错误\n应当为：<${keyword}> <QQ号(@成员)> <gameID>`);
			return;
		}

		if (!IS_QQ_NUMBER.test(command[0].replace(IS_CQ_AT, "$1"))) {
			sendGroup(groupID, `添加绑定失败！\n错误的：>>${command[0].replace(IS_CQ_AT, "$1")}<<\n应当为：<QQ号(@成员)>`);
			return;
		}

		let qqID = Number(command[0].replace(IS_CQ_AT, "$1"));
		command.splice(0, 1);

		let text = command.join(" ");
		if (config.gameID.check && !IS_GAME_ID.test(text)) {
			sendGroup(groupID, `添加绑定失败！\n错误的：>>${text}<<\n应当为：<gameID>\n${gameIDTips}`);
			return;
		}

		let index = isMember(text);
		if (index + 1) {
			sendGroup(groupID, `添加绑定失败！已存在相同ID\n${text}（${members.data[index].id}）`);
			return;
		}

		let gameID = serein.getGameID(qqID);
		if (gameID) {
			whitelistRemove(qqID, gameID);
			if (bindAdd(groupID, qqID, text)) {
				sendGroup(groupID, `已存在数据：\n${gameID}(${qqID})\n成功修改为：\n${text}(${qqID})`);
			} else {
				sendGroup(groupID, `添加绑定失败！\n（可联系插件作者反馈问题）`);
			}
			return;
		}

		if (bindAdd(groupID, qqID, text)) {
			sendGroup(groupID, `添加绑定成功：\n${text}（${qqID}）`);
		} else {
			sendGroup(groupID, "添加绑定失败！\n（可联系插件作者反馈问题）");
		}
		return;
	}

	if (config.command.removeBind.keywords.includes(keyword)) {
		if (!hasPermission(userID)) {
			sendGroup(groupID, `删除绑定失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		if (!command.length) {
			sendGroup(groupID, `删除绑定失败！\n语法错误，请发送：\n<${keyword}> <QQ号(@成员)>`);
			return;
		}

		if (!IS_QQ_NUMBER.test(command[0].replace(IS_CQ_AT, "$1"))) {
			sendGroup(groupID, `删除绑定失败！\n错误的：>>${command[0].replace(IS_CQ_AT, "$1")}<<\n应当为：<QQ号(@成员)>`);
			return;
		}

		let qqID = Number(command[0].replace(IS_CQ_AT, "$1"));
		let gameID = serein.getGameID(qqID);

		if (!gameID) {
			sendGroup(groupID, "删除绑定失败！\n该成员还未绑定ID");
			return;
		}

		if (whitelistRemove(qqID, gameID)) {
			sendGroup(groupID, `成功删除绑定：\n${gameID}（${qqID}）`);
		} else {
			sendGroup(groupID, "删除绑定失败！\n（可联系插件作者反馈问题）");
		}
		return;
	}

	if (config.command.syncWhitelist.keywords.includes(keyword)) {
		if (!hasPermission(userID)) {
			sendGroup(groupID, `白名单同步失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		if (!command.length) {
			syncMemberToWhitelist(groupID);
			return;
		}

		if (!IS_QQ_NUMBER.test(command[0].replace(IS_CQ_AT, "$1"))) {
			sendGroup(groupID, `白名单同步失败！\n错误的：>>${command[0].replace(IS_CQ_AT, "$1")}<<\n应当为：<QQ号(@成员)>`);
			return;
		}

		let qqID = Number(command[0].replace(IS_CQ_AT, "$1"));
		let gameID = serein.getGameID(qqID);

		if (!gameID) {
			sendGroup(groupID, "白名单同步失败！\n该成员还未绑定ID");
			return;
		}

		const whitelistCommand = gameID.includes(' ') ? `whitelist add "${gameID}"` : `whitelist add ${gameID}`;
		serein.sendCmd(whitelistCommand);

		sendGroup(groupID, `白名单同步成功：\n${gameID}（${qqID}）`);
		return;
	}

	if (config.command.whitelist.keywords.includes(keyword)) {
		if (!hasPermission(userID)) {
			sendGroup(groupID, `您没有使用<${keyword}>的权限！`);
			return;
		}

		whitelist = JSON.parse(FILE.ReadAllText(whitelistPath, ENCODING.UTF8));
		members = JSON.parse(FILE.ReadAllText(MEMBERS_PATH, ENCODING.UTF8));

		let Array = [];
		for (let i = 0; i < members.data.length; i++) {
			let isCorrect = "❗";
			for (let j = 0; j < whitelist.length; j++) {
				if (members.data[i].gameID === whitelist[j].name) {
					isCorrect = "✔";
				}
			}
			let isName = members.data[i].card ? members.data[i].card : members.data[i].nickname ? members.data[i].nickname : members.data[i].id;
			Array.push({
				type: "node",
				data: {
					name: "『" + i + "』" + isName,
					uin: members.data[i].id,
					content: "成员管理数据：\n" + members.data[i].gameID + "(" + members.data[i].id + ")\n服务器白名单：" + isCorrect,
				},
			});
		}

		if (config.sendGroup) {
			while (Array.length > 90) {
				serein.sendPacket(
					'{"action": "send_group_forward_msg","params": {"group_id": "' + groupID + '","messages": ' + JSON.stringify(Array.splice(0, 90)) + "}}"
				);
			}
			serein.sendPacket('{"action": "send_group_forward_msg","params": {"group_id": "' + groupID + '","messages": ' + JSON.stringify(Array) + "}}");
		}
		return;
	}
});

serein.setListener("onServerStart", () => {
	if (!config.autoSyncWhitelist) return;

	let groupID;
	for (let i = 0; i < serein.getSettingsObject().bot.groupList.length; i++) {
		if (!isIgnoreGroup(serein.getSettingsObject().bot.groupList[i])) {
			groupID = serein.getSettingsObject().bot.groupList[i];
			break;
		}
	}
	syncMemberToWhitelist(groupID);
});

serein.setListener("onGroupDecrease", (groupID, userID) => {
	if (!config.exitGroup || !isGroup(groupID) || isIgnoreGroup(groupID)) return;

	sendGroup(groupID, "群成员 " + userID + " 退群了，尝试删除白名单");

	let gameID = serein.getGameID(userID);
	if (!gameID) {
		sendGroup(groupID, "群成员 " + userID + " 未绑定白名单！");
		return;
	}

	if (whitelistRemove(userID, gameID)) {
		setTimeout(() => {
			sendGroup(groupID, `成功删除：${gameID}（${userID}）`);
		}, 500);
	} else {
		sendGroup(groupID, `删除白名单失败，原因未知！\n（可联系插件作者反馈问题）`);
	}
	return;
});

serein.setListener("onServerOutput", (msg) => {
	if (!config.betterMembers.enable) return;
	let gameID, gameIDReply;

	for (let i = 0; i < config.betterMembers.interServerReply.length; i++) {
		let interServerReply = new RegExp(config.betterMembers.interServerReply[i]);
		if (interServerReply.test(msg)) {
			gameIDReply = msg.replace(interServerReply, "$1");
			let index = 0;
			while (index !== -1) {
				index = notGameID.indexOf(gameIDReply);
				if (index > -1) {
					notGameID.splice(index, 1);
				}
			}
		}
	}

	for (let i = 0; i < config.betterMembers.interServer.length; i++) {
		let interServer = new RegExp(config.betterMembers.interServer[i]);
		if (interServer.test(msg)) {
			gameID = msg.replace(interServer, "$1");
			break;
		}
	}

	if (!gameID) return;

	members = JSON.parse(FILE.ReadAllText(MEMBERS_PATH, ENCODING.UTF8));
	for (let i = 0; i < members.data.length; i++) {
		if (members.data[i].gameID === gameID) return;
	}

	if (notGameID.indexOf(gameID) == -1) {
		notGameID.push(gameID);

		let groupID;
		for (let i = 0; i < serein.getSettingsObject().bot.groupList.length; i++) {
			if (!isIgnoreGroup(serein.getSettingsObject().bot.groupList[i])) {
				groupID = serein.getSettingsObject().bot.groupList[i];
				break;
			}
		}
		setTimeout(() => {
			serein.sendGroup(groupID, gameID + " 没有白名单，踢出服务器");
		}, 500);
	}
});

let notGameID = [];
setInterval(() => {
	for (let i = 0; i < notGameID.length; i++) {
		if (notGameID[i].indexOf(' ') >= 0) {
			serein.sendCmd(`kick "${notGameID[i]}" You do not have a whitelist!`);
			serein.sendCmd(`kick "BE_${notGameID[i]}" You do not have a whitelist!`);
		} else {
			serein.sendCmd(`kick ${notGameID[i]} You do not have a whitelist!`);
			serein.sendCmd(`kick BE_${notGameID[i]} You do not have a whitelist!`);
		}
	}
}, 1000);
