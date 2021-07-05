<template>
<q-page class="column items-center q-pt-md">
  <div class="row no-wrap q-gutter-x-md">
    <div class="column">
      <TaskInfo></TaskInfo>
      <q-btn @click="inputFileDialog = true" label="Добавить ответ" style="width: 850px; margin-left: 10px" :class="newAttemptButtonClass" no-caps/>
      <AttemptForStudent v-bind="studentCurrentAttempt" :class="currentAttemptClass"></AttemptForStudent>
      <div :class="editCurrentAttemptClass" style="margin-left: 10px">
        <q-btn label="Редактировать ответ" no-caps/>
        <q-btn label="Удалить ответ" no-caps/>
      </div>
      <TeacherFeedback v-bind="currentTeacherFeedback" :class="currentTeacherFeedbackClass"></TeacherFeedback>
    </div>
    <div>
      <q-list bordered separator style="width:150px">
        <MainMenuButton v-for="link in menuInformation" :key="link.title" v-bind="link"/>
      </q-list>
    </div>
  </div>
  <q-dialog v-model="inputFileDialog">
    <q-uploader url="https://localhost:80" label="Выберите файл (pdf, TeX, LaTeX)" :filter="checkFileType" @rejected="onRejected" @failed="onUploaded" max-files="1"/>
  </q-dialog>
  <q-dialog v-model="rejectedFileDialog" persistent transition-show="scale" transition-hide="scale">
    <q-card class="bg-red text-white" style="width: 300px">
      <q-card-section>
        <div class="text-h6">Ошибка</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        Файл не подходит!
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-black">
        <q-btn flat label="OK" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-page>
</template>

<script>
import MainMenuButton from 'components/MainMenuButton'
import TaskInfo from 'components/TaskInfo'
import AttemptForStudent from 'components/AttemptForStudent'
import TeacherFeedback from 'components/TeacherFeedback'
export default {
  components: { MainMenuButton, TaskInfo, AttemptForStudent, TeacherFeedback },
  name: 'Task',
  data () {
    return {
      show: false,
      inputFileDialog: false,
      rejectedFileDialog: false,
      menuInformation: [{ title: 'My profile' },
        { title: 'My tasks' },
        { title: 'My questions' }],
      studentPreviousAttempts: [],
      previousTeacherFeedback: [],
      /* studentCurrentAttempt: {
        attemptNumber: 2,
        checkStatus: 'Проверяется',
        dateOfLastChange: new Date()
      } */
      studentCurrentAttempt: {},
      currentTeacherFeedback: {}
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
      if (Object.keys(this.studentCurrentAttempt).length !== 0) {
        this.studentPreviousAttempts.push(this.studentCurrentAttempt)
      }
      this.studentCurrentAttempt = [{ attemptNumber: this.studentPreviousAttempts.length + 1, dateOfLastChange: new Date() }]
      this.inputFileDialog = false
    }
  },
  computed: {
    currentAttemptClass () {
      return {
        hidden: Object.keys(this.studentCurrentAttempt).length === 0
      }
    },
    currentTeacherFeedbackClass () {
      return {
        hidden: Object.keys(this.currentTeacherFeedback).length === 0
      }
    },
    newAttemptButtonClass () {
      return {
        hidden: Object.keys(this.studentCurrentAttempt).length !== 0
      }
    },
    editCurrentAttemptClass () {
      return {
        row: true,
        'items-center': true,
        'q-gutter-x-md': true,
        'justify-center': true,
        hidden: (Object.keys(this.studentCurrentAttempt).length === 0 && Object.keys(this.currentTeacherFeedback).length === 0) ||
          (Object.keys(this.studentCurrentAttempt).length !== 0 && Object.keys(this.currentTeacherFeedback).length !== 0)
      }
    }
  }
}
</script>
