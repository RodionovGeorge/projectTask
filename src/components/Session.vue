<template>
  <q-item
    :key="sessionID"
    class="q-mb-sm"
    clickable
    v-ripple
    @click="onClick"
  >
    <q-item-section
      avatar
    >
      <q-avatar>
        <img
          :src="studentAvatarPath"
        >
        <q-badge
          v-if="sessionHasNewCommentariesForTeacher"
          rounded
          floating
          color="red"
        />
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label>
        {{ studentFullName }}
      </q-item-label>
      <q-item-label
        caption
        lines="1"
      >
        {{ studentGroup === '-1' ? '-' : studentGroup }}
      </q-item-label>
    </q-item-section>

    <q-item-section
      side
      style="color: black"
    >
      Непроверенных попыток: {{ unverifiedAttemptCount }}
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'Student',
  props: {
    sessionID: {
      type: String,
      require: true
    },
    studentAvatarPath: {
      type: String,
      require: true
    },
    studentFullName: {
      type: String,
      require: true
    },
    studentGroup: {
      type: String,
      require: true
    },
    unverifiedAttemptCount: {
      type: String,
      require: true
    },
    sessionHasNewCommentariesForTeacher: {
      type: Boolean,
      require: true
    }
  },
  methods: {
    onClick () {
      this.$emit('click', this.sessionID)
    }
  }
}
</script>

<style scoped>

</style>
