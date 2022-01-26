<template>
<q-page
  class="column items-center q-py-xs"
>
  <LoadingSpinner
    :loading="pageLoading"
  />
  <q-banner
    inline-actions
    class="content-shadow q-my-xs"
    v-if="!pageLoading && attemptAlreadyChecked"
  >
    Эта попытка уже была проверена.
    <template v-slot:action>
      <q-btn
        no-caps
        color="white"
        text-color="black"
        label="На главную"
        @click="onMainPage"
      />
    </template>
  </q-banner>
  <div
    class="column q-gutter-y-sm items-center"
    v-if="!pageLoading && !attemptAlreadyChecked"
  >
    <div
      class="row q-pa-sm content-shadow content-background"
      style="max-width: 796px; width: 100%"
    >
      <div
        class="text-h6"
        style="width:250px; display:flex; align-items: center;"
      >
        Автор решения
      </div>
      <q-item
        class="q-pa-none"
      >
        <q-item-section
          side
        >
          <q-avatar>
            <img
              :src="informationAboutAuthor.authorAvatarPath"
              alt=""
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          {{ informationAboutAuthor.authorFullName }} ({{informationAboutAuthor.authorGroup === '-1' ? '-' : informationAboutAuthor.authorGroup}})
        </q-item-section>
      </q-item>
    </div>
    <div
      class="row no-wrap"
      style="align-items: flex-start"
    >
      <q-pdfviewer
        v-model="showProblemFlag"
        :src="problemPath"
        class="q-mr-xs"
        style="position: sticky; top: 0"
        content-style="width:600px; height:796px;"
      />
      <TaskEditor
        class="content-background content-shadow"
        :return-images-flag="returnImagesFlag"
        :image-paths="imagePaths"
        :problem-path="problemPath"
        :condition-show-flag="showProblemFlag"
        @returndata="onReturn"
        @showProblem="showProblemFlag = true"
        @hideProblem="showProblemFlag = false"
        @loadingOn="submitting = true"
      />
    </div>
    <div
      class="content-background content-shadow column items-center q-px-sm q-pb-sm q-gutter-y-sm"
      style="max-width: 796px; width: 100%"
    >
      <div
        class="text-h6"
        style="display:flex; align-items:center;"
      >
        Степень решения задачи
      </div>
      <div
        class="row justify-center"
      >
        <q-option-group
          v-model="decisionStage"
          :options="solutionDegrees"
          inline
          color="primary"
        />
      </div>
      <q-input
        v-model="teacherCommentary"
        type="textarea"
        outlined
        label="Комментарий к решению"
        :maxlength="commentaryToSolutionLength"
        square
        borderless
        autogrow
        style="max-width: 850px; width: 100%"
      />
    </div>
    <div
      class="row q-gutter-x-md justify-center"
    >
      <q-btn
        label="Назад"
        text-color="black"
        style="width:100px"
        class="content-background"
        @click="onBack"
        no-caps
      />
      <q-btn
        label="Подтвердить"
        text-colot="black"
        style="width:100px"
        class="content-background"
        :loading="submitting"
        :disable="decisionStage === ''"
        @click="onSavingAsResult"
        no-caps
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
        label="Сохранить как черновик"
        text-colot="black"
        style="width:200px"
        class="content-background"
        :loading="submitting"
        @click="onSavingAsDraftWork"
        no-caps
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
  <ErrorDialog
    :p-error-message="errorMessage"
    :p-error-dialog-show="errorDialogShow"
    @off="errorDialogShow = false"
  />
</q-page>
</template>

<script>
import { Constants, exceptionHandlerDecorator } from 'boot/Constants'
import TaskEditor from 'components/TaskEditor'
import ErrorDialog from 'components/ErrorDialog'
import LoadingSpinner from 'components/LoadingSpinner'
export default {
  name: 'EditPage',
  components: { LoadingSpinner, ErrorDialog, TaskEditor },
  data () {
    return {
      errorDialogShow: false,
      showProblemFlag: true,
      submitting: false,
      saveLeavingPage: true,
      attemptAlreadyChecked: false,
      pageLoading: true,
      commentaryToSolutionLength: Constants.LENGTHS.commentaryToTeacherFeedback,
      errorMessage: '',
      teacherCommentary: '',
      decisionStage: '',
      informationAboutAuthor: null,
      problemPath: null,
      imagePaths: null,
      returnImagesFlag: false,
      solutionDegrees: Constants.SOLUTION_DEGREES,
      savingStatus: ''
    }
  },
  methods: {
    onSavingAsDraftWork () {
      this.savingStatus = 'Черновик отзыва'
      this.returnImagesFlag = true
    },
    onSavingAsResult () {
      this.savingStatus = 'Отзыв не просмотрен учеником'
      this.returnImagesFlag = true
    },
    async onReturn (resultImages) {
      this.submitting = true
      this.returnImagesFlag = false
      const attemptID = this.$route.params.attempt_id
      const requestData = {
        pages: resultImages,
        teacherCommentary: this.teacherCommentary || '',
        solutionDegree: this.decisionStage || '',
        csrfToken: window.localStorage.getItem('csrfToken'),
        status: this.savingStatus
      }
      const response = await fetch(Constants.SERVER_URL + '/api/check-attempt/' + attemptID, {
        method: 'POST',
        headers: Constants.HEADERS,
        credentials: 'same-origin',
        body: JSON.stringify(requestData)
      })
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      window.localStorage.setItem('csrfToken', responseData.csrfToken)
      this.saveLeavingPage = true
      await this.$router.push(`/task/${this.$route.params.task_id}`)
    },
    async initPage () {
      this.pageLoading = true
      const attemptID = this.$route.params.attempt_id
      const response = await fetch(Constants.SERVER_URL + '/api/check-attempt/' + attemptID, Constants.GET_INIT)
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.informationAboutAuthor = responseData.authorInf
      this.problemPath = responseData.problemPath
      this.imagePaths = responseData.imagePaths
      this.teacherCommentary = responseData.authorCommentary
      this.decisionStage = responseData.solutionDegree
      this.saveLeavingPage = false
      this.pageLoading = false
    },
    async onBack () {
      await this.$router.push(`/task/${this.$route.params.task_id}`)
    },
    async onMainPage () {
      await this.$router.push('/')
    }
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(this, [this.initPage, true, {
        'attempt already checked': () => {
          this.pageLoading = false
          this.attemptAlreadyChecked = true
        }
      }])()
    }
  },
  beforeRouteLeave (to, from, next) {
    if (!this.saveLeavingPage) {
      const answer = window.confirm('Вы уверены, что хотите покинуть эту страницу?')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
  async created () {
    this.onReturn = exceptionHandlerDecorator.call(this, [this.onReturn], 'submitting')
    while (this.$store.getters['userDataStore/userInformationGetter'] === null) {
      await new Promise((resolve, reject) => setTimeout(resolve, 200))
    }
    await exceptionHandlerDecorator.call(this, [this.initPage, true, {
      'attempt already checked': () => {
        this.pageLoading = false
        this.attemptAlreadyChecked = true
      }
    }])()
  }
}
</script>

<style scoped>

</style>
