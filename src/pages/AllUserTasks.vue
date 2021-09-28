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
          @input="getProblem"
          label="Столбец"
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
        @row-click="onRowClick"
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
  name: 'AllUserTasks',
  components: { ErrorDialog, LoadingSpinner },
  data () {
    return {
      loadingPage: false,
      loadingData: false,
      errorDialogShow: false,
      errorMessage: '',
      currentTab: 'teacher',
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
        data: null,
        visibleColumns: ['problemTitle', 'authorFullName', 'problemDiscipline', 'haveNewContent'],
        columns: [
          {
            name: 'problemID',
            field: 'id'
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
          },
          {
            name: 'haveNewContent',
            required: true,
            label: 'Наличие обновлений',
            align: 'center',
            format: val => val ? 'Да' : 'Нет',
            field: 'haveNewContent'
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
        columnForSearch: '',
        filterValue: '',
        data: null,
        visibleColumns: ['problemTitle', 'startDate', 'endDate', 'problemStatus', 'haveNewContent'],
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
          },
          {
            name: 'haveNewContent',
            required: true,
            label: 'Наличие обновлений',
            align: 'center',
            field: 'haveNewContent'
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
    onRowClick (evt, row) {
      this.$router.push('/task/' + row.problemID)
    },
    async asTeacherGetData (requestData) {
      const response = await fetch(Constants.SERVER_URL + '/api/teacher/problems', {
        method: 'POST',
        credentials: 'same-origin',
        headers: Constants.HEADERS,
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      for (const problem of responseData.problems) {
        problem.startDate = toLocalDate(problem.startDate)
        problem.endDate = toLocalDate(problem.endDate)
      }
      return responseData
    },
    async asStudentGetData (requestData) {
      const response = await fetch(Constants.SERVER_URL + '/api/student/problems', {
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
        !Object.prototype.hasOwnProperty.call(props, 'label') && typeof props !== 'string'
          ? props.pagination
          : this.currentMode.pagination
      this.loadingData = true
      const requestData = {
        currentPage: page,
        pageSize: rowsPerPage,
        filterField: this.currentMode.columnForSearch.value || 'problemTitle',
        filterValue: this.currentMode.filterValue
      }
      const responseData = await this.currentMode.getData(requestData)
      this.currentMode.data = responseData.problems
      this.currentMode.pagination.rowsNumber = responseData.problemCount
      this.currentMode.pagination.page = page
      this.loadingData = false
    },
    async initPage () {
      await this.getProblem('rand string')
      this.currentTab = 'student'
      await this.$nextTick()
      await this.getProblem('rand string')
      this.currentTab = 'teacher'
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
  }
}
</script>

<style scoped>

</style>
