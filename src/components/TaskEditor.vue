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
        label="Назад"
        no-caps
        :disable="disablePrevPageBtn"
        @click="prevPage"
      />
      <q-btn
        label="Вперед"
        no-caps
        :disable="disableNextPageBtn"
        @click="nextPage"
      />
    </div>
    <div
      class="row q-gutter-x-md"
    >
      <q-btn
        label="Цвет"
        no-caps
        @click="showColorPicker = true"
      />
      <q-btn
        label="Отмена"
        no-caps
        @click="undo"
      />
      <div
        style="display:flex; align-items: center;"
      >
        Ширина линии
      </div>
      <q-slider
        v-model="currentWidthOfLine"
        :min="1"
        :max="5"
        style="width: 100px;margin-right: 10px"
      />
    </div>
    <q-btn
      label="Условия"
      no-caps
      @click="showProblem = true"
    />
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
  <!-- Планировался спинер на загрузку страницы, но событие не работает
  <q-spinner-tail
    v-show="pageLoading"
    size="2em"
    color="primary"
  /> -->
  <svg
    id="svg"
    @mouseup="onMouseUp"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    class="editor-page a4-size-with-border"
  >
    <image
      :href="imagePaths[currentPage]"
      height="1224px"
      width="794px"
    />
    <polyline
      v-for="(pointsForPolyline, index) in polylineArrayOnPages[currentPage]"
      :key="index"
      :points="pointsForPolyline.points"
      :stroke="pointsForPolyline.color"
      fill="none"
      :stroke-width="pointsForPolyline.width"
    />
  </svg>
  <q-dialog
    v-model="showProblem"
  >
    <q-pdfviewer
      v-model="showProblem"
      :src="problemPath"
    >
    </q-pdfviewer>
  </q-dialog>
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
        this.polylineArrayOnPages[this.currentPage].push({
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
        Vue.set(this.polylineArrayOnPages[this.currentPage][this.polylineArrayOnPages[this.currentPage].length - 1], 'points',
          this.polylineArrayOnPages[this.currentPage][this.polylineArrayOnPages[this.currentPage].length - 1].points + ' ' + (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString())
      }
    },
    onMouseMove (event) {
      if (this.mousePressed) {
        const offset = document.getElementById('svg').getBoundingClientRect()
        Vue.set(this.polylineArrayOnPages[this.currentPage][this.polylineArrayOnPages[this.currentPage].length - 1], 'points',
          this.polylineArrayOnPages[this.currentPage][this.polylineArrayOnPages[this.currentPage].length - 1].points + ' ' + (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString())
      }
    },
    undo () {
      this.polylineArrayOnPages[this.currentPage].pop()
    }
  },
  mounted () {
    this.disablePrevPageBtn = true
    this.disableNextPageBtn = this.imagePaths.length === 1
    for (let i = 0; i < this.imagePaths.length; i++) {
      this.polylineArrayOnPages.push([])
    }
  }
}
</script>

<style scoped>

</style>
