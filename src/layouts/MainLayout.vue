<template>
  <q-layout
    view="hHh lpR fff"
  >
    <q-header
      bordered
      class="text-white bg-primary"
    >
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="left = !left"
        />
        <q-toolbar-title>
          <q-avatar
            square
            size="50px"
          >
            <img
              src="~assets/header-logo.svg"
            >
          </q-avatar>
          Проект "Задачи"
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="left"
      overlay
      :width="250"
      :breakpoint="400"
    >
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
        v-if="!!userInformation"
      >
        <q-list
          padding
        >
          <q-item
            to="/"
            active-class="bg-primary text-white"
            exact
            clickable
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-house"
              />
            </q-item-section>
            <q-item-section>
              Главная
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item
            to="/new-task"
            active-class="bg-primary text-white"
            clickable
            v-if="isTeacher"
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-file-earmark-arrow-up"
              />
            </q-item-section>
            <q-item-section>
              Предложить задачу
            </q-item-section>
          </q-item>
          <q-item
            to="/my/tasks"
            active-class="bg-primary text-white"
            clickable
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-book"
              />
            </q-item-section>
            <q-item-section>
              Мои задачи
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item
            to="/admin"
            active-class="bg-primary text-white"
            exact
            clickable
            v-if="isAdmin"
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-shield"
              />
            </q-item-section>
            <q-item-section>
              Контроль
            </q-item-section>
          </q-item>
          <q-item
            to="/task-opening"
            active-class="bg-primary text-white"
            clickable
            v-if="isAdmin"
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-hand-thumbs-up"
              />
            </q-item-section>
            <q-item-section>
              Допуск задач
            </q-item-section>
          </q-item>
          <q-item
            to="/admin/help/view"
            active-class="bg-primary text-white"
            exact
            clickable
            v-if="isAdmin"
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-info-circle"
              />
            </q-item-section>
            <q-item-section>
              Справка
            </q-item-section>
            <q-item-section
              side
            >
              <q-btn
                to="/admin/help/editing"
                :unelevated="currentPath === '/admin/help/editing'"
                :flat="currentPath !== '/admin/help/editing'"
                round
                size="sm"
                :color="currentPath === '/admin/help/editing' ? 'primary' : (currentPath === '/admin/help/view' ? 'white' : 'black')"
                icon="bi-gear"
              />
            </q-item-section>
          </q-item>
          <q-separator/>
          <q-item
            to="/help/view"
            active-class="bg-primary text-white"
            exact
            clickable
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-info-circle"
              />
            </q-item-section>
            <q-item-section>
              Помощь
            </q-item-section>
            <q-item-section
              side
              v-if="isAdmin"
            >
              <q-btn
                to="/help/editing"
                :unelevated="currentPath === '/help/editing'"
                :flat="currentPath !== '/help/editing'"
                round
                size="sm"
                :color="currentPath === '/help/editing' ? 'primary' : (currentPath === '/help/view' ? 'white' : 'black')"
                icon="bi-gear"
              />
            </q-item-section>
          </q-item>
          <q-item
            clickable
            @click="onLogout"
          >
            <q-item-section
              avatar
            >
              <q-icon
                name="bi-box-arrow-left"
              />
            </q-item-section>
            <q-item-section>
              Выход
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px"
        v-if="!!userInformation"
      >
        <div
          class="bg-transparent column items-center justify-center no-wrap"
          style="width: 100%; height: 100%; padding: 8px 8px 8px 8px"
        >
          <q-avatar
            size="62px"
            class="q-mb-sm">
            <img
              :src="userInformation.avatarURL"
            >
          </q-avatar>
          <div
            class="text-weight-bold"
          >
            {{ userName }}
          </div>
          <q-btn
            icon="bi-envelope"
            round
            flat
          >
            <q-popup-proxy>
              <q-banner
                class="bg-white text-black"
              >
                <template
                  v-slot:avatar
                >
                  <q-icon
                    name="bi-envelope"
                  />
                </template>
                {{ userInformation.email }}
              </q-banner>
            </q-popup-proxy>
          </q-btn>
          <!-- <div>
            {{ userInformation.email }}
          </div> -->
        </div>
      </q-img>
      <q-item
        clickable
        v-ripple
        to="/login"
        v-else
      >
        <q-item-section
          avatar
        >
          <q-icon
            name="bi-box-arrow-right"
          />
        </q-item-section>
        <q-item-section>
          Войти
        </q-item-section>
      </q-item>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { Constants } from 'boot/Constants'

export default {
  data () {
    return {
      left: false,
      isAuthenticated: false
    }
  },
  async created () {
    // Восстановление данных после перезагрузки страницы
    // Если пришла ошибка, сервер удалит cookie
    // Фронт удалит CSRF токен. По итогу произойдет операция logout
    if (window.localStorage.getItem('csrfToken') && !Constants.DEV_MODE) {
      try {
        const response = await fetch(Constants.SERVER_URL + '/api/restore-data', Constants.GET_INIT)
        const data = await response.json()
        if (data.message === 'success') {
          await this.$store.dispatch('userDataStore/setUserInformation', data.userData)
        } else {
          localStorage.removeItem('csrfToken')
          await this.$router.push('/login')
        }
      } catch {
        await this.$router.push('/connection-error')
      }
    }
  },
  methods: {
    async onLogout () {
      await fetch(Constants.SERVER_URL + '/api/logout', Constants.GET_INIT)
      window.localStorage.removeItem('csrfToken')
      await this.$store.dispatch('userDataStore/dropUserInformation')
      await this.$router.push('/login')
    }
  },
  computed: {
    currentPath () {
      return this.$route.path
    },
    userInformation () {
      return this.$store.getters['userDataStore/userInformationGetter']
    },
    isTeacher () {
      return this.userInformation.roles.includes('Учитель')
    },
    userName () {
      return this.userInformation.middleName
        ? this.userInformation.lastName + ' ' + this.userInformation.firstName[0] + '. ' + this.userInformation.middleName[0] + '.'
        : this.userInformation.lastName + ' ' + this.userInformation.firstName[0] + '.'
    },
    isAdmin () {
      return this.userInformation.roles.includes('Администратор') ||
        this.userInformation.roles.includes('Помощник администратора')
    }
  }
}
</script>
