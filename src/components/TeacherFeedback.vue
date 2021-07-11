<template>
<div
  class="column no-wrap  teacher-feedback"
>
  <div
    class="text-h6"
  >
    Отзыв
  </div>
  <div
    class="row q-gutter-x-sm"
  >
    <div
      class="teacher-feedback-titles"
    >
      Степень решенности:
    </div>
    <div
      class="teacher-feedback-data"
    >
      {{ decisionStage }}
    </div>
  </div>
  <div
    class="row q-gutter-x-sm"
  >
    <div
      class="teacher-feedback-titles"
    >
      Время проверки:
    </div>
    <div
      v-if="pathToProvenSolution !== '-'"
      class="teacher-feedback-data"
    >
      {{ localeCheckDate }}
    </div>
    <div
      v-else
      class="teacher-feedback-data"
    >
      -
    </div>
  </div>
  <div class="row q-gutter-x-sm">
    <div
      class="teacher-feedback-titles"
    >
      Проверенное решение:
    </div>
    <a
      v-if="pathToProvenSolution !== '-'"
      class="teacher-feedback-data" :href="pathToProvenSolution"
    >
      {{ fileName }}
    </a>
    <div
      v-else
      class="teacher-feedback-data"
    >
      -
    </div>
  </div>
  <div class="row q-gutter-x-sm no-wrap">
    <div
      class="teacher-feedback-titles"
    >
      Комментарий:
    </div>
    <div
      class="teacher-feedback-data"
    >
      {{ teacherCommentary }}
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'TeacherFeedback',
  props: {
    decisionStage: {
      type: String,
      default: '-'
    },
    checkDate: {
      type: Date,
      default: function () {
        return new Date(2000, 1, 1)
      }
    },
    pathToProvenSolution: {
      type: String,
      default: '-'
    },
    teacherCommentary: {
      type: String,
      default: '-'
    }
  },
  computed: {
    localeCheckDate () {
      return this.checkDate.toLocaleDateString() + ' ' + this.checkDate.toLocaleTimeString()
    },
    fileName () {
      return this.pathToProvenSolution.substr(this.pathToProvenSolution.lastIndexOf('/') + 1)
    }
  }
}
</script>

<style scoped>

</style>
