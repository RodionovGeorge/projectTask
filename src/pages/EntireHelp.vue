<template>
<q-page
  class="bg-white text-black q-py-xs q-pl-sm items-center justify-center"
  style="font-size: 1rem;"
>
  <loading-spinner
    :loading="pageLoading"
  />
  <div
    v-if="!pageLoading && mode === 'view'"
    v-html="text"
  />
  <div
    v-if="!pageLoading && mode === 'editing'"
    class="column items-center"
  >
    <div
      class="text-h6"
    >
      Редактирование раздела "Помощь"
    </div>
    <q-input
      v-model="text"
      outlined
      square
      color="primary"
      style="width: 80%"
      input-style="height: 700px; resize:none; font-size: 1rem;"
      class="q-my-xs"
      type="textarea"
    />
    <q-btn
      label="Изменить"
      no-caps
      :loading="loadingFlag"
      style="width: 100px"
      @click="onEdit"
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
  <error-dialog
    :p-error-message="errorMessage"
    :p-error-dialog-show="errorDialogShow"
    @off="errorDialogShow = false"
  />
</q-page>
</template>

<script>
import { Constants, exceptionHandlerDecorator } from 'boot/Constants'
import LoadingSpinner from 'components/LoadingSpinner'
import ErrorDialog from 'components/ErrorDialog'

export default {
  name: 'EntireHelp',
  components: { ErrorDialog, LoadingSpinner },
  data () {
    return {
      errorDialogShow: false,
      errorMessage: '',
      loadingFlag: false,
      pageLoading: false,
      text: '',
      mode: ''
    }
  },
  methods: {
    async init () {
      this.pageLoading = true
      this.mode = this.$route.params.mode
      const getParameters = new URLSearchParams()
      getParameters.append('label', 'userHelp')
      const response = await fetch(Constants.SERVER_URL + '/api/admin/information?' + getParameters.toString(), Constants.GET_INIT)
      const responseData = await response.json()
      if (responseData.message !== 'success') {
        throw new Error(responseData.message)
      }
      this.text = responseData.information
      this.pageLoading = false
    },
    async onEdit () {
      this.loadingFlag = true
      const requestData = {
        csrfToken: window.localStorage.getItem('csrfToken'),
        label: 'userHelp',
        text: this.text
      }
      const response = await fetch(Constants.SERVER_URL + '/api/admin/information', {
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
      this.loadingFlag = false
      await this.$router.push('/help/view')
    }
  },
  async created () {
    this.onEdit = exceptionHandlerDecorator.call(this, [this.onEdit], 'loadingFlag')
    await exceptionHandlerDecorator.call(this, [this.init, true])()
  },
  watch: {
    $route: function () {
      exceptionHandlerDecorator.call(
        this,
        [
          this.init,
          true
        ]
      )()
    }
  }
}
</script>

<style scoped>

</style>
