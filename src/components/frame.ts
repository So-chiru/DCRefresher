import Vue from 'vue'

import TimeStamp from './timestamp'
import CountDown from './countdown'
import PreviewButton from './button'
import User from './user'
import Comment from './comment'
import WriteComment from './write_comment'
import Icon from './icon'

export const Loader = Vue.component('refresher-loader', {
  template: `<transition name="refresher-opacity">
    <div class="refresher-loader spinner gray animating">
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
    </div>
  </transition>`
})

export const Frame = Vue.component('refresher-frame', {
  components: {
    PreviewButton,
    TimeStamp,
    CountDown,
    User,
    Comment,
    WriteComment,
    Icon
  },
  template: `<div class="refresher-frame" :class="{relative: frame.options.relative, blur: frame.options.blur, preview: frame.options.preview, center: frame.options.center}">
      <div class="refresher-preview-info" v-if="!frame.error">
        <div class="refresher-preview-title-zone">
          <div :class="{'refresher-preview-title-text':true, 'refresher-title-post':frame.data.buttons}">
            <transition name="refresher-slide-up" appear @before-enter="beforeEnter" @after-enter="afterEnter">
              <div class="refresher-preview-title" v-html="frame.title" :data-index="index + 1" :key="frame.title"></div>
            </transition>
            <transition name="refresher-slide-up" appear @before-enter="beforeEnter" @after-enter="afterEnter">
              <span class="refresher-preview-title-mute" v-html="frame.subtitle"></span>
            </transition>
          </div>
          <div v-if="frame.data.comments" class="refresher-comment-controls-container">
            <!--<PreviewButton :id="'write'" :text="'댓글 쓰기'" :click="toCommentWrite" class="refresher-comment-controls">
            </PreviewButton>-->
            <PreviewButton :id="'refresh'" :text="'새로고침'" :click="refresh" class="refresher-comment-controls">
            </PreviewButton>
          </div>
        </div>
        <div class="refresher-preview-meta">
          <User v-if="frame.data.user" :user="frame.data.user"></User>
          <div class="float-right">
            <TimeStamp v-if="frame.data.date" :date="frame.data.date"></TimeStamp>
            <CountDown v-if="frame.data.expire" :date="frame.data.expire"></CountDown>
          </div>
        </div>
      </div>
      <div class="refresher-preview-contents" v-if="!frame.error">
        <refresher-loader v-show="frame.data.load"></refresher-loader>
        <transition name="refresher-opacity">
          <div class="refresher-preview-contents-actual" v-html="frame.contents" :key="frame.contents"></div>
        </transition>

        <div class="refresher-preview-comments" v-if="frame.data.comments && frame.data.comments.comments">
          <transition-group name="refresher-slide-up" appear @before-enter="beforeEnter" @after-enter="afterEnter">
            <Comment v-for="(comment, i) in frame.data.comments.comments" :index="i + 1" :postUser="frame.data.postUserId" :comment="comment" :key="'cmt_' + comment.no"></Comment>
          </transition-group>
        </div>
        <div v-if="frame.data.comments && !frame.data.comments.comments">
          <div class="refresher-nocomment-wrap">
            <img src="https://dcimg5.dcinside.com/dccon.php?no=62b5df2be09d3ca567b1c5bc12d46b394aa3b1058c6e4d0ca41648b65ceb246e13df9546348593b9b03553cb2b363e94da0bda2f33af133d69a3e3bd02836ad0aeef62ce"></img>
            <h3>댓글이 없습니다.</h3>
          </div>
          <br/>
        </div>
        <div v-if="frame.data.comments">
          <!--<WriteComment :func="writeComment"></WriteComment>-->
        </div>
      </div>
      <div class="refresher-preview-contents refresher-error" v-if="frame.error">
        <h3>{{frame.error.title}}을 불러올 수 없습니다.</h3>
        <br>
        <p>가능한 경우:</p>
        <ul v-if="frame.error.detail.indexOf('50') > -1">
          <li>서버가 불안정합니다. 페이지를 다시 고쳐보세요.</li>
          <li>서버 구조 변경으로 인한 내용 해석 실패. 지속될 경우 개발자에게 문의하세요.</li>
          <li>네트워크 방화벽에 의해 차단되지는 않았는지 확인해보세요.</li>
        </ul>
        <ul v-else-if="frame.error.detail.indexOf('40') > -1">
          <li>게시글이 이미 삭제됨</li>
          <li>게시글이 없음</li>
          <li>서버 구조 변경으로 인한 잘못된 값으로 요청. 지속될 경우 개발자에게 문의하세요.</li>
        </ul>
        <ul v-else-if="frame.error.detail.indexOf('Failed to fetch') > -1">
          <li>연결 오류, 서버 오류일 가능성도 있습니다.</li>
          <li>브라우저 오류, 대부분 구현 오류로 확장 프로그램 업데이트가 필요합니다.</li>
          <li>서버 구조 변경으로 인한 잘못된 방식으로 요청. 지속될 경우 개발자에게 문의하세요.</li>
        </ul>
        <ul v-else>
          <li>알 수 없는 오류입니다. 아래 코드를 복사하여 개발자에게 문의해주세요.</li>
        </ul>
        <br>
        <PreviewButton class="refresher-writecomment primary" id="refresh" text="다시 시도" :click="retry"></PreviewButton>
        <br>
        <span class="refresher-mute">{{frame.error.detail}}</span>
      </div>
      <div class="refresher-preview-votes" v-if="frame.data.buttons">
        <div>
          <PreviewButton class="refresher-upvote" :id="'upvote'" :text="frame.upvotes || '0'" :click="upvote">
          </PreviewButton>
          <PreviewButton class="refresher-downvote" :id="'downvote'" :text="frame.downvotes || '0'" :click="downvote">
          </PreviewButton>
          <PreviewButton :id="'newtab'" :text="'원본 보기'" :click="original">
          </PreviewButton>
          <PreviewButton class="refresher-share primary" :id="'share'" :text="'공유'" :click="share">
          </PreviewButton>
        </div>
      </div>
    </div>`,
  props: ['frame', 'index'],
  data: function () {
    return {
      memoText: ''
    }
  },
  methods: {
    beforeEnter (el: HTMLElement) {
      el.style.transitionDelay = 45 * Number(el.dataset.index) + 'ms'
    },

    afterEnter (el: HTMLElement) {
      el.style.transitionDelay = ''
    },

    upvote () {
      return this.frame.functions.vote(1)
    },

    downvote () {
      return this.frame.functions.vote(0)
    },

    share () {
      return this.frame.functions.share()
    },

    retry () {
      return this.frame.functions.retry()
    },

    async writeComment (...args: any) {
      let result = false

      if (this.frame.functions.writeComment) {
        result = await this.frame.functions.writeComment(...args)
      }

      this.frame.functions.retry()

      return result
    },

    toCommentWrite () {
      document.getElementById('comment_main').focus()
      return true
    },

    refresh () {
      this.frame.functions.retry()
      return true
    },

    makeVoteRequest () {},

    original () {
      this.frame.functions.openOriginal()
      return true
    }
  }
})

export const Outer = Vue.component('refresher-frame-outer', {
  template: `<div class="refresher-frame-outer" :class="{background: this.$root.background, blur: this.$root.blur, fadeIn: this.$root.fade, fadeOut: !this.$root.fade, stack: this.$root.fade}" >
    <refresher-group></refresher-group>
    <transition name="refresher-prev-post">
      <refresher-scroll side="top" v-show="this.$root.scrollModeTop"></refresher-scroll>
    </transition>
    <transition name="refresher-next-post">
      <refresher-scroll side="bottom" v-show="this.$root.scrollModeBottom"></refresher-scroll>
    </transition>
  </div>`
})

export const Scroll = Vue.component('refresher-scroll', {
  template: `<div class="refresher-scroll" :class="{top: side === 'top'}">
    <div class="center">
      <p>한번 더 스크롤 하면 {{side === 'top' ? '이전' : '다음'}} 게시글을 봅니다.</p> 
    </div>
  </div>`,
  props: {
    side: {
      type: String,
      required: true
    }
  }
})

export const Group = Vue.component('refresher-group', {
  template: `<div class="refresher-group" v-on:click="clickHandle">
      <refresher-frame v-for="(frame, i) in frames" :key="'frame' + Math.random()" :frame="frame" :index="i"></refresher-frame>
    </div>`,
  data () {
    return {
      frames: this.$root.frames
    }
  },
  methods: {
    clickHandle (ev) {
      if (ev.target !== this.$el) return ev
      this.$root.outerClick(ev)
    }
  }
})
