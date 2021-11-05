<template>
  <div
    class="column no-wrap task-info"
    style="padding: 0 0 10px 10px"
  >
    <div
      class="row"
      style="justify-content: space-between"
    >
      <div
        class="text-h6 text-center"
      >
        Описание задачи
      </div>
      <div>
        <q-btn
          v-if="editButtonShow"
          flat
          dense
          icon="bi-gear"
          @click="onEditTaskClick"
        />
        <q-btn
          v-if="sunriseButtonShow"
          flat
          dense
          icon="bi-sun"
          :loading="loading"
          @click="onSunriseClick"
        >
          <template
            v-slot:loading
          >
            <q-spinner
              :thickness="2"
            />
          </template>
        </q-btn>
        <q-btn
          v-if="sunsetButtonShow"
          flat
          dense
          icon="bi-cloudy"
          :loading="loading"
          @click="onSunsetClick"
        >
          <template
            v-slot:loading
          >
            <q-spinner
              :thickness="2"
            />
          </template>
        </q-btn>
        <q-btn
          v-if="deleteButtonShow"
          icon="bi-trash"
          @click="onDelete"
          :loading="deleting"
          flat
          dense
        >
          <template
            v-slot:loading
          >
            <q-spinner
              :thickness="2"
            />
          </template>
        </q-btn>
      </div>
    </div>
    <table
      class="task-info-table"
    >
      <tr>
        <td>
          Название задачи
        </td>
        <td>
          {{ problemTitle }}
        </td>
      </tr>
      <tr>
        <td
          class="vertical-align-middle"
        >
          Автор
        </td>
        <td>
          <q-item
            class="q-pa-none"
          >
            <q-item-section
              side
            >
              <q-avatar>
                <img
                  :src="authorAvatarPath"
                  alt=""
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              {{ authorFullName }}
            </q-item-section>
          </q-item>
        </td>
      </tr>
      <tr>
        <td>
          Группа
        </td>
        <td>
          {{ authorGroup === '-1' ? 'Не указана' : authorGroup }}
        </td>
      </tr>
      <tr>
        <td>
          Предмет
        </td>
        <td>
          {{ problemDiscipline }}
        </td>
      </tr>
      <tr
        v-if="problemStatusShow"
      >
        <td>
          Статус задачи
        </td>
        <td>
          {{problemStatus}}
        </td>
      </tr>
      <tr
        v-if="adminCommentaryShow"
      >
        <td>
          Комментарий администратора
        </td>
        <td>
          {{problemRejectionReason}}
        </td>
      </tr>
      <tr
        v-if="complexityShow"
      >
        <td>
          Сложность
        </td>
        <td>
          {{ problemComplexity }}
        </td>
      </tr>
      <tr>
        <td>
          Интервал приема решений
        </td>
        <td>
          {{ problemStartLine }} - {{ problemDeadline }}
        </td>
      </tr>
      <tr>
        <td>
          Комментарий к задаче
        </td>
        <td>
          <pre>{{ authorCommentary === '' ? '-' : authorCommentary }}</pre>
        </td>
      </tr>
      <tr>
        <td class="vertical-align-middle">
          Условия задачи
        </td>
        <td>
          <div
            class="q-gutter-x-sm"
          >
            <q-btn
              flat
              icon="bi-box-arrow-in-down"
              @click="fileDownload"
            />
            <q-btn
              flat
              icon="bi-eye"
              @click="showProblem = true"
            />
          </div>
        </td>
      </tr>
    </table>
    <q-dialog
      v-model="showProblem"
    >
      <q-pdfviewer
        v-model="showProblem"
        :src="problemPath"
      >
      </q-pdfviewer>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'TaskInfo',
  data () {
    return {
      showProblem: false
    }
  },
  props: {
    editButtonShow: {
      type: Boolean,
      default: false
    },
    complexityShow: {
      type: Boolean,
      default: false
    },
    adminCommentaryShow: {
      type: Boolean,
      default: false
    },
    deleteButtonShow: {
      type: Boolean,
      default: false
    },
    sunsetButtonShow: {
      type: Boolean,
      default: false
    },
    sunriseButtonShow: {
      type: Boolean,
      default: false
    },
    problemStatusShow: {
      type: Boolean,
      default: true
    },
    problemID: {
      type: String
    },
    authorAvatarPath: {
      type: String
    },
    problemStatus: {
      type: String
    },
    authorFullName: {
      type: String
    },
    authorGroup: {
      type: String
    },
    authorCommentary: {
      type: String
    },
    problemPath: {
      type: String
    },
    problemTitle: {
      type: String
    },
    problemStartLine: {
      type: String
    },
    problemDeadline: {
      type: String
    },
    problemDiscipline: {
      type: String
    },
    problemComplexity: {
      type: String
    },
    problemRejectionReason: {
      type: String
    },
    loading: {
      type: Boolean
    },
    deleting: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    fileDownload () {
      const a = document.createElement('a')
      a.href = this.problemPath
      a.download = '' + this.$route.params.task_id + '.pdf'
      a.click()
    },
    onSunriseClick () {
      this.$emit('status-change', 'Принята')
    },
    onSunsetClick () {
      this.$emit('status-change', 'Скрыта')
    },
    onEditTaskClick () {
      this.$emit('edit')
    },
    onDelete () {
      this.$emit('delete')
    }
  }
}
</script>
