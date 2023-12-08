<script setup lang="ts">
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";

const {canvas} = useEditor()

const x = useActiveObjectModel('x')
const y = useActiveObjectModel('y')

</script>

<template>
    <div>
        <div class="p2">
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="10">
                    <SwipeNumber size="small" label="X" v-bind="x" readonly></SwipeNumber>
                </a-col>
                <a-col :span="10">
                    <SwipeNumber size="small" label="Y" v-bind="y" readonly/>
                </a-col>
            </a-row>
        </div>
    </div>
</template>

<style scoped lang="less"></style>
