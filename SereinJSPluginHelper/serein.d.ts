declare namespace serein {
    /**
     * 输出日志
     * @param {any} content 内容
     */
    function log(content: any): void

    /**
     * Debug输出
     * @param {any} content 内容
     */
    function debugLog(content: any): void

    /**
     * 注册插件
     * @param {string} name 名称
     * @param {string} version 版本
     * @param {string} author 作者
     * @param {string} description 详细描述
     * @returns {string} 命名空间
     */
    function registerPlugin(name: string, version: string, author: string, description: string): string

    /**
     * 获取Serein设置
     * @returns {string} 设置的json文本
     */
    function getSettings(): string

    /**
     * 获取Serein设置对象
     * @returns {any} 设置的json文本
     */
    function getSettingsObject(): any

    /**
     * 执行命令
     * @param {string} command 一条Serein命令
     * @summary 此处无法执行绑定或解绑ID、获取motd和执行js代码的命令
     */
    function runCommand(command: string): void

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（服务器启动）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onServerStart', func: () => void): boolean

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（服务器关闭）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onServerStop', func: (exitCode: number) => void): boolean

    /**
     * 设置监听器
     * - `onServerOutput`总是先于`onServerOriginalOutput`触发，但是拦截`onServerOutput`不影响后者触发
     * - 当两者中至少有一个事件被拦截时才会跳过下一步处理
     * @param {string} eventname 事件名称（服务器输出）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onServerOutput' | 'onServerOriginalOutput', func: (line: string) => boolean | void): boolean

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（服务器输入指令）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onServerSendCommand', func: (cmd: string) => void): boolean

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（监听群群成员增加/减少）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onGroupIncrease' | 'onGroupDecrease', func: (group_id: number, user_id: number) => void): boolean

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（监听群戳一戳自身账号）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onGroupPoke', func: (group_id: number, user_id: number) => void): boolean

    /**
     * 设置监听器
     * `onReceivePacket`先于`onReceivePrivateMessage`和`onReceiveGroupMessage`触发，若此事件被拦截，私聊和群聊消息事件均不会被触发
     * @param {string} eventname 事件名称（收到群消息）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onReceiveGroupMessage', func: (group_id: number, user_id: number, msg: string, shownName: string) => boolean | void): boolean

    /**
     * 设置监听器
     * `onReceivePacket`先于`onReceivePrivateMessage`和`onReceiveGroupMessage`触发，若此事件被拦截，私聊和群聊消息事件均不会被触发
     * @param {string} eventname 事件名称（收到私聊消息）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onReceivePrivateMessage', func: (user_id: number, msg: string, nickName: string) => boolean | void): boolean

    /**
     * 设置监听器
     * `onReceivePacket`先于`onReceivePrivateMessage`和`onReceiveGroupMessage`触发，若此事件被拦截，私聊和群聊消息事件均不会被触发
     * @param {string} eventname 事件名称（收到数据包）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onReceivePacket', func: (packet: string) => boolean | void): boolean

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（Serein关闭）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onSereinClose', func: () => void): boolean

    /**
     * 设置监听器
     * @param {string} eventname 事件名称（插件重载/加载完毕）
     * @param {Function} func 回调函数
     * @returns {boolean} 设置结果
     */
    function setListener(eventname: 'onPluginsReload' | 'onPluginsLoaded', func: () => void): boolean

    /**
     * 获取正则列表
     * @returns {Array<Regex>} 正则列表
     */
    function getRegexes(): Array<Regex>

    /**
     * 添加正则
     * @param {string} regexp 正则
     * @param {number} area 作用域
     * @param {boolean} needAdmin 需要管理
     * @param {string} command 命令
     * @param {string} remark 备注
     * @param {Array<number>} ignore 忽略对象
     * @returns {boolean} 添加结果
     */
    function addRegex(regexp: string, area: RegexAreaType, needAdmin: boolean, command: string, remark?: string, ignore?: number[]): boolean

    /**
     * 修改正则
     * @param {number} index 数组下标
     * @param {string} regexp 正则
     * @param {number} area 作用域
     * @param {boolean} needAdmin 需要管理
     * @param {string} command 命令
     * @param {string} remark 备注
     * @param {Array<number>} ignore 忽略对象
     * @returns {boolean} 添加结果
     */
    function editRegex(index: number, regexp?: string, area?: RegexAreaType, needAdmin?: boolean, command?: string, remark?: string, ignore?: number[]): boolean

    /**
     * 删除正则
     * @param {number} index 数组下标
     * @returns {boolean} 删除结果
     */
    function removeRegex(index: number): boolean

    /**
     * 设置命令变量
     * - `key`不能为空或null
     * - `key`只能包含大小写字母、数字和下划线（即需要满足正则表达式`^\w+$`）
     * - `key`不需要包括两边的`%`
     * - 设置重复的`key`将会被覆盖
     * - 各个插件设置变量的可能存在冲突，执行时以最后设置的为准
     *      - 你可以使用一个相对复杂的名称避免被覆盖（如`插件名_变量名`）
     * - Serein提供的变量在替换时优先级大于该变量
     *      - 也就是说，只有当匹配不到Serein内的变量时才会采用以上自定义的变量
     * @param {string} key 变量名
     * @param {*} variable 变量
     * @returns {boolean} 设置结果
     */
    function setVariable(key: string, variable: any): boolean

    /**
     * 获取插件列表
     * @returns {SereinPlugin[]} 插件列表
     */
    function getPlugins(): SereinPlugin[]

    /**
     * 设置预加载配置
     * @param {Array<string>} assemblies
     * @param {boolean} allowGetType
     * @param {boolean} allowOperatorOverloading
     * @param {boolean} allowSystemReflection
     * @param {boolean} allowWrite
     * @param {boolean} strict
     * @param {boolean} stringCompilationAllowed
     */
    function setPreLoadConfig(assemblies: string[], allowGetType: boolean, allowOperatorOverloading: boolean, allowSystemReflection: boolean, allowWrite: boolean, strict: boolean, stringCompilationAllowed: boolean): void

    /**
     * 热重载文件
     * @param {string} type 文件类型
     * @returns {boolean} 重载结果
     */
    function reloadFiles(type?: 'all' | 'regex' | 'member' | 'schedule' | 'groupcache' | 'settings'): boolean
}

/**
 * Serein正则对象
 */
declare type Regex = {
    readonly regexp: string
    readonly area: RegexAreaType,
    readonly needAdmin: boolean,
    readonly command: string,
    readonly remark: string,
    readonly ignore: number[]
}

/**
 * Serein正则作用域枚举值
 */
declare enum RegexAreaType {
    disable = 0,
    console = 1,
    groupMsg = 2,
    privateMsg = 3,
    selfMsg = 4,
}

declare interface SereinPlugin {
    readonly namespace: string
    readonly available: boolean
    readonly version: string | null
    readonly author: string | null
    readonly description: string | null
    readonly file: string
    readonly wsclients: WSClient[]
    readonly preLoadConfig: PreLoadConfig
    readonly name: string
    readonly eventList: number[]
}

declare interface PreLoadConfig {
    readonly Assemblies: string[]
    readonly AllowGetType: boolean
    readonly AllowOperatorOverloading: boolean
    readonly AllowSystemReflection: boolean
    readonly AllowWrite: boolean
    readonly Strict: boolean
    readonly stringCompilationAllowed: boolean
}

declare

declare interface WSClient {
    readonly state: -1 | 0 | 1 | 2 | 3
}