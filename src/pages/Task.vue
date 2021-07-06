<template>
<q-page class="column items-center q-pt-md">
  <div class="row no-wrap q-gutter-x-md">
    <div class="column q-gutter-y-md">
      <TaskInfo></TaskInfo>
      <q-btn @click="inputFileDialog = true" label="Добавить ответ" style="width: 850px;" :class="newAttemptButtonClass" no-caps/>
      <AttemptForStudent v-bind="studentCurrentAttempt" :class="currentAttemptClass"></AttemptForStudent>
      <div :class="editCurrentAttemptClass">
        <q-btn label="Редактировать ответ" no-caps/>
        <q-btn label="Удалить ответ" no-caps/>
      </div>
      <TeacherFeedback v-bind="currentTeacherFeedback" :class="currentTeacherFeedbackClass"></TeacherFeedback>
      <div style="border: 1px solid black; padding: 0 10px 10px 10px; width:850px">
        <div class="text-h6">Обсуждение попытки</div>
        <div class="q-gutter-y-sm">
          <q-virtual-scroll style="max-height: 400px" :items="commentaryInformation">
            <template v-slot="{ item }">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="item.avatarPath" alt="123">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ item.authorFullName }} - {{ item.commentaryDate }}
                  </q-item-label>
                  <q-item-label>
                    {{ item.commentaryText }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn icon="delete" dense flat size="15px"/>
                </q-item-section>
              </q-item>
            </template>
          </q-virtual-scroll>
          <div class="row" style="width: 840px; display: flex; justify-content: space-between; padding-right: 10px">
            <q-input v-model="currentCommentary" autogrow outlined placeholder="Напишите комментарий" color="black"
                     style="width:700px"/>
            <q-btn label="Отправить" style="height: 50px; width:100px"/>
          </div>
        </div>
      </div>
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
      currentCommentary: '',
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
      studentCurrentAttempt: { attemptNumber: 1 },
      currentTeacherFeedback: { decisionStage: 'Решена' },
      commentaryInformation: [
        { commentaryText: '111 1111 11111111 11111111 1111111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryText: '2', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' }]
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
