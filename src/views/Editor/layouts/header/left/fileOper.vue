<template>
    <a-popover v-model:popup-visible="showFileOper" position="bottom" trigger="click" content-class="down-list">
        <a-button class="icon-btn">
            文件
            <icon-down class="m-l-2px"/>
        </a-button>
        <template #content>
            <div>
                <div class="p-t-5px p-b-5px p-l-20px p-r-20px border-bottom">
                    <span class="font-bold">ID:123456789</span>
                    <div>
                        <span>未命名文件</span>
                    </div>
                </div>
                <ul class="">
                    <li @click="fileOper('insertImg')">
                        <icon-upload class="m-r-5px"/>
                        插入图片
                    </li>
                    <li @click="fileOper('importPsdFile')">
                        <icon-import class="m-r-5px"/>
                        导入PSD文件
                    </li>
                    <li @click="fileOper('importJsonFile')">
                        <icon-import class="m-r-5px"/>
                        导入JSON文件
                    </li>
                    <li @click="fileOper('copyFile')">
                        <icon-copy class="m-r-5px"/>
                        创建副本
                    </li>
                </ul>
            </div>
        </template>
    </a-popover>
    <a-modal v-model:visible="visible" :closable="false" :footer="false">
        <template #title>
            <div>{{ processTitle }}</div>
        </template>
        <div>
            <div style="width: max-content; margin: 0 auto;">
<!--                <div v-html="LoadingSvg" class="mr2 mt3px"></div>-->
                <a-spin dot/>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import {checkFileExt, getImgStr, selectFiles, toArrayBuffer} from "@/utils/designUtil";
import {Image} from "leafer-ui";
import {parsePsdFile} from "@/utils/psd";
import {useEditor} from "@/views/Editor/app";
import {IUI} from "@leafer-ui/interface";
import {Message} from "@arco-design/web-vue";
import {getDefaultName} from "@/views/Editor/utils/utils";
import {parseText} from "@/utils/psd/parser/text";
import {parseImage} from "@/utils/psd/parser/image";
import {parseGroup} from "@/utils/psd/parser/group";
import {parseMask} from "@/utils/psd/parser/mask";
import LoadingSvg from '@/assets/icons/loading.svg?raw'
const {proxy} = getCurrentInstance()
const {canvas, keybinding} = useEditor()

const showFileOper = ref(false)
const visible = ref(false)
const processTitle = ref('正在导入')

const fileOper = (type) => {
    showFileOper.value = false
    switch (type) {
        case 'insertImg':
            insertImg()
            break;
        case 'importPsdFile':
            importPsdFile()
            break;
        case 'importJsonFile':
            importJsonFile()
            break;
        case 'copyFile':
            copyFile()
            break;
    }
}

const copyFile = () => {

}

// 插入图片
const insertImg = async (clear = false) => {
    selectFiles({accept: '.jpg,.png,.jpeg,.svg', multiple: false}).then((fileList) => {
        if (clear) {
            // canvas.clear()
            // workspaces.removeAll()
        }
        Array.from(fileList).forEach(async (item) => {
            const {arrayBuffer} = await toArrayBuffer(item)
            const url = URL.createObjectURL(item);
            let image = new Image({
                name: getDefaultName(canvas.contentFrame),
                url: url,
                editable: true
            });
            canvas.add(image)
        })
    })
}

const importPsdFile = () => {
    selectFiles({accept: '.psd', multiple: false}).then((fileList) => {
        let oldAll = []
        for (const item of Array.from(fileList)) {
            if (checkFileExt(item, ['psd'])) {
                visible.value = true
                processTitle.value = '正在解析PSD文件'
                console.log('开始执行')
                const onProcess = (result) => {

                }
                // PSD文件
                parsePsdFile(item, onProcess).then(async value => {
                    const {psd, layers} = value
                    processTitle.value = '正在导入PSD文件：'
                    canvas.contentFrame.removeAll()
                    canvas.contentFrame.width = psd.width
                    canvas.contentFrame.height = psd.height
                    console.log('layers=', layers)
                    await parseLayers(layers)
                    visible.value = false
                    setTimeout(() => {
                        canvas.childrenEffect()
                    }, 200)
                }).catch(reason => {
                    visible.value = false
                    Message.warning({
                        content: reason.message,
                        duration: 4000
                    })
                })

            } else {
                // 非PSD文件
                getImgStr(item).then((file) => {
                    // insertImgFile(file)
                })
            }
        }
    })
};
const importJsonFile = () => {
    selectFiles({accept: '.json'}).then((files) => {
        visible.value = true
        processTitle.value = '正在导入JSON文件'
        console.log('开始执行')

        const [file] = files;
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = () => {
            canvas.importJsonToCurrentPage(JSON.parse(<string>reader.result), true)
            visible.value = false
        };
    });
}

const parseLayers = (layers, parent: IUI = canvas.contentFrame) => {
    layers.reverse()
    let group = []
    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i]
        console.log(layer.name + ':', layer)
        // 层级：数值越大越靠前，与ps的层级相反
        let index = layers.length - i
        layer.zIndex = index
        if (layer.children) {
            // 组
            const parent2 = addGroup(layer, parent)
            parseLayers(layer.children, parent2)
            continue
        }

        if (layer.clipping) {
            // 剪切蒙版
            group.push(layer)
        } else {
            if (group.length > 0) {
                group.push(layer)
                // 打组，创建蒙版数据
                addMask(index, group, parent)
                group = []
            } else {
                const obj = addObj(layer, parent)
            }
        }
    }
}

const addObj = (layer, parent: IUI = canvas.contentFrame) => {
    let obj
    if (layer.text) {
        // 文字
        obj = parseText(layer);
    } else {
        // 图片
        obj = parseImage(layer)
        // editor.contentFrame.add(canvas)
    }
    parent.add(obj)
    return obj;
}
const addGroup = (layer, parent: IUI = canvas.contentFrame) => {
    let group = parseGroup(layer);
    parent.add(group)
    return group
}
const addMask = async (index, groups, parent: IUI = canvas.contentFrame) => {
    const mask = parseMask(index, groups, parent)
    return mask
}

</script>

<style scoped>

</style>
