<template>
  <div
    v-if="show"
    class="header t-flex t-flex-col t-p-4 lg:t-px-6 t-mb-4"
  >
    <div class="t-flex t-items-start sm:t-flex-row t-flex-col-reverse t-mt-2">
      <TitleBar :item="item"/>
      <div class="t-ml-auto">
        <Tools/>
      </div>
    </div>
    <div v-if="item" class="t-flex t-items-center">
      <Navbar v-if="showNavbar"/>
      <PanelsToggle v-if="showPanelsToggle" class="sm:t-ml-auto t-mt-4 md:t-mt-0" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import Navbar from '@/components/header/Navbar.vue';
import TitleBar from '@/components/header/TitleBar.vue';
import PanelsToggle from '@/components/header/PanelsToggle.vue';
import Tools from '@/components/header/Tools.vue';

const props = defineProps({
  configErrorTitle: {
    type: String,
    default: () => '',
  },
});

const store = useStore();

const show = computed(() => config.value?.header?.show);
const manifests = computed(() => store.getters['contents/manifests']);
const config = computed(() => store.getters['config/config']);
const item = computed(() => store.getters['contents/item']);
const showNavbar = computed(() => config.value?.header?.navigation || true);
const showPanelsToggle = computed(() => (config.value?.header?.panelsToggle !== undefined ? config.value?.header?.panelsToggle : true));
</script>
