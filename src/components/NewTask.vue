<template>
<q-page
  class="column items-center justify-center"
>
  <div
    class="q-gutter-y-sm"
  >
    <div>
      <span>
      Название задачи:
      </span>
      <q-input
        v-model="taskName"
        outlined
        autogrow
        placeholder="Введите название задачи"
      />
    </div>
    <div>
      <span>
      Предмет:
      </span>
      <q-select
        v-model="selectedTaskDiscipline"
        outlined
        :options="taskDisciplines"
      />
    </div>
    <div>
      <span>
      Файл с условием
      </span>
      <q-uploader
        label="Выберите файл (pdf, TeX, LaTeX)"
        :filter="checkFileType"
        @rejected="onRejected"
        @failed="onUploaded"
        max-files="1"
        style="width: 100%"
      />
    </div>
    <div
      class="row q-gutter-x-sm"
    >
      <span>
        Диапазон дат:
      </span>
      <div
        v-if="dateRange.from !== '' && dateRange.to !== ''"
      >
        {{ dateRange.from }} - {{dateRange.to}}
      </div>
      <div
        v-else
      >
        не выбран
      </div>
    </div>
    <q-btn
      label="Выбор диапазона дат"
      @click="dateSelectDialogShow = true"
    />
    <div>
      <span>
      Комментарий
      </span>
      <q-input
        v-model="commentary"
        autogrow
        outlined
      />
    </div>
    <div
      class="row justify-center q-gutter-x-sm"
    >
      <q-btn
        label="Отмена"
        v-close-popup
      />
      <q-btn
        label="Готово"
        v-close-popup
      />
    </div>
  </div>
  <q-dialog
    v-model="dateSelectDialogShow"
    persistent
  >
    <div class="column q-gutter-y-sm content-background date-range-editor-dialog">
      <div class="column q-gutter-x-xs">
        <span>
          Диапазон приема решений
        </span>
        <q-date
          v-model="dateRange"
          mask="DD.MM.YYYY"
          range
        />
      </div>
      <q-btn
        label="OK"
        v-close-popup
      />
    </div>
  </q-dialog>
</q-page>
</template>

<script>
import { Constants } from 'boot/Constants'

export default {
  name: 'NewTask',
  data () {
    return {
      taskName: '',
      selectedTaskDiscipline: '',
      taskDisciplines: Constants.TASK_DISCIPLINES,
      dateRange: {
        to: '',
        from: ''
      },
      commentary: ''
    }
  },
  methods: {
    checkFileType (file) {
      return file.filter(file => (file.type === 'application/pdf' || file.type === 'application/x-latex' || file.type === 'application/x-tex'))
    },
    onRejected () {
      this.rejectedFileDialog = true
    },
    onUploaded () {
      // Что-то делаем (а может и нет)
    }
  }
}
</script>

<style scoped>

</style>
