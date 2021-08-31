<template>
<q-page
  class="column items-center"
>
  <LoadingSpinner
    :loading="pageLoading"
  />
  <div
    class="column items-center q-py-sm q-gutter-y-sm"
    v-if="!pageLoading"
  >
    <TaskInfo
      v-bind="problemInformation"
      class="content-background content-shadow"
      @sunset="sunsetTaskDialogShow = true"
      @edit="editTaskDialogShow = true"
    />
    <div
      class="column student-table content-shadow content-background"
      v-if="problemInformation.userStatus === 'Учитель'"
      style="padding: 10px 10px 10px 10px"
    >
      <div
        class="row q-mb-xs"
      >
        <q-input
          v-model="filterValue"
          outlined
          square
          style="width: 90%; margin-right: 5px"
          @input="exceptionHandler"
          debounce="1000"
          label="Поиск"
        >
          <template
            v-slot:append
          >
            <q-icon
              name="search"
            />
          </template>
        </q-input>
        <q-btn
          icon="bi-info-circle"
          flat
          @click="infoDialogShow = true"
          style="width:calc(10% - 5px)"
        />
      </div>
      <q-table
        square
        flat
        bordered
        @request="exceptionHandler"
        :columns="columns"
        :visible-columns="visibleColumns"
        :pagination.sync="pagination"
        :rows-per-page-options="pagination.rowsPerPage"
        row-key="sessionID"
        :data="sessionData"
        no-data-label="Ученики не найдены."
      />
    </div>
    <q-btn
      v-if="problemInformation.userStatus === 'Нет'"
      class="content-background"
      label="Добавить попытку"
      @click="newAttemptDialogShow = true"
      no-caps
    />
    <div
      class="column no-wrap q-gutter-x-sm"
      v-if="problemInformation.userStatus === 'Ученик'"
    >
      <div
        class="column q-gutter-y-sm items-center"
      >
        <div
          class="row no-wrap full-attempt"
        >
          <AttemptForStudent
            v-bind="currentAttempt.studentAttempt"
            class="content-background content-shadow full-attempt-student"
          />
          <TeacherFeedback
            v-bind="currentAttempt.teacherFeedback"
            class="content-background content-shadow full-attempt-teacher"
          />
        </div>
        <q-btn
          v-if="problemInformation.userStatus === 'Учитель' && currentAttempt.studentAttempt.checkStatus === 'Проверяется'"
          label="Проверить попытку"
          style="width: 25%"
          class="content-background"
          no-caps
        >
        </q-btn>
        <div
          class="row content-shadow content-background"
        >
          <q-btn
            class="q-mr-xs"
            label="Удалить попытку"
            no-caps
          >
            <template
              v-slot:loading
            >
              <q-spinner
                :thickness="2"
              />
            </template>
          </q-btn>
          <q-btn
            label="Редактировать попытку"
            no-caps
          ></q-btn>
        </div>
        <div
          class="attempt-discussion content-shadow content-background"
        >
          <div
            class="text-h6"
          >
            Обсуждение попытки
          </div>
          <div
            class="q-gutter-y-sm"
          >
            <q-virtual-scroll
              style="max-height: 400px"
              :items="currentAttempt.commentaries"
            >
              <template
                v-slot="{ item }"
              >
                <Commentary
                  :author-full-name="item.authorID === userID ? teacherInfo.fullName : studentInfo.fullName"
                  :author-i-d="item.authorID"
                  :avatar-path="item.authorID === userID ? teacherInfo.fullName : studentInfo.fullName"
                  :commentary-date="item.commentaryDate"
                  :commentary-i-d="item.commentaryID"
                  :commentary-text="item.commentaryText"
                  :user-status="problemInformation.userStatus"
                />
              </template>
            </q-virtual-scroll>
            <div
              class="row"
              style="width: 840px; display: flex; justify-content: space-between; padding-right: 10px"
            >
              <q-input
                v-model="currentCommentary"
                autogrow
                outlined
                placeholder="Напишите комментарий"
                color="black"
                style="width:700px"
              />
              <q-btn
                label="Отправить"
                style="height: 50px; width:100px"
              />
            </div>
          </div>
        </div>
        <div
          class="content-background content-shadow previous-attempts"
          v-if="attemptMaxNumber > 1"
        >
          <div
            class="text-h6"
          >
            Предыдущие попытки
          </div>
          <div class="q-gutter-y-xs">
            <q-pagination
              class="flex flex-center"
              v-model="currentPreviousAttemptNumber"
              :max="attemptMaxNumber - 1"
              boundary-numbers
            />
            <div
              class="row no-wrap full-attempt"
            >
              <AttemptForStudent
                v-bind="previousAttempt.studentAttempt"
                class="content-shadow-for-white full-attempt-student"
              />
              <TeacherFeedback
                v-bind="previousAttempt.teacherFeedback"
                class="content-shadow-for-white full-attempt-teacher"
              />
            </div>
            <div
              class="attempt-discussion content-shadow-for-white"
            >
              <div
                class="text-h6"
              >
                Обсуждение попытки
              </div>
              <div
                class="q-gutter-y-sm"
              >
                <q-virtual-scroll
                  style="max-height: 200px"
                  :items="previousAttempt.commentaries"
                >
                  <template
                    v-slot="{ item }"
                  >
                    <Commentary
                      :author-full-name="item.authorID === userID ? teacherInfo.fullName : studentInfo.fullName"
                      :author-i-d="item.authorID"
                      :avatar-path="item.authorID === userID ? teacherInfo.fullName : studentInfo.fullName"
                      :commentary-date="item.commentaryDate"
                      :commentary-i-d="item.commentaryID"
                      :commentary-text="item.commentaryText"
                      :user-status="problemInformation.userStatus"
                    />
                  </template>
                </q-virtual-scroll>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ErrorDialog
    :p-error-dialog-show="errorDialogShow"
    :p-error-message="errorMessage"
    @off="errorDialogShow = false"
  />
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
        Для фильтрации по имени нужно просто ввести необходимый запрос.<br>
        Для фильтрации по группе запрос нужно начать с '.g' (без кавычек).
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="newAttemptDialogShow"
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
          Новая попытка
        </div>
      </q-card-section>
      <q-card-section
        class="q-pt-none"
      >
        <q-file
          v-model="newAttemptFile"
          ref="filePicker"
          label="Файл с решением"
          max-files="1"
          error-message="Пожалуйста, добавьте файл с условием"
          accept=".pdf, .tex"
          :rules="[() => this.newAttemptFile !== null || 'Пожалуйста, выберите файл с условием']"
          outlined
        />
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat
          no-caps
          label="Назад"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          :loading="newAttemptLoading"
          label="Добавить попытку"
          @click="addNewAttempt"
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
  <q-dialog
    v-model="sunsetTaskDialogShow"
    persistent
  >
    <q-card>
      <q-card-section
        class="row items-center"
      >
        <q-avatar
          icon="bi-exclamation-circle"
          color="white"
          size="xl"
        />
        <span
          class="q-ml-sm"
        >
          Вы уверены, что хотите скрыть эту задачу?
        </span>
      </q-card-section>

      <q-card-actions
        align="right"
      >
        <!-- Добавить события на сокрытие задачи -->
        <q-btn
          flat
          label="Отмена"
          color="primary"
          v-close-popup
        />
        <q-btn
          flat
          label="Да"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-page>
</template>

<script>
import TaskInfo from 'components/TaskInfo'
import AttemptForStudent from 'components/AttemptForStudent'
import TeacherFeedback from 'components/TeacherFeedback'
import Commentary from 'components/Commentary'
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, toBase64, toLocalDate } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
export default {
  name: 'TaskT',
  components: { ErrorDialog, LoadingSpinner, TaskInfo, AttemptForStudent, TeacherFeedback, Commentary },
  data () {
    return {
      pageLoading: false,
      listLoading: false,
      newAttemptLoading: false,
      sunsetTaskDialogShow: false,
      newAttemptDialogShow: false,
      infoDialogShow: false,
      errorDialogShow: false,
      errorMessage: '',
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 1
      },
      filterValue: '',
      newAttemptFile: null,
      currentCommentary: '',
      sessionData: null,
      problemInformation: null,
      visibleColumns: ['studentFullName', 'studentGroup', 'haveNewContent'],
      columns: [
        {
          name: 'sessionID',
          field: 'sessionID'
        },
        {
          name: 'studentFullName',
          label: 'Ученик',
          align: 'center',
          field: 'studentFullName'
        },
        {
          name: 'studentGroup',
          label: 'Группа',
          align: 'center',
          field: 'studentGroup'
        },
        {
          name: 'haveNewContent',
          label: 'Обновления',
          align: 'center',
          field: 'sessionHaveNewContentForTeacher'
        }
      ],
      teacherInfo: {
        avatarPath: null,
        fullName: null
      },
      studentInfo: {
        avatarPath: null,
        fullName: null
      },
      currentAttempt: {
        attemptID: null,
        studentAttempt: {
          attemptNumber: null,
          checkStatus: null,
          dateOfLastChange: null,
          problemFileURL: null
        },
        teacherFeedback: {
          decisionStage: null,
          checkDate: null,
          problemFileURL: null,
          teacherCommentary: null
        },
        commentaries: null
      },
      attemptMaxNumber: 0,
      currentPreviousAttemptNumber: null,
      previousAttempt: {
        attemptID: null,
        studentAttempt: {
          attemptNumber: null,
          checkStatus: null,
          dateOfLastChange: null,
          problemFileURL: null
        },
        teacherFeedback: {
          decisionStage: null,
          checkDate: null,
          problemFileURL: null,
          teacherCommentary: null
        },
        commentaries: null
      }
    }
  },
  methods: {
    addNewAttempt () {
      const fileInputCheck = this.$refs.filePicker.validate()
      if (fileInputCheck) {
        this.newAttemptLoading = true
        toBase64(this.newAttemptFile).then(
          file => {
            const data = {
              csrfToken: window.localStorage.getItem('csrfToken'),
              file: file.substring(file.indexOf(',') + 1),
              fileMIMEType: this.newAttemptFile.type,
              problemID: this.$route.params.task_id
            }
            fetch(Constants.SERVER_URL + '/api/attempt-editing', {
              method: 'POST',
              credentials: 'same-origin',
              headers: Constants.HEADERS,
              body: JSON.stringify(data)
            }).then(
              response => response.json()
            ).then(
              data => {
                if (data.message === 'success') {
                  Object.assign(this.previousAttempt, this.currentAttempt)
                  this.currentPreviousAttemptNumber = this.attemptMaxNumber
                  this.currentAttempt.attemptID = data.attemptID
                  this.currentAttempt.attemptID = data.attemptID
                  this.currentAttempt.teacherFeedback = null
                  this.currentAttempt.commentaries = null
                  this.currentAttempt.studentAttempt = data.attempt
                  this.attemptMaxNumber++
                  window.localStorage.setItem('csrfToken', data.csrfToken)
                  this.newAttemptDialogShow = false
                } else {
                  console.log(data.message)
                  console.log(Constants.ERROR_MESSAGES[data.message])
                  this.errorMessage = Constants.ERROR_MESSAGES[data.message]
                  this.errorDialogShow = true
                }
                this.newAttemptLoading = false
              }
            ).catch(
              () => {
                this.errorMessage = 'Нет соединения.'
                this.errorDialogShow = true
                this.newAttemptLoading = false
              }
            )
          }
        ).catch(
          () => {
            this.errorMessage = 'Не удалось подготовить файл к передаче на сервер.'
            this.errorDialogShow = true
            this.newAttemptLoading = false
          }
        )
      }
    },
    async getProblem () {
      const currentProblemID = this.$route.params.task_id
      const response = await fetch(
        Constants.SERVER_URL + '/api/problem/' + currentProblemID,
        Constants.GET_INIT
      )
      const data = await response.json()
      if (data.message !== 'success') {
        throw new Error(data.message)
      }
      data.data.problemStartLine = toLocalDate(data.data.problemStartLine)
      data.data.problemDeadline = toLocalDate(data.data.problemDeadline)
      this.problemInformation = data.data
    },
    async updateSessionTable (props) {
      this.listLoading = true
      const { page, rowsPerPage } =
        typeof props === 'string'
          ? this.pagination
          : props
      const currentProblemID = this.$route.params.task_id
      const getParameters = new URLSearchParams()
      getParameters.append('filterValue', this.filterValue)
      getParameters.append('currentPage', page)
      getParameters.append('pageSize', rowsPerPage)
      const response = await fetch(
        Constants.SERVER_URL + '/api/session-for-problem/' + currentProblemID + '?' + getParameters.toString(),
        Constants.GET_INIT
      )
      const data = await response.json()
      if (data.message !== 'success') {
        throw new Error(data.message)
      }
      for (let i = 0; i < data.sessionInfo.length; i++) {
        data.sessionInfo[i].studentGroup =
          data.sessionInfo[i].studentGroup === '-1'
            ? '-'
            : data.sessionInfo[i].studentGroup
        data.sessionInfo[i].sessionHaveNewContentForTeacher =
          data.sessionInfo[i].sessionHaveNewContentForTeacher
            ? 'Есть'
            : 'Нет'
      }
      this.sessionData = data.sessionInfo
      this.pagination.rowsNumber = data.sessionCount
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.page = page
      this.listLoading = false
    },
    async getAttemptNumber () {
      const getParameters = new URLSearchParams()
      getParameters.append('problemID', this.$route.params.task_id)
      const response = await fetch(
        Constants.SERVER_URL + '/api/get-attempt?' + getParameters.toString(),
        Constants.GET_INIT
      )
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      } else {
        this.attemptMaxNumber = responseData.attemptNumber
      }
    },
    async getAttempt (attemptNumber) {
      const requestData = {
        problemID: this.$route.params.task_id,
        requestAttemptNumber: attemptNumber
      }
      const response = await fetch(
        Constants.SERVER_URL + '/api/get-attempt',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
        }
      )
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      } else {
        return responseData.attempt
      }
    },
    async exceptionHandler (props) {
      try {
        await this.updateSessionTable(props)
      } catch (e) {
        this.errorMessage =
          Object.prototype.hasOwnProperty.call(Constants.ERROR_MESSAGES, e.message)
            ? Constants.ERROR_MESSAGES[e.message]
            : 'Нет соединения.'
        this.errorDialogShow = true
      }
    },
    async initPage () {
      this.pageLoading = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      try {
        await this.getProblem()
        let currentAttempt
        switch (this.problemInformation.userStatus) {
          case 'Учитель':
            await this.updateSessionTable('random string')
            break
          case 'Ученик':
            await this.getAttemptNumber()
            currentAttempt = await this.getAttempt(this.attemptMaxNumber)
            this.teacherInfo = currentAttempt.commentariesInfo.teacherInfo
            this.studentInfo = currentAttempt.commentariesInfo.studentInfo
            if (this.attemptMaxNumber > 1) {
              const lastPreviousAttempt = await this.getAttempt(this.attemptMaxNumber - 1)
              this.previousAttempt.attemptID = lastPreviousAttempt.attemptID
              this.previousAttempt.studentAttempt = lastPreviousAttempt.studentAttempt
              this.previousAttempt.teacherFeedback = lastPreviousAttempt.teacherFeedback
              this.previousAttempt.commentaries = lastPreviousAttempt.commentaries
            }
            this.currentAttempt.attemptID = currentAttempt.attemptID
            this.currentAttempt.studentAttempt = currentAttempt.studentAttempt
            this.currentAttempt.teacherFeedback = currentAttempt.teacherFeedback
            this.currentAttempt.commentaries = currentAttempt.commentaries
        }
        this.pageLoading = false
      } catch (e) {
        console.log(e)
        switch (e.message) {
          case 'session not found':
            await this.$router.push(Constants.AT_404)
            break
          case 'permission denied':
            await this.$router.push('/permission-error')
            break
          case 'incorrect request':
            await this.$router.push(Constants.AT_404)
            break
          case 'problem not found':
            await this.$router.push(Constants.AT_404)
            break
          case 'database error':
            await this.$router.push('/server-error')
            break
          default:
            await this.$router.push('/connection-error')
            break
        }
      }
    }
  },
  async created () {
    await this.initPage()
  },
  watch: {
    $route: function () {
      this.pageLoading = true
      this.initPage()
    }
  },
  computed: {
    userID () {
      return this.$store.getters['userDataStore/userInformationGetter'].id
    }
  }
}
</script>

<style scoped>

</style>
