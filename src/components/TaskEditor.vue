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
        label="Prev page"
        :disable="disablePrevPageBtn"
        @click="prevPage"
      />
      <q-btn
        label="Next page"
        :disable="disableNextPageBtn"
        @click="nextPage"
      />
    </div>
    <div
      class="row q-gutter-x-md"
    >
      <q-btn
        label="Color"
        @click="showColorPicker = true"
      />
      <q-btn
        label="Undo"
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
      label="Show task"
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
  <svg
    id="svg"
    @mouseup="onMouseUp"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    class="editor-page a4-size-with-border"
  >
    <image
      :href="imagePaths[currentPage]"
      class="a4-size"
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
    class="task-condition-dialog"
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
      default: 'pdfExample/OS1.pdf'
    },
    imagePaths: {
      type: Array,
      default: () => ['imagesExamples/OS1-01.png', 'imagesExamples/OS1-02.png', 'imagesExamples/OS1-03.png']
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
      handler: function (val, oldVal) {
        if (val) {
          const resultB64Array = []
          const backgroundImages = []
          const SVGImages = []
          const canvases = []
          const contexts = []
          this.currentPage = 0
          for (let i = 0; i < this.imagePaths.length; i++) {
            const svgElement = document.getElementById('svg')
            const s = new XMLSerializer().serializeToString(svgElement)
            const svgStyle = window.getComputedStyle(svgElement)
            const encodeSVG = 'data:image/svg+xml;base64, ' + window.btoa(s)
            canvases.push(document.createElement('canvas'))
            const height = parseInt(svgStyle.getPropertyValue('height')) - 2 // Исключая размер границы элемента
            const width = parseInt(svgStyle.getPropertyValue('width')) - 2 // Исключая размер границы элемента
            console.log(width, height)
            canvases[i].height = height
            canvases[i].width = width
            console.log(canvases[i].height)
            contexts[i] = canvases[i].getContext('2d')
            backgroundImages.push(new Image(width, height))
            backgroundImages[i].onload = () => {
              contexts[i].drawImage(backgroundImages[i], 0, 0)
              SVGImages.push(new Image(width, height))
              SVGImages[i].onload = () => {
                contexts[i].drawImage(SVGImages[i], 0, 0)
                console.log(canvases[i].height)
                resultB64Array.push(canvases[i].toDataURL('image/png'))
                this.imageTransformationCounter++
                if (this.imageTransformationCounter === this.imagePaths.length) {
                  this.$emit('returndata', resultB64Array)
                }
              }
              SVGImages[i].src = encodeSVG
            }
            backgroundImages[i].src = this.imagePaths[i]
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
