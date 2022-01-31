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
        label="На главную"
        @click="onMainPage"
      />
    </template>
  </q-banner>
  <div
    class="column items-center q-py-sm q-gutter-y-sm"
    v-if="!pageLoading && !problemIsBanned && !problemWasDeletedFlag"
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
      edit-tooltip="Редактировать задачу"
      sun-tooltip="Отменить скрытие задачи"
      cloud-tooltip="Скрыть задачу"
      delete-tooltip="Удалить задачу"
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
      v-if="!attemptsLoading && isTeacher && !currentSessionID"
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
    <q-btn
      v-if="problemInformation.userStatus === 'Нет' && userHaveStudentRole"
      class="content-background"
      label="Добавить попытку"
      @click="newAttemptDialogShow = true"
      no-caps
    />
    <q-banner
      class="content-shadow q-my-xs"
      style="width: 100%"
      v-if="!attemptsLoading && currentSessionStatus === 'Заблокирована'"
    >
      Ход решения был заблокирован администратором.
    </q-banner>
    <div
      class="column no-wrap q-gutter-x-sm"
      v-if="!attemptsLoading && currentSessionStatus !== 'Заблокирована' &&
      (problemInformation.userStatus === 'Ученик' || (isTeacher && currentSessionID))"
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
              {{ isTeacher ? ('Попытки ученика ' + currentSession.studentFullName) : 'Ваши попытки' }}
            </div>
            <q-btn
              v-if="!isTeacher"
              round
              flat
              dense
              icon="bi-plus"
              @click="newAttemptDialogShow = true"
            >
              <q-tooltip
                :delay="800"
              >
                Добавить попытку
              </q-tooltip>
            </q-btn>
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
                :button-information="isTeacher ? buttonInformationArrayForTeacher : buttonInformationArrayForStudent"
                :active-attempt-i-d="currentAttemptID.toString()"
                :parent-loading-flag="deleteStudentAttemptLoading"
                :show-teacher-feedback-status="item.teacherFeedbackStatus !== '' && (isTeacher || item.teacherFeedbackStatus !== 'Черновик отзыва')"
                @click="getAttempt"
                @deleteClick="deleteStudentAttempt"
                @downloadClick="fileDownload"
                @eyeClick="proxyFunction"
              />
            </template>
          </q-virtual-scroll>
          <div
            class="q-pb-sm q-px-sm"
          >
            {{ isTeacher ? 'Попыток у этого ученика: ' : 'Всего ваших попыток: ' }}{{ attempts.length }}
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
            :show-delete-button="isTeacher && currentAttempt.teacherFeedback"
            :show-eye-button="!isTeacher"
            :attempt-date="currentAttemptObj.studentAttempt.dateOfLastChange"
            @delete="deleteTeacherFeedback"
            class="content-background content-shadow full-attempt-teacher"
          />
          <q-banner
            v-else
            class="content-shadow q-px-sm"
            style="width: 100%"
          >
            {{ isTeacher ? 'Вы пока не дали отзыв на эту попытку.' : 'Преподаватель пока не дал отзыв на эту попытку.' }}
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
                  >
                    <q-tooltip
                      :delay="800"
                    >
                      Для отправки сообщения - Enter<br>
                      Для переноса строки - Shift + Enter
                    </q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
          </div>
        </div>
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
        <q-btn
          no-caps
          label="Справка"
          outline
          color="primary"
          class="q-mb-xs"
          @click="helpDialogShow = true"
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
  <q-dialog
    v-model="helpDialogShow"
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
        Для установки интервала приема решений нужно выбрать две даты.<br>
        Каждая из границ интервала выбирается отдельным кликом по нужной дате.<br>
        Обращаем ваше внимание, что правая граница интервала не включается.<br>
        Например, если задача должна быть видна 1 день (к примеру 7 ноября), то<br>
        должен быть выбран следующий интервал: 07.11.2021 - 08.11.2021.<br>
        Выбирать один и тот же день в качестве начала и конца интервала запрещено.
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
import Commentary from 'components/Commentary'
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, exceptionHandlerDecorator, toBase64, toLocalDate } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
import { date } from 'quasar'
import Session from 'components/Session'
import Attempt from 'components/Attempt'
export default {
  name: 'TaskT',
  components: { Attempt, Session, ErrorDialog, LoadingSpinner, TaskInfo, TeacherFeedback, Commentary },
  data () {
    return {
      pageLoading: false,
      listLoading: false,
      deleteCommentaryLoading: false,
      deleteTeacherFeedbackLoading: false,
      deleteStudentAttemptLoading: false,
      deleteProblemLoading: false,
      problemWasDeletedFlag: false,
      statusChangeLoading: false,
      editTaskDialogShow: false,
      confirmDialogShow: false,
      showProblemFlag: false,
      sessionStatusChangeLoading: false,
      newCommentaryLoading: false,
      newAttemptLoading: false,
      newAttemptDialogShow: false,
      infoDialogShow: false,
      helpDialogShow: false,
      attemptLoading: false,
      attemptsLoading: false,
      errorDialogShow: false,
      editingLoading: false,
      commentaryToProblemLength: Constants.LENGTHS.commentaryToProblem,
      errorMessage: '',
      currentAttemptFileURL: '',
      filterValue: '',
      /**
       * @typedef {Object} buttonInformation
       * @property {string} icon Иконка кнопки из Bootstrap
       * @property {string} eventName Имя события, которая кнопка вызывает (событие содержит ID попытки, на котором кнопка была нажата)
       * @property {string} tooltipMessage Содержание всплывающей подсказки при наведении на кнопку курсора
       */
      /**
       * Для каждого объекта в массиве компонент создаст кнопку. Для создания будут использоватлься значения полей объекта
       * Массив для отображения со стороны ученика
       * @type {buttonInformation[]}
       */
      buttonInformationArrayForStudent: [
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
      /**
       * Для каждого объекта в массиве компонент создаст кнопку. Для создания будут использоватлься значения полей объекта
       * Массив для отображения со стороны учителя
       * @type {buttonInformation[]}
       */
      buttonInformationArrayForTeacher: [
        {
          icon: 'bi-eye',
          eventName: 'eyeClick',
          tooltipMessage: 'Просмотр попытки'
        },
        {
          icon: 'bi-box-arrow-in-down',
          eventName: 'downloadClick',
          tooltipMessage: 'Скачать файл с попыткой'
        }
      ],
      /**
       * @typedef {Object} Session
       * @property {string} sessionID id сессии в БД
       * @property {string} studentFullName полное имя ученика
       * @property {string} studentGroup поле группы ученика
       * @property {string} studentAvatarPath url аватарки ученика
       * @property {string} unverifiedAttemptCount количество непроверенных попыток в сессии ученика
       * @property {Boolean} sessionHasNewCommentariesForTeacher наличие новых комментариев в сессии ученика
       */
      /**
       * Массив сессий учеников для текущей задачи
       * @type {Session[]}
       */
      sessions: [],
      /**
       * Общее число найденых по запросу сессий
       * @type {Number}
       */
      allSessionCount: null,
      /**
       * @typedef {Object} StudentAttempt
       * @property {Number} id id попытки в БД
       * @property {string} status статус попытки ('Попытка не просмотрена учителем',
       *                                           'Попытка проверяется учителем', 'Попытка проверена учителем')
       * @property {string} dateOfLastChange дата (UTC) последнего изменения попытки (пока просто дата создания)
       * @property {string} fileURL url файла попытки
       */
      /**
       * @typedef {Object} AttemptInformation
       * @property {StudentAttempt} studentAttempt информация о попытке
       * @property {Boolean} attemptHasNewCommentary показатель наличия новых комментариев
       * @property {string} teacherFeedbackStatus статус учительского отзыва (если есть) о попытке
       *                                                 ('Отзыв просмотрен учеником', 'Отзыв не просмотрен учеником')
       */
      /**
       * Массив попыток ученика
       * @type {AttemptInformation[]}
       */
      attempts: [],
      newAttemptFile: null,
      currentCommentary: '',
      sessionData: null,
      /**
       * @typedef {Object} ProblemInformation
       * @property {string} userStatus 'Учитель', 'Ученик' или 'Нет' (не учитель и пока не ученик)
       * @property {string} problemStatus статус задачи ('Принята', 'Отклонена', ...)
       * @property {string} rejectionReason причина отклонения администратором (если задача была отклонена). Присылается только учителю
       * @property {string} authorFullName полное имя учителя
       * @property {string} authorGroup поле группы автора
       * @property {string} authorAvatarPath url аватарки автора
       * @property {string} authorCommentary комментарий автора к задаче
       * @property {string} problemID id задачи в БД
       * @property {string} problemTitle название задачи
       * @property {string} problemDiscipline исциплина (предмет) задачи
       * @property {string} problemComplexity сложность задачи (только у допущенных задач)
       * @property {string} problemStartLine дата начала приема решений
       * @property {string} problemDeadline дата завершения приема решений
       * @property {string} problemPath url файла с условиями задачи
       */
      /**
       * Общая информация о задаче и об авторе
       * @type {ProblemInformation}
      */
      problemInformation: {},
      dateRange: { to: '', from: '' },
      newAuthorCommentary: '',
      // Из-за механизма обработки ошибок это поле может принимать
      // либо значение false, когда преподаватель ничего не выбрал или при выборе произошла ошибка
      // либо числовое значние, когда все в порядке
      // (Когда при выборе ученика происходит ошибка, то нужно сбросить выбранную сессию)
      currentSessionID: false,
      currentSessionStatus: null,
      userID: null,
      /**
       * @typedef {Object} InformationForCommentaries
       * @property {string} avatarPath url аватарки
       * @property {string} fullName полное имя
       */
      /**
       * Информация об учителе для отображения комментариев
       * @type {InformationForCommentaries}
       */
      teacherInfo: {},
      /**
       * Информация об ученике для отображения комментариев
       * @type {InformationForCommentaries}
       */
      studentInfo: {},
      currentSession: null,
      currentAttemptID: false,
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
    proxyFunction (attemptID) {
      if (this.isTeacher) {
        this.onEdit(attemptID)
      } else {
        this.onEyeClickAsStudent(attemptID)
      }
    },
    onEyeClickAsStudent (attemptID) {
      const currentAttempt = this.attempts.find((e, i, a) => e.studentAttempt.id === attemptID)
      this.currentAttemptFileURL = currentAttempt.studentAttempt.fileURL
      this.showProblemFlag = true
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
    // CHECKED
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
    // CHECKED
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
    // CHECKED
    async getAttempt (attemptID) {
      this.attemptLoading = true
      this.currentAttemptID = attemptID
      const requestData = {
        attemptID: attemptID
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
        this.currentAttempt.teacherFeedback = responseData.attempt.teacherFeedback
        this.currentAttempt.commentaries = responseData.attempt.commentaries
        this.currentAttemptObj.attemptHasNewCommentary = false
        this.currentAttemptObj.teacherFeedbackStatus = responseData.attempt.teacherFeedbackStatus
        if (this.isTeacher) {
          const currentSession = this.sessions.find((e, i, a) => e.sessionID === this.currentSessionID)
          currentSession.sessionHasNewCommentariesForTeacher = responseData.attempt.sessionStatus
          this.studentInfo.fullName = this.currentSession?.studentFullName
          this.studentInfo.avatarPath = this.currentSession?.studentAvatarPath
        }
        this.attemptLoading = false
      }
    },
    // CHECKED
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
      this.problemWasDeletedFlag = true
    },
    // CHECKED
    async deleteStudentAttempt (attemptID) {
      this.deleteStudentAttemptLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        attemptID: attemptID
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
      if (this.attempts.length === 1) {
        this.problemInformation.userStatus = 'Нет'
      }
      if (this.currentAttemptID === attemptID) {
        this.currentAttemptID = false
      }
      this.attempts = this.attempts.filter(e => e.studentAttempt.id !== attemptID)
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.deleteStudentAttemptLoading = false
    },
    // CHECKED
    async deleteTeacherFeedback () {
      this.deleteTeacherFeedbackLoading = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        attemptID: this.currentAttemptID
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
      this.currentAttempt.teacherFeedback = null
      this.currentAttemptObj.studentAttempt.status = responseData.studentAttemptStatus
      this.currentAttemptObj.teacherFeedbackStatus = ''
      this.deleteTeacherFeedbackLoading = false
    },
    // CHECKED
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
      const index = this.currentAttempt.commentaries.findIndex((e, i, a) => e.commentaryID === requestData.commentaryID)
      this.currentAttempt.commentaries.splice(index, 1)
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.deleteCommentaryLoading = false
    },
    // CHECKED
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
        attemptID: this.currentAttemptID,
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
    // CHECKED
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
        const newAttempt = {
          studentAttempt: responseData.attempt,
          attemptHasNewCommentaryForStudent: false,
          teacherFeedbackStatus: ''
        }
        this.attempts.unshift(newAttempt)
        if (this.problemInformation.userStatus === 'Нет') {
          this.problemInformation.userStatus = 'Ученик'
          this.studentInfo.avatarPath = this.$store.getters['userDataStore/userInformationGetter'].avatarURL
          this.studentInfo.fullName = this.$store.getters['userDataStore/userFullName']
        }
        window.localStorage.setItem('csrfToken', responseData.csrfToken)
        this.newAttemptDialogShow = false
        this.newAttemptLoading = false
      }
    },
    // CHECKED
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
    // CHECKED
    async updateSessionList (...args) {
      this.listLoading = true
      const currentProblemID = this.$route.params.task_id
      const getParameters = new URLSearchParams()
      getParameters.append('filterValue', this.filterValue)
      const response = await fetch(
        Constants.SERVER_URL + '/api/session-for-problem/' + currentProblemID + '?' + getParameters.toString(),
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
    // CHECKED
    async getAttempts (sessionID) {
      this.attemptsLoading = true
      this.currentSessionID = sessionID
      this.currentAttemptID = false
      const userStatus = this.problemInformation.userStatus
      const getParameters = new URLSearchParams()
      getParameters.append('problemID', userStatus === 'Учитель' ? '-1' : this.$route.params.task_id)
      getParameters.append('sessionID', userStatus === 'Учитель' ? sessionID : '-1')
      const response = await fetch(
        Constants.SERVER_URL + '/api/get-attempt?' + getParameters.toString(),
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
        this.currentSessionStatus = responseData.sessionStatus
        this.attemptsLoading = false
      }
    },
    async initPage () {
      this.pageLoading = true
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      this.userID = this.$store.getters['userDataStore/userInformationGetter'].id
      await this.getProblem()
      if (this.problemInformation.problemStatus !== 'Заблокирована') {
        this.teacherInfo.avatarPath = this.problemInformation.authorAvatarPath
        this.teacherInfo.fullName = this.problemInformation.authorFullName
        switch (this.problemInformation.userStatus) {
          case 'Учитель':
            await this.updateSessionList()
            if (this.currentSessionID && this.currentAttemptID) {
              const attemptID = this.currentAttemptID
              await this.getAttempts(this.currentSessionID)
              await this.getAttempt(attemptID)
            }
            break
          case 'Ученик':
            this.studentInfo.avatarPath = this.$store.getters['userDataStore/userInformationGetter'].avatarURL
            this.studentInfo.fullName = this.$store.getters['userDataStore/userFullName']
            await this.getAttempts()
            break
        }
      }
      this.pageLoading = false
      if (this.currentSessionID && this.currentAttemptID) {
        await this.$nextTick()
        const sessionIndex = this.sessions.findIndex((e, i, a) => e.sessionID === this.currentSessionID)
        const attemptIndex = this.attempts.findIndex((e, i, a) => e.studentAttempt.id === this.currentAttemptID)
        this.$refs.sessionList.scrollTo(sessionIndex)
        this.$refs.attemptList.scrollTo(attemptIndex)
      }
    },
    onEdit (attemptID) {
      this.$router.push({ path: `/check-attempt/${this.$route.params.task_id}/${this.currentSessionID}/${attemptID}` })
    },
    fileDownload (attemptID) {
      const a = document.createElement('a')
      a.href = this.attempts.find((e, i, a) => e.studentAttempt.id === attemptID).studentAttempt.fileURL
      a.download = '' + attemptID + 'student.pdf'
      a.click()
    }
  },
  async created () {
    this.addNewCommentary = exceptionHandlerDecorator.call(this, [this.addNewCommentary], 'newCommentaryLoading')
    this.addNewAttempt = exceptionHandlerDecorator.call(this, [this.addNewAttempt], 'newAttemptLoading')
    this.getAttempt = exceptionHandlerDecorator.call(this, [this.getAttempt], 'currentAttemptID', 'attemptLoading')
    this.getAttempts = exceptionHandlerDecorator.call(this, [this.getAttempts], 'currentSessionID', 'attemptsLoading')

    this.statusChange = exceptionHandlerDecorator.call(this, [this.statusChange], 'statusChangeLoading')
    this.onEditingProblem = exceptionHandlerDecorator.call(this, [this.onEditingProblem], 'editingLoading')

    this.deleteProblem = exceptionHandlerDecorator.call(this, [this.deleteProblem], 'deleteProblemLoading')
    this.deleteCommentary = exceptionHandlerDecorator.call(this, [this.deleteCommentary], 'deleteCommentaryLoading')
    this.deleteStudentAttempt = exceptionHandlerDecorator.call(this, [this.deleteStudentAttempt], 'deleteStudentAttemptLoading')
    this.deleteTeacherFeedback = exceptionHandlerDecorator.call(this, [this.deleteTeacherFeedback], 'deleteTeacherFeedbackLoading')

    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(this, [this.initPage, true])()
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from.params.session_id && from.params.attempt_id) {
        vm.currentAttemptID = Number(from.params.attempt_id)
        vm.currentSessionID = Number(from.params.session_id)
      }
    })
  },
  computed: {
    updateSessionListWithDecorator () {
      return exceptionHandlerDecorator.call(this, [this.updateSessionList], 'listLoading')
    },
    isTeacher () {
      return this.problemInformation.userStatus === 'Учитель'
    },
    currentAttemptObj () {
      return this.attempts.find((e, i, a) => e.studentAttempt.id === this.currentAttemptID)
    },
    problemIsBanned () {
      return this.problemInformation.problemStatus === 'Заблокирована'
    },
    userHaveStudentRole () {
      return this.$store.getters['userDataStore/userInformationGetter'].roles.includes('Ученик')
    }
  }
}
</script>

<style scoped>

</style>
