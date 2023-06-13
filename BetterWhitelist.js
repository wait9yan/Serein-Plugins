/*!
 * @Author       : Maraudern
 * @Date         : 2023-01-16 20:19:47
 * @LastEditors  : 9Yan
 * @LastEditTime : 2023-05-26 00:02:21
 * @FilePath     : \Serein-Plugins\BetterWhitelist.js
 * @Description  : 更好的白名单
 */
/// <reference path="CommandHelper.d.ts"/>
/// <reference path="SereinJSPluginHelper/index.d.ts"/>
/// @ts-check

"use strict";

const FILE = importNamespace("System.IO").File;
const DIRECTORY = importNamespace("System.IO").Directory;
const ENCODING = importNamespace("System.Text").Encoding;

let whitelistPath, hasWhitelist, whitelist, config, members;
let noWhitelist = [];
let membersPath = "data/members.json";
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
let geyserIDRegex = "^BE_";
if (config.gameID.allowUnderscore) {
	gameIDRegex += "_";
	gameIDTips += "\\下划线";
}
if (config.gameID.allowSpace) {
	gameIDRegex += " ";
	gameIDTips += "\\空格";
}
geyserIDRegex += `.{11,${config.gameID.maxLength - 3}}$`
gameIDRegex += `]{${config.gameID.minLength},${config.gameID.maxLength}}$`;
gameIDTips += `组成\n- 长度 ${config.gameID.minLength} 到 ${config.gameID.maxLength} 个字符`;

const IS_GEYSER_BE_ID = /^BE_(.*?)$/;
const IS_GEYSER_ID = /^.{14,16}$/;
const IS_GAME_ID = new RegExp(gameIDRegex);
const IS_PATH = /([^<>/\\\|:""\*\?]+)\.\w+$/;
const IS_QQ_NUMBER = /^[0-9]{5,11}$/;
const IS_CQ_AT = /^\[CQ:at,qq=(\d+)\]$/;

for (let file of config.whitelist.path) {
	whitelistPath = serein.getSettingsObject().server.path.replace(IS_PATH, file);
	if (FILE.Exists(whitelistPath)) {
		hasWhitelist = true;
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
			allowUnderscore: true,
			allowSpace: true,
			minLength: 3,
			maxLength: 16,
		},
		whitelist: {
			enable: true,
			autoSync: true,
			path: [
				"whitelist.json",
				"allowlist.json"
			]
		},
		betterMembers: {
			enable: false,
			isGeyser: true,
			interServerList: [
				"^.*?Player Spawned: (.*?) xuid:.*$",
				"^.*?Player connected: (.*?), xuid:.*$",
				"^.*\\(登录为: (.*?)\\) 已连接到 Java 服务器.*$",
				"^.*?INFO]: (.*?) joined the game.*$"
			],
			interServerReplyList: [
				"^.*?Kicked (.*?) .*You do not have a whitelist!.*$",
				"^.*?Spigot] (.*?) 因为 You do not have a whitelist!.*$",
				"^.*?INFO]: (.*?) lost connection: You do not have a whitelist!.*$",
				"^.*?INFO]: (.*?) left the game.*$",
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
	members = JSON.parse(FILE.ReadAllText(membersPath, ENCODING.UTF8));
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
	if (config.whitelist.enable && config.whitelist.autoSync) {
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
	const kickCommand = gameID.includes(' ') ? `kick "${gameID}" You do not have a whitelist!` : `kick ${gameID} You do not have a whitelist!`;

	serein.sendCmd(whitelistCommand);
	serein.sendCmd(kickCommand);

	if (IS_GEYSER_ID.test(gameID)) {
		gameID = gameID.slice(0, 13);
		const kickCommand = gameID.includes(' ') ? `kick "${gameID}" You do not have a whitelist!` : `kick ${gameID} You do not have a whitelist!`;
		serein.sendCmd(kickCommand);
	}

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
 * @description: 同步serein成员管理数据至服务器白名单
 * @param {Number} groupID QQ群号
 * @return {void}
 */
function syncMemberToWhitelist(groupID) {
	if (!hasWhitelist) {
		sendGroup(groupID, "未找到白名单文件！");
		return;
	} else {
		sendGroup(groupID, "正在同步绑定数据至白名单...");
	}

	let whitelistAddList = [];
	let whitelistRemoveList = [];

	members = JSON.parse(FILE.ReadAllText(membersPath, ENCODING.UTF8));
	whitelist = JSON.parse(FILE.ReadAllText(whitelistPath, ENCODING.UTF8));

	setTimeout(() => {
		let oldWhitelist = whitelist.map((item) => item.name);
		let newMembers = members.data.filter((item) => !oldWhitelist.includes(item.gameID));
		newMembers.forEach((item) => {
			whitelistAddList.push(item.gameID);
			let whitelistCommand = item.gameID.includes(' ') ? `whitelist add "${item.gameID}"` : `whitelist add ${item.gameID}`;
			serein.sendCmd(whitelistCommand);
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
				let whitelistCommand = item.gameID.includes(' ') ? `whitelist remove "${item.gameID}"` : `whitelist remove ${item.gameID}`;
				serein.sendCmd(whitelistCommand);
			}
		});

		if (whitelistRemoveList.length) {
			let removeListStr = whitelistRemoveList.join("\n");
			sendGroup(groupID, `删除白名单：\n${removeListStr}`);
		}

		if (!whitelistAddList.length && !whitelistRemoveList.length) {
			sendGroup(groupID, "没有需要同步的绑定数据");
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
			sendGroup(groupID, `关键词<${key}>后需要添加空格！`);
			return;
		}
	}

	if (config.command.bind.keywords.includes(keyword)) {
		if (!hasPermission(userID) && !config.hasBind) {
			sendGroup(groupID, `绑定失败！\n您没有使用<${keyword}>的权限！`);
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
			sendGroup(groupID, `绑定添加失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		if (!command.length) {
			sendGroup(groupID, `绑定添加失败！语法错误\n应当为：<${keyword}> <QQ号(@成员)> <gameID>`);
			return;
		}

		if (!IS_QQ_NUMBER.test(command[0].replace(IS_CQ_AT, "$1"))) {
			sendGroup(groupID, `绑定添加失败！\n错误的：>>${command[0].replace(IS_CQ_AT, "$1")}<<\n应当为：<QQ号(@成员)>`);
			return;
		}

		let qqID = Number(command[0].replace(IS_CQ_AT, "$1"));
		command.splice(0, 1);

		let text = command.join(" ");
		if (config.gameID.check && !IS_GAME_ID.test(text)) {
			sendGroup(groupID, `绑定添加失败！\n错误的：>>${text}<<\n应当为：<gameID>\n${gameIDTips}`);
			return;
		}

		let index = isMember(text);
		if (index + 1) {
			sendGroup(groupID, `绑定添加失败！已存在相同ID\n${text}（${members.data[index].id}）`);
			return;
		}

		let gameID = serein.getGameID(qqID);
		if (gameID) {
			whitelistRemove(qqID, gameID);
			if (bindAdd(groupID, qqID, text)) {
				sendGroup(groupID, `已存在数据：\n${gameID}(${qqID})\n成功修改为：\n${text}(${qqID})`);
			} else {
				sendGroup(groupID, `绑定添加失败！\n（可联系插件作者反馈问题）`);
			}
			return;
		}

		if (bindAdd(groupID, qqID, text)) {
			sendGroup(groupID, `绑定添加成功：\n${text}（${qqID}）`);
		} else {
			sendGroup(groupID, "绑定添加失败！\n（可联系插件作者反馈问题）");
		}
		return;
	}

	if (config.command.removeBind.keywords.includes(keyword)) {
		if (!hasPermission(userID)) {
			sendGroup(groupID, `绑定删除失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		if (!command.length) {
			sendGroup(groupID, `绑定删除失败！\n语法错误，请发送：\n<${keyword}> <QQ号(@成员)>`);
			return;
		}

		if (!IS_QQ_NUMBER.test(command[0].replace(IS_CQ_AT, "$1"))) {
			sendGroup(groupID, `绑定删除失败！\n错误的：>>${command[0].replace(IS_CQ_AT, "$1")}<<\n应当为：<QQ号(@成员)>`);
			return;
		}

		let qqID = Number(command[0].replace(IS_CQ_AT, "$1"));
		let gameID = serein.getGameID(qqID);

		if (!gameID) {
			sendGroup(groupID, "绑定删除失败！\n该成员还未绑定ID");
			return;
		}

		if (whitelistRemove(qqID, gameID)) {
			sendGroup(groupID, `绑定删除成功：\n${gameID}（${qqID}）`);
		} else {
			sendGroup(groupID, "绑定删除失败！\n（可联系插件作者反馈问题）");
		}
		return;
	}

	if (config.command.syncWhitelist.keywords.includes(keyword)) {
		if (!hasPermission(userID)) {
			sendGroup(groupID, `白名单同步失败！\n您没有使用<${keyword}>的权限！`);
			return;
		}

		if (!config.whitelist.enable) {
			sendGroup(groupID, `白名单同步失败！\n已关闭服务器白名单！`);
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

		members = JSON.parse(FILE.ReadAllText(membersPath, ENCODING.UTF8));
		if (config.whitelist.enable && hasWhitelist) {
			whitelist = JSON.parse(FILE.ReadAllText(whitelistPath, ENCODING.UTF8));
		}

		let newArray = members.data.map((member, index) => {
			let content = `成员管理数据：\n${member.gameID}(${member.id})`;
			if (config.whitelist.enable && hasWhitelist) {
				let isCorrect = whitelist.some(item => item.name === member.gameID) ? "✔️" : "❌";
				content += `\n服务器白名单：${isCorrect}`;
			}
			let isName = member.card || member.nickname || member.id;
			return {
				type: "node",
				data: {
					name: `『${index}』${isName}`,
					uin: member.id,
					content: content,
				},
			};
		});

		let Array = newArray;

		if (config.sendGroup) {
			const chunkSize = 100;

			while (Array.length > chunkSize) {
				const chunk = Array.splice(0, chunkSize);
				serein.sendPacket(JSON.stringify({
					action: "send_group_forward_msg",
					params: {
						group_id: groupID,
						messages: chunk,
					},
				}));
			}

			serein.sendPacket(JSON.stringify({
				action: "send_group_forward_msg",
				params: {
					group_id: groupID,
					messages: Array,
				},
			}));
		}
		return;
	}
});

serein.setListener("onServerStart", () => {
	if (!config.whitelist.enable || !config.whitelist.autoSync) return;

	const groupList = serein.getSettingsObject().bot.groupList;
	const validGroups = groupList.filter(group => !isIgnoreGroup(group));

	for (const groupID of validGroups) {
		syncMemberToWhitelist(groupID);
		break;
	}
});

serein.setListener("onGroupDecrease", (groupID, userID) => {
	if (!config.exitGroup || !isGroup(groupID) || isIgnoreGroup(groupID)) return;

	sendGroup(groupID, `${userID} 退群了，尝试删除白名单`);

	const gameID = serein.getGameID(userID);
	if (!gameID) {
		sendGroup(groupID, `${userID} 未绑定白名单！`);
		return;
	}

	if (whitelistRemove(userID, gameID)) {
		setTimeout(() => {
			sendGroup(groupID, `白名单删除成功：\n${gameID}（${userID}）`);
		}, 100);
	} else {
		sendGroup(groupID, `白名单删除失败！\n（可联系插件作者反馈问题）`);
	}

});

serein.setListener("onServerOutput", (msg) => {
	if (!config.betterMembers.enable) return;

	for (const regex of config.betterMembers.interServerReplyList) {
		const interServerReply = new RegExp(regex);
		if (interServerReply.test(msg)) {
			let gameIDReply = msg.replace(interServerReply, "$1");
			noWhitelist = noWhitelist.filter(item => item !== gameIDReply && item !== gameIDReply.replace(/\s/g, "_"));
		}
	}

	let gameID;

	for (const regex of config.betterMembers.interServerList) {
		const interServer = new RegExp(regex);
		if (interServer.test(msg)) {
			gameID = msg.replace(interServer, "$1");
			break;
		}
	}

	if (!gameID) return;

	members = JSON.parse(FILE.ReadAllText(membersPath, ENCODING.UTF8));

	if (members.data.some(member => member.gameID === gameID)) {
		return;
	}

	if (IS_GEYSER_BE_ID.test(gameID)) {
		let geyserID = gameID.slice(3);
		if (members.data.some(member => member.gameID.slice(0, 13) === geyserID)) {
			return;
		}
	}

	if (!noWhitelist.includes(gameID)) {
		noWhitelist.push(gameID);

		const groupList = serein.getSettingsObject().bot.groupList;
		const groupID = groupList.find(groupID => !isIgnoreGroup(groupID));

		setTimeout(() => {
			serein.sendGroup(groupID, `${gameID} 没有白名单！`);
		}, 500);
	}
});

setInterval(() => {
	for (let gameID of noWhitelist) {
		const kickCommand = gameID.includes(' ') ? `kick "${gameID}" You do not have a whitelist!` : `kick ${gameID} You do not have a whitelist!`;
		serein.sendCmd(kickCommand);
	}
}, 1000);
