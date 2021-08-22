<template>
<q-page
  class="column items-center q-py-md"
>
  <div
    class="column q-gutter-y-sm"
  >
    <div
      class="row q-pa-sm content-shadow content-background"
    >
      <div
        class="text-h6"
        style="width:250px; display:flex; align-items: center;"
      >
        Автор решения
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
    <TaskEditor
      class="content-background content-shadow"
      :return-images-flag="returnImagesFlag"
      @returndata="onReturn"
    />
    <div
      class="content-background content-shadow column items-center q-px-sm q-pb-sm q-gutter-y-sm"
    >
      <div
        class="text-h6"
        style="display:flex; align-items:center;"
      >
        Степень решения задачи
      </div>
      <div class="row justify-center">
        <q-radio
          v-model="decisionStage"
          label="Пока не решена"
          val="0"
        />
        <q-radio
          v-model="decisionStage"
          label="Есть идея"
          val="1"
        />
        <q-radio
          v-model="decisionStage"
          label="Почти решена"
          val="2"
        />
        <q-radio
          v-model="decisionStage"
          label="Полность решена"
          val="3"
        />
      </div>
      <q-input
        v-model="teacherCommentary"
        type="textarea"
        outlined
        label="Комментарий к решению"
        square
        borderless
        autogrow
        style="width: 850px;"
      />
    </div>
    <div
      class="row q-gutter-x-md justify-center"
    >
      <q-btn
        label="Back"
        text-color="black"
        style="width:100px"
        class="content-background"
      />
      <q-btn
        label="Submit"
        text-colot="black"
        style="width:100px"
        class="content-background"
        @click="returnImagesFlag = true"
      />
    </div>
  </div>
</q-page>
</template>

<script>
import TaskEditor from 'components/TaskEditor'
export default {
  name: 'EditPage',
  components: { TaskEditor },
  data () {
    return {
      teacherCommentary: '',
      decisionStage: 0,
      authorAvatarPath: 'https://cdn.quasar.dev/img/boy-avatar.png',
      authorFullName: 'Некто',
      authorGroup: 'Нектович',
      problemPath: 'pdfExample/OS1.pdf',
      returnImagesFlag: false

      // decisionStageOption: ['Пока не решена', 'Есть идея', 'Почти решена', 'Полностью решена']
    }
  },
  methods: {
    onReturn (resultImages) {
      console.log(resultImages[1])
    }
  }
}
</script>

<style scoped>

</style>
