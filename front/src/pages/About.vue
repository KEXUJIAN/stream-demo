<template>
  <div class="about">
    <h3>内存使用</h3>
    <button @click="refresh">刷新</button>
    <button @click="stopped">停止</button>
    <br><br>
    <pre>{{ memUsage }}</pre>
  </div>
</template>

<script>
import axios from "axios";

const url = 'http://127.0.0.1:3200/';
let timer;
let started = false;

export default {
  data() {
    return {
      memUsage: "",
    }
  },
  methods: {
    async refresh() {
      started = true;
      try {
        let ret = await axios.get(`${url}mem`);
        this.memUsage = ret.data;
        timer = setTimeout(() => { this.refresh() }, 400);
      } catch (error) {
        console.log('err', error)
      }
    },
    stopped() {
      started = false;
      clearTimeout(timer);
    }
  },
  beforeDestroy() {
    this.stopped();
  }
}
</script>