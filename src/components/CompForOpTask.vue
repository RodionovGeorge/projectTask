<template>
  <div class="column no-wrap" style="border: 1px solid black; width: 850px; padding: 10px; margin:10px 0 10px 10px">
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
      <div style="display:flex; align-items: center">{{problemDiscipline}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Дата заявки</div>
      <div style="display:flex; align-items: center;">{{localeDateRequest}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Дата начала</div>
      <div style="display:flex; align-items: center;">{{localeDateStart}}</div>
    </div>
    <div class="row">
      <div class="text-h6" style="width:250px; display:flex; align-items: center;">Дата окончания</div>
      <div style="display:flex; align-items: center;">{{localeDateEnd}}</div>
    </div>
    <div class="row">
      <div class="text-h6 vertical-top" style="width:250px; display:flex; align-items: center;">Комментарий к задаче</div>
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
    <q-form class="column items-center" @submit="onSubmit" style="border-top: 1px solid black">
      <div class="row q-gutter-x-md">
        <q-radio :disable="submitted" color="black" name="choose" v-model="isAccepted" val="declined" label="Отклонить"/>
        <q-radio :disable="submitted" color="black" name="choose" v-model="isAccepted" val="accepted" label="Принять"/>
      </div>
      <div>
        <q-input :disable="submitted" color="black" square outlined v-model="commentaryAboutDeclined" label="Комментарий преподавателя"
                 v-bind:class="[isAccepted==='declined'?'':'hidden', 'q-pt-sm']" style="width:380px"></q-input>
      </div>
      <div v-bind:class="[isAccepted==='accepted'?'':'hidden']">
        <div>
          <div class="text-h6 text-center">Сложность задачи</div>
          <div class="row q-gutter-x-md">
            <q-radio :disable="submitted" color="black" name="difficult" v-model="problemDifficult" val="1" label="Простая"/>
            <q-radio :disable="submitted" color="black" name="difficult" v-model="problemDifficult" val="2" label="Средняя"/>
            <q-radio :disable="submitted" color="black" name="difficult" v-model="problemDifficult" val="3" label="Трудная"/>
          </div>
        </div>
      </div>
      <div class="q-pt-sm row q-gutter-x-md">
        <q-btn :disable="submitted" label="Submit" color="blue" type="submit" style="width:100px"
               v-bind:class="[(isAccepted==='noChoose') || (isAccepted==='accepted') && (problemDifficult === '')?'hidden':'']"></q-btn>
        <q-btn label="Edit" color="blue" @click="onEdit" style="width:100px" v-bind:class="[(isAccepted==='noChoose') || (isAccepted==='accepted') && (problemDifficult === '')?'hidden':'']"></q-btn>
      </div>
    </q-form>
  </div>
</template>

<script>
export default {
  name: 'CompForOpTask',
  data () {
    return {
      problemVisible: false,
      submitted: false,
      isAccepted: 'noChoose',
      commentaryAboutDeclined: '',
      problemDifficult: ''
    }
  },
  props: {
    authorAvatarPath: {
      type: String,
      default: 'https://cdn.quasar.dev/img/boy-avatar.png'
    },
    authorFullName: {
      type: String,
      default: 'Некто Ктотович'
    },
    authorGroup: {
      type: String,
      default: '0000'
    },
    authorCommentary: {
      type: String,
      default: 'Какой-то комментарий'
    },
    problemName: {
      type: String,
      default: 'Название задачи'
    },
    problemPath: {
      type: String,
      default: 'pdfExample/OS1.pdf'
    },
    problemDiscipline: {
      type: String,
      default: 'Какой-то предмет'
    },
    problemDateStart: {
      type: Date,
      default: function () {
        return new Date(2000, 1, 1)
      }
    },
    problemDateEnd: {
      type: Date,
      default: function () {
        return new Date(2020, 1, 1)
      }
    },
    problemDateRequest: {
      type: Date,
      default: function () {
        return new Date(2000, 1, 1)
      }
    }
  },
  computed: {
    localeDateStart () {
      return this.problemDateStart.toLocaleDateString() + ' ' + this.problemDateStart.toLocaleTimeString()
    },
    localeDateEnd () {
      return this.problemDateEnd.toLocaleDateString() + ' ' + this.problemDateEnd.toLocaleTimeString()
    },
    localeDateRequest () {
      return this.problemDateRequest.toLocaleDateString() + ' ' + this.problemDateRequest.toLocaleTimeString()
    }
  },
  methods: {
    onSubmit () {
      this.submitted = true
    },
    onEdit () {
      this.submitted = false
    }
  }
}
</script>
