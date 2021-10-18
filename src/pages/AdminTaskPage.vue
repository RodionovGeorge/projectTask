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
        :deleting="deleteProblemLoading"
        :edit-button-show="false"
        :sunrise-button-show="false"
        :sunset-button-show="false"
        :delete-button-show="true"
        :complexity-show="complexityShow"
        :admin-commentary-show="rejectionReasonShow"
        class="content-background content-shadow"
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
            debounce="1000"
            label="Поиск"
            @input="updateSessionTableWithDecorator"
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
          :columns="columns"
          :visible-columns="visibleColumns"
          :pagination.sync="pagination"
          :loading="listLoading"
          :rows-per-page-options="[pagination.rowsPerPage]"
          row-key="sessionID"
          binary-state-sort
          @request="updateSessionTableWithDecorator"
          @row-click="onRowClick"
          :data="sessionData"
          no-data-label="Ученики не найдены."
        >
          <template
            v-slot:body-cell="props"
          >
            <q-td
              :props="props"
              :class="props.row.sessionID === currentSessionID ? 'bg-primary text-white' : 'bg-white text-black'"
            >
              {{props.value}}
            </q-td>
          </template>
        </q-table>
      </div>
      <div
        class="column no-wrap q-gutter-x-sm"
        v-if="currentSessionID"
      >
        <div
          class="column q-gutter-y-sm items-center"
        >
          <div
            class="row no-wrap full-attempt"
          >
            <AttemptForStudent
              v-bind="currentAttempt.studentAttempt"
              :show-delete-button="true"
              :deleting="deleteStudentAttemptLoading"
              class="content-background content-shadow full-attempt-student"
              @delete="confirmDialogShow = true"
            />
            <TeacherFeedback
              v-bind="currentAttempt.teacherFeedback"
              :deleting="deleteTeacherFeedbackLoading"
              :show-delete-button="currentAttempt.studentAttempt.checkStatus === 'Проверена'"
              class="content-background content-shadow full-attempt-teacher"
              @delete="confirmDialogShow = true"
            />
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
                    :author-full-name="teacherInfo.id === item.authorID ? teacherInfo.fullName : studentInfo.fullName"
                    :author-i-d="item.authorID"
                    :avatar-path="teacherInfo.id === item.authorID ? teacherInfo.avatarPath : studentInfo.avatarPath"
                    :commentary-date="item.commentaryDate"
                    :commentary-i-d="item.commentaryID"
                    :commentary-text="item.commentaryText"
                    :user-status="problemInformation.userStatus"
                    :loading="deleteCommentaryLoading"
                    :show-delete-button="true"
                    @delete="confirmDialogShow = true"
                  />
                </template>
              </q-virtual-scroll>
            </div>
          </div>
          <div
            class="content-background content-shadow previous-attempts"
            v-if="attemptMaxNumber > 1 && !attemptLoading"
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
                @input="onPaginationClick"
                boundary-numbers
              />
              <div
                class="row no-wrap full-attempt"
              >
                <AttemptForStudent
                  v-bind="previousAttempt.studentAttempt"
                  :show-delete-button="false"
                  class="content-shadow-for-white full-attempt-student"
                  @delete="confirmDialogShow = true"
                />
                <TeacherFeedback
                  v-bind="previousAttempt.teacherFeedback"
                  :show-delete-button="false"
                  class="content-shadow-for-white full-attempt-teacher"
                  @delete="confirmDialogShow = true"
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
                    v-if="paCommentaryNotEmpty"
                    style="max-height: 200px"
                    :items="previousAttempt.commentaries"
                  >
                    <template
                      v-slot="{ item }"
                    >
                      <Commentary
                        :author-full-name="teacherInfo.id === item.authorID ? teacherInfo.fullName : studentInfo.fullName"
                        :author-i-d="item.authorID"
                        :avatar-path="teacherInfo.id === item.authorID ? teacherInfo.avatarPath : studentInfo.avatarPath"
                        :commentary-date="item.commentaryDate"
                        :commentary-i-d="item.commentaryID"
                        :commentary-text="item.commentaryText"
                        :user-status="problemInformation.userStatus"
                        :show-delete-button="true"
                        @delete="confirmDialogShow = true"
                      />
                    </template>
                  </q-virtual-scroll>
                  <div
                    v-else
                  >
                    Комментариев нет.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <LoadingSpinner
            v-if="attemptLoading"
            :loading="attemptLoading"
          />
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
            Вы уверены? Это действие отменить нельзя. <br> Удаление влечет блокировку соответствующей роли пользователя.
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
          Для фильтрации по имени нужно просто ввести необходимый запрос.<br>
          Для фильтрации по группе запрос нужно начать с '.g' (без кавычек).
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
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
import ErrorDialog from 'components/ErrorDialog'
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, exceptionHandlerDecorator, toLocalDate } from 'boot/Constants'
export default {
  components: { TaskInfo, AttemptForStudent, TeacherFeedback, Commentary, ErrorDialog, LoadingSpinner },
  name: 'Task',
  data () {
    return {
      errorDialogShow: false,
      pageLoading: false,
      confirmDialogShow: false,
      attemptLoading: false,
      deleteProblemLoading: false,
      deleteStudentAttemptLoading: false,
      listLoading: false,
      deleteTeacherFeedbackLoading: false,
      deleteCommentaryLoading: false,
      problemInformation: null,
      errorMessage: '',
      filterValue: '',
      sessionData: null,
      visibleColumns: ['studentFullName', 'studentGroup'],
      columns: [
        {
          name: 'sessionID',
          field: 'sessionID'
        },
        {
          name: 'studentFullName',
          label: 'Ученик',
          align: 'center',
          field: 'studentFullName',
          sortable: true
        },
        {
          name: 'studentGroup',
          label: 'Группа',
          align: 'center',
          format: val => val === '-1' ? '-' : val,
          field: 'studentGroup',
          sortable: true
        }
      ],
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: null
      },
      currentSessionID: false,
      teacherInfo: {
        id: null,
        avatarPath: null,
        fullName: null
      },
      studentInfo: {
        id: null,
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
  computed: {
    paCommentaryNotEmpty () {
      return this.previousAttempt.commentaries?.length
    },
    rejectionReasonShow () {
      return this.problemInformation.problemStatus === 'Отклонена'
    },
    complexityShow () {
      return this.problemInformation.problemStatus !== 'Отклонена' && this.problemInformation.problemStatus !== 'Проверяется'
    },
    updateSessionTableWithDecorator () {
      return exceptionHandlerDecorator.call(this, [this.updateSessionTable], 'listLoading')
    }
  },
  methods: {
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
      this.problemInformation = data.data
    },
    async onRowClick (...args) {
      this.listLoading = true
      const r = args[1]
      this.currentSessionID = r.sessionID
      await this.getSession()
      this.listLoading = false
    },
    async onPaginationClick (attemptNumber) {
      this.attemptLoading = true
      const attempt = await this.getAttempt(attemptNumber)
      this.previousAttempt.attemptID = attempt.attemptID
      this.previousAttempt.studentAttempt = attempt.studentAttempt
      this.previousAttempt.teacherFeedback = attempt.teacherFeedback
      this.previousAttempt.commentaries = attempt.commentariesInfo.commentaries || []
      this.attemptLoading = false
    },
    async getAttemptNumber () {
      const getParameters = new URLSearchParams()
      getParameters.append('sessionID', this.currentSessionID)
      const response = await fetch(
        Constants.SERVER_URL + '/api/admin/get-session?' + getParameters.toString(),
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
        sessionID: this.currentSessionID,
        requestAttemptNumber: attemptNumber
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
        return responseData.attempt
      }
    },
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
        this.previousAttempt.commentaries = lastPreviousAttempt.commentariesInfo.commentaries || []
        this.currentPreviousAttemptNumber = this.attemptMaxNumber - 1
      }
      this.currentAttempt.attemptID = currentAttempt.attemptID
      this.currentAttempt.studentAttempt = currentAttempt.studentAttempt
      this.currentAttempt.teacherFeedback = currentAttempt.teacherFeedback
      this.currentAttempt.commentaries = currentAttempt.commentariesInfo.commentaries || []
    },
    async updateSessionTable (...args) {
      this.listLoading = true
      const props = args[0].props
      console.log(args)
      const { page, rowsPerPage, sortBy, descending } =
        typeof props === 'string'
          ? this.pagination
          : props
      const currentProblemID = this.$route.params.task_id
      const getParameters = new URLSearchParams()
      getParameters.append('filterValue', this.filterValue)
      getParameters.append('currentPage', page)
      getParameters.append('pageSize', rowsPerPage)
      getParameters.append('sortField', sortBy || 'studentFullName')
      getParameters.append('sortDir', descending ? 'desc' : 'asc')
      const response = await fetch(
        Constants.SERVER_URL + '/api/admin/get-sessions-by-problem/' + currentProblemID + '?' + getParameters.toString(),
        Constants.GET_INIT
      )
      const data = await response.json()
      if (data.message !== 'success') {
        throw new Error(data.message)
      }
      this.sessionData = data.sessionInfo
      this.pagination.rowsNumber = data.sessionCount
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.page = page
      this.listLoading = false
    },
    async initPage () {
      this.pageLoading = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      await this.getProblem()
      if (this.$route.params.session_id !== '-1') {
        this.currentSessionID = Number(this.$route.params.session_id)
      }
      if (this.currentSessionID) {
        await this.getSession()
        this.filterValue = this.studentInfo.fullName
      }
      await this.updateSessionTable('random string')
      this.pageLoading = false
    }
  },
  async created () {
    this.onRowClick = exceptionHandlerDecorator.call(this, [this.onRowClick], 'listLoading', 'currentSessionID')
    this.onPaginationClick = exceptionHandlerDecorator.call(this, [this.onPaginationClick], 'attemptLoading')
    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(this, [this.initPage, true])()
    }
  }
}
</script>
