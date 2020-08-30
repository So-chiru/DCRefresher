export default {
  template: `
  <img :src="getURL('/assets/icons/' + icon + '.png')"></img>
  `,
  props: {
    icon: {
      type: String,
      required: true
    }
  },
  methods: {
    getURL (u) {
      return chrome.extension.getURL(u)
    }
  }
}
