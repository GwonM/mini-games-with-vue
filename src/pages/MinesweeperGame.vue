<template>
  <div class="mine-ground d-flex justify-center align-center" style="width: 100%; height: 100%">
    <v-card color="#4a752c">
      <div class="d-flex justify-space-between align-center pa-1">
        <div style="width: 100px">
          <v-autocomplete
            v-model="level"
            height="30"
            density="compact"
            hide-details
            variant="outlined"
            :items="levelList"
            item-title="title"
            item-value="value"
          ></v-autocomplete>
        </div>
        <div class="d-flex justify-center align-center" style="font-size: 1.2rem">
          <v-icon>mdi-flag-triangle</v-icon>
          {{ mineCount }}
          <v-icon class="ml-3 mr-1">mdi-timer</v-icon>
          {{ showTime }}
        </div>
        <div>
          <v-btn v-if="gameFailed" @click="reload" color="#4a98fb"> 다시하기 </v-btn>
          <div v-else style="width: 95px"></div>
        </div>
      </div>
      <div class="grid">
        <div class="row d-flex" v-for="(row, rowIndex) in mineGrid" :key="`row-${rowIndex}`">
          <div
            class="col"
            v-for="(col, colIndex) in row"
            :key="`col-${colIndex}`"
            :style="{
              width: `${size[level].blockSize}px`,
              height: `${size[level].blockSize}px`
            }"
          >
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <div
                  style="width: 100%; height: 100%"
                  v-bind="props"
                  :style="{
                    border: isHovering ? '1px solid #444' : ''
                  }"
                  @click="onClick(rowIndex, colIndex)"
                  @contextmenu="onClickFlag($event, rowIndex, colIndex)"
                >
                  <!-- b = 지뢰, f = flag, '' = 열지 않은 경우, col >= 0 :열었을때 주위의 지뢰개수 -->
                  <div
                    v-if="col !== 'b' && col !== 'f' && col !== '' && Number(col) >= 0"
                    style="width: 100%; height: 100%"
                    :style="{
                      backgroundColor: colIndex % 2 === rowIndex % 2 ? '#D7B899' : '#E5C29F'
                    }"
                  >
                    <div
                      v-if="Number(col) > 0"
                      style="width: 100%; height: 100%"
                      class="d-flex justify-center align-center"
                    >
                      {{ col }}
                    </div>
                  </div>
                  <div
                    v-else
                    class="d-flex justify-center align-center"
                    style="width: 100%; height: 100%"
                    :style="{
                      backgroundColor: colIndex % 2 === rowIndex % 2 ? '#AAD751' : '#A2D149'
                    }"
                  >
                    <v-icon v-if="col.includes('f')">mdi-flag-triangle</v-icon>
                    <v-icon v-else-if="col === 'b' && gameFailed">mdi-bomb</v-icon>
                  </div>
                </div>
              </template>
            </v-hover>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script>
import { ref, onMounted, computed, watch } from "vue";

const levelList = [
  { title: "초급", value: "beginner" },
  { title: "중급", value: "intermediate" },
  { title: "상급", value: "advanced" }
];
const size = {
  beginner: { gridRows: 8, gridCols: 10, blockSize: 50, maxMineCount: 10 },
  intermediate: { gridRows: 14, gridCols: 18, blockSize: 45, maxMineCount: 40 },
  advanced: { gridRows: 20, gridCols: 24, blockSize: 35, maxMineCount: 99 }
};

export default {
  data() {
    return {
      levelList,
      size
    };
  },

  setup() {
    const level = ref("intermediate");
    const timer = ref(null);
    const time = ref(0); // 실행 시간 (분)
    const isPlaying = ref(false);
    const gameFailed = ref(false);

    const showTime = computed(() => {
      return time.value.toString().padStart(3, 0);
    });

    const start = () => {
      if (isPlaying.value) return;
      isPlaying.value = true;
      startTimer();

      setTimeout(() => {
        stopTimer();
      }, 50000);
    };

    const reload = () => {
      mineGridInit();
    };

    const startTimer = () => {
      timer.value = setInterval(() => {
        time.value++;
      }, 1000);
    };

    const stopTimer = () => {
      if (timer.value) {
        clearInterval(timer.value);
      }
      timer.value = null;
      time.value = 0;
    };

    watch(level, () => {
      mineGridInit();
    });

    // ========================================================
    const mineCount = ref(40);
    const mineGrid = ref([]);

    const initEvent = () => {
      stopTimer();
      isPlaying.value = false;
      gameFailed.value = false;
      isPlaying.value = false;
    };

    const mineGridInit = () => {
      initEvent();
      mineGrid.value = Array.from({ length: size[level.value].gridRows }, () =>
        Array.from({ length: size[level.value].gridCols }, () => "")
      );

      mineCount.value = size[level.value].maxMineCount;

      for (let mini = 0; mini < mineCount.value; mini++) {
        let flag = true;
        while (flag) {
          const row = Math.floor(Math.random() * size[level.value].gridRows);
          const col = Math.floor(Math.random() * size[level.value].gridCols);
          if (mineGrid.value[row][col] !== "b") {
            mineGrid.value[row][col] = "b";
            flag = false;
          }
        }
      }
    };

    const coordToNum = (row, col) => {
      return row * size[level.value].gridCols + col;
    };

    const onClickFlag = (e, row, col) => {
      e.preventDefault();

      if (mineGrid.value[row][col].includes("f")) {
        if (mineGrid.value[row][col].includes("b")) mineGrid.value[row][col] = "b";
        else mineGrid.value[row][col] = "";
        mineCount.value += 1;
      } else {
        mineGrid.value[row][col] += "f";
        mineCount.value -= 1;
      }

      if (isAllClear()) {
        alert("성공");
      }
    };

    const onClick = (row, col) => {
      if (!isPlaying.value) start();
      if (mineGrid.value[row][col].includes("f")) return;

      if (mineGrid.value[row][col].includes("b")) {
        initEvent();
        gameFailed.value = true;
      } else {
        const visited = Array.from({ length: size[level.value].gridRows * size[level.value].gridCols }, () => false);
        search(row, col, visited);
      }

      if (isAllClear()) {
        alert("성공");
      }
    };

    const safe = (row, col) => {
      const gridRows = size[level.value].gridRows;
      const gridCols = size[level.value].gridCols;
      return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
    };

    const search = (startRow, startCol, visited) => {
      if (visited[coordToNum(startRow, startCol)]) return;

      if (safe(startRow, startCol)) {
        const arroundMineCount = findArroundMine(startRow, startCol);
        visited[coordToNum(startRow, startCol)] = true;

        if (arroundMineCount === 0) {
          mineGrid.value[startRow][startCol] = arroundMineCount.toString();
          if (safe(startRow - 1, startCol)) search(startRow - 1, startCol, visited);
          if (safe(startRow, startCol + 1)) search(startRow, startCol + 1, visited);
          if (safe(startRow + 1, startCol)) search(startRow + 1, startCol, visited);
          if (safe(startRow, startCol - 1)) search(startRow, startCol - 1, visited);
        } else if (arroundMineCount >= 0) {
          mineGrid.value[startRow][startCol] = arroundMineCount.toString();
          return;
        } else {
          return;
        }
      } else {
        return;
      }
    };

    // 주위 3x3 지역의 지뢰 찾기
    const findArroundMine = (row, col) => {
      let count = 0;
      if (safe(row + 1, col - 1) && mineGrid.value[row + 1][col - 1].includes("b")) count++;
      if (safe(row + 1, col) && mineGrid.value[row + 1][col].includes("b")) count++;
      if (safe(row + 1, col + 1) && mineGrid.value[row + 1][col + 1].includes("b")) count++;
      if (safe(row, col - 1) && mineGrid.value[row][col - 1].includes("b")) count++;
      if (safe(row, col + 1) && mineGrid.value[row][col + 1].includes("b")) count++;
      if (safe(row - 1, col - 1) && mineGrid.value[row - 1][col - 1].includes("b")) count++;
      if (safe(row - 1, col) && mineGrid.value[row - 1][col].includes("b")) count++;
      if (safe(row - 1, col + 1) && mineGrid.value[row - 1][col + 1].includes("b")) count++;

      return count;
    };

    const isAllClear = () => {
      const mineArray = [].concat(...mineGrid.value);

      if (size[level.value].maxMineCount === mineArray.filter(q => q === "bf" || q === "fb").length) return true;
      else if (
        size[level.value].gridRows * size[level.value].gridCols - size[level.value].maxMineCount ===
        mineArray.filter(q => isNaN(q)).length
      )
        return true;
      return false;
    };

    onMounted(() => {
      mineGridInit();
    });

    return { mineCount, mineGrid, level, showTime, mineGridInit, onClick, onClickFlag, gameFailed, reload };
  }
};
</script>
<style lang="css" scoped>
.mine-ground {
  transition: 0.5s ease-in-out;
}
</style>
