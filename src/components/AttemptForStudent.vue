<template>
<div
  class="column no-wrap student-attempt"
>
  <div
    class="text-h6"
  >
    Попытка
  </div>
  <div
    class="row q-gutter-x-sm"
  >
    <div
      class="student-attempt-titles"
    >
      Номер попытки:
    </div>
    <div
      class="student-attempt-data"
    >
      Попытка {{ attemptNumber }}
    </div>
  </div>
  <div
    class="row q-gutter-x-sm"
  >
    <div
      class="student-attempt-titles"
    >
      Статус ответа на попытку:
    </div>
    <div
      class="student-attempt-data"
    >
      {{ checkStatus }}
    </div>
  </div>
  <div
    class="row q-gutter-x-sm"
  >
    <div
      class="student-attempt-titles"
    >
      Последнее изменение:
    </div>
    <div
      class="student-attempt-data"
    >
      {{ localeDateOfLastChange }}
    </div>
  </div>
  <div
    class="row q-gutter-x-sm"
  >
    <div
      class="student-attempt-titles"
    >
      Файл с решением:
    </div>
    <a
      class="student-attempt-data"
      :href="pathToSolution"
    >
      {{ fileName }}
    </a>
  </div>
</div>
</template>

<script>
export default {
  name: 'AttemptForStudent',
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
    pathToSolution: {
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
