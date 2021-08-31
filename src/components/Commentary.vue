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
        {{ authorFullName }} - {{ cDate }}
      </q-item-label>
      <q-item-label>
        {{ commentaryText }}
      </q-item-label>
    </q-item-section>
    <q-item-section
      side
      v-if="userID === authorID"
    >
      <q-btn
        icon="delete"
        dense
        flat
        size="15px"
        @click="deleted"
      />
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'Commentary',
  props: {
    userStatus: {
      type: String
    },
    commentaryID: {
      type: Number
    },
    authorID: {
      type: Number
    },
    avatarPath: {
      type: String
    },
    authorFullName: {
      type: String
    },
    commentaryDate: {
      type: String
    },
    commentaryText: {
      type: String
    }
  },
  methods: {
    deleted () {
      this.$emit('deleted', this.commentaryID)
    }
  },
  computed: {
    cDate () {
      return new Date(this.commentaryDate).toLocaleDateString()
    },
    userID () {
      return this.$store.getters['userDataStore/userInformationGetter'].id
    }
  }
}
</script>

<style scoped>

</style>
