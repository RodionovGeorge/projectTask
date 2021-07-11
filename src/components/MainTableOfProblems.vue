<template>
  <div
    class="column content-background content-shadow q-pa-xs"
  >
    <div
      class="row q-gutter-x-xs"
    >
      <q-input
        v-model="filter"
        color="black"
        placeholder="Search"
        square
        outlined
        style="width:645px"
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
        color="black"
        :options="namesOfSearchColumns"
        options-dense
        style="width:205px"
        v-model="currentColumnForSearch"
        />
    </div>
    <q-table
      class="q-mt-sm"
      wrap-cells
      style="max-width:900px; border-radius: 0"
      flat
      bordered
      :data="data"
      :columns="columns"
      row-key="problemID"
      :visible-columns="visibleColumns"
      :filter="filter"
      :filter-method="filterByCurrentColumn"
      no-data-label="hello"
    />
  </div>
</template>

<script>
export default {
  name: 'MainTableOfProblems',
  data () {
    return {
      filter: '',
      currentColumnForSearch: 'Problem Name',
      visibleColumns: ['problemName', 'discipline', 'problemComplexity', 'problemDeadline'],
      namesOfSearchColumns: ['Problem Name', 'Discipline', 'Complexity'],
      columns: [
        {
          name: 'problemID',
          field: 'id'
        },
        {
          name: 'problemName',
          required: true,
          label: 'Problem Name',
          align: 'center',
          field: 'problemName',
          sortable: true,
          style: 'width:300px'
        },
        {
          name: 'discipline',
          label: 'Discipline',
          field: 'discipline',
          align: 'center',
          sortable: true,
          style: 'width:200px'
        },
        {
          name: 'problemComplexity',
          label: 'Complexity',
          field: 'problemComplexity',
          align: 'center',
          sortable: true,
          style: 'width:200px'
        },
        {
          name: 'problemDeadline',
          label: 'Deadline',
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
          problemComplexity: 'Сложная',
          problemDeadline: '24.04.2200'
        },
        {
          id: 2,
          problemName: 'Название задачи',
          discipline: 'Математический анализ',
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
        case 'Problem Name':
          curCol = this.visibleColumns[0]
          break
        case 'Discipline':
          curCol = this.visibleColumns[1]
          break
        case 'Complexity':
          curCol = this.visibleColumns[2]
          break
      }
      const lowerTerms = terms ? terms.toLowerCase() : ''
      return rows.filter(row => row[curCol].toLowerCase().includes(lowerTerms))
    }
  }
}
</script>
