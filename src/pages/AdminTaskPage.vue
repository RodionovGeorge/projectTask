<template>
  <q-page
    class="column items-center"
  >
    <LoadingSpinner
      :loading="pageLoading"
    />
    <div
      class="column items-center q-py-sm q-gutter-y-sm"
      v-if="!pageLoading"
    >
      <TaskInfo
        v-bind="problemInformation"
        :deleting="deleteProblemLoading"
        class="content-background content-shadow"
      />
      <div
        class="column student-table content-shadow content-background"
        style="padding: 10px 10px 10px 10px"
      >
        <div
          class="row q-mb-xs"
        >
          <q-input
            v-model="filterValue"
            outlined
            square
            style="width: 90%; margin-right: 5px"
            debounce="1000"
            label="Поиск"
          >
            <template
              v-slot:append
            >
              <q-icon
                name="search"
              />
            </template>
          </q-input>
          <q-btn
            icon="bi-info-circle"
            flat
            @click="infoDialogShow = true"
            style="width:calc(10% - 5px)"
          />
        </div>
        <q-table
          square
          flat
          bordered
          :columns="columns"
          :visible-columns="visibleColumns"
          :pagination.sync="pagination"
          :loading="listLoading"
          :rows-per-page-options="pagination.rowsPerPage"
          row-key="sessionID"
          binary-state-sort
          :data="sessionData"
          no-data-label="Ученики не найдены."
        >
          <template
            v-slot:body-cell="props"
          >
            <q-td
              :props="props"
              :class="props.row.sessionID === currentSessionID ? 'bg-primary text-white' : 'bg-white text-black'"
            >
              {{props.value}}
            </q-td>
          </template>
        </q-table>
      </div>
      <div
        class="column no-wrap q-gutter-x-sm"
        v-if="currentSessionID"
      >
        <div
          class="column q-gutter-y-sm items-center"
        >
          <div
            class="row no-wrap full-attempt"
          >
            <AttemptForStudent
              v-bind="currentAttempt.studentAttempt"
              :show-delete-button="true"
              :deleting="deleteStudentAttemptLoading"
              class="content-background content-shadow full-attempt-student"
              @delete="confirmDialogShow = true"
            />
            <TeacherFeedback
              v-bind="currentAttempt.teacherFeedback"
              :deleting="deleteTeacherFeedbackLoading"
              :show-delete-button="currentAttempt.studentAttempt.checkStatus === 'Проверена'"
              class="content-background content-shadow full-attempt-teacher"
              @delete="confirmDialogShow = true"
            />
          </div>
          <div
            class="attempt-discussion content-shadow content-background"
          >
            <div
              class="text-h6"
            >
              Обсуждение попытки
            </div>
            <div
              class="q-gutter-y-sm"
            >
              <q-virtual-scroll
                style="max-height: 400px"
                :items="currentAttempt.commentaries"
              >
                <template
                  v-slot="{ item }"
                >
                  <Commentary
                    :author-full-name="teacherInfo.id === item.authorID ? teacherInfo.fullName : studentInfo.fullName"
                    :author-i-d="item.authorID"
                    :avatar-path="teacherInfo.id === item.authorID ? teacherInfo.avatarPath : studentInfo.avatarPath"
                    :commentary-date="item.commentaryDate"
                    :commentary-i-d="item.commentaryID"
                    :commentary-text="item.commentaryText"
                    :user-status="problemInformation.userStatus"
                    :loading="deleteCommentaryLoading"
                    :show-delete-button="true"
                    @delete="confirmDialogShow = true"
                  />
                </template>
              </q-virtual-scroll>
            </div>
          </div>
          <div
            class="content-background content-shadow previous-attempts"
            v-if="attemptMaxNumber > 1 && !attemptLoading"
          >
            <div
              class="text-h6"
            >
              Предыдущие попытки
            </div>
            <div class="q-gutter-y-xs">
              <q-pagination
                class="flex flex-center"
                v-model="currentPreviousAttemptNumber"
                :max="attemptMaxNumber - 1"
                boundary-numbers
              />
              <div
                class="row no-wrap full-attempt"
              >
                <AttemptForStudent
                  v-bind="previousAttempt.studentAttempt"
                  :show-delete-button="false"
                  class="content-shadow-for-white full-attempt-student"
                  @delete="confirmDialogShow = true"
                />
                <TeacherFeedback
                  v-bind="previousAttempt.teacherFeedback"
                  :show-delete-button="false"
                  class="content-shadow-for-white full-attempt-teacher"
                  @delete="confirmDialogShow = true"
                />
              </div>
              <div
                class="attempt-discussion content-shadow-for-white"
              >
                <div
                  class="text-h6"
                >
                  Обсуждение попытки
                </div>
                <div
                  class="q-gutter-y-sm"
                >
                  <q-virtual-scroll
                    v-if="paCommentaryNotEmpty"
                    style="max-height: 200px"
                    :items="previousAttempt.commentaries"
                  >
                    <template
                      v-slot="{ item }"
                    >
                      <Commentary
                        :author-full-name="teacherInfo.id === item.authorID ? teacherInfo.fullName : studentInfo.fullName"
                        :author-i-d="item.authorID"
                        :avatar-path="teacherInfo.id === item.authorID ? teacherInfo.avatarPath : studentInfo.avatarPath"
                        :commentary-date="item.commentaryDate"
                        :commentary-i-d="item.commentaryID"
                        :commentary-text="item.commentaryText"
                        :user-status="problemInformation.userStatus"
                        :show-delete-button="true"
                        @delete="confirmDialogShow = true"
                      />
                    </template>
                  </q-virtual-scroll>
                  <div
                    v-else
                  >
                    Комментариев нет.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <LoadingSpinner
            v-if="attemptLoading"
            :loading="attemptLoading"
          />
        </div>
      </div>
    </div>
    <ErrorDialog
      :p-error-dialog-show="errorDialogShow"
      :p-error-message="errorMessage"
      @off="errorDialogShow = false"
    />
    <q-dialog
      v-model="confirmDialogShow"
      persistent
    >
      <q-card>
        <q-card-section
          class="row items-center"
        >
          <q-avatar
            icon="bi-exclamation-circle"
            color="white"
            size="50px"
          />
          <p
            class="q-ml-sm text-center"
            style="width: calc(100% - 70px)"
          >
            Вы уверены? Это действие отменить нельзя. <br> Удаление влечет блокировку соответствующей роли пользователя.
          </p>
        </q-card-section>

        <q-card-actions
          align="right"
        >
          <q-btn
            flat
            label="Отмена"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            label="Да"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="infoDialogShow"
    >
      <q-card>
        <q-card-section>
          <div
            class="text-h6"
          >
            Справка
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Для фильтрации по имени нужно просто ввести необходимый запрос.<br>
          Для фильтрации по группе запрос нужно начать с '.g' (без кавычек).
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import TaskInfo from 'components/TaskInfo'
import AttemptForStudent from 'components/AttemptForStudent'
import TeacherFeedback from 'components/TeacherFeedback'
import Commentary from 'components/Commentary'
import ErrorDialog from 'components/ErrorDialog'
import LoadingSpinner from 'components/LoadingSpinner'
export default {
  components: { TaskInfo, AttemptForStudent, TeacherFeedback, Commentary, ErrorDialog, LoadingSpinner },
  name: 'Task',
  data () {
    return {
      pageLoading: false,
      confirmDialogShow: false,
      attemptLoading: false,
      deleteProblemLoading: false,
      deleteStudentAttemptLoading: false,
      listLoading: false,
      deleteTeacherFeedbackLoading: false,
      deleteCommentaryLoading: false,
      problemInformation: null,
      filterValue: '',
      sessionData: null,
      visibleColumns: ['studentFullName', 'studentGroup', 'haveNewContent'],
      columns: [
        {
          name: 'sessionID',
          field: 'sessionID'
        },
        {
          name: 'studentFullName',
          label: 'Ученик',
          align: 'center',
          field: 'studentFullName',
          sortable: true
        },
        {
          name: 'studentGroup',
          label: 'Группа',
          align: 'center',
          format: val => val === '-1' ? '-' : val,
          field: 'studentGroup',
          sortable: true
        }
      ],
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 1
      },
      currentSessionID: false,
      teacherInfo: {
        id: null,
        avatarPath: null,
        fullName: null
      },
      studentInfo: {
        id: null,
        avatarPath: null,
        fullName: null
      },
      currentAttempt: {
        attemptID: null,
        studentAttempt: {
          attemptNumber: null,
          checkStatus: null,
          dateOfLastChange: null,
          problemFileURL: null
        },
        teacherFeedback: {
          decisionStage: null,
          checkDate: null,
          problemFileURL: null,
          teacherCommentary: null
        },
        commentaries: null
      },
      attemptMaxNumber: 0,
      currentPreviousAttemptNumber: null,
      previousAttempt: {
        attemptID: null,
        studentAttempt: {
          attemptNumber: null,
          checkStatus: null,
          dateOfLastChange: null,
          problemFileURL: null
        },
        teacherFeedback: {
          decisionStage: null,
          checkDate: null,
          problemFileURL: null,
          teacherCommentary: null
        },
        commentaries: null
      }
    }
  },
  computed: {
    paCommentaryNotEmpty () {
      return this.previousAttempt.commentaries?.length
    }
  }
}
</script>
