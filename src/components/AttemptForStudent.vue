<template>
<div
  class="column no-wrap student-attempt"
>
  <div
    class="text-h6"
  >
    Попытка
  </div>
  <table
    class="student-attempt-table"
  >
    <tr>
      <td>
        Номер попытки
      </td>
      <td>
        Попытка {{ attemptNumber }}
      </td>
    </tr>
    <tr>
      <td>
        Статус ответа на попытку
      </td>
      <td>
        {{checkStatus}}
      </td>
    </tr>
    <tr>
      <td>
        Последнее изменение
      </td>
      <td>
        {{localeDateOfLastChange}}
      </td>
    </tr>
    <tr>
      <td>
        Файл с решеннием
      </td>
      <td>
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
  name: 'AttemptForStudent',
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
    attemptNumber: {
      type: Number,
      default: 1
    },
    checkStatus: {
      type: String,
      default: 'Проверяется'
    },
    dateOfLastChange: {
      type: Date,
      default: function () {
        return new Date(2000, 1, 1)
      }
    },
    problemFileURL: {
      type: String,
      default: 'pdfExample/OS1.pdf'
    }
  },
  computed: {
    localeDateOfLastChange () {
      return this.dateOfLastChange.toLocaleDateString() + ' ' + this.dateOfLastChange.toLocaleTimeString()
    },
    fileName () {
      return this.pathToSolution.substr(this.pathToSolution.lastIndexOf('/') + 1)
    }
  }
}
</script>
