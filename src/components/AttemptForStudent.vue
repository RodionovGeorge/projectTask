<template>
<div class="column no-wrap" style="border: 1px solid black; width: 850px; padding: 0 10px 10px 10px; margin:10px 0 10px 10px">
  <div class="text-h6">Попытка</div>
  <div class="row">
    <div style="width:250px; display:flex; align-items: center;">Номер попытки</div>
    <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">Попытка {{attemptNumber}}</div>
    <div style="width:250px; display:flex; align-items: center;">Статус ответа на попытку</div>
    <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">{{checkStatus}}</div>
    <div style="width:250px; display:flex; align-items: center;">Последнее изменение</div>
    <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">{{localeDateOfLastChange}}</div>
    <div style="width:250px; display:flex; align-items: center;">Файл с решением</div>
    <a style="width:578px; display:flex; align-items: center; overflow-wrap: normal" :href="pathToSolution">{{fileName}}</a>
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
