import { eventBus } from '../core/eventbus'

export default {
  template: `<div class="refresher-user" :data-me="me" v-on:click="clickHandle" :class="{cursor: !!this.user.id}" v-on:contextmenu="contextMenu" :title="title">
    <div class="refresher-user-content">
      <span class="refresher-user-icon" :data-icon="user.icon" :data-type="user.type"></span>
      <span class="refresher-user-nick">{{user.nick}}</span>
      <span class="refresher-user-info">{{userInfo}}</span>
    </div>
  </div>`,
  props: {
    user: {
      type: Object,
      required: true
    },

    me: {
      type: Boolean,
      required: false
    },

    click: {
      type: Function
    }
  },
  computed: {
    title (): string {
      return (this.user.id
        ? '(' + this.user.id + ')'
        : this.user.ip
          ? '(' +
          this.user.ip +
          (this.user.ip_data ? ', ' + this.user.ip_data : '') +
          ')'
          : ''
      )
        .replace('\\n', ' ')
        .replace(/  +/g, ' ')
    },

    userInfo (): string {
      return this.user.id
        ? '(' + this.user.id + ')'
        : this.user.ip
          ? '(' +
          this.user.ip +
          (this.user.ip_data
            ? ', ' +
              (this.user.ip_data.length > 100
                ? this.user.ip_data.substring(0, 97) + '...'
                : this.user.ip_data)
            : '') +
          ')'
          : ''
    }
  },
  methods: {
    openLink (url: string): void {
      window.open(url, '_blank')
    },

    clickHandle (): void {
      if (typeof this.click === 'function') {
        return this.click(this.user)
      }

      if (this.user.id) {
        this.openLink('https://gallog.dcinside.com/' + this.user.id)
      }
    },

    contextMenu (): void {
      eventBus.emit(
        'RefresherAddToBlock',
        this.user.nick,
        this.user.id,
        this.user.ip
      )
    }
  }
}
