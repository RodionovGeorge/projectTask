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
          placeholder="Поиск по столбцу"
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
        class="q-mt-sm"
        wrap-cells
        style="width:1100px; border-radius: 0"
        flat
        bordered
        @request="fetchData"
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
    />
  </q-page>
</template>

<script>
import LoadingSpinner from 'components/LoadingSpinner'
import ErrorDialog from 'components/ErrorDialog'
import { Constants } from 'boot/Constants'
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
      data: []
    }
  },
  methods: {
    fetchData (props) {
      const { page, rowsPerPage, sortBy, descending } =
        !Object.prototype.hasOwnProperty.call(props, 'label') && typeof props !== 'string'
          ? props.pagination
          : this.pagination
      this.tableLoading = true
      const getParameters = new URLSearchParams()
      if (this.currentColumnForSearch.value === 'authorGroup' && this.filter === '-') {
        this.filter = '-1'
      }
      getParameters.append('currentPage', page)
      getParameters.append('pageSize', rowsPerPage)
      getParameters.append('filterField', this.currentColumnForSearch.value || 'problemTitle')
      getParameters.append('filterValue', this.filter)
      getParameters.append('sortField', sortBy)
      getParameters.append('sortDirection', descending ? 'desc' : 'asc')
      fetch(Constants.SERVER_URL + '/api/problem/-1?' + getParameters.toString(),
        Constants.GET_INIT
      ).then(
        response => response.json()
      ).then(
        data => {
          if (data.message === 'success') {
            this.pagination.rowsNumber = data.problemCount
            for (let i = 0; i < data.problems.length; i++) {
              data.problems[i].authorGroup = data.problems[i].authorGroup === '-1' ? '-' : data.problems[i].authorGroup
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
  },
  created () {
    this.data = null
    this.pageLoading = true
    const getParameters = new URLSearchParams()
    getParameters.append('currentPage', this.pagination.page)
    getParameters.append('pageSize', this.pagination.rowsPerPage)
    getParameters.append('filterField', 'problemTitle')
    getParameters.append('filterValue', this.filter)
    getParameters.append('sortField', this.pagination.sortBy)
    getParameters.append('sortDirection', this.pagination.descending ? 'desc' : 'asc')
    fetch(Constants.SERVER_URL + '/api/problem/-1?' + getParameters.toString(),
      Constants.GET_INIT
    ).then(
      response => response.json()
    ).then(
      data => {
        if (data.message === 'success') {
          this.pagination.rowsNumber = data.problemCount
          for (let i = 0; i < data.problems.length; i++) {
            data.problems[i].authorGroup = data.problems[i].authorGroup === '-1' ? '-' : data.problems[i].authorGroup
          }
          this.data = data.problems
          this.pageLoading = false
        } else {
          this.$router.push('/server-error')
        }
      }
    ).catch(
      (e) => {
        console.log(e)
        this.$router.push('/connection-error')
      }
    )
  }
}
</script>
