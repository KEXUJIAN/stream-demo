<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <pre>以下为内容</pre>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>
