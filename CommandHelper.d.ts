declare type CommandConfig = {
	/**
	 * 名称
	 */
	name: string;

	/**
	 * 关键词
	 */
	keywords: string[];

	/**
	 * 回调函数
	 * @param event 接收事件
	 */
	callback: (packet: Packet) => string | undefined | void;

	/**
	 * 是否需要管理员权限
	 */
	needAdmin?: boolean;

	/**
	 * 介绍
	 */
	description?: string[];

	/**
	 * 作者
	 */
	author?: string;

	/**
	 * 版本
	 */
	version?: string;

	/**
	 * 权限列表
	 */
	permissionList?: number[];

	/**
	 * 排除的群聊
	 */
	excludedGroups?: [];
};

declare type CHregCommand = (config: CommandConfig) => void;

declare interface Sender {
	age: number;
	area: string;
	card: string;
	level: string;
	nickname: string;
	role: string;
	sex: string;
	title: string;
	user_id: number;
}

declare interface Packet {
	post_type: string;
	message_type: string;
	time: number;
	self_id: number;
	sub_type: string;
	message_seq: number;
	message_id: number;
	font: number;
	group_id: number;
	message: string;
	raw_message: string;
	sender: Sender;
	user_id: number;
	anonymous?: any;
}
