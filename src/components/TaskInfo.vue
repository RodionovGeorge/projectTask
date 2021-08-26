<template>
  <div
    class="column no-wrap task-info"
    style="padding: 0 10px 10px 10px"
  >
    <div
      class="row"
    >
      <div
        class="text-h6 text-center"
      >
        Описание задачи
      </div>
      <q-btn
        flat
        icon="bi-gear"
        @click="onEditTaskClick"
      />
      <q-btn
        v-if="!taskActive"
        flat
        icon="bi-sunrise"
        @click="onSunriseClick"
      />
      <q-btn
        v-else
        flat
        icon="bi-sunset"
        @click="onSunsetClick"
      />
    </div>
    <table
      class="task-info-table"
    >
      <tr>
        <td>
          Название задачи
        </td>
        <td>
          {{problemTitle}}
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
      <tr>
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
          {{ authorCommentary }}
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
    authorAvatarPath: {
      type: String,
      default: 'https://cdn.quasar.dev/img/boy-avatar.png'
    },
    authorFullName: {
      type: String,
      default: 'Родионов Георгий Витальевич'
    },
    authorGroup: {
      type: String,
      default: '-1'
    },
    authorCommentary: {
      type: String,
      default: '123 123 123 123123 123 123 123123 123 123 123123 123 123 123123 123 123 123123 123 123 123'
    },
    problemPath: {
      type: String,
      default: 'pdfExample/OS1.pdf'
    },
    problemHidden: {
      type: Boolean,
      default: false
    },
    problemTitle: {
      type: String,
      default: 'ИДЗ по алгебре'
    },
    problemStartLine: {
      type: String,
      default: '12.12.2021'
    },
    problemDeadline: {
      type: String,
      default: '24.12.2021'
    },
    problemDiscipline: {
      type: String,
      default: 'Алгебра и геометрия'
    },
    problemComplexity: {
      type: String,
      default: 'Средняя'
    }
  },
  methods: {
    fileDownload () {
      const a = document.createElement('a')
      a.href = this.problemFileURL
      a.download = '' + this.$route.params.task_id + '.pdf'
      a.click()
    },
    onSunriseClick () {
      this.$emit('sunrise')
    },
    onSunsetClick () {
      this.$emit('sunset')
    },
    onEditTaskClick () {
      this.$emit('edit')
    }
  }
}
</script>
