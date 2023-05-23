declare namespace serein {
    /**
     * 绑定游戏ID
     * @param {number} userid QQ号
     * @param {string} gameid 游戏ID，需符合/^[a-zA-Z0-9_\s-]{4,16}$/
     * @returns {boolean} 绑定结果
     */
    function bindMember(userid: number, gameid: string): boolean

    /**
     * 删除绑定记录
     * @param {number} userid QQ号
     * @returns {boolean} 解绑结果
     */
    function unbindMember(userid: number): boolean

    /**
     * 获取指定用户QQ
     * @param {string} gameid 游戏ID
     * @returns {number} QQ号
     */
    function getID(gameid: string): number

    /**
     * 获取指定游戏ID
     * @param {number} userid QQ号
     * @returns {string} 游戏ID
     */
    function getGameID(userid: number): string
}