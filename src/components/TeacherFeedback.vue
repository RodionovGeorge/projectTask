<template>
<div class="column no-wrap" style="width: 850px; padding: 0 10px 10px 10px;">
  <div class="text-h6">Отзыв</div>
  <div class="row">
    <div style="width:250px; display:flex; align-items: center;">Степень решенности</div>
    <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">{{decisionStage}}</div>
    <div style="width:250px; display:flex; align-items: center;">Время проверки</div>
    <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">{{localeCheckDate}}</div>
    <div style="width:250px; display:flex; align-items: center;">Проверенное решение</div>
    <a style="width:578px; display:flex; align-items: center; overflow-wrap: normal" :href="pathToProvenSolution">{{fileName}}</a>
    <div style="width:250px; display:flex; align-items: center;">Комментарий</div>
    <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">{{teacherCommentary}}</div>
  </div>
</div>
</template>

<script>
export default {
  name: 'TeacherFeedback',
  props: {
    decisionStage: {
      type: String,
      default: 'Пока не решена'
    },
    checkDate: {
      type: Date,
      default: function () {
        return new Date(2000, 1, 1)
      }
    },
    pathToProvenSolution: {
      type: String,
      default: 'pdfExample/OS1.pdf'
    },
    teacherCommentary: {
      type: String,
      default: 'Комментарий'
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
