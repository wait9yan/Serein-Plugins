declare namespace serein {
    /**
     * 获取系统信息
     * @returns {SysInfo} 系统信息
     */
    function getSysInfo(): SysInfo

    /**
     * 获取CPU使用率
     * - Linux版本下返回`undefined`
     * @returns {number|undefined}
     */
    function getCPUUsage(): number | undefined

    /**
     * 获取网速
     * @returns {string[]} `[0]`为上传网速，`[1]`为下载网速
     */
    function getNetSpeed(): string[]
}

declare interface SysInfo {
    readonly Architecture: string
    readonly Name: string
    readonly Hardware: Hardware
    readonly FrameworkVersion: FrameworkVersion
    readonly JavaVersion: JavaVersion
    readonly IsMono: boolean
    readonly OperatingSystemType: number
}

declare interface Hardware {
    readonly CPUs: Cpu[]
    readonly GPUs: Gpu[]
    readonly RAM: Ram
}

declare interface Cpu {
    readonly Name: string
    readonly Brand: string
    readonly Architecture: string
    readonly Cores: number
    readonly Frequency: number
}

declare interface Gpu {
    readonly Name: string
    readonly Brand: string
    readonly Resolution: string
    readonly RefreshRate: number
    readonly MemoryTotal: number
}

declare interface Ram {
    readonly Free: number
    readonly Total: number
}

declare interface FrameworkVersion {
    readonly Major: number
    readonly Minor: number
    readonly Build: number
    readonly Revision: number
    readonly MajorRevision: number
    readonly MinorRevision: number
}

declare interface JavaVersion {
    readonly Major: number
    readonly Minor: number
    readonly Build: number
    readonly Revision: number
    readonly MajorRevision: number
    readonly MinorRevision: number
}
