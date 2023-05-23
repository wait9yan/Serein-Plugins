/// <reference path="classes.d.ts"/>

declare namespace serein {
    /**
    * 启动服务器
    * @returns {boolean} 启动结果
    */
    function startServer(): boolean

    /**
     * 关闭服务器
     * - 此方法不能保证服务器被关闭
     */
    function stopServer(): void

    /**
     * 强制结束服务器
     * @returns {boolean} 强制结束结果
     */
    function killServer(): boolean

    /**
     * 发送服务器命令
     * @param {string} command 命令内容
     */
    function sendCmd(command: string): void

    /**
     * 获取服务器状态
     * @returns {boolean} 当前状态
     */
    function getServerStatus(): boolean

    /**
     * 获取服务器运行时长
     * @returns {string} 时长字符串，格式见文档
     */
    function getServerTime(): string

    /**
     * 获取服务器进程占用
     * @returns {number} 进程CPU占用率
     */
    function getServerCPUUsage(): number

    /**
     * 获取服务器文件
     * @returns {string} 文件名
     */
    function getServerFile(): string

    /**
     * 获取Motd原文（基岩版）
     * @example
     * 
     * ```
     * MCPE;Dedicated Server;503;1.18.33;0;10;12578007761032183218;Bedrock level;Survival;1;19132;19133;
     * ```
     * @param {string} addr 服务器地址（支持域名、端口）
     * @returns {string} 获取到的文本（需要自己处理）
     */
    function getMotdpe(addr: string): string

    /**
     * 获取Motd原文（Java版）
     * @example
     * ```json
     * {
     *   "descraddrtion": {
     *     "text": "§bMinecraftOnline§f - §6Home of Freedonia§r\n§3Survival, Without the Grief!"
     *   },
     *   "players": {
     *     "max": 120,
     *     "online": 1,
     *     "sample": [
     *         {
     *             "id": "a4740a2c-1eec-4b7d-9d22-1c861e7045d7",
     *             "name": "Biolord101"
     *         }
     *     ]
     *   },
     *   "version": {
     *     "name": "1.12.2",
     *     "protocol": 340
     *   },
     *   "favicon": "……" // 此处限于篇幅省略其内容，实际上是base64编码的图片
     * }
     * ```
     * @param {string} addr 服务器地址（支持域名、端口）
     * @returns {string} 获取到的文本（需要自己处理）
     */
    function getMotdje(addr: string): string

    /**
     * 获取服务器Motd
     * @returns {Motdje | Motdpe} Motd对象
     */
    function getServerMotd(): Motdje | Motdpe
}
