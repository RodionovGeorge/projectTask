<template>
  <q-page
    class="column items-center justify-center no-wrap"
  >
    <LoadingSpinner
      :loading="loadingPage"
    />
    <div
      v-if="!loadingPage"
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
            maxlength="30"
            :rules="[value => !!value || 'Пожалуйста, введите название задачи']"
          />
          <q-file
            v-model="file"
            ref="file"
            outlined
            max-file-size="5000000"
            max-files="1"
            error-message="Пожалуйста, добавьте файл с условием (<5мБ, .pdf, .tex)"
            accept=".pdf, .tex"
            :rules="[() => this.file !== null || 'Пожалуйста, выберите файл с условием (<5мБ, .pdf, .tex)']"
            label="Файл с условием"
          />
          <q-select
            ref="select"
            v-model="selectedTaskDiscipline"
            outlined
            input-debounce="0"
            label="Предмет"
            use-input
            hide-selected
            fill-input
            :options="taskDisciplines"
            :rules="[value => !!value || 'Пожалуйста, выберите дисциплину']"
            @filter="filter"
            @input-value="setModel"
            @input="onInput"
          >
            <template
              v-if="isAdmin"
              v-slot:append
            >
              <q-btn
                round
                dense
                flat
                icon="bi-plus"
                @click.stop="newDisciplineDialogShow = true"
              >
                <q-tooltip
                  :delay="800"
                >
                  Добавить возможный предмет
                </q-tooltip>
              </q-btn>
            </template>
            <template
              v-slot:no-option
            >
              <q-item>
                <q-item-section
                  class="text-italic text-grey"
                >
                  Возможных вариантов предмета для задачи не обнаружено
                </q-item-section>
              </q-item>
            </template>
            <template
              v-slot:option="{ itemProps, itemEvents, opt }"
            >
              <q-item
                v-bind="itemProps"
                v-on="itemEvents"
              >
                <q-item-section>
                  <q-item-label>
                    {{ opt.label }}
                  </q-item-label>
                </q-item-section>
                <q-item-section
                  v-if="isAdmin"
                  side
                >
                  <q-btn
                    round
                    dense
                    flat
                    color="black"
                    icon="bi-trash"
                    :loading="deleting"
                    @click.stop="deleteTaskDiscipline(opt.id)"
                  >
                    <template
                      v-slot:loading
                    >
                      <q-spinner
                        :thickness="2"
                      />
                    </template>
                    <q-tooltip
                      :delay="800"
                    >
                      Удалить возможный предмет
                    </q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input
            v-model="authorCommentary"
            type="textarea"
            outlined
            label="Комментарий"
            :maxlength="commentaryMaxLength"
            class="new-task-commentary"
          />
          <div
            class="row justify-center q-gutter-x-sm"
          >
          </div>
        </div>
        <div
          class="column no-wrap q-ml-sm"
        >
          <q-btn
            no-caps
            label="Справка"
            outline
            color="primary"
            class="q-mb-xs"
            @click="infoDialogShow = true"
          />
          <q-date
            v-model="dateRange"
            range
            flat
            title="Срок приема решений"
            class="q-pt-none"
            :options="dateRestriction"
          />
        </div>
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
    <q-dialog
      v-model="infoDialogShow"
    >
      <q-card>
        <q-card-section>
          <div
            class="text-h6"
          >
            Справка
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Для установки интервала приема решений нужно выбрать две даты.<br>
          Каждая из границ интервала выбирается отдельным кликом по нужной дате.<br>
          Обращаем ваше внимание, что правая граница интервала не включается.<br>
          Например, если задача должна быть видна 1 день (к примеру 7 ноября), то<br>
          должен быть выбран следующий интервал: 07.11.2021 - 08.11.2021.<br>
          Выбирать один и тот же день в качестве начала и конца интервала запрещено.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="newDisciplineDialogShow"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        style="min-width: 350px"
      >
        <q-card-section>
          <div
            class="text-h6"
          >
            Добавление нового предмета для задач
          </div>
        </q-card-section>
        <q-card-section
          class="q-pt-none"
        >
          <q-input
            ref="newDisciplineInput"
            v-model="newDisciplineLabel"
            maxlength="30"
            label="Название нового предмета"
            outlined
            :rules="[value => !!value || 'Пожалуйста, введите название предмета']"
          />
        </q-card-section>
        <q-card-actions
          align="right"
          class="text-primary"
        >
          <q-btn
            flat
            no-caps
            label="Назад"
            v-close-popup
          />
          <q-btn
            flat
            no-caps
            :loading="adding"
            label="Добавить"
            @click="addNewTaskDiscipline"
          >
            <template
              v-slot:loading
            >
              <q-spinner
                :thickness="2"
              />
            </template>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Constants, exceptionHandlerDecorator, toBase64 } from 'boot/Constants'
import { date } from 'quasar'
import LoadingSpinner from 'components/LoadingSpinner'

export default {
  name: 'NewTaskPage',
  components: { LoadingSpinner },
  data () {
    return {
      errorDialogShow: false,
      infoDialogShow: false,
      errorMessage: '',
      submitting: false,
      adding: false,
      deleting: false,
      loadingPage: false,
      newDisciplineDialogShow: false,
      commentaryMaxLength: Constants.LENGTHS.commentaryToProblem,
      taskName: '',
      selectedTaskDiscipline: null,
      autoCompleteDisciplines: null,
      taskDisciplines: null,
      newDisciplineLabel: '',
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
    filter (val, update, abort) {
      update(() => {
        const lowerCaseVal = val.toLowerCase()
        this.taskDisciplines = this.autoCompleteDisciplines.filter(v => ~v.label.toLowerCase().indexOf(lowerCaseVal))
      })
    },
    setModel (v) {
      this.selectedTaskDiscipline = v
    },
    onInput (v) {
      this.selectedTaskDiscipline = v.label
    },
    async onEnter () {
      const correctTitleEnter = this.$refs.taskName.validate()
      const correctDisciplinesChoose = this.$refs.select.validate()
      const correctFileChoose = this.$refs.file.validate()
      if (this.dateRange === null || this.dateRange.to === '' || this.dateRange.from === '') {
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
          fileMIMEType: this.file.name.includes('.tex', this.file.name.length - 4) ? 'application/x-tex' : 'application/pdf',
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
    },
    async addNewTaskDiscipline () {
      const correctNewDisciplineLabel = this.$refs.newDisciplineInput.validate()
      if (correctNewDisciplineLabel) {
        this.adding = true
        const requestData = {
          csrfToken: window.localStorage.getItem('csrfToken'),
          label: this.newDisciplineLabel
        }
        const response = await fetch(Constants.SERVER_URL + '/api/admin/problem-discipline', {
          method: 'POST',
          credentials: 'same-origin',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          throw new Error(responseData.message)
        }
        this.taskDisciplines.push({
          id: responseData.id,
          label: this.newDisciplineLabel
        })
        this.autoCompleteDisciplines = this.taskDisciplines
        this.$refs.select.refresh()
        localStorage.setItem('csrfToken', responseData.csrfToken)
        this.adding = false
        this.newDisciplineDialogShow = false
        this.newDisciplineLabel = ''
      }
    },
    async deleteTaskDiscipline (id) {
      this.deleting = true
      this.$refs.select.showPopup()
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        id: id
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/problem-discipline', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.taskDisciplines = this.taskDisciplines.filter(e => e.id !== id)
      this.autoCompleteDisciplines = this.taskDisciplines
      this.$refs.select.showPopup()
      localStorage.setItem('csrfToken', responseData.csrfToken)
      this.deleting = false
    },
    async initPage () {
      this.loadingPage = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/problem-discipline', Constants.GET_INIT)
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.taskDisciplines = responseData.data
      this.autoCompleteDisciplines = responseData.data
      this.loadingPage = false
    }
  },
  async created () {
    this.onEnter = exceptionHandlerDecorator.call(this, [this.onEnter], 'submitting')
    this.addNewTaskDiscipline = exceptionHandlerDecorator.call(this, [this.addNewTaskDiscipline], 'adding')
    this.deleteTaskDiscipline = exceptionHandlerDecorator.call(this, [this.deleteTaskDiscipline], 'deleting')
    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
  },
  computed: {
    userInformation () {
      return this.$store.getters['userDataStore/userInformationGetter']
    },
    isAdmin () {
      return this.userInformation?.roles?.includes('Администратор') ||
        this.userInformation?.roles?.includes('Помощник администратора')
    }
  }
}
</script>

<style scoped>

</style>
