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
        :columns="columns"
        :visible-columns="visibleColumns"
        :pagination.sync="pagination"
        :rows-per-page-options="pagination.rowsPerPage"
        row-key="sessionID"
        :data="sessionData"
        no-data-label="Задачи не найдены."
      />
    </div>
    <q-btn
      class="content-background"
      label="Добавить попытку"
      no-caps
    >
    </q-btn>
    <div
      class="column no-wrap q-gutter-x-sm"
      v-if="problemInformation.userStatus === 'Ученик'"
    >
      <div
        class="column q-gutter-y-sm items-center"
        v-if="currentStudentID === null"
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
          label="Проверить попытку"
          style="width: 25%"
          class="content-background"
          no-caps
        >
        </q-btn>
        <div
          class="row"
        >
          <q-btn
            label="Удалить попытку"
            no-caps
          ></q-btn>
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
          class="content-background content-shadow previous-attempts"
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
              :max="attemptMaxNumber"
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
                      v-bind="item"
                    />
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
        Пожалуйста, выберите ученика в списке выше
      </div>
    </div>
  </div>
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
        Для фильтрации по группе запрос нужно начать с '/g' (без кавычек).
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
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
import { Constants, toLocalDate } from 'boot/Constants'
export default {
  name: 'TaskT',
  components: { LoadingSpinner, TaskInfo, AttemptForStudent, TeacherFeedback, Commentary },
  data () {
    return {
      pageLoading: false,
      listLoading: false,
      sunsetTaskDialogShow: false,
      infoDialogShow: false,
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 1
      },
      filterValue: '',
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
          field: 'haveNewContent'
        }
      ],
      currentStudentID: null,
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
      attemptMaxNumber: null,
      currentPreviousAttemptNumber: null,
      previousAttempt: {
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
    async firstStep (currentUserID, currentProblemID) {
      const getParams = new URLSearchParams()
      getParams.append('userID', currentUserID)
      const response = await fetch(
        Constants.SERVER_URL + '/api/problem/' + currentProblemID + '?' + getParams.toString(),
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
    async uploadOfStudentsForTeacher() {

    }
  },
  async created () {
    this.pageLoading = true
    while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
    }
    const currentUserID = this.$store.getters['userDataStore/userInformationGetter'].id
    const currentProblemID = this.$route.params.task_id
    try {
      await this.firstStep(currentUserID, currentProblemID)
      this.pageLoading = false
    } catch (e) {
      console.log(e)
      switch (e.message) {
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
    /* this.pageLoading = true
    const getParam = new URLSearchParams()
    const currentUserID = this.$store.getters['userDataStore/userInformationGetter'].id
    const currentProblemID = this.$route.params.task_id
    getParam.append('userID', currentUserID)
    try {
      const problemDataResponse = await fetch(
        Constants.SERVER_URL + '/api/problem/' + currentProblemID + '?' + getParam.toString(),
        Constants.GET_INIT
      )
      const problemData = await problemDataResponse.json()
      switch (problemData.message) {
        case 'incorrect request':
          await this.$router.push('/123')
          break
        case 'problem not found':
          await this.$router.push('/123')
          break
        case 'problem is admitting':
          this.bannerMessage = 'Данная задача еще проходит проверку у администраторов.'
          this.mainBannerShow = true
          return
        case 'database error':
          await this.$router.push('/server-error')
          break
      }
      this.userIsTeacher = problemData.userRoleInTask === 'Учитель'
      this.rejectedCommentary = problemData.problemRejectionReason
      this.problemStatus = problemData.problemInfo.problemStatus
      this.bannerInit()
      if (this.mainBannerShow) {
        return
      }
      this.problemInformation = problemData.problemInfo
      const getParams = new URLSearchParams()
      getParams.append('userID', currentUserID)
      if (this.userIsTeacher) {
        getParams.append('filterValue', this.filterValue)
        getParams.append('currentPage', this.pagination.page)
        getParams.append('pageSize', this.pagination.rowsPerPage)
        const sessionResponse = await fetch(
          Constants.SERVER_URL + '/api/session/' + this.$route.params.task_id + '?' + getParams.toString(),
          Constants.GET_INIT
        )
        const sessionData = await sessionResponse.json()
        if (sessionData.message !== 'success') {
          await this.$router.push('/server-error')
        }
        this.pagination.rowsNumber = sessionData.sessionCount
        for (let i = 0; i < sessionData.sessionInfo.length; i++) {
          sessionData.sessionInfo[i].studentGroup =
            sessionData.sessionInfo[i].studentGroup === '-1'
              ? '-'
              : sessionData.sessionInfo[i].studentGroup
        }
        this.sessionData = sessionData.sessionInfo
        this.pageLoading = false
      } else {
        const sessionResponse = await fetch(
          Constants.SERVER_URL + '/api/session/' + currentUserID + getParams.toString(),
          Constants.GET_INIT
        )
        const sessionData = await sessionResponse.json()
        if (sessionData.message !== 'success') {
          await this.$router.push('/server-error')
        }
        if (sessionData.sessionStatus === 'not found') {
          // Что нибудь, еще не придумал
        } else {
          this.currentStudentID = currentUserID
          this.attemptMaxNumber = sessionData.attemptNumber
          const attemptResponse = await fetch(Constants.SERVER_URL + '/api/get-attempt', {
            method: 'POST',
            headers: Constants.HEADERS,
            body: JSON.stringify({
              userID: currentUserID,
              problemID: currentProblemID,
              requestAttemptNumber: this.attemptMaxNumber
            })
          })
          const attemptData = await attemptResponse.json()
          switch (attemptData.message) {
            case 'incorrect request':
              await this.$router.push('/123')
              break
            case 'session not found':
              await this.$router.push('/123')
              break
            case 'attempt not found':
              await this.$router.push('/123')
              break
            case 'database error':
              await this.$router.push('/server-error')
              break
          }
          this.currentAttempt.attemptID = attemptData.attemptID
          this.currentAttempt.studentAttempt = attemptData.studentAttempt
          this.currentAttempt.teacherFeedback = attemptData.teacherFeedback
          this.currentAttempt.commentaries = attemptData.commentaries
        }
      }
    } catch (e) {
      await this.$router.push('/connection-error')
    } */
  },
  watch: {

  }
}
</script>

<style scoped>

</style>
