import {shallowReactive, watch} from 'vue'

import {UI, defineKey} from 'leafer-ui'

// 创建代理 使用响应式数据
defineKey(UI.prototype, 'proxyData', {
    get() {
        return this.__proxyData
            ? this.__proxyData
            : (this.__proxyData = this.createProxyData())
    },
})

/**
 * 以下getProxy和setProxy是Leafer内部使用的，无需手动调用
 * @param name
 * @param newValue
 */
UI.prototype.setProxyAttr = function (name: string, newValue: unknown): void {
    const data = this.__proxyData as any
    if (data[name] !== newValue) data[name] = newValue
}

UI.prototype.getProxyAttr = function (name: string): any {
    const value = (this.__proxyData as any)[name]
    // if (this.__proxyData.tag === 'QrCode') {
    //     console.log(`name=${name}:value=${value}`)
    // }
    return value === undefined ? this.__.__get(name) : value
}

// 创建响应式数据
UI.prototype.createProxyData = function () {
    // 1.获取所有样式数据(含默认值)
    const data = this.__.__getData()

    // 2. 生成响应式数据
    const proxyData = shallowReactive(data)

    // 3.观察响应式数据变化，同步更新元素数据
    for (const name in data) {
        watch(
            () => (this.__proxyData ? this.getProxyAttr(name) : proxyData[name]), // getter
            (newValue) => {
                if (this.__.__get(name) !== newValue) (this as any)[name] = newValue
            } // setter
        )
    }

    return proxyData
}
