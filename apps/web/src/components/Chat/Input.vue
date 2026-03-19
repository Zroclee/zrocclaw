<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue';

type DisplayType = 'full' | 'simple';
type Variant = 'bordered' | 'borderless';
type SendBtnVariant = 'full' | 'simple';
type SubmitShortKey = 'enter' | 'shiftEnter';

interface AutosizeConfig {
  minRows?: number;
  maxRows?: number;
}

interface Props {
  modelValue: string;
  displayType?: DisplayType;
  variant?: Variant;
  sendBtnVariant?: SendBtnVariant;
  submitShortKey?: SubmitShortKey;
  autosize?: boolean | AutosizeConfig;
  autofocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  displayType: 'full',
  variant: 'bordered',
  sendBtnVariant: 'full',
  submitShortKey: 'enter',
  autosize: false,
  autofocus: false,
  disabled: false,
  placeholder: 'Type a message...',
  loading: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit', value: string): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

// --- Autosize 逻辑 ---
const parsedAutosize = computed(() => {
  if (typeof props.autosize === 'boolean') {
    return props.autosize ? { minRows: 1, maxRows: 5 } : false;
  }
  return props.autosize;
});

const adjustHeight = () => {
  const textarea = textareaRef.value;
  if (!textarea || !parsedAutosize.value) return;

  const config = parsedAutosize.value as AutosizeConfig;
  const minRows = config.minRows || 1;
  const maxRows = config.maxRows || 5;

  // 临时重置高度以获取真实 scrollHeight
  textarea.style.height = 'auto';
  
  // 计算行高 (基于当前字体大小和行高)
  const computedStyle = window.getComputedStyle(textarea);
  const lineHeight = parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.5;
  const paddingTop = parseInt(computedStyle.paddingTop) || 0;
  const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
  
  const minHeight = (minRows * lineHeight) + paddingTop + paddingBottom;
  const maxHeight = (maxRows * lineHeight) + paddingTop + paddingBottom;
  
  let newHeight = textarea.scrollHeight;
  if (newHeight < minHeight) newHeight = minHeight;
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    textarea.style.overflowY = 'auto';
  } else {
    textarea.style.overflowY = 'hidden';
  }
  
  textarea.style.height = `${newHeight}px`;
};

// 监听内容变化调整高度
watch(() => props.modelValue, () => {
  nextTick(() => {
    adjustHeight();
  });
});

// --- 事件处理 ---
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;

  const isEnter = e.key === 'Enter';
  const isShift = e.shiftKey;

  if (!isEnter) return;

  const isSubmitKey = 
    (props.submitShortKey === 'enter' && !isShift) || 
    (props.submitShortKey === 'shiftEnter' && isShift);

  if (isSubmitKey) {
    e.preventDefault(); // 阻止默认换行
    if (props.modelValue.trim() && !props.loading) {
      emit('submit', props.modelValue);
    }
  }
  // 如果不是提交键，则是换行键，允许默认的换行行为
};

const handleSubmitClick = () => {
  if (props.disabled || props.loading || !props.modelValue.trim()) return;
  emit('submit', props.modelValue);
  textareaRef.value?.focus();
};

// --- 初始化 ---
onMounted(() => {
  if (props.autofocus && !props.disabled) {
    textareaRef.value?.focus();
  }
  if (props.autosize) {
    adjustHeight();
  }
});

// 计算样式类
const containerClasses = computed(() => {
  return [
    'flex flex-col gap-2 transition-colors duration-200',
    props.variant === 'bordered' ? 'border border-base-300 rounded-xl p-3 bg-base-100 focus-within:border-primary' : 'bg-transparent'
  ];
});

const sendBtnClasses = computed(() => {
  return [
    'btn btn-primary',
    props.sendBtnVariant === 'simple' ? 'btn-circle btn-sm' : 'btn-sm px-4'
  ];
});

</script>

<template>
  <div :class="containerClasses">
    
    <!-- === Full 形态 === -->
    <template v-if="displayType === 'full'">
      <!-- 上半部分：Prefix + Textarea -->
      <div class="flex items-end gap-2">
        <div v-if="$slots.prefix" class="flex-none mb-1">
          <slot name="prefix"></slot>
        </div>
        
        <textarea
          ref="textareaRef"
          :value="modelValue"
          @input="handleInput"
          @keydown="handleKeydown"
          :disabled="disabled"
          :placeholder="placeholder"
          class="flex-1 bg-transparent resize-none outline-none min-h-[24px] text-base-content placeholder:text-base-content/30 py-1"
          :rows="parsedAutosize ? (parsedAutosize as AutosizeConfig).minRows || 1 : 1"
        ></textarea>
      </div>

      <!-- 下半部分：Extra + Send Button -->
      <div class="flex items-center justify-between mt-1">
        <div class="flex-1 flex items-center gap-2 overflow-x-auto">
          <slot name="extra"></slot>
        </div>
        
        <div class="flex-none ml-2">
          <slot name="button" :submit="handleSubmitClick" :disabled="disabled || !modelValue.trim()" :loading="loading">
            <button 
              :class="sendBtnClasses"
              :disabled="disabled || !modelValue.trim()"
              @click="handleSubmitClick"
            >
              <span v-if="loading" class="loading loading-spinner loading-xs"></span>
              <template v-else>
                <svg v-if="sendBtnVariant === 'simple'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <span v-else>发送</span>
              </template>
            </button>
          </slot>
        </div>
      </div>
    </template>

    <!-- === Simple 形态 === -->
    <template v-else>
      <!-- 单行布局：Prefix + Textarea + Send Button (忽略 extra) -->
      <div class="flex items-end gap-2 w-full">
        <div v-if="$slots.prefix" class="flex-none mb-1">
          <slot name="prefix"></slot>
        </div>
        
        <textarea
          ref="textareaRef"
          :value="modelValue"
          @input="handleInput"
          @keydown="handleKeydown"
          :disabled="disabled"
          :placeholder="placeholder"
          class="flex-1 bg-transparent resize-none outline-none min-h-[24px] text-base-content placeholder:text-base-content/30 py-1"
          :rows="parsedAutosize ? (parsedAutosize as AutosizeConfig).minRows || 1 : 1"
        ></textarea>

        <div class="flex-none mb-1">
          <slot name="button" :submit="handleSubmitClick" :disabled="disabled || !modelValue.trim()" :loading="loading">
             <button 
              :class="sendBtnClasses"
              :disabled="disabled || !modelValue.trim()"
              @click="handleSubmitClick"
            >
              <span v-if="loading" class="loading loading-spinner loading-xs"></span>
              <template v-else>
                <svg v-if="sendBtnVariant === 'simple'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <span v-else>发送</span>
              </template>
            </button>
          </slot>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* 隐藏 webkit 下的滚动条但保持可滚动（如果超出最大行数） */
textarea::-webkit-scrollbar {
  width: 4px;
}
textarea::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb {
  background-color: var(--fallback-bc,oklch(var(--bc)/0.2));
  border-radius: 4px;
}
</style>
