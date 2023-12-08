<template>
    <a-popover
        trigger="click"
        position="rt"
    >
        <div>
            <slot/>
        </div>
        <template #content>
            <div style="width: 380px">
                <a-tabs>
                    <a-tab-pane key="1">
                        <template #title>
                            <icon-command /> 热键
                        </template>
                        <a-scrollbar style="height:400px;overflow: auto;">
                            <div>
                                <a-descriptions
                                    v-for="item in datas"
                                    :key="item.key"
                                    :label-style="labelStyle"
                                    :data="item.data"
                                    :title="item.title"
                                    :column="1"
                                />
                            </div>
                        </a-scrollbar>
                    </a-tab-pane>
                    <a-tab-pane key="2">
                        <template #title>
                            <icon-customer-service /> 说明
                        </template>
                        <a-scrollbar style="height:400px;overflow: auto;">
                            <div>
                                热键及热键功能目前尚未全部支持，后续会逐个完善
                            </div>
                        </a-scrollbar>
                    </a-tab-pane>
                </a-tabs>
                <!--                <a-collapse v-model="activevalue">-->
                <!--                    <a-collapse-item header="公共" value="common">-->
                <!--                        <a-scrollbar style="max-height:400px;overflow: auto;">-->
                <!--                            <a-table :columns="columns" :data="data" :pagination="false"/>-->
                <!--                        </a-scrollbar>-->

                <!--                    </a-collapse-item>-->
                <!--                </a-collapse>-->
            </div>
        </template>
    </a-popover>
</template>

<script setup>
const labelStyle = {width:'140px'}

const datas = [
    {
        key: 'common',
        title: '通用',
        data: [
            {
                label: '复制',
                value: 'Ctrl + C',
                describe: 'Jane Doe',
            },
            {
                label: '粘贴',
                value: 'Ctrl + V',
                describe: 'Jane Doe',
            },
            {
                label: '剪切',
                value: 'Ctrl + X',
                describe: 'Jane Doe',
            },
            {
                label: '全选',
                value: 'Ctrl + A',
                describe: 'Jane Doe',
            },
            {
                label: '撤销',
                value: 'Ctrl + Z',
                describe: 'Jane Doe',
            },
            {
                label: '恢复',
                value: 'Ctrl + Y',
                describe: 'Jane Doe',
            },
            {
                label: '删除',
                value: 'Delete / Backspace',
                describe: 'Jane Doe',
            },
            {
                label: '关闭、取消',
                value: 'ESC',
                describe: 'Jane Doe',
            },
        ]
    },
    {
        key: 'canvas',
        title: '画布操作',
        data: [
            {
                label: '移动画布',
                value: 'Space + 鼠标拖拽 / 鼠标中键拖拽',
                describe: 'Jane Doe',
            },
            {
                label: '缩放画布',
                value: 'Ctrl + 鼠标滚轮',
                describe: 'Jane Doe',
            },
        ]
    },
    {
        key: 'item',
        title: '元素操作',
        data: [
            {
                label: '多选',
                value: '按住Shift + 鼠标左键',
                describe: 'Jane Doe',
            },
            {
                label: '粘贴到鼠标位置',
                value: 'Ctrl + Shift + V',
                describe: 'Jane Doe',
            },
            {
                label: '移至底层',
                value: '[',
            },
            {
                label: '移至顶层',
                value: ']',
            },
            {
                label: '向下移动一层',
                value: 'Ctrl + [',
            },
            {
                label: '向上移动一层',
                value: 'Ctrl + ]',
            },
            {
                label: '创建分组',
                value: 'Ctrl + G',
            },
            {
                label: '解除分组',
                value: 'Ctrl + Shift + G',
            },
            {
                label: '显示/隐藏',
                value: 'Ctrl + Shift + H',
            },
            {
                label: '锁定/解锁',
                value: 'Ctrl + Shift + L',
            },
            {
                label: '重命名',
                value: 'Ctrl + R',
            },
            {
                label: '水平翻转',
                value: 'Shift + H',
            },
            {
                label: '垂直翻转',
                value: 'Shift + V',
            },
        ]
    },
    {
        key:'align',
        title:'对齐方式（元素多选）',
        data:[
            {
                label: '左对齐',
                value: 'Alt + A',
            },
            {
                label: '右对齐',
                value: 'Alt + D',
            },
            {
                label: '水平居中对齐',
                value: 'Alt + H',
            },
            {
                label: '顶对齐',
                value: 'Alt + W',
            },
            {
                label: '垂直居中对齐',
                value: 'Alt + V',
            },
            {
                label: '底对齐',
                value: 'Alt + S',
            },
        ]
    }
]
</script>
