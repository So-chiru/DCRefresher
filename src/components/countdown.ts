const s = 1000
const m = s * 60
const h = m * 60
const d = h * 24
const w = d * 7
const y = d * 365.25

const timeCounts = [y, w, d, h, m, s]
const timeFilters = ['년', '주', '일', '시간', '분', '초']

const convertTime = (date: Date) => {
  const estimate = date.getTime() - Date.now()

  if (estimate < 3000) {
    return '잠시 후'
  }

  const abs = Math.abs(estimate)
  for (let f = 0; f < timeCounts.length; f++) {
    if (abs >= timeCounts[f]) {
      return Math.round(estimate / timeCounts[f]) + timeFilters[f] + ' 후'
    }
  }

  return '이미 삭제 됨'
}

interface CountdownVueData {
  mode: number
  stamp: string
}
interface CountdownVue extends CountdownVueData {
  date: Date
  updates: number
}

export default {
  template: `<div class="refresher-countdown" v-on:click="this.$root.changeStamp" :title="locale">
    <transition name="refresher-opacity">
      <span :key="'stamp' + this.$root.stampMode">삭제 : {{this.$root.stampMode ? locale : stamp}}</span>
    </transition>
  </div>`,
  props: {
    date: {
      type: Date,
      required: true
    }
  },
  data: (): CountdownVueData => {
    return {
      mode: 0,
      stamp: ''
    }
  },
  computed: {
    locale (this: CountdownVue): string {
      return this.date.toLocaleString()
    }
  },
  mounted (this: CountdownVue): void {
    this.stamp = convertTime(this.date)

    this.updates = window.setInterval(() => {
      this.stamp = convertTime(this.date)
    }, 5000)
  },

  beforeUnload (this: CountdownVue): void {
    clearInterval(this.updates)
  }
}
