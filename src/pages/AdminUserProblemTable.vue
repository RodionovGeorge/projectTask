<template>
  <q-page
    class="column items-center"
  >
    <loading-spinner
      :loading="loadingPage"
    />
    <div
      v-if="!loadingPage"
      style="width: 1100px"
      class="q-pa-xs"
    >
      <div
        class="row q-pa-sm q-mb-sm content-shadow content-background"
      >
        <div
          class="text-h6"
          style="width:200px; display:flex; align-items: center;"
        >
          Пользователь
        </div>
        <q-item
          class="q-pa-none"
        >
          <q-item-section
            side
          >
            <q-avatar>
              <img
                :src="informationAboutUser.avatarPath"
                alt=""
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ informationAboutUser.fullName }} ({{informationAboutUser.group === '-1' ? '-' : informationAboutUser.group}})
          </q-item-section>
        </q-item>
      </div>
      <q-tabs
        v-model="currentTab"
        class="content-background content-shadow"
        align="justify"
        active-bg-color="primary"
        active-color="white"
        indicator-color="transparent"
      >
        <q-tab
          name="teacher"
          label="Учитель"
          no-caps
        />
        <q-tab
          name="student"
          label="Ученик"
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
            label="Поиск по столбцу"
            maxlength="60"
            debounce="1000"
            :readonly="currentMode.columnForSearch === ''"
            @input="getProblem"
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
            square
            outlined
            :options="currentMode.namesOfSearchColumns"
            label="Столбец"
            @input="getProblem"
            options-dense
            style="width:30%"
            v-model="currentMode.columnForSearch"
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
          @row-click="currentMode.onRowClick"
          wrap-cells
          flat
          square
          bordered
          no-data-label="Задачи не найдены."
        />
      </div>
    </div>
    <ErrorDialog
      :p-error-dialog-show="errorDialogShow"
      :p-error-message="errorMessage"
      @off="errorDialogShow = false"
    />
  </q-page>
</template>

<script>
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants, exceptionHandlerDecorator, toLocalDate } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
export default {
  name: 'AdminUserProblemTable',
  components: { ErrorDialog, LoadingSpinner },
  data () {
    return {
      loadingPage: false,
      loadingData: false,
      errorDialogShow: false,
      errorMessage: '',
      currentTab: 'teacher',
      informationAboutUser: null,
      asStudent: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: Constants.ROWS_PER_PAGE,
          rowsNumber: null
        },
        columnForSearch: '',
        filterValue: '',
        getData: null,
        onRowClick: async (evt, row) => { await this.$router.push(`/admin/task/${row.problemID}/${row.sessionID}`) },
        data: null,
        visibleColumns: ['problemTitle', 'authorGroup', 'authorFullName', 'problemDiscipline'],
        columns: [
          {
            name: 'sessionID',
            field: 'sessionID'
          },
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
            field: 'authorFullName'
          },
          {
            name: 'authorGroup',
            required: true,
            label: 'Группа автора',
            align: 'center',
            format: val => val === '-1' ? '-' : val,
            field: 'authorGroup'
          },
          {
            name: 'problemDiscipline',
            label: 'Предмет',
            field: 'problemDiscipline',
            align: 'center'
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
      asTeacher: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: Constants.ROWS_PER_PAGE,
          rowsNumber: null
        },
        getData: null,
        onRowClick: async (evt, row) => { await this.$router.push(`/admin/task/${row.problemID}/${-1}`) },
        columnForSearch: '',
        filterValue: '',
        data: null,
        visibleColumns: ['problemTitle', 'startDate', 'endDate', 'problemStatus'],
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
            name: 'startDate',
            required: true,
            label: 'Дата начала приема решений',
            align: 'center',
            field: 'startDate'
          },
          {
            name: 'endDate',
            required: true,
            label: 'Дата окончания приема решений',
            align: 'center',
            field: 'endDate'
          },
          {
            name: 'problemStatus',
            required: true,
            label: 'Статус задачи',
            align: 'center',
            field: 'problemStatus'
          }
        ],
        namesOfSearchColumns: [
          {
            label: 'Название',
            value: 'problemTitle'
          },
          {
            label: 'Статус задачи',
            value: 'problemStatus'
          }
        ]
      }
    }
  },
  methods: {
    async asTeacherGetData (requestData, userID) {
      const response = await fetch(Constants.SERVER_URL + `/api/admin/get-problems/${userID}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      for (const problem of responseData.data) {
        problem.startDate = toLocalDate(problem.startDate)
        problem.endDate = toLocalDate(problem.endDate)
      }
      return responseData
    },
    async asStudentGetData (requestData, userID) {
      const response = await fetch(Constants.SERVER_URL + `/api/admin/get-sessions/${userID}`, {
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
      const userID = this.$route.params.user_id
      const requestData = {
        currentPage: page,
        pageSize: rowsPerPage,
        filterField: this.currentMode.columnForSearch?.value || 'problemTitle',
        filterValue: this.currentMode.filterValue
      }
      const responseData = await this.currentMode.getData(requestData, userID)
      this.currentMode.data = responseData.data
      this.currentMode.pagination.rowsNumber = responseData.count
      this.currentMode.pagination.page = page
      this.loadingData = false
    },
    async initPage () {
      this.loadingPage = true
      await this.getProblem('rand string')
      this.currentTab = 'student'
      await this.$nextTick()
      await this.getProblem('rand string')
      this.currentTab = 'teacher'
      const response = await fetch(Constants.SERVER_URL + `/api/admin/get-sessions/${this.$route.params.user_id}`, Constants.GET_INIT)
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.informationAboutUser = responseData.data
      this.loadingPage = false
    }
  },
  async created () {
    this.loadingPage = true
    this.asStudent.getData = this.asStudentGetData
    this.asTeacher.getData = this.asTeacherGetData
    while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
    }
    await exceptionHandlerDecorator.call(this, [this.initPage, true])()
    this.getProblem = exceptionHandlerDecorator.call(this, [this.getProblem], 'loadingData')
    this.loadingPage = false
  },
  computed: {
    currentMode () {
      return this.currentTab === 'teacher' ? this.asTeacher : this.asStudent
    }
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(this, [this.initPage, true])()
    }
  }
}
</script>

<style scoped>

</style>
