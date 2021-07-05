<template>
<q-page class="column items-center q-py-md">
  <div class="row no-wrap q-gutter-x-md">
    <div class="column q-gutter-y-md">
      <div class="row q-pa-sm" style="border: 1px solid black">
        <div class="text-h6" style="width:250px; display:flex; align-items: center; ">Автор решения</div>
        <q-item clickable v-ripple class="q-pa-none">
          <q-item-section side>
            <q-avatar square>
              <img :src="authorAvatarPath" alt="">
            </q-avatar>
          </q-item-section>
          <q-item-section>{{ authorFullName }} ({{authorGroup}})</q-item-section>
        </q-item>
      </div>
      <TaskEditor></TaskEditor>
      <div class="column">
        <div class="text-h6">Комментарий к решению</div>
        <q-input v-model="teacherCommentary" type="textarea" outlined square autogrow style="width: 850px"/>
      </div>
      <div class="row q-gutter-x-md justify-center">
        <q-btn label="Back" text-color="black" style="width:100px"/>
        <q-btn label="Submit" text-colot="black" style="width:100px"/>
      </div>
    </div>
    <div>
      <q-list bordered separator style="width:150px">
        <MainMenuButton v-for="link in menuInformation" :key="link.title" v-bind="link"/>
      </q-list>
    </div>
  </div>
</q-page>
</template>

<script>
import TaskEditor from 'components/TaskEditor'
import MainMenuButton from 'components/MainMenuButton'
export default {
  name: 'EditPage',
  components: { TaskEditor, MainMenuButton },
  data () {
    return {
      menuInformation: [{ title: 'My profile' },
        { title: 'My tasks' },
        { title: 'My questions' }],
      teacherCommentary: ''
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
