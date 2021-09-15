<template>
<div
  class="column no-wrap student-attempt"
>
  <div
    class="row"
    style="justify-content: space-between"
  >
    <div
      class="text-h6"
    >
      Попытка
    </div>
    <q-btn
      icon="bi-trash"
      dense
      flat
    />
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
      type: Number
    },
    checkStatus: {
      type: String
    },
    dateOfLastChange: {
      type: String
    },
    problemFileURL: {
      type: String
    }
  },
  computed: {
    cDateOfLastChange () {
      return new Date(this.dateOfLastChange)
    },
    localeDateOfLastChange () {
      const x = this.cDateOfLastChange
      const day = x.getDate() < 10 ? '' + 0 + x.getDate() : x.getDate()
      const month = (x.getMonth() + 1) < 10 ? '' + 0 + (x.getMonth() + 1) : (x.getMonth() + 1)
      const hour = x.getHours() < 10 ? '' + 0 + x.getHours() : x.getHours()
      const minute = x.getMinutes() < 10 ? '' + 0 + x.getMinutes() : x.getMinutes()
      return day + '/' + month + '/' + x.getFullYear() + ' ' + hour + ':' + minute
    }
  }
}
</script>
