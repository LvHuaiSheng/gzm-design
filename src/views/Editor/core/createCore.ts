import { getSingletonServiceDescriptors } from '@/views/Editor/core/instantiation/extensions'
import { IInstantiationService } from '@/views/Editor/core/instantiation/instantiation'
import { InstantiationService } from '@/views/Editor/core/instantiation/instantiationService'
import { ServiceCollection } from '@/views/Editor/core/instantiation/serviceCollection'
import { setActiveCore } from '@/views/Editor/core/root'
import { ICore } from '@/views/Editor/core/types'
import { appInstance } from '@/views/Editor/app'

const createServices = (): IInstantiationService => {
  const services = new ServiceCollection()

  // 获取全局单例服务
  for (const [id, descriptor] of getSingletonServiceDescriptors()) {
    services.set(id, descriptor)
  }

  return new InstantiationService(services, true)
}

export const createCore = (): ICore => {
  const service = createServices()
  const core: ICore = markRaw({
    install(vueApp) {
      this._a = vueApp
      setActiveCore(core)
    },
    use(plugin) {
      // todo 插件管理和生命周期
      this._p.push(plugin)
      appInstance.editor?.use(plugin)
      return this
    },
    service,
    _p: [],
    _a: null,
  })

  return core
}
