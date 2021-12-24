<template>
<div
  class="column no-wrap"
>
  <div
    class="row bg-white editor-toolbar"
  >
    <div
      class="row q-gutter-x-md"
    >
      <q-btn
        icon="bi-arrow-left-short"
        flat
        :disable="disablePrevPageBtn || imageLoading"
        @click="prevPage"
      >
        <q-tooltip
          :delay="800"
          v-if="!disablePrevPageBtn"
        >
          Предыдущая страница решения
        </q-tooltip>
      </q-btn>
      <div
        class="column justify-center justify-content"
      >
        {{ currentPage + 1 }} / {{ imagePaths.length }}
      </div>
      <q-btn
        icon="bi-arrow-right-short"
        flat
        :disable="disableNextPageBtn || imageLoading"
        @click="nextPage"
      >
        <q-tooltip
          :delay="800"
          v-if="!disableNextPageBtn"
        >
          Следующая страница решения
        </q-tooltip>
      </q-btn>
    </div>
    <div
      class="row q-gutter-x-md"
    >
      <q-btn
        icon="bi-palette"
        :disable="imageLoading"
        flat
        @click="showColorPicker = true"
      >
        <q-tooltip
          :delay="800"
        >
          Выбрать цвет для рисования
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="bi-eraser"
        :flat="!eraserChosen"
        :outline="eraserChosen"
        :disable="imageLoading"
        @click="eraserChosen = !eraserChosen"
      >
        <q-tooltip
          :delay="800"
        >
          Ластик
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="bi-arrow-90deg-left"
        :disable="imageLoading"
        flat
        no-caps
        @click="undo"
      >
        <q-tooltip
          :delay="800"
        >
          Отменить последнее действие
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="bi-border-width"
        :disable="imageLoading"
        flat
      >
        <q-tooltip
          :delay="800"
        >
          Ширина линии
        </q-tooltip>
        <q-menu
          anchor="bottom middle"
          self="top middle"
        >
          <q-list
            style="width: 100px"
          >
            <q-item
              v-for="i in 5"
              :key="i"
              clickable
              v-close-popup
              :class="currentWidthOfLine === i ? 'width-menu-active-element' : ''"
              @click="currentWidthOfLine = i"
              class="column justify-center content-center q-pa-sm"
            >
              <svg
                :height="i + 'px'"
                width="84px"
              >
                <polyline
                  :points="'0,' + i / 2 + ' 79, ' + i / 2"
                  fill="none"
                  :stroke-width="i + 'px'"
                  :stroke="currentColor"
                />
              </svg>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <q-btn
      v-if="!conditionShowFlag"
      icon="bi-journal-text"
      flat
      @click="onShowProblemClick"
    >
      <q-tooltip
        :delay="800"
      >
        Показать условия задачи
      </q-tooltip>
    </q-btn>
    <q-btn
      v-else
      @click="onHideProblemClick"
      icon="bi-x"
      flat
    >
      <q-tooltip
        :delay="800"
      >
        Скрыть условия задачи
      </q-tooltip>
    </q-btn>
    <q-dialog
      v-model="showColorPicker"
    >
      <q-color
        format-model="rgb"
        default-value="#FF0000"
        v-model="currentColor"
      />
    </q-dialog>
  </div>
  <div
    v-show="imageLoading"
    style="width: 794px; height: 1224px;"
    class="column justify-center items-center"
  >
    <LoadingSpinner
      :loading="imageLoading"
    />
  </div>
  <div
    class="stack"
    v-show="!imageLoading"
  >
    <canvas
      id="background-canvas"
      width="794"
      height="1224"
    ></canvas>
    <canvas
      id="editor-canvas"
      class="cursor-style"
      width="794"
      height="1224"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseout="onMouseOut"
      @mouseup="onMouseUp"
    >
    </canvas>
  </div>
</div>
</template>
<script>
import LoadingSpinner from 'components/LoadingSpinner'
export default {
  name: 'TaskEditor',
  components: { LoadingSpinner },
  props: {
    problemPath: {
      type: String,
      required: true
    },
    imagePaths: {
      type: Array,
      required: true
    },
    conditionShowFlag: {
      type: Boolean,
      default: false
    },
    returnImagesFlag: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data () {
    return {
      mousePressed: false,
      imageLoading: false,
      eraserChosen: false,
      showColorPicker: false,
      currentColor: 'rgb(255,0,0)',
      currentWidthOfLine: 1,
      polylineArrayOnPages: [],
      currentPage: 0,
      editorCtx: null,
      disablePrevPageBtn: false,
      disableNextPageBtn: false,
      showProblem: false,
      imageTransformationCounter: 0
    }
  },
  watch: {
    returnImagesFlag: {
      handler: async function (val, oldVal) {
        if (val) {
          this.$emit('loadingOn')
          this.imageLoading = true
          this.$nextTick()
          const resultB64Array = new Array(this.imagePaths.length)
          for (let i = 0; i < this.imagePaths.length; i++) {
            this.currentPage = i
            const b = document.createElement('canvas')
            b.height = 1224
            b.width = 794
            const e = document.createElement('canvas')
            e.height = 1224
            e.width = 794
            const bCtx = b.getContext('2d')
            const eCtx = e.getContext('2d')
            const img = new Image(794, 1224)
            img.onload = () => {
              bCtx.drawImage(img, 0, 0)
              this.redraw(eCtx, i)
              bCtx.drawImage(e, 0, 0)
              resultB64Array[i] = b.toDataURL('image/png').replace('data:image/png;base64,', '')
              this.imageTransformationCounter++
              if (this.imageTransformationCounter === this.imagePaths.length) {
                this.$emit('returndata', resultB64Array)
              }
            }
            img.src = this.imagePaths[i]
          }
        }
      }
    }
  },
  methods: {
    onShowProblemClick () {
      this.$emit('showProblem')
    },
    onHideProblemClick () {
      this.$emit('hideProblem')
    },
    nextPage () {
      this.imageLoading = true
      this.currentPage = this.currentPage + 1
      const ctx = document.getElementById('background-canvas').getContext('2d')
      const img = new Image(794, 1224)
      this.disablePrevPageBtn = false
      if (this.currentPage === this.imagePaths.length - 1) {
        this.disableNextPageBtn = true
      }
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        this.redraw(this.editorCtx, this.currentPage)
        this.imageLoading = false
      }
      img.src = this.imagePaths[this.currentPage]
    },
    prevPage () {
      this.imageLoading = true
      this.currentPage = this.currentPage - 1
      const ctx = document.getElementById('background-canvas').getContext('2d')
      const img = new Image(794, 1224)
      this.disableNextPageBtn = false
      if (this.currentPage === 0) {
        this.disablePrevPageBtn = true
      }
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        this.redraw(this.editorCtx, this.currentPage)
        this.imageLoading = false
      }
      img.src = this.imagePaths[this.currentPage]
    },
    redraw (ctx, pageNumber) {
      let xc, yc, j
      ctx.clearRect(0, 0, 794, 1224)
      for (let i = 0; i < this.polylineArrayOnPages[pageNumber].length; i++) {
        ctx.beginPath()
        ctx.lineWidth = this.polylineArrayOnPages[pageNumber][i].width
        ctx.strokeStyle = this.polylineArrayOnPages[pageNumber][i].color
        ctx.globalCompositeOperation = this.polylineArrayOnPages[pageNumber][i].globalCompositeOperation
        ctx.moveTo(this.polylineArrayOnPages[pageNumber][i].points[0].x, this.polylineArrayOnPages[pageNumber][i].points[0].y)
        for (j = 1; j < this.polylineArrayOnPages[pageNumber][i].points.length - 2; j++) {
          xc = (this.polylineArrayOnPages[pageNumber][i].points[j].x + this.polylineArrayOnPages[pageNumber][i].points[j + 1].x) / 2
          yc = (this.polylineArrayOnPages[pageNumber][i].points[j].y + this.polylineArrayOnPages[pageNumber][i].points[j + 1].y) / 2
          ctx.quadraticCurveTo(this.polylineArrayOnPages[pageNumber][i].points[j].x, this.polylineArrayOnPages[pageNumber][i].points[j].y, xc, yc)
        }
        if (this.polylineArrayOnPages[pageNumber][i].points.length >= 3) {
          ctx.quadraticCurveTo(
            this.polylineArrayOnPages[pageNumber][i].points[j].x,
            this.polylineArrayOnPages[pageNumber][i].points[j].y,
            this.polylineArrayOnPages[pageNumber][i].points[j + 1].x,
            this.polylineArrayOnPages[pageNumber][i].points[j + 1].y
          )
        }
        ctx.stroke()
      }
    },
    onMouseDown (event) {
      if (!this.mousePressed) {
        const offset = document.getElementById('editor-canvas').getBoundingClientRect()
        this.mousePressed = true
        this.polylineArrayOnPages[this.currentPage].push({
          points: [{ x: event.x - offset.x, y: event.y - offset.y }],
          color: this.currentColor,
          width: this.eraserChosen ? 10 : this.currentWidthOfLine,
          globalCompositeOperation: this.eraserChosen ? 'destination-out' : 'source-over'
        })
        this.redraw(this.editorCtx, this.currentPage)
      }
    },
    onMouseUp (event) {
      if (this.mousePressed) {
        const offset = document.getElementById('editor-canvas').getBoundingClientRect()
        this.mousePressed = false
        this.polylineArrayOnPages[this.currentPage].at(-1).points.push({
          x: event.x - offset.x,
          y: event.y - offset.y
        })
        this.redraw(this.editorCtx, this.currentPage)
      }
    },
    onMouseMove (event) {
      if (this.mousePressed) {
        const offset = document.getElementById('editor-canvas').getBoundingClientRect()
        this.polylineArrayOnPages[this.currentPage].at(-1).points.push({
          x: event.x - offset.x,
          y: event.y - offset.y
        })
        this.redraw(this.editorCtx, this.currentPage)
      }
    },
    onMouseOut (event) {
      this.mousePressed = false
    },
    undo () {
      this.polylineArrayOnPages[this.currentPage].pop()
      this.redraw(this.editorCtx, this.currentPage)
    }
  },
  mounted () {
    this.imageLoading = true
    this.disablePrevPageBtn = true
    this.disableNextPageBtn = this.imagePaths.length === 1
    const ctx = document.getElementById('background-canvas').getContext('2d')
    this.editorCtx = document.getElementById('editor-canvas').getContext('2d')
    const img = new Image(794, 1224)
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      this.imageLoading = false
    }
    img.src = this.imagePaths[this.currentPage]
    for (let i = 0; i < this.imagePaths.length; i++) {
      this.polylineArrayOnPages.push([])
    }
  }
}
</script>

<style scoped>

</style>
