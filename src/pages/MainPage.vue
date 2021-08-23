<template>
  <q-page
    class="column items-center"
  >
    <div
      class="column content-background content-shadow q-pa-xs"
    >
      <div
        class="row"
        style="width: 100%"
      >
        <q-input
          v-model="filter"
          placeholder="Search"
          square
          outlined
          style="width:80%"
        >
          <template
            v-slot:append
          >
            <q-icon
              name="search"
            />
          </template>
        </q-input>
        <q-select
          square
          outlined
          :options="namesOfSearchColumns"
          options-dense
          style="width:20%"
          v-model="currentColumnForSearch"
        />
      </div>
      <q-table
        class="q-mt-sm"
        wrap-cells
        style="width:1100px; border-radius: 0"
        flat
        bordered
        no-results-label="Здесь пока ничего нет"
        :data="data"
        :columns="columns"
        row-key="problemID"
        :visible-columns="visibleColumns"
        :filter="filter"
        :filter-method="filterByCurrentColumn"
        no-data-label="hello"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'pageMain',
  data () {
    return {
      filter: '',
      currentColumnForSearch: 'Название',
      visibleColumns: ['problemName', 'authorFullName', 'authorGroup', 'discipline', 'problemComplexity', 'problemDeadline'],
      namesOfSearchColumns: ['Название', 'Предмет', 'Сложность', 'Автор', 'Группа автора'],
      columns: [
        {
          name: 'problemID',
          field: 'id'
        },
        {
          name: 'problemName',
          required: true,
          label: 'Название',
          align: 'center',
          field: 'problemName',
          sortable: true,
          style: 'width:300px'
        },
        {
          name: 'authorFullName',
          required: true,
          label: 'Автор',
          align: 'center',
          field: 'authorFullName',
          sortable: true,
          style: 'width:300px'
        },
        {
          name: 'authorGroup',
          required: true,
          label: 'Группа автора',
          align: 'center',
          field: 'authorGroup',
          sortable: true,
          style: 'width:300px'
        },
        {
          name: 'discipline',
          label: 'Предмет',
          field: 'discipline',
          align: 'center',
          sortable: true,
          style: 'width:200px'
        },
        {
          name: 'problemComplexity',
          label: 'Сложность',
          field: 'problemComplexity',
          align: 'center',
          sortable: true,
          style: 'width:200px'
        },
        {
          name: 'problemDeadline',
          label: 'Дата закрытия задачи',
          field: 'problemDeadline',
          align: 'center',
          sortable: true,
          style: 'width:150px'
        }
      ],
      data: [
        {
          id: 1,
          problemName: 'Оченб длинное название задачи, прямо очень длинное',
          discipline: 'Теория чисел',
          authorFullName: 'Родионов Г. В.',
          authorGroup: 'Не указана',
          problemComplexity: 'Сложная',
          problemDeadline: '24.04.2200'
        },
        {
          id: 2,
          problemName: 'Название задачи',
          discipline: 'Математический анализ',
          authorFullName: 'Родионов Г. В.',
          authorGroup: 'Не указана',
          problemComplexity: 'Простая',
          problemDeadline: '24.04.2200'
        }
      ]
    }
  },
  methods: {
    filterByCurrentColumn (rows, terms) {
      let curCol = ''
      // Перевод label->name
      switch (this.currentColumnForSearch) {
        case 'Название':
          curCol = this.visibleColumns[0]
          break
        case 'Предмет':
          curCol = this.visibleColumns[3]
          break
        case 'Сложность':
          curCol = this.visibleColumns[4]
          break
        case 'Автор':
          curCol = this.visibleColumns[1]
          break
        case 'Группа автора':
          curCol = this.visibleColumns[2]
          break
      }
      const lowerTerms = terms ? terms.toLowerCase() : ''
      return rows.filter(row => row[curCol].toLowerCase().includes(lowerTerms))
    }
  }
}
</script>
