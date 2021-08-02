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
          Some name
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="left"
      overlay
      :width="200"
      :breakpoint="400"
    >
      <div
        v-if="isAuthenticated"
      >
        <q-scroll-area
          style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
        >
          <q-list
            padding>
            <q-item
              clickable
              v-ripple
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

            <q-item
              active
              clickable
              v-ripple
            >
              <q-item-section
                avatar
              >
                <q-icon
                  name="bi-person-square"
                />
              </q-item-section>
              <q-item-section>
                Профиль
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
            >
              <q-item-section
                avatar
              >
                <q-icon
                  name="bi-book"
                />
              </q-item-section>
              <q-item-section>
                Задачи
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
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
        >
          <div
            class="absolute-bottom bg-transparent column items-center"
          >
            <q-avatar
              size="56px"
              class="q-mb-sm">
              <img
                src="https://cdn.quasar.dev/img/boy-avatar.png"
              >
            </q-avatar>
            <div
              class="text-weight-bold"
            >
              Иванов И. И.
            </div>
            <div>
              email@gmail.ru
            </div>
          </div>
        </q-img>
      </div>
      <q-item
        clickable
        v-ripple
        v-else
        to="/login"
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

    <q-footer>
      <q-toolbar>
        <q-toolbar-title>
          some title
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

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
      left: false
    }
  },
  computed: {
    isAuthenticated () {
      return !!window.localStorage.getItem(Constants.ACCESS_TOKEN)
    }
  }
}
</script>
