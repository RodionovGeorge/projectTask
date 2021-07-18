<template>
  <div
    class="column no-wrap"
    style="width: 850px; padding: 0 10px 10px 10px"
  >
    <div
      class="row"
    >
      <div
        class="text-h6"
      >
        Описание задачи
      </div>
      <!-- Потом добавить проверку на то, что текущий пользователь является преподавателем -->
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
    <div
      class="row"
    >
      <div
        style="width:250px"
      >
        Название задачи
      </div>
      <div
        style="width:578px; overflow-wrap: normal"
      >
        {{ problemName }}
      </div>
    </div>
    <div
      class="row"
    >
      <div
        style="width:250px"
      >
        Автор
      </div>
      <q-item
        clickable
        v-ripple
        class="q-pa-none"
      >
        <q-item-section
          side
        >
          <q-avatar
            square
          >
            <img
              :src="authorAvatarPath"
              alt=""
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          {{ authorFullName }} ({{authorGroup}})
        </q-item-section>
      </q-item>
    </div>
    <div
      class="row"
    >
      <div
        style="width:250px"
      >
        Предмет
      </div>
      <div>
        {{problemDiscipline}}
      </div>
    </div>
    <div
      class="row"
    >
      <div
        style="width:250px"
      >
        Дата начала
      </div>
      <div>
        {{problemDateStart}}
      </div>
    </div>
    <div
      class="row"
    >
      <div
        style="width:250px"
      >
        Дата окончания
      </div>
      <div>
        {{problemDateEnd}}
      </div>
    </div>
    <div
      class="row"
    >
      <div
        style="width:250px; height: 32px"
      >
        Комментарий к задаче
      </div>
      <div
        style="width: 578px"
      >
        {{authorCommentary}}
      </div>
    </div>
    <div class="row items-center">
      <div
        style="width: 250px"
      >
        Условия задачи
      </div>
      <div
        class="q-gutter-x-sm"
      >
        <q-btn
          flat
          icon="bi-box-arrow-in-down"
        />
        <q-btn
          flat
          icon="bi-eye"
          @click="showProblem = true"
        />
      </div>
    </div>
    <q-dialog
      v-model="showProblem"
      class="task-condition-dialog"
    >
      <q-pdfviewer
        v-model="showProblem"
        :src="problemPath"
      >
      </q-pdfviewer>
    </q-dialog>
    <!-- <div
      class="row q-gutter-x-md"
    >
      <div
        style="width:250px; display:flex; align-items: center;"
      >
        Показать условие задачи
      </div>
      <q-toggle
        v-model="problemVisible"
      />
    </div>
    <q-slide-transition>
      <div
        v-show="problemVisible"
      >
        <q-pdfviewer
          v-model="problemVisible"
          :src="problemPath"
          style="height: 900px; border: 1px solid black"
        >
        </q-pdfviewer>
      </div>
    </q-slide-transition> -->
  </div>
</template>

<script>
export default {
  name: 'TaskInfo',
  data () {
    return {
      showProblem: false,
      problemName: 'Название задачи',
      authorCommentary: 'Комментарий',
      problemDateStart: '20.01.2000',
      problemDateEnd: '20.01.2020',
      problemDiscipline: 'Область математики'
    }
  },
  props: {
    authorAvatarPath: {
      type: String,
      default: 'https://cdn.quasar.dev/img/boy-avatar.png'
    },
    authorFullName: {
      type: String,
      default: 'Некто'
    },
    authorGroup: {
      type: String,
      default: '0000'
    },
    problemPath: {
      type: String,
      default: 'pdfExample/OS1.pdf'
    },
    taskActive: { // Задача активна, то есть видна в общей таблице задач
      type: Boolean,
      default: true
    }
  },
  methods: {
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
