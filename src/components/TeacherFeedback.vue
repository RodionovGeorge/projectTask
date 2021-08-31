<template>
<div
  class="column no-wrap teacher-feedback"
>
  <div
    class="text-h6"
  >
    Отзыв
  </div>
  <table
    class="teacher-feedback-table"
  >
    <tr>
      <td>
        Степень решенности
      </td>
      <td>
        {{decisionStage}}
      </td>
    </tr>
    <tr>
      <td>
        Время проверки:
      </td>
      <td>
        {{checkDate !== '-' ? localeCheckDate : ' '}}
      </td>
    </tr>
    <tr
      style="vertical-align: top"
    >
      <td>
        Комментарий
      </td>
      <td>
        {{teacherCommentary}}
      </td>
    </tr>
    <tr>
      <td>
        Проверенное решение
      </td>
      <td
        v-if="!!problemFileURL"
      >
        <div
          class="q-gutter-x-sm"
        >
          <q-btn
            flat
            icon="bi-box-arrow-in-down"
            @click="fileDownload"
          />
          <q-btn
            flat
            icon="bi-eye"
            @click="showProblem = true"
          />
        </div>
      </td>
      <td
        v-else
      >
        -
      </td>
    </tr>
  </table>
  <q-dialog
    v-model="showProblem"
  >
    <q-pdfviewer
      v-model="showProblem"
      :src="problemFileURL"
    >
    </q-pdfviewer>
  </q-dialog>
</div>
</template>

<script>
export default {
  name: 'TeacherFeedback',
  methods: {
    fileDownload () {
      const a = document.createElement('a')
      a.href = this.problemFileURL
      a.download = '' + this.$route.params.task_id + '.pdf'
      a.click()
    }
  },
  data () {
    return {
      showProblem: false
    }
  },
  props: {
    decisionStage: {
      type: String,
      default: '-'
    },
    checkDate: {
      type: String
    },
    problemFileURL: {
      type: String,
      default: ''
    },
    teacherCommentary: {
      type: String,
      default: '-'
    }
  },
  computed: {
    cCheckDate () {
      return this.checkDate ? new Date(this.checkDate) : null
    },
    localeCheckDate () {
      const x = this.checkDate
      return x
        ? x.getDate() + '/' + ((x.getMonth() + 1) < 10 ? '' + 0 + (x.getMonth() + 1) : (x.getMonth() + 1)) +
          '/' + x.getFullYear() + ' ' + x.getHours() + ':' + x.getMinutes()
        : '-'
    }
  }
}
</script>

<style scoped>

</style>
