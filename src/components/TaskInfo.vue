<template>
  <div class="column no-wrap" style="border: 1px solid black; width: 850px; padding: 10px;">
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Название задачи</div>
      <div style="width:578px; display:flex; align-items: center; overflow-wrap: normal">{{problemName}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center; ">Автор</div>
      <q-item clickable v-ripple class="q-pa-none">
        <q-item-section side>
          <q-avatar square>
            <img :src="authorAvatarPath" alt="">
          </q-avatar>
        </q-item-section>
        <q-item-section>{{ authorFullName }} ({{authorGroup}})</q-item-section>
      </q-item>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Предмет</div>
      <div style="display:flex; align-items: center;">{{problemDiscipline}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Дата начала</div>
      <div style="display:flex; align-items: center;">{{problemDateStart}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Дата окончания</div>
      <div style="display:flex; align-items: center;">{{problemDateEnd}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; height: 32px; display:flex; align-items: center;">Комментарий к задаче</div>
      <div style="display:flex; align-items: center; width: 578px">{{authorCommentary}}</div>
    </div>
    <div class="row q-gutter-x-md">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Показать условие задачи</div>
      <q-toggle v-model="problemVisible"></q-toggle>
    </div>
    <q-slide-transition>
      <div v-show="problemVisible">
        <q-pdfviewer v-model="problemVisible" :src="problemPath" style="height: 900px; border: 1px solid black"></q-pdfviewer>
      </div>
    </q-slide-transition>
  </div>
</template>

<script>
export default {
  name: 'TaskInfo',
  data () {
    return {
      problemVisible: false,
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
    }
  },
  computed: {
    isAdmin: {
      get () {
        return this.$store.state.userDataStore.authUserData.isAdmin
      }
    }
  }
}
</script>
