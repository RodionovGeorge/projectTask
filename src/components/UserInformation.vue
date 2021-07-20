<template>
  <div
    class="column items-center content-background content-shadow q-gutter-y-xs q-pa-xs"
  >
    <q-img
      ratio="1"
      :src="userAvatarPath"
      class="profile-image"
    />
    <span
      class="text-h6"
    >
      {{ userFullName }}
    </span>
    <span>
      {{ userEmail }}
    </span>
    <div
      class="row q-gutter-x-sm"
    >
      <!-- Возможно стоит задуматься над массивом ролей -->
      <!-- И отображать их с помощью v-for -->
      <q-badge
        rounded
        color="black"
        text-color="white"
        label="Ученик"
      />
      <q-badge
        rounded
        color="black"
        text-color="white"
        label="Учитель"
      />
      <q-badge
        rounded
        color="black"
        text-color="white"
        label="Администратор"
      />
    </div>
    <div
      class="column q-gutter-y-xs items-center"
      style="width: 100%"
    >
      <span>
        Комментарий
      </span>
      <!-- Добавить отключение записи, если профиль не пользователя -->
      <q-input
        v-model="userCommentary"
        type="textarea"
        outlined
        color="black"
        class="user-profile-commentary"
      />
      <!-- Прятать, если профиль не пользователя -->
      <q-btn
        label="Сохранить"
        class="user-profile-commentary-save-button"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInformation',
  data () {
    return {
      userCommentary: this.userCommentaryProp
    }
  },
  props: {
    userAvatarPath: {
      Type: String,
      default: ''
    },
    userFullName: {
      Type: String,
      default: 'Некто'
    },
    userEmail: {
      Type: String,
      default: 'nothing@gmail.com'
    },
    userCommentaryProp: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>

</style>
