declare namespace serein {
    /**
     * 发送群聊消息
     * @param {number} groupid 群号
     * @param {string} msg 消息文本
     * @returns {boolean} 发送结果
     */
    function sendGroup(groupid: number, msg: string): boolean

    /**
     * 发送私聊消息
     * @param {number} userid 对方qq
     * @param {string} msg 消息文本
     * @returns {boolean} 发送结果
     */
    function sendPrivate(userid: number, msg: string): boolean

    /**
     * 发送数据包
     * @param {string} packet 数据包文本
     * @returns {boolean} 发送结果
     */
    function sendPacket(packet: string): boolean

    /**
     * 获取ws连接状态
     * @returns {boolean} 连接状态
     */
    function getWsStatus(): boolean

    /**
     * 获取群成员昵称缓存字典
     * @returns {object} 字典
     */
    function getGroupCache(): object

    /**
     * 直接获取指定群的群成员昵称缓存
     * @param {number} groupid 群号
     * @param {number} userid QQ号
     * @returns {string} 群成员昵称缓存
     */
    function getUserName(groupid: number, userid: number): string
}
