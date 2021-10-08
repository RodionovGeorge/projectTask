<template>
<q-page
  class="column items-center q-pt-sm"
>
  <div
    class="column q-gutter-y-sm items-center"
  >
    <TaskInfo
      class="content-background content-shadow"
    />
    <!-- Current attempt block -->
    <q-btn
      @click="inputFileDialog = true"
      label="Добавить попытку" style="width: 200px;"
      v-show="!newAttemptButtonHide"
      no-caps
      class="content-background"
    />
    <div
      class="row no-wrap full-attempt"
    >
      <AttemptForStudent
        v-bind="studentCurrentAttempt"
        v-show="!currentAttemptHide"
        class="content-background content-shadow full-attempt-student"
        style="width:40%; margin-right: 5px"
      />
      <TeacherFeedback
        v-bind="currentTeacherFeedback"
        class="content-background content-shadow full-attempt-teacher"
      />
    </div>
    <div
      class="row items-center q-gutter-x-md justify-center"
      v-show="!editCurrentAttemptHide"
    >
      <q-btn
        label="Редактировать ответ"
        class="content-background"
        no-caps
      />
      <q-btn
        label="Удалить ответ"
        class="content-background"
        no-caps
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
          :items="currentAttemptCommentaries"
        >
          <template
            v-slot="{ item }"
          >
            <Commentary
              @deleted="onDeletedCurrentCommentary"
              v-bind="item"
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
    <!-- Previous attempt block -->
    <div
      v-show="previousAttemptsExists"
      class="content-background content-shadow q-pa-sm previous-attempts"
    >
      <div
        class="text-h6"
      >
        Предыдущие попытки
      </div>
      <div class="q-gutter-y-xs">
        <q-pagination
          class="flex flex-center"
          v-model="currentPreviousAttempt"
          :max="previousAttemptCount"
          boundary-numbers
        />
        <div
          class="row no-wrap full-attempt"
        >
          <AttemptForStudent
            v-bind="studentPreviousAttempt"
            class="content-shadow-for-white full-attempt-student"
          />
          <TeacherFeedback
            v-bind="previousTeacherFeedback"
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
              style="max-height: 400px"
              :items="previousAttemptCommentaries"
            >
                <template
                  v-slot="{ item }"
                >
                  <Commentary
                    @deleted="onDeletedPreviousCommentary"
                    v-bind="item"
                  >
                  </Commentary>
                </template>
              </q-virtual-scroll>
            </div>
          </div>
        </div>
      </div>
    </div>
  <q-dialog
    v-model="inputFileDialog"
  >
    <q-uploader
      url="https://localhost:80"
      label="Выберите файл (pdf, TeX, LaTeX)"
      :filter="checkFileType"
      @rejected="onRejected"
      @failed="onUploaded"
      max-files="1"
    />
  </q-dialog>
  <q-dialog
    v-model="rejectedFileDialog"
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
          class="text-h6"
        >
          Ошибка
        </div>
      </q-card-section>
      <q-card-section
        class="q-pt-none"
      >
        Файл не подходит!
      </q-card-section>
      <q-card-actions
        align="right"
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
import TaskInfo from 'components/TaskInfo'
import AttemptForStudent from 'components/AttemptForStudent'
import TeacherFeedback from 'components/TeacherFeedback'
import Commentary from 'components/Commentary'
export default {
  components: { TaskInfo, AttemptForStudent, TeacherFeedback, Commentary },
  name: 'Task',
  data () {
    return {
      inputFileDialog: false,
      rejectedFileDialog: false,
      currentCommentary: '',
      previousAttemptCount: NaN,
      currentPreviousAttempt: NaN,
      studentPreviousAttempt: { attemptNumber: 5, checkStatus: 'Проверена' },
      previousTeacherFeedback: { decisionStage: 'Есть идея', pathToProvenSolution: 'pdfExample/OS1.pdf', teacherCommentary: '111 1111 11111111 11111111 111111 111 111111 111 111 11111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111' },
      previousAttemptCommentaries: [
        { commentaryID: 0, commentaryText: '111 1111 11111111 11111111 1111111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111 11 111111 111 11 11111111111 111', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 1, commentaryText: '2', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 2, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' }
      ],
      studentCurrentAttempt: { attemptNumber: 1 },
      // currentTeacherFeedback: { decisionStage: 'Решена', teacherCommentary: '123 123 123 213 123 123 123 123 123 123 123 123 123 123 123 123 213 123 123 123 123 123 123 123 123 123 123 123 123 213 123 123 123 123 123 123 123 123 123 123 123 123 213 123 123 123 123 123 123 123 123 123 ' },
      currentTeacherFeedback: {},
      currentAttemptCommentaries: [
        { commentaryID: 5, commentaryText: '111 1111 11111111 11111111 1111111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 6, commentaryText: '2', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 7, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' }]
    }
  },
  methods: {
    checkFileType (file) {
      return file.filter(file => (file.type === 'application/pdf' || file.type === 'application/x-latex' || file.type === 'application/x-tex'))
    },
    onRejected () {
      this.rejectedFileDialog = true
    },
    onUploaded (info) {
      /* if (Object.keys(this.studentCurrentAttempt).length !== 0) {
        this.studentPreviousAttempts.push(this.studentCurrentAttempt)
      }
      this.studentCurrentAttempt = [{ attemptNumber: this.studentPreviousAttempts.length + 1, dateOfLastChange: new Date() }]
      this.inputFileDialog = false */
    },
    onDeletedPreviousCommentary (ID) {
      const searchID = (element, index, array) => { return element.commentaryID === ID }
      const commentaryIndex = this.previousAttemptCommentaries.findIndex(searchID)
      this.previousAttemptCommentaries.splice(commentaryIndex, commentaryIndex + 1)
    },
    onDeletedCurrentCommentary (ID) {
      const searchID = (element, index, array) => { return element.commentaryID === ID }
      const commentaryIndex = this.currentAttemptCommentaries.findIndex(searchID)
      this.currentAttemptCommentaries.splice(commentaryIndex, commentaryIndex + 1)
    }
  },
  mounted () {
    // Запрос предыдущих попыток у сервера
    // Смотрим ответ, в зависимости от этого инициализируем previousAttemptCount
    this.previousAttemptCount = 5
    this.currentPreviousAttempt = this.previousAttemptCount
  },
  computed: {
    currentAttemptHide () {
      return Object.keys(this.studentCurrentAttempt).length === 0
    },
    /* currentTeacherFeedbackHide () {
      return Object.keys(this.currentTeacherFeedback).length === 0
    }, */
    previousAttemptHide () {
      return Object.keys(this.studentCurrentAttempt).length === 0
    },
    /* previousTeacherFeedbackHide () {
      return Object.keys(this.currentTeacherFeedback).length === 0
    }, */
    newAttemptButtonHide () {
      return Object.keys(this.studentCurrentAttempt).length !== 0 && Object.keys(this.currentTeacherFeedback).length === 0
    },
    editCurrentAttemptHide () {
      return (Object.keys(this.studentCurrentAttempt).length === 0 && Object.keys(this.currentTeacherFeedback).length === 0) ||
          (Object.keys(this.studentCurrentAttempt).length !== 0 && Object.keys(this.currentTeacherFeedback).length !== 0)
    },
    previousAttemptsExists () {
      return this.previousAttemptCount !== 0
    }
  }
}
</script>
