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
        :disable="disablePrevPageBtn"
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
        :disable="disableNextPageBtn"
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
        flat
      >
        <q-tooltip
          :delay="800"
        >
          Ластик
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="bi-arrow-90deg-left"
        :disable="polylineHistoryOnPages[currentPage].length === 0"
        flat
        no-caps
        @click="undo"
      >
        <q-tooltip
          v-if="polylineHistoryOnPages[currentPage].length !== 0"
          :delay="800"
        >
          Отменить последнее действие
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="bi-border-width"
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
  <svg
    id="svg"
    @mouseup="onMouseUp"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseout="mousePressed = false"
    class="editor-page a4-size-with-border"
  >
    <image
      :href="imagePaths[currentPage]"
      class="cursor-style"
      height="1224px"
      width="794px"
    />
    <polyline
      v-for="(pointsForPolyline, index) in polylineArrayOnPages[currentPage]"
      :key="index"
      :points="pointsForPolyline.points"
      :stroke="pointsForPolyline.color"
      fill="none"
      :stroke-width="pointsForPolyline.width + 'px'"
    />
  </svg>
</div>
</template>
<script>
import Vue from 'vue'
export default {
  name: 'TaskEditor',
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
      showColorPicker: false,
      currentColor: 'rgb(255,0,0)',
      currentWidthOfLine: 1,
      polylineArrayOnPages: [],
      polylineHistoryOnPages: [],
      currentPage: 0,
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
          this.$nextTick()
          const resultB64Array = []
          for (let i = 0; i < this.imagePaths.length; i++) {
            this.currentPage = i
            await this.$nextTick()
            const el = document.getElementById('svg')
            const svgElement = el.cloneNode(true)
            const s = new XMLSerializer().serializeToString(svgElement)
            const svgStyle = window.getComputedStyle(el)
            const encodeSVG = 'data:image/svg+xml;base64, ' + window.btoa(s)
            const canvas = document.createElement('canvas')
            const height = parseInt(svgStyle.getPropertyValue('height')) - 2 // Исключая размер границы элемента
            const width = parseInt(svgStyle.getPropertyValue('width')) - 2 // Исключая размер границы элемента
            canvas.height = height
            canvas.width = width
            const context = canvas.getContext('2d')
            const backgroundImage = new Image(width, height)
            backgroundImage.onload = () => {
              context.drawImage(backgroundImage, 0, 0)
              const SVGImage = new Image(width, height)
              SVGImage.onload = () => {
                context.drawImage(SVGImage, 0, 0)
                resultB64Array[i] = canvas.toDataURL('image/png')
                resultB64Array[i] = resultB64Array[i].substring(resultB64Array[i].indexOf(',') + 1)
                this.imageTransformationCounter++
                if (this.imageTransformationCounter === this.imagePaths.length) {
                  this.$emit('returndata', resultB64Array)
                }
              }
              SVGImage.src = encodeSVG
            }
            backgroundImage.src = this.imagePaths[i]
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
      this.currentPage = this.currentPage + 1
      this.disablePrevPageBtn = false
      if (this.currentPage === this.imagePaths.length - 1) {
        this.disableNextPageBtn = true
      }
    },
    prevPage () {
      this.currentPage = this.currentPage - 1
      this.disableNextPageBtn = false
      if (this.currentPage === 0) {
        this.disablePrevPageBtn = true
      }
    },
    onMouseDown (event) {
      if (!this.mousePressed) {
        const offset = document.getElementById('svg').getBoundingClientRect()
        this.mousePressed = true
        this.polylineHistoryOnPages[this.currentPage].push([].concat(this.polylineArrayOnPages[this.currentPage]))
        this.polylineArrayOnPages[this.currentPage].push({
          // Строка, которая содержит координаты точек
          points: (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString(),
          color: this.currentColor,
          width: this.currentWidthOfLine
        })
      }
    },
    onMouseUp (event) {
      if (this.mousePressed) {
        const offset = document.getElementById('svg').getBoundingClientRect()
        this.mousePressed = false
        Vue.set(this.polylineArrayOnPages[this.currentPage].at(-1), 'points',
          this.polylineArrayOnPages[this.currentPage].at(-1).points + ' ' + (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString())
      }
    },
    onMouseMove (event) {
      if (this.mousePressed) {
        const offset = document.getElementById('svg').getBoundingClientRect()
        // Добавление еще одной точки в строку
        Vue.set(this.polylineArrayOnPages[this.currentPage].at(-1), 'points',
          this.polylineArrayOnPages[this.currentPage].at(-1).points + ' ' + (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString())
      }
    },
    undo () {
      Vue.set(this.polylineArrayOnPages, this.currentPage, this.polylineHistoryOnPages[this.currentPage].at(-1))
      this.polylineHistoryOnPages[this.currentPage].pop()
    }
  },
  created () {
    this.disablePrevPageBtn = true
    this.disableNextPageBtn = this.imagePaths.length === 1
    for (let i = 0; i < this.imagePaths.length; i++) {
      this.polylineArrayOnPages.push([])
      this.polylineHistoryOnPages.push([])
    }
  }
}
</script>

<style scoped>

</style>
