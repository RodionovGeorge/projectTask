<template>
<q-page
  class="column items-center"
>
  <LoadingSpinner
    :loading="pageLoading"
  />
  <q-banner
    inline-actions
    class="content-shadow q-my-xs"
    v-if="!pageLoading && problemAlreadyAdmitted"
  >
    Эта задача уже была проверена администратором.
    <template v-slot:action>
      <q-btn
        no-caps
        color="white"
        text-color="black"
        label="На главную"
        @click="onMainPage"
      />
    </template>
  </q-banner>
  <!-- Поправить верстку: кнопка влезает за footer -->
  <div
    v-if="!!problemTitle && !pageLoading"
    class="row no-wrap q-pa-xs"
    style="height: calc(100vh - 110px); max-height: 800px"
  >
    <div
      class="column no-wrap q-gutter-y-sm q-mr-sm"
    >
      <div
        class="content-shadow content-background column"
        style="width: 500px; padding: 0 5px 5px 5px"
      >
        <div
          class="text-h6 text-center"
        >
          Задача на рассмотрение
        </div>
        <table
          class="info-table"
        >
          <tr>
            <td>
              Автор задачи
            </td>
            <td>
              {{ authorFullName }}
            </td>
          </tr>
          <tr>
            <td>
              Группа
            </td>
            <td>
              {{ authorGroup === '-1' ? 'Не указана' : authorGroup }}
            </td>
          </tr>
          <tr>
            <td>
              Название задачи
            </td>
            <td>
              {{ problemTitle }}
            </td>
          </tr>
          <tr>
            <td>
              Дисциплина
            </td>
            <td>
              {{ problemDiscipline }}
            </td>
          </tr>
          <tr>
            <td>
              Интервал приема решений
            </td>
            <td>
              {{ startDate }} - {{ endDate }}
            </td>
          </tr>
          <tr>
            <td>
              Комментарий автора
            </td>
            <td>
              {{ authorCommentary }}
            </td>
          </tr>
          <tr>
            <td class="vertical-align-middle">
              Условия задачи
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
      </div>
      <div
        class="column content-background content-shadow q-gutter-y-xs"
        style="padding: 0 5px 5px 5px"
      >
        <div
          class="row q-gutter-x-sm"
          style="justify-content: space-around"
        >
          <q-radio
            v-model="adminDecision"
            val="Принята"
            label="Принять задачу"
          />
          <q-radio
            v-model="adminDecision"
            val="Отклонена"
            label="Отклонить задачу"
          />
        </div>
        <q-select
          v-if="adminDecision !== null && adminDecision === 'Принята'"
          ref="difficultySelect"
          v-model="chosenDifficulty"
          :options="difficultyLevels"
          :rules="[value => !!value || 'Пожалуйста, выберите дисциплину']"
          label="Сложность задачи"
          outlined
        />
        <q-input
          v-if="adminDecision !== null && adminDecision === 'Отклонена'"
          v-model="rejectedCommentary"
          outlined
          type="textarea"
          label="Комментарий о задаче"
        />
        <q-btn
          v-if="adminDecision !== null"
          outlined
          :loading="submitting"
          label="Подтвердить"
          color="primary"
          no-caps
          @click="onConfirm"
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
    </div>
    <q-pdfviewer
      v-model="problem"
      :src="problemFileURL"
      style="width: calc(100% - 600px); height: 100%; min-width: 600px"
    />
  </div>
  <q-dialog
    v-model="showProblem"
  >
    <q-pdfviewer
      v-model="showProblem"
      :src="problemFileURL"
    >
    </q-pdfviewer>
  </q-dialog>
  <q-dialog
    v-model="confirmDialogShow"
    persistent
  >
    <q-card>
      <q-card-section
        class="row items-center"
      >
        <q-avatar
          icon="bi-exclamation-circle"
          color="white"
          size="50px"
        />
        <p
          class="q-ml-sm text-center"
          style="width: calc(100% - 70px)"
        >
          Вы уверены? Это действие отменить нельзя. <br> После подтверждения вы вернетесь к таблице задач на проверку
        </p>
      </q-card-section>

      <q-card-actions
        align="right"
      >
        <q-btn
          flat
          label="Отмена"
          color="primary"
          v-close-popup
        />
        <q-btn
          flat
          label="Да"
          @click="transmitData"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <ErrorDialog
    :p-error-message="errorMessage"
    :p-error-dialog-show="errorDialogShow"
    @off="errorDialogShow = false"
  />
</q-page>
</template>

<script>
import { Constants, exceptionHandlerDecorator, toLocalDate } from 'boot/Constants'
import LoadingSpinner from 'components/LoadingSpinner'
import ErrorDialog from 'components/ErrorDialog'
export default {
  name: 'OpeningTaskPage',
  components: { LoadingSpinner, ErrorDialog },
  data () {
    return {
      problemExists: true,
      pageLoading: false,
      problemAlreadyAdmitted: false,
      showProblem: false,
      confirmDialogShow: false,
      submitting: false,
      problem: true,
      errorDialogShow: false,
      errorMessage: '',
      adminDecision: null,
      difficultyLevels: Constants.DIFFICULTY_LEVELS,
      chosenDifficulty: null,
      rejectedCommentary: null,
      authorFullName: null,
      authorGroup: null,
      problemFileURL: null,
      startDate: null,
      endDate: null,
      authorCommentary: null,
      problemDiscipline: null,
      problemTitle: null
    }
  },
  methods: {
    onMainPage () {
      this.$router.push('/')
    },
    fileDownload () {
      const a = document.createElement('a')
      a.href = this.problemFileURL
      a.download = '' + this.$route.params.task_id + '.pdf'
      a.click()
    },
    onConfirm () {
      if (this.adminDecision === 'Принята' && this.$refs.difficultySelect.validate()) {
        this.confirmDialogShow = true
      }
      if (this.adminDecision === 'Отклонена') {
        this.transmitData()
      }
    },
    async fetchData () {
      this.pageLoading = true
      const response = await fetch(
        Constants.SERVER_URL + '/api/admitting-problem/' + this.$route.params.task_id,
        Constants.GET_INIT
      )
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.authorFullName = responseData.data.authorFullname
      this.authorGroup = responseData.data.authorGroup
      this.problemFileURL = responseData.data.problemURL
      this.authorCommentary = responseData.data.authorCommentary
      this.problemTitle = responseData.data.problemTitle
      this.problemDiscipline = responseData.data.problemDiscipline
      this.startDate = toLocalDate(responseData.data.problemStartLine)
      this.endDate = toLocalDate(responseData.data.problemDeadline)
      this.pageLoading = false
    },
    async transmitData () {
      this.submitting = true
      const response = await fetch(Constants.SERVER_URL + '/api/admitting-problem/' + this.$route.params.task_id, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify({
          csrfToken: window.localStorage.getItem('csrfToken'),
          userID: this.$store.getters['userDataStore/userInformationGetter'].id,
          problemStatus: this.adminDecision,
          problemComplexity: this.chosenDifficulty,
          rejectionReason: this.rejectedCommentary
        })
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      await this.$router.go(-1)
      this.submitting = false
    }
  },
  async created () {
    this.transmitData = exceptionHandlerDecorator.call(this, [this.transmitData], 'submitting')
    while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
    }
    await exceptionHandlerDecorator.call(
      this,
      [
        this.fetchData,
        true,
        {
          'problem already admitted': e => { this.pageLoading = false; this.problemAlreadyAdmitted = true },
          'problem is admitting now': e => { this.$router.go(-1) }
        }
      ]
    )()
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(
        this,
        [
          this.fetchData,
          true,
          {
            'problem already admitted': e => { this.pageLoading = false; this.problemAlreadyAdmitted = true },
            'problem is admitting now': e => { this.$router.go(-1) }
          }
        ]
      )()
    }
  }
}
</script>
