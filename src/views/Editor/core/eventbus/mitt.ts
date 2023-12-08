export type EventType = string | symbol

// An event handler can take an optional event argument
// and should not return a value
export type Handler<T = unknown> = (event: T) => void
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T],
) => void

// An array of all currently registered event handlers for a type
export type EventHandlerList<T = unknown> = Array<Handler<T>>
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<WildcardHandler<T>>

// A map of event types and their corresponding event handlers.
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>

export interface Emitter<Events extends Record<EventType, unknown>> {
  all: EventHandlerMap<Events>

  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  on(type: '*', handler: WildcardHandler<Events>): void

  once<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  once(type: '*', handler: WildcardHandler<Events>): void

  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off(type: '*', handler: WildcardHandler<Events>): void

  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
  emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void
}

/**
 * Mitt: Tiny (~200b) functional event emitter / pubsub.
 * @name mitt
 * @returns {Mitt}
 */
export class Mitt<Events extends Record<EventType, unknown>> implements Emitter<Events> {
  declare readonly _serviceBrand: undefined

  public all = new Map()

  /**
   * Register an event handler for the given type.
   * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
   * @param {Function} handler Function to call in response to given event
   * @memberOf mitt
   */
  public on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  public on(type: '*', handler: WildcardHandler<Events>): void
  public on(type: any, handler: any) {
    const handlers = this.all.get(type)
    if (handlers) {
      handlers.push(handler)
    } else {
      this.all.set(type, [handler] as EventHandlerList<Events[keyof Events]>)
    }
  }

  public once<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  public once(type: '*', handler: WildcardHandler<Events>): void
  public once(type: any, handler: any) {
    const _handler = () => {
      this.off(type, _handler)
      handler()
    }
    this.on(type, _handler)
  }

  /**
   * Remove an event handler for the given type.
   * If `handler` is omitted, all handlers of the given type are removed.
   * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
   * @param {Function} [handler] Handler function to remove
   * @memberOf mitt
   */
  public off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  public off(type: '*', handler: WildcardHandler<Events>): void
  public off(type: any, handler: any) {
    const handlers: Array<Handler<Events[keyof Events]> | WildcardHandler<Events>> | undefined =
      this.all.get(type)
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1)
      } else {
        this.all.set(type, [])
      }
    }
  }

  /**
   * Invoke all handlers for the given type.
   * If present, `'*'` handlers are invoked after type-matched handlers.
   *
   * Note: Manually firing '*' handlers is not supported.
   *
   * @param {string|symbol} type The event type to invoke
   * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
   * @memberOf mitt
   */
  public emit<Key extends keyof Events>(type: Key, evt: Events[Key]): void
  public emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void
  public emit(type: any, evt?: any) {
    const handlers1 = this.all.get(type) as EventHandlerList<Events[keyof Events]>
    if (handlers1) {
      handlers1.slice().map((handler) => {
        handler(evt!)
      })
    }

    const handlers2 = this.all.get('*') as WildCardEventHandlerList<Events>
    if (handlers2) {
      handlers2.slice().map((handler) => {
        handler(type, evt!)
      })
    }
  }
}
