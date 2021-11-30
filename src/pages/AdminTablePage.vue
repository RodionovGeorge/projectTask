<template>
<q-page
  class="column items-center"
>
  <loading-spinner
    :loading="pageLoading"
  />
  <div
    v-if="!pageLoading"
    style="width: 1200px;"
    class="q-pa-xs"
  >
    <q-tabs
      v-model="currentTab"
      class="content-background content-shadow"
      align="justify"
      active-bg-color="primary"
      active-color="white"
      indicator-color="transparent"
    >
      <q-tab
        name="problems"
        label="Задачи"
        no-caps
      />
      <q-tab
        name="users"
        label="Пользователи"
        no-caps
      />
    </q-tabs>
    <div
      class="q-mt-xs content-shadow content-background q-pa-xs"
    >
      <div
        style="width: 100%"
        class="row q-mb-xs"
      >
        <q-input
          v-model="currentMode.filterValue"
          :readonly="currentMode.columnForSearch === ''"
          label="Поиск по столбцу"
          debounce="1000"
          @input="getProblem"
          maxlength="60"
          square
          outlined
          style="width:70%"
        >
          <template
            v-slot:append
          >
            <q-icon
              name="search"
            />
          </template>
        </q-input>
        <q-select
          v-model="currentMode.columnForSearch"
          square
          outlined
          @input="getProblem"
          :options="currentMode.namesOfSearchColumns"
          label="Столбец"
          options-dense
          style="width:30%"
        />
      </div>
      <q-table
        :data="currentMode.data"
        :columns="currentMode.columns"
        :pagination.sync="currentMode.pagination"
        :visible-columns="currentMode.visibleColumns"
        :rows-per-page-options="[currentMode.pagination.rowsPerPage]"
        :loading="loadingData"
        @request="getProblem"
        wrap-cells
        flat
        square
        bordered
        no-data-label="Данные не найдены."
      >
        <template
          v-if="currentTab === 'users'"
          v-slot:body-cell-userRoles="props"
        >
          <q-td
            :props="props"
            class="q-gutter-x-xs"
          >
            <q-btn
              label="Ученик"
              no-caps
              @click="changeRole(props, 'Ученик', props.row.studentRole ? 'down' : 'up')"
              :loading="props.row.loading"
              :color="props.row.studentRole ? 'green' : 'red'"
            >
              <template
                v-slot:loading
              >
                <q-spinner
                  :thickness="2"
                />
              </template>
              <q-tooltip
                delay="800"
              >
                {{props.row.studentRole ? 'Заблокировать роль "Ученик"' : 'Разблокировать роль "Ученик"'}}
              </q-tooltip>
            </q-btn>
            <q-btn
              label="Учитель"
              no-caps
              @click="changeRole(props, 'Учитель', props.row.teacherRole ? 'down' : 'up')"
              :loading="props.row.loading"
              :color="props.row.teacherRole ? 'green' : 'red'"
            >
              <template
                v-slot:loading
              >
                <q-spinner
                  :thickness="2"
                />
              </template>
              <q-tooltip
                delay="800"
              >
                {{props.row.teacherRole ? 'Заблокировать роль "Учитель"' : 'Разблокировать роль "Учитель"'}}
              </q-tooltip>
            </q-btn>
            <q-btn
              disable
              label="Администратор"
              no-caps
              :loading="props.row.loading"
              :color="props.row.adminRole ? 'green' : 'red'"
            >
              <template
                v-slot:loading
              >
                <q-spinner
                  :thickness="2"
                />
              </template>
              <q-tooltip
                delay="800"
              >
                {{props.row.adminRole ? 'Заблокировать роль "Администратор"' : 'Разблокировать роль "Администратор"'}}
              </q-tooltip>
            </q-btn>
            <q-btn
              label="Помощник администратора"
              no-caps
              :disable="isSubAdmin || props.row.adminRole"
              @click="changeRole(props, 'Помощник администратора', props.row.subAdminRole ? 'down' : 'up')"
              :loading="props.row.loading"
              :color="props.row.subAdminRole ? 'green' : 'red'"
            >
              <template
                v-slot:loading
              >
                <q-spinner
                  :thickness="2"
                />
              </template>
              <q-tooltip
                delay="800"
              >
                {{props.row.subAdminRole ? 'Заблокировать роль "Помощник администратора"' : 'Разблокировать роль "Помощник администратора"'}}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template
          v-slot:body-cell-statistics="props"
        >
          <q-td
            auto-width
            :props="props"
          >
            <q-btn
              label="Показать"
              color="primary"
              @click="currentMode.onStatisticClick(props)"
              no-caps
            >
              <q-tooltip
                delay="800"
              >
                Открыть окно статистики
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template
          v-slot:body-cell-linkToData="props"
        >
          <q-td
            auto-width
            :props="props"
          >
            <q-btn
              icon="bi-forward"
              flat
              @click="currentMode.onLinkClick(props)"
              no-caps
            >
              <q-tooltip
                delay="800"
              >
                К задачам пользователя
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
  <q-dialog
    v-model="statisticDialogShow"
    square
    persistent
  >
    <div
      class="column content-background items-center q-pa-xs q-gutter-y-xs no-wrap"
      style="width: 820px; max-width: 820px"
    >
      <div
        class="text-h6"
      >
        Статистика
      </div>
      <div
        class="row no-wrap"
        style="justify-content: space-around; width: 100%"
      >
        <q-input
          ref="startDateInput"
          outlined
          square
          readonly
          label="От"
          class="q-mr-xs"
          :rules="[value=>value.length > 0 || 'Пожалуйста, выберите дату']"
          v-model="startStatisticDate"
        >
          <template
            v-slot:append
          >
            <q-icon
              name="event"
              class="cursor-pointer"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="startStatisticDate"
                  mask="DD/MM/YYYY"
                >
                  <div
                    class="row items-center justify-end"
                  >
                    <q-btn
                      v-close-popup
                      label="Close"
                      color="primary"
                      flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          ref="endDateInput"
          outlined
          label="До"
          readonly
          square
          :rules="[value=>value.length > 0 || 'Пожалуйста, выберите дату']"
          v-model="endStatisticDate"
        >
          <template
            v-slot:append
          >
            <q-icon
              name="event"
              class="cursor-pointer"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="endStatisticDate"
                  mask="DD/MM/YYYY"
                >
                  <div
                    class="row items-center justify-end"
                  >
                    <q-btn
                      v-close-popup
                      label="Close"
                      color="primary"
                      flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <q-table
        v-if="currentStatisticIsProblem"
        :data="statisticProblemTable.data"
        :columns="statisticProblemTable.columns"
        title="Статистика задачи"
        style="width: 100%"
        hide-pagination
        hide-selected-banner
        square
        flat
        bordered
        no-data-label="Выберите даты и запросите статистику"
      />
      <div
        v-else
        style="width: 100%"
      >
        <q-table
          :data="statisticTeacherTable.data"
          :columns="statisticTeacherTable.columns"
          class="q-mb-xs"
          :title="targetFullName + ' как учитель'"
          hide-pagination
          hide-selected-banner
          square
          flat
          bordered
          no-data-label="Выберите даты и запросите статистику"
        >
          <template
            v-slot:top-right
          >
            <q-icon
              name="bi-info-circle"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="flip-up"
                transition-hide="flip-down"
              >
                <q-banner>
                  При расчете средней сложности<br>за 3 принимается сложная задача,<br>за 2 - средняя,<br>за 1 - простая.
                </q-banner>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-table>
        <q-table
          :data="statisticStudentTable.data"
          :columns="statisticStudentTable.columns"
          :title="targetFullName + ' как ученик'"
          hide-pagination
          hide-selected-banner
          square
          flat
          bordered
          no-data-label="Выберите даты и запросите статистику"
        >
          <template
            v-slot:top-right
          >
            <q-icon
              name="bi-info-circle"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="flip-up"
                transition-hide="flip-down"
              >
                <q-banner>
                  При расчете средней сложности<br>за 3 принимается сложная задача,<br>за 2 - средняя,<br>за 1 - простая.
                </q-banner>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-table>
      </div>
      <div
        class="row no-wrap"
      >
        <!-- Возможный стиль границы: border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 0 -->
        <q-btn
          label="Получить информацию"
          class="q-mr-xs"
          no-caps
          unelevated
          style="width: 200px"
          :loading="statisticLoading"
          @click="currentMode.getStatisticClick"
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
          label="Закрыть"
          v-close-popup
          @click="dropData"
          no-caps
          unelevated
          style="width: 200px"
        />
      </div>
    </div>
  </q-dialog>
  <error-dialog
    :p-error-message="errorMessage"
    :p-error-dialog-show="errorDialogShow"
    @off="errorDialogShow = false"
  />
</q-page>
</template>

<script>
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, exceptionHandlerDecorator } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
import { date } from 'quasar'
export default {
  name: 'AdminTablePage',
  components: { ErrorDialog, LoadingSpinner },
  data () {
    return {
      errorDialogShow: false,
      pageLoading: false,
      loadingData: false,
      statisticLoading: false,
      statisticDialogShow: false,
      errorMessage: '',
      currentTab: 'users',
      problemMode: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: Constants.ROWS_PER_PAGE,
          rowsNumber: null
        },
        columnForSearch: '',
        filterValue: '',
        defaultField: 'authorFullName',
        getData: null,
        onStatisticClick: null,
        getStatisticClick: null,
        onLinkClick: null,
        data: null,
        visibleColumns: ['problemTitle', 'authorGroup', 'authorFullName', 'problemDiscipline'],
        columns: [
          {
            name: 'problemID',
            field: 'problemID'
          },
          {
            name: 'problemTitle',
            required: true,
            label: 'Название',
            align: 'center',
            field: 'problemTitle'
          },
          {
            name: 'authorFullName',
            required: true,
            label: 'Автор',
            align: 'center',
            style: 'min-width: 150px;',
            field: 'authorFullName'
          },
          {
            name: 'authorGroup',
            required: true,
            label: 'Группа автора',
            align: 'center',
            format: val => val === '-1' ? '-' : val,
            style: 'min-width: 150px;',
            field: 'authorGroup'
          },
          {
            name: 'problemDiscipline',
            label: 'Предмет',
            field: 'problemDiscipline',
            align: 'center'
          },
          {
            name: 'statistics',
            label: 'Статистика',
            align: 'center',
            field: 'problemTitle',
            required: true
          },
          {
            name: 'linkToData',
            label: '',
            required: true
          }
        ],
        namesOfSearchColumns: [
          {
            label: 'Название',
            value: 'problemTitle'
          },
          {
            label: 'Автор',
            value: 'authorFullName'
          },
          {
            label: 'Группа',
            value: 'authorGroup'
          },
          {
            label: 'Предмет',
            value: 'problemDiscipline'
          }
        ]
      },
      userMode: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: Constants.ROWS_PER_PAGE,
          rowsNumber: null
        },
        columnForSearch: '',
        filterValue: '',
        defaultField: 'userFullName',
        getData: null,
        props: null,
        onStatisticClick: null,
        getStatisticClick: null,
        onLinkClick: null,
        data: null,
        visibleColumns: ['userFullName', 'userGroup', 'studentRole', 'teacherRole', 'adminRole', 'subAdminRole'],
        columns: [
          {
            name: 'userID',
            field: 'userID'
          },
          {
            name: 'userFullName',
            required: true,
            label: 'Имя пользователя',
            align: 'center',
            style: 'min-width: 150px;',
            field: 'userFullName'
          },
          {
            name: 'userGroup',
            required: true,
            label: 'Группа пользователя',
            format: val => val === '-1' ? '-' : val,
            align: 'center',
            style: 'min-width: 150px;',
            field: 'userGroup'
          },
          {
            name: 'userRoles',
            label: 'Роли',
            required: true,
            align: 'center',
            style: 'min-width: 150px;'
          },
          {
            name: 'statistics',
            label: 'Статистика',
            align: 'center',
            style: 'max-width: 120px;',
            required: true
          },
          {
            name: 'linkToData',
            label: '',
            required: true
          }
        ],
        namesOfSearchColumns: [
          {
            label: 'Пользователь',
            value: 'userFullName'
          },
          {
            label: 'Группа пользователя',
            value: 'userGroup'
          }
        ]
      },
      currentStatisticIsProblem: false,
      targetRow: null,
      startStatisticDate: '',
      endStatisticDate: '',
      statisticTeacherTable: {
        data: [],
        columns: [
          {
            name: 'allProblemCount',
            label: 'Предложенных задач',
            align: 'center',
            field: 'allProblemCount',
            required: true
          },
          {
            name: 'acceptedProblemCount',
            label: 'Из них принято',
            align: 'center',
            field: 'acceptedProblemCount',
            required: true
          },
          {
            name: 'averageDifficultOfProblems',
            label: 'Средняя сложность задач',
            align: 'center',
            field: 'averageDifficultOfProblems',
            required: true
          },
          {
            name: 'attemptCheckCount',
            label: 'Попыток проверено',
            align: 'center',
            field: 'attemptCheckCount',
            required: true
          },
          {
            name: 'absolutelySolvedAttemptCount',
            label: 'Количество решивших полностью',
            align: 'center',
            field: 'absolutelySolvedAttemptCount',
            required: true
          }
        ]
      },
      statisticStudentTable: {
        data: [],
        columns: [
          {
            name: 'absolutelySolvedAttemptCount',
            label: 'Полностью решенных задач',
            align: 'center',
            field: 'absolutelySolvedAttemptCount',
            required: true
          },
          {
            name: 'almostSolvedAttemptCount',
            label: 'Почти решенных задач',
            align: 'center',
            field: 'almostSolvedAttemptCount',
            required: true
          },
          {
            name: 'haveRightIdeaAttemptCount',
            label: 'Попыток с верной идеей',
            align: 'center',
            field: 'haveRightIdeaAttemptCount',
            required: true
          },
          {
            name: 'averageDifficultOfProblems',
            label: 'Средняя сложность задач',
            align: 'center',
            field: 'averageDifficultOfProblems',
            required: true
          }
        ]
      },
      statisticProblemTable: {
        data: [],
        columns: [
          {
            name: 'absolutelySolvedPeopleCount',
            label: 'Полностью решили',
            align: 'center',
            field: 'absolutelySolvedPeopleCount',
            required: true
          },
          {
            name: 'almostSolvedPeopleCount',
            label: 'Почти решили',
            align: 'center',
            field: 'almostSolvedPeopleCount',
            required: true
          },
          {
            name: 'haveRightIdeaPeopleCount',
            label: 'Была правильная идея',
            align: 'center',
            field: 'haveRightIdeaPeopleCount',
            required: true
          },
          {
            name: 'haveWrongIdeaPeopleCount',
            label: 'Полностью не решили',
            align: 'center',
            field: 'haveWrongIdeaPeopleCount',
            required: true
          }
        ]
      }
    }
  },
  computed: {
    targetFullName () {
      return this.targetRow?.userFullName
    },
    currentMode () {
      return this.currentTab === 'problems' ? this.problemMode : this.userMode
    },
    isSubAdmin () {
      return this.$store.getters['userDataStore/userInformationGetter']?.roles.includes('Помощник администратора')
    }
  },
  methods: {
    async onUserRowClick (props) {
      await this.$router.push(`/admin/user/${props.row.userID}`)
    },
    async onProblemRowClick (props) {
      await this.$router.push(`/admin/task/${props.row.problemID}/${-1}`)
    },
    dropData () {
      this.statisticProblemTable.data = []
      this.statisticTeacherTable.data = []
      this.statisticStudentTable.data = []
    },
    async getStatisticByUser () {
      if (!this.$refs.startDateInput.validate() || !this.$refs.endDateInput.validate()) {
        this.errorMessage = 'Пожалуйста, выберите даты для запроса.'
        this.errorDialogShow = true
        return
      }
      this.statisticLoading = true
      const requestData = {
        mode: 'user',
        startDate: date.extractDate(this.startStatisticDate, 'DD/MM/YYYY').toISOString(),
        endDate: date.extractDate(this.endStatisticDate, 'DD/MM/YYYY').toISOString(),
        id: this.targetRow.userID
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/get-statistic', {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.statisticTeacherTable.data = [responseData.data.teacherStatistic]
      this.statisticStudentTable.data = [responseData.data.studentStatistic]
      this.statisticLoading = false
    },
    async getStatisticByProblem () {
      if (!this.$refs.startDateInput.validate() || !this.$refs.endDateInput.validate()) {
        this.errorMessage = 'Пожалуйста, выберите даты для запроса.'
        this.errorDialogShow = true
        return
      }
      this.statisticLoading = true
      const requestData = {
        mode: 'problem',
        startDate: date.extractDate(this.startStatisticDate, 'DD/MM/YYYY').toISOString(),
        endDate: date.extractDate(this.endStatisticDate, 'DD/MM/YYYY').toISOString(),
        id: this.targetRow.problemID
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/get-statistic', {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.statisticProblemTable.data = [responseData.data]
      this.statisticLoading = false
    },
    async asProblemGetData (requestData) {
      const response = await fetch(Constants.SERVER_URL + '/api/admin/problems', {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      return responseData
    },
    async changeRole (props, roleTitle, mode) {
      props.row.loading = true
      const requestData = {
        targetID: props.row.userID,
        roleTitle: roleTitle,
        mode: mode
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/change-role', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        props.row.loading = false
        throw new Error(responseData.message)
      }
      switch (roleTitle) {
        case 'Ученик':
          props.row.studentRole = !props.row.studentRole
          break
        case 'Учитель':
          props.row.teacherRole = !props.row.teacherRole
          break
        case 'Помощник администратора':
          props.row.subAdminRole = !props.row.subAdminRole
          break
        // По идее не используется
        case 'Администратор':
          props.row.adminRole = !props.row.adminRole
          break
      }
      props.row.loading = false
    },
    async asUserGetData (requestData) {
      const response = await fetch(Constants.SERVER_URL + '/api/admin/users', {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      return responseData
    },
    async getProblem (props) {
      const { page, rowsPerPage } =
        props && Object.prototype.hasOwnProperty.call(props, 'pagination')
          ? props.pagination
          : this.currentMode.pagination
      this.loadingData = true
      const requestData = {
        currentPage: page,
        pageSize: rowsPerPage,
        filterField: this.currentMode.columnForSearch?.value || this.currentMode.defaultField,
        filterValue: this.currentMode.filterValue
      }
      const responseData = await this.currentMode.getData(requestData)
      this.currentMode.data = responseData.data
      this.currentMode.pagination.rowsNumber = responseData.count
      this.currentMode.pagination.page = page
      this.loadingData = false
    },
    onProblemStatisticClick (props) {
      this.currentStatisticIsProblem = true
      this.statisticDialogShow = true
      this.targetRow = props.row
    },
    onUserStatisticClick (props) {
      this.currentStatisticIsProblem = false
      this.statisticDialogShow = true
      this.targetRow = props.row
    },
    async initPage () {
      await this.getProblem('rand string')
      this.currentTab = 'problems'
      await this.$nextTick()
      await this.getProblem('rand string')
      this.currentTab = 'users'
    }
  },
  async created () {
    this.pageLoading = true
    this.userMode.getData = this.asUserGetData
    this.problemMode.getData = this.asProblemGetData
    this.changeRole = exceptionHandlerDecorator.call(this, [this.changeRole])
    this.userMode.getStatisticClick = exceptionHandlerDecorator.call(this, [this.getStatisticByUser], 'statisticLoading')
    this.problemMode.getStatisticClick = exceptionHandlerDecorator.call(this, [this.getStatisticByProblem], 'statisticLoading')
    this.userMode.onStatisticClick = this.onUserStatisticClick
    this.problemMode.onStatisticClick = this.onProblemStatisticClick
    this.userMode.onLinkClick = this.onUserRowClick
    this.problemMode.onLinkClick = this.onProblemRowClick
    while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
    }
    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
    this.getProblem = exceptionHandlerDecorator.call(this, [this.getProblem], 'loadingData')
    this.pageLoading = false
  }
}
</script>

<style scoped>

</style>
