<template>
  <div class="bg-base-200 rounded-box border border-base-300 overflow-hidden">
    <div class="tabs tabs-boxed bg-base-300/50 p-2 rounded-none rounded-t-box border-b border-base-300 flex flex-nowrap overflow-x-auto">
      <a class="tab tab-sm sm:tab-md flex-1" :class="{ 'tab-active': tab === 'day' }" @click="setTab('day')">每日</a>
      <a class="tab tab-sm sm:tab-md flex-1" :class="{ 'tab-active': tab === 'week' }" @click="setTab('week')">每周</a>
      <a class="tab tab-sm sm:tab-md flex-1" :class="{ 'tab-active': tab === 'month' }" @click="setTab('month')">每月</a>
      <a class="tab tab-sm sm:tab-md flex-1" :class="{ 'tab-active': tab === 'year' }" @click="setTab('year')">每年</a>
      <a class="tab tab-sm sm:tab-md flex-1" :class="{ 'tab-active': tab === 'once' }" @click="setTab('once')">指定时间</a>
      <a class="tab tab-sm sm:tab-md flex-1" :class="{ 'tab-active': tab === 'custom' }" @click="setTab('custom')">自定义</a>
    </div>

    <div class="p-4">
      <!-- 每日配置 -->
      <div v-if="tab === 'day'" class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">执行时间:</span>
          <div class="flex items-center gap-1">
            <select v-model="state.time.hour" class="select select-bordered select-sm w-18">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ padZero(h-1) }}时</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.minute" class="select select-bordered select-sm w-18">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ padZero(m-1) }}分</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.second" class="select select-bordered select-sm w-18">
              <option v-for="s in 60" :key="s-1" :value="s-1">{{ padZero(s-1) }}秒</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 每周配置 -->
      <div v-if="tab === 'week'" class="space-y-4">
        <div class="flex items-start gap-2">
          <span class="text-sm font-medium w-20 pt-1.5">选择星期:</span>
          <div class="flex flex-wrap gap-2 flex-1">
            <button 
              v-for="d in weekDays" 
              :key="d.value"
              type="button"
              class="btn btn-sm"
              :class="state.weeks.includes(d.value) ? 'btn-primary' : 'btn-outline border-base-content/20'"
              @click="toggleWeek(d.value)"
            >
              {{ d.label }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">执行时间:</span>
          <div class="flex items-center gap-1">
            <select v-model="state.time.hour" class="select select-bordered select-sm w-18">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ padZero(h-1) }}时</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.minute" class="select select-bordered select-sm w-18">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ padZero(m-1) }}分</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.second" class="select select-bordered select-sm w-18">
              <option v-for="s in 60" :key="s-1" :value="s-1">{{ padZero(s-1) }}秒</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 每月配置 -->
      <div v-if="tab === 'month'" class="space-y-4">
        <div class="flex items-start gap-2">
          <span class="text-sm font-medium w-20 pt-1.5">选择日期:</span>
          <div class="flex flex-wrap gap-1.5 flex-1">
            <button 
              v-for="d in 31" 
              :key="d"
              type="button"
              class="btn btn-xs sm:btn-sm w-9 sm:w-10 p-0"
              :class="state.months.includes(d) ? 'btn-primary' : 'btn-outline border-base-content/20'"
              @click="toggleMonthDay(d)"
            >
              {{ d }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">执行时间:</span>
          <div class="flex items-center gap-1">
            <select v-model="state.time.hour" class="select select-bordered select-sm w-18">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ padZero(h-1) }}时</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.minute" class="select select-bordered select-sm w-18">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ padZero(m-1) }}分</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.second" class="select select-bordered select-sm w-18">
              <option v-for="s in 60" :key="s-1" :value="s-1">{{ padZero(s-1) }}秒</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 每年配置 -->
      <div v-if="tab === 'year'" class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">选择日期:</span>
          <div class="flex items-center gap-2">
            <select class="select select-bordered select-sm w-24" v-model="state.yearMonth">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select class="select select-bordered select-sm w-24" v-model="state.yearDay">
              <option v-for="d in daysInYearMonth" :key="d" :value="d">{{ d }}日</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">执行时间:</span>
          <div class="flex items-center gap-1">
            <select v-model="state.time.hour" class="select select-bordered select-sm w-18">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ padZero(h-1) }}时</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.minute" class="select select-bordered select-sm w-18">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ padZero(m-1) }}分</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.second" class="select select-bordered select-sm w-18">
              <option v-for="s in 60" :key="s-1" :value="s-1">{{ padZero(s-1) }}秒</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 指定时间配置 (一次性) -->
      <div v-if="tab === 'once'" class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">选择日期:</span>
          <div class="flex items-center gap-2">
            <select class="select select-bordered select-sm w-24" v-model="state.onceDate.year">
              <option v-for="y in 10" :key="y" :value="currentYear + y - 1">{{ currentYear + y - 1 }}年</option>
            </select>
            <select class="select select-bordered select-sm w-24" v-model="state.onceDate.month">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select class="select select-bordered select-sm w-24" v-model="state.onceDate.day">
              <option v-for="d in daysInOnceMonth" :key="d" :value="d">{{ d }}日</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium w-20">执行时间:</span>
          <div class="flex items-center gap-1">
            <select v-model="state.time.hour" class="select select-bordered select-sm w-18">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ padZero(h-1) }}时</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.minute" class="select select-bordered select-sm w-18">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ padZero(m-1) }}分</option>
            </select>
            <span class="text-base-content/50">:</span>
            <select v-model="state.time.second" class="select select-bordered select-sm w-18">
              <option v-for="s in 60" :key="s-1" :value="s-1">{{ padZero(s-1) }}秒</option>
            </select>
          </div>
        </div>
        <div class="text-xs text-base-content/70">
          <p>提示：指定时间任务仅执行一次，保存后后台会通过 Date 格式解析并调度。</p>
        </div>
      </div>

      <!-- 自定义配置 -->
      <div v-if="tab === 'custom'" class="space-y-2">
        <input 
          type="text" 
          v-model="customCron" 
          class="input input-bordered w-full font-mono text-sm" 
          placeholder="例如: 0 0 10 * * *" 
          @input="onCustomInput"
        />
        <div class="text-xs text-base-content/70 space-y-1">
          <p>格式支持: <code>[秒] [分] [时] [日] [月] [周]</code></p>
          <p>参考: <code>0 30 10 * * 1-5</code> (周一到周五上午10:30执行)</p>
          <p><code>node-schedule</code> 支持秒级精度 (6位) 或标准分级精度 (5位)。</p>
        </div>
      </div>
    </div>

    <!-- 预览区 -->
    <div class="bg-base-300/30 p-3 px-4 border-t border-base-300 flex justify-between items-center">
      <span class="text-sm font-medium text-base-content/70">生成的表达式:</span>
      <code class="font-mono text-primary font-bold bg-base-100 px-2 py-1 rounded">{{ generatedCron }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

type TabType = 'day' | 'week' | 'month' | 'year' | 'once' | 'custom';
const tab = ref<TabType>('day');

const currentYear = new Date().getFullYear();

const state = reactive({
  time: { hour: 0, minute: 0, second: 0 },
  weeks: [] as number[],
  months: [] as number[],
  yearMonth: 1,
  yearDay: 1,
  onceDate: {
    year: currentYear,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  }
});

const customCron = ref('0 0 0 * * *');

const weekDays = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 },
];

const padZero = (num: number) => num.toString().padStart(2, '0');

// 根据选择的月份计算天数
const daysInYearMonth = computed(() => {
  const m = state.yearMonth;
  if ([4, 6, 9, 11].includes(m)) return 30;
  if (m === 2) return 29; // 闰年29天，简化处理让用户可选29
  return 31;
});

// 监听月份变化，防止选到不存在的日期（如2月30日）
watch(() => state.yearMonth, () => {
  const maxDays = daysInYearMonth.value;
  if (state.yearDay > maxDays) {
    state.yearDay = maxDays;
  }
});

// 根据选择的指定日期月份计算天数
const daysInOnceMonth = computed(() => {
  const y = state.onceDate.year;
  const m = state.onceDate.month;
  if ([4, 6, 9, 11].includes(m)) return 30;
  if (m === 2) {
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return isLeap ? 29 : 28;
  }
  return 31;
});

// 监听指定日期的年月变化
watch([() => state.onceDate.year, () => state.onceDate.month], () => {
  const maxDays = daysInOnceMonth.value;
  if (state.onceDate.day > maxDays) {
    state.onceDate.day = maxDays;
  }
});

const toggleWeek = (val: number) => {
  const idx = state.weeks.indexOf(val);
  if (idx > -1) {
    state.weeks.splice(idx, 1);
  } else {
    state.weeks.push(val);
    state.weeks.sort(); // 保持有序
  }
};

const toggleMonthDay = (val: number) => {
  const idx = state.months.indexOf(val);
  if (idx > -1) {
    state.months.splice(idx, 1);
  } else {
    state.months.push(val);
    state.months.sort((a, b) => a - b);
  }
};

const generatedCron = computed(() => {
  if (tab.value === 'custom') {
    return customCron.value;
  }

  const { hour, minute, second } = state.time;
  
  if (tab.value === 'day') {
    return `${second} ${minute} ${hour} * * *`;
  }
  
  if (tab.value === 'week') {
    const w = state.weeks.length > 0 ? state.weeks.join(',') : '*';
    return `${second} ${minute} ${hour} * * ${w}`;
  }
  
  if (tab.value === 'month') {
    const d = state.months.length > 0 ? state.months.join(',') : '*';
    return `${second} ${minute} ${hour} ${d} * *`;
  }
  
  if (tab.value === 'year') {
    return `${second} ${minute} ${hour} ${state.yearDay} ${state.yearMonth} *`;
  }
  
  if (tab.value === 'once') {
    const d = new Date(
      state.onceDate.year,
      state.onceDate.month - 1,
      state.onceDate.day,
      hour,
      minute,
      second
    );
    // 生成 ISO 字符串，但使用本地时间，node-schedule 会兼容处理 Date 字符串
    return d.toISOString();
  }

  return '0 0 0 * * *';
});

// 内部更新标志，避免死循环
let isUpdatingFromProps = false;

watch(generatedCron, (val) => {
  if (!isUpdatingFromProps && val !== props.modelValue) {
    emit('update:modelValue', val);
  }
});

watch(() => props.modelValue, (val) => {
  if (val !== generatedCron.value) {
    isUpdatingFromProps = true;
    parseCron(val);
    // 延迟恢复标志，等待 computed 重新计算完成
    setTimeout(() => {
      isUpdatingFromProps = false;
    }, 0);
  }
}, { immediate: true });

const setTab = (t: TabType) => {
  tab.value = t;
};

const onCustomInput = () => {
  if (!isUpdatingFromProps) {
    emit('update:modelValue', customCron.value);
  }
};

// 简单反解析
function parseCron(cron: string) {
  if (!cron) {
    tab.value = 'day';
    return;
  }

  // 判断是否是 Date ISO 字符串格式（一次性任务）
  if (cron.includes('T') && cron.includes('Z')) {
    const d = new Date(cron);
    if (!isNaN(d.getTime())) {
      tab.value = 'once';
      state.onceDate.year = d.getFullYear();
      state.onceDate.month = d.getMonth() + 1;
      state.onceDate.day = d.getDate();
      state.time.hour = d.getHours();
      state.time.minute = d.getMinutes();
      state.time.second = d.getSeconds();
      return;
    }
  }

  const parts = cron.trim().split(/\s+/);
  // 只解析 5 位或 6 位的标准格式，否则直接 fallback 到 custom
  if (parts.length !== 5 && parts.length !== 6) {
    tab.value = 'custom';
    customCron.value = cron;
    return;
  }

  let sec = '0', min = '0', hour = '0', dom = '*', mon = '*', dow = '*';
  if (parts.length === 5) {
    [min, hour, dom, mon, dow] = parts;
  } else {
    [sec, min, hour, dom, mon, dow] = parts;
  }

  const isNum = (s: string) => /^\d+$/.test(s);
  if (!isNum(sec) || !isNum(min) || !isNum(hour)) {
    tab.value = 'custom';
    customCron.value = cron;
    return;
  }

  state.time.second = parseInt(sec, 10);
  state.time.minute = parseInt(min, 10);
  state.time.hour = parseInt(hour, 10);

  // 判断所属 tab
  if (dom === '*' && mon === '*' && dow === '*') {
    tab.value = 'day';
  } else if (dom === '*' && mon === '*' && dow !== '*' && /^[\d,]+$/.test(dow)) {
    tab.value = 'week';
    state.weeks = dow.split(',').map(Number);
  } else if (dom !== '*' && mon === '*' && dow === '*' && /^[\d,]+$/.test(dom)) {
    tab.value = 'month';
    state.months = dom.split(',').map(Number);
  } else if (dom !== '*' && mon !== '*' && dow === '*' && isNum(dom) && isNum(mon)) {
    tab.value = 'year';
    state.yearDay = parseInt(dom, 10);
    state.yearMonth = parseInt(mon, 10);
  } else {
    tab.value = 'custom';
    customCron.value = cron;
  }
}
</script>

<style scoped>
/* 可选：去掉原生 select 的箭头或调整样式 */
</style>
