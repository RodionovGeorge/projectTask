<template>
  <q-page
    class="column items-center"
  >
    <LoadingSpinner
      :loading="pageLoading"
    />
    <div
      class="column content-background content-shadow q-pa-xs"
      v-if="data"
    >
      <div
        class="row"
        style="width: 100%"
      >
        <q-input
          v-model="filter"
          label="Поиск по столбцу"
          debounce="1000"
          :readonly="this.currentColumnForSearch === ''"
          square
          outlined
          style="width:80%"
          @input="fetchData"
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
          :options="namesOfSearchColumns"
          label="Столбец"
          options-dense
          style="width:20%"
          v-model="currentColumnForSearch"
          @input="fetchData"
        />
      </div>
      <q-table
        class="q-mt-xs"
        wrap-cells
        style="width:1100px; border-radius: 0"
        flat
        bordered
        @request="fetchData"
        @row-click="onRowClick"
        :pagination.sync="pagination"
        :data="data"
        :columns="columns"
        :rows-per-page-options="[this.pagination.rowsPerPage]"
        :loading="tableLoading"
        row-key="problemID"
        :visible-columns="visibleColumns"
        no-data-label="Задачи не найдены"
        binary-state-sort
      />
    </div>
    <ErrorDialog
      :p-error-message="errorMessage"
      :p-error-dialog-show="errorDialogShow"
      @off="errorDialogShow = false"
    />
  </q-page>
</template>

<script>
import LoadingSpinner from 'components/LoadingSpinner'
import ErrorDialog from 'components/ErrorDialog'
import { Constants, exceptionHandlerDecorator } from 'boot/Constants'
export default {
  name: 'pageMain',
  components: { LoadingSpinner, ErrorDialog },
  data () {
    return {
      filter: '',
      pageLoading: false,
      tableLoading: false,
      errorDialogShow: false,
      errorMessage: '',
      currentColumnForSearch: '',
      visibleColumns: ['problemName', 'authorFullName', 'authorGroup', 'problemDiscipline', 'problemComplexity'],
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
        },
        {
          label: 'Сложность',
          value: 'problemComplexity'
        }
      ],
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: Constants.ROWS_PER_PAGE,
        rowsNumber: null
      },
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
          field: 'problemTitle',
          sortable: true
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
          field: 'authorGroup',
          sortable: true
        },
        {
          name: 'problemDiscipline',
          label: 'Предмет',
          field: 'problemDiscipline',
          align: 'center',
          sortable: true
        },
        {
          name: 'problemComplexity',
          label: 'Сложность',
          field: 'problemComplexity',
          align: 'center',
          sortable: true
        }
      ],
      data: null
    }
  },
  methods: {
    onRowClick (evt, row) {
      this.$router.push('/task/' + row.problemID)
    },
    async fetchData (props) {
      // Надо что-то придумать с тем, что q-select очищается клавиатурой
      const { page, rowsPerPage, sortBy, descending } =
        !Object.prototype.hasOwnProperty.call(props, 'label') && typeof props !== 'string'
          ? props.pagination
          : this.pagination
      this.tableLoading = true
      if (this.currentColumnForSearch.value === 'authorGroup' && this.filter === '-') {
        this.filter = '-1'
      }
      const requestData = {
        currentPage: page,
        pageSize: rowsPerPage,
        filterField: this.currentColumnForSearch.value || 'problemTitle',
        filterValue: this.filter,
        sortField: sortBy,
        sortDirection: descending ? 'desc' : 'asc'
      }
      const response = await fetch(Constants.SERVER_URL + '/api/problem/-1',
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
      }
      this.data = responseData.problems
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.tableLoading = false
    },
    async init () {
      this.pageLoading = true
      const requestData = {
        currentPage: this.pagination.page,
        pageSize: this.pagination.rowsPerPage,
        filterField: 'problemTitle',
        filterValue: this.filter,
        sortField: this.pagination.sortBy,
        sortDirection: this.pagination.descending ? 'desc' : 'asc'
      }
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      const response = await fetch(Constants.SERVER_URL + '/api/problem/-1',
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
      }
      this.pagination.rowsNumber = responseData.problemCount
      for (const problem of responseData.problems) {
        problem.authorGroup = problem.authorGroup === '-1' ? '-' : problem.authorGroup
      }
      this.data = responseData.problems
      this.pageLoading = false
    }
  },
  /* fetchData (props) {
      const { page, rowsPerPage, sortBy, descending } =
        !Object.prototype.hasOwnProperty.call(props, 'label') && typeof props !== 'string'
          ? props.pagination
          : this.pagination
      this.tableLoading = true
      if (this.currentColumnForSearch.value === 'authorGroup' && this.filter === '-') {
        this.filter = '-1'
      }
      const data = {
        currentPage: page,
        pageSize: rowsPerPage,
        filterField: this.currentColumnForSearch.value || 'problemTitle',
        filterValue: this.filter,
        sortField: sortBy,
        sortDirection: descending ? 'desc' : 'asc'
      }
      fetch(Constants.SERVER_URL + '/api/problem/-1',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: Constants.HEADERS,
          body: JSON.stringify(data)
        }
      ).then(
        response => response.json()
      ).then(
        data => {
          if (data.message === 'success') {
            this.pagination.rowsNumber = data.problemCount
            for (const problem of data.problems) {
              problem.authorGroup = problem.authorGroup === '-1' ? '-' : problem.authorGroup
            }
            this.data = data.problems
            this.tableLoading = false
            this.pagination.page = page
            this.pagination.rowsPerPage = rowsPerPage
            this.pagination.sortBy = sortBy
            this.pagination.descending = descending
          } else {
            this.errorMessage = Constants.ERROR_MESSAGES[data.message]
            this.errorDialogShow = true
            this.tableLoading = false
          }
        }
      ).catch(
        () => {
          this.errorMessage = 'Нет соединения!'
          this.errorDialogShow = true
          this.tableLoading = false
        }
      )
    }
  }, */
  async created () {
    this.fetchData = exceptionHandlerDecorator.call(this, [this.fetchData], 'tableLoading')
    await exceptionHandlerDecorator.call(this, [this.init, true], 'pageLoading')()
  }
  /* async created () {
    try {
      this.pageLoading = true
      const requestData = {
        currentPage: this.pagination.page,
        pageSize: this.pagination.rowsPerPage,
        filterField: 'problemTitle',
        filterValue: this.filter,
        sortField: this.pagination.sortBy,
        sortDirection: this.pagination.descending ? 'desc' : 'asc'
      }
      while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
        await new Promise((resolve, reject) => setTimeout(resolve, 200))
      }
      const response = await fetch(Constants.SERVER_URL + '/api/problem/-1',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: Constants.HEADERS,
          body: JSON.stringify(requestData)
        }
      )
      const data = await response.json()
      if (data.message === 'success') {
        this.pagination.rowsNumber = data.problemCount
        for (let i = 0; i < data.problems.length; i++) {
          data.problems[i].authorGroup = data.problems[i].authorGroup === '-1' ? '-' : data.problems[i].authorGroup
        }
        this.data = data.problems
        this.pageLoading = false
      } else {
        if (data.message === 'need authentication') {
          await this.$router.push('/login')
        } else {
          await this.$router.push('/server-error')
        }
      }
    } catch {
      await this.$router.push('/connection-error')
    }
  } */
}
</script>
