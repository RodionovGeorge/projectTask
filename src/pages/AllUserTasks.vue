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
          options-dense
          style="width:30%"
          v-model="currentMode.columnForSearch"
        />
      </div>
      <q-table
        :data="currentMode.data"
        :columns="currentMode.columns"
        :pagination.sync="currentMode.pagination"
        :rows-per-page-options="[currentMode.pagination.rowsPerPage]"
        wrap-cells
        flat
        square
        bordered
        no-data-label="Задачи не найдены."
      />
    </div>
  </div>
</q-page>
</template>

<script>
import LoadingSpinner from 'components/LoadingSpinner'
export default {
  name: 'AllUserTasks',
  components: { LoadingSpinner },
  data () {
    return {
      loadingPage: false,
      currentTab: '',
      asStudent: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: 5
          // rowsNumber: 5
        },
        columnForSearch: '',
        filterValue: '',
        data: [
          { problemTitle: 'test1', authorFullName: 'Родионов Георгий Витальевич', authorGroup: '8305', problemDiscipline: 'Математический анализ', haveNewContent: 'Да' },
          { problemTitle: 'test1', authorFullName: 'test1 t. t.', authorGroup: '8305', problemDiscipline: 'Математический анализ', haveNewContent: 'Да' },
          { problemTitle: 'test1', authorFullName: 'test1 t. t.', authorGroup: '8305', problemDiscipline: 'Математический анализ', haveNewContent: 'Да' },
          { problemTitle: 'test1', authorFullName: 'test1 t. t.', authorGroup: '8305', problemDiscipline: 'Математический анализ', haveNewContent: 'Да' },
          { problemTitle: 'test1', authorFullName: 'test1 t. t.', authorGroup: '8305', problemDiscipline: 'Математический анализ', haveNewContent: 'Да' }
        ],
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
            name: 'haveNewContent',
            required: true,
            label: 'Наличие обновлений',
            align: 'center',
            field: 'haveNewContent',
            sortable: true
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
          },
          {
            label: 'Наличие обновлений',
            value: 'haveNewContent'
          }
        ]
      },
      asTeacher: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: 3
          // rowsNumber: 5
        },
        columnForSearch: '',
        filterValue: '',
        data: [
          { problemTitle: 'test2', startDate: '23.07.2000', endDate: '23.08.2000', problemStatus: 'Заблокирована', haveNewContent: 'Нет' },
          { problemTitle: 'test2', startDate: '23.07.2000', endDate: '23.08.2000', problemStatus: 'Заблокирована', haveNewContent: 'Нет' },
          { problemTitle: 'test2', startDate: '23.07.2000', endDate: '23.08.2000', problemStatus: 'Заблокирована', haveNewContent: 'Нет' },
          { problemTitle: 'test2', startDate: '23.07.2000', endDate: '23.08.2000', problemStatus: 'Заблокирована', haveNewContent: 'Нет' },
          { problemTitle: 'test2', startDate: '23.07.2000', endDate: '23.08.2000', problemStatus: 'Заблокирована', haveNewContent: 'Нет' }
        ],
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
            name: 'startDate',
            required: true,
            label: 'Дата начала приема решений',
            align: 'center',
            field: 'startDate',
            sortable: true
          },
          {
            name: 'endDate',
            required: true,
            label: 'Дата окончания приема решений',
            align: 'center',
            field: 'endDate',
            sortable: true
          },
          {
            name: 'problemStatus',
            required: true,
            label: 'Статус задачи',
            align: 'center',
            field: 'problemStatus',
            sortable: true
          },
          {
            name: 'haveNewContent',
            required: true,
            label: 'Наличие обновлений',
            align: 'center',
            field: 'haveNewContent',
            sortable: true
          }
        ],
        namesOfSearchColumns: [
          {
            label: 'Название',
            value: 'problemTitle'
          },
          {
            label: 'Дата начала приема решений',
            value: 'startDate'
          },
          {
            label: 'Дата окончания приема решений',
            value: 'endDate'
          },
          {
            label: 'Наличие обновлений',
            value: 'haveNewContent'
          },
          {
            label: 'Статус задачи',
            value: 'problemStatus'
          }
        ]
      }
    }
  },
  created () {
    this.currentTab = 'teacher'
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
