<template>
  <q-item>
    <q-item-section
      avatar
    >
      <q-avatar>
        <img
          :src="avatarPath"
          alt="123"
        />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>
        {{ studentFullName }}
      </q-item-label>
    </q-item-section>
    <q-item-section
      side
    >
      <q-btn
        icon="bi-arrow-right"
        dense
        flat
        size="15px"
        @click="selected"
      >
        <q-badge
          color="red"
          rounded
          floating
          v-show="newInformation"
        />
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'StudentForTask',
  props: {
    studentID: {
      type: Number,
      default: 1
    },
    avatarPath: {
      type: String,
      default: 'https://cdn.quasar.dev/img/avatar2.jpg'
    },
    studentFullName: {
      type: String,
      default: 'Некто Нектович'
    },
    newInformation: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    selected () {
      // Передача ID студента через событие
    }
  }
}
</script>

<style scoped>

</style>
