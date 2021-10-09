<template>
  <q-page
    class="column items-center"
  >
    <LoadingSpinner
      :loading="loading"
    />
    <div
      class="column content-background content-shadow q-pa-xs q-my-sm"
      v-if="data"
    >
      <div
        class="row"
        style="width: 100%"
      >
        <q-input
          v-model="filter"
          placeholder="Поиск по столбцу"
          square
          debounce="1000"
          outlined
          :readonly="this.currentColumnForSearch === ''"
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
          ref="select"
          square
          outlined
          label="Столбец"
          :options="namesOfSearchColumns"
          options-dense
          style="width:20%"
          v-model="currentColumnForSearch"
          @input="fetchData"
        />
      </div>
      <q-table
        ref="table"
        class="q-mt-sm"
        wrap-cells
        style="width:1100px; border-radius: 0"
        flat
        bordered
        @request="fetchData"
        @row-click="onRowClick"
        :loading="tableLoading"
        :data="data"
        :columns="columns"
        :pagination.sync="pagination"
        :rows-per-page-options="[this.pagination.rowsPerPage]"
        row-key="problemID"
        :visible-columns="visibleColumns"
        no-data-label="В данный момент задач для допуска нет или ничего не найдено"
        binary-state-sort
      />
    </div>
    <q-dialog
      v-model="errorDialogShow"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="bg-red text-white"
        style="width: 300px"
      >
        <q-card-section>
          <div
            class="text-h6 text-center"
          >
            Ошибка
          </div>
        </q-card-section>

        <q-card-section
          class="q-pt-none text-center"
        >
          {{errorMessage}}
        </q-card-section>

        <q-card-actions
          align="center"
          class="bg-white text-black"
        >
          <q-btn
            flat
            label="OK"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Constants, exceptionHandlerDecorator, toLocalDate } from 'boot/Constants'
import LoadingSpinner from 'components/LoadingSpinner'

export default {
  name: 'OpeningTaskTablePage',
  components: { LoadingSpinner },
  data () {
    return {
      filter: '',
      loading: false,
      tableLoading: false,
      errorDialogShow: false,
      errorMessage: '',
      currentColumnForSearch: '',
      currentSelectLabel: 'Название',
      visibleColumns: ['problemName', 'authorFullName', 'authorGroup', 'problemStartLine', 'problemDeadline'],
      namesOfSearchColumns: [
        {
          label: 'Название',
          value: 'problemTitle'
        },
        {
          label: 'Фамилия',
          value: 'authorLastname'
        },
        {
          label: 'Имя',
          value: 'authorFirstname'
        },
        {
          label: 'Группа',
          value: 'authorGroup'
        }
      ],
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
          name: 'authorLastname',
          required: true,
          label: 'Фамилия',
          align: 'center',
          field: 'authorLastname',
          sortable: true
        },
        {
          name: 'authorFirstname',
          required: true,
          label: 'Имя',
          align: 'center',
          field: 'authorFirstname',
          sortable: true
        },
        {
          name: 'authorGroup',
          required: true,
          label: 'Группа автора',
          align: 'center',
          field: 'authorGroup',
          format: val => val === '-1' ? '-' : val,
          sortable: true
        },
        {
          name: 'problemStartLine',
          label: 'Дата открытия задачи',
          field: 'problemStartLine',
          align: 'center',
          sortable: true
        },
        {
          name: 'problemDeadline',
          label: 'Дата закрытия задачи',
          field: 'problemDeadline',
          align: 'center',
          sortable: true
        }
      ],
      data: null,
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: Constants.ROWS_PER_PAGE,
        rowsNumber: null
      }
    }
  },
  methods: {
    onRowClick (evt, row) {
      this.$router.push('/task-opening/' + row.problemID)
    },
    timeToLocal () {
      for (const problem of this.data) {
        problem.problemStartLine = toLocalDate(problem.problemStartLine)
        problem.problemDeadline = toLocalDate(problem.problemDeadline)
      }
    },
    async fetchData (props) {
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
        sortField: sortBy || 'problemTitle',
        sortDirection: descending ? 'desc' : 'asc'
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admitting-problem/-1',
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
      this.timeToLocal()
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      this.tableLoading = false
    },
    async init () {
      this.loading = true
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
      const response = await fetch(Constants.SERVER_URL + '/api/admitting-problem/-1',
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
      this.timeToLocal()
      this.loading = false
    }
  },
  async created () {
    this.fetchData = exceptionHandlerDecorator.call(this, [this.fetchData], 'tableLoading')
    await exceptionHandlerDecorator.call(this, [this.init, true], 'loading')()
  }
}
</script>

<style scoped>

</style>
