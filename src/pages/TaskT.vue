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
      :loading="statusChangeLoading"
      class="content-background content-shadow"
      @status-change="wdStatusChange"
      @edit="editTaskDialogShow = true"
    />
    <div
      class="column student-table content-shadow content-background"
      v-if="isTeacher"
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
          @input="wdUpdateSessionTable"
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
        @request="wdUpdateSessionTable"
        @row-click="wdOnRowClick"
        :columns="columns"
        :visible-columns="visibleColumns"
        :pagination.sync="pagination"
        :loading="listLoading"
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
      v-if="problemInformation.userStatus === 'Ученик' || (isTeacher && currentSessionID)"
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
          v-if="isTeacher && currentAttempt.studentAttempt.checkStatus === 'Проверяется'"
          label="Проверить попытку"
          style="width: 25%"
          class="content-background"
          no-caps
        >
        </q-btn>
        <!-- <div
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
        </div> -->
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
                  :author-full-name="!(isTeacher ? (item.authorID !== userID) : (item.authorID === userID)) ? teacherInfo.fullName : studentInfo.fullName"
                  :author-i-d="item.authorID"
                  :avatar-path="!(isTeacher ? (item.authorID !== userID) : (item.authorID === userID)) ? teacherInfo.avatarPath : studentInfo.avatarPath"
                  :commentary-date="item.commentaryDate"
                  :commentary-i-d="item.commentaryID"
                  :commentary-text="item.commentaryText"
                  :user-status="problemInformation.userStatus"
                  :loading="deleteCommentaryLoading"
                  :user-i-d="userID"
                  @deleted="wdDeleteCommentary"
                />
              </template>
            </q-virtual-scroll>
            <div
              class="row"
              style="width: 840px; padding-right: 10px"
            >
              <q-input
                v-model="currentCommentary"
                autogrow
                v-on:keydown.enter.prevent="wdAddNewCommentary"
                :loading="newCommentaryLoading"
                outlined
                placeholder="Напишите комментарий"
                style="width: 100%"
              />
              <!-- <q-btn
                label="Отправить"
                style="height: 50px; width:100px"
              /> -->
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
                      :author-full-name="!(isTeacher ? (item.authorID !== userID) : (item.authorID === userID)) ? teacherInfo.fullName : studentInfo.fullName"
                      :author-i-d="item.authorID"
                      :avatar-path="!(isTeacher ? (item.authorID !== userID) : (item.authorID === userID)) ? teacherInfo.avatarPath : studentInfo.avatarPath"
                      :commentary-date="item.commentaryDate"
                      :commentary-i-d="item.commentaryID"
                      :commentary-text="item.commentaryText"
                      :user-status="problemInformation.userStatus"
                      :user-i-d="userID"
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
  <!-- <q-dialog
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
  </q-dialog> -->
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
      deleteCommentaryLoading: false,
      statusChangeLoading: false,
      newCommentaryLoading: false,
      newAttemptLoading: false,
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
      // Из-за механизма обработки ошибок это поле может принимать
      // либо значение false, когда преподаватель ничего не выбрал или при выборе произошла ошибка
      // либо числовое значние, когда все в порядке
      currentSessionID: false,
      userID: null,
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
    async statusChange (...args) {
      this.statusChangeLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        problemID: this.problemInformation.problemID,
        newStatusTitle: args[0][0]
      }
      const response = await fetch(Constants.SERVER_URL + '/api/hide-status', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.problemInformation.problemStatus = responseData.newStatus
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.statusChangeLoading = false
    },
    wdStatusChange: null,
    async deleteCommentary (...args) {
      this.deleteCommentaryLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        commentaryID: args[0][0]
      }
      const response = await fetch(Constants.SERVER_URL + '/api/commentary-editing', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      let index = this.currentAttempt.commentaries.findIndex((e, i, a) => e.commentaryID === requestData.commentaryID)
      if (~index) {
        this.currentAttempt.commentaries.splice(index, 1)
      } else {
        index = this.previousAttempt.commentaries.findIndex((e, i, a) => e.commentaryID === requestData.commentaryID)
        this.previousAttempt.commentaries.splice(index, 1)
      }
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.deleteCommentaryLoading = false
    },
    wdDeleteCommentary: null,
    async addNewCommentary (...args) {
      this.newCommentaryLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        attemptID: this.currentAttempt.attemptID,
        commentaryText: this.currentCommentary
      }
      const response = await fetch(Constants.SERVER_URL + '/api/commentary-editing', {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const data = await response.json()
      if (data.message !== 'success') {
        throw new Error(data.message)
      }
      window.localStorage.setItem('csrfToken', data.csrfToken)
      this.currentAttempt.commentaries.push({
        authorID: this.userID,
        commentaryText: this.currentCommentary,
        commentaryDate: data.commentaryTime,
        commentaryID: data.commentaryID
      })
      this.currentCommentary = ''
      this.newCommentaryLoading = false
    },
    wdAddNewCommentary: null,
    async addNewAttempt (...args) {
      const fileInputCheck = this.$refs.filePicker.validate()
      if (fileInputCheck) {
        this.newAttemptLoading = true
        const fileForTransmitting = await toBase64(this.newAttemptFile)
        const data = {
          csrfToken: window.localStorage.getItem('csrfToken'),
          file: fileForTransmitting.substring(fileForTransmitting.indexOf(',') + 1),
          fileMIMEType: this.newAttemptFile.type,
          problemID: this.$route.params.task_id
        }
        const response = await fetch(Constants.SERVER_URL + '/api/attempt-editing', {
          method: 'POST',
          credentials: 'same-origin',
          headers: Constants.HEADERS,
          body: JSON.stringify(data)
        })
        const responseData = await response.json()
        if (responseData.message !== 'success') {
          throw new Error(responseData.message)
        }
        Object.assign(this.previousAttempt, this.currentAttempt)
        this.currentPreviousAttemptNumber = this.attemptMaxNumber
        this.currentAttempt.attemptID = responseData.attemptID
        this.currentAttempt.attemptID = responseData.attemptID
        this.currentAttempt.teacherFeedback = null
        this.currentAttempt.commentaries = []
        this.currentAttempt.studentAttempt = responseData.attempt
        this.problemInformation.userStatus = 'Ученик'
        this.attemptMaxNumber++
        window.localStorage.setItem('csrfToken', responseData.csrfToken)
        this.newAttemptDialogShow = false
        this.newAttemptLoading = false
        /* toBase64(this.newAttemptFile).then(
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
        ) */
      }
    },
    wdAddNewAttempt: null,
    async onRowClick (...args) {
      this.listLoading = true
      const r = args[0][1]
      this.currentSessionID = r.sessionID
      await this.getSession()
      this.listLoading = false
    },
    wdOnRowClick: null,
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
    async updateSessionTable (...args) {
      this.listLoading = true
      const props = args[0][0]
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
          ~data.sessionInfo[i].studentGroup
            ? data.sessionInfo[i].studentGroup
            : '-'
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
      const userStatus = this.problemInformation.userStatus
      const getParameters = new URLSearchParams()
      getParameters.append('problemID', userStatus === 'Учитель' ? '-1' : this.$route.params.task_id)
      getParameters.append('sessionID', userStatus === 'Учитель' ? this.currentSessionID : '-1')
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
      const userStatus = this.problemInformation.userStatus
      const requestData = {
        problemID: userStatus === 'Учитель' ? '-1' : this.$route.params.task_id,
        sessionID: userStatus === 'Учитель' ? this.currentSessionID : '-1',
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
    decoratorExceptionHandler (f, ...flags) {
      return async (...args) => {
        try {
          await f(args)
        } catch (e) {
          console.log(e)
          for (let i = 0; i < flags.length; i++) {
            this[flags[i]] = false
          }
          this.errorMessage =
            Object.prototype.hasOwnProperty.call(Constants.ERROR_MESSAGES, e.message)
              ? Constants.ERROR_MESSAGES[e.message]
              : 'Нет соединения.'
          this.errorDialogShow = true
        }
      }
    },
    wdUpdateSessionTable: null,
    async getSession () {
      await this.getAttemptNumber()
      const currentAttempt = await this.getAttempt(this.attemptMaxNumber)
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
      this.currentAttempt.commentaries = currentAttempt.commentariesInfo.commentaries || []
    },
    async initPage () {
      this.pageLoading = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      this.userID = this.$store.getters['userDataStore/userInformationGetter'].id
      try {
        await this.getProblem()
        switch (this.problemInformation.userStatus) {
          case 'Учитель':
            await this.updateSessionTable(['random string'])
            break
          case 'Ученик':
            await this.getSession()
            break
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
    this.wdUpdateSessionTable = this.decoratorExceptionHandler(this.updateSessionTable, 'listLoading')
    this.wdAddNewAttempt = this.decoratorExceptionHandler(this.addNewAttempt, 'newAttemptLoading')
    this.wdAddNewCommentary = this.decoratorExceptionHandler(this.addNewCommentary, 'newCommentaryLoading')
    this.wdOnRowClick = this.decoratorExceptionHandler(this.onRowClick, 'listLoading', 'currentSessionID')
    this.wdDeleteCommentary = this.decoratorExceptionHandler(this.deleteCommentary, 'deleteCommentaryLoading')
    this.wdStatusChange = this.decoratorExceptionHandler(this.statusChange, 'statusChangeLoading')
    await this.initPage()
  },
  watch: {
    $route: function () {
      this.pageLoading = true
      this.initPage()
    }
  },
  computed: {
    isTeacher () {
      return this.problemInformation.userStatus === 'Учитель'
    }
  }
}
</script>

<style scoped>

</style>
