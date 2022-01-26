<template>
  <q-item
    :key="studentAttempt.id"
    class="q-mb-sm"
    clickable
    v-ripple
    active-class="active-attempt"
    @click="onClick"
    :active="studentAttempt.id.toString() === activeAttemptID"
  >
    <q-item-section
      avatar
    >
      <q-avatar
        icon="bi-file-text"
      >
        <q-badge
          v-if="attemptHasNewCommentary"
          rounded
          floating
          color="red"
        />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>
        {{ localeDate }}
      </q-item-label>
      <q-item-label
        class="row"
        caption
        lines="1"
      >
        <q-badge
          rounded
          color="primary"
          :label="studentAttempt.status"
        />
        <q-badge
          v-if="teacherFeedbackStatus !== '' && (isTeacher || teacherFeedbackStatus !== 'Черновик отзыва')"
          class="q-ml-sm"
          rounded
          color="primary"
          :label="teacherFeedbackStatus"
        />
      </q-item-label>
    </q-item-section>
    <q-item-section
      side
    >
      <div
        class="row q-gutter-x-sm"
      >
        <q-btn
          v-for="(button, index) in buttonInformation"
          :key="index"
          :icon="button.icon"
          color="black"
          flat
          dense
          round
          size="15px"
          @click.stop="onButtonClick(index)"
        >
          <q-tooltip
            v-if="button.tooltipMessage !== ''"
            :delay="800"
          >
            {{ button.tooltipMessage }}
          </q-tooltip>
        </q-btn>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'Attempt',
  props: {
    isTeacher: {
      type: Boolean,
      require: true
    },
    studentAttempt: {
      type: Object,
      require: true
    },
    attemptHasNewCommentary: {
      type: Boolean,
      require: true
    },
    teacherFeedbackStatus: {
      type: String,
      require: true
    },
    activeAttemptID: {
      type: String,
      require: true
    },
    buttonInformation: {
      type: Array,
      require: true
    }
  },
  methods: {
    onClick () {
      this.$emit('click', this.studentAttempt.id)
    },
    onButtonClick (index) {
      this.$emit(this.buttonInformation[index].eventName, this.studentAttempt.id)
    }
  },
  computed: {
    localeDate () {
      const x = new Date(this.studentAttempt.dateOfLastChange)
      const day = x.getDate() < 10 ? '' + 0 + x.getDate() : x.getDate()
      const month = (x.getMonth() + 1) < 10 ? '' + 0 + (x.getMonth() + 1) : (x.getMonth() + 1)
      const hour = x.getHours() < 10 ? '' + 0 + x.getHours() : x.getHours()
      const minute = x.getMinutes() < 10 ? '' + 0 + x.getMinutes() : x.getMinutes()
      return day + '.' + month + '.' + x.getFullYear() + ', ' + hour + ':' + minute
    }
  }
}
</script>

<style scoped>

</style>
