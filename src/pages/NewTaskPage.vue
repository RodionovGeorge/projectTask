<template>
  <q-page
    class="row items-center justify-center no-wrap"
  >
    <div
      class="column new-task-page content-background content-shadow items-center q-gutter-y-sm"
    >
      <div
        class="text-h6 text-center"
      >
        Предложить задачу
      </div>
      <div
        class="row"
      >
        <div
          class="column new-task-field q-gutter-y-xs"
        >
          <q-input
            v-model="taskName"
            outlined
            label="Название задачи"
            :rules="[value=>value.length > 0 || 'Пожалуйста, введите название задачи']"
          />
          <q-file
            v-model="file"
            outlined
            max-files="1"
            error-message="Пожалуйста, добавьте файл с условием"
            accept=".pdf, .tex"
            label="Файл с условием"
            :rules="[value=>value.length > 0 || 'Пожалуйста, добавьте файл с условием']"
          />
          <q-select
            v-model="selectedTaskDiscipline"
            outlined
            label="Дисциплина"
            :options="taskDisciplines"
            :rules="['fileCheck']"
          />
          <q-input
            v-model="authorCommentary"
            type="textarea"
            outlined
            label="Комментарий"
            color="black"
            class="new-task-commentary"
          />
          <div
            class="row justify-center q-gutter-x-sm"
          >
          </div>
        </div>
        <q-date
          v-model="dateRange"
          range
          title="Срок приема решений"
          :options="dateRestriction"
          class="q-ml-sm"
        />
      </div>
      <q-btn
        label="Готово"
        outline
        no-caps
        style="width: 200px"
      >
        <template
          v-slot:loading
        >
          <q-spinner
            :thickness="2"
          />
        </template>
      </q-btn>
    </div>
  </q-page>
</template>

<script>
import { Constants } from 'boot/Constants'
import { date } from 'quasar'

export default {
  name: 'NewTaskPage',
  data () {
    return {
      taskName: '',
      selectedTaskDiscipline: '',
      taskDisciplines: Constants.TASK_DISCIPLINES,
      dateRange: {
        to: '',
        from: ''
      },
      authorCommentary: '',
      file: null
    }
  },
  methods: {
    dateRestriction (dateForCheck) {
      const dateNow = new Date()
      const maxDate = new Date(8640000000000000)
      return date.isBetweenDates(dateForCheck, dateNow, maxDate)
    },
    onRejected () {
      this.rejectedFileDialog = true
    },
    onUploaded () {
      // Что-то делаем (а может и нет)
    }
  }
}
</script>

<style scoped>

</style>
