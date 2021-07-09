<template>
<div
  class="column no-wrap"
>
  <div
    class="row bg-white"
    style="display: flex; justify-content: space-between; width: 850px; margin: 0 0 10px 0; position: sticky; top:55px"
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
    id="canvas"
    @mouseup="onMouseUp"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    :width="width"
    :height="height"
    style="border: 1px solid black"
  >
    <image
      :href="imagePaths[currentPage]"
      :height="height"
      :width="width"
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
      default: 'pdfExample/OS1.pdf'
    },
    imagePaths: {
      type: Array,
      default: () => ['imagesExamples/OS1-01.png', 'imagesExamples/OS1-02.png', 'imagesExamples/OS1-03.png']
    }
  },
  data () {
    return {
      width: 850,
      height: 1221,
      mousePressed: false,
      showColorPicker: false,
      currentColor: 'rgb(255,0,0)',
      currentWidthOfLine: 1,
      polylineArrayOnPages: [],
      currentPage: 0,
      disablePrevPageBtn: false,
      disableNextPageBtn: false,
      showProblem: false
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
      const offset = document.getElementById('canvas').getBoundingClientRect()
      this.mousePressed = true
      this.polylineArrayOnPages[this.currentPage].push({ points: (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString(), color: this.currentColor, width: this.currentWidthOfLine })
    },
    onMouseUp (event) {
      if (this.mousePressed === true) {
        const offset = document.getElementById('canvas').getBoundingClientRect()
        this.mousePressed = false
        Vue.set(this.polylineArrayOnPages[this.currentPage][this.polylineArrayOnPages[this.currentPage].length - 1], 'points',
          this.polylineArrayOnPages[this.currentPage][this.polylineArrayOnPages[this.currentPage].length - 1].points + ' ' + (event.x - offset.x).toString() + ', ' + (event.y - offset.y).toString())
      }
    },
    onMouseMove (event) {
      if (this.mousePressed === true) {
        const offset = document.getElementById('canvas').getBoundingClientRect()
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
