<template>
<q-page
  class="column items-center"
>
  <q-banner
    v-if="!problemExists"
    inline-actions
    class="content-background content-shadow q-px-xs q-mt-sm"
  >
    На данный момент задач на проверку нет
    <template
      v-slot:action
    >
      <q-btn
        label="На главную"
        flat
        to="/"
      />
    </template>
  </q-banner>
  <div
    v-else
    class="row no-wrap q-pa-xs"
    style="height: calc(100vh - 100px); max-height: 800px"
  >
    <div
      class="column no-wrap q-gutter-y-sm q-mr-sm"
    >
      <div
        class="content-shadow content-background column"
        style="width: 500px; padding: 0 5px 5px 5px"
      >
        <div
          class="text-h6 text-center"
        >
          Задача на рассмотрение
        </div>
        <table
          class="info-table"
        >
          <tr>
            <td>
              Автор задачи
            </td>
            <td>
              {{ authorFullName }}
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
              Название задачи
            </td>
            <td>
              {{ problemTitle }}
            </td>
          </tr>
          <tr>
            <td>
              Дисциплина
            </td>
            <td>
              {{ problemDiscipline }}
            </td>
          </tr>
          <tr>
            <td>
              Интервал приема решений
            </td>
            <td>
              <!-- Проверить даты на совпадение форматов UTC и местного!! -->
              {{ startDate }} - {{ endDate }}
            </td>
          </tr>
          <tr>
            <td>
              Комментарий автора
            </td>
            <td>
              {{ authorCommentary }}
            </td>
          </tr>
          <tr>
            <td class="the-problem">
              Условия задачи
            </td>
            <td>
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
            </td>
          </tr>
        </table>
      </div>
      <div
        class="column content-background content-shadow q-gutter-y-xs"
        style="padding: 0 5px 5px 5px"
      >
        <div
          class="text-h6 text-center"
        >
          Решение по задаче
        </div>
        <div
          class="row q-gutter-x-sm"
          style="justify-content: space-around"
        >
          <q-radio
            v-model="adminDecision"
            val="accepted"
            label="Принять"
          />
          <q-radio
            v-model="adminDecision"
            val="rejected"
            label="Отклонить"
          />
        </div>
        <q-select
          v-if="adminDecision !== null && adminDecision === 'accepted'"
          ref="difficultySelect"
          v-model="chosenDifficulty"
          :options="difficultyLevels"
          :rules="[value=>value.length > 0 || 'Пожалуйста, выберите дисциплину']"
          label="Сложность задачи"
          outlined
        />
        <q-input
          v-if="adminDecision !== null && adminDecision === 'rejected'"
          v-model="rejectedCommentary"
          outlined
          type="textarea"
          label="Комментарий о задаче"
        />
        <q-btn
          v-if="adminDecision !== null"
          outlined
          label="Подтвердить"
          color="primary"
          no-caps
          @click="onConfirm"
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
    <q-pdfviewer
      v-model="problem"
      :src="problemFileURL"
      style="width: 800px; height: 100%"
    />
  </div>
  <q-dialog
    v-model="showProblem"
  >
    <q-pdfviewer
      v-model="showProblem"
      :src="problemFileURL"
    >
    </q-pdfviewer>
  </q-dialog>
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
          Вы уверены? Это действие отменить нельзя. <br> После подтверждения загрузится следующая задача на проверку.
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
</q-page>
</template>

<script>
import { Constants } from 'boot/Constants'
export default {
  name: 'OpeningTaskPage',
  data () {
    return {
      problemExists: true,
      showProblem: false,
      confirmDialogShow: false,
      problem: true,
      adminDecision: null,
      difficultyLevels: Constants.DIFFICULTY_LEVELS,
      chosenDifficulty: '',
      rejectedCommentary: '',
      authorFullName: 'Родионов Георгий Витальевич',
      authorGroup: '8305',
      problemFileURL: 'pdfExample/OS1.pdf',
      startDate: '',
      endDate: '',
      authorCommentary: ' 1111 1111 1111111111 11111111 111111111 1111 11 11111111 111 111111 1111 111 11111',
      problemDiscipline: '',
      problemTitle: ''
    }
  },
  methods: {
    onConfirm () {
      if (this.$refs.difficultySelect.validate()) {
        this.confirmDialogShow = true
      }
    }
  }
}
</script>
