<template>
    <a-layout-sider class="sider-box" :class="active?'active':''">
        <div ref="widgetPanel" id="s-widget-panel">
            <div class="s-widget-classify">
                <ul class="s-classify-wrap">
                    <li v-for="(item, index) in widgetClassifyList" :key="index" :class="['s-classify-item', { 's-active-classify-item': activeWidgetClassify === index }]" @click="clickClassify(index)">
                        <component :is="item.icon" class="icon" :size="24"/>
                        <span class="title">{{ item.name }}</span>
                    </li>
                </ul>
                <help>
                    <ul class="b-classify-wrap">
                        <li :class="['b-classify-item']">
                            <icon-question-circle class="icon" />
                            <span class="title">帮助</span>
                        </li>
                    </ul>
                </help>
            </div>
            <div ref="widgetWrap" v-show="active" class="s-widget-wrap">
                <component v-for="(item, index) in widgetClassifyList" :key="'com_'+index" :is="item.component" v-show="+activeWidgetClassify === index" :active="+activeWidgetClassify === index"/>
            </div>
            <div v-show="active" class="s-side-wrap">
                <a-tooltip effect="dark" content="收起侧边栏" placement="right">
                    <div class="pack__up" @click="active = false"></div>
                </a-tooltip>
            </div>
        </div>
    </a-layout-sider>
</template>
<script setup lang="ts">
import TempListWrap from "./wrap/TempListWrap.vue";
import ElementListWrap from "./wrap/ElementListWrap.vue";
import TextListWrap from "./wrap/TextListWrap.vue";
import ImageListWrap from "./wrap/ImageListWrap.vue";
import BackgroundWrap from "./wrap/BackgroundWrap.vue";
import GraphListWrap from "./wrap/GraphListWrap.vue";
import ToolsWrap from "./wrap/ToolsWrap.vue";
import Help from "@/views/Editor/layouts/panel/leftPanel/help.vue";

const widgetClassifyList =  [
    {
        name: '模板',
        icon: 'icon-apps',
        show: false,
        component: TempListWrap,
    },
    {
        name: '文字',
        icon: 'icon-edit',
        show: false,
        component: TextListWrap,
    },
    {
        name: '元素',
        icon: 'icon-star',
        show: false,
        component: ElementListWrap,
    },
    {
        name: '素材',
        icon: 'icon-common',
        show: false,
        component: GraphListWrap,
    },
    {
        name: '图片',
        icon: 'icon-image',
        show: false,
        component: ImageListWrap,
    },
    {
        name: '背景',
        icon: 'icon-mosaic',
        show: false,
        component: BackgroundWrap,
    },
    {
        name: '工具',
        icon: 'icon-qrcode',
        show: false,
        component: ToolsWrap,
    },
    {
        name: 'AI',
        icon: 'icon-robot',
        show: false,
    },
    {
        name: '我的',
        icon: 'icon-user',
        show: false,
    },
]
const activeWidgetClassify =  ref(0)
const active =  ref(true)
const activeComponent =  ref(widgetClassifyList[0]?.component)
const clickClassify = (index: number) => {
    if (activeWidgetClassify.value  === index){
        active.value = !active.value

    }else {
        activeWidgetClassify.value = index
        active.value = true
        activeComponent.value = widgetClassifyList[index].component
    }
}
const getStyle = (index: number) => {
    return {
        display: activeWidgetClassify.value === index ? '' : 'none',
    }
}
</script>
<style lang="less" scoped>
// Color variables (appears count calculates by raw css)
@import "../../../styles/layouts";
@color1: #3e4651; // Appears 2 times
@menuWidth: 67px; // 默认菜单宽度
@active-text-color: #2254f4; // #1195db;
.sider-box{
  width:@menuWidth !important;
  :deep(.arco-layout-sider-children){
    overflow: initial;
  }
}
.sider-box.active{
  width: calc(@menuWidth + 329px) !important;
}
#s-widget-panel {
  transition: all 1s;
  color: @color1;
  display: flex;
  flex-direction: row;
  font-weight: 600;
  height: calc(100vh - 20px);
  position: relative;
  .s-widget-classify {
    border-right: 1px solid rgba(0, 0, 0, 0.07);
    background-color: #ffffff;
    height: 100%;
    text-align: center;
    display: grid;
    align-content: space-between;
    width: calc(@menuWidth);
    .icon {
      font-size: 24px;
      color: #070707c9;
    }
    .s-classify-wrap {
      margin: 0;
      padding-top: 3px;
      user-select: none;
      width: 100%;
      justify-items: center;
      padding-left: 0;
      max-height: calc(100vh - 90px);
      overflow: auto;
      .s-classify-item {
        position: relative;
        align-items: center;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        font-size: 12px;
        font-weight: 500;
        height: 68px;
        justify-content: center;
        width: 100%;
        .title {
          color: var(--color-text-2);;
          margin-top: 5px;
        }
        .icon {
        }
      }
      .s-classify-item:hover > .icon {
      }
      .s-active-classify-item {
        position: relative;
        .icon,
        .title {
          color:rgb(var(--primary-6));
        }
      }
      .s-active-classify-item::after,
      .s-classify-item:hover::after {
        position: absolute;
        content: '';
        left: 0;
        top: 13px;
        width: 4px;
        height: 65%;
        background:rgb(var(--primary-6));;
      }
    }
    .b-classify-wrap {
      //margin: 0;
      padding-top: 3px;
      margin-bottom: 20px;
      user-select: none;
      width: 100%;
      justify-items: center;
      padding-left: 0;
      .b-classify-item {
        position: relative;
        align-items: center;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        font-size: 12px;
        font-weight: 500;
        height: 68px;
        justify-content: center;
        width: 100%;
        .title {
          color: var(--color-text-2);;
          margin-top: 5px;
        }
        .icon {
        }
      }
      .b-classify-item:hover{
        .icon,
        .title {
          color:rgb(var(--primary-6));
        }
      }
      .b-active-classify-item {
        position: relative;
        .icon,
        .title {
          color:rgb(var(--primary-6));
        }
      }
    }
  }
  .s-widget-wrap {
    width: @leftPanelWidth;
    background-color: #fff;
    flex: 1;
    height: 100%;
  }
  .s-side-wrap {
    position: fixed;
    left: calc(@leftPanelWidth + 66px);
    pointer-events: none;
    z-index: 100;
    width: 20px;
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    .pack__up {
      pointer-events: all;
      border-radius: 0 100% 100% 0;
      cursor: pointer;
      width: 20px;
      height: 64px;
      cursor: pointer;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACACAMAAABOb9vcAAAAhFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAADHx8cODg50dHTx8fF2dnZ1dXWWlpZHR0c4ODhQpkZ5AAAAIXRSTlMA9t+/upkRAnPq5NXDfDEsKQjMeGlRThkMsquljTwzIWhBHpjgAAABJElEQVRYw+3YyW7CQBCEYbxig8ELGJyQkJRJyPb+75dj3zy/lD7kMH3+ZEuzSFO1mlZwhjOE2uwhVHJYMygNVwilhz2EUvNaMigledUFoE1anKYAtA9nVRuANpviOQBt0t2ZQSnZ9QxK6Qih9LSGUHkJobYlhGp6CPW4hlAVhckLhMop1InCjEK1FBYU1hSqo/BI4YXCjMIthTWFijDCCB3g7fuO4O1t/rkvQXPz/LUIzX0oAM0tQHOfCkBzC9DcuwLQXACao9Dv1yb9lsek2xaaxMcMH1x6Ff79dY0wwgj/DGv3p2tG4cX9wd55h4rCO/hk3uEs9w6QlXPIbXrfIJ6XrmVBOtJCA1YkXqVLkh1aUgyNk1fV1BxLxzpsuNLKzrME/AWr0ywwvyj83AAAAABJRU5ErkJggg==);
      background-repeat: no-repeat;
      background-size: cover;
      background-position: 50%;
      filter: drop-shadow(5px 0px 4px rgba(0, 0, 0, 0.03));
    }
    .pack__up:hover {
      color: rgba(0, 0, 0, 0.9);
      opacity: 0.9;
    }
  }
}
</style>
