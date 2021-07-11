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
    />
    <div class="content-background content-shadow column items-center">
      <div
        class="text-h6"
        style="display:flex; align-items:center;"
      >
        Степень решения задачи
      </div>
      <!-- <q-select
        v-model="decisionStage"
        :options="decisionStageOption"
        outlined
        square
        color="black"
        style="width:200px"
      /> -->
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
      <div
        class="text-h6"
      >
        Комментарий к решению
      </div>
      <q-input
        v-model="teacherCommentary"
        type="textarea"
        outlined
        square
        borderless
        autogrow
        style="width: 850px; padding-bottom: 5px"
        color="black"
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
      decisionStage: 0
      // decisionStageOption: ['Пока не решена', 'Есть идея', 'Почти решена', 'Полностью решена']
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
    }
  }
}
</script>

<style scoped>

</style>
