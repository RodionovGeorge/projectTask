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
        class="row no-wrap"
      >
        <div
          class="column new-task-field q-gutter-y-xs"
        >
          <q-input
            v-model="taskName"
            outlined
            ref="taskName"
            label="Название задачи"
            :rules="[value=>value.length > 0 || 'Пожалуйста, введите название задачи']"
          />
          <q-file
            v-model="file"
            ref="file"
            outlined
            max-files="1"
            error-message="Пожалуйста, добавьте файл с условием"
            accept=".pdf, .tex"
            :rules="[() => this.file !== null || 'Пожалуйста, выберите файл с условием']"
            label="Файл с условием"
          />
          <q-select
            v-model="selectedTaskDiscipline"
            outlined
            label="Дисциплина"
            ref="discipline"
            :options="taskDisciplines"
            :rules="[value=>value.length > 0 || 'Пожалуйста, выберите дисциплину']"
          />
          <q-input
            v-model="authorCommentary"
            type="textarea"
            outlined
            label="Комментарий"
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
          flat
          title="Срок приема решений"
          :options="dateRestriction"
          class="q-ml-sm"
        />
      </div>
      <q-btn
        label="Готово"
        outline
        no-caps
        color="primary"
        style="width: 200px"
        @click="onEnter"
        :loading="submitting"
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
    <q-dialog
      v-model="errorDialogShow"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="bg-red text-white"
        style="width: 300px"
      >
        <q-card-section>
          <div
            class="text-h6 text-center"
          >
            Ошибка
          </div>
        </q-card-section>

        <q-card-section
          class="q-pt-none text-center"
        >
          {{errorMessage}}
        </q-card-section>

        <q-card-actions
          align="center"
          class="bg-white text-black"
        >
          <q-btn
            flat
            label="OK"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Constants, exceptionHandlerDecorator, toBase64 } from 'boot/Constants'
import { date } from 'quasar'

export default {
  name: 'NewTaskPage',
  data () {
    return {
      errorDialogShow: false,
      errorMessage: '',
      submitting: false,
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
      return date.isBetweenDates(dateForCheck, dateNow, maxDate, {
        inclusiveFrom: true,
        inclusiveTo: false,
        onlyDate: true
      })
    },
    async onEnter () {
      const correctTitleEnter = this.$refs.taskName.validate()
      const correctDisciplinesChoose = this.$refs.discipline.validate()
      const correctFileChoose = this.$refs.file.validate()
      if (this.dateRange.to === '' || this.dateRange.from === '') {
        this.errorMessage = 'Пожалуйста, выберите интервал приема решений.'
        this.errorDialogShow = true
        return
      }
      if (correctDisciplinesChoose && correctTitleEnter && correctFileChoose) {
        this.submitting = true
        const file = await toBase64(this.file)
        const requestData = {
          csrfToken: window.localStorage.getItem('csrfToken'),
          file: file.substring(file.indexOf(',') + 1),
          fileMIMEType: this.file.type,
          userID: this.$store.getters['userDataStore/userInformationGetter'].id,
          title: this.taskName,
          discipline: this.selectedTaskDiscipline,
          authorCommentary: this.authorCommentary,
          startDate: date.extractDate(this.dateRange.from, 'YYYY/MM/DD'),
          endDate: date.extractDate(this.dateRange.to, 'YYYY/MM/DD')
        }
        const response = await fetch(Constants.SERVER_URL + '/api/add-problem', {
          method: 'POST',
          credentials: 'same-origin',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          throw new Error(responseData.message)
        }
        localStorage.setItem('csrfToken', responseData.csrfToken)
        await this.$router.go(-1)
        this.submitting = false
      }
    }
  },
  async created () {
    this.onEnter = exceptionHandlerDecorator.call(this, [this.onEnter], 'submitting')
    while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
    }
  }
}
</script>

<style scoped>

</style>
