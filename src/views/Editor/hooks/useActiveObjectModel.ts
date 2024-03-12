import {useEditor} from "@/views/Editor/app";
import {isDefined} from '@vueuse/core'
import type {WritableComputedRef} from 'vue'
import {toFixed} from '@/utils/math'
import {isArray, isNumber, isObject, isString, isNull} from 'lodash'
import {ILeaf, IUI, IUIInputData, IUnitData} from "@leafer-ui/interface";
import {typeUtil} from "@/views/Editor/utils/utils";

type ParseType = Function | 'default' | 'preset' | null

export const useActiveObjectModel = <K extends keyof ILeaf, T = ILeaf[K] | undefined>(
    key: string,
    defaultValue?: any,
    /**
     * 值的格式转换方法
     * default、null：不转换直接使用原始值
     * preset: 使用这里内置好的转换方法
     */
    parseFun: ParseType = 'preset',
): WritableComputedRef<{
    modelValue: T
    onSwipe: (value: T) => void
    onChange: (value: T) => void
}> => {
    const {editor,undoRedo} = useEditor()
    const modelValue = ref()

    // 这里暂时重新定义选择元素来解决在编辑完上一个组件后在输入框不失焦的情况下立即点击下一个组件会导致新组件的被修改的问题
    let activeObject: IUI = null

    // input组件在修改后不回车确定,切换object时,会触发onChange,导致修改错object值
    let lockChange = false
    watchEffect(() => {
        if (!isDefined(editor.activeObject.value)) {
            modelValue.value = undefined
            return
        }
        activeObject = editor.activeObject.value
        // 锁定修改
        lockChange = true
        undoRedo.disabledPropertyChangeWatch()
        let value
        let orgValue = activeObject.proxyData[key]
        if ((!isDefined(orgValue) || orgValue === 0) && defaultValue) {
            orgValue = defaultValue
        } else {
            value = orgValue
        }

        if (parseFun !== 'default'){
            if (parseFun === 'preset'){
                switch (key) {
                    case 'padding':
                        value = orgValue
                        activeObject[key] = value
                        break
                    case 'fill':
                    case 'stroke':
                        if(orgValue){
                            if (isString(orgValue)) {
                                value = [
                                    {
                                        type: 'solid',
                                        color: orgValue
                                    }
                                ]
                            } else if (orgValue && orgValue.type) {
                                value = [
                                    {...orgValue}
                                ]
                            } else {
                                value = orgValue
                            }
                            activeObject[key] = value
                        }
                        break
                    case 'shadow':
                    case 'innerShadow':
                        if (orgValue) {
                            if (isArray(orgValue)) {
                                value = orgValue
                            }else {
                                console.log('orgValue=',orgValue)
                                console.log('isObject(orgValue)=',isObject(orgValue))
                                value = [
                                    {...orgValue}
                                ]
                            }
                            activeObject[key] = value
                        }
                        break
                    case 'lineHeight':
                    case 'letterSpacing':
                        if (orgValue) {
                            if (isObject(orgValue)) {
                                value = orgValue
                            } else {
                                value = {
                                    type: 'percent',
                                    value: orgValue
                                }
                            }
                        } else {
                            value = {
                                type: 'px',
                                value: 0
                            }
                        }
                        activeObject[key] = <IUnitData>value
                        break
                    default:
                        value = orgValue
                        break
                }
            }else if (typeof  parseFun === 'function'){
                value = parseFun(orgValue,activeObject)
                activeObject[key] = value
            }
        }else {
            value = orgValue
        }
        modelValue.value = isNumber(value) ? toFixed(value) : value
        undoRedo.enablePropertyChangeWatch()
        requestAnimationFrame(() => (
            lockChange = false
        ))
    })


    const setObjectValue = (obj: any, newValue: any) => {
        console.log(`set ${key}: ${JSON.stringify(newValue)}`)
        if (obj[key] !== newValue) {
            obj[key] = newValue
            modelValue.value = isNumber(newValue) ? toFixed(newValue) : newValue
            // activeObject.updateLayout()
        }
    }

    /**
     * 更改值
     */
    const changeValue = (newValue: T, type: 'swipe' | 'change') => {
        if (lockChange || !isDefined(activeObject)) return
        setObjectValue(activeObject, newValue)
    }

    return computed(() => ({
        disabled: !isDefined(editor.activeObject.value),
        modelValue: modelValue.value as T,
        onSwipe: (value: T) => {
            changeValue(value, 'swipe')
        },
        onChange: (value: T) => {
            changeValue(value, 'change')
            // 保存历史
            if (!isDefined(activeObject)) return
            // editor.fire('object:modified', { target: editor.activeObject.value })
        },
    }))
}
