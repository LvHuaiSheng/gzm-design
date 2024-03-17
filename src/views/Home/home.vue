<script setup lang="ts">
</script>

<template>
    <a-space>
        <a-button
                @click="
                  $router.push({
                    name: 'Editor',
                  })
                "
        >
            进入编辑器
        </a-button>
<!--        <a-button-->
<!--                @click="-->
<!--                  $router.push({-->
<!--                    name: 'PsParser',-->
<!--                  })-->
<!--                "-->
<!--        >-->
<!--            PSD解析器-->
<!--        </a-button>-->
    </a-space>
</template>
