<template>
<q-page
  class="column items-center"
>
  <LoadingSpinner
    :loading="pageLoading"
  />
  <div
    class="column items-center q-py-sm q-gutter-y-sm"
    v-if="!pageLoading && !problemIsBanned"
  >
    <TaskInfo
      v-bind="problemInformation"
      :loading="statusChangeLoading"
      :deleting="deleteProblemLoading"
      :delete-button-show="isTeacher"
      :edit-button-show="isTeacher && (problemInformation.problemStatus === 'Принята' || problemInformation.problemStatus === 'Скрыта')"
      :sunset-button-show="isTeacher && problemInformation.problemStatus === 'Принята'"
      :sunrise-button-show="isTeacher && problemInformation.problemStatus === 'Скрыта'"
      :admin-commentary-show="isTeacher && problemInformation.problemStatus === 'Отклонена'"
      :complexity-show="problemInformation.problemStatus !== 'Отклонена' && problemInformation.problemStatus !== 'Проверяется'"
      :problem-status-show="isTeacher"
      class="content-background content-shadow"
      @status-change="statusChange"
      @delete="confirmDialogShow = true"
      @edit="onProblemEditClick"
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
          @input="updateSessionTableWithDecorator"
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
      <q-table
        square
        flat
        bordered
        @request="updateSessionTableWithDecorator"
        @row-click="onRowClick"
        :columns="columns"
        :visible-columns="visibleColumns"
        :pagination.sync="pagination"
        :loading="listLoading"
        :rows-per-page-options="[pagination.rowsPerPage]"
        row-key="sessionID"
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
    <q-btn
      v-if="problemInformation.userStatus === 'Нет' && userHaveStudentRole"
      class="content-background"
      label="Добавить попытку"
      @click="newAttemptDialogShow = true"
      no-caps
    />
    <q-banner
      class="content-shadow q-mt-sm text-center"
      style="width: 100%"
      v-if="!isTeacher && currentSessionStatus === 'Закрыта'"
    >
      Преподаватель закончил решение этой задачи с вами.
    </q-banner>
    <q-banner
      class="content-shadow q-my-xs"
      style="width: 100%"
      v-if="currentSessionStatus === 'Заблокирована'"
    >
      Ход решения был заблокирован администратором.
    </q-banner>
    <div
      class="column no-wrap q-gutter-x-sm"
      v-else-if="problemInformation.userStatus === 'Ученик' || (isTeacher && currentSessionID)"
    >
      <div
        class="column q-gutter-y-sm items-center"
      >
        <div
          class="row no-wrap full-attempt"
        >
          <AttemptForStudent
            v-bind="currentAttempt.studentAttempt"
            :show-delete-button="sdbForStudentAttempt"
            :deleting="deleteStudentAttemptLoading"
            @delete="deleteStudentAttempt"
            class="content-background content-shadow full-attempt-student"
          />
          <TeacherFeedback
            v-bind="currentAttempt.teacherFeedback"
            :deleting="deleteTeacherFeedbackLoading"
            :show-delete-button="isTeacher && currentAttempt.studentAttempt.checkStatus === 'Проверена'"
            @delete="deleteTeacherFeedback"
            class="content-background content-shadow full-attempt-teacher"
          />
        </div>
        <q-btn
          v-if="isTeacher && currentAttempt.studentAttempt.checkStatus === 'Проверяется'"
          label="Проверить попытку"
          style="width: 25%"
          class="content-background"
          no-caps
          @click="onEdit"
        />
        <q-btn
          v-if="isTeacher && currentAttempt.studentAttempt.checkStatus === 'Проверена' && currentSessionStatus === 'Открыта'"
          label="Закончить общение"
          style="width: 25%"
          class="content-background"
          :loading="sessionStatusChangeLoading"
          @click="changeSessionStatus('Закрыта')"
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
          v-if="isTeacher && currentAttempt.studentAttempt.checkStatus === 'Проверена' && currentSessionStatus === 'Закрыта'"
          label="Возобновить общение"
          style="width: 25%"
          class="content-background"
          :loading="sessionStatusChangeLoading"
          @click="changeSessionStatus('Открыта')"
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
          v-if="problemInformation.userStatus === 'Ученик' && currentAttempt.studentAttempt.checkStatus === 'Проверена' && currentSessionStatus === 'Открыта'"
          label="Добавить попытку"
          style="width: 25%"
          class="content-background"
          no-caps
          @click="newAttemptDialogShow = true"
        />
        <div
          class="attempt-discussion content-shadow content-background"
        >
          <div
            class="text-h6"
          >
            Комментарии к попытке
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
                  :show-delete-button="userID === item.authorID"
                  @delete="deleteCommentary"
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
                :disable="currentSessionStatus === 'Закрыта'"
                v-on:keydown.enter.prevent.exact="addNewCommentary"
                v-on:keydown.shift.enter.prevent.exact="addLF"
                :loading="newCommentaryLoading"
                outlined
                placeholder="Напишите комментарий"
                style="width: 100%"
              >
                <template
                  v-if="!newCommentaryLoading"
                  v-slot:append
                >
                  <q-btn
                    icon="bi-caret-right"
                    flat
                    round
                    @click="addNewCommentary"
                  />
                </template>
              </q-input>
            </div>
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
              />
              <TeacherFeedback
                v-bind="previousAttempt.teacherFeedback"
                :show-delete-button="false"
                class="content-shadow-for-white full-attempt-teacher"
              />
            </div>
            <div
              class="commentary-list content-shadow-for-white"
            >
              <div
                class="text-h6"
              >
                Комментарии к попытке
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
                      :author-full-name="!(isTeacher ? (item.authorID !== userID) : (item.authorID === userID)) ? teacherInfo.fullName : studentInfo.fullName"
                      :author-i-d="item.authorID"
                      :avatar-path="!(isTeacher ? (item.authorID !== userID) : (item.authorID === userID)) ? teacherInfo.avatarPath : studentInfo.avatarPath"
                      :commentary-date="item.commentaryDate"
                      :commentary-i-d="item.commentaryID"
                      :commentary-text="item.commentaryText"
                      :user-status="problemInformation.userStatus"
                      :show-delete-button="false"
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
  <q-banner
    inline-actions
    class="content-shadow q-my-xs"
    v-if="!pageLoading && problemIsBanned"
  >
    Задача была заблокирована администратором.
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
          @click="deleteProblem"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="editTaskDialogShow"
    square
    persistent
  >
    <div
      class="column content-background no-wrap items-center q-pa-xs"
    >
      <div
        class="text-h6"
      >
        Редактирование
      </div>
      <div
        class="column no-wrap q-mb-xs"
      >
        <q-input
          v-model="newAuthorCommentary"
          type="textarea"
          style="height: 100%"
          outlined
          square
          label="Комментарий"
          :maxlength="commentaryToProblemLength"
          class="new-task-commentary q-mb-xs"
        />
        <q-date
          v-model="dateRange"
          range
          square
          mask="DD.MM.YYYY"
          title="Срок приема решений"
          :options="dateRestriction"
        />
      </div>
      <div
        class="row"
      >
        <q-btn
          label="Отмена"
          flat
          no-caps
          color="primary"
          v-close-popup
        />
        <q-btn
          label="Готово"
          class="q-ml-xs"
          flat
          no-caps
          color="primary"
          :loading="editingLoading"
          @click="onEditingProblem"
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
          max-file-size="5000000"
          error-message="Пожалуйста, добавьте файл с условием (<5мБ, .pdf, .tex)"
          accept=".pdf, .tex"
          :rules="[() => this.newAttemptFile !== null || 'Пожалуйста, выберите файл с условием (<5мБ, .pdf, .tex)']"
          outlined
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
          :loading="newAttemptLoading"
          label="Загрузить попытку"
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
</q-page>
</template>

<script>
import TaskInfo from 'components/TaskInfo'
import AttemptForStudent from 'components/AttemptForStudent'
import TeacherFeedback from 'components/TeacherFeedback'
import Commentary from 'components/Commentary'
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, exceptionHandlerDecorator, toBase64, toLocalDate } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
import { date } from 'quasar'
export default {
  name: 'TaskT',
  components: { ErrorDialog, LoadingSpinner, TaskInfo, AttemptForStudent, TeacherFeedback, Commentary },
  data () {
    return {
      pageLoading: false,
      listLoading: false,
      deleteCommentaryLoading: false,
      deleteTeacherFeedbackLoading: false,
      deleteStudentAttemptLoading: false,
      deleteProblemLoading: false,
      statusChangeLoading: false,
      editTaskDialogShow: false,
      confirmDialogShow: false,
      sessionStatusChangeLoading: false,
      newCommentaryLoading: false,
      newAttemptLoading: false,
      newAttemptDialogShow: false,
      infoDialogShow: false,
      attemptLoading: false,
      errorDialogShow: false,
      editingLoading: false,
      commentaryToProblemLength: Constants.LENGTHS.commentaryToProblem,
      errorMessage: '',
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: null
      },
      filterValue: '',
      newAttemptFile: null,
      currentCommentary: '',
      sessionData: null,
      problemInformation: null,
      dateRange: { to: '', from: '' },
      newAuthorCommentary: '',
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
          format: val => val === '-1' ? '-' : val,
          field: 'studentGroup'
        },
        {
          name: 'haveNewContent',
          label: 'Обновления',
          align: 'center',
          format: val => val ? 'Да' : 'Нет',
          field: 'sessionHaveNewContentForTeacher'
        }
      ],
      // Из-за механизма обработки ошибок это поле может принимать
      // либо значение false, когда преподаватель ничего не выбрал или при выборе произошла ошибка
      // либо числовое значние, когда все в порядке
      // (Когда при выборе ученика происходит ошибка, то нужно сбросить выбранную сессию)
      currentSessionID: false,
      currentSessionStatus: null,
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
    addLF () {
      this.currentCommentary = this.currentCommentary + '\n'
    },
    onProblemEditClick () {
      this.dateRange.to = this.problemInformation.problemDeadline
      this.dateRange.from = this.problemInformation.problemStartLine
      this.newAuthorCommentary = this.problemInformation.authorCommentary
      this.editTaskDialogShow = true
    },
    dateRestriction (dateForCheck) {
      if (date.isSameDate(date.extractDate(dateForCheck, 'YYYY/MM/DD'), date.extractDate(this.problemInformation.problemStartLine, 'DD.MM.YYYY'))) {
        return true
      }
      if (date.isSameDate(date.extractDate(dateForCheck, 'YYYY/MM/DD'), date.extractDate(this.problemInformation.problemDeadline, 'DD.MM.YYYY'))) {
        return true
      }
      const dateNow = new Date()
      const maxDate = new Date(8640000000000000)
      return date.isBetweenDates(dateForCheck, dateNow, maxDate, {
        inclusiveFrom: true,
        inclusiveTo: false,
        onlyDate: true
      })
    },
    async onEditingProblem () {
      if (this.dateRange === null || this.dateRange.to === '' || this.dateRange.from === '') {
        this.errorMessage = 'Пожалуйста, выберите интервал приема решений.'
        this.errorDialogShow = true
        return
      }
      this.editingLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        newStartDate: date.extractDate(this.dateRange.from, 'DD.MM.YYYY'),
        newEndDate: date.extractDate(this.dateRange.to, 'DD.MM.YYYY'),
        newCommentary: this.newAuthorCommentary,
        problemID: this.$route.params.task_id
      }
      const response = await fetch(Constants.SERVER_URL + '/api/problem-editing', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.problemInformation.authorCommentary = this.newAuthorCommentary
      this.problemInformation.problemStartLine = this.dateRange.from
      this.problemInformation.problemDeadline = this.dateRange.to
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.editTaskDialogShow = false
      this.editingLoading = false
    },
    async onMainPage () {
      await this.$router.push('/')
    },
    async statusChange (...args) {
      this.statusChangeLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        problemID: this.problemInformation.problemID,
        newStatusTitle: args[0]
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
    async deleteProblem () {
      this.deleteProblemLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        problemID: this.$route.params.task_id
      }
      const response = await fetch(Constants.SERVER_URL + '/api/problem-editing', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      await this.$router.push('/my/tasks')
    },
    async deleteStudentAttempt () {
      this.deleteStudentAttemptLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        attemptID: this.currentAttempt.attemptID
      }
      const response = await fetch(Constants.SERVER_URL + '/api/attempt-editing', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.attemptMaxNumber--
      if (this.attemptMaxNumber === 0) {
        this.problemInformation.userStatus = 'Нет'
        this.currentAttempt.attemptID = null
        for (const field of Object.keys(this.currentAttempt.studentAttempt)) {
          this.currentAttempt.studentAttempt[field] = null
        }
      } else {
        const newCurrentAttempt = await this.getAttempt(this.attemptMaxNumber)
        this.currentAttempt.attemptID = newCurrentAttempt.attemptID
        this.currentAttempt.studentAttempt = newCurrentAttempt.studentAttempt
        this.currentAttempt.teacherFeedback = newCurrentAttempt.teacherFeedback
        this.currentAttempt.commentaries = newCurrentAttempt.commentariesInfo.commentaries || []
        if (this.attemptMaxNumber > 1) {
          const lastPreviousAttempt = await this.getAttempt(this.attemptMaxNumber - 1)
          this.previousAttempt.attemptID = lastPreviousAttempt.attemptID
          this.previousAttempt.studentAttempt = lastPreviousAttempt.studentAttempt
          this.previousAttempt.teacherFeedback = lastPreviousAttempt.teacherFeedback
          this.previousAttempt.commentaries = lastPreviousAttempt.commentariesInfo.commentaries || []
        }
      }
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.deleteStudentAttemptLoading = false
    },
    async deleteTeacherFeedback () {
      this.deleteTeacherFeedbackLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        attemptID: this.currentAttempt.attemptID
      }
      const response = await fetch(Constants.SERVER_URL + '/api/check-attempt/-1', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.currentAttempt.studentAttempt.checkStatus = 'Проверяется'
      for (const field of Object.keys(this.currentAttempt.teacherFeedback)) {
        this.currentAttempt.teacherFeedback[field] = null
      }
    },
    async deleteCommentary (...args) {
      this.deleteCommentaryLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        commentaryID: args[0]
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
    async addNewCommentary (...args) {
      this.newCommentaryLoading = true

      let flag = true
      for (const c of this.currentCommentary) {
        if (c !== '\n') {
          flag = false
          break
        }
      }
      if (flag) {
        this.newCommentaryLoading = false
        return
      }

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
    async addNewAttempt (...args) {
      const fileInputCheck = this.$refs.filePicker.validate()
      if (fileInputCheck) {
        this.newAttemptLoading = true
        const fileForTransmitting = await toBase64(this.newAttemptFile)
        const data = {
          csrfToken: window.localStorage.getItem('csrfToken'),
          file: fileForTransmitting.substring(fileForTransmitting.indexOf(',') + 1),
          fileMIMEType: this.newAttemptFile.name.includes('.tex', this.newAttemptFile.name.length - 4) ? 'application/x-tex' : 'application/pdf',
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
        this.currentAttempt.teacherFeedback = null
        this.currentAttempt.commentaries = []
        this.currentAttempt.studentAttempt = responseData.attempt
        if (this.problemInformation.userStatus === 'Нет') {
          this.problemInformation.userStatus = 'Ученик'
          this.teacherInfo.avatarPath = this.problemInformation.avatarPath
          this.teacherInfo.fullName = this.problemInformation.authorFullName
          this.studentInfo.avatarPath = this.$store.getters['userDataStore/userInformationGetter'].avatarURL
          this.studentInfo.fullName = this.$store.getters['userDataStore/userFullName']
        }
        this.attemptMaxNumber++
        window.localStorage.setItem('csrfToken', responseData.csrfToken)
        this.newAttemptDialogShow = false
        this.newAttemptLoading = false
      }
    },
    async changeSessionStatus (newStatus) {
      this.sessionStatusChangeLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        newStatus: newStatus,
        sessionID: this.currentSessionID
      }
      const response = await fetch(Constants.SERVER_URL + '/api/session-for-problem/' + this.currentSessionID, {
        method: 'PATCH',
        headers: Constants.HEADERS,
        credentials: 'same-origin',
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.currentSessionStatus = newStatus
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.sessionStatusChangeLoading = false
    },
    async onRowClick (...args) {
      this.listLoading = true
      const r = args[1]
      this.currentSessionID = r.sessionID
      await this.getSession()
      this.listLoading = false
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
    async updateSessionTable (...args) {
      this.listLoading = true
      const props = args[0]
      const { page, rowsPerPage } =
        typeof props === 'string'
          ? this.pagination
          : props.pagination
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
        this.currentSessionStatus = responseData.sessionStatus
      }
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
    async getSession () {
      await this.getAttemptNumber()
      if (this.currentSessionStatus === 'Заблокирована') {
        return
      }
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
    async initPage () {
      this.pageLoading = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      this.userID = this.$store.getters['userDataStore/userInformationGetter'].id
      await this.getProblem()
      if (this.problemInformation.problemStatus !== 'Заблокирована') {
        switch (this.problemInformation.userStatus) {
          case 'Учитель':
            if (this.currentSessionID) {
              await this.getSession()
              this.filterValue = this.studentInfo.fullName
            }
            await this.updateSessionTable('random string')
            break
          case 'Ученик':
            await this.getSession()
            break
        }
      }
      this.pageLoading = false
    },
    onEdit () {
      this.$router.push(`/check-attempt/${this.$route.params.task_id}/${this.currentSessionID.toString()}`)
    }
  },
  async created () {
    this.deleteProblem = exceptionHandlerDecorator.call(this, [this.deleteProblem])
    this.deleteStudentAttempt = exceptionHandlerDecorator.call(this, [this.deleteStudentAttempt], 'deleteStudentAttemptLoading')
    this.onPaginationClick = exceptionHandlerDecorator.call(this, [this.onPaginationClick], 'attemptLoading')
    this.onEditingProblem = exceptionHandlerDecorator.call(this, [this.onEditingProblem], 'editingLoading')
    this.addNewCommentary = exceptionHandlerDecorator.call(this, [this.addNewCommentary], 'newCommentaryLoading')
    this.changeSessionStatus = exceptionHandlerDecorator.call(this, [this.changeSessionStatus], 'sessionStatusChangeLoading')
    this.deleteTeacherFeedback = exceptionHandlerDecorator.call(this, [this.deleteTeacherFeedback], 'deleteTeacherFeedbackLoading')
    this.addNewAttempt = exceptionHandlerDecorator.call(this, [this.addNewAttempt], 'newAttemptLoading')
    this.onRowClick = exceptionHandlerDecorator.call(this, [this.onRowClick], 'listLoading', 'currentSessionID')
    this.deleteCommentary = exceptionHandlerDecorator.call(this, [this.deleteCommentary], 'deleteCommentaryLoading')
    this.statusChange = exceptionHandlerDecorator.call(this, [this.statusChange], 'statusChangeLoading')
    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(this, [this.initPage, true])()
    }
  },
  computed: {
    paCommentaryNotEmpty () {
      return this.previousAttempt.commentaries?.length
    },
    updateSessionTableWithDecorator () {
      return exceptionHandlerDecorator.call(this, [this.updateSessionTable], 'listLoading')
    },
    isTeacher () {
      return this.problemInformation.userStatus === 'Учитель'
    },
    problemIsBanned () {
      return this.problemInformation.problemStatus === 'Заблокирована'
    },
    sdbForStudentAttempt () {
      return this.problemInformation.userStatus === 'Ученик' &&
        this.currentAttempt.studentAttempt.checkStatus === 'Проверяется'
    },
    userHaveStudentRole () {
      return this.$store.getters['userDataStore/userInformationGetter'].roles.includes('Ученик')
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from.params.session_id) {
        vm.currentSessionID = Number(from.params.session_id)
      }
    })
  }
}
</script>

<style scoped>

</style>
