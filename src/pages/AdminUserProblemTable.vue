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
        class="row q-pa-sm q-mt-sm content-shadow content-background"
      >
        <div
          class="text-h6"
          style="width:250px; display:flex; align-items: center;"
        >
          Информация о пользователе
        </div>
        <q-item
          class="q-pa-none"
        >
          <q-item-section
            side
          >
            <q-avatar
              rounded
            >
              <img
                :src="informationAboutUser.authorAvatarPath"
                alt=""
              />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ informationAboutUser.authorFullName }} ({{informationAboutUser.authorGroup === '-1' ? '-' : informationAboutUser.authorGroup}})
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
          :visible-columns="currentMode.visibleColumns"
          :rows-per-page-options="[currentMode.pagination.rowsPerPage]"
          :loading="loadingData"
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
// import { Constants, exceptionHandlerDecorator, toLocalDate } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
import { Constants } from 'boot/Constants'
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
        data: null,
        visibleColumns: ['problemTitle', 'authorGroup', 'authorFullName', 'problemDiscipline'],
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
  computed: {
    currentMode () {
      return this.currentTab === 'teacher' ? this.asTeacher : this.asStudent
    }
  }
}
</script>

<style scoped>

</style>
