<template>
<div
  class="column no-wrap teacher-feedback"
>
  <div
    class="row"
    style="justify-content: space-between"
  >
    <div
      class="text-h6"
      style="font-weight: 400"
    >
      Отзыв к попытке от {{ localeCheckDate(attemptDate) }}
    </div>
    <q-btn
      v-if="showDeleteButton"
      :loading="deleting"
      icon="bi-trash"
      @click="onDelete"
      flat
      dense
    >
      <template
        v-slot:loading
      >
        <q-spinner
          :thickness="2"
        />
      </template>
      <q-tooltip
        delay="800"
      >
        Удалить отзыв
      </q-tooltip>
    </q-btn>
  </div>
  <table
    class="teacher-feedback-table"
  >
    <tr>
      <td>
        Степень решенности
      </td>
      <td
        style="width: 25%"
      >
        {{decisionStage ? decisionStage : '-'}}
      </td>
      <td>
        Время проверки:
      </td>
      <td
      style="width: 25%"
      >
        {{checkDate !== '-' ? localeCheckDate(checkDate) : '-'}}
      </td>
    </tr>
    <tr
      style="vertical-align: top"
    >
      <td>
        Комментарий
      </td>
      <td>
        <pre>{{teacherCommentary ? teacherCommentary : '-'}}</pre>
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
          >
            <q-tooltip
              delay="800"
            >
              Скачать проверенное решение
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="showEyeButton"
            flat
            icon="bi-eye"
            @click="showProblem = true"
          >
            <q-tooltip
              delay="800"
            >
              Просмотр проверенного решения
            </q-tooltip>
          </q-btn>
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
      a.download = '' + this.$route.params.task_id + 'teacher.pdf'
      a.click()
    },
    onDelete () {
      this.$emit('delete')
    },
    localeCheckDate (date) {
      const x = date ? new Date(date) : null
      let day, month, hour, minute
      if (x) {
        day = x.getDate() < 10 ? '' + 0 + x.getDate() : x.getDate()
        month = (x.getMonth() + 1) < 10 ? '' + 0 + (x.getMonth() + 1) : (x.getMonth() + 1)
        hour = x.getHours() < 10 ? '' + 0 + x.getHours() : x.getHours()
        minute = x.getMinutes() < 10 ? '' + 0 + x.getMinutes() : x.getMinutes()
      }
      return x
        ? day + '.' + month + '.' + x.getFullYear() + ', ' + hour + ':' + minute
        : '-'
    }
  },
  data () {
    return {
      showProblem: false
    }
  },
  props: {
    decisionStage: {
      type: String
    },
    checkDate: {
      type: String
    },
    attemptDate: {
      type: String,
      default: '-'
    },
    problemFileURL: {
      type: String,
      default: ''
    },
    teacherCommentary: {
      type: String
    },
    showDeleteButton: {
      type: Boolean
    },
    showEyeButton: {
      type: Boolean
    },
    deleting: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>

</style>
