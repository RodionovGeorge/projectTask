<template>
<q-page
  class="column items-center"
>
  <loading-spinner
    :loading="pageLoading"
  />
  <div
    v-if="!pageLoading"
    style="width: 1100px;"
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
        wrap-cells
        flat
        square
        bordered
        no-data-label="Задачи не найдены."
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
              :color="props.row.studentRole ? 'green' : 'red'"
            />
            <q-btn
              label="Учитель"
              no-caps
              :color="props.row.teacherRole ? 'green' : 'red'"
            />
            <q-btn
              label="Администратор"
              no-caps
              :color="props.row.adminRole ? 'green' : 'red'"
            />
            <q-btn
              label="Помощник администратора"
              no-caps
              :color="props.row.subAdminRole ? 'green' : 'red'"
            />
          </q-td>
        </template>
        <template
          v-slot:body-cell-statistics
        >
          <q-td
            auto-width
          >
            <q-btn
              label="Показать"
              color="primary"
              @click="currentMode.onStatisticClick"
              no-caps
            >
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
          outlined
          square
          readonly
          label="От"
          class="q-mr-xs"
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
          outlined
          label="До"
          readonly
          square
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
          title="Как преподаватель"
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
          :data="statisticStudentData.data"
          :columns="statisticStudentData.columns"
          title="Как ученик"
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
        >
        </q-btn>
        <q-btn
          label="Закрыть"
          v-close-popup
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
  />
</q-page>
</template>

<script>
import LoadingSpinner from 'components/LoadingSpinner'
import { Constants } from 'boot/Constants'
import ErrorDialog from 'components/ErrorDialog'
export default {
  name: 'AdminTablePage',
  components: { ErrorDialog, LoadingSpinner },
  data () {
    return {
      errorDialogShow: false,
      pageLoading: false,
      loadingData: false,
      statisticDialogShow: false,
      errorMessage: '',
      currentTab: 'users',
      problemMode: {
        pagination: {
          sortBy: '',
          descending: false,
          page: 1,
          rowsPerPage: Constants.ROWS_PER_PAGE
          // rowsNumber: null
        },
        columnForSearch: '',
        filterValue: '',
        getData: null,
        onStatisticClick: null,
        data: [{ problemTitle: '123', authorFullName: 'Родионов Г. В.', authorGroup: '8305', problemDiscipline: 'Анализ' },
          { problemTitle: '123', authorFullName: 'Родионов Г. В.', authorGroup: '8305', problemDiscipline: 'Анализ' },
          { problemTitle: '123', authorFullName: 'Родионов Г. В.', authorGroup: '8305', problemDiscipline: 'Анализ' },
          { problemTitle: '123', authorFullName: 'Родионов Г. В.', authorGroup: '8305', problemDiscipline: 'Анализ' },
          { problemTitle: '123', authorFullName: 'Родионов Г. В.', authorGroup: '8305', problemDiscipline: 'Анализ' },
          { problemTitle: '123', authorFullName: 'Родионов Г. В.', authorGroup: '8305', problemDiscipline: 'Анализ' }
        ],
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
          rowsPerPage: Constants.ROWS_PER_PAGE
          // rowsNumber: null
        },
        columnForSearch: '',
        filterValue: '',
        getData: null,
        props: null,
        onStatisticClick: null,
        data: [{ userFullName: 'Родионов Георгий Витальевич', userGroup: '8305', studentRole: false, teacherRole: true, adminRole: true, subAdminRole: true },
          { userFullName: 'Родионов Георгий Витальевич', userGroup: '8305', studentRole: true, teacherRole: false, adminRole: true, subAdminRole: true },
          { userFullName: 'Родионов Георгий Витальевич', userGroup: '8305', studentRole: true, teacherRole: true, adminRole: false, subAdminRole: true },
          { userFullName: 'Родионов Георгий Витальевич', userGroup: '8305', studentRole: true, teacherRole: true, adminRole: true, subAdminRole: false },
          { userFullName: 'Родионов Георгий Витальевич', userGroup: '8305', studentRole: true, teacherRole: true, adminRole: true, subAdminRole: true }
        ],
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
      startStatisticDate: '',
      endStatisticDate: '',
      statisticTeacherTable: {
        data: [{ allProblemCount: 10, acceptedProblemCount: 2, averageDifficultOfProblems: 2.4, attemptCheckCount: 6, absolutelySolvedAttemptCount: 0 }],
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
      statisticStudentData: {
        data: [{ absolutelySolvedAttemptCount: 2, almostSolvedAttemptCount: 3, haveRightIdeaAttemptCount: 4, averageDifficultOfProblems: 1.3 }],
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
        // data: [{ absolutelySolvedPeopleCount: 30, almostSolvedPeopleCount: 40, haveRightIdeaPeopleCount: 50, haveWrongIdeaPeopleCount: 60 }],
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
    currentMode () {
      return this.currentTab === 'problems' ? this.problemMode : this.userMode
    },
    isAdmin () {
      return this.userInformation.roles.include
    }
  },
  methods: {
    onProblemStatisticClick () {
      this.currentStatisticIsProblem = true
      this.statisticDialogShow = true
    },
    onUserStatisticClick () {
      this.currentStatisticIsProblem = false
      this.statisticDialogShow = true
    },
    a (props) {
      console.log(props)
    }
  },
  created () {
    this.userMode.onStatisticClick = this.onUserStatisticClick
    this.problemMode.onStatisticClick = this.onProblemStatisticClick
  }
}
</script>

<style scoped>

</style>
