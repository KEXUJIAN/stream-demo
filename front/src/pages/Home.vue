<template id="home">
  <div>
    <button @click="syncOutput">爆掉内存</button>
    <button @click="waitForBuffer">等待文件准备就绪</button>
    <br><br>
    <button @click="waitForStream">通过流下载</button>
    <button @click="streamTimeout">流超时了</button>
    <br><br>
    <button @click="downlad">边下载边观察</button>
  </div>
</template>

<script>
import axios from "axios";

const url = 'http://127.0.0.1:3200/';

export default {
  methods: {
    syncOutput() {
      axios.get(`${url}download/v0`)
    },
    waitForBuffer() {
      axios.get(`${url}download/v1`)
    },
    waitForStream() {
      axios.get(`${url}download/v2`)
    },
    async streamTimeout() {
      try {
        await axios.get(`${url}download/v3`, { timeout: 2000 });
      } catch (error) {
        console.log('error', error)
      }
    },
    downlad() {
      axios.get(`${url}download/v4`)
    }
  },
}
</script>
