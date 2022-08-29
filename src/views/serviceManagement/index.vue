<template>
  <div>
    <ETable v-if="showTable" :trans-data="transData" @switch="trans($event)" />

    <EView v-if="!showTable" :trans-data="transData" @switch="trans($event)" />
  </div>
</template>

<script>
import ETable from './table'
import EView from './config'
export default {
  components: {
    ETable,
    EView
  },
  props: {
    parentData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      transData: this.parentData,
      showTable: true
    }
  },
  methods: {
    trans(data) {
      this.transData = Object.assign({}, this.parentData, data)
      this.showTable = !this.showTable
    }
  }
}
</script>

