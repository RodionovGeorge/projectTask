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
    v-if="mainBannerShow"
  >
    {{bannerMessage}}
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
    v-else
    class="column items-center q-py-sm q-gutter-y-sm"
  >
    <TaskInfo
      v-bind="problemInformation"
      class="content-background content-shadow"
      @sunset="sunsetTaskDialogShow = true"
      @edit="editTaskDialogShow = true"
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
    <div
      class="column no-wrap q-gutter-x-sm"
      v-if="true"
    >
      <div
        class="column q-gutter-y-sm"
        v-if="currentStudentID !== null"
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
        Пожалуйста, выберите ученика в списке слева
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
import { Constants } from 'boot/Constants'
export default {
  name: 'TaskT',
  components: { LoadingSpinner, TaskInfo, AttemptForStudent, TeacherFeedback, Commentary },
  data () {
    return {
      pageLoading: false,
      listLoading: false,
      mainBannerShow: null,
      sunsetTaskDialogShow: false,
      bannerMessage: null,
      problemStatus: null,
      infoDialogShow: false,
      rejectedCommentary: '',
      userIsTeacher: false,
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
    onMainPage () {
      this.$router.push('/')
    },
    bannerInit () {
      this.mainBannerShow = false
      if (this.problemStatus === 'Заблокирована') {
        this.bannerMessage = 'Эта задача была заблокирована администратором. Автор потерял статус преподавателя.'
        this.mainBannerShow = true
      }
      if (this.problemStatus === 'Отклонена') {
        this.bannerMessage = 'Эта задача не была пропущена администраторами.' +
        this.userIsTeacher
          ? 'Комментарий: ' + this.rejectedCommentary
          : ''
        this.mainBannerShow = true
      }
      if (this.problemStatus === 'Скрыта' && !this.userIsTeacher) {
        this.bannerMessage = 'Эта задача скрыта преподавателем. Начать решать ее сейчас не получиться.'
        this.mainBannerShow = true
      }
    }
  },
  async created () {
    this.pageLoading = true
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
    }
  },
  watch: {

  }
}
</script>

<style scoped>

</style>
