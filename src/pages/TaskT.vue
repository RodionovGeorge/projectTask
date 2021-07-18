<template>
<q-page
  class="column items-center q-py-sm q-gutter-y-sm"
>
  <TaskInfo
    v-bind="taskInformation"
    class="content-background content-shadow"
    @sunset="sunsetTaskDialogShow = true"
    @edit="editTaskDialogShow = true"
  />
  <div
    class="row no-wrap q-gutter-x-sm"
  >
    <div
      class="column no-wrap content-background content-shadow student-list"
    >
      <div
        class="text-h6 q-mb-sm"
        style="padding: 0 10px 0 10px"
      >
        Ученики
      </div>
      <q-input
        class="student-list-search-field no-border"
        v-model="searchQuery"
        color="black"
        placeholder="Search"
        square
        outlined
        debounce="200"
      >
        <template
          v-slot:append
        >
          <q-icon
            name="search"
          />
        </template>
      </q-input>
      <q-virtual-scroll
        :items="studentInformationForList"
        class="student-list-scroll-area"
      >
        <template
          v-slot="{ item }"
        >
          <q-item
            clickable
            :active="item.studentID === activeStudentID"
            @click="activeStudentID = item.studentID"
            active-class="student-list-active-button"
          >
            <q-item-section>
              {{item.studentFullName}}
            </q-item-section>
            <q-item-section
              avatar
            >
              <q-icon
                v-if="item.isNewContent"
                name="bi-lightbulb"
              />
              <q-icon
                v-else
                name="bi-lightbulb-off"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </div>
    <div
      class="column q-gutter-y-sm"
      v-if="activeStudentID !== -1"
    >
      <div
        class="row no-wrap full-attempt"
      >
        <AttemptForStudent
          v-bind="studentCurrentAttempt"
          class="content-background content-shadow full-attempt-student"
          style="width:40%; margin-right: 5px"
        />
        <TeacherFeedback
          v-bind="currentTeacherFeedback"
          class="content-background content-shadow full-attempt-teacher"
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
      <div
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
                style="max-height: 200px"
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
    <div
      v-else
      class="text-h6 content-shadow content-background student-not-selected-message"
    >
      Пожалуйста, выберите ученика в списке слева
    </div>
  </div>
  <!-- <q-dialog
    v-model="editTaskShow"
  >
  </q-dialog> -->
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
          @click="onSunsetTask"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="editTaskDialogShow"
    persistent
  >
    <div
      class="column content-background task-parameter-editor-dialog"
    >
      <div
        class="text-h6"
      >
        Редактирование задачи
      </div>
      <NewTask/>
    </div>
  </q-dialog>
</q-page>
</template>

<script>
import TaskInfo from 'components/TaskInfo'
import AttemptForStudent from 'components/AttemptForStudent'
import TeacherFeedback from 'components/TeacherFeedback'
import Commentary from 'components/Commentary'
import NewTask from 'components/NewTask'
export default {
  name: 'TaskT',
  components: { TaskInfo, AttemptForStudent, TeacherFeedback, Commentary, NewTask },
  data () {
    return {
      studentInformation: [
        { studentID: 1, studentFullName: 'Ивановqdqdqwdqdq Иванqwdqwd Ивановичadsq', isNewContent: true },
        { studentID: 2, studentFullName: 'Иванов Иван Иванович', isNewContent: false },
        { studentID: 3, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 4, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 5, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 6, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 7, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 8, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 9, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 10, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 11, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 12, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 13, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 314, studentFullName: 'Иванов Иван Иванович', isNewContent: true },
        { studentID: 315, studentFullName: 'Иванов Иван Иванович', isNewContent: true }
      ],
      taskInformation: {
        taskActive: true
      },
      editTaskDialogShow: false,
      sunsetTaskDialogShow: false,
      currentCommentary: '',
      searchQuery: '',
      activeStudentID: -1,
      previousAttemptCount: NaN,
      currentPreviousAttempt: NaN,
      studentPreviousAttempt: { attemptNumber: 5, checkStatus: 'Проверена' },
      previousTeacherFeedback: { decisionStage: 'Есть идея', pathToProvenSolution: 'pdfExample/OS1.pdf', teacherCommentary: '111 1111 11111111 11111111 111111 111 111111 111 111 11111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111' },
      previousAttemptCommentaries: [
        { commentaryID: 0, commentaryText: '111 1111 11111111 11111111 1111111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111 11 111111 111 11 11111111111 111', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 1, commentaryText: '2', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 2, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 2, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 2, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 2, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' }
      ],
      studentCurrentAttempt: { attemptNumber: 1 },
      currentTeacherFeedback: {},
      currentAttemptCommentaries: [
        { commentaryID: 5, commentaryText: '111 1111 11111111 11111111 1111111 1111111111 1111111111 111111111111 11111111111 111111111111 1111111', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 6, commentaryText: '2', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' },
        { commentaryID: 7, commentaryText: '3', avatarPath: 'https://cdn.quasar.dev/img/avatar2.jpg', authorFullName: 'Некто Нектович', commentaryDate: 'Четверг, 12.04.21, 21:12' }]
    }
  },
  mounted () {
    // Запрос предыдущих попыток у сервера
    // Смотрим ответ, в зависимости от этого инициализируем previousAttemptCount
    this.studentInformation.sort((a, b) => {
      if (a.isNewContent) {
        return -1
      }
      if (b.isNewContent) {
        return 1
      } else {
        return 0
      }
    })
    this.previousAttemptCount = 5
    this.currentPreviousAttempt = this.previousAttemptCount
  },
  methods: {
    onDeletedPreviousCommentary (ID) {
      const searchID = (element, index, array) => { return element.commentaryID === ID }
      const commentaryIndex = this.previousAttemptCommentaries.findIndex(searchID)
      this.previousAttemptCommentaries.splice(commentaryIndex, commentaryIndex + 1)
    },
    onDeletedCurrentCommentary (ID) {
      const searchID = (element, index, array) => { return element.commentaryID === ID }
      const commentaryIndex = this.currentAttemptCommentaries.findIndex(searchID)
      this.currentAttemptCommentaries.splice(commentaryIndex, commentaryIndex + 1)
    },
    onSunsetTask () {
      // Вот тут отправлять запрос о сокрытии задачи на сервер
      this.taskInformation.taskActive = false
    }
  },
  computed: {
    studentInformationForList () {
      if (this.searchQuery === '') {
        return this.studentInformation
      } else {
        return this.studentInformation.filter(student => student.studentFullName.startsWith(this.searchQuery))
      }
    }
  }
}
</script>

<style scoped>

</style>
