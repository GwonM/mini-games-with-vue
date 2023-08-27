<template lang="">
  <div>
    <v-btn @click="routerMineSweeper">지뢰찾기</v-btn>
  </div>
</template>
<script>
export default {
  setup() {
    // const routerMineSweeper = () => {
    //   // this.$router.push("/minesweeper-game");
    //   console.log(this.$router);
    // };
    // return { routerMineSweeper };
  },

  methods: {
    routerMineSweeper() {
      this.$router.push("/minesweeper-game");
      // console.log(this.$router);
    }
  }
};
</script>
<style lang=""></style>
