import { Disposable } from '@/views/Editor/utils/lifecycle'
import { IInstantiationService } from '@/views/Editor/core/instantiation/instantiation'
import type { EffectScope } from 'vue'

export abstract class BaseApp extends Disposable {
  private scope: EffectScope

  public abstract service: IInstantiationService

  constructor() {
    super()
    this.scope = effectScope()
  }

  public abstract startup(): void

  public scopeRun(fn: () => void) {
    this.scope.run(fn)
  }

  public dispose() {
    super.dispose()
    this.scope?.stop()
  }
}
