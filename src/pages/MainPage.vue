<template>
  <q-page
    class="column items-center"
  >
    <LoadingSpinner
      :loading="pageLoading"
    />
    <div
      class="column content-background content-shadow q-pa-xs q-ma-xs"
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
          maxlength="60"
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
        title="Доступные задачи"
        style="width:1100px; border-radius: 0"
        flat
        bordered
        @request="fetchData"
        @row-click="onRowClick"
        :pagination.sync="pagination"
        :data="data"
        :columns="columns"
        :rows-per-page-options="[3, 5, 7, 10, 15, 20, 25, 50]"
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
      currentColumnForSearch: { label: 'Название', value: 'problemTitle' },
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
          field: 'problemID'
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
          field: 'authorFullName',
          style: 'min-width: 150px'
        },
        {
          name: 'authorGroup',
          required: true,
          format: val => val === '-1' ? '-' : val,
          label: 'Группа автора',
          align: 'center',
          field: 'authorGroup',
          style: 'min-width: 150px',
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
          style: 'min-width: 150px',
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
        props && Object.prototype.hasOwnProperty.call(props, 'pagination')
          ? props.pagination
          : this.pagination
      this.tableLoading = true
      if (this.currentColumnForSearch?.value === 'authorGroup' && this.filter === '-') {
        this.filter = '-1'
      }
      const requestData = {
        currentPage: page,
        pageSize: rowsPerPage,
        filterField: this.currentColumnForSearch?.value || 'problemTitle',
        filterValue: this.filter,
        sortField: sortBy || 'problemTitle',
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
      this.pagination.rowsNumber = responseData.problemCount
      this.tableLoading = false
    },
    async init () {
      this.pageLoading = true
      const requestData = {
        currentPage: this.pagination.page,
        pageSize: this.pagination.rowsPerPage,
        filterField: 'problemTitle',
        filterValue: this.filter,
        sortField: 'problemTitle',
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
      this.data = responseData.problems
      this.pageLoading = false
    }
  },
  async created () {
    this.fetchData = exceptionHandlerDecorator.call(this, [this.fetchData], 'tableLoading')
    await exceptionHandlerDecorator.call(this, [this.init, true])()
  }
}
</script>
