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
      v-if="problemWasDeletedFlag"
    >
      Задача была успешно удалена.
      <template v-slot:action>
        <q-btn
          no-caps
          color="white"
          text-color="black"
          label="На предыдущую страницу"
          @click="onPreviousPage"
        />
      </template>
    </q-banner>
    <div
      class="column items-center q-py-sm q-gutter-y-sm"
      v-if="!pageLoading && !problemWasDeletedFlag"
    >
      <TaskInfo
        v-bind="problemInformation"
        :deleting="deleteProblemLoading"
        :delete-button-show="true"
        :edit-button-show="false"
        :sunset-button-show="false"
        :sunrise-button-show="false"
        :admin-commentary-show="rejectionReasonShow"
        :complexity-show="complexityShow"
        delete-tooltip="Удалить задачу"
        class="content-background content-shadow"
        @delete="onProblemDeleting"
      />
      <div
        class="column student-table content-shadow content-background"
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
            @input="updateSessionListWithDecorator"
            debounce="1000"
            maxlength="60"
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
        <div
          v-if="listLoading"
          class="column items-center justify-center"
        >
          <LoadingSpinner
            :loading="listLoading"
          />
        </div>
        <div
          v-if="!listLoading"
        >
          <q-virtual-scroll
            ref="sessionList"
            class="session-list-for-task"
            :items="sessions"
          >
            <template
              v-slot="{ item }"
            >
              <Session
                v-bind="item"
                :active-session-i-d="currentSessionID.toString()"
                @click="getAttempts"
              />
            </template>
          </q-virtual-scroll>
          Всего найдено учеников: {{ allSessionCount }}</div>
      </div>
      <q-banner
        class="content-shadow q-my-xs"
        style="width: 100%"
        v-if="!attemptsLoading && !currentSessionID"
      >
        Пожалуйста, выберите ученика.
      </q-banner>
      <div
        v-if="attemptsLoading"
        class="column items-center justify-center q-mt-xs content-background content-shadow"
        style="padding: 3px 3px 3px 3px; width: 100%"
      >
        <LoadingSpinner
          :loading="attemptsLoading"
        />
      </div>
      <div
        v-if="!attemptsLoading && currentSessionID"
        class="column no-wrap q-gutter-x-sm"
      >
        <div
          class="column q-gutter-y-sm items-center"
        >
          <div
            class="column content-background content-shadow"
            style="width: 100%;"
          >
            <div
              class="row q-pa-sm"
              style="justify-content: space-between"
            >
              <div
                class="text-h6"
                style="font-weight: 400"
              >
                {{ 'Попытки ученика ' + currentSession.studentFullName }}
              </div>
            </div>
            <q-virtual-scroll
              ref="attemptList"
              class="attempt-list q-px-sm"
              :items="attempts"
            >
              <template
                v-slot="{ item }"
              >
                <Attempt
                  v-bind="item"
                  :button-information="buttonInformationArray"
                  :active-attempt-i-d="currentAttemptID.toString()"
                  :parent-loading-flag="deleteStudentAttemptLoading"
                  :show-teacher-feedback-status="item.teacherFeedbackStatus !== ''"
                  @click="getAttempt"
                  @deleteClick="onAttemptDeleting"
                  @downloadClick="fileDownload"
                  @eyeClick="onEyeClick"
                />
              </template>
            </q-virtual-scroll>
            <div
              class="q-pb-sm q-px-sm"
            >
              Попыток у этого ученика: {{ attempts.length }}
            </div>
          </div>
          <div
            v-if="attemptLoading"
            class="column items-center justify-center content-shadow content-background"
            style="width: 100%; padding: 3px 3px 3px 3px"
          >
            <LoadingSpinner
              :loading="attemptLoading"
            />
          </div>
          <q-banner
            class="content-shadow q-my-xs"
            style="width: 100%"
            v-if="!attemptLoading && !currentAttemptID"
          >
            Пожалуйста, выберите попытку.
          </q-banner>
          <div
            v-if="!attemptLoading && currentAttemptID"
            class="row no-wrap full-attempt"
          >
            <TeacherFeedback
              v-if="currentAttempt.teacherFeedback"
              v-bind="currentAttempt.teacherFeedback"
              :deleting="deleteTeacherFeedbackLoading"
              :show-delete-button="true"
              :show-eye-button="true"
              :attempt-date="currentAttemptObj.studentAttempt.dateOfLastChange"
              @delete="onTeacherFeedbackDeleting"
              class="content-background content-shadow full-attempt-teacher"
            />
            <q-banner
              v-else
              class="content-shadow q-px-sm"
              style="width: 100%"
            >
              Преподаватель пока не дал отзыв на эту попытку.
            </q-banner>
          </div>
          <div
            class="attempt-discussion content-shadow content-background"
            v-if="!attemptLoading && currentAttemptID"
          >
            <div
              class="text-h6"
            >
              Сообщения
            </div>
            <q-banner
              class="content-shadow q-my-xs"
              style="width: 100%"
              v-if="currentAttempt.commentaries.length === 0"
            >
              Сообщений нет.
            </q-banner>
            <div
              class="q-gutter-y-sm"
              v-else
            >
              <q-virtual-scroll
                style="max-height: 400px"
                :items="currentAttempt.commentaries"
              >
                <template
                  v-slot="{ item }"
                >
                  <Commentary
                    :author-full-name="item.authorID === teacherInfo.id ? teacherInfo.fullName : studentInfo.fullName"
                    :author-i-d="item.authorID"
                    :avatar-path="item.authorID === teacherInfo.id ? teacherInfo.avatarPath : studentInfo.avatarPath"
                    :commentary-date="item.commentaryDate"
                    :commentary-i-d="item.commentaryID"
                    :commentary-text="item.commentaryText"
                    :user-status="problemInformation.userStatus"
                    :loading="deleteCommentaryLoading"
                    :show-delete-button="true"
                    @delete="onCommentaryDeleting"
                  />
                </template>
              </q-virtual-scroll>
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
            Вы уверены? Это действие отменить нельзя.
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
            color="primary"
            @click="deleteTarget"
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
        <q-card-section
          class="q-pt-none"
        >
          Для фильтрации по имени нужно просто ввести необходимый запрос.<br>
          Для фильтрации по группе запрос нужно начать с '.g' (без кавычек).<br>
          Чтобы найти учеников, которые не указали группу, введите '.g-' (без кавычек).
        </q-card-section>
        <q-card-actions
          align="right"
        >
          <q-btn
            flat
            label="OK"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="showProblemFlag"
    >
      <q-pdfviewer
        v-model="showProblemFlag"
        :src="currentAttemptFileURL"
      >
      </q-pdfviewer>
    </q-dialog>
  </q-page>
</template>

<script>
import TaskInfo from 'components/TaskInfo'
import TeacherFeedback from 'components/TeacherFeedback'
import Attempt from 'components/Attempt'
import Session from 'components/Session'
import Commentary from 'components/Commentary'
import ErrorDialog from 'components/ErrorDialog'
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, exceptionHandlerDecorator, toLocalDate } from 'boot/Constants'
export default {
  components: { TaskInfo, Attempt, Session, TeacherFeedback, Commentary, ErrorDialog, LoadingSpinner },
  name: 'Task',
  data () {
    return {
      errorDialogShow: false,
      pageLoading: false,
      problemWasDeletedFlag: false,
      confirmDialogShow: false,
      attemptLoading: false,
      attemptsLoading: false,
      deleteProblemLoading: false,
      deleteStudentAttemptLoading: false,
      listLoading: false,
      deleteTeacherFeedbackLoading: false,
      deleteCommentaryLoading: false,
      showProblemFlag: false,
      infoDialogShow: false,
      buttonInformationArray: [
        {
          icon: 'bi-eye',
          eventName: 'eyeClick',
          tooltipMessage: 'Просмотр попытки'
        },
        {
          icon: 'bi-box-arrow-in-down',
          eventName: 'downloadClick',
          tooltipMessage: 'Скачать файл с попыткой'
        },
        {
          icon: 'bi-trash',
          eventName: 'deleteClick',
          tooltipMessage: 'Удалить попытку'
        }
      ],
      problemInformation: null,
      errorMessage: '',
      filterValue: '',
      sessions: [],
      allSessionCount: null,
      attempts: [],
      target: {
        id: null,
        mode: null,
        successFunction: null,
        deletingFlag: null
      },
      sessionData: null,
      currentSessionID: false,
      currentSession: null,
      currentAttemptID: false,
      currentAttemptFileURL: '',
      teacherInfo: {
        id: null,
        avatarPath: null,
        fullName: null
      },
      studentInfo: {
        avatarPath: null,
        fullName: null
      },
      currentAttempt: {
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
  computed: {
    rejectionReasonShow () {
      return this.problemInformation.problemStatus === 'Отклонена'
    },
    currentAttemptObj () {
      return this.attempts.find((e, i, a) => e.studentAttempt.id === this.currentAttemptID)
    },
    complexityShow () {
      return this.problemInformation.problemStatus !== 'Отклонена' && this.problemInformation.problemStatus !== 'Проверяется'
    },
    updateSessionListWithDecorator () {
      return exceptionHandlerDecorator.call(this, [this.updateSessionList], 'listLoading')
    }
  },
  methods: {
    onEyeClick (attemptID) {
      const currentAttempt = this.attempts.find((e, i, a) => e.studentAttempt.id === attemptID)
      this.currentAttemptFileURL = currentAttempt.studentAttempt.fileURL
      this.showProblemFlag = true
    },
    onProblemDeleting () {
      this.target.id = this.problemInformation.problemID
      this.target.mode = 'problem'
      this.target.successFunction = this.problemSuccessFunction
      this.target.deletingFlag = 'deleteProblemLoading'
      this.confirmDialogShow = true
    },
    onAttemptDeleting (attemptID) {
      this.target.id = attemptID
      this.target.mode = 'student attempt'
      this.target.successFunction = this.attemptSuccessFunction
      this.target.deletingFlag = 'deleteStudentAttemptLoading'
      this.confirmDialogShow = true
    },
    onTeacherFeedbackDeleting () {
      this.target.id = this.currentAttemptID
      this.target.mode = 'teacher feedback'
      this.target.successFunction = this.teacherFeedbackSuccessFunction
      this.target.deletingFlag = 'deleteTeacherFeedbackLoading'
      this.confirmDialogShow = true
    },
    onCommentaryDeleting (commentaryID) {
      this.target.id = commentaryID
      this.target.mode = 'commentary'
      this.target.successFunction = this.commentarySuccessFunction
      this.target.deletingFlag = 'deleteCommentaryLoading'
      this.confirmDialogShow = true
    },
    commentarySuccessFunction () {
      const index = this.currentAttempt.commentaries.findIndex((e, i, a) => e.commentaryID === this.target.id)
      this.currentAttempt.commentaries.splice(index, 1)
    },
    problemSuccessFunction () {
      this.problemWasDeletedFlag = true
    },
    onPreviousPage () {
      this.$router.go(-1)
    },
    fileDownload (attemptID) {
      const a = document.createElement('a')
      a.href = this.attempts.find((e, i, a) => e.studentAttempt.id === attemptID).studentAttempt.fileURL
      a.download = '' + attemptID + 'student.pdf'
      a.click()
    },
    teacherFeedbackSuccessFunction () {
      const currentAttempt = this.attempts.find((e, i, a) => e.studentAttempt.id === this.currentAttemptID)
      currentAttempt.studentAttempt.status = 'Попытка проверяется учителем'
      currentAttempt.teacherFeedbackStatus = ''
      this.currentAttempt.teacherFeedback = null
    },
    async attemptSuccessFunction () {
      if (this.attempts.length === 1) {
        this.sessions = this.sessions.filter(e => e.sessionID !== this.currentSessionID)
        this.allSessionCount--
        this.currentAttemptID = false
        this.currentSessionID = false
        this.$q.notify({
          type: 'info',
          color: 'primary',
          textColor: 'white',
          message: 'Попытка удалена.'
        })
      } else {
        if (this.currentAttemptID === this.target.id) {
          this.currentAttemptID = false
        }
        this.attempts = this.attempts.filter(e => e.studentAttempt.id !== this.target.id)
      }
    },
    async deleteTarget () {
      this[this.target.deletingFlag] = true
      const requestData = {
        targetID: this.target.id,
        targetMode: this.target.mode,
        csrfToken: window.localStorage.getItem('csrfToken')
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/delete-target', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      await this.target.successFunction()
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this[this.target.deletingFlag] = false
    },
    async getProblem () {
      const currentProblemID = this.$route.params.task_id
      const response = await fetch(
        Constants.SERVER_URL + '/api/admin/get-problem-information/' + currentProblemID,
        Constants.GET_INIT
      )
      const data = await response.json()
      if (data.message !== 'success') {
        throw new Error(data.message)
      }
      data.data.problemStartLine = toLocalDate(data.data.problemStartLine)
      data.data.problemDeadline = toLocalDate(data.data.problemDeadline)
      this.teacherInfo.id = data.data.authorID
      this.teacherInfo.avatarPath = data.data.authorAvatarPath
      this.teacherInfo.fullName = data.data.authorFullName
      this.problemInformation = data.data
    },
    // CHECKED
    async getAttempt (attemptID) {
      this.attemptLoading = true
      this.currentAttemptID = attemptID
      const requestData = {
        attemptID: attemptID
      }
      const response = await fetch(
        Constants.SERVER_URL + '/api/admin/get-session',
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
        this.currentAttempt.teacherFeedback = responseData.attempt.teacherFeedback
        this.currentAttempt.commentaries = responseData.attempt.commentaries
        this.attemptLoading = false
      }
    },
    // CHECKED
    async getAttempts (sessionID) {
      this.attemptsLoading = true
      this.currentSessionID = sessionID
      this.currentAttemptID = false
      const getParameters = new URLSearchParams()
      getParameters.append('sessionID', sessionID)
      const response = await fetch(
        Constants.SERVER_URL + '/api/admin/get-session?' + getParameters.toString(),
        Constants.GET_INIT
      )
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      } else {
        this.attempts = responseData.attempts
        this.attempts.sort((lhs, rhs) => {
          const lhsDate = new Date(lhs.studentAttempt.dateOfLastChange)
          const rhsDate = new Date(rhs.studentAttempt.dateOfLastChange)
          if (lhsDate < rhsDate) {
            return 1
          }
          if (lhsDate > rhsDate) {
            return -1
          }
          return 0
        })
        this.currentSession = this.sessions.find((e, i, a) => e.sessionID === this.currentSessionID)
        this.studentInfo.avatarPath = this.currentSession.studentAvatarPath
        this.studentInfo.fullName = this.currentSession.studentFullName
        this.attemptsLoading = false
      }
    },
    // CHECKED
    async updateSessionList (...args) {
      this.listLoading = true
      const currentProblemID = this.$route.params.task_id
      const getParameters = new URLSearchParams()
      getParameters.append('filterValue', this.filterValue)
      const response = await fetch(
        Constants.SERVER_URL + '/api/admin/get-sessions-by-problem/' + currentProblemID + '?' + getParameters.toString(),
        Constants.GET_INIT
      )
      const data = await response.json()
      if (data.message !== 'success') {
        throw new Error(data.message)
      }
      this.sessions = data.sessionInfo
      this.allSessionCount = data.sessionCount
      this.listLoading = false
    },
    async initPage () {
      this.pageLoading = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      await this.getProblem()
      await this.updateSessionList()
      if (this.$route.params.session_id !== '-1') {
        this.currentSessionID = Number(this.$route.params.session_id)
      }
      if (this.currentSessionID) {
        await this.getAttempts(this.currentSessionID)
      }
      this.pageLoading = false
      if (this.currentSessionID) {
        await this.$nextTick()
        const sessionIndex = this.sessions.findIndex((e, i, a) => e.sessionID === this.currentSessionID)
        this.$refs.sessionList.scrollTo(sessionIndex)
      }
    }
  },
  async created () {
    this.getAttempt = exceptionHandlerDecorator.call(this, [this.getAttempt], 'currentAttemptID', 'attemptLoading')
    this.getAttempts = exceptionHandlerDecorator.call(this, [this.getAttempts], 'currentSessionID', 'attemptsLoading')
    this.deleteTarget = exceptionHandlerDecorator.call(this, [this.deleteTarget], 'deleteProblemLoading', 'deleteStudentAttemptLoading', 'deleteTeacherFeedbackLoading', 'deleteCommentaryLoading')
    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(this, [this.initPage, true])()
    }
  }
}
</script>
